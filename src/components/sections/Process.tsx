"use client";

import { useEffect, useRef } from "react";
import { processSteps } from "@/data/process";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Process() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();
    if (prefersReducedMotion()) return;

    const steps = el.querySelectorAll<HTMLElement>("[data-step]");
    const ctx = gsap.context(() => {
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 45%",
          toggleClass: { targets: step, className: "is-active" },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="method" ref={root} className="section-pad border-t border-hairline">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <SectionIndex index="04" label="Партитура" />
            <h2 className="mt-6 max-w-md font-display text-4xl italic tracking-tight sm:text-5xl">
              Сначала камера. Потом пиксели.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Четыре такта от жеста до ночной стороны. SEO и производительность входят в партитуру, а не дописываются после вау.
            </p>
          </div>
          <ol className="lg:col-span-7">
            {processSteps.map((step) => (
              <li
                key={step.id}
                data-step
                className="group border-t border-hairline py-10 last:border-b"
              >
                <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
                  <span className="font-mono text-xs text-muted transition-colors duration-300 group-[.is-active]:text-accent">
                    /{step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl italic tracking-tight transition-colors duration-300 group-[.is-active]:text-accent-2 sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
