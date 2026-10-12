import solidPlugin from "@solidjs/vite-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { vivianaMacros } from "../../../src/vite";
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../../..");
export default defineConfig({
  root: here,
  cacheDir: resolve(repoRoot, "output/qualification-runtime/ui-649-font-register-vite-cache"),
  plugins: [vivianaMacros(), ...solidPlugin()],
  server: { host: "127.0.0.1", port: 4482, strictPort: true, fs: { allow: [repoRoot] } },
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["solid-js", "@solidjs/web"],
    alias: [
      "solid-stately",
      "solidaria",
      "solidaria-components",
      "solid-spectrum",
      "viviana-ui",
    ].map((name) => ({
      find: new RegExp(`^@proyecto-viviana/${name === "viviana-ui" ? "ui" : name}(?=/|$)`),
      replacement: resolve(repoRoot, `packages/${name}/src`),
    })),
  },
});
