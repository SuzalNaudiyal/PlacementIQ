import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import './meadow-hero.css';
import { Sparkles, ArrowRight } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Colors & Shading - Custom Tailored for HireMatrix Cyber-Indigo Palette    */
/* -------------------------------------------------------------------------- */

const MEADOW_COLORS = {
  flowers: ["#14050d", "#3a0f28", "#74275a", "#9a4c82", "#d988b4", "#fce4ef", "#ffffff"],
  sky: "#12142e",
  straw: ["#3b3528", "#6f6650"]
};

const COIN_METAL = [
  "#ffffff",
  "#f8e2ec",
  "#dba5bd",
  "#8b4d6e",
  "#c889a7",
  "#fff3f8",
  "#a65e83"
];
const COIN_TINT = "#74275a";

/* -------------------------------------------------------------------------- */
/* Math & Procedural Geometry Helpers                                         */
/* -------------------------------------------------------------------------- */

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function createPrng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function blendHex(c1: string, c2: string, ratio: number): string {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = clamp(ratio, 0, 1);
  return rgbToHex([
    rgb1[0] + (rgb2[0] - rgb1[0]) * r,
    rgb1[1] + (rgb2[1] - rgb1[1]) * r,
    rgb1[2] + (rgb2[2] - rgb1[2]) * r
  ]);
}

function interpolatePalette(palette: string[], t: number): string {
  if (!palette.length) return "#000000";
  if (palette.length === 1) return palette[0];
  const scaled = clamp(t, 0, 1) * (palette.length - 1);
  const idx = Math.min(palette.length - 2, Math.floor(scaled));
  return blendHex(palette[idx], palette[idx + 1], scaled - idx);
}

interface LayerConfig {
  base: number;
  mounds: [number, number, number][];
  size: [number, number];
  density: number;
  band: number;
  haze: number;
  straws: number;
  wobble: number;
  petals?: boolean;
}

const HERO_LAYERS: LayerConfig[] = [
  {
    base: 0.74,
    mounds: [[0.06, 0.16, 0.1], [0.3, 0.18, 0.065], [0.55, 0.2, 0.05], [0.78, 0.17, 0.09], [0.98, 0.14, 0.13]],
    size: [1.3, 2.5],
    density: 1.15,
    band: 70,
    haze: 0.42,
    straws: 14,
    wobble: 0.012
  },
  {
    base: 0.83,
    mounds: [[0, 0.2, 0.17], [0.2, 0.16, 0.13], [0.44, 0.15, 0.08], [0.64, 0.17, 0.12], [0.92, 0.2, 0.17]],
    size: [1.9, 3.5],
    density: 1.2,
    band: 130,
    haze: 0.16,
    straws: 30,
    wobble: 0.016
  },
  {
    base: 0.95,
    mounds: [[0.1, 0.15, 0.1], [0.31, 0.15, 0.24], [0.52, 0.12, 0.08], [0.7, 0.13, 0.13], [0.87, 0.15, 0.28]],
    size: [2.2, 4.6],
    density: 1.35,
    band: 999,
    haze: 0,
    straws: 40,
    wobble: 0.02,
    petals: true
  }
];

function calculateRidgeHeight(
  x: number,
  width: number,
  height: number,
  cfg: LayerConfig,
  offset: number,
  scale: number
): number {
  const baseH = cfg.base * height;
  let h = baseH;
  for (const m of cfg.mounds) {
    const dist = (x - m[0] * width) / Math.max(1, m[1] * width);
    if (dist > -1 && dist < 1) {
      h = Math.min(h, baseH - m[2] * height * Math.pow(1 - dist * dist, 0.7));
    }
  }
  const factor = x / scale;
  const wobble =
    Math.sin(factor * 0.031 + offset) * 0.5 +
    Math.sin(factor * 0.077 + offset * 2.3) * 0.3 +
    Math.sin(factor * 0.19 + offset * 4.1) * 0.2;
  return h + wobble * cfg.wobble * height;
}

interface MeadowRenderData {
  W: number;
  H: number;
  ridge: [number, number][];
  top: number;
  fill: [string, string];
  items: any[];
}

