import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { glasselatedCreateColors, glasselatedRamps } from "../src/style/glasselated-ramps";

/* Terminal Glass tier 2 — the float family: Popover, Menu (which renders inside one),
 * Dialog, Tooltip, Toast and ContextualHelp.
 *
 * These are six files that must agree about one surface, with no shared style object
 * between them (each declares its own `style()` block, and the fill has to stay behind
 * each one's `--s2-container-bg` so its arrow and its static controls can read it). That
 * is exactly the shape of drift this suite exists to catch: nothing fails to compile, no
 * screenshot obviously breaks, and a tooltip quietly keeps the opaque Spectrum fill while
 * the popover it opens next to is glass. The failure mode named here is "one overlay was
 * left behind on the panel/card tier, or on Spectrum's cast-shadow elevation".
 *
 * Assertions are on source text because these values are compiled away by the style()
 * macro at build time — there is no runtime object to inspect from vitest. */

const root = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(root, path), "utf8");

const tokensCss = read("../src/viviana-tokens.css");

function schemeBlock(scheme: "light" | "dark"): string {
  const pattern =
    scheme === "light"
      ? /\[data-color-scheme="light"\]\s*\{([\s\S]*?)\n\}/
      : /:root,\s*\[data-color-scheme="dark"\]\s*\{([\s\S]*?)\n\}/;
  const match = tokensCss.match(pattern);
  if (!match) throw new Error(`${scheme} scheme block missing from viviana-tokens.css`);
  return match[1];
}

