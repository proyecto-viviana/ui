import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

const avatarGroupSizes = ["16", "24", "40"] as const;

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

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactGroup, solidGroup };
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
    const fixtures = await avatarGroupFixtures(page, {
      label: "Reviewers",
      size: "32",
      count: "3",
    });

    await expect(
      fixtures.reactPanel.locator('[data-comparison-control-root="avatargroup"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ label: "Reviewers", size: "32", count: "3" }),
    );
    await expect(
      fixtures.solidPanel.locator('[data-comparison-control-root="avatargroup"]'),
    ).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ label: "Reviewers", size: "32", count: "3" }),
    );
    await expect(fixtures.reactGroup).toHaveAccessibleName("Reviewers");
    await expect(fixtures.solidGroup).toHaveAccessibleName("Reviewers");
    await expect(fixtures.reactGroup.locator('[slot="avatar"]')).toHaveCount(3);
    await expect(fixtures.solidGroup.locator('[slot="avatar"]')).toHaveCount(3);
  });

  test("AvatarGroup computed styles match React Spectrum across sizes", async ({ page }) => {
    for (const size of avatarGroupSizes) {
      const fixtures = await avatarGroupFixtures(page, { size });

      await expect(avatarGroupContract(fixtures.solidGroup)).resolves.toEqual(
        await avatarGroupContract(fixtures.reactGroup),
      );
    }
  });
});
