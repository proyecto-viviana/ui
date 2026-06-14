import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { adminApiPlugin } from "./src/app/admin/server/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

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
  optimizeDeps: {
    noDiscovery: true,
    exclude: [
      "@proyecto-viviana/solid-spectrum",
      "@proyecto-viviana/solidaria",
      "@proyecto-viviana/solidaria-components",
      "@proyecto-viviana/solid-stately",
    ],
  },
  plugins: [
    // Dev-only /api/admin middleware (apply:"serve"); runs in the Node process,
    // not the workerd SSR env (which has no repo filesystem). Ordered first so it
    // wins for /api/admin before any SSR catch-all. See admin-dashboard.md.
    adminApiPlugin(),
    tanstackStart(),
    viteSolid({ ssr: true }),
    ...(isProd ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
  ],
});
