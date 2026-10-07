import { defineConfig } from "vite-plus";
import { fileURLToPath } from "node:url";
import base from "../../vitest.ssr.config";

export default defineConfig({
  ...base,
  resolve: {
    ...base.resolve,
    alias: {
      ...base.resolve?.alias,
      // The D12 island imports comparison data the same way the app does.
      "@comparison": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: { ...base.test, include: ["apps/comparison/test/solid-integration/*.ssr.test.tsx"] },
});
