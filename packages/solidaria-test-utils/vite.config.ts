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
    // axe-core exposes its types via a legacy `export =` namespace, not top-level
    // named exports — keep it external and do not bundle test-only dependencies.
    deps: { neverBundle: ["axe-core", "@solidjs/testing-library", "@testing-library/user-event"] },
    outputOptions: { entryFileNames: "[name].js" },
  },
});
