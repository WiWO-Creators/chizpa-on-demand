import { catalogIdSet, compactCatalog, fallbackPlan, hydrateTactics, type RawTactic, type SmartacticsPlan } from "../../lib/smartactics";
import { getRuntimeEnv } from "../../lib/runtime-env";

type RuntimeSecrets = { XAI_API_KEY?: string };
type RecommendOk = { ok: true } & SmartacticsPlan;
type RecommendErr = { ok: false; error: string };

const cache = new Map<string, RecommendOk>();
const CACHE_LIMIT = 40;

const tacticSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    read: { type: "string" },
    tactics: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          why: { type: "string" },
          serviceId: { type: "string" },
        },
        required: ["title", "why", "serviceId"],
      },
    },
  },
  required: ["headline", "read", "tactics"],
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { idea?: unknown } | null;
  const idea = typeof body?.idea === "string" ? body.idea.trim().slice(0, 800) : "";
  if (idea.length < 12) {
    return Response.json({ ok: false, error: "Cuéntame el proyecto en una frase. Con eso armo SMARTactics." } satisfies RecommendErr, { status: 400 });
  }

  const cacheKey = idea.toLocaleLowerCase("es").replace(/\s+/g, " ");
  const cached = cache.get(cacheKey);
  if (cached) return Response.json(cached);

  const runtimeEnv = await getRuntimeEnv<RuntimeSecrets>().catch(() => ({}) as RuntimeSecrets);
  const apiKey = runtimeEnv.XAI_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) return Response.json(remember(cacheKey, { ok: true, ...fallbackPlan(idea) }));

  try {
    const grokPlan = await askGrok(apiKey, idea);
    if (grokPlan) return Response.json(remember(cacheKey, grokPlan));
  } catch {
    // Catalog fallback — never invent services off-catalog.
  }

  return Response.json(remember(cacheKey, { ok: true, ...fallbackPlan(idea) }));
}

function remember(key: string, value: RecommendOk): RecommendOk {
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return value;
}

async function askGrok(apiKey: string, idea: string): Promise<RecommendOk | null> {
  const ids = catalogIdSet();
  const payload = {
    model: "grok-4.5",
    temperature: 0.35,
    max_tokens: 900,
    reasoning_effort: "low",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "smartactics",
        strict: true,
        schema: tacticSchema,
      },
    },
    messages: [
      {
        role: "system",
        content: [
          "Eres Chispita, la capa de IA de Chizpa.com.",
          "La gente cuenta un proyecto. Tú respondes SOLO con SMARTactics: acciones concretas que se compran en Chizpa.",
          "Cada táctica DEBE mapear a un serviceId del catálogo. Prohibido recomendar DIY, herramientas ajenas, Wiwo, consultoría suelta o cualquier cosa que no se pague acá.",
          "SMART = Specific (la Chizpa), Measurable (el result del catálogo), Achievable (precio y plazo del catálogo), Relevant (por qué le sirve A ESTE proyecto), Time-bound (24/48/72h o ciclo mensual).",
          "Devuelve 2 o 3 tácticas. La primera es la que deberían pagar ahora. Las otras son complementos pagados, no alternativas baratas de relleno.",
          "Español de Chile, corto, directo, sin emojis, sin markdown.",
          "headline: una frase de cierre comercial. read: máximo 2 oraciones diagnosticando el proyecto.",
          "title: la acción concreta. why: por qué ESA Chizpa para ESTE proyecto.",
          "Nunca inventes un serviceId. Usa exactamente un id de esta lista:",
          compactCatalog(),
        ].join("\n"),
      },
      { role: "user", content: `Proyecto:\n${idea}` },
    ],
  };

  let response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(40000),
  });

  if (response.status === 400) {
    const retry = { ...payload } as Record<string, unknown>;
    delete retry.reasoning_effort;
    response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(retry),
      signal: AbortSignal.timeout(40000),
    });
  }

  if (!response.ok) return null;

  const grokBody = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const parsed = parsePlan(grokBody.choices?.[0]?.message?.content ?? "", ids);
  if (!parsed) return null;

  const tactics = hydrateTactics(idea, parsed.tactics);
  if (!tactics.length) return null;

  const filled = tactics.length >= 2 ? tactics : [...tactics, ...fallbackPlan(idea).tactics]
    .filter((tactic, index, list) => list.findIndex((item) => item.serviceId === tactic.serviceId) === index)
    .slice(0, 3);

  return {
    ok: true,
    source: "grok",
    headline: parsed.headline.slice(0, 140),
    read: parsed.read.slice(0, 280),
    tactics: filled,
  };
}

function parsePlan(content: string, ids: Set<string>): { headline: string; read: string; tactics: RawTactic[] } | null {
  const jsonText = content.match(/\{[\s\S]*\}/)?.[0] ?? "";
  if (!jsonText) return null;
  try {
    const value = JSON.parse(jsonText) as { headline?: unknown; read?: unknown; tactics?: unknown };
    if (typeof value.headline !== "string" || typeof value.read !== "string" || !Array.isArray(value.tactics)) return null;
    const tactics = value.tactics.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const tactic = item as { title?: unknown; why?: unknown; serviceId?: unknown };
      if (typeof tactic.title !== "string" || typeof tactic.why !== "string" || typeof tactic.serviceId !== "string") return [];
      if (!ids.has(tactic.serviceId)) return [];
      return [{ title: tactic.title, why: tactic.why, serviceId: tactic.serviceId }];
    });
    if (!tactics.length) return null;
    return { headline: value.headline, read: value.read, tactics };
  } catch {
    return null;
  }
}
