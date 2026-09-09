import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

/* Terminal Glass ships its colour in two places: the style() macro bakes the ramps at build
 * time (covered by glasselated-ramps.contrast.test.ts), and this stylesheet publishes the
 * app vocabulary that product screens name directly. The failure modes below are the ones
 * that survive a typecheck and a build: an alias pointing at a variable that no longer
 * exists resolves to nothing (an invisible element, not an error), a themed token declared
 * only in the night block leaks a night value into a light subtree, and a channel colour
 * used as ink instead of its `-text` sibling drops text under AA.
 */
const tokensCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/viviana-tokens.css"),
  "utf8",
);

function block(scheme: "light" | "dark"): string {
  const re =
    scheme === "light"
      ? /\[data-color-scheme="light"\]\s*\{([\s\S]*?)\n\}/
      : /:root,\s*\[data-color-scheme="dark"\]\s*\{([\s\S]*?)\n\}/;
  const match = tokensCss.match(re);
  if (!match) throw new Error(`${scheme} scheme block missing from viviana-tokens.css`);
  return match[1];
}

function declarations(source: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of source.split("\n")) {
    const match = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+);\s*$/i);
    if (match) out.set(match[1], match[2].trim());
  }
  return out;
}

const DARK = declarations(block("dark"));
const LIGHT = declarations(block("light"));

/* A light subtree inherits every token the light block does not re-declare, so resolution
 * has to fall back to the night block exactly the way the cascade does. */
function resolve(scheme: "light" | "dark", name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle through ${name}`);
  seen.add(name);
  const raw = (scheme === "light" ? LIGHT.get(name) : undefined) ?? DARK.get(name);
  if (raw == null) throw new Error(`${name} is not declared in either scheme block`);
  const alias = raw.match(/^var\((--[a-z0-9-]+)\)$/i);
  return alias ? resolve(scheme, alias[1], seen) : raw;
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

function over(fg: string, bg: [number, number, number]): [number, number, number] {
  const [r, g, b, a] = parseRgb(fg);
  return [
    Math.round(a * r + (1 - a) * bg[0]),
    Math.round(a * g + (1 - a) * bg[1]),
    Math.round(a * b + (1 - a) * bg[2]),
  ];
}

function channel(value: number): number {
  const x = value / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: [number, number, number], bg: [number, number, number]): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/* [ink, ground, grounds it is composited over]. Translucent surfaces are composited down to
 * the app floor, which is the worst case a reader actually sees. */
const AA_PAIRS: Array<[string, string, string[]]> = [
  ["--text-primary", "--surface-app", []],
  ["--text-secondary", "--surface-panel", ["--surface-app"]],
  ["--text-tertiary", "--surface-card", ["--surface-app"]],
  ["--text-link", "--surface-app", []],
  ["--fuchsia-text", "--surface-app", []],
  ["--fuchsia-ink", "--fuchsia-500", []],
  ["--yellow-text", "--surface-app", []],
  ["--yellow-ink", "--yellow-500", []],
  ["--text-on-accent", "--interactive-fill", []],
  ["--status-fault", "--surface-card", ["--surface-app"]],
  ["--terminal-fg", "--surface-well", []],
];

describe("viviana tokens", () => {
  it("clears WCAG AA on every published ink/ground pair in both schemes", () => {
    for (const scheme of ["light", "dark"] as const) {
      for (const [ink, ground, under] of AA_PAIRS) {
        let composited = parseRgb(resolve(scheme, [...under, ground].at(-1) as string)).slice(
          0,
          3,
        ) as [number, number, number];
        for (const layer of [...under.slice(0, -1).reverse(), ground].slice(under.length ? 0 : 1)) {
          composited = over(resolve(scheme, layer), composited);
        }
        const ratio = contrast(over(resolve(scheme, ink), composited), composited);
        expect(
          ratio,
          `${ink} on ${ground} (${scheme}) is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("resolves every alias to a real declaration", () => {
    for (const scheme of ["light", "dark"] as const) {
      for (const name of new Set([...DARK.keys(), ...LIGHT.keys()])) {
        expect(() => resolve(scheme, name), `${name} (${scheme})`).not.toThrow();
      }
    }
  });

  it("re-declares every themed token in the light block", () => {
    /* Anything whose night value is a literal colour is themed; if the light block omits it,
     * a light subtree silently inherits the night colour. Aliases are exempt: they resolve
     * through a token the light block does re-declare. */
    for (const [name, value] of DARK) {
      if (!/^#|^rgba?\(/.test(value)) continue;
      if (/^--(space|radius|hud|dither|spot|wipe|type|font)-/.test(name)) continue;
      expect(LIGHT.has(name), `${name} has no daylight value`).toBe(true);
    }
  });

  it("publishes no amber, violet, orange or warm token", () => {
    /* The v2 brief deletes the warm and violet channels outright, with no aliases: any
     * survivor is a screen still painting the v1 palette. */
    for (const name of new Set([...DARK.keys(), ...LIGHT.keys()])) {
      expect(name, name).not.toMatch(/amber|violet|orange|warm|ghost/);
    }
  });
});

/* The register publishes its corner ladder twice: the style() macro bakes it into the
 * components' atomic CSS, and `--radius-*` exposes it to host CSS in apps/web. They are
 * edited in different files, so the failure mode is drift — a library card drawn at 12px
 * sitting inside an app rail drawn at 16px, with nothing red anywhere. */
const themeSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/style/spectrum-theme.ts"),
  "utf8",
);

function macroRadius(key: string): string {
  const object = themeSource.match(/\nconst radius = \{([\s\S]*?)\n\} as const;/);
  if (!object) throw new Error("radius map missing from spectrum-theme.ts");
  const match = object[1].match(new RegExp(`\\n\\s*${key}:\\s*"([^"]+)"`));
  if (!match) throw new Error(`radius.${key} is not a literal — the ladders cannot be compared`);
  return match[1];
}

describe("corner ladder", () => {
  it("keeps the macro radii and the --radius-* vars on the same ladder", () => {
    /* Terminal Glass: 4 tags/badges · 5 buttons · 8 wells+chips+tier-2 menus ·
     * 12 cards+panels+rail · 999 pill. */
    for (const [key, cssVar] of [
      ["control", "--radius-sm"],
      ["lg", "--radius-lg"],
      ["card", "--radius-lg"],
    ] as const) {
      expect(macroRadius(key), `radius.${key} vs ${cssVar}`).toBe(resolve("dark", cssVar));
    }
  });

  it("keeps the well on the 8px field corner, not the 12px card corner", () => {
    /* `lg` used to be 10px and the Well spent it; the re-cut moved `lg` to the card
     * corner, so a Well left on `lg` silently rounds two steps past the register. */
    const wellSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../src/well/index.tsx"),
      "utf8",
    );
    expect(wellSource).toMatch(/borderRadius: "default"/);
    expect(resolve("dark", "--radius-md")).toBe("8px");
  });
});
