import { expect, test } from "@playwright/test";
import {
  comparisonCoveragePath,
  comparisonInternalRobots,
  comparisonSiteDescription,
} from "../src/data/site-meta";
import { waitForComparisonRouteReady } from "./comparison-page";

test.describe("comparison site chrome", () => {
  test("landing describes a parity harness and has a document description", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Solid Spectrum");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      comparisonSiteDescription,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spectrum 2, made for Solid.");
    await expect(page.getByRole("main")).toContainText("parity harness");
    const browse = page.getByRole("link", { name: "Browse components" });
    await expect(browse).toHaveCount(2);
    await expect(browse.first()).toHaveAttribute("href", comparisonCoveragePath);
    await expect(browse.nth(1)).toHaveAttribute("href", comparisonCoveragePath);
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  test("coverage names the catalogue", async ({ page }) => {
    await page.goto(comparisonCoveragePath);
    await expect(page).toHaveTitle("Coverage | Solid Spectrum");
    await expect(page.getByRole("heading", { level: 1, name: "Solid Spectrum" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Top navigation" }).getByRole("link", { name: "Docs" }),
    ).toHaveAttribute("href", comparisonCoveragePath);
  });

  test("the not-found page is in the static tree", async ({ page }) => {
    // Astro preview SPA-falls unknown paths to `/`. Production wrangler serves
    // this file as HTTP 404 via not_found_handling: "404-page".
    const response = await page.goto("/404.html");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse components" })).toHaveAttribute(
      "href",
      comparisonCoveragePath,
    );
  });

  test("robots.txt allows the catalogue and hides internal routes", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const body = (await response?.text()) ?? "";
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /astro-smoke");
    expect(body).toContain("Disallow: /d12");
    expect(body).toContain("Disallow: /experiments");
    expect(body).toContain("Disallow: /keyboard-shortcuts");
  });

  test("internal harness routes are noindex", async ({ page }) => {
    await page.goto("/keyboard-shortcuts/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      comparisonInternalRobots,
    );

    await page.goto("/d12/button/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      comparisonInternalRobots,
    );
  });

  test("catalogue hrefs use trailing slashes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Browse components" }).first()).toHaveAttribute(
      "href",
      comparisonCoveragePath,
    );
    await page.goto(comparisonCoveragePath);
    await expect(
      page
        .locator("[data-entry-card][data-title='Accordion'], a[href='/components/accordion/']")
        .first(),
    ).toHaveAttribute("href", "/components/accordion/");
  });

  test("a live component route still mounts both panels", async ({ page }) => {
    await page.goto("/components/button/");
    await waitForComparisonRouteReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  });

  for (const component of [
    "timefield",
    "datefield",
    "checkboxgroup",
    "slider",
    "radiogroup",
    "rangeslider",
  ]) {
    test(`${component} contextual help stays on label row`, async ({ page }) => {
      await page.goto(`/components/${component}/?withContextualHelp=true`);
      await waitForComparisonRouteReady(page);
      const reactRoot = page.locator(
        `[data-comparison-framework="react"] [data-comparison-control-root="${component}"]`,
      );
      const solidRoot = page.locator(
        `[data-comparison-framework="solid"] [data-comparison-control-root="${component}"]`,
      );
      await expect(reactRoot).toBeVisible();
      await expect(solidRoot).toBeVisible();
      const reactBox = await reactRoot.boundingBox();
      const solidBox = await solidRoot.boundingBox();
      expect(solidBox).toBeTruthy();
      expect(reactBox).toBeTruthy();
      expect(Math.abs(solidBox!.height - reactBox!.height)).toBeLessThanOrEqual(2);
    });
  }

  test("TimeField clears to placeholders when live controlled value is emptied", async ({
    page,
  }) => {
    await page.goto("/components/timefield/");
    await waitForComparisonRouteReady(page);

    const reactField = page.locator(
      '[data-comparison-framework="react"] .comparison-timefield-root',
    );
    const solidField = page.locator(
      '[data-comparison-framework="solid"] .comparison-timefield-root',
    );
    await expect(reactField).toBeVisible();
    await expect(solidField).toBeVisible();

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("comparison:controls-change", {
          detail: {
            component: "timefield",
            props: { value: "14:00:00" },
          },
        }),
      );
    });

    await expect(reactField.locator('[role="spinbutton"][data-type="hour"]')).toHaveText("2");
    await expect(solidField.locator('[role="spinbutton"][data-type="hour"]')).toHaveText("2");

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("comparison:controls-change", {
          detail: {
            component: "timefield",
            props: { value: "" },
          },
        }),
      );
    });

    await expect(reactField.locator('[role="spinbutton"][data-type="hour"]')).toHaveText("––");
    await expect(solidField.locator('[role="spinbutton"][data-type="hour"]')).toHaveText("––");
    await expect(reactField.locator('[role="spinbutton"][data-type="minute"]')).toHaveText("––");
    await expect(solidField.locator('[role="spinbutton"][data-type="minute"]')).toHaveText("––");
  });

  test("ColorField paints FieldGroup hover and keyboard focus ring matching S2", async ({
    page,
  }) => {
    await page.goto("/components/colorfield/");
    await waitForComparisonRouteReady(page);

    const reactGroup = page.locator(
      '[data-comparison-framework="react"] [data-comparison-control-root="colorfield"] [role="presentation"]',
    );
    const solidGroup = page.locator(
      '[data-comparison-framework="solid"] [data-comparison-control-root="colorfield"] [role="presentation"]',
    );
    await expect(reactGroup).toBeVisible();
    await expect(solidGroup).toBeVisible();

    // FieldGroup hover darkens border on both with data-hovered=true
    await solidGroup.hover();
    await expect(solidGroup).toHaveAttribute("data-hovered", "true");
    await expect(solidGroup).toHaveCSS("border-color", "rgb(198, 198, 198)");

    await reactGroup.hover();
    await expect(reactGroup).toHaveAttribute("data-hovered", "true");
    await expect(reactGroup).toHaveCSS("border-color", "rgb(198, 198, 198)");

    // Pointer click on input focuses input but omits focus ring on both
    const solidInput = solidGroup.locator("input");
    await solidInput.click();
    await expect(solidInput).toBeFocused();
    await expect(solidGroup).toHaveAttribute("data-focused", "true");
    await expect(solidGroup).not.toHaveAttribute("data-focus-visible");
    const solidPointerOutline = await solidGroup.evaluate(
      (el) => window.getComputedStyle(el).outlineStyle,
    );
    expect(solidPointerOutline).toBe("none");

    const reactInput = reactGroup.locator("input");
    await reactInput.click();
    await expect(reactInput).toBeFocused();
    await expect(reactGroup).not.toHaveAttribute("data-focus-visible");
    const reactPointerOutline = await reactGroup.evaluate(
      (el) => window.getComputedStyle(el).outlineStyle,
    );
    expect(reactPointerOutline).toBe("none");

    // Injected element before the input then Tab (from ticket #369 description)
    await page.evaluate(() => {
      const before = document.createElement("button");
      before.id = "injected-before";
      before.textContent = "Before";
      const solidRoot = document.querySelector(
        '[data-comparison-framework="solid"] [data-comparison-control-root="colorfield"]',
      );
      solidRoot?.parentElement?.insertBefore(before, solidRoot);
    });
    const beforeBtn = page.locator("#injected-before");
    await beforeBtn.focus();
    await page.keyboard.press("Tab");

    await expect(solidInput).toBeFocused();
    await expect(solidGroup).toHaveAttribute("data-focus-visible", "true");
    const solidKeyboardOutline = await solidGroup.evaluate(
      (el) => window.getComputedStyle(el).outlineStyle,
    );
    expect(solidKeyboardOutline).toBe("solid");
  });

  test("empty TextArea height and Chrome top-padding baseline rule match S2", async ({ page }) => {
    await page.goto("/components/textarea/?value=");
    await waitForComparisonRouteReady(page);

    const reactGroup = page.locator(
      '[data-comparison-framework="react"] [data-comparison-control-root="textarea"] [role="presentation"]',
    );
    const solidGroup = page.locator(
      '[data-comparison-framework="solid"] [data-comparison-control-root="textarea"] [role="presentation"]',
    );
    await expect(reactGroup).toBeVisible();
    await expect(solidGroup).toBeVisible();

    const reactHeight = await reactGroup.evaluate((el) => el.getBoundingClientRect().height);
    const solidHeight = await solidGroup.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.abs(solidHeight - reactHeight)).toBeLessThanOrEqual(1);

    // Verify S2 Chrome ::before top-padding rule class is present on both
    const reactClasses = await reactGroup.evaluate((el) => el.className);
    const solidClasses = await solidGroup.evaluate((el) => el.className);
    expect(reactClasses).toContain("TSO4kUbZsXLs17");
    expect(solidClasses).toContain("TSO4kUbZsXLs17");
  });
});
