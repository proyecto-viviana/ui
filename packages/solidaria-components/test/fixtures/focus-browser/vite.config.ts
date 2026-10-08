import solidPlugin from "@solidjs/vite-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

import { vivianaMacros } from "../../../../viviana-ui/src/vite";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../../..");

export default defineConfig({
  root: here,
  plugins: [vivianaMacros(), ...solidPlugin()],
  cacheDir: "/tmp/ui-636-native-vite-cache",
  server: {
    host: "127.0.0.1",
    port: 4479,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["solid-js", "@solidjs/web"],
    alias: ["solid-stately", "solidaria", "solidaria-components"].map((name) => ({
      find: new RegExp("^@proyecto-viviana/" + name + "(?=/|$)"),
      replacement: resolve(repoRoot, "packages/" + name + "/src"),
    })),
  },
});
