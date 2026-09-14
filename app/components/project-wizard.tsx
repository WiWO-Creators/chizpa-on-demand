"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, CreditCard,
  Lightbulb, LoaderCircle, LockKeyhole, PencilLine, Repeat2, Sparkles, Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateChizpaScore, classifyProject, type BriefAnswers } from "../lib/classify";
import type { ServiceCategory } from "../data/services";
import { ProjectFilesDropzone } from "./project-files-dropzone";

const emptyBrief: BriefAnswers = { idea: "", outcome: "", audience: "", tone: [], format: "", materials: "", deadline: "", email: "" };
const tones = ["Directo", "Premium", "Cercano", "Emotivo", "Irreverente", "Tecnológico"];
const outcomes = ["Presentar", "Explicar", "Convencer", "Recordar", "Celebrar", "Ahorrar tiempo"];
const steps = ["Proyecto", "Materiales", "Resultado", "Confirmar"];
const pricedFromIds = new Set(["landing-express", "automatizacion-simple", "mini-herramienta"]);
const wizardCharacters = ["/brand/chispita-point.webp", "/brand/chispita-laptop.webp", "/brand/chispita-cool.webp", "/brand/chispita-walk.webp"];

const formatChoices: Record<ServiceCategory | "default", string[]> = {
  Presentaciones: ["PPTX editable", "Google Slides", "PPTX + PDF", "Que Chispita recomiende"],
  Videos: ["Video vertical", "Video horizontal", "Ambos formatos", "Que Chispita recomiende"],
  Documentos: ["DOCX editable", "PDF", "DOCX + PDF", "Que Chispita recomiende"],
  Diseño: ["PNG / JPG", "PDF para imprimir", "Archivo editable", "Que Chispita recomiende"],
  Herramientas: ["Link web", "Flujo conectado", "Link + guía de uso", "Que Chispita recomiende"],
  default: ["Editable", "PDF", "Link web", "Que Chispita recomiende"],
};

