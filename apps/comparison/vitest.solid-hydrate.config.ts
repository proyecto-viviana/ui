import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";
import base from "../../vitest.hydrate.config";

export default defineConfig({
  ...base,
  optimizeDeps: {
    noDiscovery: true,
    entries: ["apps/comparison/test/solid-integration/*.hydrate.test.tsx"],
  },
  resolve: {
    ...base.resolve,
    alias: {
      ...base.resolve?.alias,
      "@comparison": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    ...base.test,
    server: { deps: { inline: ["solid-js", "@solidjs/web", "@solidjs/h"] } },
    include: ["apps/comparison/test/solid-integration/*.hydrate.test.tsx"],
  },
});
