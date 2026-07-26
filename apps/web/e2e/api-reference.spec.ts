import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { ApiPageData, ApiPagesIndex } from "../src/data/api-reference";
import { routes } from "./helpers/routes";

/**
 * The generated reference renders what it generated.
 *
 * `guard:api-reference` proves the JSON matches the package's types, and the
 * route sweep proves each page answers 200. Neither can catch the gap between
 * them: a page whose data loaded but whose table rendered nothing still clears
 * the sweep's text floor on its intro prose alone. These assertions read the
 * same JSON the page imports and require it to appear on screen.
 */

const DATA_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "api-reference",
);

/** Read rather than imported: Node's ESM loader wants an import attribute here. */
function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, relative), "utf8")) as T;
}

const pagesIndex = readJson<ApiPagesIndex>("pages.json");
const buttonPage = readJson<ApiPageData>("pages/button.json");

test("the index lists every generated page", async ({ page }) => {
  await page.goto(routes.apiReference);

  await expect(page.getByRole("heading", { name: "API reference", level: 1 })).toBeVisible();
  await expect(page.getByText(`${pagesIndex.pages.length} components`)).toBeVisible();

  // The grid, not the sidebar — both link to the same places, so scope first.
  const grid = page.locator("main a[href^='/docs/components/']");
  await expect(grid).toHaveCount(pagesIndex.pages.length);
});

test("a component page renders every prop its data declares", async ({ page }) => {
  await page.goto(routes.apiComponent(buttonPage.slug));

  await expect(page.getByRole("heading", { name: buttonPage.title, level: 1 })).toBeVisible();

  const entry = buttonPage.entries[0];
  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(entry.props.length);

  // Spot-check both ends of the list: `variant` is ours, `aria-label` arrives
  // through the headless layer, and dropping either would still leave a table.
  for (const name of ["variant", "isPending", "aria-label", "excludeFromTabOrder"]) {
    expect(entry.props.some((prop) => prop.name === name)).toBe(true);
    await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
  }
});

test("a divergent prop says so, in the direction the reader is standing", async ({ page }) => {
  await page.goto(routes.apiComponent(buttonPage.slug));

  const callout = page.getByText(`Differs from ${buttonPage.comparedWith}`);
  await expect(callout).toBeVisible();

  // viviana-ui's Button has create/warning/success; solid-spectrum's has
  // premium/genai. One shared table would print a lie for whichever package the
  // reader installed, which is the entire reason this callout exists.
  const body = page.locator("main");
  await expect(body).toContainText("'create'");
  await expect(body).toContainText("does not have");
  await expect(body).toContainText("'premium'");
});

test("the sidebar filter narrows the component list", async ({ page }) => {
  await page.goto(routes.apiReference);
  // The list is server-rendered, so it is complete and countable before the
  // filter's input handler exists. Waiting for hydration is what makes this a
  // test of the filter rather than of SSR.
  await page.waitForLoadState("networkidle");

  const nav = page.getByRole("navigation", { name: "API reference" });
  const links = nav.locator("a[href^='/docs/components/']");
  await expect(links).toHaveCount(pagesIndex.pages.length);

  await nav.getByRole("searchbox").fill("color");
  const narrowed = pagesIndex.pages.filter((entry) =>
    entry.title.toLowerCase().includes("color"),
  ).length;
  expect(narrowed).toBeGreaterThan(0);
  await expect(links).toHaveCount(narrowed);
});
