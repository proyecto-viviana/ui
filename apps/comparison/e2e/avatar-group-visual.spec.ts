import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import {
  avatarGroupCountOptions,
  avatarGroupDemoDefaults,
  avatarGroupSizeOptions,
  serializeAvatarGroupDemoProps,
} from "../src/data/avatar-group-demo";

function avatarGroupQuery(params: Record<string, string> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function avatarGroupFixtures(page: Page, params: Record<string, string> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/avatargroup/${avatarGroupQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactGroup = reactPanel.getByRole("group").first();
  const solidGroup = solidPanel.getByRole("group").first();

  await expect(reactGroup).toBeVisible();
  await expect(solidGroup).toBeVisible();
  const expectedCount = Number(params.count ?? avatarGroupDemoDefaults.count);
  await waitForAvatarGroupImages(reactGroup, expectedCount);
  await waitForAvatarGroupImages(solidGroup, expectedCount);

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactGroup, solidGroup };
}

async function waitForAvatarGroupImages(group: Locator, expectedCount: number) {
  const images = group.locator('[slot="avatar"] img');
  await expect(images).toHaveCount(expectedCount);

  for (let index = 0; index < expectedCount; index += 1) {
    const image = images.nth(index);
    await expect
      .poll(
        () =>
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
}

async function avatarGroupContract(group: Locator) {
  return group.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const label = element.querySelector("span");
    const labelStyles = label ? window.getComputedStyle(label) : null;
    const avatars = Array.from(element.querySelectorAll('[slot="avatar"]')).map((avatar) => {
      const avatarStyles = window.getComputedStyle(avatar);
      return {
        width: avatarStyles.width,
        height: avatarStyles.height,
        marginInlineStart: avatarStyles.marginInlineStart,
        outlineStyle: avatarStyles.outlineStyle,
        outlineWidth: avatarStyles.outlineWidth,
        outlineColor: avatarStyles.outlineColor,
        imgAlt: avatar.querySelector("img")?.getAttribute("alt") ?? null,
        imgSrc: avatar.querySelector("img")?.getAttribute("src") ?? null,
      };
    });

    return {
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaLabelledBy: element.getAttribute("aria-labelledby") ? "present" : null,
      sizeVariable: styles.getPropertyValue("--size").trim(),
      display: styles.display,
      alignItems: styles.alignItems,
      labelText: label?.textContent ?? "",
      labelDisplay: labelStyles?.display ?? null,
      labelMarginInlineStart: labelStyles?.marginInlineStart ?? null,
      labelFontSize: labelStyles?.fontSize ?? null,
      avatars,
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

test.describe("comparison AvatarGroup visual parity", () => {
  test("AvatarGroup default state is pixel-identical", async ({ page }) => {
    const fixtures = await avatarGroupFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "AvatarGroup default",
    );
  });

  test("AvatarGroup prop controls drive both implementations", async ({ page }) => {
    await avatarGroupFixtures(page);

    await expect(page.locator('input[name="label"]')).toHaveValue(avatarGroupDemoDefaults.label);
    await expectRadioValues(page, "size", avatarGroupSizeOptions, "24");
    await expect(page.locator('input[name="count"]')).toHaveCount(0);

    const fixtures = await avatarGroupFixtures(page, {
      label: "Reviewers",
      size: "32",
      count: "3",
    });

    const expectedProps = serializeAvatarGroupDemoProps({
      label: "Reviewers",
      ariaLabel: avatarGroupDemoDefaults.ariaLabel,
      size: "32",
      count: "3",
    });

    await expect(
      fixtures.reactPanel.locator('[data-comparison-control-root="avatargroup"]'),
    ).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(
      fixtures.solidPanel.locator('[data-comparison-control-root="avatargroup"]'),
    ).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(page.locator('input[name="label"]')).toHaveValue("Reviewers");
    await expectRadioValues(page, "size", avatarGroupSizeOptions, "32");
    await expect(page.locator('input[name="count"]')).toHaveCount(0);
    await expect(fixtures.reactGroup).toHaveAccessibleName("Collaborators Reviewers");
    await expect(fixtures.solidGroup).toHaveAccessibleName("Collaborators Reviewers");
    await expect(fixtures.reactGroup.locator('[slot="avatar"]')).toHaveCount(3);
    await expect(fixtures.solidGroup.locator('[slot="avatar"]')).toHaveCount(3);
  });

  test("AvatarGroup computed styles match React Spectrum across sizes and child counts", async ({
    page,
  }) => {
    for (const params of [
      ...avatarGroupSizeOptions.map((size) => ({ size })),
      ...avatarGroupCountOptions.map((count) => ({ count })),
      { label: "Reviewers", size: "32", count: "3" },
    ] as const) {
      const fixtures = await avatarGroupFixtures(page, params);

      await expect(avatarGroupContract(fixtures.solidGroup)).resolves.toEqual(
        await avatarGroupContract(fixtures.reactGroup),
      );
    }
  });

  test("AvatarGroup forced-colors environment matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await avatarGroupFixtures(page, { size: "40", count: "4" });

    await expect(avatarGroupContract(fixtures.solidGroup)).resolves.toEqual(
      await avatarGroupContract(fixtures.reactGroup),
    );
  });
});
