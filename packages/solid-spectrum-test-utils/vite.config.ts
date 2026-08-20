import { defineConfig } from "vite-plus";

// Test helpers (no JSX). Declaration generation reads the real tsconfig, so it
// does not inject the deprecated `baseUrl` that broke the previous build under TS 6.
export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "neutral",
    outDir: "dist",
    sourcemap: true,
    clean: false,
    dts: true,
    outputOptions: { entryFileNames: "[name].js" },
  },
});
