"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  Points,
  PointsMaterial,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { makeSoftSprite } from "@/lib/particle-sprite";
import { paintThen } from "@/components/three/SceneReady";
import { markSceneReady } from "@/lib/scroll-gate";
import { world } from "@/lib/world-store";
import { readPalette } from "@/lib/palette";
import {
  blobFragmentShader,
  blobVertexShader,
} from "@/components/three/blob-shader";
import { useCloudParticles } from "@/lib/use-cloud-particles";
import { useDeviceTier } from "@/lib/use-webgl";

/**
 * Пространственная хореография движения компактного блоба сквозь все секции сайта.
 * Координаты откалиброваны так, чтобы блоб находился в свободных визуальных зонах
 * и никогда не перекрывал ключевые заголовки и кнопки действий (CTA).
 */
function getBlobPath(t: number, mobile: boolean): { x: number; y: number; z: number; scale: number } {
  if (mobile) {
    // Мобильная версия: блоб парит в верхней зоне над заголовками
    const x = Math.sin(t * Math.PI * 2.0) * 0.12;
    const y = 0.60 + Math.cos(t * Math.PI * 2.5) * 0.05;
    const z = -0.2 - Math.sin(t * Math.PI) * 0.2;
    const scale = 0.55;
    return { x, y, z, scale };
  }

  // Десктопная версия: точный баланс справа от h1 без вылета за правый край экрана
  let x = 1.30;
  let y = 0.16;
  let z = 0.0;
  let scale = 0.74;

  if (t < 0.16) {
    // Hero -> Manifest: плавный переход из правого поля в открытую левую колонку секции Манифеста
    const p = t / 0.16;
    const f = Math.sin(p * Math.PI * 0.5);
    x = 1.30 - f * 2.55; // 1.30 -> -1.25
    y = 0.16 - f * 0.11; // 0.16 -> 0.05
    z = -f * 0.2;
    scale = 0.74 - f * 0.02;
  } else if (t < 0.38) {
    // Manifest -> Work: переход из левой колонки обратно в правую (секция кейсов)
    const p = (t - 0.16) / 0.22;
    const f = p * p * (3.0 - 2.0 * p);
    x = -1.25 + f * 2.53; // -1.25 -> 1.28
    y = 0.05 - f * 0.10;
    z = -0.2 + f * 0.35;
    scale = 0.72;
  } else if (t < 0.65) {
    // Work -> Practices & Process: переплывает в левую колонку практик
    const p = (t - 0.38) / 0.27;
    const f = p * p * (3.0 - 2.0 * p);
    x = 1.28 - f * 2.53; // 1.28 -> -1.25
    y = -0.05 + f * 0.05;
    z = 0.15 - f * 0.25;
    scale = 0.72;
  } else if (t < 0.85) {
    // Practices -> Studio / FAQ: возвращается в правую колонку
    const p = (t - 0.65) / 0.20;
    const f = p * p * (3.0 - 2.0 * p);
    x = -1.25 + f * 2.53; // -1.25 -> 1.28
    y = 0.0 + f * 0.08;
    z = -0.1 + f * 0.2;
    scale = 0.74;
  } else {
    // Studio -> Contact: финальная фиксация в правой колонке футера/контактов
    const p = (t - 0.85) / 0.15;
    const f = p * p * (3.0 - 2.0 * p);
    x = 1.28 + f * 0.02; // 1.28 -> 1.30
    y = 0.08 - f * 0.08;
    z = 0.1 + f * 0.05;
    scale = 0.74;
  }

  return { x, y, z, scale };
}

/**
 * Система управления виртуальной камерой (параллакс от мыши и стабильный ракурс)
 */
