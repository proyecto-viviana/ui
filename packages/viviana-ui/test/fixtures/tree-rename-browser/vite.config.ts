import solidPlugin from "@solidjs/vite-plugin";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { vivianaMacros } from "../../../src/vite";
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../../..");
export default defineConfig({
  root: here,
  cacheDir: resolve(repoRoot, "output/qualification-runtime/ui-625-tree-rename-vite-cache"),
  plugins: [
    vivianaMacros(),
    ...solidPlugin(),
    {
      name: "tree-rename-proof-module-graph",
      configureServer(server) {
        server.middlewares.use("/__tree_rename_graph", (_req, res) => {
          const modules = [...server.environments.client.moduleGraph.idToModuleMap.values()].map(
            (m) => {
              const file = m.file;
              let sha256 = null;
              if (file && !file.startsWith("\0")) {
                try {
                  sha256 = createHash("sha256").update(readFileSync(file)).digest("hex");
                } catch {}
              }
              return { id: m.id, file, sha256, imports: [...m.importedModules].map((i) => i.id) };
            },
          );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ pid: process.pid, cwd: process.cwd(), modules }));
        });
      },
    },
  ],
  server: { host: "127.0.0.1", port: 4481, strictPort: true, fs: { allow: [repoRoot] } },
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
