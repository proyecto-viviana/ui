import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * One-pass Bayer theme wipe owned by `useTheme().toggleTheme`.
 * No `page.screenshot`, no in-page `import("/src/lib/glasselated.ts")`,
 * no in-page full-viewport `fillRect` loops.
 */

const wipeCanvas = "[data-theme-wipe]";

test.use({
  launchOptions: {
    args: ["--disable-gpu", "--use-gl=angle", "--use-angle=swiftshader"],
  },
});

async function startDark(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("pv-theme", "dark");
  });
}

async function gotoReady(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
}

async function clickHeaderThemeToggle(page: Page) {
  const btn = page.locator("header").getByRole("button", { name: "Switch to light mode" });
  await btn.waitFor();
  await btn.evaluate((el) => (el as HTMLElement).click());
}

test.describe("theme wipe", () => {
  test.setTimeout(60_000);
  test("Header toggle on docs mounts canvas and flips both attributes", async ({ page }) => {
    await startDark(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, routes.docs);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await clickHeaderThemeToggle(page);

    await expect(page.locator(wipeCanvas)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
  });

  test("/showcase never full-viewport fillRect of --surface-app", async ({ page }) => {
    await startDark(page);
    await page.addInitScript(() => {
      const orig = CanvasRenderingContext2D.prototype.fillRect;
      (window as unknown as { __wipeViewportFill?: boolean }).__wipeViewportFill = false;
      CanvasRenderingContext2D.prototype.fillRect = function fillRect(x, y, w, h) {
        const canvas = this.canvas;
        if (
          canvas.style.zIndex === "2147483600" &&
          w >= window.innerWidth &&
          h >= window.innerHeight
        ) {
          (window as unknown as { __wipeViewportFill?: boolean }).__wipeViewportFill = true;
        }
        return orig.call(this, x, y, w, h);
      };
    });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/showcase");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const toggle = page.locator('[aria-label="Toggle color scheme"]');
    await toggle.waitFor();
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await expect(page.locator(wipeCanvas)).toBeVisible({ timeout: 10_000 });

    await page.clock.install();
    await page.clock.fastForward(300);

    const viewportFill = await page.evaluate(
      () => (window as unknown as { __wipeViewportFill?: boolean }).__wipeViewportFill === true,
    );
    expect(viewportFill).toBe(false);

    const samples = await page.evaluate(() => {
      const canvas = document.querySelector("[data-theme-wipe]") as HTMLCanvasElement | null;
      if (!canvas) return [] as string[];
      const ctx = canvas.getContext("2d");
      if (!ctx) return [] as string[];
      const colors: string[] = [];
      for (let i = 0; i < 32; i++) {
        const x = Math.floor((i % 8) * (canvas.width / 8) + canvas.width / 16);
        const y = Math.floor(Math.floor(i / 8) * (canvas.height / 4) + canvas.height / 8);
        const d = ctx.getImageData(x, y, 1, 1).data;
        colors.push(`rgb(${d[0]}, ${d[1]}, ${d[2]})`);
      }
      return colors;
    });

    expect(samples.length).toBe(32);
    const unique = new Set(samples);
    const solidHold = unique.size === 1 && [...unique][0] === "rgb(12, 13, 16)";
    expect(solidHold).toBe(false);
  });

  test("prefers-reduced-motion skips canvas and still flips scheme", async ({ page }) => {
    await startDark(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, routes.docs);
    await clickHeaderThemeToggle(page);

    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator(wipeCanvas)).toHaveCount(0);
  });
});
