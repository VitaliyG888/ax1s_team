"use client";

import { useSyncExternalStore } from "react";
import { essenceLabel, world } from "@/lib/world-store";

function subscribe(fn: () => void): () => void {
  return world.subscribe(fn);
}

function getSnapshot(): string {
  return essenceLabel[world.get().essence];
}

function getServerSnapshot(): string {
  return essenceLabel[0];
}

export function EssenceHint() {
  const label = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
      состояние формы:{" "}
      <span className="text-accent">{label}</span>
      <span className="ml-3 hidden sm:inline">тяни для упругости / коснись для метаморфозы</span>
    </p>
  );
}
