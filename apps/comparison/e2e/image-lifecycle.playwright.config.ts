import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const args = (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export default defineConfig({
  testDir: ".",
  testMatch: "image-lifecycle.browser.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["line"], ["json", { outputFile: "/tmp/ui-638-native-playwright.json" }]],
  timeout: 120_000,
  outputDir: "/tmp/ui-638-native-test-results",
  use: {
    actionTimeout: 15_000,
    reducedMotion: "no-preference",
    baseURL: "http://127.0.0.1:4480",
    launchOptions: { args },
  },
  webServer: {
    command:
      "node node_modules/vite-plus/bin/vp dev packages/solidaria-components/test/fixtures/image-browser --config packages/solidaria-components/test/fixtures/image-browser/vite.config.ts --host 127.0.0.1 --port 4480 --strictPort",
    cwd: repoRoot,
    url: "http://127.0.0.1:4480",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
