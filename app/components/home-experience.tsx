"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Check, Clock3, CreditCard, FileText, Palette,
  Presentation, Search, ShieldCheck, Sparkles, Video,
  Repeat2, Workflow, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  categories, getServiceIntents, services,
  type ChizpaService, type ServiceIntent,
} from "../data/services";
import { chispireads } from "../data/chispireads";
import { MarketingHeader, Wordmark } from "./marketing-header";
import { HeroComposer } from "./hero-composer";
import { DeliverablePreview } from "./deliverable-preview";

const iconByName = { presentation: Presentation, video: Video, document: FileText, palette: Palette, workflow: Workflow };
const popularServiceIds = new Set([
  "ppt-directorio", "ppt-comercial", "reel-desde-material", "cv-linkedin",
  "pack-redes", "resumen-ejecutivo", "planilla-pro", "invitacion-evento",
]);
const pricedFromIds = new Set(["landing-express", "automatizacion-simple", "mini-herramienta"]);
const featuredServiceIds = [
  "ppt-comercial", "reel-desde-material", "cv-linkedin",
  "invitacion-evento", "planilla-pro", "automatizacion-simple",
];
const recurringCompare = [
  {
    id: "videos-del-mes",
    material: "Clips o referencias que tú envías",
    edition: "Edición de 4 videos de hasta 30 s",
    publish: "Archivos listos. No publicamos por ti.",
  },
  {
    id: "social-media-automatico",
    material: "Fotos o videos del producto",
    edition: "Creamos 4 reels de hasta 20 s",
    publish: "Listos para publicar. No gestionamos redes.",
  },
  {
    id: "tu-mes-en-video",
    material: "Hasta 40 fotos o clips personales",
    edition: "1 video de hasta 90 s",
    publish: "Un recuerdo. No es para redes.",
  },
];
const recurringCatalogServices = services.filter((service) => Boolean(service.recurrence));
const quickTypes: ServiceIntent[] = ["Trabajo", "Estudio", "Personal", "Tech"];
const featuredReads = chispireads.slice(0, 3);
const samples = [
  { title: "Presentación lista para mostrar", copy: "Portada, argumento y datos. No un mazo de 40 slides.", image: "/samples/presentacion.jpg", href: "/start?service=ppt-comercial" },
  { title: "Un reel que se puede ver", copy: "Ritmo, subtítulos y un corte que sí se comparte.", image: "/samples/reel.jpg", href: "/start?service=reel-desde-material" },
  { title: "Una planilla que funciona", copy: "Indicadores, filtros y controles. No un Excel eterno.", image: "/samples/planilla.jpg", href: "/start?service=planilla-pro" },
];