function generateMeadowData(
  cfg: LayerConfig,
  width: number,
  height: number,
  seed: number,
  colors: { flowers: string[]; sky: string; straw: string[] }
): MeadowRenderData {
  const prng = createPrng(seed);
  const scale = clamp(width / 1200, 0.6, 1.4);
  const offset = prng() * 100;
  const ridgeFn = (x: number) => calculateRidgeHeight(x, width, height, cfg, offset, scale);
  const applyHaze = (color: string, depth: number) =>
    cfg.haze > 0 ? blendHex(color, colors.sky, cfg.haze * (1 - depth * 0.35)) : color;

  const colorSteps = 48;
  const flowerGrad: string[] = [];
  const flowerHigh: string[] = [];
  const flowerShad: string[] = [];

  for (let i = 0; i < colorSteps; i++) {
    const f = interpolatePalette(colors.flowers, i / (colorSteps - 1));
    flowerGrad.push(f);
    flowerHigh.push(blendHex(f, "#ffffff", 0.3));
    flowerShad.push(blendHex(f, colors.flowers[0], 0.35));
  }

  const ridge: [number, number][] = [];
  let topY = height;
  for (let x = -12; x <= width + 12; x += 6) {
    const y = ridgeFn(x);
    ridge.push([x, y]);
    topY = Math.min(topY, y);
  }

  const minR = cfg.size[0] * scale;
  const maxR = cfg.size[1] * scale;
  const avgR = (minR + maxR) / 2;
  const band = cfg.band * scale;

  let totalArea = 0;
  for (const pt of ridge) {
    totalArea += Math.max(0, Math.min(band, height - pt[1]) + maxR * 1.4) * 6;
  }

  const flowerCount = Math.min(38000, Math.round((cfg.density * totalArea) / (Math.PI * avgR * avgR)));
  const items: any[] = [];
  const petalMultiplier = cfg.petals ? 1.5 : 1;
  const minG = 24 * scale * petalMultiplier;
  const maxG = 62 * scale * petalMultiplier;
  const clusters: [number, number, number][] = [];
  const clusterCount = Math.min(900, Math.round((totalArea / (Math.PI * Math.pow((minG + maxG) / 2, 2))) * 2.4));

  for (let i = 0; i < clusterCount; i++) {
    const cx = prng() * (width + 60) - 30;
    const cy = ridgeFn(cx);
    clusters.push([
      cx,
      cy + prng() * (Math.max(0, Math.min(band, height - cy)) + 10 * scale),
      minG + (maxG - minG) * prng()
    ]);
  }

  let attempts = flowerCount * 8;
  let placed = 0;
  while (placed < flowerCount && attempts-- > 0) {
    const fx = prng() * (width + 24) - 12;
    const ry = ridgeFn(fx);
    const range = Math.max(0, Math.min(band, height - ry));
    const fy = ry - maxR * 1.4 + prng() * (range + maxR * 1.4);
    const depth = clamp((fy - ry) / Math.max(40 * scale, Math.min(height - ry, band) * 0.95), 0, 1);
    const rad = (minR + (maxR - minR) * Math.pow(prng(), 1.7)) * (1 + depth * (cfg.petals ? 0.45 : 0.2));

    if (fy < ry - rad * (0.3 + prng() * 0.9)) continue;

    const slope = (ridgeFn(fx - 8 * scale) - ridgeFn(fx + 8 * scale)) / (16 * scale);
    let maxClusterW = 0;
    let clusterAngle = 0;

    for (const cl of clusters) {
      const dx = fx - cl[0];
      const dy = fy - cl[1];
      if (dx > cl[2] || dx < -cl[2] || dy > cl[2] || dy < -cl[2]) continue;
      const distSq = (dx * dx + dy * dy) / (cl[2] * cl[2]);
      if (distSq >= 1) continue;
      const w = Math.sqrt(1 - distSq);
      if (w > maxClusterW) {
        maxClusterW = w;
        clusterAngle = clamp((-0.55 * dx - 0.83 * dy) / cl[2], -1, 1);
      }
    }

    const clusterInfluence = maxClusterW * (0.45 + (clusterAngle * 0.5 + 0.5) * 0.55);
    const ridgeDist = Math.exp(-Math.max(0, fy - ry) / (22 * scale));
    let colorIdx = 0.22 + clusterInfluence * 0.72 + ridgeDist * 0.2 - depth * 0.16 + clamp(slope, -1, 1) * 0.12 + (prng() - 0.5) * 0.2;
    if (clusterInfluence > 0.55 && prng() < 0.035) {
      colorIdx += 0.22;
    }

    const finalIdx = Math.round(clamp(colorIdx, 0, 1) * (colorSteps - 1));
    items.push({
      t: 0,
      x: fx,
      y: fy,
      r: rad,
      c: applyHaze(flowerGrad[finalIdx], depth),
      h: applyHaze(flowerHigh[finalIdx], depth),
      k: applyHaze(flowerShad[finalIdx], depth),
      p: !!cfg.petals && rad > 2.2,
      a: prng() * Math.PI
    });
    placed++;
  }

  for (let i = 0; i < cfg.straws; i++) {
    const sx = prng() * width;
    if (ridgeFn(sx) > height - 6 * scale) continue;
    const sy = ridgeFn(sx) + (3 + prng() * 16) * scale;
    const len = (14 + prng() * 38) * scale * (cfg.petals ? 1.3 : 1);
    const angle = (prng() - 0.5) * 0.9;
    const ex = sx + Math.sin(angle) * len;
    const ey = sy - Math.cos(angle) * len;
    const bend = (prng() - 0.5) * len * 0.35;

    items.push({
      t: 1,
      x: sx,
      y: sy,
      x2: ex,
      y2: ey,
      cx: (sx + ex) / 2 + bend,
      cy: (sy + ey) / 2,
      w: (0.5 + prng() * 0.9) * scale * (cfg.petals ? 1.3 : 1),
      c: applyHaze(blendHex(colors.straw[0], colors.straw[1], prng()), 0),
      head: prng() < 0.4
    });
  }

  items.sort((a, b) => a.y - b.y);

  return {
    W: width,
    H: height,
    ridge,
    top: topY,
    fill: [applyHaze(interpolatePalette(colors.flowers, 0.32), 0), applyHaze(interpolatePalette(colors.flowers, 0.1), 1)],
    items
  };
}

