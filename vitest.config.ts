import { defineConfig } from "vite-plus";
import solidPlugin from "@solidjs/vite-plugin";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { availableParallelism } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [...solidPlugin()],
  optimizeDeps: {
    // Vite+ 0.2's test bootstrap otherwise performs Vite's default HTML-entry
    // discovery before Vitest applies its file include. That crosses ignored
    // build output and the vendored React Spectrum oracle, where JSX-in-.js is
    // intentionally valid for upstream's own toolchain but not ours.
    noDiscovery: true,
    entries: [
      "packages/**/test/**/*.test.{ts,tsx}",
      "apps/comparison/src/data/**/*.test.ts",
      "apps/comparison/src/worker.test.ts",
      "scripts/**/*.test.ts",
    ],
  },
  // `__vitest_vm__` is the vmThreads client. Root optimizeDeps is copied onto
  // the client environment only, and Vitest returns before it disables this
  // one. Without the bound below, the cold scan globs every HTML file.
  environments: {
    __vitest_vm__: {
      optimizeDeps: {
        noDiscovery: true,
        include: [],
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    // #562 / ADR 0002: vmThreads is load-bearing. The same run with
    // `--pool=threads` failed 120 tests on 2026-09-20
    // (.agents/chain-walk-2026-09-20/pool-threads.out.txt). Capacity and installed
    // scheduler limits are documented below. Do not swap the pool.
    pool: "vmThreads",
    // Bound unit concurrency under the hub's two-slot memory pressure. The
    // eight-worker run was terminated by earlyoom; two workers are a capacity
    // experiment. Keep the CPU-minus-one budget on smaller runners (ADR 0002).
    maxWorkers: Math.max(1, Math.min(2, availableParallelism() - 1)),
    // Vitest 4.1.11 checks this limit after a file finishes. With the default
    // isolate:true, workers already terminate after each file; this limit does
    // not bound startup, in-file memory, or aggregate process RSS (ADR 0002).
    vmMemoryLimit: "100MB",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "packages/**/test/**/*.test.{ts,tsx}",
      "apps/comparison/src/data/**/*.test.ts",
      "apps/comparison/src/worker.test.ts",
      "scripts/**/*.test.ts",
    ],
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
      "@proyecto-viviana/solid-stately/private/flags/flags": resolve(
        __dirname,
        "packages/solid-stately/src/private/flags/flags.ts",
      ),
      "@proyecto-viviana/solid-stately": resolve(__dirname, "packages/solid-stately/src/index.ts"),
      // The package directory, not its barrel: an alias key also matches
      // `<key>/<subpath>`, so pointing at index.ts breaks every narrow subpath
      // import (`solidaria/i18n` becomes `src/index.ts/i18n`). A directory
      // resolves both the bare specifier and each subpath to its own index.
      "@proyecto-viviana/solidaria": resolve(__dirname, "packages/solidaria/src"),
      "@proyecto-viviana/solidaria-components/slots": resolve(
        __dirname,
        "packages/solidaria-components/src/slots.tsx",
      ),
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
