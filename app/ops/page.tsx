import Link from "next/link";
import { CheckCircle2, Clock3, FileText, Search, Sparkles, UserRound } from "lucide-react";
import { getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

type OpsOrder = { human_code: string; service_id: string; work_status: string; payment_status: string; chizpa_score: number; customer_email: string; due_at: string | null; created_at: string };

const demos: OpsOrder[] = [
  { human_code:"CHZ-1042", service_id:"ppt-directorio", work_status:"in_production", payment_status:"paid", chizpa_score:92, customer_email:"polo@demo.cl", due_at:"2026-08-18 15:00", created_at:"2026-08-15 17:22" },
  { human_code:"CHZ-1041", service_id:"video-recuerdo", work_status:"qa", payment_status:"paid", chizpa_score:88, customer_email:"cliente@demo.cl", due_at:"2026-08-17 21:30", created_at:"2026-08-14 21:30" },
  { human_code:"CHZ-1040", service_id:"automatizacion-simple", work_status:"queued", payment_status:"paid", chizpa_score:76, customer_email:"equipo@demo.cl", due_at:null, created_at:"2026-08-15 16:10" },
  { human_code:"CHZ-1039", service_id:"tesis-en-orden", work_status:"blocked", payment_status:"paid", chizpa_score:61, customer_email:"estudiante@demo.cl", due_at:null, created_at:"2026-08-15 13:45" },
];

function statusLabel(status: string) {
  return ({ blocked:"Falta información", queued:"Por asignar", assigned:"Asignado", in_production:"En producción", qa:"Control de calidad", delivered:"Listo para cliente" } as Record<string,string>)[status] ?? status;
}

export default async function OpsPage() {
  const user = await getChatGPTUser();
  const displayName = user?.displayName ?? "Equipo Wiwo";
  const email = user?.email ?? "ops@chizpa.com";
  const orders = demos;

  return <main className="ops-shell">
    <aside className="ops-sidebar"><Link className="wordmark wordmark--compact" href="/">chizpa<span>.com</span><i aria-hidden="true"><b /><b /><b /></i></Link><nav><Link className="is-active" href="/ops"><Sparkles size={18} /> Cola</Link><a href="#capacidad"><Clock3 size={18} /> Capacidad</a><a href="#equipo"><UserRound size={18} /> Equipo</a></nav><div><span>{displayName}</span><small>{email}</small></div></aside>
    <section className="ops-main">
      <header className="ops-top"><div><p>Operaciones Wiwo</p><h1>Lo que estamos chizeando.</h1></div><label><Search size={18} /><input placeholder="Buscar pedido" /></label></header>
      <div className="ops-metrics"><article><span>En cola</span><strong>{orders.filter((order) => order.work_status === "queued").length}</strong><small>requieren asignación</small></article><article><span>En producción</span><strong>{orders.filter((order) => order.work_status === "in_production").length}</strong><small>trabajando ahora</small></article><article><span>En QA</span><strong>{orders.filter((order) => order.work_status === "qa").length}</strong><small>control humano</small></article><article className="ops-metric--orange"><span>SLA</span><strong>96%</strong><small>entregas a tiempo</small></article></div>
      <div className="ops-table-wrap"><div className="ops-table-head"><div><h2>Pedidos activos</h2><span>Datos demostrativos</span></div><button>+ Nueva Chizpa manual</button></div><div className="ops-table">
        {orders.map((order) => <article key={order.human_code}><div className="ops-order-id"><FileText size={18} /><div><strong>{order.human_code}</strong><span>{order.service_id.replaceAll("-"," ")}</span></div></div><div><span>Cliente</span><strong>{order.customer_email}</strong></div><div><span>Score</span><strong className="ops-score">{order.chizpa_score}</strong></div><div><span>Entrega</span><strong>{order.due_at ?? "Al aceptar brief"}</strong></div><div><span>Estado</span><strong className={`ops-status ops-status--${order.work_status}`}>{statusLabel(order.work_status)}</strong></div><button aria-label={`Abrir ${order.human_code}`}>Abrir</button></article>)}
      </div></div>
      <section className="ops-capacity" id="capacidad"><div><p className="section-kicker">Guardrail de 72 horas</p><h2>Chispita recomienda. El equipo decide y compromete.</h2><p>Un pedido solo entra a producción cuando pago, brief aceptado y capacidad están confirmados. No vendemos urgencias falsas.</p></div><div><CheckCircle2 size={30} /><strong>8 Chizpas</strong><span>capacidad disponible hoy</span></div></section>
    </section>
  </main>;
}
