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
  // axe-core exposes its types via a legacy `export =` namespace, not top-level
  // named exports — so it must stay external (never bundle test-only deps into a
  // test-utils dist anyway). The testing-library peerDeps auto-externalize.
  deps: { neverBundle: ["axe-core", "@solidjs/testing-library", "@testing-library/user-event"] },
  outputOptions: { entryFileNames: "[name].js" },
});
