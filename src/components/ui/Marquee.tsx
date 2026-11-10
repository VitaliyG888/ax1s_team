"use client";

import { cn } from "@/lib/cn";

const items = [
  "AX1S_TEAM",
  "текучесть",
  "подмена масштаба",
  "сокрытие",
  "двойной свет",
  "WebGL-облако",
  "индексируемый DOM",
];

const dots = [
  "bg-violet",
  "bg-teal",
  "bg-coral",
  "bg-gold",
  "bg-crimson",
  "bg-indigo",
];

export function Marquee() {
  const line = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-hairline py-5"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max gap-12">
        {line.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-12 font-display text-3xl italic tracking-tight text-foreground/80 sm:text-5xl"
          >
            {item}
            <span
              className={cn(
                "inline-block size-1.5 rounded-full",
                dots[i % dots.length],
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
