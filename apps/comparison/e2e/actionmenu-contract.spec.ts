import { expect, test, type Locator, type Page } from "@playwright/test";
import axe from "axe-core";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  actionMenuAlignOptions,
  actionMenuDirectionOptions,
  actionMenuMenuSizeOptions,
  actionMenuSizeOptions,
} from "../src/data/actionmenu-demo";

const actionMenuAxeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;

function actionMenuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionMenuFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionmenu/${actionMenuQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="actionmenu"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="actionmenu"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function actionMenuOpenMenu(page: Page, trigger: Locator) {
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();

  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("role", "menu");

  return menu;
}

async function ensureAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  await expect(
    page.evaluate(() => typeof (window as unknown as { axe?: { run?: unknown } }).axe?.run),
  ).resolves.toBe("function");
}

async function markA11yScope(target: Locator, scope: string) {
  return target.evaluate((element, value) => {
    element.setAttribute("data-actionmenu-a11y-scope", value);
    return `[data-actionmenu-a11y-scope="${value}"]`;
  }, scope);
}

async function expectNoAxeViolations(
  page: Page,
  targets: Locator[],
  label: string,
  options: { includeColorContrast?: boolean } = {},
) {
  await ensureAxe(page);
  const selectors = await Promise.all(
    targets.map((target, index) => markA11yScope(target, `${label}-${index}`)),
  );

  const violations = await page.evaluate(
    async ({ selector, tags, rules }) => {
      const axeRunner = (
        window as unknown as {
          axe: {
            run: (
              context: string,
              options: {
                runOnly: { type: "tag"; values: string[] };
                rules: Record<string, { enabled: boolean }>;
              },
            ) => Promise<{
              violations: Array<{
                id: string;
                help: string;
                impact: string | null;
                nodes: Array<{ target: string[]; html: string; failureSummary?: string }>;
              }>;
            }>;
          };
        }
      ).axe;

      const results = await axeRunner.run(selector, {
        runOnly: { type: "tag", values: tags },
        rules,
      });

      return results.violations.map((violation) => ({
        id: violation.id,
        help: violation.help,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      }));
    },
    {
      selector: selectors.join(", "),
      tags: [...actionMenuAxeTags],
      rules: options.includeColorContrast ? {} : { "color-contrast": { enabled: false } },
    },
  );

  expect(violations, `${label} axe violations`).toEqual([]);
}

async function expectNoDanglingAriaReferences(
  page: Page,
  targets: Locator[],
  label: string,
  options: { minRefs?: number } = {},
) {
  const handles = await Promise.all(targets.map((target) => target.elementHandle()));
  if (handles.some((handle) => handle == null)) {
    throw new Error(`${label} ARIA ID integrity requires mounted target elements.`);
  }

  const result = await page.evaluate((elements) => {
    const attrs = [
      "aria-labelledby",
      "aria-controls",
      "aria-describedby",
      "aria-owns",
      "aria-activedescendant",
      "aria-errormessage",
      "for",
    ] as const;
    const danglingRefs: Array<{ attribute: string; missingId: string; element: string }> = [];
    let totalRefsChecked = 0;

    for (const root of elements) {
      const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
      for (const element of nodes) {
        for (const attribute of attrs) {
          const value = element.getAttribute(attribute);
          if (!value) {
            continue;
          }

          const ids =
            attribute === "aria-activedescendant" ? [value] : value.split(/\s+/).filter(Boolean);

          for (const id of ids) {
            totalRefsChecked += 1;
            if (!document.getElementById(id)) {
              danglingRefs.push({
                attribute,
                missingId: id,
                element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
              });
            }
          }
        }
      }
    }

    return { danglingRefs, totalRefsChecked };
  }, handles as Element[]);

  expect(result.danglingRefs, `${label} dangling ARIA references`).toEqual([]);
  if (options.minRefs != null) {
    expect(result.totalRefsChecked, `${label} ARIA references checked`).toBeGreaterThanOrEqual(
      options.minRefs,
    );
  }
}

