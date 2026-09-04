import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

// Unit tests for the Playwright drivers under e2e/drivers (D13 journey step
// serialization, motion phase, fuzz alphabet, journey classes). They import
// `@playwright/test`, which needs Node web streams and no DOM, so they cannot
// run under the root jsdom config + setup file. Named `*.unit.test.ts`; the
// Playwright config collects only `*.spec.ts`, so the two runners never
// overlap. Run with `vp run comparison:test:journeys-driver`.
const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  resolve: { tsconfigPaths: true },
  test: {
    include: ["e2e/drivers/**/*.unit.test.ts"],
    environment: "node",
    globals: true,
  },
});
