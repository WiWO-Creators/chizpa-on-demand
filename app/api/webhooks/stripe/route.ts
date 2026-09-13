import { getRuntimeEnv } from "../../../lib/runtime-env";

type RuntimeSecrets = { STRIPE_WEBHOOK_SECRET?: string };
type StripeObject = {
  id?: string;
  client_reference_id?: string | null;
  metadata?: Record<string, string>;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string;
  payment_intent?: string | null;
};
type StripeEvent = { id: string; type: string; data: { object: StripeObject } };

function hexToBytes(hex: string) {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

async function verifySignature(body: string, signatureHeader: string, secret: string) {
  const pieces = signatureHeader.split(",").map((piece) => piece.trim().split("="));
  const timestamp = pieces.find(([key]) => key === "t")?.[1];
  const signatures = pieces.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`)));
  return signatures.some((signature) => {
    const candidate = hexToBytes(signature);
    return candidate ? timingSafeEqual(digest, candidate) : false;
  });
}

export async function POST(request: Request) {
  const runtimeEnv = await getRuntimeEnv<RuntimeSecrets>();
  if (!runtimeEnv.STRIPE_WEBHOOK_SECRET || !runtimeEnv.DB) return Response.json({ error: "Webhook unavailable" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !(await verifySignature(body, signature, runtimeEnv.STRIPE_WEBHOOK_SECRET))) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try { event = JSON.parse(body) as StripeEvent; }
  catch { return Response.json({ error: "Invalid payload" }, { status: 400 }); }
  if (!event.id || !event.type || !event.data?.object) return Response.json({ error: "Invalid event" }, { status: 400 });

  const existing = await runtimeEnv.DB.prepare("SELECT id FROM stripe_events WHERE id = ?").bind(event.id).first();
  if (existing) return Response.json({ received: true, duplicate: true });

  const object = event.data.object;
  const orderId = object.metadata?.order_id || object.client_reference_id;
  if (!orderId) {
    await runtimeEnv.DB.prepare("INSERT INTO stripe_events (id, event_type, object_id) VALUES (?, ?, ?)").bind(event.id, event.type, object.id ?? null).run();
    return Response.json({ received: true, ignored: true });
  }

  const order = await runtimeEnv.DB.prepare("SELECT id, amount_cents, currency, payment_status FROM orders WHERE id = ?").bind(orderId).first<{ id: string; amount_cents: number; currency: string; payment_status: string }>();
  if (!order) return Response.json({ error: "Unknown order" }, { status: 404 });
  if (object.amount_total != null && object.amount_total !== order.amount_cents) return Response.json({ error: "Amount mismatch" }, { status: 400 });
  if (object.currency && object.currency.toLowerCase() !== order.currency.toLowerCase()) return Response.json({ error: "Currency mismatch" }, { status: 400 });

  const eventId = crypto.randomUUID();
  const outboxId = crypto.randomUUID();
  const statements = [
    runtimeEnv.DB.prepare("INSERT INTO stripe_events (id, event_type, object_id) VALUES (?, ?, ?)").bind(event.id, event.type, object.id ?? null),
  ];

  if ((event.type === "checkout.session.completed" && object.payment_status === "paid") || event.type === "checkout.session.async_payment_succeeded") {
    statements.push(
      runtimeEnv.DB.prepare("UPDATE orders SET payment_status = 'paid', stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_status != 'paid'").bind(object.payment_intent ?? null, orderId),
      runtimeEnv.DB.prepare("INSERT INTO order_events (id, order_id, type, message) VALUES (?, ?, 'payment_confirmed', ?)").bind(eventId, orderId, "Pago confirmado. El brief pasa a revisión humana."),
      runtimeEnv.DB.prepare("INSERT INTO outbox_events (id, order_id, type, payload_json) VALUES (?, ?, 'order.paid', ?)").bind(outboxId, orderId, JSON.stringify({ orderId, stripeEventId: event.id })),
    );
  } else if (event.type === "checkout.session.async_payment_failed") {
    statements.push(runtimeEnv.DB.prepare("UPDATE orders SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_status != 'paid'").bind(orderId));
  } else if (event.type === "checkout.session.expired") {
    statements.push(runtimeEnv.DB.prepare("UPDATE orders SET payment_status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_status IN ('unpaid','pending')").bind(orderId));
  }

  try { await runtimeEnv.DB.batch(statements); }
  catch (error) {
    const duplicate = error instanceof Error && error.message.toLowerCase().includes("unique");
    if (duplicate) return Response.json({ received: true, duplicate: true });
    throw error;
  }
  return Response.json({ received: true });
}