function CameraRig({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();
  const look = useMemo(() => new Vector3(), []);
  const pos = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const w = world.get();
    if (!w.inView) return;

    const t = w.scroll;
    const mx = w.mouseX * (mobile ? 0.04 : 0.12);
    const my = w.mouseY * (mobile ? 0.03 : 0.08);

    pos.set(
      mx * (1 - t * 0.2),
      my * 0.2 - t * 0.1,
      4.35,
    );
    camera.position.lerp(pos, 0.075);

    look.set(
      mx * 0.08,
      my * 0.08,
      0,
    );
    camera.lookAt(look);
  });

  return null;
}

/**
 * Главный интерактивный жидкий блоб (в эстетике Blobmixer)
 * Органический текучий объём с резиновой эластичностью и поверхностным натяжением.
 */
function MainBlob({
  mobile,
  tier,
}: {
  mobile: boolean;
  tier: "high" | "low" | "none";
}) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const group = useRef<Group>(null);
  const keyPos = useMemo(() => new Vector3(2.4, 2.2, 3.2), []);
  const screenProj = useMemo(() => new Vector3(), []);

  const physics = useRef({
    drag: new Vector2(0, 0),
    vel: new Vector2(0, 0),
    squash: new Vector3(1, 1, 1),
    scrollSquash: new Vector3(1, 1, 1),
    wobble: 0,
    scrollTwist: 0,
    scrollVelocityLerp: 0,
    wavePhase: 0,
    essenceLerp: 0,
    lastBurst: 0,
    lastWobble: 0,
    motionRoundness: 0,
    ripplePhase: 0,
    rippleAmp: 0,
    axialRotation: 0,
  });

  const p = readPalette();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorTime: { value: 0 },
      uScroll: { value: 0 },
      uWavePhase: { value: 0 },
      uPulseExpansion: { value: 0 },
      uPulseDistortion: { value: 0 },
      uPulseGlow: { value: 0 },
      uWobble: { value: 0 },
      uEssence: { value: 0 },
      uSquash: { value: new Vector3(1, 1, 1) },
      uScrollSquash: { value: new Vector3(1, 1, 1) },
      uDrag: { value: new Vector2() },
      uDistort: { value: 0.24 }, // Оптимальная мягкая амплитуда деформации шумом
      uFrequency: { value: 1.55 },
      uMotionRoundness: { value: 0 },
      uRipplePhase: { value: 0 },
      uRippleAmp: { value: 0 },
      uKeyPos: { value: keyPos },
      uViolet: { value: new Color(p.violet) },
      uTeal: { value: new Color(p.teal) },
      uCoral: { value: new Color(p.coral) },
      uGold: { value: new Color(p.gold) },
      uCrimson: { value: new Color(p.crimson) },
      uIndigo: { value: new Color(p.indigo) },
      uVoid: { value: new Color(p.void) },
      uMist: { value: new Color(p.mist) },
    }),
    [keyPos, p],
  );

  useFrame((state, delta) => {
    const w = world.get();
    if (!w.inView) return;

    const m = mat.current;
    const g = group.current;
    if (!m || !g) return;

    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;
    const phys = physics.current;

    // 1. Плавное отслеживание мгновенной скорости скролла
    const rawVel = w.scrollVelocity;
    phys.scrollVelocityLerp += (rawVel - phys.scrollVelocityLerp) * 0.15;
    const v = phys.scrollVelocityLerp;

    // Результирующая скорость движения от скролла и перетаскивания курсором
    const dragSpeed = Math.hypot(phys.vel.x, phys.vel.y);
    const motionSpeed = Math.min(1.0, Math.abs(v) * 0.08 + dragSpeed * 0.45 + (w.dragging ? 0.4 : 0.0));

    // Округление блоба при движении:
    // Поверхностное натяжение жидкости сглаживает асимметричные выступы в гладкую сферу
    phys.motionRoundness += (motionSpeed - phys.motionRoundness) * 0.14;

    // Поверхностная рябь:
    // Бегущие волны активируются при динамичном движении и затухают в покое
    const targetRippleAmp = Math.min(1.0, Math.abs(v) * 0.06 + dragSpeed * 0.4 + (w.dragging ? 0.5 : 0.0));
    phys.rippleAmp += (targetRippleAmp - phys.rippleAmp) * 0.16;
    phys.ripplePhase += (3.8 + Math.abs(v) * 0.15 + dragSpeed * 0.9) * dt;

    // Осевое вращение вокруг вертикальной оси Y:
    // Непрерывный плавный оборот, ускоряющийся пропорционально скорости прокрутки
    phys.axialRotation += (v * 0.045 + 0.10) * dt;

    // 2. Упругий Squash & Stretch (вязкое сжатие и растяжение по вертикали, макс. 18%)
    const stretchY = 1.0 + Math.min(0.18, Math.abs(v) * 0.015);
    const compressXZ = 1.0 / Math.sqrt(stretchY);
    phys.scrollSquash.lerp(new Vector3(compressXZ, stretchY, compressXZ), 0.18);

    // 3. Плавная инерция скручивания (scroll twist)
    phys.scrollTwist += v * 0.008;
    phys.scrollTwist *= 0.88;

    // 4. Интеграция фазы волн (аккуратный разгон ряби при быстром скролле)
    const speedMultiplier = 0.38 + Math.min(0.85, Math.abs(v) * 0.035);
    phys.wavePhase += speedMultiplier * dt;

    // 5. Плавный морфинг 4 сюрреалистических форм Дали и Магритта вдоль длины страницы
    const targetEssence = w.essence + w.scroll * 3.0;
    phys.essenceLerp += (targetEssence - phys.essenceLerp) * 0.08;

    // 6. Пружинная физика прямого перетаскивания (интерактивный drag)
    if (w.dragging) {
      phys.drag.set(w.dragX, w.dragY);
      phys.vel.set(w.dragVx, w.dragVy);

      const stretchFactorX = 1.0 + Math.max(-0.25, Math.min(0.35, w.dragVx * 0.3 + w.dragX * 0.12));
      const stretchFactorY = 1.0 + Math.max(-0.25, Math.min(0.35, w.dragVy * 0.3 + w.dragY * 0.12));
      const stretchFactorZ = 1.0 / Math.sqrt(Math.max(0.3, stretchFactorX * stretchFactorY));

      phys.squash.lerp(new Vector3(stretchFactorX, stretchFactorY, stretchFactorZ), 0.18);
    } else {
      // Возвратная пружина Гука с демпфированием
      const springK = 38.0;
      const damping = 6.2;
      const fx = -springK * phys.drag.x - damping * phys.vel.x;
      const fy = -springK * phys.drag.y - damping * phys.vel.y;

      phys.vel.x += fx * dt;
      phys.vel.y += fy * dt;
      phys.drag.x += phys.vel.x * dt;
      phys.drag.y += phys.vel.y * dt;

      phys.squash.lerp(new Vector3(1, 1, 1), 0.12);
    }

    // Реакция на тактильные клики и всплески
    if (w.wobble !== phys.lastWobble && w.wobble > 0.01) {
      phys.wobble = Math.max(phys.wobble, w.wobble);
      phys.lastWobble = w.wobble;
    }
    if (w.burst !== phys.lastBurst && w.burst > 0.01) {
      phys.wobble = Math.max(phys.wobble, 1.0);
      phys.lastBurst = w.burst;
    }
    phys.wobble *= Math.exp(-dt * 3.2);

    // Обновление переменных шейдера (Uniforms)
    m.uniforms.uTime.value = elapsed;
    m.uniforms.uColorTime.value = elapsed;
    m.uniforms.uScroll.value = w.scroll;
    m.uniforms.uWavePhase.value = phys.wavePhase;
    m.uniforms.uScrollSquash.value.copy(phys.scrollSquash);
    m.uniforms.uEssence.value = phys.essenceLerp;
    m.uniforms.uMotionRoundness.value = phys.motionRoundness;
    m.uniforms.uRipplePhase.value = phys.ripplePhase;
    m.uniforms.uRippleAmp.value = phys.rippleAmp;

    // 5-секундный дыхательный цикл
    m.uniforms.uPulseExpansion.value +=
      (w.pulseExpansion - m.uniforms.uPulseExpansion.value) * 0.12;
    m.uniforms.uPulseDistortion.value +=
      (Math.abs(w.pulseExpansion) - m.uniforms.uPulseDistortion.value) * 0.1;
    m.uniforms.uPulseGlow.value +=
      (w.pulseGlow - m.uniforms.uPulseGlow.value) * 0.12;

    m.uniforms.uWobble.value = phys.wobble;
    m.uniforms.uSquash.value.copy(phys.squash);
    m.uniforms.uDrag.value.copy(phys.drag);

    // Следование по пространственной траектории сквозь секции
    const path = getBlobPath(w.scroll, mobile);
    g.position.x = path.x + phys.drag.x * 0.28;
    g.position.y = path.y + phys.drag.y * 0.20;
    g.position.z = path.z;
    g.scale.set(path.scale, path.scale, path.scale);

    keyPos.set(path.x + 2.0 + phys.drag.x * 1.8, path.y + 1.8 + phys.drag.y * 1.5, path.z + 2.8);

    // Вращение блоба вокруг вертикальной оси при скролле (3 полных оборота на всю длину сайта)
    const baseScrollSpin = w.scroll * Math.PI * 6.0;
    g.rotation.y = baseScrollSpin + phys.axialRotation + phys.drag.x * 0.4;
    g.rotation.x = Math.sin(elapsed * 0.2) * 0.05 + Math.sin(w.scroll * Math.PI * 1.5) * 0.14 - phys.drag.y * 0.3;
    g.rotation.z = Math.cos(elapsed * 0.15) * 0.03 + phys.scrollTwist * 0.12;

    // Динамическая коллизия в экранном пространстве: подсвечивает надписи при касании блобом
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      screenProj.set(g.position.x, g.position.y, g.position.z).project(state.camera);
      const bx = (screenProj.x * 0.5 + 0.5) * window.innerWidth;
      const by = (-screenProj.y * 0.5 + 0.5) * window.innerHeight;
      const br = path.scale * 0.92 * (window.innerHeight * 0.30);
      const threshold = br * 1.25;

      const targets = document.querySelectorAll<HTMLElement>("[data-blob-touch]");
      for (let i = 0; i < targets.length; i++) {
        const el = targets[i];
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          if (el.hasAttribute("data-touching")) el.removeAttribute("data-touching");
          continue;
        }

        const closestX = Math.max(rect.left, Math.min(bx, rect.right));
        const closestY = Math.max(rect.top, Math.min(by, rect.bottom));
        const dist = Math.hypot(bx - closestX, by - closestY);

        if (dist < threshold) {
          if (!el.hasAttribute("data-touching")) {
            el.setAttribute("data-touching", "true");
          }
        } else {
          if (el.hasAttribute("data-touching")) {
            el.removeAttribute("data-touching");
          }
        }
      }
    }
  });

  const detail = tier === "low" || mobile ? 3 : 4;

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        {/* Базовый радиус 0.92 — компактный размер без наложения на контент */}
        <icosahedronGeometry args={[0.92, detail]} />
        <shaderMaterial
          ref={mat}
          vertexShader={blobVertexShader}
          fragmentShader={blobFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}

