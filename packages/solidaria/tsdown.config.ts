import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

const neverBundle = [
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  "@proyecto-viviana/solid-stately",
];

// Per-primitive entries instead of a single bundled `dist/index.jsx`. Every
// public subpath (`src/<name>/index.ts[x]`) is its own entry, so a consumer that
// imports one primitive (`@proyecto-viviana/solidaria/button`) compiles only that
// primitive's reachable graph — not the whole barrel. `dist/index.jsx` survives
// as a thin re-export barrel (shared code is hoisted into chunks), so it no
// longer trips Solid's compiler 500 KB deopt warning either.
//
// Impl lands *inside* the type directory — `dist/<name>/index.jsx`/`.js`, next to
// the `dist/<name>/index.d.ts` that `tsc -p tsconfig.build.json` emits — rather
// than as a flat `dist/<name>.jsx` sibling of that directory. A flat sibling file
// would shadow the directory when TypeScript resolves the barrel's relative
// `export … from "./<name>"`, collapsing every re-exported type to `{}`. Keeping
// impl and types co-located in one directory mirrors the source layout and keeps
// resolution unambiguous. Hence the `<name>/index` entry keys below.
const srcDir = "src";
const entry: Record<string, string> = { index: "src/index.ts" };
for (const dirent of readdirSync(srcDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const ts = join(srcDir, dirent.name, "index.ts");
  const tsx = join(srcDir, dirent.name, "index.tsx");
  if (existsSync(ts)) entry[`${dirent.name}/index`] = ts;
  else if (existsSync(tsx)) entry[`${dirent.name}/index`] = tsx;
}

// Standard Solid-library JSX-preserve layout: JSX-preserved `solid` entry (consumer compiles per-env,
// SSR-safe) + a pre-compiled `default` fallback (unplugin-solid, tsdown's blessed
// Rolldown-native Solid plugin). No separate SSR bundle. See solidaria-components.
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
    outputOptions: { entryFileNames: "[name].jsx", chunkFileNames: "_chunk/[name].jsx" },
  },
  // Solid-compiled DOM -> dist/<name>/index.js  (the `default`/`import` fallback)
  {
    entry,
    format: ["esm"],
    platform: "browser",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle },
    outputOptions: { entryFileNames: "[name].js", chunkFileNames: "_chunk/[name].js" },
    plugins: [solid({ solid: { generate: "dom", hydratable: true } })],
  },
]);
