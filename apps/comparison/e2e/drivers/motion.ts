import { writeFile } from "node:fs/promises";
import { expect, test, type Locator } from "@playwright/test";
import {
  defaultMotionScopes,
  installOracle,
  seekAnimations,
  snapshotAnimations,
  startAnimationFreezer,
  stopAnimationFreezer,
  type OracleAnimationSnapshot,
} from "./dom-oracle";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type MotionTrigger,
  type PanelFramework,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";
import { compareScreenshots, type ScreenshotDiffThreshold } from "../visual-diff";

/**
 * Driver D2 — motion (recertification.md Phase 1).
 *
 * The animation tier the steady-state drivers (D1 styles, D3 pixels) cannot
 * see: every screenshot spec passes `animations: "disabled"`, so enter/exit
 * transitions and running keyframe animations are invisible to them. D2 drives
 * a scripted interaction that triggers motion on both stacks and diffs it.
 *
 * - **D2b metadata (the gate).** For every in-scope animation the freezer
 *   catches: kind, transition property, computed timing (duration, delay,
 *   easing, iterations, direction, fill) and `effect.getKeyframes()` — diffed
 *   as JSON. This is the exact assertion. It is robust (no pixels, no subpixel
 *   phase) and catches token-level drift: a wrong duration, a dropped
 *   transition, a missing enter animation all fail here. The CSS `@keyframes`
 *   name is a hashed style-macro output that differs between stacks and is
 *   deliberately never captured; the computed keyframe VALUES are, and faithful
 *   motion tokens produce identical values in the same Chromium.
 * - **D2d reduced motion (the gate).** The identical capture re-runs under
 *   `reducedMotion: "reduce"`; both stacks must drop or keep the same motion.
 *   This pins parity in both directions — a reduced-motion override present in
 *   one stack but not the other fails here.
 * - **D2a filmstrip (diagnostic, `MOTION_FILMSTRIP=1`).** Seeks the frozen
 *   motion to f ∈ {0, ¼, ½, ¾, 1} and screenshots both stacks per frame. The
 *   two panels sit at different viewport positions, so live-element shots
 *   rasterize at different subpixel phase and a clone cannot carry running
 *   WAAPI state (see `clonedElementScreenshot`); the frame diff therefore uses
 *   a documented subpixel-tolerant threshold and is a trajectory check, not the
 *   gate — metadata is the exact contract. Frames land in `test-results/`.
 * - **D2c video (review, opt-in).** `MOTION_REVIEW=1` records every motion spec
 *   (`video: "on"`, set in playwright.config.ts — a describe-level `video`
 *   override would force a new worker) for a human side-by-side pass. Off by
 *   default; never committed.
 *
 * Capture flow per panel: install the oracle, start the freezer, run the
 * trigger (which mounts the overlay / selects the tab / toggles pending), let
 * the freezer catch and pause the motion, then snapshot. Portal overlays
 * capture from the `overlay` scope only so the trigger control's own press
 * transitions never leak into the comparison.
 */

const defaultFreezeSettleMs = 180;
const defaultFrames = [0, 0.25, 0.5, 0.75, 1] as const;

// Trajectory-level tolerance for the filmstrip diagnostic. The two panels
// paint at different subpixel phase, so a handful of edge pixels differ per
// frame even when the motion is identical; this catches gross divergence (an
// element in a wholly different mid-flight position), not antialiasing noise.
const filmstripThreshold: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.02,
  maxDimensionDelta: 4,
  pixelThreshold: 40,
};

async function captureMotion(
  scenario: DriverScenario,
  trigger: MotionTrigger,
  caseDef: ReturnType<typeof driverCases>[number],
  page: import("@playwright/test").Page,
  frames: readonly number[],
  filmstrip: boolean,
): Promise<Record<PanelFramework, OracleAnimationSnapshot[]>> {
  const scopes = trigger.scopes ?? defaultMotionScopes;
  const theme = scenarioThemes(scenario, caseDef)[0];
  const snaps: Partial<Record<PanelFramework, OracleAnimationSnapshot[]>> = {};

  await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
    const target = scenario.target(ctx);
    await installOracle(ctx.page, ctx.canvas);
    await startAnimationFreezer(ctx.page);
    await trigger.run({ ...ctx, target });
    await ctx.page.waitForTimeout(trigger.settleMs ?? defaultFreezeSettleMs);

    snaps[ctx.framework] = await snapshotAnimations(ctx.page, scopes);

    if (filmstrip) {
      const filmTarget =
        trigger.filmstripTarget?.(ctx) ?? scenario.pixelTarget?.(ctx) ?? ctx.canvas;
      for (const fraction of frames) {
        await seekAnimations(ctx.page, fraction, scopes);
        await ctx.page.waitForTimeout(30);
        const shot = await filmstripShot(filmTarget);
        const path = test
          .info()
          .outputPath(`${caseDef.id}-${trigger.id}-${ctx.framework}-f${fraction}.png`);
        await writeFile(path, shot);
        await test
          .info()
          .attach(`${trigger.id} · ${ctx.framework} · f=${fraction}`, {
            path,
            contentType: "image/png",
          });
      }
    }

    await stopAnimationFreezer(ctx.page);
    await trigger.cleanup?.({ ...ctx, target });
  });

  return snaps as Record<PanelFramework, OracleAnimationSnapshot[]>;
}

