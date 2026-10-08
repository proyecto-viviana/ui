import solidPlugin from "@solidjs/vite-plugin";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { vivianaMacros } from "../../../../viviana-ui/src/vite";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../../../..");
const packages = [
  "solid-stately",
  "solidaria",
  "solidaria-components",
  "solid-spectrum",
  "viviana-ui",
];
export default defineConfig({
  root: here,
  cacheDir: "/tmp/ui-638-native-vite-cache",
  plugins: [
    vivianaMacros(),
    ...solidPlugin(),
    {
      name: "image-proof-module-graph",
      configureServer(server) {
        server.middlewares.use("/__image_graph", (_req, res) => {
          const modules = [...server.environments.client.moduleGraph.idToModuleMap.values()].map(
            (m) => {
              const file = m.file;
              return {
                id: m.id,
                url: m.url,
                file,
                sha256:
                  file && !file.startsWith("\0")
                    ? (() => {
                        try {
                          return createHash("sha256").update(readFileSync(file)).digest("hex");
                        } catch {
                          return null;
                        }
                      })()
                    : null,
                imports: [...m.importedModules].map((i) => i.id),
              };
            },
          );
          res.setHeader("Content-Type", "application/json");
          const metadataPath = "/tmp/ui-638-native-vite-cache/deps/_metadata.json";
          const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
          const optimized = Object.entries(metadata.optimized).map(([name, value]) => {
            const source = resolve(dirname(metadataPath), (value as { src: string }).src);
            return {
              name,
              source,
              sha256: createHash("sha256").update(readFileSync(source)).digest("hex"),
            };
          });
          res.end(JSON.stringify({ pid: process.pid, cwd: process.cwd(), modules, optimized }));
        });
      },
    },
  ],
  server: { host: "127.0.0.1", port: 4480, strictPort: true, fs: { allow: [repoRoot] } },
  resolve: {
    conditions: ["development", "browser"],
    dedupe: ["solid-js", "@solidjs/web"],
    alias: packages.map((name) => ({
      find: new RegExp(`^@proyecto-viviana/${name === "viviana-ui" ? "ui" : name}(?=/|$)`),
      replacement: resolve(repoRoot, `packages/${name}/src`),
    })),
  },
});
