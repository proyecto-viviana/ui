import { defineConfig } from "vite-plus";
import solidPlugin from "vite-plugin-solid";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// SSR-compiled test project: `solid({ ssr: true })` forces `generate: "ssr"` +
// `hydratable: true`, and drops the "browser" resolve condition so `solid-js/web`
// resolves to its SERVER build (`isServer === true`, `renderToString` works).
// This is the missing half of the dual-compilation needed to reproduce/guard
// SSR hydration: the existing vitest.config.ts is the DOM-compiled half.
export default defineConfig({
  plugins: [solidPlugin({ ssr: true })],
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
    },
  },
});
