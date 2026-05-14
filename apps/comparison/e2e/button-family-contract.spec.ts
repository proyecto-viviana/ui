import { expect, test, type Locator, type Page } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";

type Framework = "React Spectrum stack" | "Solidaria stack";

const staticColorViewerBackdrops = {
  black: ["rgb(221, 214, 254)", "rgb(251, 207, 232)"],
  white: ["rgb(15, 23, 42)", "rgb(51, 65, 85)"],
} as const;

const staticColorComponents = [
  "button",
  "actionbutton",
  "linkbutton",
  "togglebutton",
  "actionbuttongroup",
  "togglebuttongroup",
] as const;

async function styledSection(page: Page) {
  const section = page.locator("#example").filter({
    has: page.getByRole("heading", { name: "Example" }),
  });
  await expect(section).toHaveCount(1);
  await section.scrollIntoViewIfNeeded();
  return section;
}

async function frameworkCard(section: Locator, framework: Framework) {
  const card = section.locator(
    framework === "React Spectrum stack"
      ? '.s2-framework-panel[data-framework="react"]'
      : '.s2-framework-panel[data-framework="solid"]',
  );
  await expect(card).toHaveCount(1);
  return card;
}

async function expectPendingSpinnerAnimated(card: Locator) {
  const progress = card.getByRole("progressbar", { name: "pending" });
  await expect(progress).toBeVisible();

  const fillCircle = progress.locator("circle[stroke-dasharray]").first();
  await expect(fillCircle).toHaveCount(1);
  await expect
    .poll(async () =>
      fillCircle.evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return styles.animationName === "none"
          ? "none"
          : `${styles.animationDuration};${styles.animationIterationCount}`;
      }),
    )
    .toBe("1s, 1s;infinite, infinite");
}

async function selectBoxOption(card: Locator, name: string) {
  const option = card.getByRole("option", { name: new RegExp(`^${name}\\b`) });
  if ((await option.count()) > 0) {
    return option.first();
  }

  return card.locator("[data-select-box]").filter({ hasText: name }).first();
}

