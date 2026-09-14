"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, Download, FileText, MessageSquareText, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getService } from "../data/services";
import type { LiveOrder } from "../lib/stripe-orders";

const demoOrder: LiveOrder = {
  human_code: "CHZ-1042",
  service_id: "ppt-directorio",
  payment_status: "paid",
  brief_status: "accepted",
  work_status: "in_production",
  due_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  session_id: "demo",
  email: "polo@demo.cl",
  idea: "PPT de directorio para el comité de mañana.",
};

const timeline = [
  ["Recibido", "Brief, pago y materiales confirmados."],
  ["Primera versión", "Chispita ordenó el proyecto y ya estamos construyendo."],
  ["Revisión del equipo", "Una persona está afinando contenido, forma y detalle."],
  ["En producción", "Estamos cerrando los archivos listos para usar."],
  ["Entregado", "Una cosa menos en tu lista."],
] as const;

function activeIndex(status: string) {
  return ({ blocked: 0, queued: 0, assigned: 1, in_production: 2, qa: 3, delivered: 4, revision: 3, completed: 4 } as Record<string, number>)[status] ?? 0;
}

function formatDue(date: string | null) {
  if (!date) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" }).format(new Date(date));
}

function formatRemaining(date: string | null, now: number) {
  if (!date || !now) return "Calculando…";
  const seconds = Math.max(0, Math.floor((new Date(date).getTime() - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function isDemoQuery(query: string) {
  return query.trim().toUpperCase() === "CHZ-1042" || query.trim().toLowerCase() === "polo@demo.cl";
}

export function OrderDashboard({ query }: { query: string }) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(Boolean(query.trim()));
  const [lookup, setLookup] = useState(query);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const value = query.trim();
    if (!value) {
      setOrders([]);
      setLoading(false);
      setError("");
      return;
    }
    if (isDemoQuery(value)) {
      setOrders([demoOrder]);
      setLoading(false);
      setError("");
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/order-status?q=${encodeURIComponent(value)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { orders?: LiveOrder[]; order?: LiveOrder; error?: string };
        if (!active) return;
        const found = data.orders?.length ? data.orders : data.order ? [data.order] : [];
        setOrders(found);
        setError(found.length ? "" : data.error || "No encontramos un pedido con esos datos.");
      })
      .catch(() => {
        if (active) {
          setOrders([]);
          setError("No pudimos buscar tu pedido. Inténtalo de nuevo.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function submitLookup(event: FormEvent) {
    event.preventDefault();
    const value = lookup.trim();
    if (!value) return;
    window.location.href = `/track?q=${encodeURIComponent(value)}`;
  }

  const selected = useMemo(() => {
    if (orders.length === 1) return orders[0];
    const code = query.trim().toUpperCase();
    return orders.find((order) => order.human_code === code || order.session_id === query) ?? null;
  }, [orders, query]);

  if (loading) {
    return <main className="tracking-empty"><Sparkles className="spin" size={38} /><p className="section-kicker">Seguimiento</p><h1>Buscando tu Chizpa…</h1></main>;
  }

  if (!selected) {
    return <main className="tracking-empty">
      <Link href="/" className="wizard-back"><ArrowLeft size={18} /> Inicio</Link>
      <div className="tracking-empty__dog" />
      <p className="section-kicker">Mi pedido</p>
      <h1>Entra a tu Chizpa.</h1>
      <p>Usa el mail con el que pagaste o el código del pedido. Te mostramos en qué va.</p>
      <form className="tracking-lookup" onSubmit={submitLookup}>
        <input
          value={lookup}
          onChange={(event) => setLookup(event.target.value)}
          placeholder="mail o CHZ-0000"
          autoComplete="email"
          inputMode="email"
          aria-label="Mail o código de pedido"
        />
        <button type="submit">Ver estado</button>
      </form>
      {error ? <p className="tracking-error">{error}</p> : null}
      {orders.length > 1 ? (
        <div className="tracking-pick">
          {orders.map((order) => {
            const service = getService(order.service_id);
            return <Link key={order.session_id} href={`/track?q=${encodeURIComponent(order.human_code)}`}>
              <span>
                <strong>{order.human_code}</strong>
                <small>{service.title} · {order.payment_status === "paid" ? "Pagado" : "Pago pendiente"}</small>
              </span>
              <em>{timeline[activeIndex(order.work_status)][0]}</em>
            </Link>;
          })}
        </div>
      ) : null}
    </main>;
  }

  const current = activeIndex(selected.work_status);
  const service = getService(selected.service_id);
  const isDemo = selected.human_code === "CHZ-1042";
  const paid = selected.payment_status === "paid";
  return <main className="tracking-page">
    <header className="tracking-header">
      <Link href="/"><ArrowLeft size={18} /> Chizpa.com</Link>
      <span>Pedido {selected.human_code}</span>
      <strong>{paid ? "En menos de 72 h" : "Pago pendiente"}</strong>
    </header>
    <section className="tracking-hero">
      <div>
        <p className="section-kicker">{paid ? "Tu proyecto está encendido" : "Falta confirmar el pago"}</p>
        <h1>{paid ? "El equipo está chizeando." : "Tu pedido está a medio camino."}</h1>
        <p>{paid
          ? <>Primera entrega antes del <strong>{formatDue(selected.due_at)}</strong>. Si necesitamos algo, Chispita te avisa.</>
          : <>Encontramos el pedido <strong>{selected.human_code}</strong>. Cuando Stripe confirme el pago, el equipo lo toma.</>}</p>
      </div>
      <div className="tracking-hero__aside">
        <div className="tracking-hero__chispita"><Image src="/brand/chispita-walk.webp" alt="Chispita avanzando con tu proyecto" fill unoptimized sizes="190px" /></div>
        <div className="tracking-countdown"><Clock3 size={24} /><strong>{paid ? formatRemaining(selected.due_at, now) : "—"}</strong><span>{paid ? "para la entrega estimada" : "esperando pago"}</span></div>
      </div>
    </section>
    <section className="tracking-grid">
      <div className="status-card">
        <div className="status-card__head">
          <div><span>Estado actual</span><h2>{timeline[current][0]}</h2></div>
          <span className="status-live">{paid ? "Actualizado ahora" : "Pago pendiente"}</span>
        </div>
        <ol>{timeline.map(([title, copy], index) => <li key={title} className={index < current ? "is-done" : index === current ? "is-active" : ""}><i>{index < current ? <Check size={14} /> : index + 1}</i><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol>
      </div>
      <aside className="order-side">
        <div className="order-summary">
          <p className="section-kicker">Tu Chizpa</p>
          <h3>{service.title}</h3>
          <ul>{service.includes.slice(0, 3).map((item, index) => <li key={item}>{index === 0 ? <FileText size={16} /> : index === 1 ? <Check size={16} /> : <Download size={16} />} {item}</li>)}</ul>
          <small>{paid ? "Pagado con Stripe" : "Pago pendiente"} · {selected.human_code} · US${service.price}</small>
        </div>
        <div className="message-card">
          <MessageSquareText size={22} />
          <h3>¿Algo cambió?</h3>
          <p>Si afecta el brief o la entrega, escríbenos con tu código. El equipo lo ordena.</p>
          <a className="button" href={`mailto:hola@chizpa.com?subject=${encodeURIComponent(`Pedido ${selected.human_code}`)}`}>Escribir al equipo</a>
        </div>
      </aside>
    </section>
    {isDemo && <div className="demo-banner">Vista demostrativa · Un pedido real se abre con tu mail o código CHZ.</div>}
  </main>;
}