/**
 * Орбитальные желеобразные спутники (компаньоны основного блоба)
 */
function BlobSatellites({ mobile }: { mobile: boolean }) {
  const g1 = useRef<Group>(null);
  const g2 = useRef<Group>(null);
  const g3 = useRef<Group>(null);

  const p = readPalette();
  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: blobVertexShader,
      fragmentShader: blobFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorTime: { value: 0 },
        uScroll: { value: 0 },
        uWavePhase: { value: 0 },
        uPulseExpansion: { value: 0 },
        uPulseDistortion: { value: 0 },
        uPulseGlow: { value: 0 },
        uWobble: { value: 0 },
        uEssence: { value: 0 },
        uSquash: { value: new Vector3(1, 1, 1) },
        uScrollSquash: { value: new Vector3(1, 1, 1) },
        uDrag: { value: new Vector2() },
        uDistort: { value: 0.18 },
        uFrequency: { value: 1.8 },
        uMotionRoundness: { value: 0.6 },
        uRipplePhase: { value: 0 },
        uRippleAmp: { value: 0.04 },
        uKeyPos: { value: new Vector3(2.4, 2.2, 3.2) },
        uViolet: { value: new Color(p.violet) },
        uTeal: { value: new Color(p.teal) },
        uCoral: { value: new Color(p.coral) },
        uGold: { value: new Color(p.gold) },
        uCrimson: { value: new Color(p.crimson) },
        uIndigo: { value: new Color(p.indigo) },
        uVoid: { value: new Color(p.void) },
        uMist: { value: new Color(p.mist) },
      },
      transparent: true,
      depthWrite: true,
    });
  }, [p]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state) => {
    const w = world.get();
    if (!w.inView) return;

    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uColorTime.value = t + 2.0;
    material.uniforms.uScroll.value = w.scroll;
    material.uniforms.uPulseExpansion.value = w.pulseExpansion;
    material.uniforms.uPulseGlow.value = w.pulseGlow;
    material.uniforms.uEssence.value = w.essence + w.scroll * 3.0;
    material.uniforms.uRipplePhase.value = t * 3.0;

    const path = getBlobPath(w.scroll, mobile);
    const baseX = path.x;
    const baseY = path.y;
    const baseZ = path.z;
    const lagX = w.dragX * 0.16;
    const lagY = w.dragY * 0.12;

    // Компактные траектории орбитального движения спутников
    if (g1.current) {
      const a1 = t * 0.45 + w.scroll * 1.8;
      const r1 = 1.35 + Math.sin(t * 0.6) * 0.1;
      g1.current.position.set(
        baseX + Math.cos(a1) * r1 + lagX,
        baseY + Math.sin(a1 * 0.8) * 0.6 + 0.25 + lagY,
        baseZ + Math.sin(a1) * 0.5,
      );
      g1.current.rotation.y = t * 0.5;
    }

    if (g2.current) {
      const a2 = t * 0.38 + w.scroll * 2.0 + 2.4;
      const r2 = 1.48 + Math.cos(t * 0.5) * 0.12;
      g2.current.position.set(
        baseX + Math.cos(a2) * r2 + lagX,
        baseY + Math.sin(a2 * 0.9) * 0.55 - 0.35 + lagY,
        baseZ + Math.sin(a2) * 0.6,
      );
      g2.current.rotation.y = t * 0.4;
    }

    if (g3.current) {
      const a3 = t * 0.55 + w.scroll * 2.5 + 4.2;
      const r3 = 1.25 + Math.sin(t * 0.7) * 0.1;
      g3.current.position.set(
        baseX + Math.cos(a3) * r3 + lagX,
        baseY + Math.cos(a3 * 0.6) * 0.5 + lagY,
        baseZ + Math.sin(a3) * 0.6 + 0.2,
      );
      g3.current.rotation.y = t * 0.6;
    }
  });

  return (
    <>
      <group ref={g1}>
        <mesh material={material}>
          <icosahedronGeometry args={[0.13, 3]} />
        </mesh>
      </group>
      <group ref={g2}>
        <mesh material={material}>
          <icosahedronGeometry args={[0.09, 3]} />
        </mesh>
      </group>
      <group ref={g3}>
        <mesh material={material}>
          <icosahedronGeometry args={[0.11, 3]} />
        </mesh>
      </group>
    </>
  );
}

