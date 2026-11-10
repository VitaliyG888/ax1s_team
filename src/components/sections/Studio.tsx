"use client";

import { metrics } from "@/data/metrics";
import { skillCloud } from "@/data/skills";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";
import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export function Studio() {
  const ref = useReveal<HTMLElement>();
  const numbers = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    registerGsap();
    const els = numbers.current.filter(Boolean);
    if (!els.length) return;

    if (prefersReducedMotion()) {
      els.forEach((el, i) => {
        el.textContent = String(metrics[i].value);
      });
      return;
    }

    const ctx = gsap.context(() => {
      els.forEach((el, i) => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: metrics[i].value,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="studio" ref={ref} className="section-pad border-t border-hairline">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <SectionIndex index="05" label="Студия" />
            </div>
            <h2
              data-reveal
              className="mt-6 font-display text-4xl italic tracking-tight sm:text-5xl"
            >
              {site.name} как авторский юнит.
            </h2>
            <div data-reveal className="mt-6 max-w-md space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                Не агентство с аккаунт-менеджерами и не «команда профессионалов». Юнит, где сцена, шейдер и текст пишутся одним голосом. Стек — Next.js, R3F, GSAP, Lenis. Отличие — 3D несёт бренд, поиск видит смысл.
              </p>
              <p>
                Мы не цитируем Дали. Мы переводим текучесть в деформацию, подмену — в morph, сокрытие — в progressive disclosure. Если после скролла остаётся только декорация, сцена не состоялась.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <ul className="grid gap-px bg-hairline sm:grid-cols-2">
              {metrics.map((metric, i) => (
                <li
                  key={metric.id}
                  className="bg-surface/85 p-8 transition-colors duration-300 hover:bg-surface-raised"
                >
                  <p className="font-display text-5xl italic tracking-tight text-accent-2 sm:text-6xl">
                    {metric.prefix ?? ""}
                    <span
                      ref={(node) => {
                        if (node) numbers.current[i] = node;
                      }}
                    >
                      0
                    </span>
                    {metric.suffix}
                  </p>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{metric.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-16 flex max-w-4xl flex-wrap gap-x-5 gap-y-3" data-reveal>
          {skillCloud.map((skill) => (
            <li
              key={skill}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors duration-200 hover:text-accent-3"
            >
              {skill}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
