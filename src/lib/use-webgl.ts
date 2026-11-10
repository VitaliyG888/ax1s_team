"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

let cachedTier: "high" | "low" | "none" | null = null;

export function detectDeviceTier(): "high" | "low" | "none" {
  if (typeof window === "undefined") return "high";
  if (cachedTier !== null) return cachedTier;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { powerPreference: "default" }) ||
      canvas.getContext("webgl", { powerPreference: "default" });

    if (!gl) {
      cachedTier = "none";
      return "none";
    }

    // Эвристика слабых устройств: мало ядер CPU или малый объём памяти RAM
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;

    if (cores <= 2 || memory <= 2) {
      cachedTier = "low";
      return "low";
    }

    cachedTier = "high";
    return "high";
  } catch {
    cachedTier = "none";
    return "none";
  }
}

function subscribe(callback: () => void): () => void {
  // Подписка на событие потери контекста WebGL (например, при сбое GPU или нехватке видеопамяти)
  window.addEventListener("webglcontextlost", callback);
  return () => window.removeEventListener("webglcontextlost", callback);
}

function getSnapshot(): boolean {
  return detectDeviceTier() !== "none";
}

function getServerSnapshot(): boolean {
  return true;
}

export function useWebGLEnabled(): boolean {
  const reduced = useReducedMotion();
  const supported = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return supported && !reduced;
}

export function useDeviceTier(): "high" | "low" | "none" {
  return detectDeviceTier();
}
