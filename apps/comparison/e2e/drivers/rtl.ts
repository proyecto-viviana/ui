import { expect, test } from "@playwright/test";
import { installOracle, snapshotFocus, type OracleFocusSnapshot } from "./dom-oracle";
import { capturePartStyles, resolveStyleAllowlist, type PartStyles } from "./state-matrix";
import {
  driverCases,
  scenarioThemes,
  type DriverCase,
  type DriverScenario,
  type GestureStateId,
  type PanelFramework,
} from "./scenario";
import { forEachScenarioPanel, walkScenario } from "./walk";

/**
 * Driver D10 — RTL / i18n (recertification.md Phase 1).
 *
 * Re-runs D1 (state-matrix) and D5 (focus trail) — the exact capture
 * functions those drivers use, see `state-matrix.ts` / `focus.ts` — routed
 * through an RTL Arabic locale (`ar-AE`, the doc's pinned D10 locale) instead
 * of a new context option: RTL is an *application-level* concern (the S2
 * `Provider` computes `dir="rtl"` from its `locale` prop via
 * `@react-aria/i18n`'s locale data), not a Playwright browser-context/media
 * emulation, so it is threaded the same way every other locale-routed
 * scenario in this app already works — a `locale` query param
 * (`buttonDemoLocaleFromWindow` et al.) read once at mount and passed to the
 * stack's `Provider`. `rtlCase` merges `locale: "ar-AE"` into a scenario's
 * existing case params, so no certified spec needs its own RTL case entries.
 *
 * Two pair-oracle halves:
 * - **RTL state matrix.** Same allowlist as D1, plus `direction`, so a
 *   mirrored icon rotation / flipped padding-or-margin swap / any RTL-only
 *   style divergence between the two stacks shows up as a plain string
 *   mismatch. A sanity assertion pins `direction: "rtl"` on the default state
 *   so a component/fixture that hasn't wired the `locale` param yet fails
 *   loudly (still LTR) instead of silently diffing two identical LTR captures.
 * - **RTL focus trail.** Re-runs a scenario's configured D5 walks verbatim
 *   under the same RTL locale — arrow-key direction inversion (where a
 *   component supports it) must produce the identical trail on both stacks;
 *   any divergence in how one stack flips vs. the other fails here.
 *
 * A scenario without a `focus` (D5) config skips the focus-trail half rather
 * than throwing, since not every march unit has D5 wired yet.
 */

const rtlLocale = "ar-AE";
const rtlProperty = "direction";
const axSettleMs = 120;

function rtlCase(caseDef: DriverCase): DriverCase {
  return {
    ...caseDef,
    id: `${caseDef.id}-rtl`,
    params: { ...caseDef.params, locale: rtlLocale },
  };
}

export interface RtlConfig {
  /** Case ids re-run under RTL; defaults to the scenario's first case (matches D4/D5). */
  cases?: readonly string[];
  /** Case ids re-run for the focus-trail half; defaults to `cases`. */
  focusCases?: readonly string[];
  /**
   * Skip the RTL state-matrix (paint) half and re-run only the focus trail.
   * For scenarios with no styled paint oracle — e.g. ActionGroup, whose S2
   * component was removed so its React reference is unstyled react-aria hooks:
   * a full computed-style diff of a styled Solid stack against an unstyled
   * reference can never match and is not a meaningful oracle. The focus-trail
   * half still asserts `direction: "rtl"`, so the "RTL actually applied" sanity
   * check is preserved.
   */
  focusOnly?: boolean;
}

interface FocusTrailEntry {
  after: string;
  snapshot: OracleFocusSnapshot;
}

export function registerRtlDriver(scenario: DriverScenario, config: RtlConfig = {}) {
  const properties = Array.from(new Set([...resolveStyleAllowlist(scenario), rtlProperty]));
  const styleCases = driverCases(scenario, config.cases).map(rtlCase);

  if (!config.focusOnly) {
    test.describe(`D10 RTL state matrix — ${scenario.title}`, () => {
      for (const caseDef of styleCases) {
        for (const theme of scenarioThemes(scenario, caseDef)) {
          test(`${caseDef.id} · ${theme}`, async ({ page }) => {
            test.setTimeout(120_000);

            const captures: Record<PanelFramework, Map<GestureStateId, PartStyles>> = {
              react: new Map(),
              solid: new Map(),
            };

            await walkScenario(page, scenario, caseDef, theme, async (step) => {
              captures[step.framework].set(step.state, await capturePartStyles(step, properties));
            });

            for (const framework of ["react", "solid"] as const) {
              const defaultCapture = captures[framework].get("default");
              expect(
                defaultCapture?.target[rtlProperty],
                `${framework} panel did not render RTL — locale=${rtlLocale} routing is missing for "${scenario.slug}"`,
              ).toBe("rtl");
            }

            for (const [state, reactParts] of captures.react) {
              const solidParts = captures.solid.get(state);
              expect(
                solidParts,
                `solid panel produced no capture for state "${state}"`,
              ).toBeTruthy();
              for (const [part, reactStyles] of Object.entries(reactParts)) {
                expect(
                  solidParts![part],
                  `${scenario.slug} · ${caseDef.id} · ${theme} · ${state} · ${part} (rtl)`,
                ).toEqual(reactStyles);
              }
            }
          });
        }
      }
    });
  }

  const focusConfig = scenario.focus;
  if (!focusConfig) {
    return;
  }

  const focusCases = driverCases(
    scenario,
    config.focusCases ?? config.cases ?? focusConfig.cases,
  ).map(rtlCase);

  test.describe(`D10 RTL focus trail — ${scenario.title}`, () => {
    for (const caseDef of focusCases) {
      for (const walk of focusConfig.walks) {
        test(`${caseDef.id} · ${walk.id}`, async ({ page }) => {
          test.setTimeout(120_000);
          const theme = scenarioThemes(scenario, caseDef)[0];
          const trails: Partial<Record<PanelFramework, FocusTrailEntry[]>> = {};

          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const start = (walk.start ?? scenario.target)(ctx);
            await expect(start).toBeVisible();
            await installOracle(ctx.page, ctx.canvas);

            const root = focusConfig.root ? await focusConfig.root(ctx).elementHandle() : null;

            const direction = await scenario
              .target(ctx)
              .evaluate((el) => getComputedStyle(el).direction);
            expect(
              direction,
              `${ctx.framework} panel did not render RTL — locale=${rtlLocale} routing is missing for "${scenario.slug}"`,
            ).toBe("rtl");

            if ((walk.entry ?? "focus") === "focus") {
              await start.focus();
            }
            await ctx.page.waitForTimeout(axSettleMs);
            const trail: FocusTrailEntry[] = [
              { after: "(start)", snapshot: await snapshotFocus(ctx.page, root) },
            ];
            for (const key of walk.keys) {
              await ctx.page.keyboard.press(key);
              await ctx.page.waitForTimeout(axSettleMs);
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
