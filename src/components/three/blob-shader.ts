/**
 * AX1S_TEAM — Сюрреалистический шейдер жидкого блоба (Blobmixer)
 * Разработан по эстетическим и физическим принципам 14islands' Blobmixer (https://blobmixer.14islands.com/)
 * 
 * Физика и эстетика:
 * - Бархатистый, плавный органический объём жидкости (без острых заломов и самопересечений)
 * - Контролируемый 3D Simplex-шум с прецизионными нормалями касательного пространства (tangent-space)
 * - Упругий Squash & Stretch (вязкость и желеобразная инерция при скролле и перетаскивании)
 * - 4 сюрреалистические морфологические формы (образы Дали и Магритта)
 * - Двухкомпонентный глянцевый блик (dual-lobe clearcoat) — эффект мокрого лака / силикона
 * - Богатые радужные переливы (иридесценция) и адаптация спектра под секции страницы
 */

export const blobVertexShader = /* glsl */ `
uniform float uTime;
uniform float uColorTime;
uniform float uScroll;
uniform float uWavePhase;
uniform float uPulseExpansion;
uniform float uPulseDistortion;
uniform float uWobble;
uniform float uEssence;
uniform vec3  uSquash;
uniform vec3  uScrollSquash;
uniform vec2  uDrag;
uniform float uDistort;
uniform float uFrequency;
uniform float uMotionRoundness;
uniform float uRipplePhase;
uniform float uRippleAmp;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vViewDir;
varying vec3 vReflect;
varying float vNoise;
varying float vFresnel;
varying float vDroop;
varying vec3 vModelPos;

// --- Генератор 3D Simplex-шума (Stefan Gustavson / Ian McEwan) ---
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // Первая вершина симплекса
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Остальные вершины
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Перестановки
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Градиенты
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 sh_xxyy = vec4(sh.x, sh.x, sh.y, sh.y);
  vec4 sh_zzww = vec4(sh.z, sh.z, sh.w, sh.w);
  vec4 b0_xzyw = vec4(b0.x, b0.z, b0.y, b0.w);
  vec4 b1_xzyw = vec4(b1.x, b1.z, b1.y, b1.w);
  vec4 s0_xzyw = vec4(s0.x, s0.z, s0.y, s0.w);
  vec4 s1_xzyw = vec4(s1.x, s1.z, s1.y, s1.w);

  vec4 a0 = b0_xzyw + s0_xzyw * sh_xxyy;
  vec4 a1 = b1_xzyw + s1_xzyw * sh_zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Органическая деформация в стиле Blobmixer: плавный, текучий объём без артефактов
vec3 calculateDisplacedPosition(vec3 basePos, vec3 baseNorm) {
  vec3 p = basePos;

  // 1. Мягкий Squash & Stretch (инерция от курсора и скорости скролла)
  p *= uSquash;
  p *= uScrollSquash;

  // 2. 5-секундный дыхательный цикл (пульсация объёма)
  float pulseScale = 1.0 + uPulseExpansion * 0.12;
  p *= pulseScale;

  // Округление при движении: поверхностное натяжение стремится превратить каплю в гладкую сферу
  float roundFactor = clamp(uMotionRoundness, 0.0, 1.0);
  float shapeRetention = 1.0 - roundFactor * 0.85;

  // 3. Мягкие, бархатистые волны 3D Simplex-шума
  vec3 noiseCoord = p * uFrequency + vec3(sin(uWavePhase * 0.5) * 0.35, uWavePhase * 0.45, cos(uWavePhase * 0.4) * 0.35);
  float n1 = snoise(noiseCoord);
  float n2 = snoise(noiseCoord * 1.85 - vec3(uWavePhase * 0.25, uWavePhase * 0.2, uWavePhase * 0.3));
  float rawNoise = n1 * 0.7 + n2 * 0.3;

  // 4. Сюрреалистические морфологические формы (Дали и Магритт)
  // Форма 0: «Текучесть» (мягкая тающая капля Дали)
  float droop = smoothstep(-0.35, 1.25, -p.y) * 0.26 * shapeRetention;
  vec3 morph0 = p;
  morph0.y -= droop * (1.0 + sin(uWavePhase * 0.8 + p.x * 1.5) * 0.12);
  morph0.xz *= (1.0 + droop * 0.16);

  // Форма 1: «Подмена» (яблоко Магритта: ямочка сверху и мягкий экваториальный поясок)
  vec3 morph1 = p;
  float appleDimple = smoothstep(0.4, 1.25, p.y) * 0.22 * shapeRetention;
  morph1.y -= appleDimple;
  float ring = sin(length(p.xz) * 5.2 - uWavePhase * 0.9) * 0.11 * smoothstep(1.2, 0.2, abs(p.y)) * shapeRetention;
  morph1 += baseNorm * ring;

  // Форма 2: «Сокрытие» (округлый кристалл-желе Магритта)
  vec3 morph2 = p;
  float crystal = (abs(n1) * 0.6 + abs(n2) * 0.3 - 0.4) * 0.22 * shapeRetention;
  morph2 += baseNorm * crystal;

  // Форма 3: «Метаморфоза» (5-лепестковая пульсирующая звезда Дали)
  vec3 morph3 = p;
  float angle = atan(p.z, p.x + 0.0001) * 5.0;
  float star = sin(angle + uWavePhase) * sin(p.y * 2.8) * 0.16 * shapeRetention;
  morph3 += baseNorm * star;

  // Непрерывная плавная интерполяция между сюрреалистическими формами
  float e = mod(uEssence, 4.0);
  vec3 currentMorph = morph0;
  if (e < 1.0) {
    currentMorph = mix(morph0, morph1, smoothstep(0.0, 1.0, fract(e)));
  } else if (e < 2.0) {
    currentMorph = mix(morph1, morph2, smoothstep(0.0, 1.0, fract(e)));
  } else if (e < 3.0) {
    currentMorph = mix(morph2, morph3, smoothstep(0.0, 1.0, fract(e)));
  } else {
    currentMorph = mix(morph3, morph0, smoothstep(0.0, 1.0, fract(e)));
  }
  p = currentMorph;

  // 5. Итоговое радиальное смещение шумом (при движении блоб сглаживается в каплю)
  float totalDistort = uDistort * (1.0 + uPulseDistortion * 0.28) * (1.0 - roundFactor * 0.70);
  p += baseNorm * (rawNoise * totalDistort);

  // Сферическая релаксация при движении (приведение формы к идеальной капле)
  p = mix(p, normalize(p) * length(basePos), roundFactor * 0.45);

  // 6. Поверхностная рябь жидкости (бегущие волны при движении)
  if (uRippleAmp > 0.002) {
    float wave1 = sin(basePos.y * 14.0 - uRipplePhase * 3.4 + basePos.x * 5.0);
    float wave2 = sin(length(basePos.xz) * 18.0 - uRipplePhase * 3.0);
    float wave3 = cos(atan(basePos.z, basePos.x + 0.0001) * 3.0 + basePos.y * 7.0 - uRipplePhase * 2.2);
    float ripple = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.15) * uRippleAmp * 0.085;
    p += baseNorm * ripple;
  }

  // 7. Тактильная отдача / ударная волна при клике и перетаскивании
  float shockwave = sin(length(p) * 8.0 - uTime * 6.0) * uWobble * 0.16;
  p += baseNorm * shockwave;

  return p;
}

void main() {
  vec3 basePos = position;
  vec3 baseNorm = normal;

  vec3 displaced = calculateDisplacedPosition(basePos, baseNorm);

  // Точный расчёт нормалей деформированной поверхности в касательном пространстве
  vec3 vTangent = normalize(cross(baseNorm, abs(baseNorm.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
  vec3 vBitangent = normalize(cross(baseNorm, vTangent));

  float eps = 0.015;
  vec3 posT = calculateDisplacedPosition(basePos + vTangent * eps, normalize(baseNorm + vTangent * eps));
  vec3 posB = calculateDisplacedPosition(basePos + vBitangent * eps, normalize(baseNorm + vBitangent * eps));

  vec3 nDiff = cross(posT - displaced, posB - displaced);
  float nLen = length(nDiff);
  vec3 deformedNorm = nLen > 0.00001 ? (nDiff / nLen) : baseNorm;
  if (dot(deformedNorm, baseNorm) < 0.0) {
    deformedNorm = -deformedNorm;
  }
  deformedNorm = normalize(mix(baseNorm, deformedNorm, 0.82));

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorld = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * deformedNorm);
  vViewDir = normalize(cameraPosition - vWorld);
  vReflect = reflect(-vViewDir, vNormal);

  vModelPos = displaced;
  vNoise = snoise(basePos * uFrequency);
  vDroop = smoothstep(-0.35, 1.25, -basePos.y);
  vFresnel = pow(1.0 - max(dot(vViewDir, vNormal), 0.0), 3.0);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const blobFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uColorTime;
uniform float uScroll;
uniform float uPulseGlow;
uniform float uWobble;
uniform float uEssence;
uniform vec3  uKeyPos;

// Цветовые токены палитры темы
uniform vec3 uViolet;   // #a98bff
uniform vec3 uTeal;     // #3fe0c5
uniform vec3 uCoral;    // #ff7a68
uniform vec3 uGold;     // #f4c55a
uniform vec3 uCrimson;  // #ff5c93
uniform vec3 uIndigo;   // #5b4bff
uniform vec3 uVoid;     // #08071a
uniform vec3 uMist;     // #efeaf8

varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vViewDir;
varying vec3 vReflect;
varying float vNoise;
varying float vFresnel;
varying float vDroop;
varying vec3 vModelPos;

// Непрерывный мультицветовой градиент спектра иридесценции
vec3 sampleBlobSpectrum(float phase) {
  phase = fract(phase);
  float p = phase * 6.0;
  float f = smoothstep(0.0, 1.0, fract(p));

  if (p < 1.0) return mix(uViolet, uTeal, f);
  if (p < 2.0) return mix(uTeal, uGold, f);
  if (p < 3.0) return mix(uGold, uCoral, f);
  if (p < 4.0) return mix(uCoral, uCrimson, f);
  if (p < 5.0) return mix(uCrimson, uIndigo, f);
  return mix(uIndigo, uViolet, f);
}

// Процедурное студийное окружение (отражения световых софтбоксов)
vec3 getStudioReflection(vec3 refDir) {
  float topBox = smoothstep(0.35, 0.95, refDir.y) * 0.75;
  float leftBox = smoothstep(0.4, 0.9, -refDir.x) * smoothstep(-0.4, 0.5, refDir.y);
  float rightBox = smoothstep(0.4, 0.9, refDir.x) * smoothstep(-0.4, 0.5, refDir.y);
  float bottomFill = smoothstep(0.2, 0.85, -refDir.y) * 0.35;

  vec3 env = mix(uVoid, uIndigo * 0.35, clamp(refDir.y * 0.5 + 0.5, 0.0, 1.0));
  env += uMist * topBox * 0.85;
  env += uViolet * leftBox * 0.65;
  env += uTeal * rightBox * 0.75;
  env += uCoral * bottomFill * 0.45;
  return env;
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 view = normalize(vViewDir);
  vec3 lightDir = normalize(uKeyPos - vWorld);

  float NdotL = max(dot(n, lightDir), 0.0);
  float NdotV = max(dot(n, view), 0.0);

  // Доминирующий спектр текущей секции страницы (Hero -> Manifest -> Work -> Practices -> Contact)
  float scrollPhase = uScroll * 4.8;
  vec3 sectionColorA = sampleBlobSpectrum(scrollPhase * 0.16667);
  vec3 sectionColorB = sampleBlobSpectrum((scrollPhase + 1.2) * 0.16667);
  vec3 sectionPalette = mix(sectionColorA, sectionColorB, 0.35);

  // Тонкоплёночная иридесценция (переливы в зависимости от угла зрения и шума поверхности)
  float iridPhase = uColorTime * 0.045 + uScroll * 1.6 + (1.0 - NdotV) * 0.65 + vNoise * 0.28;
  float refrSpread = 0.038 + vFresnel * 0.035;
  vec3 iridR = sampleBlobSpectrum(iridPhase - refrSpread);
  vec3 iridG = sampleBlobSpectrum(iridPhase);
  vec3 iridB = sampleBlobSpectrum(iridPhase + refrSpread);
  vec3 iridBase = vec3(iridR.r, iridG.g, iridB.b);

  // Плавное насыщение тела блоба (65%) цветом активной секции
  vec3 activeBody = mix(iridBase, sectionPalette, 0.65);

  // Подповерхностное рассеивание (Subsurface Scattering — полупрозрачная мармеладная глубина)
  float sss = pow(max(dot(view, -lightDir), 0.0), 2.8) * 0.65;
  vec3 sssGlow = mix(sectionColorB, uGold, 0.45) * sss;

  // Глубокий тёмно-индиговый внутренний слой
  vec3 deepCore = mix(uVoid, uIndigo, 0.38);
  vec3 bodyDiffuse = mix(deepCore, activeBody, 0.6 + NdotL * 0.4);

  // Отражение процедурной студии (глянцевый финиш)
  vec3 studioRefl = getStudioReflection(reflect(-view, n));

  // Двухкомпонентный блик (фирменный clearcoat в стиле Blobmixer)
  vec3 halfVec = normalize(lightDir + view);
  float NdotH = max(dot(n, halfVec), 0.0);

  float satinSpec = pow(NdotH, 18.0) * 0.35;
  float clearcoatSpec = pow(NdotH, 110.0) * 0.95;

  // Вторичные контурные источники света (rim lights)
  vec3 rimDir1 = normalize(vec3(-2.2, 1.8, 1.0));
  vec3 rimDir2 = normalize(vec3(2.0, -1.2, 1.2));
  float rimSpec1 = pow(max(dot(n, normalize(rimDir1 + view)), 0.0), 32.0) * 0.6;
  float rimSpec2 = pow(max(dot(n, normalize(rimDir2 + view)), 0.0), 24.0) * 0.5;

  // Френелевское краевое свечение
  vec3 rimColor = mix(sectionColorA, sectionColorB, sin(uColorTime * 0.6) * 0.5 + 0.5);
  float rimGlow = vFresnel * (1.15 + uPulseGlow * 0.5 + uWobble * 0.4);

  // Композитинг финального цвета
  vec3 color = bodyDiffuse;
  color += studioRefl * 0.42;
  color += sssGlow;
  color += satinSpec * activeBody * 0.6;
  color += clearcoatSpec * uMist * 0.85;
  color += rimSpec1 * sectionColorA;
  color += rimSpec2 * sectionColorB;
  color += rimColor * rimGlow;

  // Дополнительная люминесценция во время 5-секундного вдоха и тактильного колебания
  color += sectionPalette * (uPulseGlow * 0.18 + uWobble * 0.35);

  // Тоновая компрессия контраста
  color = pow(color, vec3(0.92));

  float alpha = clamp(0.88 + vFresnel * 0.12, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
