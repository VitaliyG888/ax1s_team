"use client";

import Image from "next/image";
import { projects } from "@/data/projects";
import { Container } from "@/components/ui/Container";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { useReveal } from "@/lib/use-reveal";

export function Work() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="work" ref={ref} className="relative section-pad overflow-hidden border-t border-hairline">
      <div className="field-wash opacity-40" aria-hidden="true" />
      <Container className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div data-reveal>
              <SectionIndex index="02" label="Кейсы" />
            </div>
            <h2
              data-reveal
              data-blob-touch
              className="mt-6 max-w-xl font-display text-4xl italic tracking-tight sm:text-5xl"
            >
              Задача. Механика. Цифра.
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-sm leading-relaxed text-muted">
            Сюрреализм здесь — метод, не костюм. Каждая сцена меняет поведение бренда, а не декорацию вокруг него.
          </p>
        </div>

        <ul className="mt-16 space-y-24 lg:space-y-32">
          {projects.map((project, i) => (
            <li key={project.id} data-reveal>
              <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={i % 2 === 1 ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
                  <div
                    className="group relative overflow-hidden dream-card"
                    data-cursor
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        unoptimized
                        className="project-shot object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1 lg:col-span-5" : "lg:col-span-5"}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                    /{project.index} · {project.year} · {project.essence}
                  </p>
                  <h3 className="mt-4 font-display text-3xl italic tracking-tight sm:text-4xl">
                    {project.title}
                  </h3>
                  <dl className="mt-6 space-y-4 text-sm leading-relaxed sm:text-base">
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-2">
                        Задача
                      </dt>
                      <dd className="mt-1 text-muted">{project.task}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-2">
                        Механика
                      </dt>
                      <dd className="mt-1 text-muted">{project.mechanic}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-2">
                        Результат
                      </dt>
                      <dd className="mt-1 text-foreground">{project.result}</dd>
                    </div>
                  </dl>
                  <p className="mt-6 font-display text-2xl italic text-accent-3">
                    {project.metric}
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {project.stack.join("  ·  ")}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
