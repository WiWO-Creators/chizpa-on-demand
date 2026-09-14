import { env } from "../../../lib/runtime-env";

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
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) return Response.json({ error: "Webhook unavailable" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !(await verifySignature(body, signature, secret))) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try { event = JSON.parse(body) as StripeEvent; }
  catch { return Response.json({ error: "Invalid payload" }, { status: 400 }); }
  if (!event.id || !event.type || !event.data?.object) return Response.json({ error: "Invalid event" }, { status: 400 });

  return Response.json({ received: true });
}
