import { defineConfig } from "vite-plus";
import solidPlugin from "@solidjs/vite-plugin";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// SSR-compiled test project. The node test environment selects `generate:
// "ssr"`; the explicit compiler override counters the Solid Vite plugin's
// test-mode `hydratable: false` default so server output retains hydration
// markers. Dropping the "browser" resolve condition also makes `@solidjs/web`
// resolve to its server build (`isServer === true`, `renderToString` works).
export default defineConfig({
  plugins: [...solidPlugin({ ssr: true, solid: { hydratable: true } })],
  optimizeDeps: {
    // Vite+ 0.2's test bootstrap otherwise performs Vite's default HTML-entry
    // discovery before Vitest applies its file include. That crosses ignored
    // build output and the vendored React Spectrum oracle, where JSX-in-.js is
    // intentionally valid for upstream's own toolchain but not ours.
    noDiscovery: true,
    entries: ["packages/**/test/**/*.ssr.test.{ts,tsx}"],
  },
  test: {
    name: "ssr",
    environment: "node",
    globals: true,
    pool: "forks",
    include: ["packages/**/test/**/*.ssr.test.{ts,tsx}"],
  },
  resolve: {
    conditions: ["solid", "development"],
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
