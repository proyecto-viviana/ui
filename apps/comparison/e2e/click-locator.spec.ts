import { expect, test } from "@playwright/test";
import {
  clickLocator,
  dismissOverlay,
  frameworkCanvas,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";

const stacks: FrameworkName[] = ["React Spectrum stack", "Solidaria stack"];

test.describe("clickLocator", () => {
  test("does not focus the trigger between pointerdown and pointerup", async ({ page }) => {
    await page.goto("/components/dialog/");
    await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
    const section = await styledSection(page);
    const canvas = await frameworkCanvas(section, "Solidaria stack");
    const trigger = canvas.getByRole("button", { name: "Open Dialog" }).first();

    await trigger.evaluate((element) => {
      const el = element as HTMLElement;
      const w = window as Window & { __clickLocatorMidPressFocus?: boolean };
      w.__clickLocatorMidPressFocus = false;
      const originalFocus = HTMLElement.prototype.focus;
      const originalDispatch = EventTarget.prototype.dispatchEvent;
      let afterPointerDown = false;
      EventTarget.prototype.dispatchEvent = function (event) {
        const result = originalDispatch.call(this, event);
        if (this === el && event instanceof PointerEvent && event.type === "pointerdown") {
          afterPointerDown = true;
        }
        if (this === el && event instanceof PointerEvent && event.type === "pointerup") {
          afterPointerDown = false;
        }
        return result;
      };
      HTMLElement.prototype.focus = function (...args) {
        if (afterPointerDown && this === el) {
          w.__clickLocatorMidPressFocus = true;
        }
        return originalFocus.apply(this, args as []);
      };
    });

    await clickLocator(trigger);
    expect(
      await page.evaluate(
        () =>
          (window as Window & { __clickLocatorMidPressFocus?: boolean })
            .__clickLocatorMidPressFocus,
      ),
    ).toBe(false);
  });

  for (const stack of stacks) {
    test(`Escape after clickLocator closes the ${stack} dialog`, async ({ page }) => {
      await page.goto("/components/dialog/");
      await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
      const section = await styledSection(page);
      const canvas = await frameworkCanvas(section, stack);
      await clickLocator(canvas.getByRole("button", { name: "Open Dialog" }).first());
      const dialog = page.getByRole("dialog", { name: "Review Changes" });
      await expect(dialog).toBeVisible();
      await dismissOverlay(dialog);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  }
});
