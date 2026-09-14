import { env } from "../../lib/runtime-env";

function stripeKey() {
  const key = env("STRIPE_SECRET_KEY");
  if (key?.startsWith("sk_") || key?.startsWith("rk_")) return key;
  return undefined;
}

export async function GET(request: Request) {
  const key = stripeKey();
  if (!key) return Response.json({ error: "Stripe todavía no está configurado." }, { status: 503 });

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId.startsWith("cs_") || sessionId.length > 255) {
    return Response.json({ error: "Invalid session" }, { status: 400 });
  }

  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const session = await stripeResponse.json() as {
    payment_status?: string;
    status?: string;
    created?: number;
    metadata?: Record<string, string>;
    error?: { message?: string };
  };
  if (!stripeResponse.ok) {
    return Response.json({ error: session.error?.message ?? "Order not found" }, { status: 404 });
  }

  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) return Response.json({ error: "Order not found" }, { status: 404 });

  const meta = session.metadata ?? {};
  const created = session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString();
  return Response.json({
    order: {
      human_code: meta.human_code || `CHZ-${sessionId.slice(-6).toUpperCase()}`,
      service_id: meta.service_id || "ppt-directorio",
      payment_status: "paid",
      brief_status: "accepted",
      work_status: "queued",
      due_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      created_at: created,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
