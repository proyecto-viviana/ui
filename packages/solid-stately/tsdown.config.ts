import { defineConfig } from "tsdown";

// Pure state logic (no JSX) -> a single isomorphic build, no Solid compiler needed.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  outDir: "dist",
  sourcemap: true,
  clean: false,
  dts: false,
  deps: { neverBundle: ["solid-js", "solid-js/web", "solid-js/store"] },
  outputOptions: { entryFileNames: "[name].js" },
});