function CloudMist({ count }: { count: number }) {
  const points = useRef<Points>(null);
  const particleData = useCloudParticles(count);

  const { geometry, material, texture } = useMemo(() => {
    const geo = new BufferGeometry();
    const map = new CanvasTexture(makeSoftSprite(64));
    const mat = new PointsMaterial({
      size: 0.042,
      map,
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      sizeAttenuation: true,
      blending: AdditiveBlending,
    });
    return { geometry: geo, material: mat, texture: map };
  }, []);

  useEffect(() => {
    if (!particleData) return;
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(particleData.positions, 3),
    );
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(particleData.colors, 3),
    );
  }, [geometry, particleData]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  useFrame((state) => {
    const p = points.current;
    if (!p || !particleData) return;
    const w = world.get();
    if (!w.inView) return;

    const arr = p.geometry.attributes.position?.array as Float32Array;
    if (!arr) return;

    const t = state.clock.elapsedTime;
    const seeds = particleData.seeds;
    const path = getBlobPath(w.scroll, false);

    p.position.set(path.x, path.y, path.z);

    for (let i = 0; i < count; i += 1) {
      const s = seeds[i * 4];
      const baseR = seeds[i * 4 + 1] * 0.75;
      const speed = seeds[i * 4 + 3];

      const r =
        (baseR + Math.sin(t * 0.5 + s * 10.0) * 0.12) *
        (1.0 + w.pulseExpansion * 0.12 + w.burst * 0.5);
      const angle = s * 6.28 + t * speed + w.dragX * 0.2;
      const b = (s - 0.5) * 2.0 + Math.sin(t * 0.3 + s * 6.0) * 0.12;

      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(b) * r * 0.6;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }

    p.geometry.attributes.position.needsUpdate = true;
    p.rotation.y = t * 0.03 + w.scroll * 1.5;
  });

  return (
    <group>
      <points ref={points} geometry={geometry} material={material} />
    </group>
  );
}

