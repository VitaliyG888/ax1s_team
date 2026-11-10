"use client";

import { useCloudPulseTimeline } from "@/lib/use-cloud-pulse";

export function WorldCycle() {
  // Управляет непрерывным 5-секундным дыхательным ритмом блоба в GSAP
  useCloudPulseTimeline();
  return null;
}
