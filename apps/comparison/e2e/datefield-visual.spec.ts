import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

const fieldPairThreshold = {
  maxMismatchRatio: 0.03,
  maxDimensionDelta: 2,
  pixelThreshold: 80,
};

const strictFieldPairThreshold = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
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

async function namedInputAttributes(
  root: Locator,
  name: string,
  attribute: "min" | "max" | "form",
) {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll(
      (inputs, attr) => inputs.map((input) => input.getAttribute(attr)).filter(Boolean),
      attribute,
    );
}

async function namedInputDetails(root: Locator, name: string) {
  return root.locator(`input[name="${name}"]`).evaluateAll((inputs) =>
    inputs.map((input) => {
      const element = input as HTMLInputElement;
      return {
        type: element.getAttribute("type"),
        value: element.value.replace(/:00$/, ""),
        hidden: element.hasAttribute("hidden"),
        required: element.required,
        min: element.getAttribute("min"),
        max: element.getAttribute("max"),
      };
    }),
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
        .map((value) => String(value).replace(/:00$/, ""));
      form.remove();
      return values;
    },
    { formId, name },
  );
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

  test("closed segmented field is pixel-identical for the deterministic date route", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/datefield/?size=XL&value=2025-02-03&name=appointmentDate");
    await waitForComparisonRouteReady(page);
    await clearPointer(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));
    const reactField = await dateFieldComponent(reactRoot);
    const solidField = await dateFieldComponent(solidRoot);

    const diff = await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "datefield deterministic closed field",
      strictFieldPairThreshold,
    );
    expect(diff.diff.reactWidth).toBeGreaterThan(200);
    expect(diff.diff.solidWidth).toBe(diff.diff.reactWidth);
  });

  test("routes date-time value, granularity, hour cycle, form owner, and validation behavior", async ({
    page,
  }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-03T08%3A45%3A00&granularity=minute&hourCycle=24&name=appointmentDate&form=appointmentForm&validationBehavior=aria",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot.getByRole("spinbutton")).toHaveCount(5);
    await expect(solidRoot.getByRole("spinbutton")).toHaveCount(5);
    expect(await namedInputValues(reactRoot, "appointmentDate")).toContain("2025-02-03T08:45");
    expect(await namedInputValues(solidRoot, "appointmentDate")).toContain("2025-02-03T08:45");
    expect(await namedInputDetails(reactRoot, "appointmentDate")).toContainEqual(
      expect.objectContaining({ type: "hidden", value: "2025-02-03T08:45" }),
    );
    expect(await namedInputDetails(solidRoot, "appointmentDate")).toContainEqual(
      expect.objectContaining({ type: "hidden", value: "2025-02-03T08:45" }),
    );
    expect(await namedInputAttributes(reactRoot, "appointmentDate", "form")).toContain(
      "appointmentForm",
    );
    expect(await namedInputAttributes(solidRoot, "appointmentDate", "form")).toContain(
      "appointmentForm",
    );
    await expect
      .poll(() => associatedFormValues(page, "appointmentForm", "appointmentDate"))
      .toEqual(["2025-02-03T08:45", "2025-02-03T08:45"]);
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03T08:45:00");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03T08:45:00");
    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"form":"appointmentForm"/,
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"form":"appointmentForm"/,
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

  test("keeps native validation hidden while preserving required form input semantics", async ({
    page,
  }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-10&constrainRange=true&unavailableDates=true&isRequired=true&name=appointmentDate",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    for (const root of [reactRoot, solidRoot]) {
      await expect(root.getByText("Enter the appointment date.")).toBeVisible();
      await expect(root.getByText("Enter a valid appointment date.")).toHaveCount(0);
      expect(await namedInputValues(root, "appointmentDate")).toContain("2025-02-10");
      expect(await namedInputDetails(root, "appointmentDate")).toContainEqual(
        expect.objectContaining({
          type: "text",
          value: "2025-02-10",
          hidden: true,
          required: true,
          min: null,
          max: null,
        }),
      );
    }
  });

  test("surfaces aria validation, range constraints, and unavailable dates", async ({ page }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-10&constrainRange=true&unavailableDates=true&isRequired=true&name=appointmentDate&validationBehavior=aria",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot).toHaveAttribute("data-comparison-react-builtin-invalid", "true");
    for (const root of [reactRoot, solidRoot]) {
      await expect(root.getByText("Enter a valid appointment date.")).toBeVisible();
      await expectInvalidField(root);
      expect(await namedInputValues(root, "appointmentDate")).toContain("2025-02-10");
      expect(await namedInputDetails(root, "appointmentDate")).toContainEqual(
        expect.objectContaining({
          type: "hidden",
          value: "2025-02-10",
          hidden: false,
          required: false,
          min: null,
          max: null,
        }),
      );
    }
  });

  test("routes contextual help and forced leading zero segments", async ({ page }) => {
    await page.goto(
      "/components/datefield/?value=2025-02-03&withContextualHelp=true&shouldForceLeadingZeros=true",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactRoot = await dateFieldRoot(await frameworkPanel(section, "React Spectrum stack"));
    const solidRoot = await dateFieldRoot(await frameworkPanel(section, "Solidaria stack"));

    await expect(reactRoot.getByRole("button")).toHaveCount(1);
    await expect(solidRoot.getByRole("button")).toHaveCount(1);
    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"withContextualHelp":true/,
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      /"withContextualHelp":true/,
    );
    const reactTexts = await spinbuttonTexts(reactRoot);
    expect(reactTexts).toContain("02");
    expect(reactTexts).toContain("03");
    await expect.poll(() => spinbuttonTexts(solidRoot)).toEqual(reactTexts);
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
