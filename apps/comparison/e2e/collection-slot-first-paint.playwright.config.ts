import { defineConfig, devices } from "@playwright/test";

const args = (process.env.COMPARISON_CHROMIUM_ARGS ?? "").split(/\s+/).filter(Boolean);

export default defineConfig({
  testDir: ".",
  testMatch: "collection-slot-first-paint.browser.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    actionTimeout: 15_000,
    launchOptions: { args },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
