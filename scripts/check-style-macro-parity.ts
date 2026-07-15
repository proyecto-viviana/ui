/**
 * guard:style-macro-parity — prove our ported Solid `style()` macro emits the
 * SAME CSS + class atoms as the pinned upstream S2 `style()` macro.
 *
 * The macro engine (packages/solid-spectrum/src/style/style-macro.ts) is the
 * thing that turns a `style({...})` object into (a) generated CSS rules and
 * (b) the class-name / runtime-selector output. Every component's paint flows
 * through it, so an engine-level divergence silently mis-paints the whole
 * library — and nothing else in the suite checks the engine directly (the D3
 * pixel drivers check rendered *components*, not the raw macro output; the
 * `ui:macro-smoke` script only proves the macro *runs* through a Vite build).
 *
 * Both the port and the vendored upstream oracle expose `style` as a plain
 * function that can be invoked outside a bundler via upstream's own test idiom
 * (`style.call({ addAsset({content}) {...} }, styleObject)`), so this guard
 * compiles a shared corpus through BOTH in-process and byte-compares the emitted
 * CSS (and, for static styles, the returned class string; for dynamic styles,
 * the generated runtime function source). The corpus is upstream's own
 * `style/__tests__/style-macro.test.js` feature set — the canonical probe of
 * every macro capability (nested/runtime/variant conditions, self references,
 * allowed overrides, shorthand expansion, opacity colors, CSS variables) — plus
 * a few broadening inputs across more property/token families.
 *
 * Determinism: run under NODE_ENV=production so the loc-dependent
 * `-macro-static/-dynamic` debug atoms (which embed the caller's file path) are
 * stripped from both sides, leaving deterministic, comparable output.
 *
 * A faithful port yields byte-identical output. The one legitimate difference is
 * the version POSTFIX appended to every class name (upstream derives it from the
 * pinned S2 version — "151" for 1.5.1 — so the port must match that exact pin);
 * this guard does NOT normalize it away, so it also catches POSTFIX drift when
 * the upstream pin is bumped without updating the port.
 *
 * Exit 1 on any mismatch; exit 0 otherwise. Skips cleanly (exit 0 + note) when
 * the gitignored ./react-spectrum oracle or the token host is not materialized —
 * never cry wolf on an environmental gap. Run standalone anytime:
 * `vp run guard:style-macro-parity`.
 */

import { existsSync } from "node:fs";
import Module from "node:module";
import path from "node:path";

// Loc-dependent debug atoms embed the caller path; production strips them so
// both sides are deterministic. Set before importing the macro modules.
process.env.NODE_ENV = "production";

const ROOT = process.cwd();
const OUR_THEME = path.join(ROOT, "packages", "solid-spectrum", "src", "style", "spectrum-theme.ts");
const UP_THEME = path.join(
  ROOT,
  "react-spectrum",
  "packages",
  "@react-spectrum",
  "s2",
  "style",
  "spectrum-theme.ts",
);
// The vendored oracle has no node_modules of its own; its tokens.ts requires
// @adobe/spectrum-tokens, which pnpm links only into solid-spectrum. Add that
// dir to the global resolution paths so the upstream module loads standalone.
const TOKEN_HOST = path.join(ROOT, "packages", "solid-spectrum", "node_modules");

if (!existsSync(UP_THEME)) {
  process.stdout.write(
    `guard:style-macro-parity — SKIP: vendored upstream oracle not materialized ` +
      `(${path.relative(ROOT, UP_THEME)} absent). Materialize ./react-spectrum at the pin to run this guard.\n`,
  );
  process.exit(0);
}
if (!existsSync(path.join(TOKEN_HOST, "@adobe", "spectrum-tokens"))) {
  process.stdout.write(
    `guard:style-macro-parity — SKIP: @adobe/spectrum-tokens not installed under ` +
      `${path.relative(ROOT, TOKEN_HOST)} (install gap, not drift).\n`,
  );
  process.exit(0);
}

process.env.NODE_PATH = [process.env.NODE_PATH, TOKEN_HOST].filter(Boolean).join(path.delimiter);
(Module as unknown as { _initPaths: () => void })._initPaths();

type StyleFn = (this: unknown, obj: unknown, overrides?: unknown) => unknown;
type Json = Record<string, unknown>;

interface Case {
  name: string;
  style: Json;
  /** allowedOverrides argument (second positional arg to style()). */
  overrides?: string[];
}

/**
 * Upstream's canonical macro-feature corpus (style/__tests__/style-macro.test.js
 * at the pin), plus a few broadening inputs across more property/token families.
 * Every entry is a valid S2 style() input, so a faithful port must reproduce it.
 */
