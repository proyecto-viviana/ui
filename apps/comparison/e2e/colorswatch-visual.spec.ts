import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorSwatchFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorswatch/${query}`);
  await waitForComparisonRouteReady(page);
  await page.waitForLoadState("networkidle");

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="colorswatch"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="colorswatch"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactSwatch: reactRoot.locator('[role="img"]').first(),
    solidSwatch: solidRoot.locator('[role="img"]').first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string
  >;
}

async function colorSwatchContract(root: Locator) {
  return root
    .locator('[role="img"]')
    .first()
    .evaluate((element) => {
      const numberOrNull = (value: number | undefined | null) =>
        value == null ? null : Number(value.toFixed(4));
      const swatch = element as HTMLElement;
      const rect = swatch.getBoundingClientRect();
      const style = window.getComputedStyle(swatch);

      return {
        role: swatch.getAttribute("role"),
        id: swatch.getAttribute("id"),
        slot: swatch.getAttribute("slot"),
        ariaRoleDescription: swatch.getAttribute("aria-roledescription"),
        ariaLabel: swatch.getAttribute("aria-label"),
        ariaLabelledBy: swatch.getAttribute("aria-labelledby"),
        ariaDescribedBy: swatch.getAttribute("aria-describedby"),
        ariaDetails: swatch.getAttribute("aria-details"),
        width: numberOrNull(rect.width),
        height: numberOrNull(rect.height),
        borderRadius: style.borderRadius,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle,
        boxSizing: style.boxSizing,
        forcedColorAdjust: style.forcedColorAdjust,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundPosition: style.backgroundPosition,
        backgroundRepeat: style.backgroundRepeat,
        backgroundSize: style.backgroundSize,
      };
    });
}

type ColorSwatchContract = Awaited<ReturnType<typeof colorSwatchContract>>;

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

function expectColorSwatchContractToMatch(solid: ColorSwatchContract, react: ColorSwatchContract) {
  expect(solid.role).toBe(react.role);
  expectIdToMatchOrBeGenerated(solid.id, react.id, "ColorSwatch id");
  expect(solid.slot).toBe(react.slot);
  expect(solid.ariaRoleDescription).toBe(react.ariaRoleDescription);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expectReferenceIdsToMatchOrBeGenerated(
    solid.ariaLabelledBy,
    react.ariaLabelledBy,
    "ColorSwatch aria-labelledby",
  );
  expect(solid.ariaDescribedBy).toBe(react.ariaDescribedBy);
  expect(solid.ariaDetails).toBe(react.ariaDetails);
  expect(solid.borderRadius).toBe(react.borderRadius);
  expect(solid.borderColor).toBe(react.borderColor);
  expect(solid.borderWidth).toBe(react.borderWidth);
  expect(solid.borderStyle).toBe(react.borderStyle);
  expect(solid.boxSizing).toBe(react.boxSizing);
  expect(solid.forcedColorAdjust).toBe(react.forcedColorAdjust);
  expect(solid.backgroundColor).toBe(react.backgroundColor);
  expect(solid.backgroundImage).toBe(react.backgroundImage);
  expect(solid.backgroundPosition).toBe(react.backgroundPosition);
  expect(solid.backgroundRepeat).toBe(react.backgroundRepeat);
  expect(solid.backgroundSize).toBe(react.backgroundSize);
  expectNear(solid.width, react.width, 1, "ColorSwatch width");
  expectNear(solid.height, react.height, 1, "ColorSwatch height");
}

test.describe("comparison ColorSwatch visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "ColorSwatch default",
      {
        maxMismatchRatio: 0.08,
        maxDimensionDelta: 4,
        pixelThreshold: 64,
      },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      ariaLabel: "Background color",
      color: "#ff6600",
      size: "M",
      rounding: "default",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      ariaLabel: "Background color",
      color: "#ff6600",
      size: "M",
      rounding: "default",
    });

    const react = await colorSwatchContract(fixtures.reactRoot);
    const solid = await colorSwatchContract(fixtures.solidRoot);
    expectColorSwatchContractToMatch(solid, react);
    expect(react.width).toBe(32);
    expect(react.height).toBe(32);
    expect(react.backgroundImage).toContain("repeating-conic-gradient");
  });

  test("size and rounding controls match React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchFixtures(page, "?size=XS&rounding=full&color=%2300ff00");

    const react = await colorSwatchContract(fixtures.reactRoot);
    const solid = await colorSwatchContract(fixtures.solidRoot);
    expectColorSwatchContractToMatch(solid, react);
    expect(react.width).toBe(16);
    expect(react.height).toBe(16);
  });

  test("accessible names and ARIA reference props match React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchFixtures(
      page,
      "?color=%23ff0000&colorName=Fire%20truck%20red&ariaLabel=Background%20color",
    );

    await expect(
      fixtures.reactPanel.getByRole("img", { name: "Fire truck red, Background color" }),
    ).toBeVisible();
    await expect(
      fixtures.solidPanel.getByRole("img", { name: "Fire truck red, Background color" }),
    ).toBeVisible();
    expectColorSwatchContractToMatch(
      await colorSwatchContract(fixtures.solidRoot),
      await colorSwatchContract(fixtures.reactRoot),
    );

    const referencedFixtures = await colorSwatchFixtures(
      page,
      "?color=%23ff0000&colorName=Fire%20truck%20red&ariaLabel=Background%20color&id=contract-colorswatch&slot=color&ariaLabelledBy=external-label&ariaDescribedBy=swatch-desc&ariaDetails=swatch-details",
    );
    const react = await colorSwatchContract(referencedFixtures.reactRoot);
    const solid = await colorSwatchContract(referencedFixtures.solidRoot);

    expectColorSwatchContractToMatch(solid, react);
    expect(react.id).toBe("contract-colorswatch");
    expect(solid.id).toBe("contract-colorswatch");
    expect(react.slot).toBe("color");
    expect(solid.slot).toBe("color");
    expect(react.ariaLabelledBy).toBe("contract-colorswatch external-label");
    expect(solid.ariaLabelledBy).toBe("contract-colorswatch external-label");
    expect(react.ariaDescribedBy).toBe("swatch-desc");
    expect(solid.ariaDescribedBy).toBe("swatch-desc");
    expect(react.ariaDetails).toBe("swatch-details");
    expect(solid.ariaDetails).toBe("swatch-details");
  });

  test("transparent and no-color slash state matches React Spectrum", async ({ page }) => {
    const fixtures = await colorSwatchFixtures(page, "?color=");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "ColorSwatch transparent slash",
      {
        maxMismatchRatio: 0.08,
        maxDimensionDelta: 4,
        pixelThreshold: 64,
      },
    );

    const react = await colorSwatchContract(fixtures.reactRoot);
    const solid = await colorSwatchContract(fixtures.solidRoot);
    expectColorSwatchContractToMatch(solid, react);
    expect(react.ariaLabel).toBe("transparent, Background color");
    expect(react.backgroundImage).toContain("linear-gradient");
    expect(react.backgroundImage).not.toContain("repeating-conic-gradient");
  });
});
