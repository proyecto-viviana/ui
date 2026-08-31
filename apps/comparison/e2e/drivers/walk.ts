import { expect, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, styledSection, waitForComparisonRouteReady } from "../comparison-page";
import { clearPointer, pinComparisonTheme, type ComparisonColorScheme } from "../visual-diff";
import {
  allGestureStates,
  defaultSettleMs,
  readinessAttribute,
  scenarioFrameworks,
  scenarioRoute,
  scenarioStates,
  type DriverCase,
  type DriverScenario,
  type GestureStateId,
  type PanelContext,
} from "./scenario";

/**
 * Shared walk engine for the pair-oracle drivers (see `.claude/current/certification.md`).
 *
 * Walks one scenario case through both framework panels, driving each gesture
 * state with real inputs and invoking `collect` once per (panel, state) so a
 * driver can capture whatever evidence it diffs (computed styles, pixels,
 * event logs, AX snapshots).
 *
 * The walk is panel-major with a fresh page load per panel: React Aria's
 * input modality resets on navigation, so focus-visible is driven identically
 * for both panels, and one panel's overlays or lingering hover can never leak
 * into the other's captures. States run in canonical order — focus-visible
 * before any mouse.down, because a pointerdown flips the modality to pointer
 * for the rest of the page's life and would mask the focus ring.
 */

export interface WalkStepContext extends PanelContext {
  scenario: DriverScenario;
  caseDef: DriverCase;
  theme: ComparisonColorScheme;
  state: GestureStateId;
  target: Locator;
}

const frameworkLabels = {
  react: "React Spectrum stack",
  solid: "Solidaria stack",
} as const;

async function applyGestureState(
  ctx: PanelContext,
  target: Locator,
  state: GestureStateId,
  scenario: DriverScenario,
) {
  switch (state) {
    case "default":
      break;
    case "focus-visible":
      await target.focus();
      break;
    case "hover":
      await target.hover();
      break;
    case "pressed":
      await target.hover();
      await ctx.page.mouse.down();
      break;
  }
  const attribute = readinessAttribute(scenario, state);
  if (attribute) {
    await expect(target).toHaveAttribute(attribute, "true");
  }
}

async function resetGestureState(ctx: PanelContext, target: Locator, state: GestureStateId) {
  switch (state) {
    case "default":
      break;
    case "focus-visible":
      await target.evaluate((element) => (element as HTMLElement).blur());
      break;
    case "hover":
      await clearPointer(ctx.page);
      break;
    case "pressed":
      await ctx.page.mouse.up();
      await clearPointer(ctx.page);
      break;
  }
}

/**
 * The shared per-panel skeleton: pin theme → load the case route fresh →
 * neutralize the pointer → resolve the framework canvas → beforePanel →
 * `visit` → afterPanel, for React then Solid. Interaction drivers (D4/D5)
 * use it directly; `walkScenario` layers the gesture-state loop on top.
 */
export async function forEachScenarioPanel(
  page: Page,
  scenario: DriverScenario,
  caseDef: DriverCase,
  theme: ComparisonColorScheme,
  visit: (ctx: PanelContext) => Promise<void>,
) {
  const frameworks = scenarioFrameworks(scenario);
  for (const framework of frameworks) {
    await pinComparisonTheme(page, theme);
    await page.goto(scenarioRoute(scenario, caseDef));
    await waitForComparisonRouteReady(page, frameworks);
    await clearPointer(page);

    const section = await styledSection(page);
    const canvas = await frameworkCanvas(section, frameworkLabels[framework]);
    const ctx: PanelContext = { page, canvas, framework };

    await scenario.beforePanel?.(ctx);
    await visit(ctx);
    await scenario.afterPanel?.(ctx);
  }
}

export async function walkScenario(
  page: Page,
  scenario: DriverScenario,
  caseDef: DriverCase,
  theme: ComparisonColorScheme,
  collect: (step: WalkStepContext) => Promise<void>,
) {
  const requested = new Set(scenarioStates(scenario, caseDef));
  const states = allGestureStates.filter((state) => requested.has(state));
  const settle = scenario.settleMs ?? defaultSettleMs;

  await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
    const target = scenario.target(ctx);
    await expect(target).toBeVisible();

    for (const state of states) {
      await applyGestureState(ctx, target, state, scenario);
      await page.waitForTimeout(settle);
      await collect({ ...ctx, scenario, caseDef, theme, state, target });
      await resetGestureState(ctx, target, state);
    }
  });
}
