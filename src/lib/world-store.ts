export type Essence = 0 | 1 | 2 | 3;

export type WorldSnapshot = {
  scroll: number;
  scrollVelocity: number;
  mouseX: number;
  mouseY: number;
  dragX: number;
  dragY: number;
  dragVx: number;
  dragVy: number;
  wobble: number;
  dragging: boolean;
  essence: Essence;
  burst: number;
  pulse: number;
  pulseExpansion: number;
  pulseGlow: number;
  inView: boolean;
};

const listeners = new Set<() => void>();

let snap: WorldSnapshot = {
  scroll: 0,
  scrollVelocity: 0,
  mouseX: 0,
  mouseY: 0,
  dragX: 0,
  dragY: 0,
  dragVx: 0,
  dragVy: 0,
  wobble: 0,
  dragging: false,
  essence: 0,
  burst: 0,
  pulse: 0,
  pulseExpansion: 0,
  pulseGlow: 0,
  inView: true,
};

function emit(): void {
  listeners.forEach((fn) => fn());
}

export const world = {
  get(): WorldSnapshot {
    return snap;
  },
  patch(partial: Partial<WorldSnapshot>): void {
    snap = { ...snap, ...partial };
    emit();
  },
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export const essenceLabel: Record<Essence, string> = {
  0: "текучесть (Dali)",
  1: "подмена (Magritte)",
  2: "сокрытие (Magritte)",
  3: "метаморфоза (Dali)",
};
