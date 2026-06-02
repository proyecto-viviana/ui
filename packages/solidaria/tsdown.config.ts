import { defineConfig } from "tsdown";
import solid from "vite-plugin-solid";

const neverBundle = [
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  "@proyecto-viviana/solid-stately",
];

export default defineConfig([
  // DOM build -> dist/index.js
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
  // SSR build -> dist/index.ssr.js
  {
    entry: { "index.ssr": "src/index.ts" },
    format: ["esm"],
    platform: "node",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle },
    outputOptions: { entryFileNames: "[name].js" },
    plugins: [solid({ solid: { generate: "ssr" } })],
  },
]);
