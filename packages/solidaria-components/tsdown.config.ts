import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

// Keep the lower layers external. Regexes (not bare strings) so the per-primitive
// subpaths we now import (`@proyecto-viviana/solidaria/dnd`, …) also stay external
// and resolve from the consumer's node_modules at runtime.
const neverBundle = [
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  /^@proyecto-viviana\/solidaria(\/.*)?$/,
  /^@proyecto-viviana\/solid-stately(\/.*)?$/,
];

// Per-primitive entries instead of a single bundled `dist/index.jsx`: every
// public module the barrel re-exports (`from "./X"`) becomes its own entry, so a
// consumer importing one component (`@proyecto-viviana/solidaria-components/Button`)
// compiles only that component's reachable graph, not the whole barrel.
// `dist/index.jsx` survives as a thin re-export barrel (shared code is hoisted
// into chunks), so it no longer trips Solid's compiler 500 KB deopt warning.
// The entry set is derived from the barrel so it stays in sync with the public
// surface; internal-only files become shared chunks, never entries.
const entry: Record<string, string> = { index: "src/index.ts" };
{
  const idx = readFileSync(join("src", "index.ts"), "utf8");
  for (const m of idx.matchAll(/from "(\.\/[A-Za-z][A-Za-z0-9/]*)"/g)) {
    const rel = m[1].replace(/^\.\//, "");
    const base = join("src", rel);
    const file = existsSync(`${base}.tsx`)
      ? `${base}.tsx`
      : existsSync(`${base}.ts`)
        ? `${base}.ts`
        : existsSync(join(base, "index.tsx"))
          ? join(base, "index.tsx")
          : existsSync(join(base, "index.ts"))
            ? join(base, "index.ts")
            : null;
    if (file) entry[rel] = file;
  }
}

// Standard Solid-library JSX-preserve layout: JSX-preserved `solid` entry (consumer compiles per-env,
// SSR-safe) + a pre-compiled `default` fallback (unplugin-solid, tsdown's blessed
// Rolldown-native Solid plugin). No separate SSR bundle.
export default defineConfig([
  // JSX preserved -> dist/<name>.jsx  (resolved via the `solid` condition)
  {
    entry,
    format: ["esm"],
    platform: "neutral",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle },
    inputOptions(opts) {
      opts.transform = { ...(opts.transform || {}), jsx: "preserve" };
      return opts;
    },
    outputOptions: { entryFileNames: "[name].jsx", chunkFileNames: "[name].jsx" },
  },
  // Solid-compiled DOM -> dist/<name>.js  (the `default`/`import` fallback)
  {
    entry,
    format: ["esm"],
    platform: "browser",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle },
    outputOptions: { entryFileNames: "[name].js", chunkFileNames: "[name].js" },
    plugins: [solid({ solid: { generate: "dom", hydratable: true } })],
  },
]);
