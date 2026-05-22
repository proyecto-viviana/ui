import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorFieldFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorfield/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="colorfield"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="colorfield"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactInput: reactRoot.locator('input:not([type="hidden"])').first(),
    solidInput: solidRoot.locator('input:not([type="hidden"])').first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function colorFieldContract(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const field = element.querySelector<HTMLElement>("[data-channel]");
    if (!field) {
      return { missing: true };
    }

    const input = field.querySelector<HTMLInputElement>('input:not([type="hidden"])');
    const hiddenInput = element.querySelector<HTMLInputElement>('input[type="hidden"]');
    const label = field.querySelector<HTMLLabelElement>("label");
    const group = input?.parentElement;
    const fieldRect = field.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();
    const fieldStyle = window.getComputedStyle(field);
    const groupStyle = group ? window.getComputedStyle(group) : null;
    const inputStyle = input ? window.getComputedStyle(input) : null;

    return {
      missing: false,
      id: field.getAttribute("id"),
      slot: field.getAttribute("slot"),
      dataChannel: field.getAttribute("data-channel"),
      dataDisabled: field.getAttribute("data-disabled"),
      dataInvalid: field.getAttribute("data-invalid"),
      dataReadonly: field.getAttribute("data-readonly"),
      dataRequired: field.getAttribute("data-required"),
      labelText: label?.textContent?.trim() ?? null,
      textContent: field.textContent?.replace(/\s+/g, " ").trim() ?? "",
      fieldDisplay: fieldStyle.display,
      fieldGridTemplateAreas: fieldStyle.gridTemplateAreas,
      fieldWidth: numberOrNull(fieldRect.width),
      fieldHeight: numberOrNull(fieldRect.height),
      groupRole: group?.getAttribute("role") ?? null,
      groupBorderRadius: groupStyle?.borderRadius ?? null,
      groupBackgroundColor: groupStyle?.backgroundColor ?? null,
      groupMinHeight: groupStyle?.minHeight ?? null,
      input:
        input == null
          ? null
          : {
              type: input.type,
              role: input.getAttribute("role"),
              value: input.value,
              name: input.getAttribute("name"),
              form: input.getAttribute("form"),
              placeholder: input.getAttribute("placeholder"),
              disabled: input.disabled,
              readOnly: input.readOnly,
              required: input.required,
              ariaLabel: input.getAttribute("aria-label"),
              ariaLabelledBy: input.getAttribute("aria-labelledby"),
              ariaDescribedBy: input.getAttribute("aria-describedby"),
              ariaDetails: input.getAttribute("aria-details"),
              ariaInvalid: input.getAttribute("aria-invalid"),
              ariaRequired: input.getAttribute("aria-required"),
              ariaValueNow: input.getAttribute("aria-valuenow"),
              ariaValueMin: input.getAttribute("aria-valuemin"),
              ariaValueMax: input.getAttribute("aria-valuemax"),
              ariaValueText: input.getAttribute("aria-valuetext"),
              tabIndex: input.tabIndex,
              width: numberOrNull(inputRect?.width),
              height: numberOrNull(inputRect?.height),
              fontSize: inputStyle?.fontSize ?? null,
              lineHeight: inputStyle?.lineHeight ?? null,
              backgroundColor: inputStyle?.backgroundColor ?? null,
              color: inputStyle?.color ?? null,
            },
      hiddenInput:
        hiddenInput == null
          ? null
          : {
              type: hiddenInput.type,
              name: hiddenInput.getAttribute("name"),
              form: hiddenInput.getAttribute("form"),
              value: hiddenInput.value,
            },
    };
  });
}

type ColorFieldContract = Awaited<ReturnType<typeof colorFieldContract>>;

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

function expectIdToMatchOrBeGenerated(
  solidId: string | null,
  reactId: string | null,
  label: string,
) {
  if (reactId == null) {
    expect(solidId, label).toBeNull();
    return;
  }

  if (reactId.startsWith("react-aria")) {
    expect(solidId, label).toEqual(expect.any(String));
    return;
  }

  expect(solidId, label).toBe(reactId);
}

