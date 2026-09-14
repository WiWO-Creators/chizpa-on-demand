import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Sparkles } from "lucide-react";
import { MarketingHeader, Wordmark } from "../components/marketing-header";
import { chispireads } from "../data/chispireads";

const SITE_URL = "https://chizpa.com";
const HUB_URL = `${SITE_URL}/chispireads`;
const HUB_DESCRIPTION = "Pasos, estructuras y checklists para crear presentaciones, videos, documentos y herramientas útiles. Aprende a hacerlo o hazlo con Chizpa.";

function categoryAnchor(category: string) {
  return category.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const metadata: Metadata = {
  title: "ChispiReads — Guías para hacer que las cosas pasen | Chizpa",
  description: HUB_DESCRIPTION,
  alternates: { canonical: HUB_URL },
  openGraph: {
    title: "ChispiReads — Guías para hacer que las cosas pasen",
    description: "Métodos claros y checklists útiles para convertir ideas en proyectos listos.",
    url: HUB_URL,
    siteName: "Chizpa.com",
    locale: "es_CL",
    images: [`${SITE_URL}/brand/chispita-laptop.webp`],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChispiReads — Guías para hacer que las cosas pasen",
    description: "Métodos claros y checklists útiles para convertir ideas en proyectos listos.",
    images: [`${SITE_URL}/brand/chispita-laptop.webp`],
  },
};

export default function ChispiReadsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ChispiReads",
    description: HUB_DESCRIPTION,
    url: HUB_URL,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: chispireads.map((article, index) => ({ "@type": "ListItem", position: index + 1, url: `${HUB_URL}/${article.slug}`, name: article.title })),
    },
  };

  return <main className="reads-page">
    <MarketingHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

    <section className="reads-hero">
      <div className="reads-hero__copy">
        <p className="section-kicker"><BookOpen size={16} /> ChispiReads</p>
        <h1>Guías para hacer que<br /><span>las cosas pasen.</span></h1>
        <p>Pasos, estructuras y checklists escritos para humanos. Úsalos para hacerlo tú o para llegar con un mejor brief a Chizpa.</p>
        <div className="reads-hero__promises"><span><Sparkles size={15} /> Respuestas directas</span><span><Sparkles size={15} /> Ejemplos concretos</span><span><Sparkles size={15} /> Sin relleno</span></div>
      </div>
      <div className="reads-hero__art" aria-hidden="true"><span>Lee. Haz. Repite.</span><Image src="/brand/chispita-laptop.webp" alt="" fill unoptimized sizes="(max-width: 780px) 84vw, 440px" /></div>
    </section>

    <section className="reads-index" aria-labelledby="reads-index-title">
      <div className="reads-index__heading"><div><p className="section-kicker">Biblioteca práctica</p><h2 id="reads-index-title">Elige algo que quieras<br />dejar listo.</h2></div><p>Las mismas decisiones que usamos para producir proyectos, explicadas en pasos claros para que puedas aplicarlas desde hoy.</p></div>
      <nav className="reads-topics" aria-label="Temas de ChispiReads"><a href="#presentaciones">Presentaciones</a><a href="#videos">Videos</a><a href="#documentos">Documentos</a><a href="#automatizacion">Automatización</a><a href="#diseno">Diseño</a></nav>
      <div className="reads-grid">
        {chispireads.map((article, index) => {
          const isFirstInCategory = chispireads.findIndex((candidate) => candidate.category === article.category) === index;
          return <article className={`read-card read-card--${article.accent}`} id={isFirstInCategory ? categoryAnchor(article.category) : undefined} key={article.slug}>
            <Link className="read-card__art" href={`/chispireads/${article.slug}`} aria-label={`Leer ${article.title}`}><Image src={article.art} alt="" fill unoptimized sizes="(max-width: 780px) 100vw, 33vw" /><span>{article.category}</span></Link>
            <div className="read-card__copy"><span><Clock3 size={14} /> {article.readTime} · Actualizado</span><h2><Link href={`/chispireads/${article.slug}`}>{article.title}</Link></h2><p>{article.dek}</p><Link className="read-card__link" href={`/chispireads/${article.slug}`}>Leer paso a paso <ArrowRight size={16} /></Link></div>
          </article>;
        })}
      </div>
    </section>

    <section className="reads-do-it">
      <div><p className="section-kicker">Dos caminos, cero drama</p><h2>Aprende a hacerlo.<br /><span>O hazlo con Chizpa.</span></h2><p>Si ya tienes una idea, materiales o incluso un borrador desordenado, Chizpita arma el plan y te dice cuánto cuesta antes de pagar.</p><Link className="button button--orange" href="/start">Armar mi plan <ArrowRight size={18} /></Link></div>
      <div className="reads-do-it__art"><Image src="/brand/chispita-point.webp" alt="Chizpita listo para ayudarte a comenzar" fill unoptimized sizes="360px" /></div>
    </section>

    <footer><Wordmark /><p>Hecho en América con amor por <strong>Wiwo</strong>.</p><div><Link href="/#proyectos">Proyectos</Link><Link href="/chispireads">ChispiReads</Link><Link href="/track">Mi pedido</Link></div><small>© 2026 Chizpa.com · Guías útiles. Proyectos reales.</small></footer>
  </main>;
}