const CORPUS: Case[] = [
  // --- upstream's own feature probes -----------------------------------------
  { name: "nested-css-conditions", style: { marginTop: { ":first-child": { default: 4, lg: 8 } } } },
  {
    name: "self-references",
    style: {
      borderWidth: 2,
      paddingX: "edge-to-text",
      width: "calc(200px - self(borderStartWidth) - self(paddingStart))",
    },
  },
  {
    name: "allowed-overrides-base",
    style: { backgroundColor: "gray-400", color: "black" },
    overrides: ["backgroundColor"],
  },
  { name: "allowed-overrides-value", style: { backgroundColor: "red-400", color: "green-400" } },
  { name: "overrides-multi-expand", style: { translateX: 32 }, overrides: ["translateX"] },
  { name: "overrides-shorthand", style: { padding: 32 }, overrides: ["padding"] },
  { name: "overrides-fontSize", style: { fontSize: "heading-3xl" }, overrides: ["fontSize"] },
  { name: "overrides-undefined", style: { backgroundColor: "gray-300" }, overrides: ["minWidth"] },
  {
    name: "runtime-conditions",
    style: {
      backgroundColor: { default: "gray-100", isHovered: "gray-200", isPressed: "gray-300" },
      color: { default: "gray-800", isHovered: "gray-900", isPressed: "gray-1000" },
    },
  },
  {
    name: "nested-runtime-conditions",
    style: {
      backgroundColor: {
        default: "gray-100",
        isHovered: "gray-200",
        isSelected: { default: "blue-800", isHovered: "blue-900" },
      },
    },
  },
  {
    name: "variant-runtime-conditions",
    style: {
      backgroundColor: {
        variant: { accent: "accent-1000", primary: "gray-1000", secondary: "gray-400" },
      },
    },
  },
  {
    name: "runtime-in-css-condition",
    style: { color: { forcedColors: { default: "ButtonText", isSelected: "HighlightText" } } },
  },
  {
    name: "inherits-parent-default",
    style: {
      color: {
        forcedColors: {
          default: "ButtonText",
          variant: { highlight: { isSelected: "HighlightText" } },
        },
      },
    },
  },
  { name: "shorthand-expansion", style: { padding: 24 } },
  { name: "colors-with-opacity", style: { backgroundColor: "blue-1000/50" } },
  { name: "css-variables", style: { "--foo": { type: "backgroundColor", value: "gray-300" } } },
  // --- broadening probes: more property / token families ---------------------
  {
    name: "borders-and-radius",
    style: {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "gray-300",
      borderRadius: "lg",
      height: 40,
    },
  },
  {
    name: "flex-layout",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexGrow: 1,
    },
  },
  { name: "arbitrary-values", style: { backgroundColor: "[#abcdef]", width: "[42px]" } },
  { name: "responsive-size", style: { width: { default: "full", lg: 320 } } },
];

function jsRepr(v: unknown): string {
  return typeof v === "function" ? v.toString() : String(v);
}

interface RunResult {
  css: string;
  js: string;
  error?: string;
}

function runCase(styleFn: StyleFn, c: Case): RunResult {
  let css = "";
  try {
    const js = styleFn.call(
      { addAsset: ({ content }: { content: string }) => (css = content) },
      c.style,
      c.overrides,
    );
    return { css, js: jsRepr(js) };
  } catch (err) {
    return { css, js: "", error: err instanceof Error ? err.message : String(err) };
  }
}

/** First differing line with a little context, for compact reporting. */
function firstDiff(a: string, b: string): string {
  const la = a.split("\n");
  const lb = b.split("\n");
  const n = Math.max(la.length, lb.length);
  for (let i = 0; i < n; i++) {
    if (la[i] !== lb[i]) {
      const ctx = (lines: string[]) =>
        lines
          .slice(Math.max(0, i - 1), i + 2)
          .map((l, k) => `      ${k + Math.max(0, i - 1) === i ? "»" : " "} ${l}`)
          .join("\n");
      return `    first diff at line ${i + 1}:\n    OUR:\n${ctx(la)}\n    UP:\n${ctx(lb)}`;
    }
  }
  return "    (strings equal length-wise but flagged — check trailing whitespace)";
}

async function importStyle(themePath: string, label: string): Promise<StyleFn> {
  const mod = (await import(themePath)) as Json;
  const fn = mod.style as StyleFn;
  if (typeof fn !== "function") {
    throw new Error(`${label}: module ${themePath} has no callable \`style\` export`);
  }
  return fn;
}

const ourStyle = await importStyle(OUR_THEME, "port");
const upStyle = await importStyle(UP_THEME, "upstream");

const failures: string[] = [];

for (const c of CORPUS) {
  const ours = runCase(ourStyle, c);
  const up = runCase(upStyle, c);

  if (ours.error || up.error) {
    if (ours.error !== up.error) {
      failures.push(
        `  ✗ ${c.name}: threw divergently\n    OUR error: ${ours.error ?? "(none)"}\n    UP  error: ${up.error ?? "(none)"}`,
      );
    }
    continue; // both threw identically → parity on rejection
  }

  const cssMatch = ours.css === up.css;
  const jsMatch = ours.js === up.js;
  if (!cssMatch) {
    failures.push(`  ✗ ${c.name}: CSS differs\n${firstDiff(ours.css, up.css)}`);
  } else if (!jsMatch) {
    failures.push(
      `  ✗ ${c.name}: class/runtime output differs\n    OUR: ${ours.js}\n    UP:  ${up.js}`,
    );
  }
}

if (failures.length > 0) {
  process.stderr.write(
    `\nguard:style-macro-parity — FAIL: ${failures.length}/${CORPUS.length} corpus entries diverge ` +
      `from the pinned upstream S2 macro.\n\n${failures.join("\n\n")}\n\n` +
      `The ported style() macro must emit byte-identical CSS + class atoms as upstream. If the ` +
      `only difference is the trailing version token on every class name, the port's POSTFIX is ` +
      `out of sync with the pinned S2 version (packages/solid-spectrum/src/style/style-macro.ts).\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `guard:style-macro-parity — PASS: all ${CORPUS.length} corpus entries emit byte-identical CSS + ` +
    `class atoms as the pinned upstream S2 macro (${path.relative(ROOT, UP_THEME)}).\n`,
);
