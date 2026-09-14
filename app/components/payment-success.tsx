"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type OrderStatus = { human_code: string; payment_status: string; work_status: string };

export function PaymentSuccess({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [state, setState] = useState<"checking" | "ready" | "error">(sessionId ? "checking" : "error");

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(`/api/order-status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const data = await response.json() as { order?: OrderStatus };
        if (!active) return;
        if (data.order) { setOrder(data.order); setState("ready"); }
        else setState("error");
      } catch { if (active) setState("error"); }
    };
    void check();
    return () => { active = false; };
  }, [sessionId]);

  return <main className="success-page">
    <div className="success-card">
      <div className="success-chispita" />
      {state === "checking" && <><LoaderCircle className="spin" size={42} /><p className="section-kicker">Stripe está confirmando</p><h1>No cierres esta ventana todavía.</h1><p>El pago volvió. Ahora estamos esperando la confirmación segura para encender tu Chizpa.</p></>}
      {state === "ready" && <><CheckCircle2 size={44} /><p className="section-kicker">Pago listo</p><h1>Tu Chizpa está encendida.</h1><p>Pedido <strong>{order?.human_code}</strong>. Chizpita ya convirtió tus respuestas en instrucciones comprensibles.</p><Link className="button button--purple" href={`/track?q=${encodeURIComponent(order?.human_code || sessionId)}`}>Seguir mi proyecto <ArrowRight size={18} /></Link></>}
      {state === "error" && <><p className="section-kicker">Tu brief sigue a salvo</p><h1>No pudimos confirmar el estado.</h1><p>Revisa el email de compra o vuelve a intentarlo con el enlace seguro del pedido.</p><Link className="button button--purple" href="/track">Ir a seguimiento</Link></>}
    </div>
  </main>;
}
