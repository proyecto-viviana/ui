import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { glasselatedRamps } from "../src/style/glasselated-ramps";

const tokensCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/viviana-tokens.css"),
  "utf8",
);

function schemeBlock(scheme: "light" | "dark"): string {
  if (scheme === "light") {
    const match = tokensCss.match(/\[data-color-scheme="light"\]\s*\{([\s\S]*?)\n\}/);
    if (!match) throw new Error("light scheme block missing from viviana-tokens.css");
    return match[1];
  }
  const match = tokensCss.match(/:root,\s*\[data-color-scheme="dark"\]\s*\{([\s\S]*?)\n\}/);
  if (!match) throw new Error("dark scheme block missing from viviana-tokens.css");
  return match[1];
}

function cssColor(block: string, name: string): string {
  const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`${name} missing from scheme block`);
  return match[1].trim();
}

function parseRgb(input: string): [number, number, number, number] {
  const hex = input.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgba = input.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgba) {
    return [
      Number(rgba[1]),
      Number(rgba[2]),
      Number(rgba[3]),
      rgba[4] == null ? 1 : Number(rgba[4]),
    ];
  }
  throw new Error(`unsupported color ${input}`);
}

function compositeOver(fg: string, bg: string): [number, number, number] {
  const [fr, fgG, fb, fa] = parseRgb(fg);
  const [br, bgG, bb] = parseRgb(bg);
  return [
    Math.round(fa * fr + (1 - fa) * br),
    Math.round(fa * fgG + (1 - fa) * bgG),
    Math.round(fa * fb + (1 - fa) * bb),
  ];
}

function channel(value: number): number {
  const x = value / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(foreground: string, background: [number, number, number]): number {
  const [ir, ig, ib] = parseRgb(foreground);
  const l1 = relativeLuminance([ir, ig, ib]);
  const l2 = relativeLuminance(background);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function srgbToLinear(value: number): number {
  const x = value / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function oklabL(hex: string): number {
  const [r, g, b] = parseRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

function rampHex(name: string, scheme: "light" | "dark"): string {
  const token = glasselatedRamps[name];
  if (!token || token.type !== "color") throw new Error(`missing ramp ${name}`);
  return scheme === "light" ? token.light : token.dark;
}

describe("glasselated negative ink vs fill", () => {
  it("pins negative ink to 1000 against the panel composite, not white", () => {
    for (const scheme of ["light", "dark"] as const) {
      const block = schemeBlock(scheme);
      const panel = compositeOver(
        cssColor(block, "--surface-panel"),
        cssColor(block, "--surface-app"),
      );
      const ink = rampHex("red-1000", scheme);
      expect(contrastRatio(ink, panel)).toBeGreaterThanOrEqual(4.5);
      const fill = rampHex(scheme === "light" ? "red-900" : "red-700", scheme);
      const [fr, fg, fb] = parseRgb(fill);
      expect(contrastRatio("#ffffff", [fr, fg, fb])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps 800/900/1000 OKLCh L gaps at least 0.02 on the negative ramp", () => {
    for (const scheme of ["light", "dark"] as const) {
      const l800 = oklabL(rampHex("red-800", scheme));
      const l900 = oklabL(rampHex("red-900", scheme));
      const l1000 = oklabL(rampHex("red-1000", scheme));
      expect(Math.abs(l800 - l900)).toBeGreaterThanOrEqual(0.02);
      expect(Math.abs(l900 - l1000)).toBeGreaterThanOrEqual(0.02);
    }
  });
});

/* The v2 palette is four channels wide (blue/cyan · fuchsia · yellow · red) and the ramps
 * are interpolated, not hand-typed, so the failure modes worth naming are structural:
 * a stop dropped in an edit silently falls back to Adobe's value, and a reversal or a
 * flat step breaks `nextColorStop`, which derives :hover/:active by walking one stop. */
const GRAY_STOPS = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const FULL_STOPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600,
];

/* Documented in glasselated-ramps.ts: both tails run out of OKLCh headroom. They must stay
 * strictly monotonic; they cannot stay perceptibly so. */
const FLAT_TAIL_EXEMPT = new Set([
  /* Dark gray sits above the ink at 800 (L 0.973) with pure white pinned at 1000. */
  "gray:dark:900",
  "gray:dark:1000",
  /* Dark yellow's signal stop is the brand #ffe03a at 900 (L 0.90); six stops share the
   * 0.1 of L left below white. */
  ...[1000, 1100, 1200, 1300, 1400, 1500, 1600].map((stop) => `yellow:dark:${stop}`),
]);

describe("glasselated ramps", () => {
  it("emits every stop of every brand ramp", () => {
    for (const [ramp, stops] of [
      ["gray", GRAY_STOPS],
      ["blue", FULL_STOPS],
      ["cyan", FULL_STOPS],
      ["fuchsia", FULL_STOPS],
      ["yellow", FULL_STOPS],
      ["red", FULL_STOPS],
      ["green", FULL_STOPS],
      ["notice", FULL_STOPS],
    ] as const) {
      for (const stop of stops) {
        expect(glasselatedRamps[`${ramp}-${stop}`], `${ramp}-${stop}`).toBeDefined();
      }
    }
  });

  it("keeps every ramp monotonic in both columns, so hover never inverts", () => {
    for (const [ramp, stops] of [
      ["gray", GRAY_STOPS],
      ["blue", FULL_STOPS],
      ["cyan", FULL_STOPS],
      ["fuchsia", FULL_STOPS],
      ["yellow", FULL_STOPS],
      ["red", FULL_STOPS],
      ["green", FULL_STOPS],
    ] as const) {
      for (const scheme of ["light", "dark"] as const) {
        /* Light ramps darken with the stop number; dark ramps lighten. */
        const sign = scheme === "light" ? -1 : 1;
        for (let i = 1; i < stops.length; i += 1) {
          const previous = oklabL(rampHex(`${ramp}-${stops[i - 1]}`, scheme));
          const current = oklabL(rampHex(`${ramp}-${stops[i]}`, scheme));
          const delta = (current - previous) * sign;
          expect(delta, `${ramp}-${stops[i]} (${scheme}) reverses`).toBeGreaterThan(0);
          if (FLAT_TAIL_EXEMPT.has(`${ramp}:${scheme}:${stops[i]}`)) continue;
          expect(
            delta,
            `${ramp}-${stops[i]} (${scheme}) steps too small for :hover`,
          ).toBeGreaterThanOrEqual(0.0125);
        }
      }
    }
  });

  it("publishes no amber, violet, or orange ramp", () => {
    /* The v2 brief removes the warm/violet channels outright. `orange` is the one that
     * actually mattered: the previous revision republished amber under Spectrum's `orange`
     * key, which is what made warm fills reachable through notice-color-* and every
     * `color="orange"` prop. Leaving that override in place would silently keep the old
     * palette alive even after every hex above changed. */
    for (const key of Object.keys(glasselatedRamps)) {
      expect(key).not.toMatch(/^(amber|violet|orange)-/);
    }
  });
});
