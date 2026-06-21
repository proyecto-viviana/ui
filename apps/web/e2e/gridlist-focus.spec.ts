import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * Roving-tabindex focus + single-toggle selection contract for the Solidaria
 * GridList.
 *
 * Two things jsdom cannot prove, verified here in a real browser:
 *
 * 1. **Focus follows the keyboard onto the row.** GridList's grid container
 *    keeps `tabIndex: 0` and never calls `element.focus()` itself, so entering
 *    the grid would leave real DOM focus on the container. A post-commit effect
 *    (mirroring React Aria's `useSelectableCollection`) moves focus onto the
 *    focused row by its stable `data-key`. Without it the screen-reader cursor
 *    never follows arrow navigation and Space has nothing to act on.
 * 2. **Space toggles exactly once.** Selection lives only on the row hook
 *    (matching upstream, where the collection has no Space/Enter case). When the
 *    grid hook also handled Space, Solid's delegated keydown replayed bubbling up
 *    the composed path and toggled the focused row twice — a net no-op. This is
 *    the latent double-toggle the Table fix already closed; here it is closed for
 *    GridList and guarded against regression.
 *
 * Entry is driven by a real `Tab` keypress from a button injected immediately
 * before the grid. That mirrors how a keyboard user reaches the grid; a
 * programmatic `locator.focus()` cannot be used because Playwright re-asserts
 * focus on the grid container when the focus-following effect (which fires
 * synchronously inside the grid's focus handler) moves focus onto the first row.
 */

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
}

// Tab into a grid the way a keyboard user would: focus a button placed right
// before it, then press Tab. The grid's tab stop hands focus to its focused row
// via the roving-tabindex effect, so DOM focus lands on the first row.
async function tabIntoGrid(page: Page, gridLabel: string) {
  await page.evaluate((label) => {
    const grid = document.querySelector(`[role="grid"][aria-label="${label}"]`);
    if (!grid) {
      throw new Error(`grid not found: ${label}`);
    }
    const existing = document.getElementById("e2e-pre-grid-btn");
    existing?.remove();
    const btn = document.createElement("button");
    btn.id = "e2e-pre-grid-btn";
    btn.textContent = "before grid";
    grid.parentElement!.insertBefore(btn, grid);
  }, gridLabel);
  await page.locator("#e2e-pre-grid-btn").focus();
  await page.keyboard.press("Tab");
}

test.describe("GridList roving focus + single-toggle selection", () => {
  test("keyboard nav carries real DOM focus to the row, and Space selects it once", async ({
    page,
  }) => {
    await page.goto(routes.docsComponent("gridlist"));
    await waitForPageReady(page);

    // The "Basic Grid" example: single selection, with a controlled readout.
    const grid = page.getByRole("grid", { name: "Photo gallery" });
    await expect(grid).toBeVisible();

    const firstRow = grid.locator('[role="row"][data-key="sunset"]');
    const secondRow = grid.locator('[role="row"][data-key="mountains"]');

    // Tabbing into the grid moves real focus onto the first row — the grid
    // container itself never keeps focus, even though it is the tab stop.
    await tabIntoGrid(page, "Photo gallery");
    await expect(firstRow).toBeFocused();
    await expect(firstRow).toHaveAttribute("tabindex", "0");

    // ArrowDown carries real DOM focus to the next row, not just its tabindex.
    await page.keyboard.press("ArrowDown");
    await expect(secondRow).toBeFocused();
    await expect(secondRow).toHaveAttribute("tabindex", "0");

    // Space on the focused row selects it exactly once. A double toggle would
    // have flipped it straight back to unselected.
    await page.keyboard.press("Space");
    await expect(secondRow).toHaveAttribute("aria-selected", "true");
    await expect(firstRow).toHaveAttribute("aria-selected", "false");

    // The controlled "Selected:" readout reflects exactly one selection.
    await expect(page.getByText("Selected: mountains")).toBeVisible();
  });

  test("Space is a clean single toggle each press in multi-select", async ({ page }) => {
    await page.goto(routes.docsComponent("gridlist"));
    await waitForPageReady(page);

    // The "Multi-Select" example: a task list with multiple selection.
    const grid = page.getByRole("grid", { name: "Task list" });
    await expect(grid).toBeVisible();

    const firstRow = grid.locator('[role="row"][data-key="task-1"]');

    await tabIntoGrid(page, "Task list");
    await expect(firstRow).toBeFocused();

    // One Space selects exactly one row.
    await page.keyboard.press("Space");
    await expect(firstRow).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Selected (1):")).toBeVisible();

    // A second Space deselects it — one clean toggle each way. A double toggle
    // would have left the count unchanged on either press.
    await page.keyboard.press("Space");
    await expect(firstRow).toHaveAttribute("aria-selected", "false");
    await expect(page.getByText("Selected (0):")).toBeVisible();
  });
});
