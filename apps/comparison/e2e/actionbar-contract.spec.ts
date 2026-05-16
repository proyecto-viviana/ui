import { expect, test, type Locator, type Page } from "@playwright/test";
import { actionBarSelectedItemCountOptions } from "../src/data/actionbar-demo";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";

function actionBarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionBarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionbar/${actionBarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="actionbar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="actionbar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactRoot, solidRoot };
}

async function expectActionBarVisible(root: Locator, count: string) {
  await expect(root).toHaveAttribute("data-comparison-selected-count", count);
  await expect(root.getByRole("toolbar")).toBeVisible();
  await expect(root.getByRole("button", { name: "Clear selection" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Copy" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Delete" })).toBeVisible();
}

async function actionBarScrollGeometry(root: Locator) {
  return root.evaluate((element) => {
    const shell = element.querySelector(
      '[data-comparison-actionbar-scroll-shell="true"]',
    ) as HTMLElement | null;
    const toolbar = Array.from(shell?.children ?? []).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        !child.matches(".comparison-actionbar-scroll-content") &&
        child.querySelector('button[aria-label="Clear selection"]') != null,
    );

    if (!shell || !toolbar) {
      throw new Error("ActionBar scrollRef fixture is missing its shell or toolbar");
    }

    const shellRect = shell.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const shellStyles = window.getComputedStyle(shell);
    const styles = window.getComputedStyle(toolbar);
    const scrollbarWidth = shell.offsetWidth - shell.clientWidth;

    return {
      bottom: styles.bottom,
      inlineEndOffset: Math.round(shellRect.right - toolbarRect.right),
      insetInlineEnd: styles.insetInlineEnd,
      paddingInlineEnd: Number.parseFloat(shellStyles.paddingInlineEnd) || 0,
      position: styles.position,
      scrollbarWidth,
      shellWidth: Math.round(shellRect.width),
    };
  });
}

function expectScrollGeometryMatchesS2(
  geometry: Awaited<ReturnType<typeof actionBarScrollGeometry>>,
) {
  expect(geometry.position).toBe("absolute");
  expect(geometry.bottom).toBe("0px");
  expect(geometry.scrollbarWidth).toBeGreaterThanOrEqual(0);
  expect(
    Math.abs(geometry.inlineEndOffset - (geometry.paddingInlineEnd + 8 + geometry.scrollbarWidth)),
  ).toBeLessThanOrEqual(1);
}

test.describe("comparison ActionBar route contract", () => {
  test("ActionBar route mounts React and Solid styled references", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page);
    const expectedProps = JSON.stringify({
      selectedItemCount: 3,
      isEmphasized: false,
      useScrollRef: false,
      useCollection: false,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", expectedProps);
      await expectActionBarVisible(root, "3");
      await expect(root).toHaveAttribute("data-comparison-clear-count", "0");
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
    }
  });

  test("ActionBar controls drive selected count and emphasis into both stacks", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      selectedItemCount: "all",
      isEmphasized: true,
      useScrollRef: true,
    });

    await expect(
      page
        .locator('input[name="selectedItemCount"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionBarSelectedItemCountOptions]);
    await expect(page.locator('input[name="selectedItemCount"]:checked')).toHaveValue("all");
    await expect(page.locator('input[name="isEmphasized"]')).toBeChecked();
    await expect(page.locator('input[name="useScrollRef"]')).toBeChecked();
    await expect(page.locator('input[name="useCollection"]')).not.toBeChecked();

    const expectedProps = JSON.stringify({
      selectedItemCount: "all",
      isEmphasized: true,
      useScrollRef: true,
      useCollection: false,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", expectedProps);
      await expectActionBarVisible(root, "all");
      await expect(root).toHaveAttribute("data-comparison-actionbar-scroll-ref", "true");
    }
  });

  test("ActionBar hides when selected count is zero", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      selectedItemCount: "0",
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
      await expect(root.getByRole("button", { name: "Clear selection" })).toHaveCount(0);
    }
  });

  test("ActionBar clear selection and child actions update both stacks", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page);

    for (const root of [reactRoot, solidRoot]) {
      await root.getByRole("button", { name: "Edit" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-count", "1");

      await root.getByRole("button", { name: "Clear selection" }).click();
      await expect(root).toHaveAttribute("data-comparison-clear-count", "1");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
    }
  });

  test("ActionBar Escape and toolbar keyboard navigation match in both stacks", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page);

    for (const root of [reactRoot, solidRoot]) {
      const edit = root.getByRole("button", { name: "Edit" });
      const copy = root.getByRole("button", { name: "Copy" });
      const del = root.getByRole("button", { name: "Delete" });

      await edit.focus();
      await expect(edit).toBeFocused();

      await page.keyboard.press("ArrowRight");
      await expect(copy).toBeFocused();

      await page.keyboard.press("ArrowRight");
      await expect(del).toBeFocused();

      await page.keyboard.press("ArrowLeft");
      await expect(copy).toBeFocused();

      await page.keyboard.press("Escape");
      await expect(root).toHaveAttribute("data-comparison-clear-count", "1");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
    }
  });

  test("ActionBar scrollRef positions above the scroll container in both stacks", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      useScrollRef: true,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-actionbar-scroll-ref", "true");
      expectScrollGeometryMatchesS2(await actionBarScrollGeometry(root));
    }

    for (const root of [reactRoot, solidRoot]) {
      await root.locator('[data-comparison-actionbar-scroll-shell="true"]').evaluate((element) => {
        (element as HTMLElement).style.inlineSize = "420px";
      });

      await expect
        .poll(async () => {
          const geometry = await actionBarScrollGeometry(root);
          return (
            geometry.shellWidth === 420 &&
            Math.abs(
              geometry.inlineEndOffset - (geometry.paddingInlineEnd + 8 + geometry.scrollbarWidth),
            ) <= 1
          );
        })
        .toBe(true);
    }
  });

  test("ActionBar scrollRef exit completes under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      useScrollRef: true,
    });

    for (const root of [reactRoot, solidRoot]) {
      await root.getByRole("button", { name: "Clear selection" }).click();
      await expect(root).toHaveAttribute("data-comparison-clear-count", "1");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
    }
  });

  test("ActionBar collection selection drives count and clear in both stacks", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      useCollection: true,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-actionbar-collection", "true");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "3");
      await expect(root).toHaveAttribute(
        "data-comparison-selected-keys",
        "reports,roadmap,research",
      );
      await expectActionBarVisible(root, "3");

      await root.getByRole("button", { name: "Clear selection" }).focus();
      await page.keyboard.press("Enter");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
    }
  });
});
