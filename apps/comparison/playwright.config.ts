import { defineConfig, devices } from "@playwright/test";

if (process.env.NO_COLOR != null) {
  // Playwright forces color in worker and web-server child processes. Dropping
  // NO_COLOR here avoids Node warning that it will be ignored anyway.
  delete process.env.NO_COLOR;
}

const port = Number(process.env.COMPARISON_PORT ?? 4322);
const host = process.env.COMPARISON_HOST ?? "127.0.0.1";
const baseURL = process.env.COMPARISON_BASE_URL ?? `http://${host}:${port}`;
const managesPreviewServer = process.env.COMPARISON_BASE_URL == null;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  use: {
    baseURL,
    trace: "on-first-retry",
    // D2c motion-review video (drivers/motion.ts): off by default so ordinary
    // runs record nothing. `MOTION_REVIEW=1` records every motion spec for a
    // human side-by-side pass; scope it by running only the D2 grep. It lives
    // here, not in a `test.use` inside the motion describe, because a describe
    // -level `video` override forces a new Playwright worker.
    video: process.env.MOTION_REVIEW ? "on" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: managesPreviewServer
    ? {
        command: `vp run comparison:preview --host ${host} --port ${port}`,
        url: `${baseURL}/components/dialog/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        cwd: new URL("../..", import.meta.url).pathname,
      }
    : undefined,
});
