import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

// Dev-tooling unit tests for the /admin server modules (frontmatter + tracking
// validator). Pure Node modules — no DOM, no Solid. The root vitest.config.ts
// only globs packages/** + benchmarks, so apps/web needs its own config; run it
// with `vp run test:web`. Pin root to this directory so include globs resolve
// here regardless of the cwd the runner is invoked from.
const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/app/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
});
