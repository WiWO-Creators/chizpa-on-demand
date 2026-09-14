"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Check, Clock3, CreditCard, FileText, Palette,
  Play, Presentation, Search, ShieldCheck, Sparkles, Video,
  Repeat2, Workflow, X, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  categories, getServiceIntents, services,
  type ChizpaService, type ServiceIntent,
} from "../data/services";
import { chispireads } from "../data/chispireads";
import { MarketingHeader, Wordmark } from "./marketing-header";
import { HeroComposer } from "./hero-composer";

const iconByName = { presentation: Presentation, video: Video, document: FileText, palette: Palette, workflow: Workflow };
const artByCategory: Record<ChizpaService["category"], string> = {
  Presentaciones: "/brand/chispita-laptop.webp",
  Videos: "/brand/chispita-director.webp",
  Documentos: "/brand/chispita-meditate.webp",
  Diseño: "/brand/chispita-point.webp",
  Herramientas: "/brand/chispita-laptop.webp",
};
const popularServiceIds = new Set([
  "ppt-directorio", "ppt-comercial", "reel-desde-material", "cv-linkedin",
  "pack-redes", "resumen-ejecutivo", "planilla-pro", "invitacion-evento",
]);
const pricedFromIds = new Set(["landing-express", "automatizacion-simple", "mini-herramienta"]);
const featuredServiceIds = [
  "ppt-comercial", "reel-desde-material", "resumen-ejecutivo", "cv-linkedin",
  "invitacion-evento", "pack-redes", "planilla-pro", "calculadora-web",
];
const recurringFeaturedIds = [
  "resultados-del-mes", "videos-del-mes", "tu-mes-en-video", "social-media-automatico",
];
const recurringCatalogServices = services.filter((service) => Boolean(service.recurrence));
const quickTypes: ServiceIntent[] = ["Trabajo", "Estudio", "Personal", "Tech"];
const featuredReads = chispireads.slice(0, 3);
const chispitaModes = [
  { eyebrow: "Modo director", title: "Haz ese video", copy: "Idea, fotos o clips. Chispita arma la producción.", art: "/brand/chispita-director.webp", category: "Videos", tone: "purple" },
  { eyebrow: "Modo ejecutivo", title: "Haz una presentación genial", copy: "Menos slides. Más claridad. Lista para presentar.", art: "/brand/chispita-laptop.webp", category: "Presentaciones", tone: "orange" },
  { eyebrow: "Modo emoción", title: "Convierte recuerdos en videos o regalos", copy: "Momentos sueltos convertidos en algo que se comparte.", art: "/brand/chispita-flowers.webp", category: "Videos", tone: "red" },
  { eyebrow: "Modo foco", title: "Ordena el documento", copy: "Del borrador infinito a una entrega clara y bien armada.", art: "/brand/chispita-meditate.webp", category: "Documentos", tone: "lime" },
  { eyebrow: "Modo resuélvelo", title: "Conecta la tarea", copy: "Automatizaciones y herramientas pequeñas que sí funcionan.", art: "/brand/chispita-point.webp", category: "Herramientas", tone: "lavender" },
] as const;

function ServiceCard({ service }: { service: ChizpaService }) {
  const Icon = iconByName[service.icon];
  return (
    <article className={`service-card service-card--energy-${service.accent}${service.recurrence ? " service-card--recurring" : ""}`}>
      <div className="service-card__character" aria-hidden="true">
        <span className="status-gem" />
        <Image src={artByCategory[service.category]} alt="" width={160} height={160} unoptimized />
      </div>
      <div className="service-card__top">
        <span className="service-card__icon" aria-hidden="true"><Icon size={21} strokeWidth={2} /></span>
        <div className="service-card__badges">
          {service.recurrence && <span className="service-card__recurring"><Repeat2 size={14} /> {service.recurrence.label}</span>}
          {popularServiceIds.has(service.id) && <span className="service-card__popular">Más pedido</span>}
          <span className="service-card__time"><Clock3 size={14} /> hasta {service.hours} h</span>
        </div>
      </div>
      <p className="service-card__category">{service.category}</p>
      <h3>{service.title}</h3>
      <p className="service-card__description">{service.description}</p>
      <p className="service-card__result"><Check size={16} /> {service.result}</p>
      <div className="service-card__bottom">
        <div><small>{service.recurrence ? "Por ciclo mensual" : pricedFromIds.has(service.id) ? "Desde" : "Precio fijo"}</small><strong>US${service.price}{service.recurrence && <em>/mes</em>}</strong></div>
        <Link href={`/start?service=${service.id}`} aria-label={`Empezar ${service.title}`}>{service.recurrence ? "Empezar ciclo" : "Empezar"} <ArrowRight size={17} /></Link>
      </div>
    </article>
  );
}