function renderMeadowToCanvas(ctx: CanvasRenderingContext2D, data: MeadowRenderData) {
  const grad = ctx.createLinearGradient(0, data.top, 0, data.H);
  grad.addColorStop(0, data.fill[0]);
  grad.addColorStop(1, data.fill[1]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(data.ridge[0][0], data.H + 2);
  for (const pt of data.ridge) {
    ctx.lineTo(pt[0], pt[1] + 3);
  }
  ctx.lineTo(data.ridge[data.ridge.length - 1][0], data.H + 2);
  ctx.closePath();
  ctx.fill();
  ctx.lineCap = "round";

  const TWO_PI = Math.PI * 2;
  for (const item of data.items) {
    if (item.t === 1) {
      ctx.strokeStyle = item.c;
      ctx.lineWidth = item.w;
      ctx.beginPath();
      ctx.moveTo(item.x, item.y);
      ctx.quadraticCurveTo(item.cx, item.cy, item.x2, item.y2);
      ctx.stroke();
      if (item.head) {
        ctx.fillStyle = item.c;
        ctx.beginPath();
        ctx.ellipse(
          item.x2,
          item.y2,
          item.w * 1.3,
          item.w * 3.4,
          Math.atan2(item.y2 - item.cy, item.x2 - item.cx) + Math.PI / 2,
          0,
          TWO_PI
        );
        ctx.fill();
      }
      continue;
    }

    const { x, y, r } = item;
    if (item.p) {
      ctx.fillStyle = item.k;
      ctx.beginPath();
      ctx.arc(x + r * 0.15, y + r * 0.35, r * 0.95, 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = item.c;
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const theta = item.a + (p * TWO_PI) / 5;
        const px = x + Math.cos(theta) * r * 0.52;
        const py = y + Math.sin(theta) * r * 0.46;
        ctx.moveTo(px + r * 0.47, py);
        ctx.arc(px, py, r * 0.47, 0, TWO_PI);
      }
      ctx.fill();

      ctx.fillStyle = item.h;
      ctx.beginPath();
      ctx.arc(x - r * 0.1, y - r * 0.12, r * 0.24, 0, TWO_PI);
      ctx.fill();
    } else {
      ctx.fillStyle = item.c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TWO_PI);
      ctx.fill();
      if (r > 1.6) {
        ctx.fillStyle = item.h;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.34, 0, TWO_PI);
        ctx.fill();
      }
    }
  }
}

const MeadowCanvasLayer: React.FC<{
  layer: LayerConfig;
  seed: number;
  className?: string;
}> = ({ layer, seed, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let timer = 0;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const data = generateMeadowData(layer, w, h, seed, MEADOW_COLORS);
        renderMeadowToCanvas(ctx, data);
        setIsDrawn(true);
      }
    };

    render();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, 140);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [layer, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`meadow-canvas ${className || ""}`}
      data-drawn={isDrawn ? "true" : "false"}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* Metallic Coin SVG Generator                                                */
/* -------------------------------------------------------------------------- */

