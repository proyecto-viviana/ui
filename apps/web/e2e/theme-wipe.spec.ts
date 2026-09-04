import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * One-pass Bayer theme wipe owned by `useTheme().toggleTheme`.
 * Overlay is a live old-page snapshot, not a `--surface-app` fill.
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

async function spyWipePaint(page: Page) {
  await page.addInitScript(() => {
    type Op = { op: string; w?: number; h?: number; style?: string };
    const box = globalThis as typeof globalThis & { __pvWipePaint: Op[] };
    box.__pvWipePaint = [];
    const proto = CanvasRenderingContext2D.prototype;
    const fill = proto.fillRect;
    proto.fillRect = function (this: CanvasRenderingContext2D, x, y, w, h) {
      if (this.canvas && this.canvas.width === 12 && this.canvas.height === 12) {
        box.__pvWipePaint.push({ op: "fillRect", w, h, style: String(this.fillStyle) });
      }
      return fill.call(this, x, y, w, h);
    };
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

  test("/showcase wipe canvas is an old-page snapshot, not a surface fill", async ({ page }) => {
    await startDark(page);
    await spyWipePaint(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/showcase");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const toggle = page.locator('[aria-label="Toggle color scheme"]');
    await toggle.waitFor();
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await expect(page.locator(wipeCanvas)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(wipeCanvas)).toHaveAttribute("data-theme-wipe-colors", /.+/, {
      timeout: 10_000,
    });
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");

    const paint = await page.evaluate(() => {
      return (
        (
          globalThis as typeof globalThis & {
            __pvWipePaint?: { op: string; w?: number; h?: number; style?: string }[];
          }
        ).__pvWipePaint ?? []
      );
    });
    const coveringFill = paint.filter(
      (entry) => entry.op === "fillRect" && (entry.w ?? 0) >= 12 && (entry.h ?? 0) >= 12,
    );
    const surface = /#0[cC]0[dD]10|#e9eff6|#16171c|#f4f7fb|rgb\(\s*12\s*,\s*13\s*,\s*16\s*\)/i;
    expect(coveringFill.some((entry) => surface.test(entry.style ?? ""))).toBe(false);

    const recorded = await page.locator(wipeCanvas).getAttribute("data-theme-wipe-colors");
    expect(recorded).toBeTruthy();
    const colors = new Set((recorded ?? "").split(",").filter(Boolean));
    expect(colors.size).toBeGreaterThan(2);
    const surfaceHex = new Set(["#0C0D10", "#0c0d10", "#e9eff6", "#E9EFF6", "#16171c", "#f4f7fb"]);
    expect([...colors].some((color) => !surfaceHex.has(color))).toBe(true);
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
