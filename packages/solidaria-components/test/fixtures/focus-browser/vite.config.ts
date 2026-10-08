import solidPlugin from "@solidjs/vite-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../../..");

export default defineConfig({
  root: here,
  plugins: [...solidPlugin()],
  server: {
    host: "127.0.0.1",
    port: 4479,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["solid-js", "@solidjs/web"],
    alias: {
      "@proyecto-viviana/solid-stately": resolve(repoRoot, "packages/solid-stately/src"),
      "@proyecto-viviana/solidaria": resolve(repoRoot, "packages/solidaria/src"),
    },
  },
});
