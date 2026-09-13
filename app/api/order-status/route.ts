import { getRuntimeEnv } from "../../lib/runtime-env";

export async function GET(request: Request) {
  const env = await getRuntimeEnv();
  if (!env.DB) return Response.json({ error: "Order database unavailable" }, { status: 503 });
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId) || sessionId.length > 255) {
    return Response.json({ error: "Invalid session" }, { status: 400 });
  }
  const order = await env.DB.prepare(`SELECT human_code, service_id, payment_status, brief_status,
    work_status, due_at, created_at FROM orders WHERE stripe_session_id = ?`).bind(sessionId).first();
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
