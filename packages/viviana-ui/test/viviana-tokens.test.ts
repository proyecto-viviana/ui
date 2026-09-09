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
  /* The legacy `--color-*` compat ladder is still the paint for the playground and the
   * headless demos, and its 100-on-700 pairing is a real button. It is the one pair here
   * that no register token names, so re-valuing the ladder onto the new blue silently
   * dropped it to 3.7:1 until 700 was moved down a stop. */
  ["--color-primary-100", "--color-primary-700", []],
  ["--color-blue-100", "--color-blue-700", []],
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

/* The type ladder is published twice as well: `typeRoles` compiles it into atoms for the
 * components, `--type-*` hands it to host CSS. The roles are macro calls, so they cannot be
 * imported without the style plugin — the source is read instead, which is enough to catch
 * the two failure modes that matter: a role silently drifting off the register's numbers,
 * and a sub-16px role taking the pixel face, where the ELSH axis stops resolving and the
 * text turns to mush. */
const roleSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/text/type-roles.ts"),
  "utf8",
);

function role(name: string): { font: string; size?: number; lineHeight?: string } {
  const match = roleSource.match(
    new RegExp(`\\n  "?${name}"?: style\\(\\{([\\s\\S]*?)\\n  \\}\\)`),
  );
  if (!match) throw new Error(`type role ${name} is missing`);
  const body = match[1];
  const size = body.match(/fontSize: "\[([\d.]+)px\]"/);
  const lineHeight = body.match(/lineHeight: "\[([\d.]+)\]"/);
  return {
    font: (body.match(/font: "([^"]+)"/) as RegExpMatchArray)[1],
    size: size ? Number(size[1]) : undefined,
    lineHeight: lineHeight?.[1],
  };
}

/* Grandfathered: the handoff itself sets the pixel floor at its own `--type-label`, 13.5px,
 * and `headline` sits just above it. Nothing new may join them. */
const PIXEL_FLOOR_EXEMPT = new Set(["headline", "label"]);

describe("type roles", () => {
  it("publishes the register's twelve roles at their exact metrics", () => {
    for (const [name, size, lineHeight] of [
      ["display-xl", 66, "0.98"],
      ["display-lg", 56, "1.02"],
      ["display-md", 40, "1.08"],
      ["display", 28, "1.15"],
      ["title", 20, "1.2"],
      ["headline", 15, "1.3"],
      ["label", 13.5, "1.15"],
      ["meta", 12, "1.5"],
      ["micro", 10, "1.2"],
      ["terminal", 11.5, "1.95"],
      ["button", 13, undefined],
    ] as const) {
      const declared = role(name);
      expect(declared.size, `${name} size`).toBe(size);
      if (lineHeight) expect(declared.lineHeight, `${name} line-height`).toBe(lineHeight);
    }
  });

  it("keeps the pixel face off every role below the ELSH floor", () => {
    for (const name of roleSource.matchAll(/\n  "?([a-z-]+)"?: style\(\{/g)) {
      const declared = role(name[1]);
      const isPixel = declared.font.startsWith("heading-");
      if (!isPixel || PIXEL_FLOOR_EXEMPT.has(name[1])) continue;
      expect(
        declared.size ?? 16,
        `${name[1]} takes the pixel face below 16px`,
      ).toBeGreaterThanOrEqual(16);
    }
  });

  it("keeps the button role on the mono ladder the token file publishes", () => {
    /* The register spends mono 13px on control labels; 15px sans was the v1 value and read
     * as a second body size beside the pixel labels. */
    expect(role("button").font).toBe("ui");
    expect(resolve("dark", "--type-button")).toBe("400 13px/1 var(--font-mono)");
  });
});