// The filmstrip shot must keep the seeked (paused) animation visible, so it
// cannot pass `animations: "disabled"` — that would fast-forward the CSS
// transition to its end and disable it, defeating the seek. The animation is
// paused via the WAAPI, so the live paint is stable without disabling.
async function filmstripShot(target: Locator): Promise<Buffer> {
  return target.screenshot({ animations: "allow" });
}

export function registerMotionDriver(scenario: DriverScenario) {
  const config = scenario.motion;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no motion (D2) config`);
  }
  const frames = config.frames ?? defaultFrames;
  const filmstrip = Boolean(process.env.MOTION_FILMSTRIP);
  const cases = driverCases(scenario, config.cases);

  const runMetadata = (label: string) => {
    test.describe(`${label} — ${scenario.title}`, () => {
      for (const caseDef of cases) {
        for (const trigger of config.triggers) {
          test(`${caseDef.id} · ${trigger.id}`, async ({ page }) => {
            if (trigger.knownDivergence) {
              test.fixme(true, trigger.knownDivergence);
            }
            test.setTimeout(150_000);
            const snaps = await captureMotion(
              scenario,
              trigger,
              caseDef,
              page,
              frames,
              filmstrip,
            );
            expect(JSON.stringify(snaps.solid, null, 2)).toBe(
              JSON.stringify(snaps.react, null, 2),
            );
          });
        }
      }
    });
  };

  // D2b: motion metadata is the exact pair-oracle contract.
  runMetadata("D2 motion");

  // D2d: the same contract must hold under reduced motion. Reduced motion is
  // emulated on the page (the suite convention — see accordion/actionmenu
  // visual specs) rather than a describe-level `test.use`, so it persists
  // across the per-panel navigations the walk performs.
  test.describe(`D2 motion (reduced) — ${scenario.title}`, () => {
    for (const caseDef of cases) {
      for (const trigger of config.triggers) {
        test(`${caseDef.id} · ${trigger.id}`, async ({ page }) => {
          if (trigger.knownDivergence) {
            test.fixme(true, trigger.knownDivergence);
          }
          test.setTimeout(150_000);
          await page.emulateMedia({ reducedMotion: "reduce" });
          const snaps = await captureMotion(scenario, trigger, caseDef, page, frames, false);
          expect(JSON.stringify(snaps.solid, null, 2)).toBe(
            JSON.stringify(snaps.react, null, 2),
          );
        });
      }
    }
  });

  // D2a: the filmstrip diagnostic diffs frozen frames when opted in. Kept off
  // the gate (metadata is the exact assertion); trajectory-level only.
  if (filmstrip) {
    test.describe(`D2 motion filmstrip — ${scenario.title}`, () => {
      for (const caseDef of cases) {
        for (const trigger of config.triggers) {
          const scopes = trigger.scopes ?? defaultMotionScopes;
          test(`${caseDef.id} · ${trigger.id}`, async ({ page }) => {
            test.setTimeout(180_000);
            const theme = scenarioThemes(scenario, caseDef)[0];
            const shots: Record<PanelFramework, Map<number, Buffer>> = {
              react: new Map(),
              solid: new Map(),
            };
            await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
              const target = scenario.target(ctx);
              await installOracle(ctx.page, ctx.canvas);
              await startAnimationFreezer(ctx.page);
              await trigger.run({ ...ctx, target });
              await ctx.page.waitForTimeout(trigger.settleMs ?? defaultFreezeSettleMs);
              const filmTarget =
                trigger.filmstripTarget?.(ctx) ??
                scenario.pixelTarget?.(ctx) ??
                ctx.canvas;
              for (const fraction of frames) {
                await seekAnimations(ctx.page, fraction, scopes);
                await ctx.page.waitForTimeout(30);
                shots[ctx.framework].set(fraction, await filmstripShot(filmTarget));
              }
              await stopAnimationFreezer(ctx.page);
              await trigger.cleanup?.({ ...ctx, target });
            });
            for (const [fraction, reactPng] of shots.react) {
              const solidPng = shots.solid.get(fraction);
              expect(solidPng, `no solid frame for f=${fraction}`).toBeTruthy();
              await compareScreenshots(
                page,
                reactPng,
                solidPng!,
                `${scenario.slug} · ${trigger.id} · f=${fraction}`,
                filmstripThreshold,
              );
            }
          });
        }
      }
    });
  }
}