async function expectKeyboardMenuButtonContract(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect.poll(() => trigger.getAttribute("aria-haspopup")).toMatch(/^(menu|true)$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");

  await page.keyboard.press("Enter");

  const menu = page.getByRole("menu").first();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();
  await expect(menu).toHaveAttribute("id", menuId!);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");
  await expect
    .poll(async () => {
      return menu.evaluate((element) => {
        return element.contains(document.activeElement);
      });
    })
    .toBe(true);

  await page.keyboard.press("Escape");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
  await expect(trigger).toBeFocused();
}

async function expectOutsidePointerClosesMenu(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.click();

  const menu = page.getByRole("menu").first();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");

  await page.mouse.click(8, 8);

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
}

async function expectA11ySemanticContract(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
  label: string,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await expect(trigger).toBeVisible();
  await expect.poll(() => trigger.getAttribute("aria-haspopup")).toMatch(/^(menu|true)$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expectNoDanglingAriaReferences(page, [root], `${label} closed trigger`);
  await expectNoAxeViolations(page, [root], `${label} closed trigger`);

  await trigger.click();
  const menu = await actionMenuOpenMenu(page, trigger);

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menu", { name: "More actions" })).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveCount(3);
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /Cut/ })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /Paste/ })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).not.toHaveAttribute("aria-disabled");
  await expectNoDanglingAriaReferences(page, [root, menu], `${label} open menu`, { minRefs: 1 });
  await expectNoAxeViolations(page, [root, menu], `${label} open menu`);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
}

async function expectVirtualClickLifecycle(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
  actionName: RegExp,
  expectedAction: string,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.evaluate((element) => (element as HTMLButtonElement).click());
  const menu = await actionMenuOpenMenu(page, trigger);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await menu.getByRole("menuitem", { name: actionName }).evaluate((element) => {
    (element as HTMLElement).click();
  });

  await expect(root).toHaveAttribute("data-comparison-action-count", "1");
  await expect(root).toHaveAttribute("data-comparison-last-action", expectedAction);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}

async function expectTouchLifecycle(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
  actionName: RegExp,
  expectedAction: string,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.tap();
  const menu = await actionMenuOpenMenu(page, trigger);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await menu.getByRole("menuitem", { name: actionName }).tap();

  await expect(root).toHaveAttribute("data-comparison-action-count", "1");
  await expect(root).toHaveAttribute("data-comparison-last-action", expectedAction);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}

async function expectDisabledTouchSuppressed(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });
  await expect(trigger).toBeDisabled();

  const box = await trigger.boundingBox();
  if (!box) {
    throw new Error("Disabled ActionMenu touch suppression requires a visible trigger.");
  }

  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(root).toHaveAttribute("data-comparison-action-count", "0");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
}

async function actionMenuTriggerTargetSize(trigger: Locator, label: string) {
  const box = await trigger.boundingBox();
  if (!box) {
    throw new Error(`${label} target-size check requires a visible trigger.`);
  }

  return {
    width: Number(box.width.toFixed(3)),
    height: Number(box.height.toFixed(3)),
  };
}

function expectTargetSizeParity(
  solid: Awaited<ReturnType<typeof actionMenuTriggerTargetSize>>,
  react: Awaited<ReturnType<typeof actionMenuTriggerTargetSize>>,
  label: string,
) {
  expect(Math.abs(solid.width - react.width), `${label} target width parity`).toBeLessThanOrEqual(
    1,
  );
  expect(
    Math.abs(solid.height - react.height),
    `${label} target height parity`,
  ).toBeLessThanOrEqual(1);
}

async function expectColorContrastAxe(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
  label: string,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await expectNoAxeViolations(page, [root], `${label} closed color contrast`, {
    includeColorContrast: true,
  });

  await trigger.click();
  const menu = await actionMenuOpenMenu(page, trigger);

  await expectNoAxeViolations(page, [root, menu], `${label} open color contrast`, {
    includeColorContrast: true,
  });

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
}

