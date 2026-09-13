"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return <Link className={`wordmark${compact ? " wordmark--compact" : ""}`} href="/" aria-label="Chizpa.com, inicio">chizpa<span>.com</span><i aria-hidden="true"><b /><b /><b /></i></Link>;
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, []);

  const close = () => setOpen(false);

  return <header className={`site-header${open ? " is-menu-open" : ""}`}>
    <Wordmark compact />
    <button className="site-header__menu" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    <nav id="site-navigation" aria-label="Navegación principal">
      <Link href="/#proyectos" onClick={close}>Proyectos</Link>
      <Link href="/#recurrentes" onClick={close}>Recurrentes</Link>
      <Link href="/#como-comprar" onClick={close}>Cómo comprar</Link>
      <Link href="/chispireads" onClick={close}>ChispiReads</Link>
      <Link className="site-header__order" href="/track" onClick={close}>Mi pedido</Link>
      <Link className="site-header__nav-cta" href="/start" onClick={close}>Cuéntame qué necesitas <ArrowRight size={16} /></Link>
    </nav>
    <Link className="button button--orange button--small site-header__cta" href="/start" onClick={close}><span className="site-header__cta-long">Cuéntame qué necesitas</span><span className="site-header__cta-short">Empezar</span><ArrowRight size={16} /></Link>
  </header>;
}
