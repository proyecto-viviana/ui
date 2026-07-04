import { writeFile } from "node:fs/promises";
import { expect, test, type Locator } from "@playwright/test";
import { clonedElementScreenshot, compareScreenshots, exactPairDiff } from "../visual-diff";
import {
  pixelThresholdFor,
  scenarioThemes,
  steadyStateCases,
  type DriverScenario,
  type GestureStateId,
  type PanelFramework,
} from "./scenario";
import { walkScenario, type WalkStepContext } from "./walk";

/**
 * Driver D3 — strict pixel pair diff (recertification.md Phase 1). Rides the
 * same panel-major walk as D1: screenshots the pixel target in every gesture
 * state on each panel, then diffs React vs Solid per state. Zero tolerance
 * (`exactPairDiff`) unless the scenario carries a waiver, and every waiver
 * must cite a tracked burn-down entry in its reason.
 *
 * Screenshots are taken via `clonedElementScreenshot` — an inert clone shown
 * in the top layer at a fixed integer viewport position, so both panels
 * rasterize at the same subpixel phase, no page stacking context can paint
 * over the shot, and the driven interaction state cannot race a framework
 * re-render — with `animations: "disabled"`. D3 certifies steady states; animated
 * transitions are the motion driver's job (D2).
 */

function pixelTargetFor(step: WalkStepContext): Locator {
  return step.scenario.pixelTarget?.(step) ?? step.canvas;
}

export function registerPixelDriver(scenario: DriverScenario) {
  test.describe(`D3 pixel diff — ${scenario.title}`, () => {
    for (const caseDef of steadyStateCases(scenario)) {
      for (const theme of scenarioThemes(scenario, caseDef)) {
        test(`${caseDef.id} · ${theme}`, async ({ page }) => {
          test.setTimeout(180_000);

          const shots: Record<PanelFramework, Map<GestureStateId, Buffer>> = {
            react: new Map(),
            solid: new Map(),
          };

          await walkScenario(page, scenario, caseDef, theme, async (step) => {
            shots[step.framework].set(
              step.state,
              await clonedElementScreenshot(pixelTargetFor(step)),
            );
          });

          for (const [state, reactPng] of shots.react) {
            const solidPng = shots.solid.get(state);
            expect(
              solidPng,
              `solid panel produced no screenshot for state "${state}"`,
            ).toBeTruthy();
            const label = `${scenario.slug} · ${caseDef.id} · ${theme} · ${state}`;
            const waiver = pixelThresholdFor(scenario, caseDef, state, theme);
            try {
              await compareScreenshots(
                page,
                reactPng,
                solidPng!,
                waiver ? `${label} (waived: ${waiver.reason})` : label,
                waiver?.threshold ?? exactPairDiff,
              );
            } catch (error) {
              // Persist the failing pair so the finding is reviewable from
              // test-results without re-running the walk.
              const reactPath = test.info().outputPath(`${state}-react.png`);
              const solidPath = test.info().outputPath(`${state}-solid.png`);
              await writeFile(reactPath, reactPng);
              await writeFile(solidPath, solidPng!);
              await test.info().attach(`${label} · react`, { path: reactPath, contentType: "image/png" });
              await test.info().attach(`${label} · solid`, { path: solidPath, contentType: "image/png" });
              throw error;
            }
          }
        });
      }
    }
  });
}
