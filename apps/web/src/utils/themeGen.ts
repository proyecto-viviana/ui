// Theme generation engine for the Theme Studio.
//
// Recolors the shipped /ui token contract (themeBase.ts) from a small set of
// per-family knobs. The design goal is FAITHFUL recoloring: each token keeps its
// own lightness (the contrast structure /ui was certified against) and only its
// hue/chroma follow the knob. Recoloring is anchored on the shipped defaults
// (REF_INPUTS); a knob left AT its reference reproduces that family byte-for-byte.
//
// The studio does NOT start from the raw shipped base, though — it starts from a
// Spectrum-2-flavoured preset (DEFAULT_INPUTS) so the default preview reads as a
// calm, single-accent Spectrum theme rather than the legacy pink/steel-blue brand.

import { BASE_DARK, BASE_LIGHT, type TokenMap } from "./themeBase";
import { hexToOklch, oklchToHex, hexToRgb } from "./color";

export type Family =
  | "primary"
  | "accent"
  | "background"
  | "text"
  | "success"
  | "warning"
  | "danger";

export type ThemeInputs = Record<Family, string>;
export type Scheme = "dark" | "light";

export const FAMILIES: Family[] = [
  "primary",
  "accent",
  "background",
  "text",
  "success",
  "warning",
  "danger",
];

export interface FamilyMeta {
  label: string;
  hint: string;
  /** Reference token whose dark default is the knob's starting value. */
  ref: string;
  /** Near-neutral families (greys/text): tint by the picked hue instead of rotating. */
  neutral?: boolean;
}

export const FAMILY_META: Record<Family, FamilyMeta> = {
  primary: { label: "Primary", hint: "Brand blue — buttons, links, focus", ref: "--color-primary" },
  accent: { label: "Accent", hint: "Secondary highlight — indigo by default", ref: "--color-accent" },
  background: {
    label: "Background",
    hint: "Surfaces, cards, borders (tint only)",
    ref: "--color-bg-300",
    neutral: true,
  },
  text: { label: "Text", hint: "Foreground text (tint only)", ref: "--color-text", neutral: true },
  success: { label: "Success", hint: "Positive / correct states", ref: "--color-success" },
  warning: { label: "Warning", hint: "Caution states", ref: "--color-warning" },
  danger: { label: "Danger", hint: "Errors / destructive", ref: "--color-danger" },
};

// The recolor ANCHOR: each family's shipped DARK default. `makeXform` measures a
// knob's hue/chroma delta FROM these, so recoloring preserves every token's
// certified lightness. This is the reference, not the studio's starting preset.
export const REF_INPUTS: ThemeInputs = FAMILIES.reduce((acc, fam) => {
  acc[fam] = BASE_DARK[FAMILY_META[fam].ref];
  return acc;
}, {} as ThemeInputs);

// The studio's INITIAL knob values (and the Reset target): a Spectrum-2-flavoured
// starting point layered on the shipped contract. viviana's greys, surfaces, text
// and status colors already read as neutral / Spectrum-adjacent, so only the two
// brand hues start elsewhere — a vivid Spectrum blue for primary and a Spectrum
// indigo for accent (retiring the legacy pink). Because these differ from the
// anchor, the default preview loads recolored toward Spectrum, not the raw base.
const SPECTRUM_PRIMARY = "#2680eb"; // Spectrum blue-400 (the canonical accent blue)
const SPECTRUM_ACCENT = "#6767ec"; // Spectrum indigo-400 (harmonious secondary)
export const DEFAULT_INPUTS: ThemeInputs = {
  ...REF_INPUTS,
  primary: SPECTRUM_PRIMARY,
  accent: SPECTRUM_ACCENT,
};

