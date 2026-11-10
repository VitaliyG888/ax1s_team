"use client";

import { faq } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";

export function Faq() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="faq" ref={ref} className="section-pad border-t border-hairline">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <div data-reveal>
              <SectionIndex index="06" label="FAQ" />
            </div>
            <h2
              data-reveal
              className="mt-6 max-w-sm font-display text-4xl italic tracking-tight sm:text-5xl"
            >
              Без восклицаний.
            </h2>
            <p data-reveal className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Если ответа нет — три факта: жест, метрика, срок. Этого достаточно, чтобы ответить по смете.
            </p>
          </div>
          <ul className="lg:col-span-8">
            {faq.map((item) => (
              <li key={item.id} data-reveal className="border-t border-hairline last:border-b">
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-xl italic tracking-tight transition-colors duration-200 hover:text-accent-3 sm:text-2xl">
                    <span>{item.q}</span>
                    <span
                      className="mt-1 font-mono text-xs text-accent-2 transition-transform duration-300 group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                    {item.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
