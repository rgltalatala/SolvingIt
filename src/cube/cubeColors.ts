import type { Color } from './cubeState';

export interface Hsv {
  h: number;
  s: number;
  v: number;
}

interface HsvRange {
  hMin: number;
  hMax: number;
  sMin: number;
  sMax: number;
  vMin: number;
  vMax: number;
}

interface ColorRangeConfig {
  primary: HsvRange;
  wrap?: HsvRange;
}

export const colorRanges: Record<Color, ColorRangeConfig> = {
  white: {
    primary: { hMin: 0, hMax: 360, sMin: 0, sMax: 30, vMin: 70, vMax: 100 },
  },
  yellow: {
    primary: { hMin: 45, hMax: 75, sMin: 50, sMax: 100, vMin: 50, vMax: 100 },
  },
  green: {
    primary: { hMin: 90, hMax: 150, sMin: 40, sMax: 100, vMin: 30, vMax: 100 },
  },
  blue: {
    primary: { hMin: 200, hMax: 240, sMin: 40, sMax: 100, vMin: 30, vMax: 100 },
  },
  red: {
    primary: { hMin: 0, hMax: 15, sMin: 60, sMax: 100, vMin: 40, vMax: 100 },
    wrap: { hMin: 345, hMax: 360, sMin: 60, sMax: 100, vMin: 40, vMax: 100 },
  },
  orange: {
    primary: { hMin: 15, hMax: 45, sMin: 60, sMax: 100, vMin: 40, vMax: 100 },
  },
};

const colorPrototypes: Record<Color, Hsv> = {
  white: { h: 0, s: 0, v: 95 },
  yellow: { h: 60, s: 85, v: 85 },
  green: { h: 120, s: 80, v: 70 },
  blue: { h: 220, s: 80, v: 70 },
  red: { h: 0, s: 90, v: 70 },
  orange: { h: 30, s: 90, v: 70 },
};

export const colorHexMap: Record<Color, string> = {
  white: '#FFFFFF',
  yellow: '#FFD500',
  green: '#009B48',
  blue: '#0046AD',
  red: '#B90000',
  orange: '#FF7A1A',
};

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return { h, s, v };
}

function inRange(hsv: Hsv, range: HsvRange): boolean {
  return (
    hsv.h >= range.hMin &&
    hsv.h <= range.hMax &&
    hsv.s >= range.sMin &&
    hsv.s <= range.sMax &&
    hsv.v >= range.vMin &&
    hsv.v <= range.vMax
  );
}

function hueDistance(a: number, b: number): number {
  const direct = Math.abs(a - b);
  return Math.min(direct, 360 - direct);
}

function hsvDistance(a: Hsv, b: Hsv): number {
  const h = hueDistance(a.h, b.h) / 180;
  const s = (a.s - b.s) / 100;
  const v = (a.v - b.v) / 100;
  return Math.sqrt(h * h + s * s + v * v);
}

export function classifyHsvToColor(hsv: Hsv): Color {
  for (const [color, config] of Object.entries(colorRanges) as [
    Color,
    ColorRangeConfig,
  ][]) {
    if (
      inRange(hsv, config.primary) ||
      (config.wrap && inRange(hsv, config.wrap))
    ) {
      return color;
    }
  }

  let closest: Color = 'white';
  let distance = Number.POSITIVE_INFINITY;
  for (const [color, prototype] of Object.entries(colorPrototypes) as [
    Color,
    Hsv,
  ][]) {
    const score = hsvDistance(hsv, prototype);
    if (score < distance) {
      distance = score;
      closest = color;
    }
  }
  return closest;
}
