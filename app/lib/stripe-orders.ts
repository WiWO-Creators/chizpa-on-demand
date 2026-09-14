import { env } from "./runtime-env";

export type LiveOrder = {
  human_code: string;
  service_id: string;
  payment_status: string;
  brief_status: string;
  work_status: string;
  due_at: string | null;
  created_at: string;
  session_id: string;
  email: string;
  idea: string;
};

type StripeSession = {
  id: string;
  payment_status?: string;
  status?: string;
  created?: number;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
};

export function stripeKey() {
  const key = env("STRIPE_SECRET_KEY");
  if (key?.startsWith("sk_") || key?.startsWith("rk_")) return key;
  return undefined;
}

export function parseLookup(raw: string) {
  const value = raw.trim();
  if (!value) return { kind: "empty" as const };
  if (value.startsWith("cs_") && value.length < 256) return { kind: "session" as const, value };
  if (/^chz[-_\s]?\w{3,12}$/i.test(value)) {
    return { kind: "code" as const, value: value.replace(/[\s_]/g, "-").toUpperCase().replace(/^CHZ-?/, "CHZ-") };
  }
  if (value.includes("@") && value.length <= 320) return { kind: "email" as const, value: value.toLowerCase() };
  if (/^[a-z0-9-]{4,40}$/i.test(value)) return { kind: "code" as const, value: value.toUpperCase().startsWith("CHZ-") ? value.toUpperCase() : `CHZ-${value.toUpperCase()}` };
  return { kind: "unknown" as const, value };
}

function sessionEmail(session: StripeSession) {
  return (session.customer_details?.email || session.customer_email || session.metadata?.email || "").trim().toLowerCase();
}

function isPaid(session: StripeSession) {
  return session.payment_status === "paid" || session.status === "complete";
}

function workStatus(session: StripeSession) {
  if (!isPaid(session)) return "blocked";
  const hours = (Date.now() - (session.created ?? 0) * 1000) / 3_600_000;
  if (hours < 2) return "queued";
  if (hours < 18) return "assigned";
  if (hours < 48) return "in_production";
  return "qa";
}

export function toOrder(session: StripeSession): LiveOrder {
  const meta = session.metadata ?? {};
  const createdMs = (session.created ?? Math.floor(Date.now() / 1000)) * 1000;
  return {
    human_code: (meta.human_code || `CHZ-${session.id.slice(-6)}`).toUpperCase(),
    service_id: meta.service_id || "ppt-directorio",
    payment_status: isPaid(session) ? "paid" : "pending",
    brief_status: isPaid(session) ? "accepted" : "submitted",
    work_status: workStatus(session),
    due_at: new Date(createdMs + 72 * 3_600_000).toISOString(),
    created_at: new Date(createdMs).toISOString(),
    session_id: session.id,
    email: sessionEmail(session),
    idea: meta.idea || "",
  };
}

function matches(session: StripeSession, lookup: ReturnType<typeof parseLookup>) {
  if (lookup.kind === "session") return session.id === lookup.value;
  if (lookup.kind === "code") return (session.metadata?.human_code || "").toUpperCase() === lookup.value;
  if (lookup.kind === "email") return sessionEmail(session) === lookup.value;
  return false;
}

async function stripeGet<T>(key: string, path: string): Promise<T | null> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return await response.json() as T;
}

async function searchSessions(key: string, query: string) {
  const payload = await stripeGet<{ data?: StripeSession[] }>(key, `checkout/sessions/search?${new URLSearchParams({ query, limit: "20" })}`);
  return payload?.data ?? null;
}

async function listSessions(key: string) {
  const sessions: StripeSession[] = [];
  let startingAfter = "";
  for (let page = 0; page < 5; page += 1) {
    const params = new URLSearchParams({ limit: "100" });
    if (startingAfter) params.set("starting_after", startingAfter);
    const payload = await stripeGet<{ data?: StripeSession[]; has_more?: boolean }>(key, `checkout/sessions?${params}`);
    if (!payload?.data) return sessions.length ? sessions : null;
    sessions.push(...payload.data);
    if (!payload.has_more || !payload.data.length) break;
    startingAfter = payload.data[payload.data.length - 1]?.id ?? "";
  }
  return sessions;
}

export async function findOrders(raw: string): Promise<LiveOrder[]> {
  const key = stripeKey();
  if (!key) throw new Error("stripe_not_configured");
  const lookup = parseLookup(raw);
  if (lookup.kind === "empty" || lookup.kind === "unknown") return [];

  if (lookup.kind === "session") {
    const session = await stripeGet<StripeSession>(key, `checkout/sessions/${encodeURIComponent(lookup.value)}`);
    return session?.id ? [toOrder(session)] : [];
  }

  const query = lookup.kind === "email"
    ? `metadata["email"]:"${lookup.value}"`
    : `metadata["human_code"]:"${lookup.value}"`;
  const searched = await searchSessions(key, query);
  if (searched?.length) {
    const extra = lookup.kind === "email"
      ? await searchSessions(key, `customer_details.email:"${lookup.value}"`)
      : [];
    const merged = [...searched, ...(extra ?? [])];
    const unique = merged.filter((session, index) => merged.findIndex((item) => item.id === session.id) === index);
    return unique.filter((session) => matches(session, lookup)).map(toOrder);
  }

  const listed = await listSessions(key);
  if (!listed) return [];
  return listed.filter((session) => matches(session, lookup)).map(toOrder);
}
