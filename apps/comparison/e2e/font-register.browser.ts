import { test, expect, type Page } from "@playwright/test";

// #649: a page that loads only @proyecto-viviana/ui's components.css and writes
// no font rule of its own must render the Geist register, and must not reach
// for the Spectrum faces the same sheet declares.

const spectrumFace = /^(adobe-clean|source-code-pro)/;

/** The first family the element's computed stack names. */
const leadingFamily = (page: Page, proof: string) =>
  page
    .locator(`[data-proof="${proof}"]`)
    .evaluate((el) => getComputedStyle(el).fontFamily.split(",")[0].trim().replace(/"/g, ""));

/** Every family the element's computed stack names. */
const families = (page: Page, proof: string) =>
  page.locator(`[data-proof="${proof}"]`).evaluate((el) =>
    getComputedStyle(el)
      .fontFamily.split(",")
      .map((family) => family.trim().replace(/"/g, "")),
  );

test("components.css alone renders Geist Pixel, Geist and Geist Mono", async ({ page }) => {
  const typekit: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("typekit.net")) typekit.push(request.url());
  });

  await page.goto("/");
  await expect(page.locator('[data-proof="button"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  expect(await leadingFamily(page, "heading")).toBe("Geist Pixel");
  expect(await leadingFamily(page, "text")).toBe("Geist");
  expect(await leadingFamily(page, "button")).toBe("Geist Mono");

  // The sheet declares the Spectrum faces; a face is fetched only when a
  // rendered stack reaches it. None may leave the unloaded state.
  const reached = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status !== "unloaded")
      .map((face) => face.family.replace(/"/g, "")),
  );
  expect(reached.filter((family) => spectrumFace.test(family))).toEqual([]);
  expect(typekit).toEqual([]);

  // The declared faces are present, so the assertion above is not vacuous.
  const declared = await page.evaluate(() =>
    [...document.fonts].map((face) => face.family.replace(/"/g, "")),
  );
  expect(declared).toContain("adobe-clean-spectrum-vf");
  expect(declared).toContain("source-code-pro");
});

test("a narrower --s2-font-family-sans wins, also inside a nested scheme", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-proof="override-in-scheme"]')).toBeVisible();

  expect(await leadingFamily(page, "override")).toBe("Consumer Sans");
  expect(await leadingFamily(page, "override-in-scheme")).toBe("Consumer Sans");
  expect(await families(page, "override")).not.toContain("Geist");
  // Outside the container the register is untouched.
  expect(await leadingFamily(page, "text")).toBe("Geist");
});
