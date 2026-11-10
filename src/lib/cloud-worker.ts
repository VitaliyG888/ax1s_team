/**
 * Web Worker для выноса расчётов поля частиц облака
 * из основного потока интерфейса (Main UI Thread).
 */

function hash(n: number, salt: number): number {
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || "").replace("#", "");
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [0.66, 0.54, 1.0];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

export type ParticleInitMessage = {
  count: number;
  paletteColors?: string[];
};

export type ParticleResultMessage = {
  positions: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
};

const DEFAULT_PALETTE = ["#a98bff", "#3fe0c5", "#f4c55a", "#ff7a68", "#ff5c93", "#5b4bff"];

export function generateCloudParticles(
  count: number,
  paletteColors?: string[],
): ParticleResultMessage {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // [seed, radius, angle, speed]

  const safePalette = Array.isArray(paletteColors) && paletteColors.length > 0
    ? paletteColors
    : DEFAULT_PALETTE;

  const rgbPalette = safePalette.map(hexToRgb);
  const pLen = rgbPalette.length;

  for (let i = 0; i < count; i += 1) {
    const s = hash(i, 7.13);
    const r = 1.1 + hash(i, 1.41) * 2.6;
    const a = hash(i, 2.71) * Math.PI * 2;
    const b = (hash(i, 3.14) - 0.5) * Math.PI;

    // Органическое распределение облака: плотное ядро, плавные сюрреалистические рукава
    const droop = Math.sin(a * 2.0) * 0.22;
    positions[i * 3] = Math.cos(a) * Math.cos(b) * r;
    positions[i * 3 + 1] = Math.sin(b) * r * 0.78 + droop;
    positions[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;

    // Градиентная иридесценция для каждой частицы из палитры темы
    const colorIndex = Math.floor(hash(i, 4.2) * pLen);
    const nextColorIndex = (colorIndex + 1) % pLen;
    const blend = hash(i, 5.8);

    const c1 = rgbPalette[colorIndex] || [0.66, 0.54, 1.0];
    const c2 = rgbPalette[nextColorIndex] || [0.25, 0.88, 0.77];

    colors[i * 3] = c1[0] * (1 - blend) + c2[0] * blend;
    colors[i * 3 + 1] = c1[1] * (1 - blend) + c2[1] * blend;
    colors[i * 3 + 2] = c1[2] * (1 - blend) + c2[2] * blend;

    seeds[i * 4] = s;
    seeds[i * 4 + 1] = r;
    seeds[i * 4 + 2] = a;
    seeds[i * 4 + 3] = 0.04 + hash(i, 9.3) * 0.06;
  }

  return { positions, colors, seeds };
}

// Запуск строго в контексте Dedicated Web Worker (не в окне браузера)
const isWorker =
  typeof window === "undefined" &&
  typeof self !== "undefined" &&
  typeof (self as unknown as { postMessage: unknown }).postMessage === "function";

if (isWorker) {
  (self as unknown as Worker).onmessage = (event: MessageEvent<ParticleInitMessage>) => {
    if (!event.data || typeof event.data.count !== "number") return;
    const { count, paletteColors } = event.data;
    const result = generateCloudParticles(count, paletteColors);
    (self as unknown as Worker).postMessage(result, [
      result.positions.buffer,
      result.colors.buffer,
      result.seeds.buffer,
    ]);
  };
}
