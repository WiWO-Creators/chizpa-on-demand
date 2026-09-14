import { OrderDashboard } from "../components/order-dashboard";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; session_id?: string; code?: string; email?: string; q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? params.email ?? params.code ?? params.session_id ?? params.demo ?? "";
  return <OrderDashboard query={query} />;
}