const MetallicCoinSvg: React.FC<{ k?: number; side?: number; thick?: number }> = ({
  k = 0.8,
  side = 1,
  thick = 0.17
}) => {
  const uid = "mcoin" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const baseR = 50;
  const rx = baseR * k;
  const steps = 16;
  const offsetSide = side * thick * baseR;
  const getUrl = (sub: string) => `url(#${uid}${sub})`;

  const ridges: React.ReactNode[] = [];
  for (let s = steps; s >= 1; s--) {
    ridges.push(
      <ellipse
        key={s}
        cx={(offsetSide * s) / steps}
        cy={0}
        rx={rx}
        ry={baseR}
        fill={getUrl("r")}
        stroke={COIN_METAL[s % 2 ? 1 : 3]}
        strokeWidth={0.7}
        strokeDasharray="1.1 1.6"
        strokeOpacity={0.7}
      />
    );
  }

  return (
    <svg viewBox="-64 -58 128 116" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}f`} x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={COIN_METAL[0]} />
          <stop offset="0.2" stopColor={COIN_METAL[1]} />
          <stop offset="0.42" stopColor={COIN_METAL[2]} />
          <stop offset="0.53" stopColor={COIN_METAL[3]} />
          <stop offset="0.66" stopColor={COIN_METAL[4]} />
          <stop offset="0.84" stopColor={COIN_METAL[5]} />
          <stop offset="1" stopColor={COIN_METAL[6]} />
        </linearGradient>
        <linearGradient id={`${uid}i`} x1="0.9" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor={COIN_METAL[5]} />
          <stop offset="0.35" stopColor={COIN_METAL[2]} />
          <stop offset="0.6" stopColor={COIN_METAL[1]} />
          <stop offset="1" stopColor={COIN_METAL[3]} />
        </linearGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COIN_METAL[4]} />
          <stop offset="0.35" stopColor={COIN_METAL[3]} />
          <stop offset="0.6" stopColor={COIN_METAL[1]} />
          <stop offset="1" stopColor={COIN_METAL[6]} />
        </linearGradient>
        <radialGradient id={`${uid}t`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={COIN_TINT} stopOpacity="0.25" />
          <stop offset="0.6" stopColor={COIN_TINT} stopOpacity="0.08" />
          <stop offset="1" stopColor={COIN_TINT} stopOpacity="0" />
        </radialGradient>
      </defs>

      {ridges}
      <ellipse cx={offsetSide} cy={0} rx={rx} ry={baseR} fill={getUrl("f")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.94} ry={baseR * 0.94} fill={getUrl("i")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.88} ry={baseR * 0.88} fill={getUrl("f")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.88} ry={baseR * 0.88} fill={getUrl("t")} />

      <g transform={`translate(${offsetSide}, 0) scale(${k * 0.75}, 0.75)`}>
        <path
          d="M0 -22C1.5 -7 7 -1.5 22 0C7 1.5 1.5 7 0 22C-1.5 7 -7 1.5 -22 0C-7 -1.5 -1.5 -7 0 -22Z"
          fill="#ffffff"
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="4.2" fill={COIN_METAL[3]} />
      </g>
    </svg>
  );
};

const FloatingCoin: React.FC<{
  variant: "a" | "b";
  badgeText: string;
}> = ({ variant, badgeText }) => {
  const [spinCount, setSpinCount] = useState(0);

  return (
    <button
      type="button"
      className={`meadow-coin meadow-coin--${variant}`}
      data-spin={spinCount > 0 ? "true" : "false"}
      aria-label={`Interactive coin - ${badgeText}`}
      onClick={() => setSpinCount((c) => c + 1)}
      onAnimationEnd={(e) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === "svg") {
          setSpinCount(0);
        }
      }}
    >
      <span className="meadow-coinbody">
        <MetallicCoinSvg
          key={spinCount}
          k={variant === "a" ? 0.82 : 0.66}
          side={variant === "a" ? 1 : -1}
          thick={variant === "a" ? 0.14 : 0.2}
        />
      </span>
      {spinCount > 0 && <span className="meadow-coinpop" key={`p${spinCount}`}>{badgeText}</span>}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Drifting Pollen Particles                                                  */
/* -------------------------------------------------------------------------- */

const PollenParticles: React.FC<{ count?: number }> = ({ count = 16 }) => {
  const particles = useMemo(() => {
    const prng = createPrng(17);
    const list: React.CSSProperties[] = [];
    for (let i = 0; i < count; i++) {
      const size = 2.5 + prng() * 3.5;
      list.push({
        left: (4 + prng() * 92).toFixed(1) + "%",
        bottom: (10 + prng() * 26).toFixed(1) + "%",
        width: size,
        height: size,
        animationDuration: (8 + prng() * 8).toFixed(1) + "s",
        animationDelay: (-prng() * 14).toFixed(1) + "s"
      });
    }
    return list;
  }, [count]);

  return (
    <div className="meadow-pollen" aria-hidden="true">
      {particles.map((style, idx) => (
        <i key={idx} style={style} />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Flower Meadow Hero for HireMatrix AI                                        */
/* -------------------------------------------------------------------------- */

interface FlowerMeadowHeroProps {
  onGetStarted: () => void;
  onWatchTour: () => void;
}

export const FlowerMeadowHero: React.FC<FlowerMeadowHeroProps> = ({
  onGetStarted,
  onWatchTour
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (((e.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3);
    const py = (((e.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3);
    stage.style.setProperty("--lml-px", px);
    stage.style.setProperty("--lml-py", py);
  };

  const handlePointerLeave = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.style.setProperty("--lml-px", "0");
      stage.style.setProperty("--lml-py", "0");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mb-16">
      {/* Curved Meadow Stage Container */}
      <div
        ref={stageRef}
        className="meadow-stage relative p-6 sm:p-10 lg:p-16 flex flex-col items-center justify-center text-center cursor-crosshair overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Procedural Canvas Layer 0 (Back Mounds) */}
        <MeadowCanvasLayer
          className="meadow-layer meadow-l0"
          layer={HERO_LAYERS[0]}
          seed={11}
        />

        {/* Procedural Canvas Layer 1 (Mid Mounds) */}
        <MeadowCanvasLayer
          className="meadow-layer meadow-l1"
          layer={HERO_LAYERS[1]}
          seed={23}
        />

        {/* Interactive 3D Metallic Coins */}
        <div className="meadow-coins">
          <FloatingCoin
            variant="a"
            badgeText="🎯 +94.8% Placement Odds"
          />
          <FloatingCoin
            variant="b"
            badgeText="⚡ Zero Google Forms"
          />
        </div>

        {/* Procedural Canvas Layer 2 (Foreground 5-Petal Botanical Blooms) */}
        <MeadowCanvasLayer
          className="meadow-layer meadow-l2"
          layer={HERO_LAYERS[2]}
          seed={37}
        />

        {/* Drifting Fireflies / Pollen */}
        <PollenParticles count={18} />

        {/* HireMatrix AI Native Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Top Pill Badge */}
          <div className="mb-4 flex justify-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-semibold shadow-md backdrop-blur-md animate-float">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Career Intelligence & Placement Readiness OS</span>
            </div>
          </div>

          {/* Glowing Dynamic Hero Title with HireMatrix Typography */}
          <div className="relative flex justify-center items-center w-full my-2">
            <div className="title-aura" aria-hidden="true" />
            <h1 className="relative text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight hero-glow-fx text-center">
              <span className="hero-title-gradient hover:scale-[1.02] transition-transform duration-300 cursor-default select-none">
                HireMatrix
              </span>{' '}
              <span className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 border border-indigo-400/40 shadow-lg shadow-indigo-500/30 backdrop-blur-md align-middle text-2xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 animate-text-shimmer">
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                AI
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-indigo-100 text-center">
            AI Placement &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Skill Gap Analyzer
            </span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-2xl mx-auto text-center leading-relaxed drop-shadow-sm">
            Evaluate placement readiness, parse resumes with NLP, identify missing skills for specific job roles, match against industry opportunities, and follow an explainable 8-week roadmap.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <span>Get Started (Sign In / Register)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onWatchTour}
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold text-sm shadow-xl flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Watch HireMatrix Tour</span>
            </button>
          </div>

          {/* Value Proposition Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 max-w-2xl">
            {[
              { label: 'Explainable TreeSHAP ML', icon: '🎯', color: 'border-indigo-500/40 text-indigo-200 bg-indigo-950/60' },
              { label: 'SVAR Voice AI & Aptitude', icon: '🎙️', color: 'border-cyan-500/40 text-cyan-200 bg-cyan-950/60' },
              { label: 'Zero Google Forms', icon: '🏢', color: 'border-emerald-500/40 text-emerald-200 bg-emerald-950/60' },
              { label: '1-Click Campus Apply', icon: '⚡', color: 'border-amber-500/40 text-amber-200 bg-amber-950/60' },
              { label: 'Real-Time Recruiter Shortlists', icon: '📊', color: 'border-purple-500/40 text-purple-200 bg-purple-950/60' },
            ].map((item) => (
              <div
                key={item.label}
                className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] shadow-sm cursor-default ${item.color}`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerMeadowHero;
