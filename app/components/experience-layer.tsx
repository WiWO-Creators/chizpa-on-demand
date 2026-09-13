"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LoaderPhase = "visible" | "leaving" | "hidden";

export function ExperienceLayer() {
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("visible");
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveAfter = reducedMotion ? 100 : 520;
    const hideAfter = reducedMotion ? 180 : 900;

    document.documentElement.classList.add("motion-ready");
    document.body.classList.add("is-preloading");
    const leaveTimer = window.setTimeout(() => setLoaderPhase("leaving"), leaveAfter);
    const hideTimer = window.setTimeout(() => {
      setLoaderPhase("hidden");
      document.body.classList.remove("is-preloading");
    }, hideAfter);

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    revealTargets.forEach((target) => observer.observe(target));

    let frame = 0;
    const canTrackPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion;
    const trackPointer = (event: PointerEvent) => {
      if (!canTrackPointer) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        auraRef.current?.style.setProperty("transform", `translate3d(${event.clientX - 120}px,${event.clientY - 120}px,0)`);
      });
    };
    window.addEventListener("pointermove", trackPointer, { passive: true });

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", trackPointer);
      observer.disconnect();
      document.body.classList.remove("is-preloading");
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return (
    <>
      {loaderPhase !== "hidden" && (
        <div className={`chizpa-loader${loaderPhase === "leaving" ? " is-leaving" : ""}`} role="status" aria-live="polite" aria-label="Preparando Chizpa.com">
          <div className="chizpa-loader__spark" aria-hidden="true"><i /><i /><i /></div>
          <div className="chizpa-loader__character">
            <Image src="/brand/chispita-meditate.webp" alt="" fill priority unoptimized sizes="260px" />
            <span className="chizpa-loader__gem" aria-hidden="true" />
          </div>
          <p>Un segundo.</p>
          <strong>Chispita está ordenando la cancha.</strong>
          <div className="chizpa-loader__bar" aria-hidden="true"><i /></div>
        </div>
      )}
      <div ref={auraRef} className="cursor-aura" aria-hidden="true" />
      <div className="page-grain" aria-hidden="true" />
    </>
  );
}
