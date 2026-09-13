import { OrderDashboard } from "../components/order-dashboard";

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ demo?: string; session_id?: string }> }) {
  const params = await searchParams;
  return <OrderDashboard demoCode={params.demo ?? null} sessionId={params.session_id ?? null} />;
}
