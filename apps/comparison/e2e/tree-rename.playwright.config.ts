import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean);
const proof = resolve(
  repoRoot,
  "output/qualification-evidence/ui-tree-rename-browser-proof-20261011",
);
export default defineConfig({
  testDir: ".",
  testMatch: "tree-rename.browser.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["line"], ["json", { outputFile: resolve(proof, "playwright-results.json") }]],
  timeout: 120_000,
  outputDir: resolve(proof, "test-results"),
  use: {
    actionTimeout: 15_000,
    reducedMotion: "no-preference",
    baseURL: "http://127.0.0.1:4481",
    launchOptions: { args },
    trace: "on",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "node node_modules/vite-plus/bin/vp dev packages/viviana-ui/test/fixtures/tree-rename-browser --config packages/viviana-ui/test/fixtures/tree-rename-browser/vite.config.ts --host 127.0.0.1 --port 4481 --strictPort",
    cwd: repoRoot,
    url: "http://127.0.0.1:4481",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
