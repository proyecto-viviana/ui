import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * The theme swap is the library's `createThemeTransition` (Terminal Glass):
 * a frozen DOM clone of the old page is mounted, the scheme flips underneath it,
 * and the clone dissolves through a checker+grain ring. It is NOT the retired
 * canvas cover — there is no `[data-theme-wipe]` canvas and no surface fill —
 * and `data-color-scheme` is now the only scheme attribute on `<html>`.
 */

const clone = "[data-gl-clone]";

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

test.describe("theme transition", () => {
  test.setTimeout(60_000);

  test("Header toggle dissolves a snapshot and flips the one scheme attribute", async ({
    page,
  }) => {
    await startDark(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, routes.docs);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await clickHeaderThemeToggle(page);

    await expect(page.locator(clone).first()).toBeAttached({ timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
    /* The `data-theme` mirror is retired: two attributes for one switch is how a
       page ends up half-light after a swap that only updates one of them. */
    expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
    /* The retired canvas cover must not come back. */
    await expect(page.locator("[data-theme-wipe]")).toHaveCount(0);
  });

  test("the overlay is a frozen copy of the old page, not a flat fill", async ({ page }) => {
    await startDark(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, "/showcase");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const toggle = page.locator('[aria-label="Toggle color scheme"]');
    await toggle.waitFor();
    await toggle.evaluate((el) => (el as HTMLElement).click());

    /* Two layers: an outer copy masked by the plain ring, and an inner copy whose
       ring is intersected with the checker + grain — that intersection is what
       makes the edge dissolve in pixels instead of sweeping as a clean circle. */
    await expect(page.locator(clone)).toHaveCount(2, { timeout: 10_000 });
    const snapshot = page.locator(clone).last();
    const shape = await snapshot.evaluate((el) => ({
      elements: el.querySelectorAll("*").length,
      text: (el.textContent ?? "").trim().length,
      mask: getComputedStyle(el).maskImage,
      frozen: el.innerHTML.includes("animation-play-state: paused"),
      wrapped: el.parentElement?.hasAttribute("data-gl-clone-wrap") ?? false,
    }));
    expect(shape.elements).toBeGreaterThan(20);
    expect(shape.text).toBeGreaterThan(20);
    expect(shape.mask).toContain("url(");
    expect(shape.frozen).toBe(true);
    expect(shape.wrapped).toBe(true);

    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
    /* The snapshot must not outlive the dissolve — it is pointer-events:none but
       it still covers the page, and a stuck copy freezes the whole site. */
    await expect(page.locator(clone)).toHaveCount(0, { timeout: 10_000 });
  });

  test("prefers-reduced-motion skips the snapshot and still flips the scheme", async ({ page }) => {
    await startDark(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoReady(page, routes.docs);
    await clickHeaderThemeToggle(page);

    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
    await expect(page.locator(clone)).toHaveCount(0);
  });
});
