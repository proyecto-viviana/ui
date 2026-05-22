import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorSwatchPickerFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorswatchpicker/${query}`);
  await waitForComparisonRouteReady(page);
  await page.waitForLoadState("networkidle");

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel
    .locator('[data-comparison-control-root="colorswatchpicker"]')
    .first();
  const solidRoot = solidPanel
    .locator('[data-comparison-control-root="colorswatchpicker"]')
    .first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactListbox: reactRoot.locator('[role="listbox"]').first(),
    solidListbox: solidRoot.locator('[role="listbox"]').first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string
  >;
}

async function pickerContract(root: Locator) {
  return root
    .locator('[role="listbox"]')
    .first()
    .evaluate((element) => {
      const numberOrNull = (value: number | undefined | null) =>
        value == null ? null : Number(value.toFixed(4));
      const listbox = element as HTMLElement;
      const listboxStyle = window.getComputedStyle(listbox);
      const options = Array.from(listbox.querySelectorAll('[role="option"]')) as HTMLElement[];
      const selectedIndex = options.findIndex(
        (option) => option.getAttribute("aria-selected") === "true",
      );
      const firstOption = options[0];
      const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
      const firstSwatch = firstOption?.querySelector('[role="img"]') as HTMLElement | null;
      const selectedOverlay =
        selectedOption == null
          ? null
          : (Array.from(selectedOption.querySelectorAll("*")).find((node) => {
              const style = window.getComputedStyle(node as HTMLElement);
              return style.position === "absolute" && style.pointerEvents === "none";
            }) as HTMLElement | undefined | null);
      const firstOptionStyle = firstOption ? window.getComputedStyle(firstOption) : null;
      const firstSwatchStyle = firstSwatch ? window.getComputedStyle(firstSwatch) : null;
      const firstSwatchRect = firstSwatch?.getBoundingClientRect();
      const selectedOverlayStyle = selectedOverlay
        ? window.getComputedStyle(selectedOverlay)
        : null;

      return {
        role: listbox.getAttribute("role"),
        id: listbox.getAttribute("id"),
        slot: listbox.getAttribute("slot"),
        ariaLabel: listbox.getAttribute("aria-label"),
        ariaLabelledBy: listbox.getAttribute("aria-labelledby"),
        ariaDescribedBy: listbox.getAttribute("aria-describedby"),
        ariaDetails: listbox.getAttribute("aria-details"),
        layout: listbox.dataset.layout ?? null,
        display: listboxStyle.display,
        flexWrap: listboxStyle.flexWrap,
        gap: listboxStyle.gap,
        optionCount: options.length,
        selectedIndex,
        selectedAriaSelected: selectedOption?.getAttribute("aria-selected") ?? null,
        firstOptionPosition: firstOptionStyle?.position ?? null,
        firstOptionBorderRadius: firstOptionStyle?.borderRadius ?? null,
        firstOptionOutlineStyle: firstOptionStyle?.outlineStyle ?? null,
        swatchCount: listbox.querySelectorAll('[role="img"]').length,
        firstSwatchWidth: numberOrNull(firstSwatchRect?.width),
        firstSwatchHeight: numberOrNull(firstSwatchRect?.height),
        firstSwatchBorderRadius: firstSwatchStyle?.borderRadius ?? null,
        firstSwatchBorderColor: firstSwatchStyle?.borderColor ?? null,
        firstSwatchBorderWidth: firstSwatchStyle?.borderWidth ?? null,
        selectedOverlayBorderColor: selectedOverlayStyle?.borderColor ?? null,
        selectedOverlayBorderWidth: selectedOverlayStyle?.borderWidth ?? null,
        selectedOverlayOutlineColor: selectedOverlayStyle?.outlineColor ?? null,
        selectedOverlayOutlineWidth: selectedOverlayStyle?.outlineWidth ?? null,
        selectedOverlayPointerEvents: selectedOverlayStyle?.pointerEvents ?? null,
      };
    });
}

type PickerContract = Awaited<ReturnType<typeof pickerContract>>;

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

function isGeneratedReferenceToken(token: string) {
  return token.startsWith("react-aria") || token.startsWith("solidaria") || token.startsWith(":");
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

  if (isGeneratedReferenceToken(reactId)) {
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

function expectPickerContractToMatch(solid: PickerContract, react: PickerContract) {
  expect(solid.role).toBe(react.role);
  expectIdToMatchOrBeGenerated(solid.id, react.id, "ColorSwatchPicker id");
  expect(solid.slot).toBe(react.slot);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expectReferenceIdsToMatchOrBeGenerated(
    solid.ariaLabelledBy,
    react.ariaLabelledBy,
    "ColorSwatchPicker aria-labelledby",
  );
  expect(solid.ariaDescribedBy).toBe(react.ariaDescribedBy);
  expect(solid.ariaDetails).toBe(react.ariaDetails);
  expect(solid.layout).toBe(react.layout);
  expect(solid.display).toBe(react.display);
  expect(solid.flexWrap).toBe(react.flexWrap);
  expect(solid.gap).toBe(react.gap);
  expect(solid.optionCount).toBe(react.optionCount);
  expect(solid.selectedIndex).toBe(react.selectedIndex);
  expect(solid.selectedAriaSelected).toBe(react.selectedAriaSelected);
  expect(solid.firstOptionPosition).toBe(react.firstOptionPosition);
  expect(solid.firstOptionBorderRadius).toBe(react.firstOptionBorderRadius);
  expect(solid.firstOptionOutlineStyle).toBe(react.firstOptionOutlineStyle);
  expect(solid.swatchCount).toBe(react.swatchCount);
  expect(solid.firstSwatchBorderRadius).toBe(react.firstSwatchBorderRadius);
  expect(solid.firstSwatchBorderColor).toBe(react.firstSwatchBorderColor);
  expect(solid.firstSwatchBorderWidth).toBe(react.firstSwatchBorderWidth);
  expect(solid.selectedOverlayBorderColor).toBe(react.selectedOverlayBorderColor);
  expect(solid.selectedOverlayBorderWidth).toBe(react.selectedOverlayBorderWidth);
  expect(solid.selectedOverlayOutlineColor).toBe(react.selectedOverlayOutlineColor);
  expect(solid.selectedOverlayOutlineWidth).toBe(react.selectedOverlayOutlineWidth);
  expect(solid.selectedOverlayPointerEvents).toBe(react.selectedOverlayPointerEvents);
  expectNear(solid.firstSwatchWidth, react.firstSwatchWidth, 1, "ColorSwatchPicker swatch width");
  expectNear(
    solid.firstSwatchHeight,
    react.firstSwatchHeight,
    1,
    "ColorSwatchPicker swatch height",
  );
}

test.describe("comparison ColorSwatchPicker visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchPickerFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "ColorSwatchPicker default",
      {
        maxMismatchRatio: 0.08,
        maxDimensionDelta: 4,
        pixelThreshold: 64,
      },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      ariaLabel: "Accent color",
      valueSource: "defaultValue",
      defaultValue: "#e11d48",
      density: "regular",
      size: "M",
      rounding: "none",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      ariaLabel: "Accent color",
      valueSource: "defaultValue",
      defaultValue: "#e11d48",
      density: "regular",
      size: "M",
      rounding: "none",
    });

    const react = await pickerContract(fixtures.reactRoot);
    const solid = await pickerContract(fixtures.solidRoot);
    expectPickerContractToMatch(solid, react);
    expect(react.optionCount).toBe(7);
    expect(react.swatchCount).toBe(7);
    expect(react.selectedIndex).toBe(0);
    expect(react.firstSwatchWidth).toBe(32);
    expect(react.firstSwatchHeight).toBe(32);
  });

  test("density, size, and rounding controls match React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchPickerFixtures(
      page,
      "?density=spacious&size=XS&rounding=full&defaultValue=%233b82f6",
    );

    const react = await pickerContract(fixtures.reactRoot);
    const solid = await pickerContract(fixtures.solidRoot);
    expectPickerContractToMatch(solid, react);
    expect(react.selectedIndex).toBe(4);
    expect(react.firstSwatchWidth).toBe(16);
    expect(react.firstSwatchHeight).toBe(16);
  });

  test("controlled value updates through onChange on both stacks", async ({ page }) => {
    const fixtures = await colorSwatchPickerFixtures(page, "?valueSource=value&value=%23e11d48");

    await fixtures.reactListbox.getByRole("option").nth(3).click();
    await fixtures.solidListbox.getByRole("option").nth(3).click();

    await expect
      .poll(() => pickerContract(fixtures.reactRoot))
      .toMatchObject({
        selectedIndex: 3,
      });
    await expect
      .poll(() => pickerContract(fixtures.solidRoot))
      .toMatchObject({
        selectedIndex: 3,
      });

    const reactValue = await fixtures.reactRoot.getAttribute("data-comparison-value");
    const solidValue = await fixtures.solidRoot.getAttribute("data-comparison-value");
    expect(solidValue).toBe(reactValue);
    expect(reactValue).not.toBe("#e11d48");
    expect(await controlProps(fixtures.solidRoot)).toMatchObject(
      await controlProps(fixtures.reactRoot),
    );
  });

  test("DOM, slot, and ARIA reference props match React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchPickerFixtures(
      page,
      "?ariaLabel=Accent%20color&id=contract-colorswatchpicker&slot=swatches&ariaLabelledBy=external-label&ariaDescribedBy=picker-desc&ariaDetails=picker-details",
    );
    const react = await pickerContract(fixtures.reactRoot);
    const solid = await pickerContract(fixtures.solidRoot);

    expectPickerContractToMatch(solid, react);
    expect(react.id).toBe("contract-colorswatchpicker");
    expect(solid.id).toBe("contract-colorswatchpicker");
    expect(react.slot).toBeNull();
    expect(solid.slot).toBeNull();
    expect(react.ariaDescribedBy).toBe("picker-desc");
    expect(solid.ariaDescribedBy).toBe("picker-desc");
    expect(react.ariaDetails).toBe("picker-details");
    expect(solid.ariaDetails).toBe("picker-details");
  });
});
