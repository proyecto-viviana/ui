import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import { imageObjectFitOptions, imageSourceModeOptions } from "../src/data/image-demo";

function imageQuery(params: Record<string, string> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function waitForLoadedImages(row: Locator) {
  const images = await row.locator("img").all();
  for (const image of images) {
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
}

async function imageFixtures(page: Page, params: Record<string, string> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/image/${imageQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRow = reactPanel.locator('[data-comparison-control-root="image"]').first();
  const solidRow = solidPanel.locator('[data-comparison-control-root="image"]').first();

  await expect(reactRow).toBeVisible();
  await expect(solidRow).toBeVisible();

  if (params.sourceMode === "error") {
    await expect(reactRow.getByText("Error loading image")).toBeVisible();
    await expect(solidRow.getByText("Error loading image")).toBeVisible();
  } else {
    await waitForLoadedImages(reactRow);
    await waitForLoadedImages(solidRow);
  }

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRow, solidRow };
}

async function imageContract(row: Locator) {
  return row.evaluate((element) => {
    const wrapper = element.querySelector("div");
    const image = element.querySelector("img");
    const picture = element.querySelector("picture");
    const sources = Array.from(element.querySelectorAll("source")).map((source) => ({
      srcset: source.getAttribute("srcset"),
      media: source.getAttribute("media"),
      sizes: source.getAttribute("sizes"),
      type: source.getAttribute("type"),
    }));
    const wrapperStyles = wrapper ? window.getComputedStyle(wrapper) : null;
    const imageStyles = image ? window.getComputedStyle(image) : null;

    return {
      wrapperTag: wrapper?.tagName ?? null,
      wrapperWidth: wrapperStyles?.width ?? null,
      wrapperHeight: wrapperStyles?.height ?? null,
      wrapperOverflow: wrapperStyles?.overflow ?? null,
      wrapperBackgroundColor: wrapperStyles?.backgroundColor ?? null,
      wrapperBorderRadius: wrapperStyles?.borderRadius ?? null,
      wrapperObjectFit: wrapperStyles?.objectFit ?? null,
      wrapperObjectPosition: wrapperStyles?.objectPosition ?? null,
      pictureTag: picture?.tagName ?? null,
      imgAlt: image?.getAttribute("alt") ?? null,
      imgDisplay: imageStyles?.display ?? null,
      imgWidth: imageStyles?.width ?? null,
      imgHeight: imageStyles?.height ?? null,
      imgObjectFit: imageStyles?.objectFit ?? null,
      imgObjectPosition: imageStyles?.objectPosition ?? null,
      imgOpacity: imageStyles?.opacity ?? null,
      sources,
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

test.describe("comparison Image visual parity", () => {
  test("Image default state is pixel-identical", async ({ page }) => {
    const fixtures = await imageFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Image default",
    );
  });

  test("Image prop controls drive both implementations", async ({ page }) => {
    await imageFixtures(page);

    await expect(page.locator('input[name="alt"]')).toHaveValue("Gradient landscape");
    await expectRadioValues(page, "sourceMode", imageSourceModeOptions, "basic");
    await expectRadioValues(page, "objectFit", imageObjectFitOptions, "cover");

    const fixtures = await imageFixtures(page, {
      alt: "Conditional asset",
      sourceMode: "conditional",
      objectFit: "contain",
    });

    await expect(fixtures.reactRow).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        alt: "Conditional asset",
        sourceMode: "conditional",
        objectFit: "contain",
      }),
    );
    await expect(fixtures.solidRow).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        alt: "Conditional asset",
        sourceMode: "conditional",
        objectFit: "contain",
      }),
    );
    await expect(page.locator('input[name="alt"]')).toHaveValue("Conditional asset");
    await expectRadioValues(page, "sourceMode", imageSourceModeOptions, "conditional");
    await expectRadioValues(page, "objectFit", imageObjectFitOptions, "contain");
  });

  test("Image computed styles and conditional sources match React Spectrum", async ({ page }) => {
    for (const sourceMode of ["basic", "conditional"] as const) {
      const fixtures = await imageFixtures(page, {
        sourceMode,
        objectFit: sourceMode === "conditional" ? "contain" : "cover",
      });

      await expect(imageContract(fixtures.solidRow)).resolves.toEqual(
        await imageContract(fixtures.reactRow),
      );
    }
  });

  test("Image error and coordinator modes match behaviorally", async ({ page }) => {
    const errorFixtures = await imageFixtures(page, { sourceMode: "error" });
    await expect(errorFixtures.reactRow.locator("img")).toHaveCount(0);
    await expect(errorFixtures.solidRow.locator("img")).toHaveCount(0);

    const coordinatorFixtures = await imageFixtures(page, { sourceMode: "coordinator" });
    await expect(coordinatorFixtures.reactRow.locator("img")).toHaveCount(2);
    await expect(coordinatorFixtures.solidRow.locator("img")).toHaveCount(2);
    await expect(imageContract(coordinatorFixtures.solidRow)).resolves.toEqual(
      await imageContract(coordinatorFixtures.reactRow),
    );
  });

  test("Image forced-colors environment matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await imageFixtures(page);

    await expect(imageContract(fixtures.solidRow)).resolves.toEqual(
      await imageContract(fixtures.reactRow),
    );
  });
});
