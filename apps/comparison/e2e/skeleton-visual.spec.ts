import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function skeletonQuery(params: Record<string, string> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, value);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function waitForLoadedImage(row: Locator) {
  const image = row.locator("img").first();
  await expect
    .poll(
      async () =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      { timeout: 3000 },
    )
    .toBe(true);
  await expect
    .poll(() => image.evaluate((element) => window.getComputedStyle(element).opacity), {
      timeout: 3000,
    })
    .toBe("1");
}

async function skeletonFixtures(
  page: Page,
  params: Record<string, string> = {},
  media: Parameters<Page["emulateMedia"]>[0] = {},
) {
  await page.emulateMedia({ ...media, reducedMotion: "reduce" });
  await pinComparisonTheme(page, "light");
  await page.goto(`/components/skeleton/${skeletonQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRow = reactPanel.locator('[data-comparison-control-root="skeleton"]').first();
  const solidRow = solidPanel.locator('[data-comparison-control-root="skeleton"]').first();

  await expect(reactRow).toBeVisible();
  await expect(solidRow).toBeVisible();

  if (params.isLoading === "false") {
    await waitForLoadedImage(reactRow);
    await waitForLoadedImage(solidRow);
  }

  return { reactCanvas, solidCanvas, reactRow, solidRow };
}

async function skeletonContract(row: Locator) {
  return row.evaluate((element) => {
    const textRoots = Array.from(element.querySelectorAll('[data-rsp-slot="text"]'));
    const image = element.querySelector("img");
    const icon = element.querySelector("svg");
    const loadingTargets = Array.from(element.querySelectorAll("*")).filter((target) => {
      const styles = window.getComputedStyle(target);
      return (
        styles.backgroundImage.includes("linear-gradient") && styles.backgroundSize.includes("300")
      );
    });

    return {
      statusCount: element.querySelectorAll('[role="status"]').length,
      textInert: textRoots.map((text) => text.hasAttribute("inert")),
      nestedTextSkeletonCount: textRoots.filter((text) => text.querySelector("[inert]")).length,
      imageOpacity: image ? window.getComputedStyle(image).opacity : null,
      imageVisibility: image ? window.getComputedStyle(image).visibility : null,
      iconInert: icon?.hasAttribute("inert") ?? null,
      loadingTargetCount: loadingTargets.length,
    };
  });
}

test.describe("comparison Skeleton visual parity", () => {
  test("Skeleton default loading state is pixel-identical", async ({ page }) => {
    const fixtures = await skeletonFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Skeleton default loading",
    );
  });

  test("Skeleton loaded state is pixel-identical", async ({ page }) => {
    const fixtures = await skeletonFixtures(page, { isLoading: "false" });

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Skeleton loaded",
    );
  });

  test("Skeleton controls drive both implementations", async ({ page }) => {
    await skeletonFixtures(page);

    await expect(page.locator('input[name="isLoading"]')).toBeChecked();

    const fixtures = await skeletonFixtures(page, { isLoading: "false" });

    await expect(fixtures.reactRow).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ isLoading: false }),
    );
    await expect(fixtures.solidRow).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ isLoading: false }),
    );
    await expect(page.locator('input[name="isLoading"]')).not.toBeChecked();
  });

  test("Skeleton child context matches React Spectrum", async ({ page }) => {
    const loadingFixtures = await skeletonFixtures(page);
    await expect(skeletonContract(loadingFixtures.solidRow)).resolves.toEqual(
      await skeletonContract(loadingFixtures.reactRow),
    );
    await expect(skeletonContract(loadingFixtures.reactRow)).resolves.toMatchObject({
      statusCount: 0,
      textInert: [true, true, true],
      nestedTextSkeletonCount: 3,
      imageOpacity: "0",
      imageVisibility: "hidden",
      iconInert: true,
    });

    const loadedFixtures = await skeletonFixtures(page, { isLoading: "false" });
    await expect(skeletonContract(loadedFixtures.solidRow)).resolves.toEqual(
      await skeletonContract(loadedFixtures.reactRow),
    );
    await expect(skeletonContract(loadedFixtures.reactRow)).resolves.toMatchObject({
      statusCount: 0,
      textInert: [false, false, false],
      nestedTextSkeletonCount: 0,
      imageOpacity: "1",
      imageVisibility: "visible",
      iconInert: false,
      loadingTargetCount: 0,
    });
  });

  test("Skeleton forced-colors environment matches React Spectrum", async ({ page }) => {
    const fixtures = await skeletonFixtures(page, {}, { forcedColors: "active" });

    await expect(skeletonContract(fixtures.solidRow)).resolves.toEqual(
      await skeletonContract(fixtures.reactRow),
    );
  });
});
