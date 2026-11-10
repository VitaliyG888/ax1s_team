"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { isSceneReady, subscribeSceneReady } from "@/lib/scroll-gate";

/**
 * Хук для вступительной анимации появления заголовка и элементов первого экрана
 * (срабатывает синхронно с готовностью 3D-сцены)
 */
export function useHeroIntro<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();

    const nodes = el.querySelectorAll<HTMLElement>("[data-hero]");
    if (prefersReducedMotion()) {
      nodes.forEach((node) => {
        node.style.opacity = "1";
        node.style.transform = "none";
      });
      return;
    }

    let ctx: ReturnType<typeof gsap.context> | null = null;

    const play = () => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          nodes,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.09,
            ease: "expo.out",
            delay: 0.12,
          },
        );
      }, el);
    };

    if (isSceneReady()) {
      play();
      return () => ctx?.revert();
    }

    const unsub = subscribeSceneReady(play);
    return () => {
      unsub();
      ctx?.revert();
    };
  }, []);

  return ref;
}