test.describe("comparison ActionMenu route contract", () => {
  test("ActionMenu route mounts the React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    const expectedProps = JSON.stringify({
      size: "M",
      menuSize: "M",
      align: "start",
      direction: "bottom",
      shouldFlip: true,
      isQuiet: false,
      isDisabled: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "More actions" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More actions" })).toBeVisible();
  });

  test("ActionMenu controls match the S2 viewer axes and drive both implementations", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page, {
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("XL");
    await expect(
      page
        .locator('input[name="align"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuAlignOptions]);
    await expect(page.locator('input[name="align"]:checked')).toHaveValue("end");
    await expect(
      page
        .locator('select[name="direction"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...actionMenuDirectionOptions]);
    await expect(page.locator('select[name="direction"]')).toHaveValue("top");
    await expect(
      page
        .locator('input[name="menuSize"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuMenuSizeOptions]);
    await expect(page.locator('input[name="menuSize"]:checked')).toHaveValue("L");
    await expect(page.locator('input[name="shouldFlip"]')).not.toBeChecked();
    await expect(page.locator('input[name="isQuiet"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();

    const expectedProps = JSON.stringify({
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "More actions" })).toBeDisabled();
    await expect(solidPanel.getByRole("button", { name: "More actions" })).toBeDisabled();
  });

  test("ActionMenu omitted viewer props reset to default branch values", async ({ page }) => {
    const custom = await actionMenuFixtures(page, {
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });
    const customProps = JSON.stringify({
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });

    await expect(custom.reactRoot).toHaveAttribute("data-comparison-control-props", customProps);
    await expect(custom.solidRoot).toHaveAttribute("data-comparison-control-props", customProps);

    const defaults = await actionMenuFixtures(page);
    const defaultProps = JSON.stringify({
      size: "M",
      menuSize: "M",
      align: "start",
      direction: "bottom",
      shouldFlip: true,
      isQuiet: false,
      isDisabled: false,
    });

    await expect(defaults.reactRoot).toHaveAttribute("data-comparison-control-props", defaultProps);
    await expect(defaults.solidRoot).toHaveAttribute("data-comparison-control-props", defaultProps);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("M");
    await expect(page.locator('input[name="menuSize"]:checked')).toHaveValue("M");
    await expect(page.locator('input[name="align"]:checked')).toHaveValue("start");
    await expect(page.locator('select[name="direction"]')).toHaveValue("bottom");
    await expect(page.locator('input[name="shouldFlip"]')).toBeChecked();
    await expect(page.locator('input[name="isQuiet"]')).not.toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();
    await expect(defaults.reactPanel.getByRole("button", { name: "More actions" })).toBeEnabled();
    await expect(defaults.solidPanel.getByRole("button", { name: "More actions" })).toBeEnabled();
  });

  test("ActionMenu item actions fire with matching keys", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await reactPanel.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Copy/ }).click();
    await expect(reactRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "copy");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: /Copy/ })).toHaveCount(0);

    await solidPanel.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Copy/ }).click();
    await expect(solidRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "copy");
  });

  test("ActionMenu keyboard state follows the APG menu-button contract", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectKeyboardMenuButtonContract(page, reactPanel, reactRoot);
    await expectKeyboardMenuButtonContract(page, solidPanel, solidRoot);
  });

  test("ActionMenu outside pointer press closes the open menu", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectOutsidePointerClosesMenu(page, reactPanel, reactRoot);
    await expectOutsidePointerClosesMenu(page, solidPanel, solidRoot);
  });

  test("ActionMenu semantic accessibility contracts pass on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectA11ySemanticContract(page, reactPanel, reactRoot, "React ActionMenu");
    await expectA11ySemanticContract(page, solidPanel, solidRoot, "Solid ActionMenu");
  });

  test("ActionMenu virtual click lifecycle matches on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectVirtualClickLifecycle(page, reactPanel, reactRoot, /Cut/, "cut");
    await expectVirtualClickLifecycle(page, solidPanel, solidRoot, /Cut/, "cut");
  });

  test("ActionMenu trigger target sizes match React Spectrum on both stacks", async ({ page }) => {
    for (const size of actionMenuSizeOptions) {
      const { reactPanel, solidPanel } = await actionMenuFixtures(page, { size });
      const reactSize = await actionMenuTriggerTargetSize(
        reactPanel.getByRole("button", { name: "More actions" }),
        `React ActionMenu ${size}`,
      );
      const solidSize = await actionMenuTriggerTargetSize(
        solidPanel.getByRole("button", { name: "More actions" }),
        `Solid ActionMenu ${size}`,
      );

      expectTargetSizeParity(solidSize, reactSize, `ActionMenu ${size}`);
      if (size === "XS") {
        expect(reactSize.width, "React ActionMenu XS upstream target width").toBe(20);
        expect(reactSize.height, "React ActionMenu XS upstream target height").toBe(20);
      } else {
        expect(reactSize.width, `React ActionMenu ${size} target width`).toBeGreaterThanOrEqual(24);
        expect(reactSize.height, `React ActionMenu ${size} target height`).toBeGreaterThanOrEqual(
          24,
        );
      }
    }
  });

  test("ActionMenu color contrast has no scoped axe violations on both stacks", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectColorContrastAxe(page, reactPanel, reactRoot, "React ActionMenu");
    await expectColorContrastAxe(page, solidPanel, solidRoot, "Solid ActionMenu");
  });
});

test.describe("comparison ActionMenu touch lifecycle", () => {
  test.use({ hasTouch: true });

  test("ActionMenu touch activation and disabled suppression match on both stacks", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectTouchLifecycle(page, reactPanel, reactRoot, /Paste/, "paste");
    await expectTouchLifecycle(page, solidPanel, solidRoot, /Paste/, "paste");

    const disabledFixtures = await actionMenuFixtures(page, { isDisabled: true });

    await expectDisabledTouchSuppressed(
      page,
      disabledFixtures.reactPanel,
      disabledFixtures.reactRoot,
    );
    await expectDisabledTouchSuppressed(
      page,
      disabledFixtures.solidPanel,
      disabledFixtures.solidRoot,
    );
  });
});
