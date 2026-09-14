import { findOrders } from "../../lib/stripe-orders";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") || params.get("email") || params.get("code") || params.get("session_id") || "").trim();
  if (!query || query.length > 320) {
    return Response.json({ error: "Escribe tu mail o el código del pedido." }, { status: 400 });
  }

  try {
    const orders = await findOrders(query);
    if (!orders.length) return Response.json({ orders: [], error: "No encontramos un pedido con esos datos." }, { status: 404 });
    return Response.json({ order: orders[0], orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error && error.message === "stripe_not_configured"
      ? "Stripe todavía no está configurado."
      : "No pudimos buscar tu pedido.";
    return Response.json({ error: message }, { status: 503 });
  }
}
