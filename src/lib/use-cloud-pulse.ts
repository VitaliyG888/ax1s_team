"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { world, type Essence } from "@/lib/world-store";

export type PulseValues = {
  expansion: number; // -0.4 to +1.0
  glow: number;      // 0.0 to 1.0
  distortion: number;// 0.0 to 1.0
};

export function useCloudPulseTimeline() {
  const values = useRef<PulseValues>({
    expansion: 0,
    glow: 0,
    distortion: 0,
  });

  useEffect(() => {
    if (prefersReducedMotion()) {
      world.patch({ pulseExpansion: 0, pulseGlow: 0 });
      return;
    }

    registerGsap();

    const proxy = {
      expansion: 0,
      glow: 0,
      distortion: 0,
    };

    // Ровно 5-секундный дыхательный цикл пульсации:
    // 1.8 с вдох (расширение) -> 1.8 с выдох (сжатие) -> 1.4 с возврат в покой = ровно 5.0 с
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "sine.inOut" },
      onRepeat: () => {
        if (document.hidden) return;
        const snap = world.get();
        if (snap.dragging) return;
        const next = ((snap.essence + 1) % 4) as Essence;
        world.patch({ essence: next, burst: 1 });
        if (typeof document !== "undefined") {
          document.documentElement.dataset.essence = String(next);
        }
      },
    });

    tl.to(proxy, {
      expansion: 0.85,
      glow: 0.9,
      distortion: 0.7,
      duration: 1.8,
      ease: "sine.inOut",
      onUpdate: () => {
        values.current.expansion = proxy.expansion;
        values.current.glow = proxy.glow;
        values.current.distortion = proxy.distortion;
        world.patch({
          pulseExpansion: proxy.expansion,
          pulseGlow: proxy.glow,
        });
      },
    })
      .to(proxy, {
        expansion: -0.35,
        glow: 0.4,
        distortion: 0.95,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          values.current.expansion = proxy.expansion;
          values.current.glow = proxy.glow;
          values.current.distortion = proxy.distortion;
          world.patch({
            pulseExpansion: proxy.expansion,
            pulseGlow: proxy.glow,
          });
        },
      })
      .to(proxy, {
        expansion: 0.0,
        glow: 0.1,
        distortion: 0.2,
        duration: 1.4,
        ease: "sine.out",
        onUpdate: () => {
          values.current.expansion = proxy.expansion;
          values.current.glow = proxy.glow;
          values.current.distortion = proxy.distortion;
          world.patch({
            pulseExpansion: proxy.expansion,
            pulseGlow: proxy.glow,
          });
        },
      });

    const onVis = () => {
      if (document.hidden) {
        tl.pause();
      } else {
        tl.resume();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      tl.kill();
    };
  }, []);

  return values;
}
