"use client";

import { services } from "@/data/services";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";

export function Practices() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="practices" ref={ref} className="section-pad border-t border-hairline">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <div data-reveal>
              <SectionIndex index="03" label="Практики" />
            </div>
            <h2
              data-reveal
              className="mt-6 max-w-sm font-display text-4xl italic tracking-tight sm:text-5xl"
            >
              Через результат, не через процесс.
            </h2>
            <p data-reveal className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              AX1S_TEAM продаёт не «услуги 3D». Продаёт поведение бренда в браузере и цифру после релиза.
            </p>
          </div>
          <ul className="lg:col-span-8">
            {services.map((service) => (
              <li
                key={service.id}
                data-reveal
                className="group border-t border-hairline py-8 last:border-b lg:py-10"
                data-cursor
              >
                <article className="grid gap-4 transition-transform duration-300 ease-out group-hover:translate-x-2 sm:grid-cols-[4.5rem_1fr]">
                  <span className="font-mono text-xs text-accent-2">/{service.index}</span>
                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                      <h3 className="font-display text-2xl italic tracking-tight sm:text-3xl">
                        {service.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                        {service.outcome}
                      </p>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                      {service.body}
                    </p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      {service.stack.join("  ·  ")}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
