import { expect, test } from "@playwright/test";
import { installOracle, snapshotFocus, type OracleFocusSnapshot } from "./dom-oracle";
import { driverCases, scenarioThemes, type DriverScenario, type PanelFramework } from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D5 — focus/keyboard trails (recertification.md Phase 1).
 *
 * Focuses a start element, presses a scripted key sequence, and snapshots
 * after every key: the active element descriptor, the resolved
 * `aria-activedescendant`, and the roving-tabindex layout (every `[tabindex]`
 * element in the driven panel or its overlays). The React and Solid trails
 * must match entry for entry — same focus order, same roving updates, same
 * virtual focus. Elements outside the driven panel collapse to a sentinel so
 * docs chrome can never leak into the comparison.
 *
 * Like D4, trails are theme-independent, so only the first scenario theme
 * runs.
 */

const keySettleMs = 120;

interface TrailEntry {
  after: string;
  snapshot: OracleFocusSnapshot;
}

export function registerFocusTrailDriver(scenario: DriverScenario) {
  const config = scenario.focus;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no focus (D5) config`);
  }

  test.describe(`D5 focus trail — ${scenario.title}`, () => {
    for (const caseDef of driverCases(scenario, config.cases)) {
      for (const walk of config.walks) {
        test(`${caseDef.id} · ${walk.id}`, async ({ page }) => {
          test.setTimeout(120_000);
          const theme = scenarioThemes(scenario, caseDef)[0];
          const trails: Partial<Record<PanelFramework, TrailEntry[]>> = {};

          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const start = (walk.start ?? scenario.target)(ctx);
            await expect(start).toBeVisible();
            await installOracle(ctx.page, ctx.canvas);

            // Optional roving subtree scope (see DriverScenario.focus.root): resolve
            // it to a handle once per panel so the browser-side snapshot can filter.
            const root = config.root ? await config.root(ctx).elementHandle() : null;

            // Entry: programmatic focus (default) or keyboard (overlay auto-focus).
            // See FocusWalk.entry — `"keyboard"` avoids seeding the collection's
            // focusedKey via a synthetic `.focus()`, which diverges across stacks.
            if ((walk.entry ?? "focus") === "focus") {
              await start.focus();
            }
            await ctx.page.waitForTimeout(keySettleMs);
            const trail: TrailEntry[] = [
              { after: "(start)", snapshot: await snapshotFocus(ctx.page, root) },
            ];
            for (const key of walk.keys) {
              await ctx.page.keyboard.press(key);
              await ctx.page.waitForTimeout(keySettleMs);
              trail.push({ after: key, snapshot: await snapshotFocus(ctx.page, root) });
            }
            trails[ctx.framework] = trail;
          });

          expect(JSON.stringify(trails.solid, null, 2)).toBe(JSON.stringify(trails.react, null, 2));
        });
      }
    }
  });
}
