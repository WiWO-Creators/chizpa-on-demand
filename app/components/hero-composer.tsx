"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Sparkles, Target } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { HydratedTactic, SmartacticsPlan } from "../lib/smartactics";

const heroExamples = ["PPT de directorio", "Editar una tesis", "Video de matrimonio", "Automatizar una tarea"];
const loadingLines = [
  "Leyendo lo que contaste…",
  "Eligiendo la mejor opción…",
  "Armando precio y plazo…",
];

type RecommendOk = { ok: true } & SmartacticsPlan;
type RecommendErr = { ok: false; error: string };

export function HeroComposer() {
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<SmartacticsPlan | null>(null);
  const [loadingLine, setLoadingLine] = useState(loadingLines[0]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const awake = idea.trim().length >= 12;
  const ready = status === "ready" && Boolean(plan?.tactics.length);

  useEffect(() => {
    if (status !== "loading") return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % loadingLines.length;
      setLoadingLine(loadingLines[index]);
    }, 1100);
    return () => window.clearInterval(timer);
  }, [status]);

  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextIdea = idea.trim();
    if (nextIdea.length < 12 || status === "loading") return;
    setStatus("loading");
    setError("");
    setLoadingLine(loadingLines[0]);
    try {
      const response = await fetch("/api/smartactics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: nextIdea }),
      });
      const result = await response.json() as RecommendOk | RecommendErr;
      if (!result.ok || !("tactics" in result) || !result.tactics.length) {
        setPlan(null);
        setError(result.ok ? "No encontré una Chizpa clara. Prueba con más detalle." : result.error);
        setStatus("error");
        return;
      }
      setPlan(result);
      setStatus("ready");
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch {
      setPlan(null);
      setError("Chispita se trabó un segundo. Inténtalo de nuevo.");
      setStatus("error");
    }
  }

  const statusLabel = status === "loading"
    ? "Pensando"
    : ready
      ? "Opciones listas"
      : awake
        ? "Idea detectada"
        : "Escuchando";

  const agentCopy = status === "loading"
    ? loadingLine
    : ready
      ? "Primero la opción que te sirve. Después, extras si los quieres."
      : awake
        ? "Listo. Te muestro opciones y precio."
        : "Cuéntamelo como te salga. Te propongo una solución concreta.";

  return (
    <form
      className={`hero-composer${awake ? " is-awake" : ""}${ready ? " is-smart" : ""}${status === "loading" ? " is-thinking" : ""}`}
      onSubmit={submitIdea}
    >
      <div className="hero-composer__header">
        <div className="hero-composer__agent">
          <span className="hero-composer__avatar" aria-hidden="true">
            <Image src={status === "loading" ? "/brand/chispita-laptop.webp" : "/brand/chispita-point.webp"} alt="" width={118} height={118} unoptimized priority />
          </span>
          <span className="hero-composer__agent-copy">
            <strong>Chispita</strong>
            <small>{agentCopy}</small>
          </span>
        </div>
        <div className="hero-composer__status" id="composer-status" aria-live="polite">
          <i /> {statusLabel}
        </div>
      </div>

      <label className="hero-composer__prompt" htmlFor="project-idea">
        <strong>¿Qué necesitas dejar listo?</strong>
        <span>Te muestro una opción principal y complementos, con precio.</span>
      </label>

      <div className="hero-composer__input-shell">
        <textarea
          id="project-idea"
          aria-describedby="composer-status"
          value={idea}
          onChange={(event) => {
            setIdea(event.target.value);
            if (status === "error") {
              setStatus("idle");
              setError("");
            }
          }}
          placeholder="Ej. Tengo un informe de 30 páginas y necesito convertirlo en una presentación de directorio clara, visual y de máximo 10 slides…"
          rows={5}
          minLength={12}
          maxLength={800}
          required
        />
        <div className="hero-composer__toolbar">
          <span><Sparkles size={14} /> Te orientamos paso a paso</span>
          <button type="submit" disabled={status === "loading" || !awake}>
            {status === "loading" ? <><LoaderCircle size={18} className="spin" /> Buscando</> : ready ? <>Recalcular <ArrowRight size={19} /></> : <>Ver opciones y precio <ArrowRight size={19} /></>}
          </button>
        </div>
      </div>

      {!ready && (
        <div className="hero-examples" aria-label="Ejemplos de proyectos">
          <span>Prueba con:</span>
          {heroExamples.map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => {
                setIdea(example);
                setStatus("idle");
                setPlan(null);
                setError("");
              }}
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {status === "loading" && (
        <div className="smartactics smartactics--loading" aria-live="polite">
          <p className="smartactics__kicker"><Sparkles size={15} /> Capa de IA Chispita</p>
          <div className="smartactics__skeletons">
            <span /><span /><span />
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="smartactics smartactics--error" role="alert">
          <p>{error}</p>
          <Link href={`/start?idea=${encodeURIComponent(idea.trim())}`}>Armar el plan igual <ArrowRight size={16} /></Link>
        </div>
      )}

      {ready && plan && (
        <div className="smartactics" ref={resultsRef} aria-live="polite">
          <div className="smartactics__intro">
            <p className="smartactics__kicker"><Target size={15} /> Tu mejor opción ahora</p>
            <h2>{plan.headline}</h2>
            <p>{plan.read}</p>
          </div>
          <ol className="smartactics__list">
            {plan.tactics.map((tactic, index) => (
              <SmartacticCard key={tactic.serviceId} tactic={tactic} index={index} />
            ))}
          </ol>
          <p className="smartactics__note">La primera es la que resolvería esto ahora. Las otras suman, si te sirven.</p>
        </div>
      )}
    </form>
  );
}

function SmartacticCard({ tactic, index }: { tactic: HydratedTactic; index: number }) {
  const primary = index === 0;
  return (
    <li className={`smartactic${primary ? " smartactic--primary" : ""}`}>
      <div className="smartactic__top">
        <b aria-hidden="true">{primary ? "1" : "+"}</b>
        <div>
          <p className="smartactic__category">{primary ? "Recomendado para esto" : "Complemento opcional"} · {tactic.category}</p>
          <h3>{tactic.serviceTitle}</h3>
          <p className="smartactic__why">{tactic.why}</p>
        </div>
      </div>
      <ul className="smartactic__facts">
        <li><span>Qué recibes</span><strong>{tactic.result}</strong></li>
        <li><span>Plazo</span><strong>{tactic.recurrence ? tactic.recurrence : `Hasta ${tactic.hours} h`}</strong></li>
        <li><span>Precio</span><strong>{tactic.fromPrice ? "Desde " : ""}US${tactic.price}{tactic.recurrence ? "/mes" : ""}</strong></li>
      </ul>
      <div className="smartactic__service">
        <div>
          <small>{primary ? "Parte por aquí" : "Suma si lo necesitas"}</small>
          <strong>{tactic.fromPrice ? "Desde " : ""}US${tactic.price}{tactic.recurrence ? <em>/mes</em> : ""}</strong>
        </div>
        <Link href={tactic.href} aria-label={`Empezar ${tactic.serviceTitle}`}>
          {primary ? "Ver alcance y precio" : "Agregar este"} <ArrowRight size={17} />
        </Link>
      </div>
    </li>
  );
}

