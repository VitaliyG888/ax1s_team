"use client";

import { useRef } from "react";
import { world, type Essence } from "@/lib/world-store";

export function RelicHitbox() {
  const drag = useRef({
    down: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    vx: 0,
    vy: 0,
    currentDragX: 0,
    currentDragY: 0,
  });

  const finish = (el: HTMLDivElement, pointerId: number) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      /* захват уже освобождён */
    }

    if (!drag.current.moved) {
      // Клик / тап: запуск тактильного упругого покачивания и переключение формы (метаморфоза)
      const next = ((world.get().essence + 1) % 4) as Essence;
      world.patch({
        essence: next,
        burst: 1,
        dragging: false,
      });
    } else {
      // Отпускание после перетаскивания: отпускаем с инерцией скорости
      world.patch({
        dragging: false,
        dragVx: drag.current.vx * 1.5,
        dragVy: drag.current.vy * 1.5,
      });
    }
  };

  return (
    <div
      className="pointer-events-auto absolute top-[4%] left-1/2 -translate-x-1/2 z-10 h-[26%] w-[58%] cursor-grab touch-none select-none active:cursor-grabbing sm:left-auto sm:right-[15%] sm:translate-x-0 sm:top-[10%] sm:h-[50%] sm:w-[24%]"
      role="button"
      tabIndex={0}
      aria-label="Интерактивный сюрреалистический 3D-блоб AX1S_TEAM (Blobmixer): тяни для растяжения и упругого покачивания, коснись для метаморфозы формы"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const next = ((world.get().essence + 1) % 4) as Essence;
          world.patch({ essence: next, burst: 1 });
        }
      }}
      onPointerDown={(event) => {
        drag.current.down = true;
        drag.current.moved = false;
        drag.current.startX = event.clientX;
        drag.current.startY = event.clientY;
        drag.current.lastX = event.clientX;
        drag.current.lastY = event.clientY;
        drag.current.lastTime = performance.now();
        drag.current.vx = 0;
        drag.current.vy = 0;
        drag.current.currentDragX = world.get().dragX;
        drag.current.currentDragY = world.get().dragY;

        world.patch({ dragging: true });
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current.down) return;

        const now = performance.now();
        const dt = Math.max(1, now - drag.current.lastTime);
        const dx = event.clientX - drag.current.lastX;
        const dy = event.clientY - drag.current.lastY;

        // Расчёт нормализованной скорости перемещения курсора
        drag.current.vx = (dx / dt) * 0.12;
        drag.current.vy = (-dy / dt) * 0.12;
        drag.current.lastX = event.clientX;
        drag.current.lastY = event.clientY;
        drag.current.lastTime = now;

        const totalDist = Math.hypot(
          event.clientX - drag.current.startX,
          event.clientY - drag.current.startY,
        );
        if (totalDist > 5) {
          drag.current.moved = true;
        }

        const sensitivity = 220;
        const nx = Math.max(-1.4, Math.min(1.4, drag.current.currentDragX + (event.clientX - drag.current.startX) / sensitivity));
        const ny = Math.max(-1.4, Math.min(1.4, drag.current.currentDragY - (event.clientY - drag.current.startY) / sensitivity));

        world.patch({
          dragX: nx,
          dragY: ny,
          dragVx: drag.current.vx,
          dragVy: drag.current.vy,
        });
      }}
      onPointerUp={(event) => finish(event.currentTarget, event.pointerId)}
      onPointerCancel={(event) => finish(event.currentTarget, event.pointerId)}
    />
  );
}
