"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LoaderPhase = "visible" | "leaving" | "hidden";

function revealVisible() {
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((target) => {
    target.classList.add("is-revealed");
  });
}

export function ExperienceLayer() {
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("visible");
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("chizpa-ready") === "1";
    const leaveAfter = seen || reducedMotion ? 40 : 280;
    const hideAfter = seen || reducedMotion ? 90 : 520;

    document.body.classList.add("is-preloading");
    const leaveTimer = window.setTimeout(() => setLoaderPhase("leaving"), leaveAfter);
    const hideTimer = window.setTimeout(() => {
      setLoaderPhase("hidden");
      document.body.classList.remove("is-preloading");
      document.documentElement.classList.add("motion-ready");
      window.sessionStorage.setItem("chizpa-ready", "1");
      revealVisible();
    }, hideAfter);

    const observer = new MutationObserver(revealVisible);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pageshow", revealVisible);
    revealVisible();

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
      window.removeEventListener("pageshow", revealVisible);
      observer.disconnect();
      document.body.classList.remove("is-preloading");
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
          <strong>Chizpita está ordenando la cancha.</strong>
          <div className="chizpa-loader__bar" aria-hidden="true"><i /></div>
        </div>
      )}
      <div ref={auraRef} className="cursor-aura" aria-hidden="true" />
      <div className="page-grain" aria-hidden="true" />
    </>
  );
}
