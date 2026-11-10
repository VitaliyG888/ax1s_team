type Listener = () => void;

let ready = false;
let locked = false;
const listeners = new Set<Listener>();

function preventScroll(event: Event): void {
  event.preventDefault();
}

export function isSceneReady(): boolean {
  return ready;
}

export function lockScene(): void {
  if (ready || locked || typeof document === "undefined") return;
  locked = true;
  document.documentElement.classList.add("is-scene-locked");
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
}

export function markSceneReady(): void {
  if (ready) return;
  ready = true;
  locked = false;
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("is-scene-locked");
    document.documentElement.classList.add("is-scene-ready");
    document.removeEventListener("wheel", preventScroll);
    document.removeEventListener("touchmove", preventScroll);
  }
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function subscribeSceneReady(fn: Listener): () => void {
  if (ready) {
    fn();
    return () => undefined;
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
