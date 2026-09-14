"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LoaderPhase = "visible" | "leaving" | "hidden";

const listeners = new Set<(phase: LoaderPhase) => void>();
let loaderPhase: LoaderPhase = "visible";
let loaderBooted = false;

function revealVisible() {
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((target) => {
    target.classList.add("is-revealed");
  });
}

function finishLoader() {
  if (loaderPhase === "hidden") return;
  loaderPhase = "hidden";
  document.body.classList.remove("is-preloading");
  document.documentElement.classList.add("motion-ready");
  try {
    window.sessionStorage.setItem("chizpa-ready", "1");
  } catch {
    /* ignore */
  }
  revealVisible();
  listeners.forEach((fn) => fn("hidden"));
}

function bootLoader() {
  if (loaderBooted) return;
  loaderBooted = true;

  try {
    if (window.sessionStorage.getItem("chizpa-ready") === "1") {
      finishLoader();
      return;
    }
  } catch {
    /* continue with a short splash */
  }

  document.body.classList.add("is-preloading");
  window.setTimeout(() => {
    if (loaderPhase === "hidden") return;
    loaderPhase = "leaving";
    listeners.forEach((fn) => fn("leaving"));
  }, 900);
  window.setTimeout(finishLoader, 1400);
}

export function ExperienceLayer() {
  const [phase, setPhase] = useState<LoaderPhase>(loaderPhase);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bootLoader();
    setPhase(loaderPhase);
    listeners.add(setPhase);

    const observer = new MutationObserver(revealVisible);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pageshow", revealVisible);
    if (loaderPhase === "hidden") revealVisible();

    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      listeners.delete(setPhase);
      observer.disconnect();
      window.removeEventListener("pageshow", revealVisible);
      window.removeEventListener("pointermove", trackPointer);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {phase !== "hidden" && (
        <div
          className={`chizpa-loader${phase === "leaving" ? " is-leaving" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Preparando Chizpa.com"
          onClick={finishLoader}
        >
          <div className="chizpa-loader__spark" aria-hidden="true"><i /><i /><i /></div>
          <div className="chizpa-loader__character">
            <Image src="/brand/chispita-meditate.webp" alt="" width={280} height={280} priority unoptimized />
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
