import { defineConfig } from "vite-plus";
import { packageAttributionBanner } from "../../scripts/package-attribution-banner.mjs";

// Pure state logic (no JSX) -> a single isomorphic build, no Solid compiler needed.
export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
      "private/flags/flags": "src/flags/flags.ts",
    },
    format: ["esm"],
    platform: "neutral",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: false,
    deps: { neverBundle: ["solid-js", "@solidjs/web"] },
    outputOptions: { entryFileNames: "[name].js", banner: packageAttributionBanner },
  },
});
