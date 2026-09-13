"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, Download, FileText, MessageSquareText, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getService } from "../data/services";

type LiveOrder = { human_code: string; service_id: string; payment_status: string; brief_status: string; work_status: string; due_at: string | null; created_at: string };
const demoOrder: LiveOrder = { human_code: "CHZ-1042", service_id: "ppt-directorio", payment_status: "paid", brief_status: "accepted", work_status: "in_production", due_at: "2026-08-18T15:00:00Z", created_at: "2026-08-15T17:22:00Z" };
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
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(date));
}

function formatRemaining(date: string | null, now: number) {
  if (!date || !now) return "Calculando…";
  const seconds = Math.max(0, Math.floor((new Date(date).getTime() - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function OrderDashboard({ demoCode, sessionId }: { demoCode: string | null; sessionId: string | null }) {
  const [order, setOrder] = useState<LiveOrder | null>(demoCode ? demoOrder : null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [code, setCode] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/order-status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { order?: LiveOrder }) => setOrder(data.order ?? null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function submitCode(event: FormEvent) {
    event.preventDefault();
    if (code.trim().toUpperCase() === "CHZ-1042") window.location.href = "/track?demo=CHZ-1042";
  }

  if (loading) return <main className="tracking-empty"><Sparkles className="spin" size={38} /><h1>Buscando tu Chizpa…</h1></main>;
  if (!order) return <main className="tracking-empty"><Link href="/" className="wizard-back"><ArrowLeft size={18} /> Inicio</Link><div className="tracking-empty__dog" /><p className="section-kicker">Seguimiento</p><h1>¿Qué está chizeando el equipo?</h1><p>Usa el enlace seguro que llegó a tu email. Para explorar el prototipo, escribe <strong>CHZ-1042</strong>.</p><form onSubmit={submitCode}><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="CHZ-0000" /><button>Ver pedido</button></form></main>;

  const current = activeIndex(order.work_status);
  const service = getService(order.service_id);
  return <main className="tracking-page">
    <header className="tracking-header"><Link href="/"><ArrowLeft size={18} /> Chizpa.com</Link><span>Pedido {order.human_code}</span><strong>En menos de 72 h</strong></header>
    <section className="tracking-hero"><div><p className="section-kicker">Tu proyecto está encendido</p><h1>El equipo está chizeando.</h1><p>Primera entrega antes del <strong>{formatDue(order.due_at)}</strong>. Si necesitamos algo, Chispita te avisa.</p></div><div className="tracking-hero__aside"><div className="tracking-hero__chispita"><Image src="/brand/chispita-walk.webp" alt="Chispita avanzando con tu proyecto" fill unoptimized sizes="190px" /></div><div className="tracking-countdown"><Clock3 size={24} /><strong>{formatRemaining(order.due_at, now)}</strong><span>para la entrega estimada</span></div></div></section>
    <section className="tracking-grid">
      <div className="status-card"><div className="status-card__head"><div><span>Estado actual</span><h2>{timeline[current][0]}</h2></div><span className="status-live">Actualizado ahora</span></div><ol>{timeline.map(([title, copy], index) => <li key={title} className={index < current ? "is-done" : index === current ? "is-active" : ""}><i>{index < current ? <Check size={14} /> : index + 1}</i><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol></div>
      <aside className="order-side">
        <div className="order-summary"><p className="section-kicker">Tu Chizpa</p><h3>{service.title}</h3><ul>{service.includes.slice(0, 3).map((item, index) => <li key={item}>{index === 0 ? <FileText size={16} /> : index === 1 ? <Check size={16} /> : <Download size={16} />} {item}</li>)}</ul><small>Pagado con Stripe · US${service.price}</small></div>
        <div className="message-card"><MessageSquareText size={22} /><h3>¿Algo cambió?</h3><p>Si afecta el brief o la entrega, avísanos aquí. Chispita se encarga de ordenarlo.</p><button>Escribir al equipo</button></div>
      </aside>
    </section>
    {demoCode && <div className="demo-banner">Vista demostrativa · Los pedidos reales usan acceso seguro por email.</div>}
  </main>;
}
