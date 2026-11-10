"use client";

import { useEffect, useState } from "react";
import {
  generateCloudParticles,
  type ParticleResultMessage,
} from "@/lib/cloud-worker";
import { palette, cloudCycleKeys } from "@/lib/palette";

export function useCloudParticles(count: number): ParticleResultMessage | null {
  const [data, setData] = useState<ParticleResultMessage | null>(null);

  useEffect(() => {
    let cancelled = false;
    const colors = cloudCycleKeys.map((k) => palette[k]);

    // Сначала пробуем рассчитать через Web Worker в отдельном потоке
    if (typeof Worker !== "undefined") {
      try {
        const worker = new Worker(
          new URL("./cloud-worker.ts", import.meta.url),
          { type: "module" },
        );

        worker.onmessage = (event: MessageEvent<ParticleResultMessage>) => {
          if (!cancelled) {
            setData(event.data);
          }
          worker.terminate();
        };

        worker.onerror = () => {
          // Фолбэк на синхронный расчёт, если воркер упал с ошибкой
          if (!cancelled) {
            setData(generateCloudParticles(count, colors));
          }
          worker.terminate();
        };

        worker.postMessage({ count, paletteColors: colors });

        return () => {
          cancelled = true;
          worker.terminate();
        };
      } catch {
        // Фолбэк, если создание Web Worker запрещено политиками окружения
        if (!cancelled) {
          setData(generateCloudParticles(count, colors));
        }
      }
    } else {
      setData(generateCloudParticles(count, colors));
    }

    return () => {
      cancelled = true;
    };
  }, [count]);

  return data;
}
