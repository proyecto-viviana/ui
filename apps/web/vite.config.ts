import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "@solidjs/vite-plugin";
import { vivianaMacros } from "@proyecto-viviana/ui/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { adminApiPlugin } from "./src/app/admin/server/plugin";
import { sitemapPlugin } from "./src/app/seo/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Workspace packages are linked through node_modules and resolve through their
// `exports` to the built `dist`; this app's tsconfig maps no workspace paths. A
// web build therefore tests the last package build, not the working tree:
// rebuild a changed package before a local web gate (#576). Keep them out of
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
      exclude: [...workspacePackages, "solid-js", "@solidjs/web"],
    },
  },
  optimizeDeps: {
    // The vite-plus dep scanner can't parse Solid TSX (it falls back to the
    // React JSX runtime), so skip discovery and optimize on demand instead.
    noDiscovery: true,
    exclude: workspacePackages,
  },
  plugins: [
    // The S2 style() macro, for this app's own `with { type: "macro" }` imports;
    // the packages arrive macro-expanded in their dist. Without this pass the
    // import attribute is ignored, `style` falls back to its runtime form, and the
    // dynamic-style path calls `new Function`, which workerd SSR forbids
    // ("Code generation from strings disallowed") — the Provider's container style
    // then throws on every SSR render. The wrapper is `vivianaMacros()`.
    // Must run ahead of viteSolid so it sees the original `with`-tagged imports.
    vivianaMacros(),
    // Dev-only /api/admin middleware (apply:"serve"); runs in the Node process,
    // not the workerd SSR env (which has no repo filesystem). Ordered first so it
    // wins for /api/admin before the cloudflare SSR env. See admin-dashboard.md.
    adminApiPlugin(),
    // Emits /sitemap.xml from the generated route tree, and serves it in dev.
    // Ordered with adminApiPlugin so its middleware is registered before the
    // cloudflare SSR env claims the request. See src/app/seo/plugin.ts.
    sitemapPlugin(),
    // cloudflare provides the workerd SSR environment used in dev and prod alike.
    // Must stay ahead of tanstackStart so the SSR env is set up before routing.
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    ...viteSolid({ ssr: true }),
  ],
});
