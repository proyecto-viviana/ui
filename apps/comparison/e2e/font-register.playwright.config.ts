import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean);
export default defineConfig({
  testDir: ".",
  testMatch: "font-register.browser.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["line"]],
  timeout: 120_000,
  outputDir: resolve(repoRoot, "output/qualification-runtime/ui-649-font-register-results"),
  use: {
    actionTimeout: 15_000,
    baseURL: "http://127.0.0.1:4482",
    launchOptions: { args },
  },
  webServer: {
    command:
      "node node_modules/vite-plus/bin/vp dev packages/viviana-ui/test/fixtures/font-register-browser --config packages/viviana-ui/test/fixtures/font-register-browser/vite.config.ts --host 127.0.0.1 --port 4482 --strictPort",
    cwd: repoRoot,
    url: "http://127.0.0.1:4482",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
