import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { assertAxeRunRequested, axeTestIgnore } from "./e2e/require-run-axe.ts";

if (!process.env.CI) {
  const localEnv = fileURLToPath(new URL("../../.env.local", import.meta.url));
  if (existsSync(localEnv)) {
    process.loadEnvFile(localEnv);
  }
}

// A missing RUN_AXE used to skip the axe files and exit 0. Naming either file
// fails here, before the preview server starts. An unfiltered run omits them
// so it cannot report them as passed.
assertAxeRunRequested(process.argv, process.env);

export default defineConfig({
  testDir: "./e2e",
  testIgnore: axeTestIgnore(process.env),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000",
    trace: "on-first-retry",
    launchOptions: {
      args: (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean),
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "vp build && vp preview --port 4000",
    url: "http://localhost:4000/solid-spectrum/playground",
    // A gate never reuses: a stale server from an older build answers
    // every request and the run grades a tree nobody built.
    reuseExistingServer: !process.env.CI && !process.env.VIVIANA_GATE,
    timeout: 180000,
  },
});
