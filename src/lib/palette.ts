/**
 * TypeScript-зеркало цветовой палитры из src/app/globals.css (--c-*).
 * CSS является первоисточником правды: WebGL-сцена считывает актуальные токены через readPalette().
 * Константы ниже используются как фолбэк для SSR и генерации OpenGraph-изображений.
 */
export const palette = {
  void: "#08071a",
  night: "#110f2a",
  dusk: "#1a1740",
  mist: "#efeaf8",
  haze: "#a29cc6",
  line: "#29244f",
  violet: "#a98bff",
  teal: "#3fe0c5",
  coral: "#ff7a68",
  gold: "#f4c55a",
  crimson: "#ff5c93",
  indigo: "#5b4bff",
  sand: "#d2b48a",
  ink: "#0a0820",
} as const;

export type PaletteKey = keyof typeof palette;

/**
 * Цветовой спектр иридесценции. Порядок обхода спектра в шейдере:
 * (violet → teal → gold → coral → crimson → indigo → violet).
 */
export const cloudCycleKeys = ["violet", "teal", "gold", "coral", "crimson", "indigo"] as const;

/** Считывает значения токенов CSS для идеального совпадения 3D-сцены с вёрсткой */
export function readPalette(): Record<PaletteKey, string> {
  if (typeof window === "undefined") return { ...palette };
  const style = getComputedStyle(document.documentElement);
  const out = { ...palette } as Record<PaletteKey, string>;
  (Object.keys(palette) as PaletteKey[]).forEach((key) => {
    const value = style.getPropertyValue(`--c-${key}`).trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) out[key] = value;
  });
  return out;
}
