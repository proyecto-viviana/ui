import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const args = (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export default defineConfig({
  testDir: ".",
  testMatch: "filetrigger-dropzone-focus.browser.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  timeout: 60_000,
  outputDir: resolve(repoRoot, "test-results/filetrigger-dropzone-focus"),
  use: {
    actionTimeout: 15_000,
    baseURL: "http://127.0.0.1:4479",
    launchOptions: { args },
  },
  webServer: {
    command:
      "node node_modules/vite-plus/bin/vp dev packages/solidaria-components/test/fixtures/focus-browser --config packages/solidaria-components/test/fixtures/focus-browser/vite.config.ts --host 127.0.0.1 --port 4479 --strictPort",
    cwd: repoRoot,
    url: "http://127.0.0.1:4479",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