// Classify every token into the family a knob controls (or null = leave as-is,
// e.g. --color-fusion-glow, a deliberate primary/accent mix). Order matters:
// status and brand prefixes are checked before the generic neutral bucket, and
// --color-bg-blue-* is claimed by primary before the plain --color-bg-* neutrals.
export function familyOf(token: string): Family | null {
  const t = token;
  if (t.startsWith("--color-success") || t === "--color-correct") return "success";
  if (t.startsWith("--color-warning")) return "warning";
  if (t.startsWith("--color-danger") || t === "--color-incorrect") return "danger";
  if (t.startsWith("--color-bg-blue") || t.startsWith("--color-primary") || t.startsWith("--color-blue"))
    return "primary";
  if (t.startsWith("--color-accent") || t.startsWith("--color-pink")) return "accent";
  if (t.startsWith("--color-text")) return "text";
  if (
    t.startsWith("--color-grey") ||
    t.startsWith("--color-bg") ||
    t.startsWith("--color-surface") ||
    t.startsWith("--color-border") ||
    t.startsWith("--color-divider") ||
    t.startsWith("--color-cards") ||
    t.startsWith("--color-header") ||
    t.startsWith("--color-canvas") ||
    t === "--color-background"
  )
    return "background";
  return null;
}

interface Xform {
  changed: boolean;
  neutral: boolean;
  hueDelta: number;
  ratio: number;
  userHue: number;
  userC: number;
}

const CHROMA_CAP = 0.37;
const NEUTRAL_CAP = 0.08;

const clampRange = (v: number, hi: number) => Math.max(0, Math.min(hi, v));
function normHue(h: number): number {
  h %= 360;
  if (h < 0) h += 360;
  return h;
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function applyHex(hex: string, x: Xform): string {
  const o = hexToOklch(hex);
  let c: number;
  let h: number;
  if (x.neutral) {
    h = x.userHue;
    c = clampRange(o.c + x.userC * 0.5, NEUTRAL_CAP);
  } else {
    h = normHue(o.h + x.hueDelta);
    c = clampRange(o.c * x.ratio, CHROMA_CAP);
  }
  return oklchToHex({ l: o.l, c, h }).toLowerCase();
}

function recolor(value: string, x: Xform): string {
  if (!x.changed) return value;
  if (value.startsWith("rgb")) {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return value;
    const parts = m[1].split(",").map((s) => s.trim());
    const [r, g, b] = parts.map((p) => parseFloat(p));
    const alpha = parts[3];
    const { r: nr, g: ng, b: nb } = hexToRgb(applyHex(rgbToHex(r, g, b), x));
    return alpha !== undefined ? `rgba(${nr}, ${ng}, ${nb}, ${alpha})` : `rgb(${nr}, ${ng}, ${nb})`;
  }
  if (value.startsWith("#")) return applyHex(value, x);
  return value;
}

function makeXform(fam: Family, user: string): Xform {
  const def = REF_INPUTS[fam];
  const changed = user.toLowerCase() !== def.toLowerCase();
  const uo = hexToOklch(user);
  const ro = hexToOklch(def);
  return {
    changed,
    neutral: !!FAMILY_META[fam].neutral,
    hueDelta: uo.h - ro.h,
    ratio: ro.c > 0.001 ? uo.c / ro.c : 1,
    userHue: uo.h,
    userC: uo.c,
  };
}

/** Full token map for one scheme, recolored from the given knob inputs. */
export function buildThemeTokens(inputs: ThemeInputs, scheme: Scheme): TokenMap {
  const base = scheme === "dark" ? BASE_DARK : BASE_LIGHT;
  const xforms = {} as Record<Family, Xform>;
  for (const fam of FAMILIES) xforms[fam] = makeXform(fam, inputs[fam]);

  const out: TokenMap = {};
  for (const [token, value] of Object.entries(base)) {
    const fam = familyOf(token);
    out[token] = fam ? recolor(value, xforms[fam]) : value;
  }
  return out;
}

/** Render a token map as an inline `style` string for a scoped preview container. */
export function tokensToInlineStyle(tokens: TokenMap): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}
