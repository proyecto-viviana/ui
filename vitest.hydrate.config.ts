import { defineConfig } from "vite-plus";
import solidPlugin from "vite-plugin-solid";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hydration test project. `solid({ ssr: true })` under a *client* transform
// (vitest's jsdom env, isSsr=false) compiles to `generate: "dom",
// hydratable: true` — DOM templates with the hydration-walk wrappers, so
// `hydrate()` over SSR markup actually runs the hydration path (the plain
// `generate:"dom", hydratable:false` of vitest.config.ts cannot). This is the
// client half of the dual-compilation that reproduces SSR hydration mismatches.
export default defineConfig({
  // hot:false strips the solid-refresh HMR wrapper — it is dev-only (absent in
  // the workerd/browser prod build), and it desyncs createUniqueId's hydration
  // slot vs the server. Keeping it would make this harness test a dev artifact,
  // not the real prod SSR→hydrate path.
  plugins: [solidPlugin({ ssr: true, hot: false })],
  test: {
    name: "hydrate",
    environment: "jsdom",
    globals: true,
    pool: "vmThreads",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/test/**/*.hydrate.test.{ts,tsx}"],
    // solid-js core and solid-js/web MUST be one module instance: web's
    // hydrate() sets sharedConfig.context, and core's createUniqueId reads it.
    // If vitest loads them as two instances, createUniqueId sees a null context
    // forever → drifts every hydration key after it. Inlining both through the
    // single transform pipeline guarantees one shared sharedConfig.
    server: {
      deps: {
        inline: ["solid-js", "solid-js/web", "solid-js/store"],
      },
    },
  },
  resolve: {
    conditions: ["development", "browser"],
    // Single solid-js instance so the trace patches the same sharedConfig the
    // web build calls (otherwise the helper grabs a second copy).
    dedupe: ["solid-js", "solid-js/web", "solid-js/store"],
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
