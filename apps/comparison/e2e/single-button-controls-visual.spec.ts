import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

type SingleControlCase = {
  slug: "linkbutton" | "togglebutton";
  title: string;
  id: string;
  role: "link" | "button";
  name: string;
  query: string;
  iconPlacement?: "start" | "only";
};

const singleControlCases: SingleControlCase[] = [
  {
    slug: "linkbutton",
    title: "LinkButton default",
    id: "linkbutton-default",
    role: "link",
    name: "Open docs",
    query: "",
  },
  {
    slug: "linkbutton",
    title: "LinkButton icon start",
    id: "linkbutton-icon-start",
    role: "link",
    name: "Open docs",
    query: "?iconPlacement=start",
    iconPlacement: "start",
  },
  {
    slug: "linkbutton",
    title: "LinkButton icon only",
    id: "linkbutton-icon-only",
    role: "link",
    name: "Open docs",
    query: "?iconPlacement=only",
    iconPlacement: "only",
  },
  {
    slug: "togglebutton",
    title: "ToggleButton default",
    id: "togglebutton-default",
    role: "button",
    name: "Pin",
    query: "",
  },
  {
    slug: "togglebutton",
    title: "ToggleButton icon start",
    id: "togglebutton-icon-start",
    role: "button",
    name: "Pin",
    query: "?iconPlacement=start",
    iconPlacement: "start",
  },
  {
    slug: "togglebutton",
    title: "ToggleButton icon start selected",
    id: "togglebutton-icon-start-selected",
    role: "button",
    name: "Pin",
    query: "?iconPlacement=start&isSelected=true",
    iconPlacement: "start",
  },
  {
    slug: "togglebutton",
    title: "ToggleButton icon only",
    id: "togglebutton-icon-only",
    role: "button",
    name: "Pin",
    query: "?iconPlacement=only",
    iconPlacement: "only",
  },
];

async function singleControlFixtures(page: Page, item: SingleControlCase) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/${item.slug}/${item.query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");

  return {
    reactCanvas,
    solidCanvas,
    reactControl: reactPanel.getByRole(item.role, { name: item.name }).first(),
    solidControl: solidPanel.getByRole(item.role, { name: item.name }).first(),
  };
}

async function iconAlignmentContract(control: Locator) {
  return control.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const icon = Array.from(element.querySelectorAll("svg")).find(
      (svg) => window.getComputedStyle(svg).visibility !== "hidden",
    );
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');
    const iconRect = icon?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const iconCenterY = iconRect ? iconRect.top + iconRect.height / 2 : null;
    const labelCenterY = labelRect ? labelRect.top + labelRect.height / 2 : null;
    const gap = iconRect && labelRect ? labelRect.left - iconRect.right : null;

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      rootWidth: Number(rootRect.width.toFixed(4)),
      iconWidth: numberOrNull(iconRect?.width),
      iconHeight: numberOrNull(iconRect?.height),
      iconCenterDelta: numberOrNull(iconCenterY == null ? null : iconCenterY - rootCenterY),
      labelCenterDelta: numberOrNull(labelCenterY == null ? null : labelCenterY - rootCenterY),
      iconLabelCenterDelta: numberOrNull(
        iconCenterY == null || labelCenterY == null ? null : iconCenterY - labelCenterY,
      ),
      gap: numberOrNull(gap),
      hasLabel: !!labelRect,
    };
  });
}

async function controlProps(root: Locator) {
  const value = await root.getAttribute("data-comparison-control-props");
  return JSON.parse(value ?? "{}") as Record<string, string | boolean | number>;
}

async function controlColors(root: Locator) {
  return root.evaluate((element) => {
    const rootStyle = window.getComputedStyle(element);
    const text = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');
    const textStyle = text == null ? null : window.getComputedStyle(text);
    const referenceFrame = element.closest<HTMLElement>(".comparison-reference-frame");
    const referenceStyle = referenceFrame == null ? null : window.getComputedStyle(referenceFrame);

    return {
      backgroundColor: rootStyle.backgroundColor,
      borderColor: rootStyle.borderColor,
      canvasColor: referenceStyle?.color ?? null,
      color: rootStyle.color,
      textColor: textStyle?.color ?? null,
    };
  });
}

