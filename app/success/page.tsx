import { PaymentSuccess } from "../components/payment-success";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const params = await searchParams;
  return <PaymentSuccess sessionId={params.session_id ?? ""} />;
}
