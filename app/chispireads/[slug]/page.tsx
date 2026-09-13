import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Sparkles } from "lucide-react";
import { MarketingHeader, Wordmark } from "../../components/marketing-header";
import { chispireads, getChispiRead } from "../../data/chispireads";
import { services } from "../../data/services";

type ArticlePageProps = { params: Promise<{ slug: string }> };
const SITE_URL = "https://chizpa.com";
const HUB_URL = `${SITE_URL}/chispireads`;

export function generateStaticParams() {
  return chispireads.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getChispiRead(slug);
  if (!article) return {};
  const canonical = `${HUB_URL}/${article.slug}`;
  const image = `${SITE_URL}${article.art}`;
  return {
    title: `${article.seoTitle} | ChispiReads`,
    description: article.description,
    authors: [{ name: "Equipo Wiwo", url: "https://wiwo.me" }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.seoTitle,
      description: article.description,
      url: canonical,
      siteName: "Chizpa.com",
      locale: "es_CL",
      publishedTime: article.updatedAt,
      modifiedTime: article.updatedAt,
      authors: ["Equipo Wiwo"],
      images: [{ url: image, alt: article.title }],
    },
    twitter: { card: "summary_large_image", title: article.seoTitle, description: article.description, images: [image] },
  };
}

export default async function ChispiReadArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getChispiRead(slug);
  if (!article) notFound();
  const service = services.find((item) => item.id === article.serviceId);
  if (!service) notFound();
  const relatedCandidates = chispireads.filter((item) => item.slug !== article.slug);
  const related = [
    ...relatedCandidates.filter((item) => item.category === article.category),
    ...relatedCandidates.filter((item) => item.category !== article.category),
  ].slice(0, 3);
  const canonical = `${HUB_URL}/${article.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    url: canonical,
    headline: article.title,
    description: article.description,
    image: `${SITE_URL}${article.art}`,
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
    inLanguage: "es",
    author: { "@type": "Organization", name: "Equipo Wiwo", url: "https://wiwo.me" },
    publisher: { "@type": "Organization", name: "Chizpa.com", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/chizpa-logo-flat.png` } },
    mainEntityOfPage: canonical,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Chizpa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ChispiReads", item: HUB_URL },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.title,
    description: article.description,
    inLanguage: "es",
    step: article.sections.map((section, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: section.heading.replace(/^\d+\.\s*/, ""),
      text: section.paragraphs.join(" "),
      url: `${canonical}#paso-${index + 1}`,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <main className="article-page">
    <MarketingHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

    <header className={`article-hero article-hero--${article.accent}`}>
      <div className="article-hero__copy">
        <nav className="article-breadcrumb" aria-label="Migas de pan"><Link href="/">Chizpa</Link><span>/</span><Link href="/chispireads">ChispiReads</Link><span>/</span><span>{article.category}</span></nav>
        <p className="section-kicker"><BookOpen size={16} /> {article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.dek}</p>
        <div className="article-meta"><span><Clock3 size={15} /> {article.readTime}</span><span>Actualizado el {new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${article.updatedAt}T00:00:00Z`))}</span><span>Por Equipo Wiwo</span></div>
      </div>
      <div className="article-hero__art" aria-hidden="true"><Image src={article.art} alt="" fill unoptimized sizes="(max-width: 780px) 88vw, 440px" /><span className="status-gem" /></div>
    </header>

    <div className="article-layout">
      <aside className="article-toc"><Link href="/chispireads"><ArrowLeft size={15} /> Todas las guías</Link><strong>En esta guía</strong><ol>{article.sections.map((section, index) => <li key={section.heading}><a href={`#paso-${index + 1}`}>{section.heading.replace(/^\d+\.\s*/, "")}</a></li>)}</ol><Link className="article-toc__cta" href={`/start?service=${service.id}`}>Prefiero chizarlo <ArrowRight size={15} /></Link></aside>

      <article className="article-body">
        <section className="article-short-answer" aria-labelledby="short-answer-title"><span><Sparkles size={20} /></span><div><p>Chispita en corto</p><h2 id="short-answer-title">Lo importante antes de empezar</h2>{article.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>

        <section className="article-takeaways" aria-label="Qué vas a conseguir"><h2>Cuando termines tendrás</h2><ul>{article.takeaways.map((takeaway) => <li key={takeaway}><Check size={17} /> {takeaway}</li>)}</ul></section>

        {article.sections.map((section, index) => <section className="article-section" id={`paso-${index + 1}`} key={section.heading}><span className="article-section__number">{String(index + 1).padStart(2, "0")}</span><h2>{section.heading.replace(/^\d+\.\s*/, "")}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}><Check size={16} /> {bullet}</li>)}</ul>}{section.tip && <aside><strong>ChispiTip</strong><p>{section.tip}</p></aside>}</section>)}

        <section className="article-checklist"><div><p className="section-kicker">Checklist final</p><h2>Antes de darlo por listo</h2></div><ul>{article.takeaways.concat(["El objetivo se entiende sin contexto extra", "La entrega está pensada para su audiencia", "El siguiente paso está claro"]).map((item) => <li key={item}><span><Check size={15} /></span>{item}</li>)}</ul></section>

        <section className="article-service-cta"><div><p className="section-kicker">¿Ya tienes los materiales?</p><h2>Hazlo tú.<br />O hazlo con Chizpa.</h2><p>{service.description} Recibe {service.result.toLocaleLowerCase("es")} en hasta {service.hours} horas.</p><Link className="button button--orange" href={`/start?service=${service.id}`}>Chizar {service.shortTitle} · US${service.price} <ArrowRight size={18} /></Link></div><div><Image src="/brand/chispita-point.webp" alt="Chispita señalando el siguiente paso" fill unoptimized sizes="300px" /></div></section>

        <section className="article-faq" aria-labelledby="article-faq-title"><p className="section-kicker">Preguntas frecuentes</p><h2 id="article-faq-title">Lo que normalmente preguntan.</h2>{article.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
      </article>
    </div>

    <section className="related-reads"><div><p className="section-kicker">Sigue leyendo</p><h2>Otra cosa que puedes<br />dejar mejor hoy.</h2></div><div className="related-reads__grid">{related.map((item) => <article key={item.slug}><span>{item.category} · {item.readTime}</span><h3><Link href={`/chispireads/${item.slug}`}>{item.title}</Link></h3><Link href={`/chispireads/${item.slug}`}>Leer guía <ArrowRight size={15} /></Link></article>)}</div></section>

    <footer><Wordmark /><p>Hecho en América con amor por <strong>Wiwo</strong>.</p><div><Link href="/#proyectos">Proyectos</Link><Link href="/chispireads">ChispiReads</Link><Link href="/track">Mi pedido</Link></div><small>© 2026 Chizpa.com · Guías útiles. Proyectos reales.</small></footer>
  </main>;
}
