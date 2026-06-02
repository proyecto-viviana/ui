import { defineConfig } from "tsdown";

// Test helpers (no JSX). dts via tsdown (oxc/tsc fallback reads the real tsconfig,
// so it does NOT inject the deprecated `baseUrl` that broke tsup under TS 6.0.3).
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  outDir: "dist",
  sourcemap: true,
  clean: false,
  dts: true,
  outputOptions: { entryFileNames: "[name].js" },
});
