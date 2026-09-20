import { defineConfig } from "vite-plus";
import base from "../../vitest.ssr.config";

export default defineConfig({
  ...base,
  test: { ...base.test, include: ["apps/comparison/test/solid-integration/*.ssr.test.tsx"] },
});