function expectNear(
  received: number | null,
  expected: number | null,
  tolerance: number,
  label: string,
) {
  expect(received, `${label} should be present`).not.toBeNull();
  expect(expected, `${label} reference should be present`).not.toBeNull();
  expect(Math.abs((received ?? 0) - (expected ?? 0)), label).toBeLessThanOrEqual(tolerance);
}

test.describe("comparison single button-derived visual parity", () => {
  for (const item of singleControlCases) {
    test(`${item.title} matches current React Spectrum`, async ({ page }) => {
      const fixtures = await singleControlFixtures(page, item);

      await clearPointer(page);
      await expectExactScreenshotPair(page, fixtures.reactCanvas, fixtures.solidCanvas, item.title);
    });

    test(`${item.title} icon geometry matches React Spectrum`, async ({ page }) => {
      const fixtures = await singleControlFixtures(page, item);
      const react = await iconAlignmentContract(fixtures.reactControl);
      const solid = await iconAlignmentContract(fixtures.solidControl);

      expectNear(solid.rootHeight, react.rootHeight, 0.5, `${item.title} root height`);

      if (!item.iconPlacement) {
        expect(solid.hasLabel).toBe(true);
        expect(react.hasLabel).toBe(true);
        expect(solid.iconWidth).toBeNull();
        expect(react.iconWidth).toBeNull();
        expectNear(
          solid.labelCenterDelta,
          react.labelCenterDelta,
          0.75,
          `${item.title} text vertical centerline`,
        );
        return;
      }

      expectNear(solid.iconWidth, react.iconWidth, 0.5, `${item.title} icon width`);
      expectNear(solid.iconHeight, react.iconHeight, 0.5, `${item.title} icon height`);
      expectNear(
        solid.iconCenterDelta,
        react.iconCenterDelta,
        0.75,
        `${item.title} icon vertical centerline`,
      );
      expect(
        Math.abs(solid.iconCenterDelta ?? 0),
        `${item.title} solid icon root centerline`,
      ).toBeLessThanOrEqual(1);

      if (item.iconPlacement === "only") {
        expect(solid.hasLabel).toBe(false);
      } else {
        expect(solid.hasLabel).toBe(true);
        expectNear(
          solid.labelCenterDelta,
          react.labelCenterDelta,
          0.75,
          `${item.title} text vertical centerline`,
        );
        expectNear(
          solid.iconLabelCenterDelta,
          react.iconLabelCenterDelta,
          0.75,
          `${item.title} icon-to-text centerline`,
        );
        expectNear(solid.gap, react.gap, 1, `${item.title} icon text gap`);
      }
    });
  }

  test("LinkButton preserves link semantics on both stacks", async ({ page }) => {
    const fixtures = await singleControlFixtures(page, singleControlCases[0]);

    await expect(fixtures.reactControl).toHaveAttribute("href", "https://example.com/docs");
    await expect(fixtures.solidControl).toHaveAttribute("href", "https://example.com/docs");
  });

  test("LinkButton primary fill colors are not overridden by comparison anchor styles", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      await pinComparisonTheme(page, theme);
      await page.goto("/components/linkbutton/?variant=primary&fillStyle=fill");
      await waitForComparisonRouteReady(page);
      await clearPointer(page);

      const section = await styledSection(page);
      const reactPanel = await frameworkPanel(section, "React Spectrum stack");
      const solidPanel = await frameworkPanel(section, "Solidaria stack");
      const reactRoot = reactPanel.locator('[data-comparison-control-root="linkbutton"]').first();
      const solidRoot = solidPanel.locator('[data-comparison-control-root="linkbutton"]').first();
      const react = await controlColors(reactRoot);
      const solid = await controlColors(solidRoot);

      expect(solid.backgroundColor).toBe(react.backgroundColor);
      expect(solid.borderColor).toBe(react.borderColor);
      expect(solid.color).toBe(react.color);
      expect(solid.textColor).toBe(react.textColor);
      expect(react.color).toBe(react.textColor);
      expect(solid.color).toBe(solid.textColor);
      expect(react.backgroundColor).not.toBe(react.color);
      expect(solid.backgroundColor).not.toBe(solid.color);
    }
  });

  test("ToggleButton selected URL state is reflected on both stacks", async ({ page }) => {
    const selectedCase = singleControlCases.find(
      (item) => item.id === "togglebutton-icon-start-selected",
    );
    if (!selectedCase) {
      throw new Error("Missing selected ToggleButton case");
    }

    const fixtures = await singleControlFixtures(page, selectedCase);
    await expect(fixtures.reactControl).toHaveAttribute("aria-pressed", "true");
    await expect(fixtures.solidControl).toHaveAttribute("aria-pressed", "true");
  });

  test("LinkButton interactive prop controls drive both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/linkbutton/");
    await waitForComparisonRouteReady(page);

    const form = page.locator('[data-comparison-controls="linkbutton"]').first();
    await expect(form).toHaveAttribute("data-control-coverage", "modeled");
    await form.locator('input[name="children"]').fill("Open billing");
    await form.locator('input[name="href"]').fill("https://example.com/billing");
    await form.locator('select[name="variant"]').selectOption("accent");
    await form.locator('input[name="fillStyle"][value="outline"]').check();
    await form.locator('input[name="size"][value="XL"]').check();
    await form.locator('input[name="iconPlacement"][value="start"]').check();

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactPanel.locator('[data-comparison-control-root="linkbutton"]').first();
    const solidRoot = solidPanel.locator('[data-comparison-control-root="linkbutton"]').first();

    expect(await controlProps(reactRoot)).toMatchObject({
      children: "Open billing",
      href: "https://example.com/billing",
      variant: "accent",
      fillStyle: "outline",
      size: "XL",
      iconPlacement: "start",
    });
    expect(await controlProps(solidRoot)).toMatchObject({
      children: "Open billing",
      href: "https://example.com/billing",
      variant: "accent",
      fillStyle: "outline",
      size: "XL",
      iconPlacement: "start",
    });
    await expect(reactPanel.getByRole("link", { name: "Open billing" })).toHaveAttribute(
      "href",
      "https://example.com/billing",
    );
    await expect(solidPanel.getByRole("link", { name: "Open billing" })).toHaveAttribute(
      "href",
      "https://example.com/billing",
    );
  });

  test("ToggleButton interactive prop controls drive both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/togglebutton/");
    await waitForComparisonRouteReady(page);

    const form = page.locator('[data-comparison-controls="togglebutton"]').first();
    await expect(form).toHaveAttribute("data-control-coverage", "modeled");
    await form.locator('input[name="size"][value="XL"]').check();
    await form.locator('input[name="iconPlacement"][value="start"]').check();
    await form.locator('input[name="isEmphasized"]').check();
    await form.locator('input[name="isSelected"]').check();

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactPanel.locator('[data-comparison-control-root="togglebutton"]').first();
    const solidRoot = solidPanel.locator('[data-comparison-control-root="togglebutton"]').first();

    await expect(reactPanel.locator("[data-comparison-selected]").first()).toHaveAttribute(
      "data-comparison-selected",
      "true",
    );
    await expect(solidPanel.locator("[data-comparison-selected]").first()).toHaveAttribute(
      "data-comparison-selected",
      "true",
    );
    expect(await controlProps(reactRoot)).toMatchObject({
      size: "XL",
      iconPlacement: "start",
      isEmphasized: true,
      isSelected: true,
    });
    expect(await controlProps(solidRoot)).toMatchObject({
      size: "XL",
      iconPlacement: "start",
      isEmphasized: true,
      isSelected: true,
    });
    await expect(reactPanel.getByRole("button", { name: "Pin" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(solidPanel.getByRole("button", { name: "Pin" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
