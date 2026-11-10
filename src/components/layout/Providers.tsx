"use client";

import { LenisProvider } from "@/lib/lenis";
import { Cursor } from "@/components/ui/Cursor";
import { Intro } from "@/components/ui/Intro";
import { Noise } from "@/components/ui/Noise";
import { SceneLock } from "@/components/three/SceneReady";
import { WorldCycle } from "@/components/three/WorldCycle";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <SceneLock />
      <WorldCycle />
      <Intro />
      <Cursor />
      <Noise />
      {children}
    </LenisProvider>
  );
}
