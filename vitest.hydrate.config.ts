import { defineConfig } from "vite-plus";
import solidPlugin from "@solidjs/vite-plugin";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hydration test project. The Solid Vite plugin deliberately defaults tests to
// `hydratable: false`, even when `ssr: true`. Override only that compiler flag
// so vitest's jsdom client transform still selects `generate: "dom"`, but emits
// the hydration-walk wrappers needed by `hydrate()` over SSR markup. This is the
// client half of the dual-compilation that reproduces SSR hydration mismatches.
export default defineConfig({
  // Disable refresh wrappers for the paired SSR/client compilation. Test the
  // authored owner structure, without development-only HMR instrumentation.
  plugins: [
    ...solidPlugin({
      ssr: true,
      solid: { hydratable: true },
      refresh: { disabled: true },
    }),
  ],
  optimizeDeps: {
    // Vite+ 0.2's test bootstrap otherwise performs Vite's default HTML-entry
    // discovery before Vitest applies its file include. That crosses ignored
    // build output and the vendored React Spectrum oracle, where JSX-in-.js is
    // intentionally valid for upstream's own toolchain but not ours.
    noDiscovery: true,
    entries: ["packages/**/test/**/*.hydrate.test.{ts,tsx}"],
  },
  environments: {
    __vitest_vm__: {
      optimizeDeps: {
        noDiscovery: true,
        include: [],
      },
    },
  },
  test: {
    name: "hydrate",
    environment: "jsdom",
    globals: true,
    pool: "vmThreads",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/test/**/*.hydrate.test.{ts,tsx}"],
    // Keep core/web hydration state in the same transform pipeline. In rc.9,
    // client createUniqueId reads sharedConfig.hydrating and the current owner;
    // sharedConfig.context is not its client hydration-state signal.
    server: {
      deps: {
        inline: ["solid-js", "@solidjs/web"],
      },
    },
  },
  resolve: {
    conditions: ["development", "browser"],
    // Resolve core/web consistently with the shared hydration runtime.
    dedupe: ["solid-js", "@solidjs/web"],
    alias: {
      "@proyecto-viviana/solid-stately/private/flags/flags": resolve(
        __dirname,
        "packages/solid-stately/src/flags/flags.ts",
      ),
      "@proyecto-viviana/solid-stately": resolve(__dirname, "packages/solid-stately/src/index.ts"),
      // The package directory, not its barrel: see vitest.config.ts. An alias key
      // also matches `<key>/<subpath>`, so a narrow subpath import only resolves
      // if the replacement is the directory.
      "@proyecto-viviana/solidaria": resolve(__dirname, "packages/solidaria/src"),
      "@proyecto-viviana/solidaria-components": resolve(
        __dirname,
        "packages/solidaria-components/src/index.ts",
      ),
      "@proyecto-viviana/solidaria-test-utils": resolve(
        __dirname,
        "packages/solidaria-test-utils/src/index.ts",
      ),
    },
  },
});
