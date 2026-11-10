"use client";

import { site } from "@/data/site";
import { reasons } from "@/data/reasons";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { useHeroIntro } from "@/lib/use-hero-intro";
import { EssenceHint } from "@/components/ui/EssenceHint";
import { RelicHitbox } from "@/components/ui/RelicHitbox";

export function Hero() {
  const ref = useHeroIntro<HTMLElement>();

  return (
    <section
      id="top"
      ref={ref}
      className="pointer-events-none relative isolate flex min-h-dvh flex-col justify-end overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/55 to-background/10 lg:via-background/28 lg:to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
      <RelicHitbox />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[88rem] px-5 pb-8 pt-28 sm:px-8 lg:px-12 lg:pb-10">
        <p
          data-hero
          data-blob-touch
          className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.32em] text-muted"
        >
          {site.name} / {site.availabilityShort}
        </p>
        <h1
          data-hero
          data-blob-touch
          className="pointer-events-auto mt-6 max-w-5xl font-display text-[clamp(3rem,9vw,8.2rem)] font-normal italic leading-[0.88] tracking-[-0.03em] text-foreground"
        >
          Форма врёт.
          <br />
          <span className="not-italic text-muted">Бренд остаётся.</span>
        </h1>
        <p
          data-hero
          data-blob-touch
          className="pointer-events-auto mt-8 max-w-md text-base leading-relaxed text-muted sm:text-lg"
        >
          AX1S_TEAM собирает иммерсивные сайты, где WebGL-объект несёт идентичность,
          а не фон. Сюрреалистическая механика. Индексируемый DOM.
        </p>
        <div data-hero className="pointer-events-auto mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <MagneticLink
            href="#contact"
            className="cta-pulse inline-flex min-h-12 w-fit items-center justify-center border border-accent-2 bg-accent-2 px-7 font-mono text-xs uppercase tracking-[0.22em] text-on-accent transition-opacity hover:opacity-90"
          >
            Написать AX1S_TEAM
          </MagneticLink>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Нажмите, чтобы открыть форму. Три факта: жест, метрика, срок — этого достаточно для сметы 3D-сайта.
          </p>
        </div>
        <div
          data-hero
          className="pointer-events-auto mt-10 flex flex-col gap-4 border-t border-hairline/70 pt-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <EssenceHint />
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="live-dot size-1.5 rounded-full bg-accent" />
            {site.availability}
          </p>
        </div>

        <div data-hero className="pointer-events-auto mt-8 border-t border-hairline/70 pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Почему AX1S_TEAM для иммерсивного 3D-сайта
          </h2>
          <ul className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {reasons.map((reason) => (
              <li key={reason.id}>
                <article>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-2">
                    /{reason.index}
                  </p>
                  <h3 className="mt-2 font-display text-xl italic tracking-tight sm:text-2xl">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{reason.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
