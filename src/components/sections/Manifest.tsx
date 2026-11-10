"use client";

import { manifesto } from "@/data/manifest";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";

export function Manifest() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="manifest" ref={ref} className="section-pad">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div data-reveal>
              <SectionIndex index="01" label={manifesto.kicker} />
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2
              data-reveal
              data-blob-touch
              className="max-w-3xl font-display text-4xl italic leading-[1.05] tracking-tight sm:text-6xl"
            >
              {manifesto.heading}
            </h2>
            <div className="mt-10 max-w-2xl space-y-6">
              {manifesto.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  data-reveal
                  className="text-base leading-relaxed text-muted sm:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
