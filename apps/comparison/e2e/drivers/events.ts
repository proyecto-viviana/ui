import { expect, test, type Locator } from "@playwright/test";
import {
  flushEventLog,
  installOracle,
  startEventRecording,
  type OracleRecordedEvent,
} from "./dom-oracle";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type EventGesture,
  type PanelFramework,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D4 — event-sequence oracle (recertification.md Phase 1).
 *
 * Replays the same scripted input gesture against both framework panels and
 * diffs the ordered log of DOM events plus fixture-re-emitted component
 * callbacks (`comparison:callback`). The log is the behavioral contract: same
 * events, same targets, same order, same `defaultPrevented`, and callbacks
 * interleaved at the same positions.
 *
 * Gestures run on the first scenario theme only — interaction logs are
 * theme-independent — and use raw coordinates / protocol focus instead of
 * `locator.click()` so disabled targets can be driven identically (Playwright
 * actionability would refuse them). The describe block enables `hasTouch` for
 * every gesture so both panels always run in an identical environment.
 */

const defaultGestureSettleMs = 350;

async function centerOf(target: Locator): Promise<{ x: number; y: number }> {
  // The comparison route stacks the React panel above the Solid panel, so a
  // Solid target can sit below the viewport fold (page-y ~900+ for a tall
  // composite like DatePicker). `boundingBox()` reports that off-fold page
  // coordinate faithfully, but the raw `page.mouse`/`touchscreen` gestures
  // below fire at viewport coordinates — a click at y≈933 lands off-screen and
  // hits nothing, so the driven panel never receives the press. Scroll the
  // target into view first (a no-op when it is already fully visible, so the
  // in-view React panel and every already-passing gesture are unaffected) and
  // re-read the box at its post-scroll viewport position. `scroll` is not a
  // recorded event type, so this cannot perturb the D4 event-sequence diff.
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error("Gesture target has no bounding box");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export const mouseClickGesture: EventGesture = {
  id: "mouse-click",
  run: async ({ page, target }) => {
    const { x, y } = await centerOf(target);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.up();
  },
};

export function keyboardActivateGesture(key: "Enter" | "Space"): EventGesture {
  return {
    id: `keyboard-${key.toLowerCase()}`,
    run: async ({ page, target }) => {
      await target.focus();
      await page.keyboard.press(key);
    },
  };
}

export const touchTapGesture: EventGesture = {
  id: "touch-tap",
  run: async ({ page, target }) => {
    const { x, y } = await centerOf(target);
    await page.touchscreen.tap(x, y);
  },
};

export const standardPressGestures: readonly EventGesture[] = [
  mouseClickGesture,
  keyboardActivateGesture("Enter"),
  keyboardActivateGesture("Space"),
  touchTapGesture,
];

export function registerEventSequenceDriver(scenario: DriverScenario) {
  const config = scenario.events;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no events (D4) config`);
  }

  test.describe(`D4 event sequence — ${scenario.title}`, () => {
    test.use({ hasTouch: true });

    for (const caseDef of driverCases(scenario, config.cases)) {
      for (const gesture of config.gestures) {
        const caseTitle = `${caseDef.id} · ${gesture.id}`;
        test(caseTitle, async ({ page }) => {
          const divergence = config.knownDivergences?.[caseTitle];
          if (divergence) {
            test.fixme(true, divergence);
          }
          test.setTimeout(120_000);
          const theme = scenarioThemes(scenario, caseDef)[0];
          const logs: Partial<Record<PanelFramework, OracleRecordedEvent[]>> = {};

          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const target = (gesture.target ?? scenario.target)(ctx);
            await expect(target).toBeVisible();
            await installOracle(ctx.page, ctx.canvas);
            await startEventRecording(ctx.page);
            await gesture.run({ ...ctx, target });
            await ctx.page.waitForTimeout(gesture.settleMs ?? defaultGestureSettleMs);
            logs[ctx.framework] = await flushEventLog(ctx.page);
          });

          expect(JSON.stringify(logs.solid, null, 2)).toBe(JSON.stringify(logs.react, null, 2));
        });
      }
    }
  });
}
