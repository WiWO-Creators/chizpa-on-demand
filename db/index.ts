export function getDb(): never {
  throw new Error("La base de pedidos no está conectada en Vercel. El checkout usa Stripe como fuente de verdad.");
}
