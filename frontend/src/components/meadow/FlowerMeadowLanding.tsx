import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import './meadow.css';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Palette Definitions (Lilac, Rose, Cornflower)                               */
/* -------------------------------------------------------------------------- */

export interface MeadowPalette {
  label: string;
  flowers: string[];
  nightFlowers: string[];
  sky: string[];
  nightSky: string[];
  metal: string[];
  deep: string;
  wash: string;
  wash2: string;
  accent: string;
}

export const PALETTES: Record<string, MeadowPalette> = {
  rose: {
    label: "Rose",
    flowers: ["#3a0d22", "#6d1c45", "#ad4278", "#e38bb3", "#f8d0e1", "#fff6fa"],
    nightFlowers: ["#14050d", "#3a0f28", "#74275a", "#b65690", "#eba3c6", "#ffe6f1"],
    sky: ["#e6c0d1", "#f3dde7", "#fbf3f6"],
    nightSky: ["#1c0a16", "#391530", "#62284f"],
    metal: ["#ffffff", "#f8e2ec", "#dba5bd", "#a2607f", "#efc6d8", "#fff3f8", "#c48aa5"],
    deep: "#3a1b2d",
    wash: "#f3d8e4",
    wash2: "#faf0f4",
    accent: "#ad4278"
  },
  lilac: {
    label: "Lilac",
    flowers: ["#1c1540", "#34287a", "#5f4fb8", "#9a8cec", "#d6cfff", "#f8f6ff"],
    nightFlowers: ["#07061a", "#191443", "#352b86", "#6a5bcc", "#b2a6f6", "#ebe7ff"],
    sky: ["#b5b4e5", "#d9d8f3", "#f2f1fb"],
    nightSky: ["#0e0c24", "#211c4a", "#3c3379"],
    metal: ["#ffffff", "#e3e0fb", "#a8a2da", "#6c65ab", "#c9c4f0", "#f3f1ff", "#8d87c6"],
    deep: "#25203d",
    wash: "#d8d6f3",
    wash2: "#efeefa",
    accent: "#5f4fb8"
  },
  cornflower: {
    label: "Cornflower",
    flowers: ["#0a1838", "#1b3680", "#3762c4", "#7ca2ee", "#c9d9ff", "#f5f8ff"],
    nightFlowers: ["#030918", "#0f2150", "#21479c", "#4f7fdc", "#9ec0fb", "#e3edff"],
    sky: ["#b3c5ea", "#d7e2f5", "#f1f5fc"],
    nightSky: ["#08102a", "#152452", "#25407f"],
    metal: ["#ffffff", "#e1e9fb", "#a2b6dd", "#5f78ac", "#c3d3f1", "#f2f6ff", "#869bc9"],
    deep: "#17223f",
    wash: "#d5dff5",
    wash2: "#eef2fb",
    accent: "#3762c4"
  }
};

const STRAW_LIGHT = ["#dccb9f", "#9c8657"];
const STRAW_DARK = ["#6f6650", "#3b3528"];

/* -------------------------------------------------------------------------- */
/* Math & Color Helpers                                                       */
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

