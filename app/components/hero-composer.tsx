"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, LoaderCircle, Repeat2, Sparkles, Target } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { HydratedTactic, SmartacticsPlan } from "../lib/smartactics";

const heroExamples = ["PPT de directorio", "Editar una tesis", "Video de matrimonio", "Automatizar una tarea"];
const loadingLines = [
  "Leyendo lo que contaste…",
  "Armando SMARTactics…",
  "Eligiendo Chizpas para pagar y partir…",
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
      setError("Chizpita se trabó un segundo. Inténtalo de nuevo.");
      setStatus("error");
    }
  }

  const statusLabel = status === "loading"
    ? "Pensando"
    : ready
      ? "SMARTactics listas"
      : awake
        ? "Idea detectada"
        : "Escuchando";

  const agentCopy = status === "loading"
    ? loadingLine
    : ready
      ? "Elige una Chizpa. El click te lleva a pagar."
      : awake
        ? "Perfecto. Ya puedo armarte SMARTactics."
        : "Cuéntamelo como te salga. Yo lo convierto en Chizpas para pagar.";

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
            <strong>Chizpita</strong>
            <small>{agentCopy}</small>
          </span>
        </div>
        <div className="hero-composer__status" id="composer-status" aria-live="polite">
          <i /> {statusLabel}
        </div>
      </div>

      <label className="hero-composer__prompt" htmlFor="project-idea">
        <strong>¿Qué proyecto quieres dejar listo?</strong>
        <span>SMARTactics con Chizpas concretas. Nada de consejos sueltos.</span>
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
            {status === "loading" ? <><LoaderCircle size={18} className="spin" /> Armando</> : ready ? <>Recalcular <ArrowRight size={19} /></> : <>Dame SMARTactics <ArrowRight size={19} /></>}
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
          <p className="smartactics__kicker"><Sparkles size={15} /> Capa de IA Chizpita</p>
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
            <p className="smartactics__kicker"><Target size={15} /> SMARTactics</p>
            <h2>{plan.headline}</h2>
            <p>{plan.read}</p>
          </div>
          <ol className="smartactics__list">
            {plan.tactics.map((tactic, index) => (
              <SmartacticCard key={tactic.serviceId} tactic={tactic} index={index} />
            ))}
          </ol>
          <p className="smartactics__note">Cada acción es una Chizpa de nuestro catálogo. El click abre el brief y el pago.</p>
        </div>
      )}
    </form>
  );
}

function SmartacticCard({ tactic, index }: { tactic: HydratedTactic; index: number }) {
  const chips = [
    { letter: "S", label: "Específico", value: tactic.title },
    { letter: "M", label: "Medible", value: tactic.result },
    { letter: "A", label: "Alcanzable", value: `${tactic.fromPrice ? "Desde " : ""}US$${tactic.price}${tactic.recurrence ? "/mes" : ""}` },
    { letter: "R", label: "Relevante", value: tactic.why },
    { letter: "T", label: "En tiempo", value: tactic.recurrence ? tactic.recurrence : `Hasta ${tactic.hours} h` },
  ];

  return (
    <li className={`smartactic${index === 0 ? " smartactic--primary" : ""}`}>
      <div className="smartactic__top">
        <b aria-hidden="true">{index + 1}</b>
        <div>
          <p className="smartactic__category">{tactic.category}{tactic.recurrence ? ` · ${tactic.recurrence}` : ""}</p>
          <h3>{tactic.title}</h3>
          <p className="smartactic__why">{tactic.why}</p>
        </div>
      </div>
      <ul className="smartactic__smart" aria-label="SMART">
        {chips.map((chip) => (
          <li key={chip.letter} title={`${chip.label}: ${chip.value}`}>
            <strong>{chip.letter}</strong>
            <span>{chip.value}</span>
          </li>
        ))}
      </ul>
      <div className="smartactic__service">
        <div>
          <small>{tactic.serviceTitle}</small>
          <strong>{tactic.fromPrice ? "Desde " : ""}US${tactic.price}{tactic.recurrence ? <em>/mes</em> : ""}</strong>
          <span>{tactic.recurrence ? <><Repeat2 size={13} /> {tactic.recurrence}</> : <><Clock3 size={13} /> hasta {tactic.hours} h</>}</span>
        </div>
        <Link href={tactic.href} aria-label={`Empezar ${tactic.serviceTitle}`}>
          {index === 0 ? "Empezar y pagar" : "Elegir esta"} <ArrowRight size={17} />
        </Link>
      </div>
    </li>
  );
}
