import { defineConfig } from "vite-plus";
import solidPlugin from "vite-plugin-solid";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [solidPlugin()],
  optimizeDeps: {
    entries: ["packages/**/test/**/*.test.{ts,tsx}", "benchmarks/**/*.bench.{ts,tsx}"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    pool: "vmThreads",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/test/**/*.test.{ts,tsx}", "benchmarks/**/*.bench.{ts,tsx}"],
    // SSR-compiled tests run under vitest.ssr.config.ts (node env, generate:"ssr");
    // hydration tests run under vitest.hydrate.config.ts (jsdom, dom+hydratable).
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.{ssr,hydrate}.test.{ts,tsx}"],
    deps: {
      optimizer: {
        client: {
          enabled: false,
        },
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/*/src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/index.ts"],
    },
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      "@proyecto-viviana/solid-stately": resolve(__dirname, "packages/solid-stately/src/index.ts"),
      "@proyecto-viviana/solidaria": resolve(__dirname, "packages/solidaria/src/index.ts"),
      "@proyecto-viviana/solidaria-components": resolve(
        __dirname,
        "packages/solidaria-components/src/index.ts",
      ),
      "@proyecto-viviana/solidaria-test-utils": resolve(
        __dirname,
        "packages/solidaria-test-utils/src/index.ts",
      ),
      // More-specific subpath alias first so it wins over the base alias below.
      // Needed so viviana-ui natives (which re-export the macro seam and Avatar
      // from solid-spectrum) resolve to src in tests instead of the unbuilt dist.
      "@proyecto-viviana/solid-spectrum/style": resolve(
        __dirname,
        "packages/solid-spectrum/src/style/index.ts",
      ),
      "@proyecto-viviana/solid-spectrum": resolve(
        __dirname,
        "packages/solid-spectrum/src/index.ts",
      ),
    },
  },
});