export function ProjectWizard({ initialServiceId, initialIdea }: { initialServiceId: string | null; initialIdea: string }) {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<BriefAnswers>({ ...emptyBrief, idea: initialIdea });
  const [files, setFiles] = useState<File[]>([]);
  const [noMaterials, setNoMaterials] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [advanceError, setAdvanceError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "needs-config" | "error">("idle");
  const [error, setError] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const classification = useMemo(() => classifyProject(brief.idea, initialServiceId), [brief.idea, initialServiceId]);
  const service = classification.recommendedService;
  const formats = formatChoices[service?.category ?? "default"];
  const score = calculateChizpaScore(brief);
  const eligible = classification.decision === "eligible" && Boolean(service);
  const wizardCharacter = checkoutState === "loading" ? "/brand/chispita-walk.webp" : wizardCharacters[step];

  const draftKey = `chizpa-draft:${initialServiceId ?? "open"}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.sessionStorage.getItem(draftKey);
      if (!stored) return;
      try {
        const draft = JSON.parse(stored) as { brief?: BriefAnswers; step?: number; noMaterials?: boolean };
        if (!initialIdea && draft.brief) {
          setBrief(draft.brief);
          const restoredStep = typeof draft.step === "number" ? Math.min(Math.max(draft.step, 0), steps.length - 1) : 0;
          const hasMaterials = Boolean(draft.noMaterials || draft.brief.materials?.trim());
          setStep(restoredStep > 1 && !hasMaterials ? 1 : restoredStep);
          setNoMaterials(Boolean(draft.noMaterials));
          setDraftRestored(true);
        }
      } catch {
        window.sessionStorage.removeItem(draftKey);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [draftKey, initialIdea]);

  useEffect(() => {
    window.sessionStorage.setItem(draftKey, JSON.stringify({ brief, step, noMaterials }));
  }, [brief, draftKey, noMaterials, step]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("idea")?.trim() ?? "";
    const incoming = (initialIdea || fromUrl).trim();
    if (!incoming) return;
    setBrief((current) => current.idea.trim() ? current : { ...current, idea: incoming });
  }, [initialIdea]);

  useEffect(() => {
    if (step > 0) stepHeadingRef.current?.focus();
  }, [step]);

  function setField<K extends keyof BriefAnswers>(field: K, value: BriefAnswers[K]) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  function toggleTone(tone: string) {
    setBrief((current) => {
      if (current.tone.includes(tone)) return { ...current, tone: current.tone.filter((item) => item !== tone) };
      if (current.tone.length >= 2) return current;
      return { ...current, tone: [...current.tone, tone] };
    });
  }

  function canContinue() {
    if (step === 0) return brief.idea.trim().length >= 12 && Boolean(brief.outcome) && brief.audience.trim().length >= 3;
    if (step === 1) return noMaterials || files.length > 0 || brief.materials.trim().length >= 3;
    if (step === 2) return brief.tone.length > 0 && Boolean(brief.format && brief.deadline) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email);
    return true;
  }

  function goNext() {
    if (!canContinue()) {
      setAdvanceError(step === 0
        ? "Cuéntame qué necesitas, qué debe lograr y quién lo usará."
        : step === 1
          ? "Adjunta algo, pega un link o marca que todavía no tienes materiales."
          : "Elige tono, formato y plazo, y agrega un email válido.");
      return;
    }
    setAdvanceError("");
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  async function beginCheckout() {
    if (!acceptedTerms || !eligible || !service) return;
    setCheckoutState("loading");
    setError("");
    try {
      const formData = new FormData();
      formData.set("payload", JSON.stringify({ serviceId: service.id, brief, chizpaScore: score }));
      files.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/checkout", { method: "POST", body: formData });
      const payload = await response.json() as { url?: string; error?: string; code?: string };
      if (response.ok && payload.url) { window.sessionStorage.removeItem(draftKey); window.location.assign(payload.url); return; }
      if (payload.code === "stripe_not_configured") { setCheckoutState("needs-config"); return; }
      setError(payload.error ?? "No pudimos abrir el pago. Tu brief sigue aquí.");
      setCheckoutState("error");
    } catch {
      setError("No pudimos conectar el pago. Prueba nuevamente en un momento.");
      setCheckoutState("error");
    }
  }

  return (
    <main className="wizard-shell">
      <header className="wizard-header">
        <Link href="/" className="wizard-back"><ArrowLeft size={18} /> Salir</Link>
        <Link className="wordmark wordmark--compact" href="/">chizpa<span>.com</span><i aria-hidden="true"><b /><b /><b /></i></Link>
        <span className="wizard-save"><Check size={15} /> 4 pasos · aprox. 3 min</span>
      </header>

      <div className="wizard-progress" role="progressbar" aria-label={`Paso ${step + 1} de ${steps.length}: ${steps[step]}`} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
        <div className="wizard-progress__track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /><i className="wizard-progress__spark" style={{ left: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="wizard-progress__labels">{steps.map((label, index) => <span key={label} className={index <= step ? "is-active" : ""}>{index + 1}. {label}</span>)}</div>
      </div>

      <div className="wizard-layout">
        <aside className="chispita-panel">
          <div className="chispita-guide">
            <div className="chispita-avatar" role="img" aria-label="Chispita, tu guía para crear el brief"><Image key={wizardCharacter} src={wizardCharacter} alt="" fill unoptimized sizes="96px" /></div>
            <div className="chispita-bubble">
              <p className="section-kicker">Chispita</p>
              {step === 0 && <><h2>Partamos por el resultado.</h2><p>Qué necesitas, para qué y quién lo va a usar. Una frase basta para partir.</p></>}
              {step === 1 && <><h2>Trae lo que tengas. O nada.</h2><p>Arrastra archivos, pega links o sigue sin materiales. Cero drama.</p></>}
              {step === 2 && <><h2>Ahora dime cómo debe quedar.</h2><p>Tono, formato y plazo. Chispita ordena el resto.</p></>}
              {step === 3 && <><h2>Esto es exactamente lo que compras.</h2><p>Revisa alcance, precio y fecha. Después del pago, el equipo parte.</p></>}
            </div>
          </div>

          <div className="wizard-product">
            <span>Proyecto detectado</span>
            <strong>{service?.title ?? "Todavía te estoy entendiendo"}</strong>
            {service ? <div><small>{service.recurrence ? <><Repeat2 size={13} /> Ciclo mensual</> : pricedFromIds.has(service.id) ? "Desde" : "Precio fijo"}</small><b>US${service.price}{service.recurrence ? "/mes" : ""}</b></div> : <p>Escribe una frase y te recomiendo la Chizpa correcta.</p>}
          </div>

          {brief.idea.trim().length >= 12 && <div className="score-mini"><span>Brief listo</span><strong>{score}%</strong><div><i style={{ width: `${score}%` }} /></div><small>{score >= 85 ? "Listo para producir" : "Seguimos completando"}</small></div>}
        </aside>

        <section className="wizard-card">
          {draftRestored && <div className="draft-restored" role="status"><CheckCircle2 size={18} /><span><strong>Tu proyecto sigue aquí.</strong> Recuperamos lo que ya habías contado.</span><button type="button" onClick={() => setDraftRestored(false)} aria-label="Cerrar aviso">×</button></div>}
          <p className="sr-only" aria-live="polite">Paso {step + 1} de {steps.length}: {steps[step]}</p>
          {step === 0 && <div className="wizard-step">
            <p className="wizard-step__count">Paso 1 de 4 · Proyecto</p><h1 ref={stepHeadingRef} tabIndex={-1}>¿Qué necesitas dejar listo?</h1><p className="wizard-step__lead">Cuéntalo como se lo contarías a una persona. Puede ser de trabajo, estudio, algo personal o una herramienta.</p>
            <label className="textarea-field"><span>Tu proyecto</span><textarea value={brief.idea} onChange={(event) => setField("idea", event.target.value)} placeholder="Ej: Tengo una PPT de 38 slides y necesito dejarla en 12 para el directorio del viernes…" rows={5} /><small>{brief.idea.length < 12 ? "Dame al menos una frase para entenderlo bien." : "Perfecto. Ya tengo por dónde partir."}</small></label>
            {service && <div className="service-detected" role="status"><Sparkles size={19} /><div><strong>Esto se parece a {service.title}.</strong><span>{service.result} · US${service.price}{service.recurrence ? " por ciclo mensual" : ""} · hasta {service.hours} h</span></div></div>}
            <div className="field-group field-group--spaced"><span>¿Qué tiene que lograr?</span><div className="choice-grid choice-grid--outcomes">{outcomes.map((item) => <button type="button" key={item} aria-pressed={brief.outcome === item} className={brief.outcome === item ? "is-selected" : ""} onClick={() => setField("outcome", item)}>{item}{brief.outcome === item && <CheckCircle2 size={17} />}</button>)}</div></div>
            <label className="text-field"><span>¿Quién lo va a ver o usar?</span><input value={brief.audience} onChange={(event) => setField("audience", event.target.value)} placeholder="Ej: El directorio, mi profesor, invitados al matrimonio…" /></label>
          </div>}

          {step === 1 && <div className="wizard-step">
            <p className="wizard-step__count">Paso 2 de 4 · Materiales</p><h1 ref={stepHeadingRef} tabIndex={-1}>Trae lo que tengas.</h1><p className="wizard-step__lead">Un borrador desordenado, links, fotos o archivos sirven. También puedes seguir sin nada.</p>
            <ProjectFilesDropzone files={files} onChange={(next) => { setFiles(next); if (next.length) setNoMaterials(false); }} />
            <div className="materials-or"><span>o</span></div>
            <label className="textarea-field textarea-field--small"><span>Links o contexto adicional</span><textarea value={brief.materials} onChange={(event) => { setField("materials", event.target.value); if (event.target.value.trim()) setNoMaterials(false); }} placeholder="Pega links de Drive, una web, referencias o cualquier pista útil." rows={3} /></label>
            <label className="no-materials-check"><input type="checkbox" checked={noMaterials} onChange={(event) => { setNoMaterials(event.target.checked); if (event.target.checked) setFiles([]); }} /><span><strong>Todavía no tengo materiales.</strong><small>Puedo seguir igual y reunirlos después.</small></span></label>
            <p className="privacy-note"><LockKeyhole size={16} /> Tus archivos son privados y solo se usan para completar tu pedido.</p>
          </div>}

          {step === 2 && <div className="wizard-step">
            <p className="wizard-step__count">Paso 3 de 4 · Resultado</p><h1 ref={stepHeadingRef} tabIndex={-1}>¿Cómo debe quedar?</h1><p className="wizard-step__lead">Elige hasta dos tonos. Si no sabes el formato, Chispita recomienda uno.</p>
            <div className="field-group"><span>Tono · máximo 2</span><div className="choice-grid choice-grid--tones">{tones.map((tone) => { const selected = brief.tone.includes(tone); return <button type="button" key={tone} aria-pressed={selected} className={selected ? "is-selected" : ""} disabled={brief.tone.length >= 2 && !selected} onClick={() => toggleTone(tone)}>{tone}{selected && <CheckCircle2 size={17} />}</button>; })}</div></div>
            <div className="field-group field-group--spaced"><span>Formato principal</span><div className="choice-grid choice-grid--compact">{formats.map((format) => <button type="button" key={format} aria-pressed={brief.format === format} className={brief.format === format ? "is-selected" : ""} onClick={() => setField("format", format)}>{format}</button>)}</div></div>
            <div className="two-fields">
              <label className="select-field"><span>Plazo</span><select value={brief.deadline} onChange={(event) => setField("deadline", event.target.value)}><option value="">Elige una opción</option><option>Entrega estándar · hasta 72 h</option><option>Lo antes posible</option><option>Esta semana</option><option>Sin fecha fija</option></select></label>
              <label className="text-field"><span>Email para el pedido</span><input type="email" value={brief.email} onChange={(event) => setField("email", event.target.value)} placeholder="tu@email.com" /></label>
            </div>
          </div>}

          {step === 3 && <div className="wizard-step wizard-step--review">
            <div className="review-heading"><div><p className="wizard-step__count">Paso 4 de 4 · Confirmar</p><h1 ref={stepHeadingRef} tabIndex={-1}>{service?.title ?? "Proyecto a medida"}</h1></div><div className={`decision-badge decision-badge--${classification.decision}`}>{classification.decision === "eligible" ? <Zap size={17} /> : <Lightbulb size={17} />}{classification.decision === "eligible" ? "Listo para producir" : classification.decision === "wiwo" ? "Proyecto Wiwo" : "Revisión necesaria"}</div></div>
            <p className="review-intro">{classification.explanation}</p>
            <div className="brief-block"><div><span>Proyecto y objetivo</span><button type="button" onClick={() => setStep(0)}><PencilLine size={15} /> Editar</button></div><p>{brief.idea}</p><small>{brief.outcome} · {brief.audience}</small></div>
            <div className="brief-block"><div><span>Materiales</span><button type="button" onClick={() => setStep(1)}><PencilLine size={15} /> Editar</button></div><p>{noMaterials ? "Todavía no tengo materiales" : files.length ? `${files.length} ${files.length === 1 ? "archivo listo" : "archivos listos"}` : "Links y referencias"}</p><small>{files.map((file) => file.name).join(" · ") || brief.materials || "Los reuniré después"}</small></div>
            <div className="brief-block"><div><span>Resultado y entrega</span><button type="button" onClick={() => setStep(2)}><PencilLine size={15} /> Editar</button></div><p>{brief.tone.join(" · ")} · {brief.format}</p><small>{brief.deadline} · Avisos a {brief.email}</small></div>

            {eligible && service ? <div className="checkout-summary">
              <div className="checkout-summary__top"><div><span>{service.category}{service.recurrence && <i className="checkout-recurring"><Repeat2 size={14} /> Cada mes</i>}</span><h2>{service.title}</h2></div><div className="score-large"><Check size={24} /><span>Brief listo</span></div></div>
              <ul>{service.includes.map((item) => <li key={item}><Check size={16} /> {item}</li>)}</ul>
              <div className="delivery-line"><Clock3 size={20} /><div><strong>Primera entrega en hasta {service.hours} horas</strong><span>Parte con pago confirmado + brief completo aceptado.</span></div></div>
              <div className="price-line"><div><span>{service.recurrence ? "Ciclo mensual" : pricedFromIds.has(service.id) ? "Desde" : "Total"}</span><small>{service.recurrence ? "Este pago cubre el primer ciclo" : "Pago único · no es suscripción"}</small></div><strong>US${service.price}{service.recurrence ? "/mes" : ""}</strong></div>
              <label className="terms-check"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /><span>{service.recurrence ? "Acepto el alcance de este ciclo mensual, una ronda de ajustes y el inicio del plazo con el brief completo." : "Acepto el alcance, una ronda de ajustes y el inicio del plazo con el brief completo."}</span></label>
              <button className="pay-button" type="button" aria-busy={checkoutState === "loading"} disabled={!acceptedTerms || checkoutState === "loading"} onClick={beginCheckout}>{checkoutState === "loading" ? <LoaderCircle className="spin" size={20} /> : <CreditCard size={20} />}{checkoutState === "loading" ? files.length ? "Subiendo materiales…" : "Abriendo Stripe…" : service.recurrence ? `Pagar primer ciclo · US$${service.price}` : `Pagar con Stripe · US$${service.price}`}</button>
              {!acceptedTerms && <p className="pay-helper">Marca la aceptación del alcance para continuar.</p>}
              <p className="stripe-note"><LockKeyhole size={14} /> {service.recurrence ? "Pago seguro con Stripe. Este cobro cubre el primer ciclo mensual." : "Pago seguro con Stripe. Pago único, no es suscripción."}</p>
              {checkoutState === "needs-config" && <div className="config-message"><strong>Falta conectar Stripe para cobrar de verdad.</strong><p>Cuando Stripe esté conectado, este botón abre el checkout. Mientras, puedes revisar el seguimiento demo.</p><Link href="/track?demo=CHZ-1042">Ver dashboard demo <ArrowRight size={16} /></Link></div>}
              {checkoutState === "error" && <p className="form-error">{error}</p>}
            </div> : <div className="review-route"><Lightbulb size={26} /><h2>{classification.decision === "wiwo" ? "Esto merece un proyecto Wiwo." : "Primero lo revisa una persona."}</h2><p>No vamos a cobrarte antes de confirmar alcance, capacidad y plazo.</p>{reviewSent ? <strong>Listo. Te escribiremos a {brief.email}.</strong> : <button type="button" onClick={() => setReviewSent(true)}>Enviar para revisión</button>}</div>}
          </div>}

          <div className="wizard-nav">
            <button type="button" className="wizard-nav__back" disabled={step === 0} onClick={() => { setAdvanceError(""); setStep((current) => Math.max(0, current - 1)); }}><ArrowLeft size={18} /> Atrás</button>
            {step < 3 && <div className="wizard-nav__forward"><button type="button" className="wizard-nav__next" aria-disabled={!canContinue()} onClick={goNext}>{step === 0 ? "Agregar materiales" : step === 1 ? "Definir resultado" : "Ver plan y precio"} <ArrowRight size={18} /></button>{advanceError && <p role="alert">{advanceError}</p>}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
