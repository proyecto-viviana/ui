import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { adminApiPlugin } from "./src/app/admin/server/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Workspace packages are linked sources, not pre-built dists: keep them out of
// the dep optimizer (both client and SSR) and bundle them into the SSR graph so
// they share the one solid-js instance. Mirrors apps in the visualmode repo.
const workspacePackages = [
  "@proyecto-viviana/solid-spectrum",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solid-stately",
];

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
    },
    dedupe: ["solid-js", "@tanstack/solid-router", "@tanstack/router-core"],
  },
  ssr: {
    noExternal: [/@proyecto-viviana\/.*/],
    optimizeDeps: {
      // solid-js/solid-js/web are excluded so the SSR env never pre-bundles a
      // second copy: HydrationScript (solid-js/web) and the renderer (solid-js)
      // must share one sharedConfig, or SSR throws "Cannot destructure 'nonce'".
      exclude: [...workspacePackages, "solid-js", "solid-js/web"],
    },
  },
  optimizeDeps: {
    // The vite-plus dep scanner can't parse Solid TSX (it falls back to the
    // React JSX runtime), so skip discovery and optimize on demand instead.
    noDiscovery: true,
    exclude: workspacePackages,
  },
  plugins: [
    // Dev-only /api/admin middleware (apply:"serve"); runs in the Node process,
    // not the workerd SSR env (which has no repo filesystem). Ordered first so it
    // wins for /api/admin before the cloudflare SSR env. See admin-dashboard.md.
    adminApiPlugin(),
    // cloudflare provides the workerd SSR environment used in dev and prod alike.
    // Must stay ahead of tanstackStart so the SSR env is set up before routing.
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteSolid({ ssr: true }),
  ],
});