function nonGeneratedReferenceTokens(value: string | null) {
  return (value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !isGeneratedReferenceToken(token));
}

function generatedReferenceCount(value: string | null) {
  return (value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => isGeneratedReferenceToken(token)).length;
}

function isGeneratedReferenceToken(token: string) {
  return token.startsWith("react-aria") || token.startsWith("solidaria") || token.startsWith(":");
}

function expectReferenceIdsToMatchOrBeGenerated(
  solidIds: string | null,
  reactIds: string | null,
  label: string,
) {
  expect(nonGeneratedReferenceTokens(solidIds), label).toEqual(
    nonGeneratedReferenceTokens(reactIds),
  );
  if (generatedReferenceCount(reactIds) > 0) {
    expect((solidIds ?? "").split(/\s+/).filter(Boolean).length, label).toBe(
      nonGeneratedReferenceTokens(reactIds).length + generatedReferenceCount(reactIds),
    );
  } else {
    expect(solidIds, label).toBe(reactIds);
  }
}

function expectColorFieldContractToMatch(solid: ColorFieldContract, react: ColorFieldContract) {
  expect(solid.missing).toBe(false);
  expect(react.missing).toBe(false);
  if (solid.missing || react.missing) return;

  expectIdToMatchOrBeGenerated(solid.id, react.id, "ColorField root id");
  expect(solid.slot).toBe(react.slot);
  expect(solid.dataChannel).toBe(react.dataChannel);
  expect(solid.dataDisabled).toBe(react.dataDisabled);
  expect(solid.dataInvalid).toBe(react.dataInvalid);
  expect(solid.dataReadonly).toBe(react.dataReadonly);
  expect(solid.dataRequired).toBe(react.dataRequired);
  expect(solid.labelText).toBe(react.labelText);
  expect(solid.textContent.includes("Enter a hex color")).toBe(
    react.textContent.includes("Enter a hex color"),
  );
  expect(solid.textContent.includes("Enter a valid color")).toBe(
    react.textContent.includes("Enter a valid color"),
  );
  expect(solid.fieldDisplay).toBe(react.fieldDisplay);
  expect(solid.fieldGridTemplateAreas).toBe(react.fieldGridTemplateAreas);
  expect(solid.groupRole).toBe(react.groupRole);
  expect(solid.groupBorderRadius).toBe(react.groupBorderRadius);
  expect(solid.groupBackgroundColor).toBe(react.groupBackgroundColor);
  expect(solid.groupMinHeight).toBe(react.groupMinHeight);
  expectNear(solid.fieldWidth, react.fieldWidth, 4, "ColorField width");
  expectNear(solid.fieldHeight, react.fieldHeight, 4, "ColorField height");

  expect(solid.input).not.toBeNull();
  expect(react.input).not.toBeNull();
  if (solid.input == null || react.input == null) return;

  expect({
    ...solid.input,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
    ariaValueText: null,
    width: null,
  }).toEqual({
    ...react.input,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
    ariaValueText: null,
    width: null,
  });
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaLabelledBy,
    react.input.ariaLabelledBy,
    "ColorField aria-labelledby",
  );
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaDescribedBy,
    react.input.ariaDescribedBy,
    "ColorField aria-describedby",
  );
  expect(solid.input.ariaValueText == null).toBe(react.input.ariaValueText == null);
  expectNear(solid.input.width, react.input.width, 3, "ColorField input width");

  expect(solid.hiddenInput).toEqual(react.hiddenInput);
}

async function visibleInputValue(root: Locator) {
  return root.locator('input:not([type="hidden"])').first().inputValue();
}

async function hiddenInputValue(root: Locator) {
  const input = root.locator('input[type="hidden"]').first();
  await expect(input).toHaveCount(1);
  return input.inputValue();
}

