"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.display = "none";
      return;
    }

    registerGsap();
    const line = el.querySelector("[data-intro-line]");
    const mark = el.querySelector("[data-intro-mark]");
    const panel = el.querySelector("[data-intro-panel]");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          el.style.display = "none";
        },
      });
      tl.fromTo(mark, { y: 18, opacity: 0, letterSpacing: "0.6em" }, { y: 0, opacity: 1, letterSpacing: "0.42em", duration: 0.7 })
        .fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, transformOrigin: "left center" },
          "<0.12",
        )
        .to(mark, { y: -12, opacity: 0, duration: 0.4 }, "+=0.32")
        .to(line, { scaleX: 0, transformOrigin: "right center", duration: 0.45 }, "<")
        .to(panel, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.1");
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      aria-hidden="true"
    >
      <div data-intro-panel className="absolute inset-0 bg-background">
        <div className="flex h-full flex-col items-center justify-center gap-6">
          <p
            data-intro-mark
            className="font-mono text-xs uppercase tracking-[0.42em] text-foreground"
          >
            {site.name}
          </p>
          <span
            data-intro-line
            className="h-px w-40 origin-left scale-x-0 bg-[linear-gradient(90deg,var(--c-violet),var(--c-teal),var(--c-coral))]"
          />
        </div>
      </div>
    </div>
  );
}
