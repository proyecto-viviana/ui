/**
 * OKLCH to Hex color conversion utilities
 * OKLCH: Lightness (0-1), Chroma (0-0.4), Hue (0-360)
 */

interface OKLCH {
  l: number; // Lightness 0-1
  c: number; // Chroma 0-0.4
  h: number; // Hue 0-360
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Convert OKLCH to OKLab
function oklchToOklab(oklch: OKLCH): { L: number; a: number; b: number } {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    L: oklch.l,
    a: oklch.c * Math.cos(hRad),
    b: oklch.c * Math.sin(hRad),
  };
}

// Convert OKLab to linear RGB
function oklabToLinearRgb(lab: { L: number; a: number; b: number }): RGB {
  const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

// Convert linear RGB to sRGB
function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

// Clamp value between 0 and 1
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Convert OKLCH to hex
export function oklchToHex(oklch: OKLCH): string {
  const oklab = oklchToOklab(oklch);
  const linearRgb = oklabToLinearRgb(oklab);

  const r = Math.round(clamp(linearToSrgb(linearRgb.r)) * 255);
  const g = Math.round(clamp(linearToSrgb(linearRgb.g)) * 255);
  const b = Math.round(clamp(linearToSrgb(linearRgb.b)) * 255);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

// Convert hex to RGB
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert sRGB to linear
function srgbToLinear(value: number): number {
  const v = value / 255;
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return Math.pow((v + 0.055) / 1.055, 2.4);
}

// Convert linear RGB to OKLab
function linearRgbToOklab(rgb: RGB): { L: number; a: number; b: number } {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

// Convert hex to OKLCH
export function hexToOklch(hex: string): OKLCH {
  const rgb = hexToRgb(hex);
  const oklab = linearRgbToOklab(rgb);

  const l = oklab.L;
  const c = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
  let h = (Math.atan2(oklab.b, oklab.a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l, c, h };
}

// Format OKLCH object as CSS oklch() string
export function oklchToCss(oklch: OKLCH): string {
  return `oklch(${+oklch.l.toFixed(4)} ${+oklch.c.toFixed(4)} ${+oklch.h.toFixed(2)})`;
}

// Theme mode type
export type ThemeMode = "light" | "dim" | "dark";

// Generate a palette from a base color
export function generatePalette(baseHex: string, mode: ThemeMode): Record<string, string> {
  const base = hexToOklch(baseHex);

  // Lightness adjustments based on mode
  const lightnessScale: Record<ThemeMode, number[]> = {
    light: [0.95, 0.9, 0.8, 0.85, 0.65, 0.5, 0.45, 0.4], // 100-800
    dim: [0.9, 0.85, 0.75, 0.8, 0.6, 0.45, 0.4, 0.35],
    dark: [0.85, 0.8, 0.7, 0.75, 0.55, 0.4, 0.35, 0.3],
  };

  // Chroma adjustments (slightly reduce for lighter/darker shades)
  const chromaScale = [0.6, 0.7, 0.85, 0.75, 1.0, 0.9, 0.85, 0.8];

  const scale = lightnessScale[mode];
  const palette: Record<string, string> = {};

  const shades = [100, 200, 300, 400, 500, 600, 700, 800];
  shades.forEach((shade, i) => {
    palette[shade.toString()] = oklchToCss({
      l: scale[i],
      c: base.c * chromaScale[i],
      h: base.h,
    });
  });

  return palette;
}

// Generate background palette
export function generateBgPalette(baseHex: string, mode: ThemeMode): Record<string, string> {
  const base = hexToOklch(baseHex);

  const lightnessScale: Record<ThemeMode, number[]> = {
    light: [0.85, 0.9, 0.92, 0.95], // 100-400 (inverted for light mode)
    dim: [0.35, 0.28, 0.24, 0.2],
    dark: [0.3, 0.22, 0.18, 0.14],
  };

  const scale = lightnessScale[mode];
  return {
    "100": oklchToCss({ l: scale[0], c: base.c * 0.3, h: base.h }),
    "200": oklchToCss({ l: scale[1], c: base.c * 0.25, h: base.h }),
    "300": oklchToCss({ l: scale[2], c: base.c * 0.2, h: base.h }),
    "400": oklchToCss({ l: scale[3], c: base.c * 0.15, h: base.h }),
  };
}

// Generate accent palette
export function generateAccentPalette(baseHex: string): Record<string, string> {
  const base = hexToOklch(baseHex);

  return {
    "200": oklchToCss({ l: 0.85, c: base.c * 0.7, h: base.h }),
    "300": oklchToCss({ l: 0.75, c: base.c * 0.85, h: base.h }),
    "500": oklchToCss({ l: 0.65, c: base.c, h: base.h }),
    highlight: oklchToCss({ l: 0.78, c: base.c * 0.5, h: base.h }),
  };
}

// Default theme colors
export const defaultColors = {
  primary: "#75ABC7",
  bg: "#0a0a0a",
  accent: "#DF5C9A",
};
