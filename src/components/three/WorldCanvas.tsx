"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";
import { useWebGLEnabled } from "@/lib/use-webgl";
import { markSceneReady } from "@/lib/scroll-gate";
import { world } from "@/lib/world-store";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("WebGL Canvas encountered an error, falling back to CSS poster:", error);
    markSceneReady();
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const World = dynamic(() => import("@/components/three/World"), { ssr: false });

export function WorldCanvas() {
  const webgl = useWebGLEnabled();
  const [tabVisible, setTabVisible] = useState(true);
  const [canvasFailed, setCanvasFailed] = useState(false);

  useEffect(() => {
    if (!webgl) markSceneReady();
  }, [webgl]);

  // Приостановка рендера при неактивной вкладке браузера (экономия батареи и GPU)
  useEffect(() => {
    const onVis = () => {
      const v = document.visibilityState === "visible";
      setTabVisible(v);
      world.patch({ inView: v });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Отслеживание курсора/указателя по всей площади экрана
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      world.patch({
        mouseX: (event.clientX / window.innerWidth) * 2 - 1,
        mouseY: (event.clientY / window.innerHeight) * -2 + 1,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Синхронизация скролла и расчет мгновенной скорости прокрутки вдоль всего документа
  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();

    let lastY = window.scrollY;
    let lastTime = performance.now();

    const onNativeScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = window.scrollY - lastY;
      const v = (dy / dt) * 16.67;
      lastY = window.scrollY;
      lastTime = now;

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      world.patch({
        scroll: progress,
        scrollVelocity: v,
      });
    };

    window.addEventListener("scroll", onNativeScroll, { passive: true });

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        world.patch({
          scroll: self.progress,
          scrollVelocity: self.getVelocity() || 0,
        });
      },
    });

    return () => {
      window.removeEventListener("scroll", onNativeScroll);
      trigger.kill();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <div className={cn("scene-poster hero-poster", webgl && !canvasFailed && "will-fade")}>
        <div className="dream-poster-cloud" />
      </div>
      <div className="hero-sky" />
      <div className="pointer-events-none absolute inset-0">
        {webgl && tabVisible && !canvasFailed ? (
          <CanvasErrorBoundary onError={() => setCanvasFailed(true)}>
            <World />
          </CanvasErrorBoundary>
        ) : null}
      </div>
    </div>
  );
}
