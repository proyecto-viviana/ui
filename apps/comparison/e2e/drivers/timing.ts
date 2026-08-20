import { expect, test, type Page } from "@playwright/test";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type PanelFramework,
  type TimingContext,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D11 — timing oracle (see `.claude/current/certification.md`).
 *
 * Certifies delay-driven behavior (tooltip warmup/cooldown, toast auto-dismiss,
 * long-press thresholds) under Playwright's mocked clock, so a delay boundary is
 * pinned to the exact millisecond instead of raced against real wall time.
 *
 * Clock lifecycle (proven on the Tooltip pilot):
 *   - `install()` ONCE before the panel loop. It registers a context init-script
 *     that re-applies on every navigation, and it leaves the clock RUNNING.
 *   - Each panel loads + becomes ready under the RUNNING clock:
 *     `waitForComparisonRouteReady` awaits real `requestAnimationFrame`s, which a
 *     frozen clock would deadlock.
 *   - AFTER readiness, `pauseAt(now + freezeOffset)` advances a hair (draining any
 *     mount/settle timer) then FREEZES the clock, so every later `runFor` advances
 *     by exact ticks and fires only the timers our own gestures schedule.
 *   - The timeline drives real gestures (which schedule timers at the frozen
 *     instant), `runFor` fires them at boundaries, and each checkpoint records the
 *     `probe` signal.
 *   - `resume()` before the loop moves to the next panel, so its readiness rAFs can
 *     fire.
 *
 * The probe reads the LOGICAL timing state, never DOM presence: react-aria's
 * overlays linger in the DOM through a CSS exit transition, and a frozen clock
 * suspends that transition so the element never unmounts — a D2 (motion) artifact
 * that would mask the timing signal. The per-panel timelines are pair-diffed
 * (port == upstream). Runs the first scenario theme only (timing is
 * theme-independent) and the first (canonical) case unless `cases` lists others.
 */

const defaultFreezeOffsetMs = 50;
const probeSettleMs = 20;
const probeSettleTries = 8;

/**
 * Reads the probe under the FROZEN clock, settling in REAL time until two
 * consecutive reads agree. `page.waitForTimeout` runs on the Node side and does
 * NOT consume the page's mocked clock, so this drains a framework's async render
 * flush (React commits state via a MessageChannel the fake clock does not fake)
 * WITHOUT firing any page timer. Because the clock is frozen, the logical state
 * cannot change mid-settle — the settle can only absorb flush latency, never mask
 * a timing divergence.
 */
async function stabilizedProbe(page: Page, read: () => Promise<string>): Promise<string> {
  let prev = await read();
  for (let i = 0; i < probeSettleTries; i++) {
    await page.waitForTimeout(probeSettleMs);
    const next = await read();
    if (next === prev) {
      return next;
    }
    prev = next;
  }
  return prev;
}

export function registerTimingDriver(scenario: DriverScenario) {
  const config = scenario.timing;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no timing (D11) config`);
  }
  const freezeOffsetMs = config.freezeOffsetMs ?? defaultFreezeOffsetMs;

  test.describe(`D11 timing — ${scenario.title}`, () => {
    for (const caseDef of driverCases(scenario, config.cases)) {
      for (const timeline of config.timelines) {
        const caseTitle = `${caseDef.id} · ${timeline.id}`;
        test(caseTitle, async ({ page }) => {
          const divergence = config.knownDivergences?.[caseTitle];
          if (divergence) {
            test.fixme(true, divergence);
          }
          test.setTimeout(120_000);
          const theme = scenarioThemes(scenario, caseDef)[0];

          // Install once; the init-script re-applies on each panel's navigation.
          await page.clock.install();

          const timelines: Partial<Record<PanelFramework, string[]>> = {};
          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const target = (timeline.target ?? scenario.target)(ctx);
            await expect(target).toBeVisible();
            const timingCtx: TimingContext = { ...ctx, target };

            // Freeze at a clean instant AFTER readiness. `pauseAt` runs the clock
            // up to `now + freezeOffset` (draining mount timers) then holds it.
            const base = await ctx.page.evaluate(() => Date.now());
            await ctx.page.clock.pauseAt(new Date(base + freezeOffsetMs));

            const line: string[] = [];
            for (const step of timeline.steps) {
              if (step.act) {
                await step.act(timingCtx);
              }
              if (step.advanceMs) {
                await ctx.page.clock.runFor(step.advanceMs);
              }
              const value = await stabilizedProbe(ctx.page, () => config.probe(timingCtx));
              line.push(`${step.label}=${value}`);
            }
            timelines[ctx.framework] = line;

            // Un-freeze before the next panel navigates, so its readiness rAFs fire.
            await ctx.page.clock.resume();
          });

          expect(JSON.stringify(timelines.solid, null, 2)).toBe(
            JSON.stringify(timelines.react, null, 2),
          );
        });
      }
    }
  });
}
