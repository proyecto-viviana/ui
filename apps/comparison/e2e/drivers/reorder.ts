import { expect, test, type ElementHandle } from "@playwright/test";
import { driverCases, scenarioThemes, type DriverScenario, type PanelFramework } from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D-reorder — keyboard drag-and-drop reordering, certified through a
 * ListBox host (see `.claude/current/certification.md`).
 *
 * Drag-and-drop has no standalone ARIA contract of its own — it is a behavior a
 * collection host mounts (like the Virtualizer's scroll-window, CP9.56). So it is
 * certified on the ListBox host: a reorderable `role="listbox"` whose options can
 * be moved by keyboard. The two stacks diverge by design in the machinery — RAC's
 * framework-agnostic `DragManager` singleton + `useDroppableCollection` vs the
 * Solid port's faithful `DragManager.ts` + `createDroppableCollection` — but the
 * observable a user and a screen reader actually perceive is certifiable and is
 * what this driver pins:
 *
 *  1. The KEYBOARD-DRAG focus trail: after the focused option is picked up
 *     (Enter), where focus/the drop target lands as the arrows walk the
 *     before/on/after drop positions, and on cancel/drop. Captured after each key
 *     as `active` (the drop target's role + accessible label), pair-diffed.
 *  2. The REORDER RESULT: the live item order published on the listbox root as
 *     `data-comparison-order`, captured after each key and pair-diffed — the drop
 *     (Enter on a position) must land the dragged item in the same place on both
 *     stacks.
 *
 * The same key sequence is driven against both panels and the full
 * `{ active, order }` trail is cross-diffed (port == oracle). Each panel is
 * entered by keyboard (Tab from the Before boundary button) rather than a
 * synthetic programmatic `.focus()`, so the collection's focusedKey is seeded
 * through the real shared roving-focus path — the same determinism rule the
 * scroll-window and listbox certs document.
 *
 * Behavior is theme-independent, so only the first scenario theme runs.
 */

export interface ReorderWalk {
  /** Stable id for the trail (appears in the diff on failure). */
  id: string;
  /**
   * Keys pressed IN the listbox after the Tab entry, in order. A keyboard
   * reorder is: Enter (pick up the focused option) → Arrow* (walk drop
   * positions) → Enter (drop) or Escape (cancel).
   */
  keys: readonly string[];
}

export interface ReorderConfig {
  /** Case ids to run; defaults to the first (canonical) case. */
  cases?: readonly string[];
  /** Keyboard sequences driven after entering the listbox. */
  walks: readonly ReorderWalk[];
  /** Settle after each key press (ms). */
  settleMs?: number;
}

interface TrailStep {
  key: string;
  active: string;
  order: string[];
}

const defaultReorderSettleMs = 220;

type Handle = ElementHandle<HTMLElement | SVGElement>;

// Scoped to the passed listbox element (resolved per-panel via scenario.target,
// so it is canvas-scoped) — NOT a global `document.querySelector`, which would
// match the first panel's listbox in DOM order and pollute the other panel's
// trail with the wrong stack's order + containment.
async function snapshot(handle: Handle, key: string): Promise<TrailStep> {
  const [active, order] = await handle.evaluate((el) => {
    const root = el as HTMLElement;
    const activeEl = document.activeElement;
    let active: string;
    if (!activeEl || activeEl.tagName === "BODY") {
      active = "(body)";
    } else {
      const role = activeEl.getAttribute("role") ?? activeEl.tagName.toLowerCase();
      const label =
        activeEl.getAttribute("aria-label") ?? (activeEl.textContent ?? "").trim().slice(0, 32);
      const inRoot = root.contains(activeEl) ? "" : " ·outside";
      active = `${role}:${label}${inRoot}`;
    }
    const raw = root.getAttribute("data-comparison-order");
    let order: string[] = [];
    if (raw) {
      try {
        order = JSON.parse(raw) as string[];
      } catch {
        order = [];
      }
    }
    return [active, order] as const;
  });
  return { key, active, order };
}

export function registerReorderDriver(scenario: DriverScenario, config: ReorderConfig) {
  const settleMs = config.settleMs ?? defaultReorderSettleMs;

  test.describe(`D-reorder keyboard DnD — ${scenario.title}`, () => {
    for (const caseDef of driverCases(scenario, config.cases)) {
      const theme = scenarioThemes(scenario, caseDef)[0];

      for (const walk of config.walks) {
        test(`${caseDef.id} · ${walk.id} · keyboard reorder trail`, async ({ page }) => {
          test.setTimeout(120_000);
          const trails: Partial<Record<PanelFramework, TrailStep[]>> = {};

          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const listbox = scenario.target(ctx);
            await expect(listbox).toBeVisible();
            const handle = (await listbox.elementHandle()) as Handle;

            // Enter the collection by keyboard: Tab from the Before boundary
            // button seeds the focusedKey through the real roving-focus path.
            const before = ctx.canvas.getByRole("button", { name: "Before" });
            await before.focus();
            await ctx.page.keyboard.press("Tab");
            await ctx.page.waitForTimeout(settleMs);

            const trail: TrailStep[] = [await snapshot(handle, "(start)")];
            for (const key of walk.keys) {
              await ctx.page.keyboard.press(key);
              await ctx.page.waitForTimeout(settleMs);
              trail.push(await snapshot(handle, key));
            }
            trails[ctx.framework] = trail;
          });

          expect(trails.solid, "solid panel produced no trail").toBeTruthy();
          expect(trails.react, "react panel produced no trail").toBeTruthy();
          // The keyboard-drag focus trail + reorder result must match the oracle.
          expect(JSON.stringify(trails.solid, null, 2)).toBe(JSON.stringify(trails.react, null, 2));
        });
      }
    }
  });
}