test.describe("comparison ColorField visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorFieldFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(page, fixtures.reactRoot, fixtures.solidRoot, "ColorField default", {
      maxMismatchRatio: 0.08,
      maxDimensionDelta: 8,
      pixelThreshold: 64,
    });

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      label: "Color",
      valueSource: "value",
      value: "#336699",
      defaultValue: "#336699",
      channel: "",
      colorSpace: "",
      size: "M",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      label: "Color",
      valueSource: "value",
      value: "#336699",
      defaultValue: "#336699",
      channel: "",
      colorSpace: "",
      size: "M",
    });
    expectColorFieldContractToMatch(
      await colorFieldContract(fixtures.solidRoot),
      await colorFieldContract(fixtures.reactRoot),
    );
  });

  test("channel mode exposes textbox keyboard behavior and hidden form input", async ({ page }) => {
    const fixtures = await colorFieldFixtures(
      page,
      "?label=Red&description=Red%20channel&channel=red&colorSpace=rgb&name=redChannel&form=colorForm&value=rgb(128,%2064,%2032)",
    );

    const react = await colorFieldContract(fixtures.reactRoot);
    const solid = await colorFieldContract(fixtures.solidRoot);
    expectColorFieldContractToMatch(solid, react);
    await expect(fixtures.reactInput).not.toHaveAttribute("role", /.+/);
    await expect(fixtures.solidInput).not.toHaveAttribute("role", /.+/);
    await expect(fixtures.reactRoot.getByRole("textbox", { name: "Red" })).toHaveCount(1);
    await expect(fixtures.solidRoot.getByRole("textbox", { name: "Red" })).toHaveCount(1);
    await expect(fixtures.reactInput).not.toHaveAttribute("aria-valuenow");
    await expect(fixtures.solidInput).not.toHaveAttribute("aria-valuenow");
    expect(await hiddenInputValue(fixtures.solidRoot)).toBe(
      await hiddenInputValue(fixtures.reactRoot),
    );
  });

  test("invalid and required state match React Spectrum", async ({ page }) => {
    const fixtures = await colorFieldFixtures(
      page,
      "?isInvalid=true&isRequired=true&validationBehavior=aria&errorMessage=Enter%20a%20valid%20color",
    );

    expectColorFieldContractToMatch(
      await colorFieldContract(fixtures.solidRoot),
      await colorFieldContract(fixtures.reactRoot),
    );
    await expect(fixtures.reactInput).toHaveAttribute("aria-invalid", "true");
    await expect(fixtures.solidInput).toHaveAttribute("aria-invalid", "true");
    await expect(fixtures.reactRoot).toContainText("Enter a valid color");
    await expect(fixtures.solidRoot).toContainText("Enter a valid color");
  });

  test("channel keyboard increments update visible and hidden values", async ({ page }) => {
    const fixtures = await colorFieldFixtures(
      page,
      "?label=Red&channel=red&colorSpace=rgb&name=redChannel&form=colorForm&value=rgb(128,%2064,%2032)",
    );

    const reactBefore = Number(await visibleInputValue(fixtures.reactRoot));
    const solidBefore = Number(await visibleInputValue(fixtures.solidRoot));

    await fixtures.reactInput.focus();
    await page.keyboard.press("ArrowUp");
    await fixtures.solidInput.focus();
    await page.keyboard.press("ArrowUp");

    await expect
      .poll(async () => Number(await visibleInputValue(fixtures.reactRoot)))
      .toBeGreaterThan(reactBefore);
    await expect
      .poll(async () => Number(await visibleInputValue(fixtures.solidRoot)))
      .toBeGreaterThan(solidBefore);
    expect(await visibleInputValue(fixtures.solidRoot)).toBe(
      await visibleInputValue(fixtures.reactRoot),
    );
    expect(await hiddenInputValue(fixtures.solidRoot)).toBe(
      await hiddenInputValue(fixtures.reactRoot),
    );
  });
});
