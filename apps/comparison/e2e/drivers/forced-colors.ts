import { expect, test } from "@playwright/test";
import { capturePartStyles, resolveStyleAllowlist, type PartStyles } from "./state-matrix";
import {
  scenarioThemes,
  steadyStateCases,
  type DriverScenario,
  type GestureStateId,
  type PanelFramework,
} from "./scenario";
import { walkScenario } from "./walk";

/**
 * Driver D9 — forced colors (recertification.md Phase 1).
 *
 * Re-runs the D1 state-matrix capture (`apps/comparison/e2e/drivers/state-matrix.ts`)
 * verbatim — same allowlist, same case × theme × state walk — with
 * `page.emulateMedia({ forcedColors: "active" })` set first. Windows High
 * Contrast / forced-colors mode remaps most authored colors to a small set of
 * OS system-color keywords (`Canvas`, `CanvasText`, `ButtonFace`,
 * `Highlight`, …); Chromium resolves `getComputedStyle` to concrete sRGB for
 * those keywords, so the same equality check D1 uses (identical stack ==
 * identical string) still holds — a component that doesn't respect
 * `forced-colors: active` (or respects it differently on one stack) shows up
 * as a plain string mismatch, same as any other D1 finding.
 *
 * A sanity assertion (`matchMedia("(forced-colors: active)").matches`)
 * guards against the emulation silently not taking effect, matching the
 * convention already used by the ad-hoc forced-colors specs this driver
 * supersedes (e.g. `accordion-visual.spec.ts`, `actionmenu-visual.spec.ts`).
 */

export function registerForcedColorsDriver(scenario: DriverScenario) {
  const properties = resolveStyleAllowlist(scenario);

  test.describe(`D9 forced colors — ${scenario.title}`, () => {
    for (const caseDef of steadyStateCases(scenario)) {
      for (const theme of scenarioThemes(scenario, caseDef)) {
        test(`${caseDef.id} · ${theme}`, async ({ page }) => {
          test.setTimeout(120_000);
          await page.emulateMedia({ forcedColors: "active" });
          await expect(
            page.evaluate(() => matchMedia("(forced-colors: active)").matches),
            "forced-colors emulation did not take effect",
          ).resolves.toBe(true);

          const captures: Record<PanelFramework, Map<GestureStateId, PartStyles>> = {
            react: new Map(),
            solid: new Map(),
          };

          await walkScenario(page, scenario, caseDef, theme, async (step) => {
            captures[step.framework].set(step.state, await capturePartStyles(step, properties));
          });

          for (const [state, reactParts] of captures.react) {
            const solidParts = captures.solid.get(state);
            expect(solidParts, `solid panel produced no capture for state "${state}"`).toBeTruthy();
            for (const [part, reactStyles] of Object.entries(reactParts)) {
              expect(
                solidParts![part],
                `${scenario.slug} · ${caseDef.id} · ${theme} · ${state} · ${part} (forced-colors)`,
              ).toEqual(reactStyles);
            }
          }
        });
      }
    }
  });
}
