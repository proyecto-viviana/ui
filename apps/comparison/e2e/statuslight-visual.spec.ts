import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import {
  statusLightRoleOptions,
  statusLightSizeOptions,
  statusLightVariantOptions,
} from "../src/data/statuslight-demo";

function statusLightQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function statusLightFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/statuslight/${statusLightQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="statuslight"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="statuslight"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function statusLightContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const light = element.querySelector('svg[aria-hidden="true"]');
    const lightStyles = light ? window.getComputedStyle(light) : null;
    const center = light?.parentElement ?? null;
    const centerStyles = center ? window.getComputedStyle(center) : null;
    const text = element.querySelector('[data-rsp-slot="text"]');
    const textStyles = text ? window.getComputedStyle(text) : null;

    return {
      tagName: element.tagName,
      id: element.id,
      dataComparisonRoot: element.getAttribute("data-comparison-control-root"),
      dataComparisonProps: element.getAttribute("data-comparison-control-props"),
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaDetails: element.getAttribute("aria-details"),
      text: element.textContent?.trim(),
      display: styles.display,
      alignItems: styles.alignItems,
      gap: styles.gap,
      width: styles.width,
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      lightTagName: light?.tagName ?? null,
      lightWidth: lightStyles?.width ?? null,
      lightHeight: lightStyles?.height ?? null,
      lightFill: lightStyles?.fill ?? null,
      lightOverflow: lightStyles?.overflow ?? null,
      centerDisplay: centerStyles?.display ?? null,
      centerAlignItems: centerStyles?.alignItems ?? null,
      textTagName: text?.tagName ?? null,
      textDisplay: textStyles?.display ?? null,
    };
  });
}

async function expectRadioValues(
  page: Page,
  name: string,
  values: readonly string[],
  checked: string,
) {
  await expect(
    page
      .locator(`input[name="${name}"]`)
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
  ).resolves.toEqual([...values]);
  await expect(page.locator(`input[name="${name}"]:checked`)).toHaveValue(checked);
}

test.describe("comparison StatusLight visual parity", () => {
  test("StatusLight default state is pixel-identical", async ({ page }) => {
    const fixtures = await statusLightFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "StatusLight default",
    );
  });

  test("StatusLight prop controls drive both implementations", async ({ page }) => {
    await statusLightFixtures(page);

    await expect(page.locator('input[name="children"]')).toHaveValue("Sync complete");
    await expect(page.locator('select[name="variant"] option')).toHaveText([
      ...statusLightVariantOptions,
    ]);
    await expect(page.locator('select[name="variant"]')).toHaveValue("neutral");
    await expect(page.locator('select[name="variant"] option', { hasText: /^$/ })).toHaveCount(0);
    await expectRadioValues(page, "size", statusLightSizeOptions, "M");
    await expectRadioValues(page, "role", statusLightRoleOptions, "");
    await expect(page.locator('input[name="role"] + span')).toHaveText(["default", "status"]);

    const fixtures = await statusLightFixtures(page, {
      children: "Investigating",
      variant: "notice",
      size: "XL",
      role: "status",
    });

    const expectedProps = JSON.stringify({
      children: "Investigating",
      variant: "notice",
      size: "XL",
      role: "status",
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(page.locator('input[name="children"]')).toHaveValue("Investigating");
    await expect(page.locator('select[name="variant"]')).toHaveValue("notice");
    await expectRadioValues(page, "size", statusLightSizeOptions, "XL");
    await expectRadioValues(page, "role", statusLightRoleOptions, "status");
  });

  test("StatusLight root DOM contract follows S2 filtering", async ({ page }) => {
    const defaultFixtures = await statusLightFixtures(page);

    await expect(statusLightContract(defaultFixtures.solidRoot)).resolves.toMatchObject({
      id: "statuslight-route-root",
      dataComparisonRoot: "statuslight",
      role: null,
      ariaLabel: null,
      ariaDescribedBy: null,
      ariaDetails: null,
    });
    await expect(statusLightContract(defaultFixtures.solidRoot)).resolves.toEqual(
      await statusLightContract(defaultFixtures.reactRoot),
    );

    const statusFixtures = await statusLightFixtures(page, {
      role: "status",
    });

    await expect(statusLightContract(statusFixtures.solidRoot)).resolves.toMatchObject({
      role: "status",
      ariaLabel: "StatusLight route label",
      ariaDescribedBy: "statuslight-route-description",
      ariaDetails: "statuslight-route-details",
    });
    await expect(statusLightContract(statusFixtures.solidRoot)).resolves.toEqual(
      await statusLightContract(statusFixtures.reactRoot),
    );
  });

  test("StatusLight computed styles match React Spectrum across variants and sizes", async ({
    page,
  }) => {
    for (const params of [
      ...statusLightVariantOptions.map((variant) => ({ variant, size: "M" })),
      ...statusLightSizeOptions.map((size) => ({ variant: "positive", size })),
      { children: "Live region update", role: "status", variant: "informative", size: "XL" },
    ] as const) {
      const fixtures = await statusLightFixtures(page, params);

      await expect(statusLightContract(fixtures.solidRoot)).resolves.toEqual(
        await statusLightContract(fixtures.reactRoot),
      );
    }
  });

  test("StatusLight forced-colors branch matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await statusLightFixtures(page, {
      variant: "negative",
      size: "XL",
      role: "status",
    });

    await expect(statusLightContract(fixtures.solidRoot)).resolves.toEqual(
      await statusLightContract(fixtures.reactRoot),
    );
  });
});
