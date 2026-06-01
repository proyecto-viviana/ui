import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
    exclude: [
      "@proyecto-viviana/solid-spectrum",
      "@proyecto-viviana/solidaria",
      "@proyecto-viviana/solidaria-components",
      "@proyecto-viviana/solid-stately",
    ],
  },
  plugins: [
    tanstackStart(),
    viteSolid({ ssr: true }),
    ...(isProd ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
  ],
});
