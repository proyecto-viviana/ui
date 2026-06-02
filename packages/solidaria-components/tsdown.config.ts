import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

const neverBundle = [
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solid-stately",
];

// Standard Solid-library JSX-preserve layout: ship a JSX-preserved entry (the `solid` export condition)
// that the CONSUMER's vite-plugin-solid compiles per-environment (DOM on the
// client, SSR on the server), plus a pre-compiled `default` fallback. No separate
// SSR bundle. Consumed from node_modules, so the consumer never dev-wraps it
// (which is what corrupted hydration when we aliased to src as first-party code).
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
