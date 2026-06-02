import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

const neverBundle = [
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  "@proyecto-viviana/solid-stately",
];

// Standard Solid-library JSX-preserve layout: JSX-preserved `solid` entry (consumer compiles per-env,
// SSR-safe) + a pre-compiled `default` fallback (unplugin-solid, tsdown's blessed
// Rolldown-native Solid plugin). No separate SSR bundle. See solidaria-components.
export default defineConfig([
  // JSX preserved -> dist/index.jsx  (resolved via the `solid` condition)
  {
    entry: ["src/index.ts"],
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
    outputOptions: { entryFileNames: "[name].jsx" },
  },
  // Solid-compiled DOM -> dist/index.js  (the `default`/`import` fallback)
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "browser",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle },
    outputOptions: { entryFileNames: "[name].js" },
    plugins: [solid({ solid: { generate: "dom", hydratable: true } })],
  },
]);