function RecurringCard({ service }: { service: ChizpaService }) {
  const Icon = iconByName[service.icon];
  return (
    <article className="recurring-card">
      <div className="recurring-card__top">
        <span className="recurring-card__icon" aria-hidden="true"><Icon size={20} /></span>
        <span className="recurring-card__badge"><Repeat2 size={15} /> {service.recurrence?.label}</span>
      </div>
      <p>{service.category}</p>
      <h3>{service.title}</h3>
      <span className="recurring-card__result">{service.result}</span>
      <div className="recurring-card__bottom">
        <div><strong>US${service.price}</strong><small>por ciclo mensual</small></div>
        <Link href={`/start?service=${service.id}`} aria-label={`Empezar ${service.title}`}><ArrowRight size={18} /></Link>
      </div>
    </article>
  );
}

export function HomeExperience() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Todo");
  const [intent, setIntent] = useState<"Todo" | ServiceIntent>("Todo");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [recurringOnly, setRecurringOnly] = useState(false);

  const filteredServices = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return services.filter((service) => {
      const matchesCategory = category === "Todo" || service.category === category;
      const matchesIntent = intent === "Todo" || getServiceIntents(service).includes(intent);
      const matchesRecurrence = !recurringOnly || Boolean(service.recurrence);
      const haystack = `${service.title} ${service.shortTitle} ${service.description} ${service.result} ${service.examples.join(" ")} ${service.includes.join(" ")} ${service.recurrence ? "mensual recurrente cada mes" : ""}`.toLocaleLowerCase("es");
      return matchesCategory && matchesIntent && matchesRecurrence && (!needle || haystack.includes(needle));
    });
  }, [category, intent, query, recurringOnly]);

  const categoryCounts = useMemo(() => Object.fromEntries(categories.map((item) => [
    item,
    services.filter((service) => {
      const matchesIntent = intent === "Todo" || getServiceIntents(service).includes(intent);
      const matchesRecurrence = !recurringOnly || Boolean(service.recurrence);
      const needle = query.trim().toLocaleLowerCase("es");
      const haystack = `${service.title} ${service.shortTitle} ${service.description} ${service.result} ${service.examples.join(" ")} ${service.includes.join(" ")}`.toLocaleLowerCase("es");
      return matchesIntent && matchesRecurrence && (!needle || haystack.includes(needle)) && (item === "Todo" || service.category === item);
    }).length,
  ])) as Record<(typeof categories)[number], number>, [intent, query, recurringOnly]);

  const visibleServices = useMemo(() => {
    const isExploring = showAll || category !== "Todo" || intent !== "Todo" || recurringOnly || Boolean(query.trim());
    if (isExploring) return filteredServices.slice(0, visibleCount);
    return featuredServiceIds.map((id) => services.find((service) => service.id === id)).filter((service): service is ChizpaService => Boolean(service));
  }, [category, filteredServices, intent, query, recurringOnly, showAll, visibleCount]);

  const isExploringCatalog = showAll || category !== "Todo" || intent !== "Todo" || recurringOnly || Boolean(query.trim());
  const remainingServices = Math.max(0, filteredServices.length - visibleServices.length);

  function revealCatalog() {
    setRecurringOnly(false);
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exploreCategory(nextCategory: (typeof categories)[number]) {
    setCategory(nextCategory);
    setRecurringOnly(false);
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exploreIntent(nextIntent: ServiceIntent) {
    setIntent(nextIntent);
    setCategory("Todo");
    setRecurringOnly(false);
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exploreRecurring() {
    setRecurringOnly(true);
    setIntent("Todo");
    setCategory("Todo");
    setQuery("");
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <main className="chizpa-home">
      <MarketingHeader />

      <section className="hero" aria-labelledby="hero-title" data-reveal>
        <span className="hero-blob hero-blob--one" aria-hidden="true" />
        <span className="hero-blob hero-blob--two" aria-hidden="true" />
        <div className="hero__content">
          <h1 id="hero-title">Hazlo con <span>Chizpa</span></h1>
          <p className="hero__lead">Cuéntale el proyecto a Chispita. Te arma SMARTactics: acciones concretas, cada una una Chizpa lista para pagar.</p>
        </div>

        <HeroComposer />
        <div className="hero-purchase-path" aria-label="Cómo comprar en Chizpa">
          <ol><li><b>1</b><span><strong>Cuéntalo</strong><small>Una frase basta.</small></span></li><li><b>2</b><span><strong>Elige una SMARTactic</strong><small>Te orientamos paso a paso.</small></span></li><li><b>3</b><span><strong>Paga y parte</strong><small>El click abre el checkout.</small></span></li></ol>
          <a href="#proyectos">Prefiero elegir una Chizpa <ArrowRight size={15} /></a>
        </div>
      </section>

      <section className="quick-types" aria-label="Tipos de proyecto">
        <span className="quick-types__label">Explora por contexto</span>
        {quickTypes.map((item) => <button type="button" key={item} aria-pressed={intent === item} onClick={() => exploreIntent(item)}>{item}<ArrowRight size={13} /></button>)}
        <button className="quick-types__all" type="button" onClick={revealCatalog}>Ver los {services.length} proyectos <ArrowRight size={15} /></button>
      </section>

      <section className="mode-deck" aria-labelledby="mode-title" data-reveal>
        <div className="mode-deck__heading"><div><p className="section-kicker">Elige tu modo</p><h2 id="mode-title">¿Qué quieres sacar<br />de tu cabeza?</h2></div><p>Haz clic en un modo y Chispita te lleva directo a los proyectos que mejor calzan.</p></div>
        <div className="mode-deck__rail">
          {chispitaModes.map((mode) => (
            <button className={`mode-card mode-card--${mode.tone}`} type="button" key={mode.eyebrow} onClick={() => exploreCategory(mode.category)}>
              <span className="mode-card__gem" aria-hidden="true" />
              <div className="mode-card__art"><Image src={mode.art} alt="" fill unoptimized sizes="(max-width: 800px) 72vw, 260px" /></div>
              <div className="mode-card__copy"><span>{mode.eyebrow}</span><h3>{mode.title}</h3><p>{mode.copy}</p></div>
              <ArrowRight className="mode-card__arrow" size={19} />
            </button>
          ))}
        </div>
      </section>

      <section className="recurring-showcase" id="recurrentes" aria-labelledby="recurring-title" data-reveal>
        <div className="recurring-showcase__hero">
          <div className="recurring-showcase__copy">
            <span className="recurring-showcase__label"><Repeat2 size={18} /> Servicios recurrentes</span>
            <h2 id="recurring-title">Chizpas que<br /><span>vuelven.</span></h2>
            <p>Para eso que necesitas una y otra vez. Partes una vez y el próximo ciclo ya tiene contexto, estructura y una forma de trabajar.</p>
            <button type="button" onClick={exploreRecurring}>Ver los {recurringCatalogServices.length} recurrentes <ArrowRight size={18} /></button>
          </div>
          <div className="recurring-showcase__art" aria-hidden="true">
            <span className="recurring-showcase__orbit"><Repeat2 size={36} /></span>
            <Image src="/brand/chispita-lean.webp" alt="" fill unoptimized sizes="(max-width: 800px) 70vw, 390px" />
          </div>
        </div>
        <div className="recurring-showcase__grid">
          {recurringFeaturedIds.map((id) => services.find((service) => service.id === id)).filter((service): service is ChizpaService => Boolean(service)).map((service) => <RecurringCard key={service.id} service={service} />)}
        </div>
      </section>

      <section className="catalog" id="proyectos" aria-labelledby="catalog-title" data-reveal>
        <div className="catalog-intro">
          <div className="catalog-intro__copy">
            <p className="section-kicker">{services.length} proyectos listos para encargar</p>
            <h2 id="catalog-title">Menos vueltas.<span>Más cosas hechas.</span></h2>
            <p>Elige algo listo o busca por lo que quieres lograr. Ves alcance, precio y plazo antes de empezar.</p>
          </div>
          <div className="catalog-intro__side">
            <div className="catalog-intro__art" aria-hidden="true"><Image src="/brand/chispita-meditate.webp" alt="" fill unoptimized sizes="240px" /></div>
          </div>
        </div>
        <div className="catalog-tools">
          <label className="search-box search-box--catalog"><span className="sr-only">Buscar proyectos</span><Search size={19} /><input value={query} onChange={(event) => { setQuery(event.target.value); setIntent("Todo"); setCategory("Todo"); setRecurringOnly(false); setShowAll(true); setVisibleCount(12); }} placeholder="Busca: pitch, currículum, invitación, video, automatización…" />{query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery("")}><X size={16} /></button>}</label>
          <p className="catalog-results" aria-live="polite"><strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? "proyecto encontrado" : "proyectos encontrados"}</p>
          <div className="catalog-contexts" aria-label="Filtrar por contexto"><button type="button" aria-pressed={intent === "Todo" && !recurringOnly} onClick={() => { setIntent("Todo"); setRecurringOnly(false); setVisibleCount(12); }}>Todos los contextos</button>{quickTypes.map((item) => <button type="button" key={item} aria-pressed={intent === item && !recurringOnly} onClick={() => { setIntent(item); setRecurringOnly(false); setVisibleCount(12); }}>{item}</button>)}<button className="catalog-contexts__recurring" type="button" aria-pressed={recurringOnly} onClick={exploreRecurring}><Repeat2 size={15} /> Recurrentes</button></div>
          <div className="category-tabs" aria-label="Filtrar por tipo">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setShowAll(true); setVisibleCount(12); }}><span>{item}</span><small>{categoryCounts[item]}</small></button>)}</div>
        </div>
        {visibleServices.length ? <div className="service-grid">{visibleServices.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <div className="empty-state"><Sparkles size={28} /><h3>No está en la lista. Mejor.</h3><p>Cuéntaselo a Chispita y vemos si cabe en una Chizpa de 72 horas.</p><Link className="button button--purple" href={`/start?idea=${encodeURIComponent(query)}`}>Chizar mi idea</Link></div>}
        {!isExploringCatalog && <button className="catalog-more" type="button" onClick={() => { setShowAll(true); setVisibleCount(12); }}>Ver los {services.length} proyectos <ArrowRight size={17} /></button>}
        {isExploringCatalog && remainingServices > 0 && <button className="catalog-more" type="button" onClick={() => setVisibleCount((current) => current + 12)}>Ver 12 más <span>· quedan {remainingServices}</span><ArrowRight size={17} /></button>}
        <div className="custom-project">
          <div className="custom-project__character"><Image src="/brand/chispita-point.webp" alt="" fill unoptimized sizes="190px" /></div>
          <div><p className="section-kicker">¿Es otra cosa?</p><h3>Si se puede explicar y entregar digitalmente, probablemente se puede chizar.</h3><p>Chispita lo ordena, confirma si cabe en 72 horas y te propone el camino más simple.</p></div>
          <Link className="button button--orange" href="/start">Cuéntame tu proyecto <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="how" id="como-comprar" aria-labelledby="how-title" data-reveal>
        <div className="how__intro"><p className="section-kicker section-kicker--light">Comprar sin complicarte</p><h2 id="how-title">Una idea.<br />Cuatro pasos.<br /><span>Listo.</span></h2><p>Sabes qué recibirás, cuánto cuesta y cuándo llega antes de pagar. Chispita te acompaña de principio a fin.</p><div className="how__sticker"><Image src="/brand/chispita-line.png" alt="" width={145} height={200} unoptimized /></div></div>
        <ol className="steps">
          <li><span>01</span><div><small>Antes de pagar · 2 min</small><h3>Cuéntanos qué necesitas</h3><p>Escríbelo a tu manera. Chispita te arma SMARTactics con Chizpas concretas, listas para pagar.</p><strong>Sales con un brief claro y un proyecto recomendado.</strong></div></li>
          <li><span>02</span><div><small>Antes de pagar · inmediato</small><h3>Revisa el plan completo</h3><p>Ves el entregable exacto, lo que incluye, el plazo comprometido y el precio. Sin esperar una cotización.</p><strong>Puedes volver y editar cualquier respuesta.</strong></div></li>
          <li><span>03</span><div><small>Para comenzar · 1 min</small><h3>Paga de forma segura</h3><p>Confirmas el alcance y pagas con Stripe. El reloj de entrega parte con tu brief y materiales completos.</p><strong>Recibes tu código de pedido y acceso al seguimiento.</strong></div></li>
          <li><span>04</span><div><small>Después de pagar · hasta 72 h</small><h3>Mira cómo toma forma</h3><p>El equipo produce, revisa y afina. Tú ves el estado, recibes los archivos y tienes un ajuste incluido.</p><strong>Terminas con una entrega lista para usar.</strong></div></li>
        </ol>
      </section>

      <section className="product-proof" aria-labelledby="proof-title" data-reveal>
        <div className="product-proof__copy"><p className="section-kicker">Tu proyecto tiene pulso</p><h2 id="proof-title">Mira cómo va.<br />Sin perseguir a nadie.</h2><p>Después de pagar ves el avance en tiempo real. Sabes qué está pasando, quién lo está revisando y cuándo llega.</p><ul><li><ShieldCheck size={18} /> Especialista Wiwo incluido</li><li><Clock3 size={18} /> Fecha de entrega visible</li><li><Zap size={18} /> Una ronda de ajustes</li></ul><Link className="button button--ghost" href="/track?demo=CHZ-1042">Ver seguimiento demo <ArrowRight size={17} /></Link></div>
        <div className="product-proof__stage">
          <div className="project-dashboard">
            <div className="project-dashboard__top"><div><span>Pedido CHZ-1042</span><strong>PPT de directorio</strong></div><span className="project-dashboard__status"><i /> En producción</span></div>
            <div className="project-dashboard__delivery"><small>Entrega estimada</small><strong>Mañana · 16:00</strong><span>Actualizado hace 4 min</span></div>
            <ol><li className="is-done"><i><Check size={14} /></i><div><strong>Recibido</strong><span>Brief y materiales listos</span></div></li><li className="is-done"><i><Check size={14} /></i><div><strong>Primera versión</strong><span>Estructura y propuesta en marcha</span></div></li><li className="is-active"><i>3</i><div><strong>Revisión del equipo</strong><span>Estamos afinando el relato</span></div></li><li><i>4</i><div><strong>Entregado</strong><span>Archivos listos para descargar</span></div></li></ol>
            <div className="project-dashboard__file"><Presentation size={19} /><div><strong>Directorio_Q3_v01.pptx</strong><span>Primer avance en preparación</span></div><small>12 slides</small></div>
          </div>
          <div className="product-proof__chispita"><Image src="/brand/chispita-laptop.webp" alt="Chispita trabajando en tu proyecto" fill unoptimized sizes="260px" /></div>
        </div>
      </section>

      <section className="video-story" aria-labelledby="video-story-title" data-reveal>
        <div className="video-story__copy">
          <p className="section-kicker">Chizpa en movimiento</p>
          <h2 id="video-story-title">Una idea.<br /><span>Y que empiece a pasar.</span></h2>
          <p>Mira la energía detrás de Chizpa: proyectos que salen de tu cabeza, toman forma y quedan listos para usar.</p>
          <a href="https://youtu.be/MKbwut4Kw_I" target="_blank" rel="noreferrer">Ver en YouTube <ArrowRight size={17} /></a>
        </div>
        <div className="video-story__frame">
          <div className="video-story__label"><Play size={16} fill="currentColor" /> Hazlo con Chizpa</div>
          <iframe src="https://www.youtube-nocookie.com/embed/MKbwut4Kw_I?rel=0" title="Hazlo con Chizpa" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        </div>
      </section>

      <section className="chispireads-preview" aria-labelledby="reads-preview-title" data-reveal>
        <div className="chispireads-preview__heading">
          <div><p className="section-kicker"><BookOpen size={16} /> ChispiReads</p><h2 id="reads-preview-title">Ideas útiles para<br /><span>hacerlo mejor.</span></h2></div>
          <div><p>Guías simples, checklists y pasos concretos para presentaciones, videos, documentos y proyectos digitales.</p><Link href="/chispireads">Leer todas las guías <ArrowRight size={17} /></Link></div>
        </div>
        <div className="chispireads-preview__grid">
          {featuredReads.map((article) => <article className="read-card" key={article.slug}>
            <Link className="read-card__art" href={`/chispireads/${article.slug}`} aria-label={`Leer ${article.title}`}><Image src={article.art} alt="" fill unoptimized sizes="(max-width: 780px) 100vw, 33vw" /></Link>
            <div className="read-card__copy"><span>{article.category} · {article.readTime}</span><h3><Link href={`/chispireads/${article.slug}`}>{article.title}</Link></h3><p>{article.dek}</p><Link className="read-card__link" href={`/chispireads/${article.slug}`}>Leer paso a paso <ArrowRight size={16} /></Link></div>
          </article>)}
        </div>
      </section>

      <div className="energy-ribbon" aria-hidden="true"><div><span>TÚ LO CUENTAS</span><i /> <span>CHISPITA LO ORDENA</span><i /> <span>EL EQUIPO LO HACE</span><i /> <span>TÚ LO CUENTAS</span><i /> <span>CHISPITA LO ORDENA</span><i /> <span>EL EQUIPO LO HACE</span></div></div>

      <section className="faq" id="preguntas" aria-labelledby="faq-title" data-reveal><div><p className="section-kicker">Sin letra chica rara</p><h2 id="faq-title">Preguntas que sí importan.</h2><p>Si tu duda no está acá, Chispita la resuelve durante el brief.</p></div><div className="faq__list"><details><summary>¿Las 72 horas corren desde que pago?</summary><p>Corren desde que el pago está confirmado y el brief tiene todo lo necesario. Antes de pagar verás el plazo comprometido.</p></details><details><summary>¿Quién hace mi proyecto?</summary><p>Chispita te guía y organiza el brief. Después, una persona del equipo crea, revisa y aprueba cada entrega.</p></details><details><summary>¿Qué pasa si mi proyecto es demasiado grande?</summary><p>Chispita te lo dirá antes de pagar. Puede dividirlo en etapas, sugerir otra Chizpa o derivarlo a Wiwo.</p></details><details><summary>¿Puedo pedir cambios?</summary><p>Sí. Una ronda consolidada está incluida. Cambiar el objetivo o sumar entregables puede requerir una Chizpa adicional.</p></details></div></section>

      <section className="final-cta" data-reveal><div className="final-cta__copy"><p>Una cosa menos en tu cabeza.</p><h2>Deja de postergarlo.<br /><span>Hazlo con Chizpa.</span></h2><Link className="button button--orange" href="/start">Ready to Chiz? <ArrowRight size={19} /></Link></div><div className="final-cta__visual"><span className="final-cta__gem" aria-hidden="true" /><Image src="/brand/chispita-walk.webp" alt="Chispita listo para poner en marcha tu proyecto" fill unoptimized sizes="(max-width: 800px) 90vw, 40vw" /></div></section>

      <section className="trust-band" aria-label="Condiciones de cada Chizpa" data-reveal>
        <div className="trust-band__item"><span className="trust-band__icon" aria-hidden="true"><Zap size={22} /></span><span><strong>Sin reuniones</strong><small>Cuéntalo y parte.</small></span></div>
        <div className="trust-band__item"><span className="trust-band__icon" aria-hidden="true"><Check size={22} /></span><span><strong>1 ajuste incluido</strong><small>Para dejarlo justo.</small></span></div>
        <div className="trust-band__item"><span className="trust-band__icon" aria-hidden="true"><CreditCard size={22} /></span><span><strong>Pago seguro</strong><small>Procesado con Stripe.</small></span></div>
      </section>

      <footer><Wordmark /><p>Hecho en América con amor por <strong>Wiwo</strong>.</p><div><a href="#proyectos">Proyectos</a><Link href="/chispireads">ChispiReads</Link><a href="#preguntas">Ayuda</a><Link href="/track">Mi pedido</Link></div><small>© 2026 Chizpa.com · Chispita entiende. El equipo lo hace.</small></footer>
    </main>
  );
}
