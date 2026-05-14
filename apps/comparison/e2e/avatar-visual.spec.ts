import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

const avatarSizes = ["16", "24", "64", "112"] as const;

function avatarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function avatarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/avatar/${avatarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[slot="avatar"]').first();
  const solidRoot = solidPanel.locator('[slot="avatar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function avatarContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const image = element.querySelector("img");
    const imageStyles = image ? window.getComputedStyle(image) : null;

    return {
      slot: element.getAttribute("slot"),
      width: styles.width,
      height: styles.height,
      display: styles.display,
      alignItems: styles.alignItems,
      overflow: styles.overflow,
      borderRadius: styles.borderRadius,
      backgroundColor: styles.backgroundColor,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      outlineColor: styles.outlineColor,
      flexGrow: styles.flexGrow,
      flexShrink: styles.flexShrink,
      imgAlt: image?.getAttribute("alt") ?? null,
      imgSrc: image?.getAttribute("src") ?? null,
      imgDisplay: imageStyles?.display ?? null,
      imgWidth: imageStyles?.width ?? null,
      imgHeight: imageStyles?.height ?? null,
      imgObjectFit: imageStyles?.objectFit ?? null,
      imgObjectPosition: imageStyles?.objectPosition ?? null,
      imgOpacity: imageStyles?.opacity ?? null,
    };
  });
}

test.describe("comparison Avatar visual parity", () => {
  test("Avatar default state is pixel-identical", async ({ page }) => {
    const fixtures = await avatarFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Avatar default",
    );
  });

  test("Avatar prop controls drive both implementations", async ({ page }) => {
    const fixtures = await avatarFixtures(page, {
      alt: "Kai",
      size: "64",
      isOverBackground: true,
    });

    await expect(
      fixtures.reactPanel.locator('[data-comparison-control-root="avatar"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ alt: "Kai", src: "", size: "64", isOverBackground: true }),
    );
    await expect(
      fixtures.solidPanel.locator('[data-comparison-control-root="avatar"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ alt: "Kai", src: "", size: "64", isOverBackground: true }),
    );
  });

  test("Avatar computed styles match React Spectrum across sizes and background states", async ({
    page,
  }) => {
    for (const size of avatarSizes) {
      for (const isOverBackground of [false, true]) {
        const fixtures = await avatarFixtures(page, {
          size,
          isOverBackground,
        });

        await expect(avatarContract(fixtures.solidRoot)).resolves.toEqual(
          await avatarContract(fixtures.reactRoot),
        );
      }
    }
  });
});
