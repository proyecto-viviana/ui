import { expect, test } from "@playwright/test";
import { installOracle, snapshotFocus, type OracleFocusSnapshot } from "./dom-oracle";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type FocusRovingCensus,
  type PanelFramework,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D5 — focus/keyboard trails (see `.claude/current/certification.md`).
 *
 * Focuses a start element, presses a scripted key sequence, and snapshots
 * after every key: the active element descriptor, the resolved
 * `aria-activedescendant`, and the roving-tabindex layout (every `[tabindex]`
 * element in the driven panel or its overlays, unless a walk asks for the
 * collection tab-stop only). The React and Solid trails must match entry for
 * entry — same focus order, same roving updates, same virtual focus. Elements
 * outside the driven panel collapse to a sentinel so docs chrome can never
 * leak into the comparison.
 *
 * Like D4, trails are theme-independent, so only the first scenario theme
 * runs.
 */

const keySettleMs = 120;

const COLLECTION_ROLES = new Set([
  "treegrid",
  "grid",
  "listbox",
  "list",
  "tablist",
  "menu",
  "tree",
  "toolbar",
]);

const COLLECTION_ITEM_ROLES = new Set([
  "row",
  "option",
  "tab",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "treeitem",
  "gridcell",
]);

/**
 * Project a focus snapshot to the `useSelectableCollection` tab-stop: the
 * collection root plus the focused item. Inner widgets (selection checkboxes,
 * expand buttons) and unfocused rows stay out so an S2 Virtualizer that
 * unmounts offscreen rows cannot false-fail a keyboard trail whose `active`
 * element already matches.
 */
export function projectFocusSnapshot(
  snapshot: OracleFocusSnapshot,
  roving: FocusRovingCensus | undefined,
): OracleFocusSnapshot {
  if (roving !== "collection") {
    return snapshot;
  }
  return {
    ...snapshot,
    roving: snapshot.roving.filter((el) => {
      if (el.role && COLLECTION_ROLES.has(el.role)) {
        return true;
      }
      return el.tabindex === "0" && !!el.role && COLLECTION_ITEM_ROLES.has(el.role);
    }),
  };
}

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
            const roving = walk.roving ?? config.roving ?? "all";
            const trail: TrailEntry[] = [
              {
                after: "(start)",
                snapshot: projectFocusSnapshot(await snapshotFocus(ctx.page, root), roving),
              },
            ];
            for (const key of walk.keys) {
              await ctx.page.keyboard.press(key);
              await ctx.page.waitForTimeout(keySettleMs);
              trail.push({
                after: key,
                snapshot: projectFocusSnapshot(await snapshotFocus(ctx.page, root), roving),
              });
            }
            trails[ctx.framework] = trail;
          });

          expect(JSON.stringify(trails.solid, null, 2)).toBe(JSON.stringify(trails.react, null, 2));
        });
      }
    }
  });
}