/** Resolves a custom property to a literal colour, following `var()` indirection. */
function cssColor(block: string, name: string, depth = 0): string {
  if (depth > 8) throw new Error(`${name} does not resolve to a literal colour`);
  const match = block.match(new RegExp(`\\${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`${name} missing from scheme block`);
  const value = match[1].trim();
  const indirect = value.match(/^var\((--[a-z0-9-]+)\)$/i);
  return indirect ? cssColor(block, indirect[1], depth + 1) : value;
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
  if (!rgba) throw new Error(`unsupported color ${input}`);
  return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] == null ? 1 : Number(rgba[4])];
}

function compositeOver(fg: string, bg: [number, number, number]): [number, number, number] {
  const [fr, fg2, fb, fa] = parseRgb(fg);
  return [
    Math.round(fa * fr + (1 - fa) * bg[0]),
    Math.round(fa * fg2 + (1 - fa) * bg[1]),
    Math.round(fa * fb + (1 - fa) * bg[2]),
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

function rampHex(name: string, scheme: "light" | "dark"): string {
  const token = glasselatedRamps[name] ?? glasselatedCreateColors[name];
  if (!token || token.type !== "color") throw new Error(`missing ramp ${name}`);
  return scheme === "light" ? token.light : token.dark;
}

/** The worst-case ground a float lands on: the app, under a panel, under the float. */
function floatComposite(scheme: "light" | "dark"): [number, number, number] {
  const block = schemeBlock(scheme);
  const [ar, ag, ab] = parseRgb(cssColor(block, "--surface-app"));
  const panel = compositeOver(cssColor(block, "--surface-panel"), [ar, ag, ab]);
  return compositeOver(cssColor(block, "--surface-float"), panel);
}

const FLOAT_SURFACES: Array<[string, string]> = [
  ["../src/popover/index.tsx", "popoverStyles"],
  ["../src/dialog/Dialog.tsx", "dialogModal"],
  ["../src/tooltip/index.tsx", "tooltip"],
  ["../src/toast/index.tsx", "toastStyle"],
];

describe("tier-2 float surfaces", () => {
  it("blurs every float at --blur-clear, never at the panel or card weight", () => {
    /* A float stacked on a panel at panel weight has no visible boundary against the
     * surface it covers; the toast is exempt because it carries an opaque channel fill. */
    for (const [path] of FLOAT_SURFACES) {
      const source = read(path);
      if (path.includes("toast")) continue;
      expect(source).toContain('backdropFilter: "var(--blur-clear)"');
      expect(source).not.toContain('backdropFilter: "var(--blur-panel)"');
      expect(source).not.toContain('backdropFilter: "var(--blur-card)"');
    }
  });

  it("casts --shadow-float plus the --edge-glass rim on every float", () => {
    /* The rim alone is the panel/card cue and cannot separate two surfaces of the same
     * family; Spectrum's `elevated`/`emphasized` cast shadow is the vocabulary this
     * register replaced, so neither may survive on a float. */
    for (const [path] of FLOAT_SURFACES) {
      const source = read(path);
      expect(source).toContain('"[var(--shadow-float), var(--edge-glass)]"');
      expect(source).not.toContain('boxShadow: "elevated"');
      expect(source).not.toContain('boxShadow: "emphasized"');
    }
  });

  it("fills the popover, dialog and tooltip from --surface-float behind --s2-container-bg", () => {
    /* Behind the custom property, not as a bare `backgroundColor`: the popover and the
     * tooltip paint their arrows with `fill: "--s2-container-bg"`, and the dialog's
     * static controls compute their ink from it. A direct fill leaves an unfilled arrow. */
    for (const path of [
      "../src/popover/index.tsx",
      "../src/dialog/Dialog.tsx",
      "../src/tooltip/index.tsx",
    ]) {
      const source = read(path);
      expect(source).toContain('"--s2-container-bg"');
      expect(source).toMatch(/"--s2-container-bg":[\s\S]{0,900}?"float"/);
    }
    expect(read("../src/tooltip/index.tsx")).not.toContain('backgroundColor: "neutral"');
  });

  it("keeps the tooltip's ink readable on the float composite in both schemes", () => {
    /* The tooltip went from an opaque near-black chip with `gray-25` ink to a
     * translucent float. `gray-25` on the LIGHT float composite is the regression this
     * pins: near-white on near-white. */
    for (const scheme of ["light", "dark"] as const) {
      expect(
        contrastRatio(rampHex("gray-800", scheme), floatComposite(scheme)),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(rampHex("gray-25", scheme), floatComposite(scheme))).toBeLessThan(4.5);
    }
  });
});

describe("the info toast is the fuchsia ask", () => {
  it("inks the CTA fill with create-ink, the only ink that clears AA on it", () => {
    /* White is the obvious choice on a saturated fill and it is wrong here: the dark
     * scheme's CTA is a BRIGHT fuchsia (#ff4fc3). This is the pair that would ship a
     * live AA failure on every info toast, its close button and its action button. */
    for (const scheme of ["light", "dark"] as const) {
      const [r, g, b] = parseRgb(rampHex("cta", scheme));
      const ink = rampHex("create-ink", scheme);
      expect(contrastRatio(ink, [r, g, b])).toBeGreaterThanOrEqual(4.5);
    }
    const [dr, dg, db] = parseRgb(rampHex("cta", "dark"));
    expect(contrastRatio("#ffffff", [dr, dg, db])).toBeLessThan(4.5);
  });

  it("hands the toast's static controls the fill so `auto` can resolve their ink", () => {
    /* `staticColor="auto"` computes from `--s2-container-bg`. Without the toast
     * declaring it, `auto` resolves against nothing and the close button falls back to
     * white on fuchsia — the exact pair the previous assertion rules out. */
    const source = read("../src/toast/index.tsx");
    expect(source).toContain('info: "cta"');
    expect(source).toContain('info: "create-ink"');
    expect(source).toContain('variant() === "info" ? "auto"');
    expect(source).not.toContain('staticColor={variant() === "notice" ? "black" : "white"}');
  });
});

describe("the contextual-help trigger is on tokens", () => {
  it("carries no colour literal of its own", () => {
    /* It shipped sixteen `light-dark()` hex pairs — a second palette inside one
     * component, which by construction never moves when the register is re-cut. */
    const source = read("../src/menu/ContextualHelpTrigger.tsx");
    const css = source.slice(source.indexOf("css(`"), source.indexOf("`);"));
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).toContain("var(--surface-float)");
    expect(css).toContain("var(--slate-900)");
    expect(css).toContain("box-shadow: var(--shadow-float), var(--edge-glass);");
  });
});

describe("menu rows", () => {
  it("insets rows flat, not off Spectrum's height-derived ramp", () => {
    /* `edgeToText(h)` is `height * 3/8`, so the same menu inset 9px at size S and 18px
     * at XL while the register draws every row at 6px 10px. Same correction control()
     * already made for the row corner. */
    const source = read("../src/menu/s2-menu-styles.ts");
    expect(source).toContain('const rowEdgeToText = "10px"');
    expect(source).not.toMatch(/^\s*(S|M|L|XL): \[edgeToText\(/m);
  });

  it("paints the selected row with --surface-active", () => {
    /* The checkmark sits in the leading grid column, far from a long label and easy to
     * miss on a scrolling menu; the register's own selected row carries a fill. */
    expect(read("../src/menu/s2-menu-styles.ts")).toContain(
      'isSelected: "[var(--surface-active)]"',
    );
  });
});