async function buttonFamilyCards(page: Page, slug: string, query = "") {
  await page.addInitScript(() => {
    window.localStorage.setItem("solid-spectrum-theme", "dark");
  });
  await page.goto(`/components/${slug}/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  return {
    react: await frameworkCard(section, "React Spectrum stack"),
    solid: await frameworkCard(section, "Solidaria stack"),
  };
}

async function staticColorBackdrop(card: Locator) {
  const backdrop = card.locator("[data-comparison-static-color]").first();
  await expect(backdrop).toBeVisible();
  return backdrop.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      padding: styles.padding,
    };
  });
}

function staticColorControl(card: Locator, slug: (typeof staticColorComponents)[number]) {
  switch (slug) {
    case "button":
      return card.getByRole("button", { name: "Save" }).first();
    case "actionbutton":
      return card.getByRole("button", { name: "Inspect" }).first();
    case "linkbutton":
      return card.getByRole("link", { name: "Open docs" }).first();
    case "togglebutton":
      return card.getByRole("button", { name: "Pin" }).first();
    case "actionbuttongroup":
      return card.getByRole("button", { name: "Bold" }).first();
    case "togglebuttongroup":
      return card.getByRole("radio", { name: "Left" }).first();
  }
}

async function staticColorControlStyles(control: Locator) {
  await expect(control).toBeVisible();
  return control.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth,
      color: styles.color,
      outlineColor: styles.outlineColor,
    };
  });
}

async function serializedControlProps(card: Locator) {
  const value = await card
    .locator("[data-comparison-control-props]")
    .first()
    .getAttribute("data-comparison-control-props");
  expect(value).toBeTruthy();
  return JSON.parse(value as string) as Record<string, unknown>;
}

test.describe("comparison button-family behavior contracts", () => {
  test("Button presses update both reference roots", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "button");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-action-count]").first();
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
      await card.getByRole("button", { name: "Save" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-count", "1");
    }
  });

  test("Button pending remains focusable and suppresses press actions", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "button", "?isPending=true");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-action-count]").first();
      const button = card.locator("button").first();
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
      await expectPendingSpinnerAnimated(card);
      await button.focus();
      await expect(button).toBeFocused();
      await button.click({ force: true });
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
    }
  });

  test("ActionButton presses update both reference roots", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "actionbutton");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-action-count]").first();
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
      await card.getByRole("button", { name: "Inspect" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-count", "1");
    }
  });

  test("ActionButton prop controls drive both implementations", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "actionbutton");

    await page.locator('input[name="children"]').fill("Inspect item");
    await page.locator('input[name="size"][value="XL"]').check();
    await page.locator('input[name="staticColor"][value="white"]').check();
    await page.locator('input[name="isQuiet"]').check();
    await expect(page).toHaveURL(/children=Inspect\+item/);
    await expect(page).toHaveURL(/size=XL/);
    await expect(page).toHaveURL(/staticColor=white/);
    await expect(page).toHaveURL(/isQuiet=true/);

    for (const card of [cards.react, cards.solid]) {
      await expect(card.getByRole("button", { name: "Inspect item" })).toBeVisible();
      const root = card.locator("[data-comparison-actionbutton-props]").first();
      await expect(root).toHaveAttribute(
        "data-comparison-actionbutton-props",
        JSON.stringify({
          children: "Inspect item",
          size: "XL",
          staticColor: "white",
          iconPlacement: "none",
          isQuiet: true,
          isDisabled: false,
          isPending: false,
        }),
      );
    }
  });

  test("ActionButton pending remains focusable and suppresses press actions", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "actionbutton", "?isPending=true");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-action-count]").first();
      const button = card.locator("button").first();
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
      await expectPendingSpinnerAnimated(card);
      await button.focus();
      await expect(button).toBeFocused();
      await button.click({ force: true });
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
    }
  });

  test("ActionButtonGroup action callbacks update both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "actionbuttongroup");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected-keys]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "bold");
      await card.getByRole("button", { name: "Italic" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "italic");
      await expect(root).toHaveAttribute("data-comparison-action-key", "italic");
    }
  });

  test("ButtonGroup buttons fire grouped actions on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "buttongroup");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-action-key]").first();
      await expect(root).toHaveAttribute("data-comparison-action-key", "");
      await card.getByRole("button", { name: "Save" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-key", "save");
      await card.getByRole("button", { name: "Cancel" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-key", "cancel");
    }
  });

  test("ToggleButton toggles selected state on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "togglebutton");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected]").first();
      await expect(root).toHaveAttribute("data-comparison-selected", "false");
      await card.getByRole("button", { name: "Pin" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected", "true");
      await card.getByRole("button", { name: "Pin" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected", "false");
    }
  });

  test("ToggleButtonGroup changes selected key on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "togglebuttongroup");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected-keys]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "left");
      await card.getByRole("radio", { name: "Center" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "center");
      await expect(card.getByRole("radio", { name: "Center" })).toBeChecked();
    }
  });

  test("staticColor controls expose official S2 options only", async ({ page }) => {
    for (const slug of staticColorComponents) {
      const cards = await buttonFamilyCards(page, slug);
      const form = page.locator(`[data-comparison-controls="${slug}"]`).first();
      const values = await form
        .locator('input[name="staticColor"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));

      expect(values).toEqual(["white", "black", "auto"]);
      await expect(form.locator('input[name="staticColor"]:checked')).toHaveCount(0);
      await expect(form.locator('input[name="staticColor"][value="none"]')).toHaveCount(0);
      expect(await serializedControlProps(cards.react)).not.toHaveProperty("staticColor");
      expect(await serializedControlProps(cards.solid)).not.toHaveProperty("staticColor");
    }
  });

  test("staticColor black and white use the S2 viewer backdrop on both stacks", async ({
    page,
  }) => {
    for (const slug of staticColorComponents) {
      for (const [staticColor, colorStops] of Object.entries(staticColorViewerBackdrops)) {
        const cards = await buttonFamilyCards(page, slug, `?staticColor=${staticColor}`);
        const reactControl = await staticColorControlStyles(staticColorControl(cards.react, slug));
        const solidControl = await staticColorControlStyles(staticColorControl(cards.solid, slug));

        expect(solidControl.backgroundColor).toBe(reactControl.backgroundColor);
        expect(solidControl.borderWidth).toBe(reactControl.borderWidth);
        expect(solidControl.color).toBe(reactControl.color);
        expect(solidControl.outlineColor).toBe(reactControl.outlineColor);
        if (reactControl.borderWidth !== "0px" || solidControl.borderWidth !== "0px") {
          expect(solidControl.borderColor).toBe(reactControl.borderColor);
        }

        for (const card of [cards.react, cards.solid]) {
          const backdrop = await staticColorBackdrop(card);
          expect(backdrop.backgroundImage).toContain("linear-gradient");
          for (const colorStop of colorStops) {
            expect(backdrop.backgroundImage).toContain(colorStop);
          }
          expect(backdrop.padding).toBe("24px");
        }
      }
    }
  });

  test("SegmentedControl changes selected key on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "segmentedcontrol");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected-key]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-key", "list");
      await card.getByRole("radio", { name: "Grid" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected-key", "grid");
      await expect(card.getByRole("radio", { name: "Grid" })).toBeChecked();
    }
  });

  test("SelectBoxGroup changes selected key on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "selectboxgroup");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected-keys]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "starter");
      await (await selectBoxOption(card, "Pro")).click();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "pro");
    }
  });

  test("CardView changes selected key on both stacks", async ({ page }) => {
    const cards = await buttonFamilyCards(page, "cardview");

    for (const card of [cards.react, cards.solid]) {
      const root = card.locator("[data-comparison-selected-keys]").first();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "apollo");
      await card.getByRole("row", { name: "Zephyr Queued" }).click();
      await expect(root).toHaveAttribute("data-comparison-selected-keys", "zephyr");
      await expect(card.getByRole("row", { name: "Zephyr Queued" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
  });
});
