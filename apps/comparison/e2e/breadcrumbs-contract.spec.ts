import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import { breadcrumbsItemSetOptions, breadcrumbsSizeOptions } from "../src/data/breadcrumbs-demo";

function breadcrumbsQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function breadcrumbsFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/breadcrumbs/${breadcrumbsQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function visibleBreadcrumbItems(panel: Locator) {
  return panel
    .locator('[aria-label="Project location"]')
    .first()
    .locator("li")
    .evaluateAll((items) =>
      items.map((item) => ({
        text: item.textContent?.trim() ?? "",
        hasMenuButton: item.querySelector('button[aria-label="More items"]') !== null,
      })),
    );
}

test.describe("comparison Breadcrumbs route contract", () => {
  test("Breadcrumbs route mounts the React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page);

    const expectedProps = JSON.stringify({
      size: "M",
      itemSet: "standard",
      isDisabled: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,breadcrumbs");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,breadcrumbs");
    await expect(reactPanel.getByRole("list", { name: "Project location" })).toBeVisible();
    await expect(solidPanel.getByRole("list", { name: "Project location" })).toBeVisible();
  });

  test("Breadcrumbs controls match the S2 size, item-set, and disabled axes", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      size: "L",
      itemSet: "overflow",
      isDisabled: true,
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...breadcrumbsSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("L");
    await expect(
      page
        .locator('input[name="itemSet"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...breadcrumbsItemSetOptions]);
    await expect(page.locator('input[name="itemSet"]:checked')).toHaveValue("overflow");
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();

    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ size: "L", itemSet: "overflow", isDisabled: true }),
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ size: "L", itemSet: "overflow", isDisabled: true }),
    );
    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeDisabled();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeDisabled();
  });

  test("Breadcrumbs dispatch onAction and truncate the path on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await reactPanel.getByRole("button", { name: "More items" }).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Projects" }).click();

    await solidPanel.getByRole("button", { name: "More items" }).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Projects" }).click();

    await expect(reactRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(solidRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "projects");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "projects");
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,files,projects");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,files,projects");
  });

  test("Breadcrumbs collapse overflow items into a menu on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await reactPanel.getByRole("button", { name: "More items" }).click();
    await expect(page.getByRole("menu").getByRole("menuitem", { name: "Files" })).toBeVisible();
    await page.getByRole("menu").getByRole("menuitem", { name: "Files" }).click();

    await solidPanel.getByRole("button", { name: "More items" }).click();
    await expect(page.getByRole("menu").getByRole("menuitem", { name: "Files" })).toBeVisible();
    await page.getByRole("menu").getByRole("menuitem", { name: "Files" }).click();

    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "files");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "files");
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,files");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,files");
  });

  test("Breadcrumbs responsive overflow measurement matches React Spectrum", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeVisible();

    await reactRoot.evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "100px";
    });
    await solidRoot.evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "100px";
    });

    const expectedNarrowItems = [
      { text: "Home", hasMenuButton: false },
      { text: "", hasMenuButton: true },
      { text: "Annual report", hasMenuButton: false },
    ];

    await expect
      .poll(async () => ({
        react: await visibleBreadcrumbItems(reactPanel),
        solid: await visibleBreadcrumbItems(solidPanel),
      }))
      .toEqual({
        react: expectedNarrowItems,
        solid: expectedNarrowItems,
      });
  });
});

// #429: require the settled wide shape before any resize or live-control update.
async function expectWideOverflowItems(reactPanel: Locator, solidPanel: Locator) {
  const expected = [
    { text: "Home", hasMenuButton: false },
    { text: "", hasMenuButton: true },
    { text: "Reports", hasMenuButton: false },
    { text: "Annual report", hasMenuButton: false },
  ];
  await expect
    .poll(async () => ({
      react: await visibleBreadcrumbItems(reactPanel),
      solid: await visibleBreadcrumbItems(solidPanel),
    }))
    .toEqual({ react: expected, solid: expected });
  for (const panel of [reactPanel, solidPanel]) {
    const list = panel.getByRole("list", { name: "Project location" });
    await expect(list).toBeVisible();
    await expect(list.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(list.locator("li").last().getByRole("link")).toHaveCount(0);
    await expect(list.locator("li").last().getByRole("button")).toHaveCount(0);
  }
}

async function exactWideOverflowMenu(page: Page, panel: Locator) {
  const trigger = panel.getByRole("button", { name: "More items", exact: true });
  await expect(trigger).toBeEnabled();
  await expect(trigger).toHaveAttribute("aria-haspopup", /^(menu|true)$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();
  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("role", "menu");
  await expect(menu.getByRole("menuitem")).toHaveText(["Files", "Projects"]);
  return { trigger, menu };
}

test.describe("comparison Breadcrumbs URL overflow remeasurement (#429)", () => {
  for (const { label, size, isDisabled } of [
    { label: "M", size: "M", isDisabled: false },
    { label: "L", size: "L", isDisabled: false },
    { label: "disabled M", size: "M", isDisabled: true },
    { label: "disabled L", size: "L", isDisabled: true },
  ]) {
    test(`Breadcrumbs URL overflow retains the wide tail and exact menu: ${label}`, async ({
      page,
    }) => {
      const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
        size,
        itemSet: "overflow",
        isDisabled,
      });
      await expectWideOverflowItems(reactPanel, solidPanel);
      for (const [panel, root] of [
        [reactPanel, reactRoot],
        [solidPanel, solidRoot],
      ]) {
        await expect(root).toHaveAttribute(
          "data-comparison-control-props",
          JSON.stringify({ size, itemSet: "overflow", isDisabled }),
        );
        await expect(root).toHaveAttribute(
          "data-comparison-path",
          "home,files,projects,reports,annual-report",
        );
        await expect(root).toHaveAttribute("data-comparison-action-count", "0");
        await expect(root).toHaveAttribute("data-comparison-last-action", "");
        const trigger = panel.getByRole("button", { name: "More items", exact: true });
        if (isDisabled) {
          await expect(trigger).toBeDisabled();
          await expect(trigger).toHaveAttribute("aria-expanded", "false");
          await expect(page.getByRole("menu")).toHaveCount(0);
        } else {
          const { menu } = await exactWideOverflowMenu(page, panel);
          await menu.getByRole("menuitem", { name: "Projects", exact: true }).click();
          await expect(page.getByRole("menu")).toHaveCount(0);
          await expect(root).toHaveAttribute("data-comparison-action-count", "1");
          await expect(root).toHaveAttribute("data-comparison-last-action", "projects");
          await expect(root).toHaveAttribute("data-comparison-path", "home,files,projects");
        }
      }
    });
  }

  test("Breadcrumbs live standard-to-overflow controls retain the wide tail and exact menu", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page);
    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-path", "home,breadcrumbs");
    }
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("comparison:controls-change", {
          detail: {
            component: "breadcrumbs",
            props: { size: "M", itemSet: "overflow", isDisabled: false },
          },
        }),
      );
    });
    await expectWideOverflowItems(reactPanel, solidPanel);
    for (const [panel, root] of [
      [reactPanel, reactRoot],
      [solidPanel, solidRoot],
    ]) {
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        JSON.stringify({ size: "M", itemSet: "overflow", isDisabled: false }),
      );
      await expect(root).toHaveAttribute(
        "data-comparison-path",
        "home,files,projects,reports,annual-report",
      );
      const { trigger } = await exactWideOverflowMenu(page, panel);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
      await expect(root).toHaveAttribute("data-comparison-last-action", "");
    }
  });
});
