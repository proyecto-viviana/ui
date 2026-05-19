import { expect, test, type Locator } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

const fieldPairThreshold = {
  maxMismatchRatio: 0.03,
  maxDimensionDelta: 2,
  pixelThreshold: 80,
};

async function dateFieldRoot(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="datefield"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();
  return root;
}

async function dateFieldComponent(root: Locator) {
  const component = root.locator(".comparison-datefield-root");
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
  return component;
}

async function spinbuttonTexts(root: Locator) {
  return root
    .getByRole("spinbutton")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? "").filter(Boolean));
}

async function namedInputValues(root: Locator, name: string) {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value.replace(/:00$/, "")),
    );
}

async function namedInputAttributes(root: Locator, name: string, attribute: "min" | "max") {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll(
      (inputs, attr) => inputs.map((input) => input.getAttribute(attr)).filter(Boolean),
      attribute,
    );
}

async function expectInvalidField(root: Locator) {
  const field = root.locator('[role="group"]').first();
  await expect
    .poll(() =>
      field.evaluate(
        (element) =>
          element.getAttribute("aria-invalid") === "true" ||
          element.getAttribute("data-invalid") === "true" ||
          element.hasAttribute("data-invalid"),
      ),
    )
    .toBe(true);
}

test.describe("DateField visual parity", () => {
  test("renders the default S2 segmented field on both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "light");
    await page.goto("/components/datefield/");
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));
    const reactField = await dateFieldComponent(reactRoot);
    const solidField = await dateFieldComponent(solidRoot);

    await expect(reactRoot.getByText("Appointment date", { exact: true })).toBeVisible();
    await expect(solidRoot.getByText("Appointment date", { exact: true })).toBeVisible();
    await expect(reactRoot.getByRole("spinbutton")).toHaveCount(3);
    await expect(solidRoot.getByRole("spinbutton")).toHaveCount(3);
    await expect(reactRoot.locator('[role="presentation"]').first()).toBeVisible();
    await expect(solidRoot.locator('[role="presentation"]').first()).toBeVisible();

    const diff = await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "datefield default field",
      fieldPairThreshold,
    );
    expect(diff.diff.reactWidth).toBeGreaterThan(180);
    expect(diff.diff.solidWidth).toBeGreaterThan(180);
  });

  test("routes date-time value, granularity, hour cycle, and form name", async ({ page }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-03T08%3A45%3A00&granularity=minute&hourCycle=24&name=appointmentDate",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot.getByRole("spinbutton")).toHaveCount(5);
    await expect(solidRoot.getByRole("spinbutton")).toHaveCount(5);
    expect(await namedInputValues(reactRoot, "appointmentDate")).toContain("2025-02-03T08:45");
    expect(await namedInputValues(solidRoot, "appointmentDate")).toContain("2025-02-03T08:45");
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03T08:45:00");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03T08:45:00");
  });

  test("asserts validation, required state, range constraints, and unavailable dates", async ({
    page,
  }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-10&constrainRange=true&unavailableDates=true&isRequired=true&isInvalid=true&name=appointmentDate",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    for (const root of [reactRoot, solidRoot]) {
      await expect(root.getByText("Enter a valid appointment date.")).toBeVisible();
      await expectInvalidField(root);
      expect(await namedInputValues(root, "appointmentDate")).toContain("2025-02-10");
    }
    expect(await namedInputAttributes(solidRoot, "appointmentDate", "min")).toContain("2025-02-03");
    expect(await namedInputAttributes(solidRoot, "appointmentDate", "max")).toContain("2025-02-20");
  });

  test("keeps Provider locale and Unicode calendar text in parity", async ({ page }) => {
    await page.goto("/components/datefield/?locale=hi-IN-u-ca-indian&value=2025-02-03");
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot).toHaveAttribute("data-comparison-locale", "hi-IN-u-ca-indian");
    await expect(solidRoot).toHaveAttribute("data-comparison-locale", "hi-IN-u-ca-indian");
    const reactTexts = await spinbuttonTexts(reactRoot);
    await expect.poll(() => spinbuttonTexts(solidRoot)).toEqual(reactTexts);
  });
});