function Lights() {
  const key = useRef<{ position: Vector3 }>(null);
  const p = readPalette();

  useFrame(() => {
    const w = world.get();
    if (!w.inView) return;
    const l = key.current;
    if (!l) return;
    const path = getBlobPath(w.scroll, false);
    l.position.set(path.x + 2.0 + w.dragX * 1.8, path.y + 1.8 + w.dragY * 1.5, path.z + 2.8);
  });

  return (
    <>
      <ambientLight intensity={0.32} color={p.night} />
      <pointLight
        ref={key as never}
        intensity={36}
        distance={20}
        color={p.teal}
        position={[2.4, 2.0, 3.2]}
      />
      <pointLight
        intensity={24}
        distance={18}
        color={p.violet}
        position={[-2.8, 1.4, 1.6]}
      />
      <pointLight
        intensity={18}
        distance={16}
        color={p.coral}
        position={[0.2, -2.2, 2.0]}
      />
      <pointLight
        intensity={16}
        distance={18}
        color={p.indigo}
        position={[0.0, 2.8, -2.8]}
      />
    </>
  );
}

function FirstPaint() {
  useEffect(() => {
    paintThen(markSceneReady);
  }, []);
  return null;
}

export default function World() {
  const tier = useDeviceTier();
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);

  const particleCount = mobile || tier === "low" ? 70 : 200;

  return (
    <Canvas
      className="h-full w-full"
      dpr={mobile || tier === "low" ? [1, 1] : [1, 1.5]}
      gl={{
        antialias: tier !== "low" && !mobile,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 38, near: 0.1, far: 40, position: [0.2, 0.2, 4.25] }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
        paintThen(markSceneReady);
      }}
    >
      <FirstPaint />
      <CameraRig mobile={mobile} />
      <Lights />
      <MainBlob mobile={mobile} tier={tier} />
      {!mobile && tier !== "low" ? <BlobSatellites mobile={mobile} /> : null}
      <CloudMist count={particleCount} />
    </Canvas>
  );
}
