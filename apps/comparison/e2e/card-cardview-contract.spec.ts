import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";

type Framework = "React Spectrum stack" | "Solidaria stack";

async function fixturePanels(page: Page, slug: string) {
  await page.addInitScript(() => {
    window.localStorage.setItem("solid-spectrum-theme", "dark");
  });
  await page.goto(`/components/${slug}/`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  return {
    react: await frameworkPanel(section, "React Spectrum stack"),
    solid: await frameworkPanel(section, "Solidaria stack"),
  };
}

async function expectCardContent(panel: Locator, framework: Framework) {
  await expect(panel.getByText("Apollo", { exact: true })).toBeVisible();
  await expect(panel.getByText("Active", { exact: true })).toBeVisible();

  const previewImage = panel.locator("img").first();
  await expect(previewImage).toBeVisible();
  await expect
    .poll(async () =>
      previewImage.evaluate((image) =>
        image instanceof HTMLImageElement ? image.naturalWidth : 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(async () =>
      previewImage.evaluate((image) =>
        image instanceof HTMLImageElement ? image.naturalHeight : 0,
      ),
    )
    .toBeGreaterThan(0);
  const naturalAspectRatio = await previewImage.evaluate((image) =>
    image instanceof HTMLImageElement ? image.naturalWidth / image.naturalHeight : 0,
  );
  expect(naturalAspectRatio, `${framework} preview image aspect ratio`).toBeCloseTo(16 / 9, 1);

  const imageBox = await previewImage.boundingBox();
  expect(imageBox, `${framework} preview image box`).not.toBeNull();
  expect(imageBox?.width ?? 0, `${framework} preview image width`).toBeGreaterThan(100);
  expect(imageBox?.height ?? 0, `${framework} preview image height`).toBeGreaterThan(50);
}

test.describe("comparison Card and CardView contracts", () => {
  test("Card route mounts official preview, image, content, and text slots on both stacks", async ({
    page,
  }) => {
    const panels = await fixturePanels(page, "card");

    await expectCardContent(panels.react, "React Spectrum stack");
    await expectCardContent(panels.solid, "Solidaria stack");
  });

  test("CardView route uses grid rows and controlled highlight selection on both stacks", async ({
    page,
  }) => {
    const panels = await fixturePanels(page, "cardview");

    for (const panel of [panels.react, panels.solid]) {
      const root = panel.locator("[data-comparison-selected-keys]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "apollo");

      const grid = panel.getByRole("grid", { name: "Projects" });
      await expect(grid).toBeVisible();
      await expect(grid.getByRole("row")).toHaveCount(2);

      const zephyr = grid.getByRole("row", { name: "Zephyr Queued" });
      await zephyr.click();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "zephyr");
      await expect(zephyr).toHaveAttribute("aria-selected", "true");
    }
  });
});
