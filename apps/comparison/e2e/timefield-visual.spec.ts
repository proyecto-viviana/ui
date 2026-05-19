import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

const fieldPairThreshold = {
  maxMismatchRatio: 0.04,
  maxDimensionDelta: 2,
  pixelThreshold: 90,
};

const strictFieldPairThreshold = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
};

async function timeFieldRoot(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="timefield"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();
  return root;
}

async function timeFieldComponent(root: Locator) {
  const component = root.locator(".comparison-timefield-root");
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
      inputs.map((input) => (input as HTMLInputElement).value.replace(/(\d{2}:\d{2}):00$/, "$1")),
    );
}

async function namedInputAttributes(
  root: Locator,
  name: string,
  attribute: "min" | "max" | "form",
) {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll(
      (inputs, attr) =>
        inputs
          .map((input) => input.getAttribute(attr)?.replace(/(\d{2}:\d{2}):00$/, "$1"))
          .filter(Boolean),
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

async function associatedFormValues(page: Page, formId: string, name: string) {
  return page.evaluate(
    ({ formId, name }) => {
      document.getElementById(formId)?.remove();
      const form = document.createElement("form");
      form.id = formId;
      document.body.append(form);

      const values = new FormData(form)
        .getAll(name)
        .map((value) => String(value).replace(/(\d{2}:\d{2}):00$/, "$1"));
      form.remove();
      return values;
    },
    { formId, name },
  );
}

test.describe("TimeField visual parity", () => {
  test("renders the default S2 segmented field on both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "light");
    await page.goto("/components/timefield/");
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await timeFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await timeFieldRoot(await frameworkPanel(section, "Solidaria stack"));
    const reactField = await timeFieldComponent(reactRoot);
    const solidField = await timeFieldComponent(solidRoot);

    await expect(reactRoot.getByText("Start time", { exact: true })).toBeVisible();
    await expect(solidRoot.getByText("Start time", { exact: true })).toBeVisible();
    await expect.poll(() => reactRoot.getByRole("spinbutton").count()).toBeGreaterThanOrEqual(2);
    await expect.poll(() => solidRoot.getByRole("spinbutton").count()).toBeGreaterThanOrEqual(2);
    await expect(reactRoot.locator('[role="presentation"]').first()).toBeVisible();
    await expect(solidRoot.locator('[role="presentation"]').first()).toBeVisible();

    const diff = await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "timefield default field",
      fieldPairThreshold,
    );
    expect(diff.diff.reactWidth).toBeGreaterThan(140);
    expect(diff.diff.solidWidth).toBeGreaterThan(140);
  });

  test("closed segmented field is pixel-identical for the deterministic time route", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(
      "/components/timefield/?size=XL&value=09%3A30%3A00&hourCycle=24&name=startTime",
    );
    await waitForComparisonRouteReady(page);
    await clearPointer(page);

    const section = await styledSection(page);
    const reactRoot = await timeFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await timeFieldRoot(await frameworkPanel(section, "Solidaria stack"));
    const reactField = await timeFieldComponent(reactRoot);
    const solidField = await timeFieldComponent(solidRoot);

    const diff = await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "timefield deterministic closed field",
      strictFieldPairThreshold,
    );
    expect(diff.diff.reactWidth).toBeGreaterThan(160);
    expect(diff.diff.solidWidth).toBe(diff.diff.reactWidth);
  });

  test("routes time value, second granularity, hour cycle, form owner, and validation behavior", async ({
    page,
  }) => {
    await page.goto(
      "/components/timefield/?value=09%3A45%3A30&granularity=second&hourCycle=24&name=startTime&form=scheduleForm&validationBehavior=aria",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await timeFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await timeFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot.getByRole("spinbutton")).toHaveCount(3);
    await expect(solidRoot.getByRole("spinbutton")).toHaveCount(3);
    expect(await namedInputValues(reactRoot, "startTime")).toContain("09:45:30");
    expect(await namedInputValues(solidRoot, "startTime")).toContain("09:45:30");
    expect(await namedInputAttributes(reactRoot, "startTime", "form")).toContain("scheduleForm");
    expect(await namedInputAttributes(solidRoot, "startTime", "form")).toContain("scheduleForm");
    await expect
      .poll(() => associatedFormValues(page, "scheduleForm", "startTime"))
      .toEqual(["09:45:30", "09:45:30"]);
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "09:45:30");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "09:45:30");
    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"form":"scheduleForm"/,
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"form":"scheduleForm"/,
    );
    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"validationBehavior":"aria"/,
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"validationBehavior":"aria"/,
    );
  });

  test("asserts validation, required state, and range constraints", async ({ page }) => {
    await page.goto(
      "/components/timefield/?value=07%3A30%3A00&constrainRange=true&isRequired=true&isInvalid=true&name=startTime",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await timeFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await timeFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    for (const root of [reactRoot, solidRoot]) {
      await expect(root.getByText("Enter a valid start time.")).toBeVisible();
      await expectInvalidField(root);
      expect(await namedInputValues(root, "startTime")).toContain("07:30");
    }
    expect(await namedInputAttributes(solidRoot, "startTime", "min")).toContain("08:00");
    expect(await namedInputAttributes(solidRoot, "startTime", "max")).toContain("18:00");
  });

  test("keeps Provider locale text in parity", async ({ page }) => {
    await page.goto("/components/timefield/?locale=ar-AE&value=09%3A30%3A00&hourCycle=24");
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await timeFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await timeFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot).toHaveAttribute("data-comparison-locale", "ar-AE");
    await expect(solidRoot).toHaveAttribute("data-comparison-locale", "ar-AE");
    const reactTexts = await spinbuttonTexts(reactRoot);
    await expect.poll(() => spinbuttonTexts(solidRoot)).toEqual(reactTexts);
  });
});
