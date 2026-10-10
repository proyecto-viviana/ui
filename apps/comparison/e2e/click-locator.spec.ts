import { expect, test } from "@playwright/test";
import {
  clickLocator,
  dismissOverlay,
  frameworkCanvas,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";
import { panelDialog } from "./panel-dialog";
import type { PanelFramework } from "./drivers/scenario";

const stacks: FrameworkName[] = ["React Spectrum stack", "Solidaria stack"];

test.describe("clickLocator", () => {
  test("does not focus the trigger between pointerdown and pointerup", async ({ page }) => {
    await page.goto("/components/dialog/");
    await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
    const section = await styledSection(page);
    const canvas = await frameworkCanvas(section, "Solidaria stack");
    const trigger = canvas.getByRole("button", { name: "Open Dialog" }).first();

    await trigger.evaluate((element) => {
      const w = window as Window & {
        __clickLocatorMidPressFocus?: boolean;
        __clickLocatorNativeProbe?: {
          pointerDownObserved: boolean;
          pointerUpObserved: boolean;
          pointerDownTrusted: boolean;
          pointerUpTrusted: boolean;
          restore: () => void;
        };
      };
      w.__clickLocatorMidPressFocus = false;
      const originalFocus = HTMLElement.prototype.focus;
      let pointerDown: Event | undefined;
      let pointerUp: Event | undefined;
      const probe = {
        pointerDownObserved: false,
        pointerUpObserved: false,
        pointerDownTrusted: false,
        pointerUpTrusted: false,
        restore: () => {
          window.removeEventListener("pointerdown", onPointerDown, true);
          window.removeEventListener("pointerup", onPointerUp, true);
          HTMLElement.prototype.focus = originalFocus;
        },
      };
      const onPointerDown = (event: Event) => {
        if (!(event.target instanceof Node) || !element.contains(event.target)) return;
        pointerDown = event;
        probe.pointerDownObserved = true;
        probe.pointerDownTrusted = event.isTrusted;
      };
      const onPointerUp = (event: Event) => {
        if (!(event.target instanceof Node) || !element.contains(event.target)) return;
        pointerUp = event;
        probe.pointerUpObserved = true;
        probe.pointerUpTrusted = event.isTrusted;
      };
      window.addEventListener("pointerdown", onPointerDown, true);
      window.addEventListener("pointerup", onPointerUp, true);
      HTMLElement.prototype.focus = function (...args) {
        if (
          this === element &&
          pointerDown?.eventPhase === Event.NONE &&
          (!pointerUp || pointerUp.eventPhase !== Event.NONE)
        ) {
          w.__clickLocatorMidPressFocus = true;
        }
        return originalFocus.apply(this, args as []);
      };
      w.__clickLocatorNativeProbe = probe;
    });

    try {
      await clickLocator(trigger);
      expect(
        await page.evaluate(
          () =>
            (window as Window & { __clickLocatorMidPressFocus?: boolean })
              .__clickLocatorMidPressFocus,
        ),
      ).toBe(false);
      expect(
        await page.evaluate(() => {
          const probe = (
            window as Window & {
              __clickLocatorNativeProbe?: {
                pointerDownObserved: boolean;
                pointerUpObserved: boolean;
                pointerDownTrusted: boolean;
                pointerUpTrusted: boolean;
              };
            }
          ).__clickLocatorNativeProbe;
          return {
            pointerDownObserved: probe?.pointerDownObserved,
            pointerUpObserved: probe?.pointerUpObserved,
            pointerDownTrusted: probe?.pointerDownTrusted,
            pointerUpTrusted: probe?.pointerUpTrusted,
          };
        }),
      ).toEqual({
        pointerDownObserved: true,
        pointerUpObserved: true,
        pointerDownTrusted: true,
        pointerUpTrusted: true,
      });
    } finally {
      await page.evaluate(() => {
        const w = window as Window & {
          __clickLocatorNativeProbe?: { restore: () => void };
        };
        w.__clickLocatorNativeProbe?.restore();
        delete w.__clickLocatorNativeProbe;
      });
    }
  });

  for (const stack of stacks) {
    test(`Escape after clickLocator closes the ${stack} dialog`, async ({ page }) => {
      await page.goto("/components/dialog/");
      await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
      const section = await styledSection(page);
      const canvas = await frameworkCanvas(section, stack);
      const framework: PanelFramework = stack === "React Spectrum stack" ? "react" : "solid";
      await clickLocator(canvas.getByRole("button", { name: "Open Dialog" }).first());
      const dialog = panelDialog({ page, canvas, framework }, { name: "Review Changes" });
      await expect(dialog).toBeVisible();
      await dismissOverlay(dialog);
      await expect(panelDialog({ page, canvas, framework })).toHaveCount(0);
    });
  }
});
