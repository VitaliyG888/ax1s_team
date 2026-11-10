"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { isSceneReady, subscribeSceneReady } from "@/lib/scroll-gate";
import { world } from "@/lib/world-store";

type LenisContextValue = {
  scrollTo: (target: string | number | HTMLElement) => void;
};

const LenisContext = createContext<LenisContextValue>({
  scrollTo: () => undefined,
});

export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();

    if (prefersReducedMotion()) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      autoRaf: false,
    });

    lenisRef.current = instance;
    instance.on("scroll", (e: { progress: number; velocity: number }) => {
      world.patch({
        scroll: typeof e.progress === "number" ? e.progress : 0,
        scrollVelocity: typeof e.velocity === "number" ? e.velocity : 0,
      });
      ScrollTrigger.update();
    });

    if (!isSceneReady()) {
      instance.stop();
    }

    const unsub = subscribeSceneReady(() => {
      instance.start();
      ScrollTrigger.refresh();
    });

    const ticker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      unsub();
      gsap.ticker.remove(ticker);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  const value = useMemo<LenisContextValue>(
    () => ({
      scrollTo: (target) => {
        const current = lenisRef.current;
        if (current) {
          current.scrollTo(target, { offset: 0, duration: 1.1 });
          return;
        }
        if (typeof target === "string") {
          document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
        }
      },
    }),
    [],
  );

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
