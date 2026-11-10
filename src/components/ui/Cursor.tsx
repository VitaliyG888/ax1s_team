"use client";

import { useEffect, useRef } from "react";
import { useDesktopPointer } from "@/lib/use-desktop";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Кастомный интерактивный курсор с пружинным кольцом слежения (для десктопных устройств)
 */
export function Cursor() {
  const desktop = useDesktopPointer();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!desktop || reduced) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let hover = false;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target;
      hover =
        target instanceof HTMLElement &&
        Boolean(target.closest("a, button, input, textarea, select, [data-cursor]"));
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${hover ? 1.85 : 1})`;
      r.style.opacity = hover ? "0.55" : "1";
      raf = requestAnimationFrame(tick);
    };

    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [desktop, reduced]);

  if (!desktop || reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true">
      <div
        ref={dot}
        className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
      <div
        ref={ring}
        className="absolute top-0 left-0 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-2/80"
      />
    </div>
  );
}
