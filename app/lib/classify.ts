import { services } from "../data/services";

export type BriefAnswers = {
  idea: string;
  outcome: string;
  audience: string;
  tone: string[];
  format: string;
  materials: string;
  deadline: string;
  email: string;
};

type Decision = "eligible" | "review" | "wiwo" | "unsupported";

const rules = [
  { serviceId: "video-recuerdo", terms: ["matrimonio", "boda", "cumpleaños", "aniversario", "recuerdo", "fotos y videos"] },
  { serviceId: "social-media-automatico", terms: ["social media automático", "social media automatico", "reels de producto", "reels mensuales", "contenido mensual de producto"] },
  { serviceId: "video-corto", terms: ["reel", "video corto", "teaser", "spot", "video generado", "invitación animada"] },
  { serviceId: "tesis-en-orden", terms: ["tesis", "tesina", "marco teórico", "apa", "académic"] },
  { serviceId: "ppt-directorio", terms: ["directorio", "comité", "resultados", "gerencia", "ppt ejecutiva"] },
  { serviceId: "pitch-deck", terms: ["pitch", "inversionista", "levantar inversión", "startup"] },
  { serviceId: "presentacion-academica", terms: ["presentación", "powerpoint", "ppt", "slides", "defensa", "exponer"] },
  { serviceId: "automatizacion-simple", terms: ["automatizar", "automatización", "zapier", "make", "n8n", "formulario a"] },
  { serviceId: "mini-herramienta", terms: ["calculadora", "simulador", "dashboard", "mini app", "herramienta web"] },
  { serviceId: "landing-express", terms: ["landing", "página web", "micrositio", "sitio de una página"] },
  { serviceId: "documento-pro", terms: ["informe", "documento", "whitepaper", "propuesta", "memo", "word"] },
  { serviceId: "diseno-express", terms: ["diseño", "afiche", "invitación", "portada", "infografía", "gráfica"] },
];

const unsupportedTerms = ["asesoría legal", "diagnóstico médico", "inversión garantizada", "hackear", "credenciales", "contraseña"];
const wiwoTerms = ["app completa", "plataforma completa", "ecommerce completo", "filmación presencial", "campaña 360", "implementación enterprise", "integración crítica"];
const reviewTerms = ["100 páginas", "50 slides", "muchos sistemas", "no tengo nada", "para mañana", "urgente hoy"];

const stopWords = new Set(["para", "como", "hasta", "desde", "este", "esta", "unas", "unos", "quiero", "necesito", "hacer", "crear", "dejar", "listo", "lista", "algo", "proyecto"]);

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

function findCatalogMatch(idea: string) {
  const normalizedIdea = normalize(idea);
  const ideaWords = new Set(normalizedIdea.split(" ").filter((word) => word.length >= 4 && !stopWords.has(word)));

  const ranked = services.map((service) => {
    const phrases = [service.title, service.shortTitle, ...service.examples].map(normalize).filter(Boolean);
    const searchable = normalize(`${service.title} ${service.shortTitle} ${service.description} ${service.result} ${service.examples.join(" ")}`);
    let score = 0;

    for (const phrase of phrases) {
      if (phrase.length >= 5 && normalizedIdea.includes(phrase)) score += 12 + Math.min(phrase.length / 8, 4);
    }
    for (const word of ideaWords) {
      if (searchable.includes(word)) score += word.length >= 8 ? 2.5 : 1.5;
    }
    return { service, score };
  }).sort((a, b) => b.score - a.score);

  return ranked[0]?.score >= 3 ? ranked[0].service : null;
}

export function classifyProject(idea: string, requestedServiceId?: string | null) {
  const normalized = idea.toLocaleLowerCase("es");
  const requested = services.find((service) => service.id === requestedServiceId);
  const matchedRule = rules.find((rule) => rule.terms.some((term) => normalized.includes(term)));
  const recommended = requested ?? services.find((service) => service.id === matchedRule?.serviceId) ?? findCatalogMatch(idea);
  let decision: Decision = recommended ? "eligible" : "review";
  let explanation = recommended
    ? `Esto cabe en ${recommended.title}.`
    : "Esto merece una mirada humana antes de ponerle precio.";

  if (unsupportedTerms.some((term) => normalized.includes(term))) {
    decision = "unsupported";
    explanation = "Esto necesita un tipo de ayuda que Chizpa no debería improvisar.";
  } else if (wiwoTerms.some((term) => normalized.includes(term))) {
    decision = "wiwo";
    explanation = "Esto ya es un proyecto más grande. Te conectamos con Wiwo sin hacerte repetir el brief.";
  } else if (reviewTerms.some((term) => normalized.includes(term))) {
    decision = "review";
    explanation = "Primero confirmemos alcance y capacidad. No te cobraremos antes de saber que cabe.";
  }

  return {
    decision,
    recommendedService: recommended,
    confidence: recommended ? (requested ? 0.99 : 0.84) : 0.45,
    explanation,
  };
}

export function calculateChizpaScore(answers: Partial<BriefAnswers>) {
  let score = 20;
  if ((answers.idea?.trim().length ?? 0) >= 25) score += 20;
  if ((answers.outcome?.trim().length ?? 0) >= 3) score += 12;
  if ((answers.audience?.trim().length ?? 0) >= 3) score += 10;
  if ((answers.tone?.length ?? 0) > 0) score += 8;
  if ((answers.format?.trim().length ?? 0) >= 2) score += 10;
  if ((answers.materials?.trim().length ?? 0) >= 3) score += 8;
  if ((answers.deadline?.trim().length ?? 0) >= 3) score += 6;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email ?? "")) score += 6;
  return Math.min(score, 100);
}

export function scoreLabel(score: number) {
  if (score >= 85) return "Prendido";
  if (score >= 65) return "Casi listo";
  return "Falta una chispa";
}