/* -------------------------------------------------------------------------- */
/* Procedural Meadow Geometry & Canvas Engine                                 */
/* -------------------------------------------------------------------------- */

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
    base: 0.71,
    mounds: [[0.06, 0.16, 0.1], [0.3, 0.18, 0.065], [0.55, 0.2, 0.05], [0.78, 0.17, 0.09], [0.98, 0.14, 0.13]],
    size: [1.3, 2.5],
    density: 1.15,
    band: 70,
    haze: 0.42,
    straws: 14,
    wobble: 0.012
  },
  {
    base: 0.81,
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

const JOIN_LAYERS: LayerConfig[] = [
  {
    base: 0.72,
    mounds: [[0.12, 0.2, 0.08], [0.45, 0.2, 0.05], [0.8, 0.22, 0.1]],
    size: [1.3, 2.5],
    density: 1.1,
    band: 70,
    haze: 0.42,
    straws: 10,
    wobble: 0.012
  },
  {
    base: 0.84,
    mounds: [[0.05, 0.18, 0.14], [0.3, 0.18, 0.09], [0.6, 0.15, 0.08], [0.9, 0.2, 0.15]],
    size: [1.9, 3.5],
    density: 1.2,
    band: 130,
    haze: 0.16,
    straws: 24,
    wobble: 0.016
  },
  {
    base: 0.97,
    mounds: [[0.16, 0.16, 0.14], [0.42, 0.14, 0.07], [0.74, 0.14, 0.2], [0.98, 0.14, 0.12]],
    size: [2.6, 5.2],
    density: 1.25,
    band: 999,
    haze: 0,
    straws: 30,
    wobble: 0.02,
    petals: true
  }
];

const CARD_MEADOW_LAYER: LayerConfig = {
  base: 1.08,
  mounds: [[0.7, 0.2, 0.78], [0.94, 0.16, 0.66], [0.5, 0.1, 0.36]],
  size: [2.2, 4.4],
  density: 1.25,
  band: 999,
  haze: 0,
  straws: 16,
  wobble: 0.03,
  petals: true
};

const ART_MEADOW_LAYER: LayerConfig = {
  base: 0.62,
  mounds: [[0.08, 0.2, 0.36], [0.36, 0.2, 0.12], [0.66, 0.2, 0.2], [0.95, 0.2, 0.42]],
  size: [2.2, 4.2],
  density: 1.25,
  band: 999,
  haze: 0,
  straws: 22,
  wobble: 0.03,
  petals: true
};

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

  const flowerCount = Math.min(42000, Math.round((cfg.density * totalArea) / (Math.PI * avgR * avgR)));
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
      // Blade / Grass straw
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
      // 5-Petal Flower
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
      // Simple flower bud
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

/* -------------------------------------------------------------------------- */
/* Meadow Canvas Layer React Component                                        */
/* -------------------------------------------------------------------------- */

interface MeadowCanvasProps {
  layer: LayerConfig;
  seed: number;
  colors: { flowers: string[]; sky: string; straw: string[] };
  className?: string;
  style?: React.CSSProperties;
}

export const MeadowCanvasLayer: React.FC<MeadowCanvasProps> = ({ layer, seed, colors, className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);
  const colorKey = colors.flowers.join("") + colors.sky + colors.straw.join("");
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let lastKey = "";
    let timer = 0;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const currentKey = `${w}x${h}_${colorKey}`;
      if (currentKey === lastKey) return;
      lastKey = currentKey;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const data = generateMeadowData(layer, w, h, seed, colorsRef.current);
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
  }, [colorKey, layer, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`lml-canvas ${className || ""}`}
      data-drawn={isDrawn ? "true" : "false"}
      style={style}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* 3D Metallic Coin SVG Component                                             */
/* -------------------------------------------------------------------------- */

interface MetallicCoinSvgProps {
  metal: string[];
  tint: string;
  k?: number;
  side?: number;
  thick?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MetallicCoinSvg: React.FC<MetallicCoinSvgProps> = ({
  metal,
  tint,
  k = 0.8,
  side = 1,
  thick = 0.17,
  className,
  style
}) => {
  const uid = "lml" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
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
        stroke={metal[s % 2 ? 1 : 3]}
        strokeWidth={0.7}
        strokeDasharray="1.1 1.6"
        strokeOpacity={0.7}
      />
    );
  }

  return (
    <svg
      viewBox="-64 -58 128 116"
      className={`lml-svg ${className || ""}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}f`} x1="0.1" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={metal[0]} />
          <stop offset="0.2" stopColor={metal[1]} />
          <stop offset="0.42" stopColor={metal[2]} />
          <stop offset="0.53" stopColor={metal[3]} />
          <stop offset="0.66" stopColor={metal[4]} />
          <stop offset="0.84" stopColor={metal[5]} />
          <stop offset="1" stopColor={metal[6]} />
        </linearGradient>
        <linearGradient id={`${uid}i`} x1="0.9" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor={metal[5]} />
          <stop offset="0.35" stopColor={metal[2]} />
          <stop offset="0.6" stopColor={metal[1]} />
          <stop offset="1" stopColor={metal[3]} />
        </linearGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={metal[4]} />
          <stop offset="0.35" stopColor={metal[3]} />
          <stop offset="0.6" stopColor={metal[1]} />
          <stop offset="1" stopColor={metal[6]} />
        </linearGradient>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.5" stopColor={metal[1]} stopOpacity="0.2" />
          <stop offset="1" stopColor={metal[4]} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id={`${uid}t`} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor={tint} stopOpacity="0.22" />
          <stop offset="0.6" stopColor={tint} stopOpacity="0.08" />
          <stop offset="1" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>

      {ridges}
      <ellipse cx={offsetSide} cy={0} rx={rx} ry={baseR} fill={getUrl("f")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.94} ry={baseR * 0.94} fill={getUrl("i")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.88} ry={baseR * 0.88} fill={getUrl("f")} />
      <ellipse cx={offsetSide} cy={0} rx={rx * 0.88} ry={baseR * 0.88} fill={getUrl("t")} />

      {/* Coin Center Emblem */}
      <g transform={`translate(${offsetSide}, 0) scale(${k * 0.75}, 0.75)`}>
        <path
          d="M0 -22C1.5 -7 7 -1.5 22 0C7 1.5 1.5 7 0 22C-1.5 7 -7 1.5 -22 0C-7 -1.5 -1.5 -7 0 -22Z"
          fill={getUrl("g")}
          stroke={metal[3]}
          strokeWidth="0.8"
        />
        <circle cx="0" cy="0" r="4.2" fill={metal[0]} />
      </g>
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Interactive Flippable Coin                                                 */
/* -------------------------------------------------------------------------- */

interface FloatingCoinProps {
  variant: "a" | "b";
  metal: string[];
  tint: string;
  badgeText: string;
  reduced?: boolean;
}

export const FloatingCoin: React.FC<FloatingCoinProps> = ({ variant, metal, tint, badgeText, reduced }) => {
  const [spinCount, setSpinCount] = useState(0);

  return (
    <button
      type="button"
      className={`lml-coin lml-coin--${variant}`}
      data-spin={spinCount > 0 && !reduced ? "true" : "false"}
      aria-label={`Interactive coin - ${badgeText}`}
      onClick={() => setSpinCount((c) => c + 1)}
      onAnimationEnd={(e) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === "svg") {
          setSpinCount(0);
        }
      }}
    >
      <span className="lml-coinbody">
        <MetallicCoinSvg
          key={spinCount}
          metal={metal}
          tint={tint}
          k={variant === "a" ? 0.82 : 0.66}
          side={variant === "a" ? 1 : -1}
          thick={variant === "a" ? 0.14 : 0.2}
        />
      </span>
      {spinCount > 0 && <span className="lml-coinpop" key={`p${spinCount}`}>{badgeText}</span>}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Drifting Pollen / Fireflies Particles                                      */
/* -------------------------------------------------------------------------- */

export const PollenParticles: React.FC<{ seed?: number; count?: number }> = ({ seed = 5, count = 16 }) => {
  const particles = useMemo(() => {
    const prng = createPrng(seed);
    const list: React.CSSProperties[] = [];
    for (let i = 0; i < count; i++) {
      const size = 2 + prng() * 3;
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
  }, [seed, count]);

  return (
    <div className="lml-pollen" aria-hidden="true">
      {particles.map((style, idx) => (
        <i key={idx} style={style} />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SVG Sparkle & Decorative Visuals                                           */
/* -------------------------------------------------------------------------- */

export const SparkleStar: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg viewBox="-12 -12 24 24" width={size} height={size} className={`lml-svg ${className || ""}`} aria-hidden="true">
    <path d="M0 -11C1.1 -3.2 3.2 -1.1 11 0C3.2 1.1 1.1 3.2 0 11C-1.1 3.2 -3.2 1.1 -11 0C-3.2 -1.1 -1.1 -3.2 0 -11Z" fill="currentColor" />
  </svg>
);

export const ArrowChevron: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} className="lml-svg" aria-hidden="true">
    <path d="M2.5 8h10.5M9 3.8 13.2 8 9 12.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PegVisualization: React.FC = () => {
  const points: string[] = [];
  for (let a = 0; a <= 24; a++) {
    const o = 30 + Math.sin(a * 1.7) * (a < 5 ? 3 : 1.2) * Math.cos(a * 0.6);
    points.push((a * 5).toFixed(1) + " " + o.toFixed(1));
  }
  return (
    <svg viewBox="0 -2 120 64" className="lml-svg lml-peg" aria-hidden="true">
      <path d="M0 30H120" stroke="rgba(255,255,255,.28)" strokeDasharray="2 3" />
      <text x="0" y="16" fontSize="9" fill="rgba(255,255,255,.6)">95% Fit</text>
      <path className="lml-pegline" d={"M" + points.join("L")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="lml-pegdot" cx="120" cy="30" r="3" fill="currentColor" />
    </svg>
  );
};

export const AutoPilotOrbit: React.FC = () => {
  const [isOn, setIsOn] = useState(true);
  return (
    <div className="lml-auto">
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label="Auto-pilot Campus Sync"
        className="lml-switch"
        onClick={() => setIsOn((o) => !o)}
      />
      <span className="lml-autolabel">{isOn ? "AI Auto · On" : "AI Auto · Paused"}</span>
      <svg viewBox="-32 -32 64 64" className="lml-svg lml-orbit" data-on={isOn ? "true" : "false"} aria-hidden="true">
        <circle r="24" fill="none" stroke="rgba(255,255,255,.22)" strokeDasharray="2 4" />
        <circle r="13" fill="none" stroke="rgba(255,255,255,.14)" />
        <circle cx="24" cy="0" r="3.4" fill="currentColor" />
        <circle cx="-12" cy="20.8" r="2.4" fill="currentColor" opacity="0.7" />
        <circle cx="0" cy="-13" r="2" fill="currentColor" opacity="0.55" />
      </svg>
    </div>
  );
};

export const BotanicalStemFlower: React.FC<{ pal: { petal: string[]; stem: string[]; cone: string[] }; className?: string }> = ({ pal, className }) => {
  const uid = "lml" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const cx = 104;
  const cy = 108;
  const petalsCount = 15;
  const petalPaths: { d: string; front: boolean; opacity: number }[] = [];

  for (let i = 0; i < petalsCount; i++) {
    const angle = (i / petalsCount) * Math.PI * 2 + 0.2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const x0 = cx + cosA * 20;
    const y0 = cy + sinA * 7;
    const len = 52 + (i % 3) * 5;
    const xEnd = x0 + cosA * len * 0.92;
    const yEnd = y0 + 34 + sinA * 12 + Math.abs(cosA) * 6;
    const normalX = -(yEnd - y0);
    const normalY = xEnd - x0;
    const dist = Math.hypot(normalX, normalY) || 1;
    const w = 7.5;
    const nx = (normalX / dist) * w;
    const ny = (normalY / dist) * w;
    const midX = (x0 + xEnd) / 2 - cosA * 2;
    const midY = (y0 + yEnd) / 2 - 10;

    const pathData = `M${(x0 - nx * 0.35).toFixed(1)} ${(y0 - ny * 0.35).toFixed(1)}Q${(midX - nx).toFixed(1)} ${(midY - ny).toFixed(1)} ${(xEnd - nx * 0.3).toFixed(1)} ${(yEnd - ny * 0.3).toFixed(1)}L${xEnd.toFixed(1)} ${(yEnd + 2).toFixed(1)}L${(xEnd + nx * 0.3).toFixed(1)} ${(yEnd + ny * 0.3).toFixed(1)}Q${(midX + nx).toFixed(1)} ${(midY + ny).toFixed(1)} ${(x0 + nx * 0.35).toFixed(1)} ${(y0 + ny * 0.35).toFixed(1)}Z`;
    petalPaths.push({
      d: pathData,
      front: sinA > -0.15,
      opacity: 0.82 + ((i * 7) % 5) * 0.045
    });
  }

  const coneStipples: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const angle = i * 2.39996;
    const rad = Math.sqrt(i / 70);
    const sx = cx + Math.cos(angle) * rad * 22;
    const sy = cy - 6 + Math.sin(angle) * rad * 13 - (1 - rad) * 6;
    coneStipples.push(
      <path
        key={i}
        d={`M${(sx - 1.6).toFixed(1)} ${(sy + 1).toFixed(1)}L${sx.toFixed(1)} ${(sy - 2.6).toFixed(1)}L${(sx + 1.6).toFixed(1)} ${(sy + 1).toFixed(1)}Z`}
        fill={i % 4 ? pal.cone[0] : pal.cone[1]}
        opacity={0.6 + rad * 0.4}
      />
    );
  }

  return (
    <svg viewBox="0 0 210 380" className={`lml-svg ${className || ""}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.petal[0]} />
          <stop offset="0.55" stopColor={pal.petal[1]} />
          <stop offset="1" stopColor={pal.petal[2]} />
        </linearGradient>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.petal[0]} />
          <stop offset="1" stopColor={pal.petal[1]} />
        </linearGradient>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={pal.stem[0]} />
          <stop offset="1" stopColor={pal.stem[1]} />
        </linearGradient>
        <radialGradient id={`${uid}c`} cx="0.42" cy="0.32" r="0.7">
          <stop offset="0" stopColor={pal.cone[0]} />
          <stop offset="0.55" stopColor={pal.cone[1]} />
          <stop offset="1" stopColor={pal.cone[2]} />
        </radialGradient>
      </defs>
      <path d="M100 380C98 300 112 230 106 120" fill="none" stroke={`url(#${uid}s)`} strokeWidth="5" strokeLinecap="round" />
      <path d="M103 268C82 252 62 254 50 262C68 270 86 272 103 268Z" fill={`url(#${uid}s)`} opacity="0.9" />
      {petalPaths.filter((p) => !p.front).map((p, idx) => (
        <path key={`b${idx}`} d={p.d} fill={`url(#${uid}b)`} opacity={p.opacity * 0.85} />
      ))}
      <ellipse cx={cx} cy={cy - 2} rx={24} ry={17} fill={`url(#${uid}c)`} />
      {coneStipples}
      {petalPaths.filter((p) => p.front).map((p, idx) => (
        <path key={`f${idx}`} d={p.d} fill={`url(#${uid}p)`} opacity={p.opacity} />
      ))}
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Architectural Use-Case Illustrations (Temple, Blocks, Vault)                */
/* -------------------------------------------------------------------------- */

export const TempleIllustration: React.FC<{ c: string[] }> = ({ c }) => {
  const uid = "lml" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const pillars = [96, 148, 212, 264];
  return (
    <svg viewBox="0 0 360 270" className="lml-svg lml-art" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}col`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c[2]} />
          <stop offset="0.12" stopColor={c[0]} />
          <stop offset="0.24" stopColor={c[1]} />
          <stop offset="0.36" stopColor={c[0]} />
          <stop offset="0.5" stopColor={c[1]} />
          <stop offset="0.62" stopColor={c[0]} />
          <stop offset="0.76" stopColor={c[1]} />
          <stop offset="0.88" stopColor={c[2]} />
          <stop offset="1" stopColor={c[3]} />
        </linearGradient>
        <linearGradient id={`${uid}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="1" stopColor={c[1]} />
        </linearGradient>
        <linearGradient id={`${uid}side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
        <radialGradient id={`${uid}sh`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c[3]} stopOpacity="0.45" />
          <stop offset="1" stopColor={c[3]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="190" cy="250" rx="170" ry="22" fill={`url(#${uid}sh)`} />
      <path d="M36 236H318L336 224H54Z" fill={c[0]} />
      <path d="M36 236H318V254H36Z" fill={`url(#${uid}v)`} />
      <path d="M318 236L336 224V242L318 254Z" fill={`url(#${uid}side)`} />
      <path d="M52 220H302L318 210H68Z" fill={c[0]} />
      <path d="M52 220H302V236H52Z" fill={`url(#${uid}v)`} />
      <path d="M302 220L318 210V224L302 236Z" fill={`url(#${uid}side)`} />
      <path d="M66 205H290L304 196H80Z" fill={c[0]} />
      <path d="M66 205H290V220H66Z" fill={`url(#${uid}v)`} />
      <path d="M290 205L304 196V210L290 220Z" fill={`url(#${uid}side)`} />
      <path d="M84 100H290V196H84Z" fill={c[2]} opacity="0.55" />
      {pillars.map((pos) => (
        <g key={pos}>
          <rect x={pos - 12} y="100" width="24" height="96" fill={`url(#${uid}col)`} />
          <rect x={pos - 14} y="96" width="28" height="6" fill={c[0]} />
          <rect x={pos - 14} y="194" width="28" height="6" fill={c[0]} />
        </g>
      ))}
      <polygon points="180,36 60,96 300,96" fill={`url(#${uid}v)`} />
      <polygon points="180,36 300,96 320,88 196,30" fill={`url(#${uid}side)`} />
    </svg>
  );
};

export const BlocksIllustration: React.FC<{ c: string[]; accent: string }> = ({ c, accent }) => {
  const drawBlock = (x: number, y: number, s: number, key: string, withCode?: boolean) => {
    const half = s * 0.5;
    return (
      <g key={key}>
        <path d={`M${x} ${y}l${s} ${-half}l${s} ${half}l${-s} ${half}Z`} fill={c[0]} />
        <path d={`M${x} ${y}l${s} ${half}v${s * 1.05}l${-s} ${-half}Z`} fill={c[1]} />
        <path d={`M${x + s} ${y + half}l${s} ${-half}v${s * 1.05}l${-s} ${half}Z`} fill={c[2]} />
        {withCode && (
          <g transform={`matrix(1 0.5 0 1 ${x + s * 0.18} ${y + s * 0.78})`}>
            <text x="0" y="0" fontSize={s * 0.42} fontFamily="ui-monospace,SFMono-Regular,Menlo,monospace" fontWeight="700" fill={accent} opacity="0.85">
              {"</>"}
            </text>
          </g>
        )}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 360 270" className="lml-svg lml-art" aria-hidden="true">
      <ellipse cx="185" cy="246" rx="150" ry="20" fill={c[3]} opacity="0.25" />
      {drawBlock(90, 112, 90, "a", true)}
      {drawBlock(272, 150, 56, "b")}
      {drawBlock(18, 172, 64, "c")}
    </svg>
  );
};

export const VaultIllustration: React.FC<{ metal: string[]; leaf?: string[] }> = ({ metal }) => {
  const uid = "lml" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const drawCoinRow = (cx: number, cy: number, key: string) => (
    <g key={key}>
      <path d={`M${cx - 46} ${cy}v10a46 13 0 0 0 92 0v-10Z`} fill={`url(#${uid}e)`} />
      <path d={`M${cx - 46} ${cy}v10a46 13 0 0 0 92 0v-10Z`} fill="none" stroke={metal[3]} strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="1 1.8" />
      <ellipse cx={cx} cy={cy} rx={46} ry={13} fill={`url(#${uid}t)`} />
      <ellipse cx={cx} cy={cy} rx={38} ry={10} fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1" />
    </g>
  );

  const stackA = [0, 1, 2, 3, 4, 5, 6].map((i) => drawCoinRow(150, 226 - i * 12, `a${i}`));
  const stackB = [0, 1, 2, 3].map((i) => drawCoinRow(250, 232 - i * 12, `b${i}`));

  return (
    <svg viewBox="0 0 360 270" className="lml-svg lml-art" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}e`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={metal[3]} />
          <stop offset="0.3" stopColor={metal[1]} />
          <stop offset="0.7" stopColor={metal[5]} />
          <stop offset="1" stopColor={metal[4]} />
        </linearGradient>
        <linearGradient id={`${uid}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={metal[0]} />
          <stop offset="1" stopColor={metal[2]} />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="250" rx="140" ry="18" fill="rgba(0,0,0,0.25)" />
      {stackA}
      {stackB}
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Flower Meadow Landing Template Component                              */
/* -------------------------------------------------------------------------- */

export interface FlowerMeadowLandingProps {
  mode?: "fintech" | "career";
  initialPalette?: "rose" | "lilac" | "cornflower";
  onGetStarted?: () => void;
  onWatchTour?: () => void;
  onExploreFeatures?: () => void;
}

export const FlowerMeadowLanding: React.FC<FlowerMeadowLandingProps> = ({
  mode = "career",
  initialPalette = "rose",
  onGetStarted,
  onWatchTour,
  onExploreFeatures
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const [activePaletteKey, setActivePaletteKey] = useState<"rose" | "lilac" | "cornflower">(initialPalette);
  const [activeMode, setActiveMode] = useState<"fintech" | "career">(mode);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Growth / Readiness Simulator State
  const [deposit, setDeposit] = useState(mode === "career" ? 12 : 2500); // 12 weeks of sprint OR $2500 deposit
  const [duration, setDuration] = useState(12);
  const [autoCompound, setAutoCompound] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Email form state
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [formError, setFormError] = useState("");

  const palette = PALETTES[activePaletteKey] || PALETTES.rose;
  const isDark = true; // Dark mode fits HireMatrix's futuristic cyber-violet palette perfectly

  // Mouse Parallax for Meadow Stage
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Growth / Readiness Curve Calculation
  const apyRate = activeMode === "career" ? 94.8 : 4.6; // 94.8% placement readiness vs 4.6% APY
  const benchmarkRate = activeMode === "career" ? 42.0 : 0.45; // 42% manual prep vs 0.45% bank

  const chartSteps = 61;
  const chartData = useMemo(() => {
    const primary: number[] = [];
    const benchmark: number[] = [];
    const r1 = apyRate / 100;
    const r2 = benchmarkRate / 100;
    for (let i = 0; i < chartSteps; i++) {
      const frac = (duration * i) / (chartSteps - 1);
      const val1 = autoCompound ? deposit * Math.pow(1 + r1 / 12, frac) : deposit * (1 + (r1 * frac) / 12);
      const val2 = autoCompound ? deposit * Math.pow(1 + r2 / 12, frac) : deposit * (1 + (r2 * frac) / 12);
      primary.push(val1);
      benchmark.push(val2);
    }
    return { primary, benchmark };
  }, [deposit, duration, autoCompound, apyRate, benchmarkRate]);

  // SVG Chart path generation
  const chartWidth = 600;
  const chartHeight = 260;
  const minVal = deposit * 0.995;
  const maxVal = Math.max(
    chartData.primary[chartData.primary.length - 1],
    chartData.benchmark[chartData.benchmark.length - 1],
    deposit * 1.002
  );

  const getSvgX = (idx: number) => (idx / (chartSteps - 1)) * chartWidth;
  const getSvgY = (val: number) =>
    chartHeight - 14 - ((val - minVal) / Math.max(1e-6, maxVal - minVal)) * (chartHeight - 44);

  const primaryPath = chartData.primary.map((v, i) => `${i === 0 ? "M" : "L"}${getSvgX(i).toFixed(1)} ${getSvgY(v).toFixed(1)}`).join("");
  const benchmarkPath = chartData.benchmark.map((v, i) => `${i === 0 ? "M" : "L"}${getSvgX(i).toFixed(1)} ${getSvgY(v).toFixed(1)}`).join("");
  const areaPath = `${primaryPath}L${chartWidth} ${chartHeight}L0 ${chartHeight}Z`;

  const finalPrimary = chartData.primary[chartData.primary.length - 1];
  const finalBenchmark = chartData.benchmark[chartData.benchmark.length - 1];
  const yieldGained = finalPrimary - deposit;
  const benchmarkGained = finalBenchmark - deposit;
  const multiplier = benchmarkGained > 0 ? yieldGained / benchmarkGained : 1;

  const formatCurrency = (val: number) =>
    activeMode === "career"
      ? `${Math.round(val)}% Score`
      : `$${Math.round(val).toLocaleString()}`;

  const formatDuration = (m: number) =>
    activeMode === "career" ? `${m} Sprints` : `${m} Months`;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setFormState("error");
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormState("sending");
    setFormError("");
    setTimeout(() => {
      setFormState("done");
    }, 600);
  };

  // Content Configuration based on Mode
  const content = useMemo(() => {
    if (activeMode === "career") {
      return {
        brand: "HireMatrix AI",
        badge: "Placement Readiness in Full Bloom",
        heroTitle: "Placement Readiness in\nFull Bloom",
        heroSubtitle: "Evaluate placement probability with Explainable TreeSHAP ML, conquer SVAR voice screening, and bloom your campus career with Zero Google Forms.",
        actionPrimary: "Get Started (Sign In / Register)",
        actionSecondary: "Watch 60s Tour",
        statementTitle: "What is HireMatrix AI?",
        statementBody: "HireMatrix AI is an autonomous Campus Placement & Career Intelligence OS that bridges university engineering students with tier-1 technology recruiters — replacing manual Google Forms with real-time ML readiness scoring, automated shortlists, and AI mock interviews.",
        features: [
          {
            title: "Explainable TreeSHAP ML\nReadiness Odds",
            body: "Supervised ensemble classification benchmarking 10+ student signals to predict placement probability with interactive what-if simulators.",
            visual: "flower"
          },
          {
            title: "SVAR Spoken English &\nAptitude Testing",
            body: "Timed Quantitative MCQs paired with live browser audio pronunciation, fluency, and extempore evaluation scoring.",
            visual: "peg"
          },
          {
            title: "Zero Google Forms\nInstitutional Sync",
            body: "DCPD and TPO administrators manage campus drives, eligibility criteria, and 1-click recruiter shortlists with automated WhatsApp alerts.",
            visual: "autopilot"
          }
        ],
        partners: [
          { name: "Google", glyph: "ring" },
          { name: "Microsoft", glyph: "bars" },
          { name: "Amazon", glyph: "wave" },
          { name: "PhonePe", glyph: "leaf" },
          { name: "TCS Digital", glyph: "hex" },
          { name: "Apex University", glyph: "spark" }
        ],
        useCases: [
          {
            id: "students",
            title: "For Students",
            body: "Unlock real-time placement probability odds, parse resumes with spaCy NLP for ATS readiness, and generate 1-click personalized LinkedIn referral pitch drafts.",
            action: { label: "Explore Student Hub", href: "#" },
            art: "blocks"
          },
          {
            id: "university",
            title: "For University TPOs / DCPD",
            body: "Broadcast verified recruitment drives directly to eligible candidates, eliminate repetitive forms, and export instant HR-compliant candidate CSV shortlists.",
            action: { label: "View DCPD Command Center", href: "#" },
            art: "temple"
          },
          {
            id: "recruiters",
            title: "For Campus Recruiters",
            body: "Inspect verified candidate portfolios with auditable academic consistency, GitHub coding ratings, and objective SVAR voice communication benchmark dossiers.",
            action: { label: "Access Recruiter Portal", href: "#" },
            art: "vault"
          }
        ],
        calcTitle: "Watch Your Readiness Bloom",
        calcKicker: "Readiness Sprint Simulator",
        calcBody: "Simulate how targeted 8-week structured roadmap sprints accelerate your placement probability compared to unguided campus preparation.",
        faqs: [
          {
            q: "How does the Placement Readiness Predictor work?",
            a: "Our supervised ML ensemble models evaluate academic consistency (CGPA, backlogs), coding contest ratings, internship depth, and aptitude scores with SHAP explainability values showing exact top contributors."
          },
          {
            q: "What is the SVAR Voice Assessment test?",
            a: "SVAR evaluates spoken English fluency, pronunciation accuracy, vocabulary breadth, and impromptu extempore thinking through direct in-browser microphone recording analyzed via Web Audio."
          },
          {
            q: "How does HireMatrix eliminate Google Forms for campus drives?",
            a: "University TPO administrators publish drive criteria directly in the ERP hub. Student eligibility is computed automatically from profile grades, allowing 1-click verified campus applications without filling repetitive forms."
          },
          {
            q: "Can I customize the flower meadow palette?",
            a: "Yes! Use the top palette selector to switch between Rose 🌹, Lilac 🪻, and Cornflower 🌸 themes live."
          }
        ]
      };
    } else {
      // Original Petalpay Fintech Template
      return {
        brand: "Petalpay",
        badge: "Fintech Meadow Template by @kedhareswer",
        heroTitle: "Savings in\nFull Bloom",
        heroSubtitle: "A dollar that quietly earns while you sleep. Spend it like cash, hold it like a garden.",
        actionPrimary: "See it grow",
        actionSecondary: "Launch BETA",
        statementTitle: "What is Rose Dollar?",
        statementBody: "Rose Dollar is a yield-bearing stablecoin that helps your capital grow while staying pegged to the U.S. dollar. Spend it like cash, hold it like a garden.",
        features: [
          {
            title: "Capital that grows\nautomatically",
            body: "Earn passive income as your stablecoins are deployed into high-performing, audited DeFi protocols.",
            visual: "flower"
          },
          {
            title: "Always liquid,\nalways dollar-pegged",
            body: "Stay fully dollar-pegged with instant access to your funds — no lockups or redemption delays.",
            visual: "peg"
          },
          {
            title: "100%\nhands-free yield",
            body: "No need to manage complex strategies manually. Smart contracts compound your yield in the background.",
            visual: "autopilot"
          }
        ],
        partners: [
          { name: "Halcyon Labs", glyph: "ring" },
          { name: "KESTREL", glyph: "bars" },
          { name: "Meridian", glyph: "wave" },
          { name: "Aster & Vale", glyph: "leaf" },
          { name: "NorthHex", glyph: "hex" },
          { name: "OPALINE", glyph: "spark" }
        ],
        useCases: [
          {
            id: "business",
            title: "Business",
            body: "Boost user engagement by offering a secure, fiat-backed stablecoin with high yields, allowing your customers to earn effortlessly on your platform.",
            action: { label: "Learn more", href: "#" },
            art: "temple"
          },
          {
            id: "developers",
            title: "Developers",
            body: "Drop a yield-bearing dollar into any app with a few lines of code. Composable token, audited contracts and SDKs for every major chain.",
            action: { label: "Read the docs", href: "#" },
            art: "blocks"
          },
          {
            id: "treasury",
            title: "Treasury",
            body: "Put idle reserves to work without leaving the dollar. Same-day redemptions, on-chain proof of reserves and audit reports.",
            action: { label: "Talk to us", href: "#" },
            art: "vault"
          }
        ],
        calcTitle: "Watch your dollars bloom",
        calcKicker: "Yield calculator",
        calcBody: "Drag to see how a deposit grows at today's rate, next to an average traditional savings account.",
        faqs: [
          {
            q: "Where does the yield come from?",
            a: "Reserves are allocated across short-dated U.S. treasuries and over-collateralised lending markets. Net returns flow back to token holders automatically."
          },
          {
            q: "Is it always worth one dollar?",
            a: "Every token is backed 1:1 by dollar-denominated reserves held with regulated custodians, and can be redeemed for a dollar at any time."
          },
          {
            q: "Can I withdraw at any time?",
            a: "Yes. There are no lockups, cliffs, or exit penalties. Swap on-chain instantly or redeem to your linked bank account."
          }
        ]
      };
    }
  }, [activeMode]);

  const meadowColors = {
    flowers: isDark ? palette.nightFlowers : palette.flowers,
    sky: isDark ? palette.nightSky[2] : palette.sky[2],
    straw: isDark ? STRAW_DARK : STRAW_LIGHT
  };

  const cardMeadowColors = {
    flowers: isDark ? palette.nightFlowers : palette.flowers,
    sky: isDark ? "#1b1828" : palette.wash,
    straw: isDark ? STRAW_DARK : STRAW_LIGHT
  };

  const coinTint = meadowColors.flowers[2];
  const coinMetal = isDark
    ? palette.metal.map((t) => blendHex(t, palette.nightSky[1], 0.38))
    : palette.metal;

  const cardArtPalette = isDark
    ? [
        blendHex(palette.wash2, palette.nightSky[1], 0.25),
        blendHex(palette.wash, palette.nightSky[1], 0.4),
        blendHex(palette.flowers[3], palette.nightSky[1], 0.45),
        blendHex(palette.flowers[2], "#000000", 0.35)
      ]
    : [
        "#ffffff",
        blendHex(palette.wash2, palette.wash, 0.6),
        blendHex(palette.wash, palette.flowers[3], 0.45),
        blendHex(palette.flowers[3], palette.flowers[2], 0.5)
      ];

  const botanicalPalette = {
    petal: [blendHex(palette.flowers[2], palette.flowers[1], 0.35), palette.flowers[3], blendHex(palette.flowers[4], palette.flowers[3], 0.3)],
    stem: isDark ? ["#4f5d33", "#2b3419"] : ["#7d8f49", "#46562a"],
    cone: ["#f2b45c", "#a8521f", "#4c2311"]
  };

  return (
    <div
      ref={rootRef}
      className="lml-root dark font-sans"
      data-theme="dark"
      data-intro="play"
      style={{
        "--lml-p-deep": palette.deep,
        "--lml-p-wash": palette.wash,
        "--lml-p-wash2": palette.wash2,
        "--lml-p-accent": palette.accent,
        "--lml-p-sky0": palette.sky[0],
        "--lml-p-sky1": palette.sky[1],
        "--lml-p-sky2": palette.sky[2],
        "--lml-p-nsky0": palette.nightSky[0],
        "--lml-p-nsky1": palette.nightSky[1],
        "--lml-p-nsky2": palette.nightSky[2]
      } as React.CSSProperties}
    >
      {/* Mode & Palette Selector Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>21st.dev Flower Meadow Hero:</span>
            </span>
            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMode("career")}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeMode === "career"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🎓 HireMatrix AI
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("fintech")}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeMode === "fintech"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌹 Petalpay Fintech
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Palette:</span>
            <div className="inline-flex items-center gap-1.5">
              {(["rose", "lilac", "cornflower"] as const).map((pal) => (
                <button
                  key={pal}
                  type="button"
                  onClick={() => setActivePaletteKey(pal)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition flex items-center gap-1 border ${
                    activePaletteKey === pal
                      ? "bg-slate-800 text-white border-indigo-400/50 shadow-sm ring-1 ring-white/10"
                      : "text-slate-400 hover:text-white bg-slate-900 border-slate-800"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: PALETTES[pal].accent }}
                  />
                  <span>{pal}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Header */}
      <header className="lml-nav" data-scrolled={isScrolled ? "true" : "false"}>
        <div className="lml-wrap">
          <div className="lml-navin">
            <a href="#product" className="lml-brand">
              <SparkleStar size={20} className="text-indigo-400" />
              <span>{content.brand}</span>
            </a>

            <nav className="lml-links" aria-label="Primary">
              <a href="#product" className="lml-link">Features</a>
              <a href="#use-cases" className="lml-link">Use Cases</a>
              <a href="#calculator" className="lml-link">Simulator</a>
              <a href="#faq" className="lml-link">FAQ</a>
            </nav>

            <div className="lml-navend">
              <button
                type="button"
                onClick={onGetStarted}
                className="lml-btn"
              >
                <span>{onGetStarted ? "Sign In / Register" : "Launch BETA"}</span>
              </button>

              <button
                type="button"
                className="lml-menu"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
                onClick={() => setMobileMenuOpen((o) => !o)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>

          <nav className="lml-drawer" data-open={mobileMenuOpen ? "true" : "false"}>
            <a href="#product" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href="#calculator" onClick={() => setMobileMenuOpen(false)}>Simulator</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted && onGetStarted();
              }}
              className="mt-2 py-2 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm text-center"
            >
              Sign In / Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section: Flower Meadow Canvas + 3D Coins + Parallax */}
      <section className="lml-hero lml-sec" data-sec="top" aria-label="Introduction">
        <div className="lml-wrap">
          <div
            ref={stageRef}
            className="lml-stage cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Canvas Meadow Layer 0 (Back) */}
            <MeadowCanvasLayer
              className="lml-layer lml-l0"
              layer={HERO_LAYERS[0]}
              seed={11}
              colors={meadowColors}
            />

            {/* Canvas Meadow Layer 1 (Mid) */}
            <MeadowCanvasLayer
              className="lml-layer lml-l1"
              layer={HERO_LAYERS[1]}
              seed={23}
              colors={meadowColors}
            />

            {/* 3D Metallic Coins nestled in the flower meadow */}
            <div className="lml-coins">
              <FloatingCoin
                variant="a"
                metal={coinMetal}
                tint={coinTint}
                badgeText={activeMode === "career" ? "+94.8% Placement Odds" : "+4.60% APY"}
              />
              <FloatingCoin
                variant="b"
                metal={coinMetal}
                tint={coinTint}
                badgeText={activeMode === "career" ? "Zero Google Forms" : "RUSD Pegged"}
              />
            </div>

            {/* Canvas Meadow Layer 2 (Foreground with high-detail 5-petal blooms) */}
            <MeadowCanvasLayer
              className="lml-layer lml-l2"
              layer={HERO_LAYERS[2]}
              seed={37}
              colors={meadowColors}
            />

            {/* Rising Pollen / Fireflies */}
            <PollenParticles seed={5} count={18} />

            {/* Floating Hero Typography & Actions */}
            <div className="lml-herocopy">
              <SparkleStar size={26} className="lml-sparkle text-white/90" />
              <h1 className="lml-h1 text-white">
                {content.heroTitle.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h1>
              <p className="lml-herosub text-white/80">
                {content.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="lml-btn lml-btn--lg cursor-pointer flex items-center gap-2"
                >
                  <span>{content.actionPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onWatchTour && (
                  <button
                    type="button"
                    onClick={onWatchTour}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-white font-medium text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                    <span>Watch Tour</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statement / Overview */}
      <section className="lml-sec lml-what" data-sec="product" id="product">
        <div className="lml-wrap lml-whatgrid">
          <div>
            <h2 className="lml-h2">{content.statementTitle}</h2>
            <button
              type="button"
              onClick={onExploreFeatures || onGetStarted}
              className="lml-btn"
            >
              Explore Now
            </button>
          </div>
          <p className="lml-statement">
            {content.statementBody}
          </p>
        </div>
      </section>

      {/* 3 Interactive Feature Cards (Flower Visual, Peg Line, Auto Orbit) */}
      <section className="lml-sec" data-sec="features">
        <div className="lml-wrap lml-feats">
          {content.features.map((feat, idx) => {
            if (feat.visual === "flower") {
              return (
                <article key={idx} className="lml-feat lml-feat--bloom">
                  <h3>{feat.title}</h3>
                  <BotanicalStemFlower pal={botanicalPalette} className="lml-flower" />
                  <div className="lml-cardcoin">
                    <MetallicCoinSvg metal={coinMetal} tint={coinTint} k={0.7} side={-1} thick={0.2} />
                  </div>
                  <MeadowCanvasLayer
                    className="lml-cardmeadow"
                    layer={CARD_MEADOW_LAYER}
                    seed={41 + idx}
                    colors={cardMeadowColors}
                  />
                  <p>{feat.body}</p>
                </article>
              );
            }
            return (
              <article key={idx} className="lml-feat lml-feat--deep">
                <h3>{feat.title}</h3>
                <div className="lml-viz" style={{ color: palette.wash }}>
                  {feat.visual === "peg" ? <PegVisualization /> : <AutoPilotOrbit />}
                </div>
                <p>{feat.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Partners / Recruiters Marquee */}
      <section className="lml-sec" data-sec="backers">
        <div className="lml-wrap lml-backers">
          <p>
            {activeMode === "career"
              ? "Trusted by top tier-1 recruiters and university placement cells."
              : "Backed by the best companies and visionary angels."}
          </p>
          <ul className="lml-logos">
            {content.partners.map((p, idx) => (
              <li key={idx}>
                <span className="lml-logo">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>{p.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Use Cases (Tabs + Architectural Art) */}
      <section className="lml-sec" data-sec="use-cases" id="use-cases">
        <div className="lml-wrap lml-uc">
          <div className="lml-uchead">
            <p className="lml-kicker">{content.brand} In Action</p>
            <h2 className="lml-h2">Use cases</h2>
            <p className="lml-lede">
              {activeMode === "career"
                ? "Tailored workflows for students, placement directors, and enterprise recruiters."
                : "Scalable stablecoin solutions for business, developers, and treasuries."}
            </p>

            <div className="lml-tabs" role="tablist">
              {content.useCases.map((uc, idx) => (
                <button
                  key={uc.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === idx}
                  className="lml-tab"
                  onClick={() => setActiveTab(idx)}
                >
                  <span className="lml-tabn">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="lml-tabt">{uc.title}</span>
                  <ArrowChevron />
                  <span className="lml-tabbar" />
                </button>
              ))}
            </div>
          </div>

          <div className="lml-cards">
            {content.useCases.map((uc, idx) => (
              <article
                key={uc.id}
                role="tabpanel"
                className="lml-card"
                data-on={activeTab === idx ? "true" : "false"}
              >
                <div className="lml-cardtext">
                  <h3>{uc.title}</h3>
                  <p>{uc.body}</p>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="lml-more"
                  >
                    <span><ArrowChevron size={12} /></span>
                    <span>{uc.action.label}</span>
                  </button>
                </div>
                <div className="lml-artbox">
                  {uc.art === "blocks" ? (
                    <BlocksIllustration c={cardArtPalette} accent={palette.accent} />
                  ) : uc.art === "vault" ? (
                    <VaultIllustration metal={coinMetal} leaf={STRAW_DARK} />
                  ) : (
                    <TempleIllustration c={cardArtPalette} />
                  )}
                  <MeadowCanvasLayer
                    className="lml-artmeadow"
                    layer={ART_MEADOW_LAYER}
                    seed={61 + idx}
                    colors={{ ...cardMeadowColors, sky: "#1b1828" }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Growth / Readiness Yield Simulator Calculator */}
      <section className="lml-sec lml-calc" data-sec="calculator" id="calculator">
        <div className="lml-wrap">
          <div className="lml-calcbox">
            <div>
              <p className="lml-kicker">{content.calcKicker}</p>
              <h2 className="lml-h2">{content.calcTitle}</h2>
              <p className="lml-lede">{content.calcBody}</p>

              {/* Slider Field */}
              <div className="lml-field">
                <div className="lml-fieldhead">
                  <label htmlFor="meadow-slider">
                    {activeMode === "career" ? "Starting Prep Score / Effort" : "Deposit"}
                  </label>
                  <output className="lml-amount">
                    {formatCurrency(deposit)}
                  </output>
                </div>
                <input
                  id="meadow-slider"
                  type="range"
                  className="lml-range"
                  min={activeMode === "career" ? 5 : 100}
                  max={activeMode === "career" ? 100 : 50000}
                  step={activeMode === "career" ? 1 : 100}
                  value={deposit}
                  style={{
                    "--lml-fill": `${
                      activeMode === "career"
                        ? ((deposit - 5) / 95) * 100
                        : (deposit / 50000) * 100
                    }%`
                  } as React.CSSProperties}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                />
                <div className="lml-ticks" aria-hidden="true">
                  <span>{activeMode === "career" ? "5% Baseline" : "$100"}</span>
                  <span>{activeMode === "career" ? "50% Intermediate" : "$25K"}</span>
                  <span>{activeMode === "career" ? "100% Elite" : "$50K"}</span>
                </div>
              </div>

              {/* Time in the meadow selector */}
              <div className="lml-field lml-row">
                <div>
                  <span className="lml-fieldlabel">
                    {activeMode === "career" ? "Sprint Duration" : "Time in the meadow"}
                  </span>
                  <div className="lml-seg" role="group">
                    {[6, 12, 36, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={duration === m}
                        onClick={() => setDuration(m)}
                      >
                        {formatDuration(m)}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="lml-toggle">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoCompound}
                    className="lml-switch"
                    onClick={() => setAutoCompound((c) => !c)}
                  />
                  <span>{activeMode === "career" ? "AI Auto-Roadmap" : "Auto-compound"}</span>
                </span>
              </div>

              {/* Results Breakdown */}
              <dl className="lml-results">
                <div className="lml-result lml-result--hi">
                  <dt>{activeMode === "career" ? "Projected Readiness" : `Balance in ${duration} Mo`}</dt>
                  <dd>{formatCurrency(finalPrimary)}</dd>
                </div>
                <div className="lml-result">
                  <dt>{activeMode === "career" ? "Net Advantage" : `Yield at ${apyRate}% APY`}</dt>
                  <dd>+{formatCurrency(yieldGained)}</dd>
                </div>
              </dl>

              <p className="lml-compare">
                That's <b>{multiplier.toFixed(1)}×</b> what{" "}
                {activeMode === "career"
                  ? "traditional unassisted campus prep achieves."
                  : "a standard savings account yields."}
              </p>
            </div>

            {/* Live Smooth SVG Curve Chart */}
            <div className="lml-chartbox">
              <div className="lml-legend">
                <span>
                  <i />
                  {activeMode === "career" ? `HireMatrix ML (${apyRate}%)` : `RUSD (${apyRate}%)`}
                </span>
                <span>
                  <i className="lml-dash" />
                  {activeMode === "career" ? `Standard Prep (${benchmarkRate}%)` : `Savings (${benchmarkRate}%)`}
                </span>
              </div>

              <div
                className="lml-chart"
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = clamp((e.clientX - rect.left) / rect.width, 0, 1);
                  setHoveredPoint(Math.round(pct * (chartSteps - 1)));
                }}
                onPointerLeave={() => setHoveredPoint(null)}
              >
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="lml-svg"
                  role="img"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={palette.wash} stopOpacity="0.45" />
                      <stop offset="1" stopColor={palette.wash} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((t) => (
                    <path
                      key={t}
                      d={`M0 ${chartHeight * t}H${chartWidth}`}
                      stroke="rgba(255,255,255,0.07)"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <path d={areaPath} fill="url(#chartGrad)" />
                  <path
                    d={benchmarkPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={primaryPath}
                    fill="none"
                    stroke={palette.wash}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {hoveredPoint !== null && (
                    <path
                      d={`M${getSvgX(hoveredPoint)} 0V${chartHeight}`}
                      stroke="rgba(255,255,255,0.3)"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>

                <span className="lml-ylab" style={{ top: `${(getSvgY(maxVal) / chartHeight) * 100}%` }}>
                  {formatCurrency(maxVal)}
                </span>
                <span className="lml-ylab lml-ylab--lo" style={{ top: `${(getSvgY(minVal) / chartHeight) * 100}%` }}>
                  {formatCurrency(minVal)}
                </span>

                {hoveredPoint !== null && (
                  <>
                    <span
                      className="lml-dot"
                      style={{
                        position: "absolute",
                        left: `${(hoveredPoint / (chartSteps - 1)) * 100}%`,
                        top: `${(getSvgY(chartData.primary[hoveredPoint]) / chartHeight) * 100}%`,
                        width: 10,
                        height: 10,
                        margin: "-5px 0 0 -5px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        boxShadow: `0 0 0 4px ${palette.accent}`
                      }}
                    />
                    <div
                      className="lml-tip"
                      style={{
                        left: `${clamp((hoveredPoint / (chartSteps - 1)) * 100, 12, 88)}%`
                      }}
                    >
                      <span>Week {Math.round((duration * hoveredPoint) / (chartSteps - 1))}</span>
                      <b>{formatCurrency(chartData.primary[hoveredPoint])}</b>
                    </div>
                  </>
                )}
              </div>

              <div className="lml-xaxis" aria-hidden="true">
                <span>Start</span>
                <span>Midpoint</span>
                <span>Target Completion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="lml-sec" data-sec="faq" id="faq">
        <div className="lml-wrap lml-faq">
          <div className="lml-faqhead">
            <p className="lml-kicker">Knowledge Base</p>
            <h2 className="lml-h2">Questions, answered</h2>
            <p className="lml-lede">
              Everything you need to know about HireMatrix AI algorithms, campus drive rosters, and SVAR voice tests.
            </p>
          </div>

          <div>
            {content.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="lml-qa">
                  <h3>
                    <button
                      type="button"
                      className="lml-q"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      <span className="lml-plus" aria-hidden="true" />
                    </button>
                  </h3>
                  <div className="lml-a" data-open={isOpen ? "true" : "false"}>
                    <div>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Join / Newsletter CTA Section with Flower Meadow Backdrop */}
      <section className="lml-sec lml-join" data-sec="join" id="join">
        <div className="lml-wrap">
          <div className="lml-joinbox">
            <MeadowCanvasLayer className="lml-layer" layer={JOIN_LAYERS[0]} seed={71} colors={meadowColors} />
            <MeadowCanvasLayer className="lml-layer" layer={JOIN_LAYERS[1]} seed={83} colors={meadowColors} />
            <div className="lml-coins" style={{ transform: "none" }}>
              <FloatingCoin variant="a" metal={coinMetal} tint={coinTint} badgeText="Verified Campus Drive" />
              <FloatingCoin variant="b" metal={coinMetal} tint={coinTint} badgeText="Explainable AI" />
            </div>
            <MeadowCanvasLayer className="lml-layer" layer={JOIN_LAYERS[2]} seed={97} colors={meadowColors} />

            <div className="lml-joincopy">
              <h2 className="lml-h2">Plant your first seed</h2>
              <p>
                {activeMode === "career"
                  ? "Join over 2,400+ engineering candidates and 18+ university placement directorates using HireMatrix AI."
                  : "Join the beta and be among the first to earn yield with Rose Dollar."}
              </p>

              {formState === "done" ? (
                <div className="lml-done" role="status">
                  <SparkleStar size={16} />
                  <span>You're on the priority invitation list — check your inbox shortly!</span>
                </div>
              ) : (
                <form className="lml-form" data-state={formState} noValidate onSubmit={handleEmailSubmit}>
                  <label htmlFor="join-email" className="lml-sr">Email address</label>
                  <input
                    ref={emailInputRef}
                    id="join-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError) setFormError("");
                    }}
                  />
                  <button type="submit" className="lml-btn lml-btn--lg" disabled={formState === "sending"}>
                    {formState === "sending" ? "Sowing seed..." : "Get Priority Access"}
                  </button>
                </form>
              )}
              {formError && (
                <p className="lml-formnote" data-state="error">
                  {formError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lml-foot">
        <div className="lml-wrap">
          <div className="lml-footgrid">
            <div>
              <span className="lml-brand">
                <SparkleStar size={20} className="text-indigo-400" />
                <span>{content.brand}</span>
              </span>
              <p className="lml-tagline">
                {activeMode === "career"
                  ? "HireMatrix AI — Autonomous campus placement intelligence & career readiness operating system."
                  : "Petalpay — A yield-bearing dollar for people, platforms and treasuries. Grown, not printed."}
              </p>
            </div>

            <div className="lml-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#product">How it works</a></li>
                <li><a href="#use-cases">Use cases</a></li>
                <li><a href="#calculator">Simulator</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="lml-col">
              <h4>Platform</h4>
              <ul>
                <li><button type="button" onClick={onGetStarted}>Predictor Engine</button></li>
                <li><button type="button" onClick={onGetStarted}>University ERP</button></li>
                <li><button type="button" onClick={onGetStarted}>SVAR Voice AI</button></li>
                <li><button type="button" onClick={onWatchTour}>Video Tour</button></li>
              </ul>
            </div>
          </div>

          <div className="lml-word" aria-hidden="true">
            {content.brand}
          </div>

          <div className="lml-bar">
            <span>© {new Date().getFullYear()} {content.brand}. All rights reserved.</span>
            <nav aria-label="Legal">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlowerMeadowLanding;
