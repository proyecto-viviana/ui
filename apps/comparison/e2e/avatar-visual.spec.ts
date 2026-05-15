import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import { avatarDemoDefaults, avatarSizeOptions } from "../src/data/avatar-demo";

const avatarDocsImageMock = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#2f6f62"/>
  <circle cx="32" cy="24" r="13" fill="#f4d1b4"/>
  <path d="M13 64c3-18 35-18 38 0" fill="#f4d1b4"/>
</svg>
`;
const avatarDocsImageRoutePattern = `**${avatarDemoDefaults.src}`;
const avatarChangedSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%234f46e5'/%3E%3Ccircle cx='32' cy='25' r='13' fill='%23f8fafc'/%3E%3Cpath d='M12 64c4-18 36-18 40 0' fill='%23f8fafc'/%3E%3C/svg%3E";

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

async function mockDocsAvatarImage(page: Page) {
  await page.unroute(avatarDocsImageRoutePattern).catch(() => undefined);
  await page.route(avatarDocsImageRoutePattern, (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: avatarDocsImageMock,
    }),
  );
}

async function waitForAvatarImage(root: Locator) {
  const image = root.locator("img").first();

  await expect
    .poll(
      async () =>
        image.evaluate((element) => {
          const img = element as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      { timeout: 5_000 },
    )
    .toBe(true);
  await expect
    .poll(() => image.evaluate((element) => window.getComputedStyle(element).opacity), {
      timeout: 3_000,
    })
    .toBe("1");
}

async function avatarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await mockDocsAvatarImage(page);
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

  const expectedSrc = typeof params.src === "string" ? params.src : avatarDemoDefaults.src;
  if (expectedSrc) {
    await waitForAvatarImage(reactRoot);
    await waitForAvatarImage(solidRoot);
  }

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
    await avatarFixtures(page);

    await expect(page.locator('input[name="alt"]')).toHaveValue(avatarDemoDefaults.alt);
    await expect(page.locator('input[name="src"]')).toHaveValue(avatarDemoDefaults.src);
    await expectRadioValues(page, "size", avatarSizeOptions, "24");
    await expect(page.locator('input[name="isOverBackground"]')).not.toBeChecked();

    const fixtures = await avatarFixtures(page, {
      alt: "Kai",
      src: avatarChangedSrc,
      size: "64",
      isOverBackground: true,
    });

    await expect(
      fixtures.reactPanel.locator('[data-comparison-control-root="avatar"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ alt: "Kai", src: avatarChangedSrc, size: "64", isOverBackground: true }),
    );
    await expect(
      fixtures.solidPanel.locator('[data-comparison-control-root="avatar"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ alt: "Kai", src: avatarChangedSrc, size: "64", isOverBackground: true }),
    );
    await expect(page.locator('input[name="alt"]')).toHaveValue("Kai");
    await expect(page.locator('input[name="src"]')).toHaveValue(avatarChangedSrc);
    await expectRadioValues(page, "size", avatarSizeOptions, "64");
    await expect(page.locator('input[name="isOverBackground"]')).toBeChecked();
  });

  test("Avatar computed styles match React Spectrum across sizes and background states", async ({
    page,
  }) => {
    for (const params of [
      ...avatarSizeOptions.map((size) => ({ size })),
      { size: "24", isOverBackground: true },
      { size: "64", isOverBackground: true },
    ] as const) {
      const fixtures = await avatarFixtures(page, params);

      await expect(avatarContract(fixtures.solidRoot)).resolves.toEqual(
        await avatarContract(fixtures.reactRoot),
      );
    }
  });

  test("Avatar forced-colors environment matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await avatarFixtures(page, {
      size: "64",
      isOverBackground: true,
    });

    await expect(avatarContract(fixtures.solidRoot)).resolves.toEqual(
      await avatarContract(fixtures.reactRoot),
    );
  });
});
