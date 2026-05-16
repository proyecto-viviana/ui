import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import { accordionDensityOptions, accordionSizeOptions } from "../src/data/accordion-demo";

function accordionQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function accordionFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/accordion/${accordionQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="accordion"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="accordion"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function expectAccordionSemantics(root: Locator) {
  const personal = root.getByRole("button", { name: "Personal Information" });
  const billing = root.getByRole("button", { name: "Billing Address" });
  const action = root.getByRole("button", { name: "More billing actions" });

  await expect(personal).toHaveAttribute("aria-expanded", "true");
  await expect(billing).toHaveAttribute("aria-expanded", "false");
  await expect(action).toBeVisible();
  await expect(action.locator("xpath=ancestor::button")).toHaveCount(0);
  await expect(billing).not.toContainText("More billing actions");

  await expect(root.getByText("Name")).toBeVisible();
  await expect(root.getByText("Phone number")).toBeVisible();
  await expect(root.getByText("Email address")).toBeVisible();
  await expect(root.getByText("Street address")).toBeHidden();
}

test.describe("comparison Accordion route contract", () => {
  test("Accordion route mounts the React and Solid styled references", async ({ page }) => {
    const { reactRoot, solidRoot } = await accordionFixtures(page);

    const expectedProps = JSON.stringify({
      size: "M",
      density: "regular",
      isQuiet: false,
      isDisabled: false,
      allowsMultipleExpanded: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactRoot).toHaveAttribute("data-comparison-expanded-keys", "personal");
    await expect(solidRoot).toHaveAttribute("data-comparison-expanded-keys", "personal");

    await expectAccordionSemantics(reactRoot);
    await expectAccordionSemantics(solidRoot);
  });

  test("Accordion controls match the S2 viewer axes and drive both implementations", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await accordionFixtures(page, {
      size: "XL",
      density: "compact",
      isQuiet: true,
      allowsMultipleExpanded: true,
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...accordionSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("XL");
    await expect(
      page
        .locator('input[name="density"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...accordionDensityOptions]);
    await expect(page.locator('input[name="density"]:checked')).toHaveValue("compact");
    await expect(page.locator('input[name="isQuiet"]')).toBeChecked();
    await expect(page.locator('input[name="allowsMultipleExpanded"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();

    const expectedProps = JSON.stringify({
      size: "XL",
      density: "compact",
      isQuiet: true,
      isDisabled: false,
      allowsMultipleExpanded: true,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
  });

  test("Accordion multiple expansion and header action behavior match", async ({ page }) => {
    const { reactRoot, solidRoot } = await accordionFixtures(page, {
      allowsMultipleExpanded: true,
    });

    for (const root of [reactRoot, solidRoot]) {
      await root.getByRole("button", { name: "Billing Address" }).click();
      await expect(root.getByRole("button", { name: "Personal Information" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(root.getByRole("button", { name: "Billing Address" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(root).toHaveAttribute("data-comparison-expanded-keys", "personal,billing");

      await root.getByRole("button", { name: "More billing actions" }).click();
      await expect(root.getByRole("button", { name: "Billing Address" })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }
  });

  test("Accordion disabled state suppresses title triggers on both stacks", async ({ page }) => {
    const { reactRoot, solidRoot } = await accordionFixtures(page, { isDisabled: true });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root.getByRole("button", { name: "Personal Information" })).toBeDisabled();
      await expect(root.getByRole("button", { name: "Billing Address" })).toBeDisabled();
      await expect(root.getByRole("button", { name: "More billing actions" })).toBeVisible();
    }
  });
});
