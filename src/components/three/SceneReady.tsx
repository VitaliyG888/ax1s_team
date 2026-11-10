"use client";

import { useEffect } from "react";
import { lockScene, markSceneReady } from "@/lib/scroll-gate";
import { prefersReducedMotion } from "@/lib/motion";

export function SceneLock() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      markSceneReady();
      return;
    }
    lockScene();
    const timer = window.setTimeout(markSceneReady, 1600);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}

export function paintThen(ready: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(ready);
  });
}