function ServiceCard({ service }: { service: ChizpaService }) {
  const Icon = iconByName[service.icon];
  return (
    <article className={`service-card service-card--vitrine service-card--energy-${service.accent}${service.recurrence ? " service-card--recurring" : ""}`}>
      <DeliverablePreview service={service} />
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
      <p className="service-card__trust">Una persona Wiwo lo crea y revisa · 1 ajuste · plazo desde brief aceptado</p>
      <div className="service-card__bottom">
        <div>
          <small>{service.recurrence ? "Por ciclo mensual" : pricedFromIds.has(service.id) ? "Desde" : "Precio fijo"} · USD</small>
          <strong>US${service.price}{service.recurrence && <em>/mes</em>}</strong>
        </div>
        <Link href={`/start?service=${service.id}`} aria-label={`Empezar ${service.title}`}>{service.recurrence ? "Empezar ciclo" : "Pedir esto"} <ArrowRight size={17} /></Link>
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
  const featuredServices = featuredServiceIds
    .map((id) => services.find((service) => service.id === id))
    .filter((service): service is ChizpaService => Boolean(service));

  function revealCatalog() {
    setRecurringOnly(false);
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exploreIntent(nextIntent: ServiceIntent) {
    setIntent(nextIntent);
    setCategory("Todo");
    setRecurringOnly(false);
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function exploreRecurring() {
    setRecurringOnly(true);
    setIntent("Todo");
    setCategory("Todo");
    setQuery("");
    setShowAll(true);
    setVisibleCount(12);
    window.requestAnimationFrame(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <main className="chizpa-home">
      <MarketingHeader />

      <section className="hero hero--promise" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="section-kicker">Hecho por personas de Wiwo</p>
          <h1 id="hero-title">Ese pendiente, <span>listo.</span></h1>
          <p className="hero__lead">Presentaciones, videos, documentos y herramientas digitales hechos para ti. Precio fijo, especialistas Wiwo y entregas de hasta 72 horas, según el proyecto.</p>
          <div className="hero__actions">
            <a className="button button--orange" href="#destacados">Ver proyectos y precios <ArrowRight size={16} /></a>
            <a className="button button--ghost" href="#orientacion">Ayúdame a elegir</a>
          </div>
          <ul className="hero__pledges">
            <li>Archivos listos para usar</li>
            <li>Una ronda de ajustes</li>
            <li>Seguimiento del pedido</li>
          </ul>
          <p className="hero__sla">El plazo parte cuando el pago está confirmado y el brief tiene lo necesario.</p>
        </div>
        <div className="hero-samples" aria-label="Ejemplos de entregas">
          {samples.map((sample) => (
            <Link className="hero-sample" key={sample.title} href={sample.href}>
              <span className="hero-sample__media">
                <Image src={sample.image} alt="" fill unoptimized sizes="(max-width: 800px) 80vw, 280px" />
              </span>
              <strong>{sample.title}</strong>
              <small>{sample.copy}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-row" aria-label="Qué incluye cada compra">
        <div><ShieldCheck size={20} /><span><strong>Una persona lo hace</strong><small>Chispita ordena. Un especialista Wiwo crea, revisa y aprueba.</small></span></div>
        <div><Check size={20} /><span><strong>1 ajuste incluido</strong><small>Para dejarlo justo, sin cambiar el objetivo.</small></span></div>
        <div><Clock3 size={20} /><span><strong>Hasta 72 horas</strong><small>El reloj parte con pago y brief completo.</small></span></div>
        <div><CreditCard size={20} /><span><strong>Cobro en USD</strong><small>Precio fijo visible antes de pagar, con Stripe.</small></span></div>
      </section>

      <section className="featured" id="destacados" aria-labelledby="featured-title">
        <div className="featured__intro">
          <p className="section-kicker">Seis formas de partir</p>
          <h2 id="featured-title">Elige un resultado. Ves precio y plazo.</h2>
          <p>Cada ficha muestra lo que recibes, no un personaje. Si ya sabes lo que quieres, entra. Si no, Chispita te orienta más abajo.</p>
        </div>
        <div className="service-grid service-grid--featured">
          {featuredServices.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
        <button className="catalog-more" type="button" onClick={revealCatalog}>Ver el catálogo completo <ArrowRight size={17} /></button>
      </section>

      <section className="how" id="como-comprar" aria-labelledby="how-title">
        <div className="how__intro"><p className="section-kicker section-kicker--light">Cómo funciona</p><h2 id="how-title">Una idea.<br />Cuatro pasos.<br /><span>Listo.</span></h2><p>Sabes qué recibirás, cuánto cuesta y cuándo llega antes de pagar. Detrás hay un equipo de Wiwo, no un bot entregando archivos.</p></div>
        <ol className="steps">
          <li><span>01</span><div><small>Antes de pagar · 2 min</small><h3>Cuéntanos qué necesitas</h3><p>Escríbelo a tu manera o elige un proyecto. Te proponemos una solución concreta, con alcance y precio.</p><strong>Sales con un brief claro.</strong></div></li>
          <li><span>02</span><div><small>Antes de pagar · inmediato</small><h3>Revisa el plan completo</h3><p>Ves el entregable, lo que debes aportar, los formatos, el plazo y el ajuste incluido.</p><strong>Puedes volver y editar cualquier respuesta.</strong></div></li>
          <li><span>03</span><div><small>Para comenzar · 1 min</small><h3>Paga de forma segura</h3><p>Confirmas el alcance y pagas con Stripe en dólares. El reloj parte con brief y materiales completos.</p><strong>Recibes tu código de pedido.</strong></div></li>
          <li><span>04</span><div><small>Después de pagar · hasta 72 h</small><h3>Mira cómo toma forma</h3><p>Una persona produce y revisa. Tú ves el estado, recibes los archivos y tienes un ajuste incluido.</p><strong>Terminas con una entrega lista para usar.</strong></div></li>
        </ol>
      </section>

      <section className="orient" id="orientacion" aria-labelledby="orient-title">
        <div className="orient__intro">
          <p className="section-kicker">Si todavía no sabes cuál elegir</p>
          <h2 id="orient-title">Cuéntalo. Te mostramos opciones y precio.</h2>
          <p>Chispita recomienda primero la solución principal. Después, complementos opcionales. Tú decides.</p>
        </div>
        <HeroComposer />
      </section>

      <section className="quick-types" aria-label="Tipos de proyecto">
        <span className="quick-types__label">Explora por contexto</span>
        {quickTypes.map((item) => <button type="button" key={item} aria-pressed={intent === item} onClick={() => exploreIntent(item)}>{item}<ArrowRight size={13} /></button>)}
        <button className="quick-types__all" type="button" onClick={revealCatalog}>Ver los {services.length} proyectos <ArrowRight size={15} /></button>
      </section>

      <section className="recurring-showcase" id="recurrentes" aria-labelledby="recurring-title">
        <div className="recurring-showcase__copy">
          <span className="recurring-showcase__label"><Repeat2 size={18} /> Cada mes</span>
          <h2 id="recurring-title">Si ya te sirvió una vez, puede volver.</h2>
          <p>El cobro se renueva cada ciclo mensual. Cancelas cuando quieras. La diferencia no es el precio: es qué material pones tú y qué sale listo.</p>
        </div>
        <div className="recurring-compare" role="table" aria-label="Comparar servicios mensuales de video">
          <div className="recurring-compare__row recurring-compare__row--head" role="row">
            <span>Qué cambia</span>
            {recurringCompare.map((item) => {
              const service = services.find((entry) => entry.id === item.id);
              return <strong key={item.id}>{service?.title}</strong>;
            })}
          </div>
          <div className="recurring-compare__row" role="row"><span>Material que aportas</span>{recurringCompare.map((item) => <p key={item.id}>{item.material}</p>)}</div>
          <div className="recurring-compare__row" role="row"><span>Qué editamos o creamos</span>{recurringCompare.map((item) => <p key={item.id}>{item.edition}</p>)}</div>
          <div className="recurring-compare__row" role="row"><span>Publicación</span>{recurringCompare.map((item) => <p key={item.id}>{item.publish}</p>)}</div>
          <div className="recurring-compare__row" role="row">
            <span>Precio / mes</span>
            {recurringCompare.map((item) => {
              const service = services.find((entry) => entry.id === item.id);
              return <p key={item.id}><b>US${service?.price}</b> · hasta {service?.hours} h</p>;
            })}
          </div>
          <div className="recurring-compare__row recurring-compare__row--cta" role="row">
            <span />
            {recurringCompare.map((item) => (
              <Link key={item.id} href={`/start?service=${item.id}`}>Empezar ciclo <ArrowRight size={15} /></Link>
            ))}
          </div>
        </div>
        <button type="button" className="catalog-more" onClick={exploreRecurring}>Ver los {recurringCatalogServices.length} recurrentes <ArrowRight size={18} /></button>
      </section>

      <section className="catalog" id="catalogo" aria-labelledby="catalog-title">
        <div className="catalog-intro">
          <div className="catalog-intro__copy">
            <p className="section-kicker">{services.length} proyectos listos para encargar</p>
            <h2 id="catalog-title">Catálogo completo</h2>
            <p>Elige algo listo o busca por lo que quieres lograr. Ves alcance, precio y plazo antes de empezar.</p>
          </div>
        </div>
        <div className="catalog-tools">
          <label className="search-box search-box--catalog"><span className="sr-only">Buscar proyectos</span><Search size={19} /><input value={query} onChange={(event) => { setQuery(event.target.value); setIntent("Todo"); setCategory("Todo"); setRecurringOnly(false); setShowAll(true); setVisibleCount(12); }} placeholder="Busca: pitch, currículum, invitación, video, automatización…" />{query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery("")}><X size={16} /></button>}</label>
          <p className="catalog-results" aria-live="polite"><strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? "proyecto encontrado" : "proyectos encontrados"}</p>
          <div className="catalog-contexts" aria-label="Filtrar por contexto"><button type="button" aria-pressed={intent === "Todo" && !recurringOnly} onClick={() => { setIntent("Todo"); setRecurringOnly(false); setVisibleCount(12); }}>Todos los contextos</button>{quickTypes.map((item) => <button type="button" key={item} aria-pressed={intent === item && !recurringOnly} onClick={() => { setIntent(item); setRecurringOnly(false); setVisibleCount(12); }}>{item}</button>)}<button className="catalog-contexts__recurring" type="button" aria-pressed={recurringOnly} onClick={exploreRecurring}><Repeat2 size={15} /> Recurrentes</button></div>
          <div className="category-tabs" aria-label="Filtrar por tipo">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setShowAll(true); setVisibleCount(12); }}><span>{item}</span><small>{categoryCounts[item]}</small></button>)}</div>
        </div>
        {visibleServices.length ? <div className="service-grid">{visibleServices.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <div className="empty-state"><Sparkles size={28} /><h3>No está en la lista. Mejor.</h3><p>Cuéntaselo a Chispita y vemos si cabe en 72 horas.</p><Link className="button button--purple" href={`/start?idea=${encodeURIComponent(query)}`}>Contar mi idea</Link></div>}
        {!isExploringCatalog && <button className="catalog-more" type="button" onClick={() => { setShowAll(true); setVisibleCount(12); }}>Ver los {services.length} proyectos <ArrowRight size={17} /></button>}
        {isExploringCatalog && remainingServices > 0 && <button className="catalog-more" type="button" onClick={() => setVisibleCount((current) => current + 12)}>Ver 12 más <span>· quedan {remainingServices}</span><ArrowRight size={17} /></button>}
      </section>

      <section className="faq" id="preguntas" aria-labelledby="faq-title">
        <div><p className="section-kicker">Sin letra chica rara</p><h2 id="faq-title">Preguntas que sí importan.</h2></div>
        <div className="faq__list">
          <details><summary>¿Las 72 horas corren desde que pago?</summary><p>Corren desde que el pago está confirmado y el brief tiene todo lo necesario. Antes de pagar ves el plazo comprometido.</p></details>
          <details><summary>¿Quién hace mi proyecto?</summary><p>Chispita te guía. Después, una persona del equipo Wiwo crea, revisa y aprueba cada entrega. Wiwo es el estudio detrás de Chizpa.</p></details>
          <details><summary>¿En qué moneda pago?</summary><p>El cobro es en dólares (USD), con Stripe. El precio de la ficha es el que pagas. No hay cotización escondida.</p></details>
          <details><summary>¿Puedo pedir cambios?</summary><p>Sí. Una ronda consolidada está incluida. Cambiar el objetivo o sumar entregables puede requerir otro proyecto.</p></details>
          <details><summary>¿Qué pasa si hay un problema de alcance o entrega?</summary><p>Escríbenos con tu código de pedido. Si el alcance no calza, lo decimos antes de cobrar. Si algo falla después, lo revisamos con el equipo.</p></details>
        </div>
      </section>

      <section className="chispireads-preview" aria-labelledby="reads-preview-title">
        <div className="chispireads-preview__heading">
          <div><p className="section-kicker"><BookOpen size={16} /> ChispiReads</p><h2 id="reads-preview-title">Guías que también muestran cómo trabajamos.</h2></div>
          <div><p>Elige un tema, mira el resultado y entra al proyecto que lo resuelve.</p><Link href="/chispireads">Leer todas las guías <ArrowRight size={17} /></Link></div>
        </div>
        <div className="chispireads-preview__grid">
          {featuredReads.map((article) => <article className="read-card" key={article.slug}>
            <Link className="read-card__art" href={`/chispireads/${article.slug}`} aria-label={`Leer ${article.title}`}><Image src={article.art} alt="" fill unoptimized sizes="(max-width: 780px) 100vw, 33vw" /></Link>
            <div className="read-card__copy"><span>{article.category} · {article.readTime}</span><h3><Link href={`/chispireads/${article.slug}`}>{article.title}</Link></h3><p>{article.dek}</p><Link className="read-card__link" href={`/chispireads/${article.slug}`}>Leer paso a paso <ArrowRight size={16} /></Link></div>
          </article>)}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta__copy">
          <p>Una cosa menos en tu cabeza.</p>
          <h2>Deja de postergarlo.<br /><span>Hazlo con Chizpa.</span></h2>
          <Link className="button button--orange" href="/start">Cuéntame qué necesitas <ArrowRight size={19} /></Link>
        </div>
      </section>

      <footer>
        <Wordmark />
        <p>Hecho en América con amor por <strong>Wiwo</strong>. Un estudio de personas, no un generador suelto.</p>
        <div><a href="#destacados">Proyectos</a><Link href="/chispireads">ChispiReads</Link><a href="#preguntas">Ayuda</a><Link href="/track">Mi pedido</Link></div>
        <small>© 2026 Chizpa.com · Precio en USD · Una ronda de ajustes incluida.</small>
      </footer>
    </main>
  );
}
