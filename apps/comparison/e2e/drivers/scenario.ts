import type { Locator, Page } from "@playwright/test";
import type { OracleScope } from "./dom-oracle";
import type { ComparisonColorScheme, ScreenshotDiffThreshold } from "../visual-diff";

/**
 * Recertification driver scenario model (recertification.md Phase 1).
 *
 * A scenario describes one component route in pair-oracle terms: which prop
 * cases to load (URL params), which element to measure on each framework
 * panel, which real-input gesture states to drive, and which themes to pin.
 * Drivers (D1 state-matrix styles, D3 strict pixels, ...) consume the same
 * scenario so every driver walks the identical state space.
 */

export type GestureStateId = "default" | "focus-visible" | "hover" | "pressed";

export const allGestureStates: readonly GestureStateId[] = [
  "default",
  "focus-visible",
  "hover",
  "pressed",
];

export type PanelFramework = "react" | "solid";

/** Context handed to target/part resolvers and lifecycle hooks. */
export interface PanelContext {
  page: Page;
  /** The `.comparison-reference-canvas` for this framework panel. */
  canvas: Locator;
  framework: PanelFramework;
}

export type TargetResolver = (ctx: PanelContext) => Locator;

export interface EventGestureContext extends PanelContext {
  /** The resolved gesture target (gesture override or scenario target). */
  target: Locator;
}

/**
 * A scripted input gesture for the D4 event-sequence driver. Gestures use
 * raw coordinates / protocol-level focus (not `locator.click()`) so they run
 * identically against disabled targets, which Playwright's actionability
 * checks would otherwise refuse.
 */
export interface EventGesture {
  /** Stable id used in test titles. */
  id: string;
  /** Element the gesture drives; defaults to the scenario target. */
  target?: TargetResolver;
  run: (ctx: EventGestureContext) => Promise<void>;
  /** Milliseconds to wait after the gesture before collecting the log. */
  settleMs?: number;
}

export interface MotionTriggerContext extends PanelContext {
  /** The resolved scenario target (for triggers that drive it directly). */
  target: Locator;
}

/**
 * A scripted interaction that drives an animation into existence for the D2
 * motion driver: opening an overlay (enter transition), selecting a tab (the
 * indicator slide), toggling a pending state (a spinner). The freezer is
 * already running when `run` fires, so a transient enter transition is caught
 * and paused on its first frame.
 */
export interface MotionTrigger {
  /** Stable id used in test titles. */
  id: string;
  /**
   * Oracle scopes the motion is captured from; defaults to
   * `["panel","overlay"]`. Portal overlays (dialogs) capture from `overlay`
   * only so the trigger control's own press transitions never leak in.
   */
  scopes?: readonly OracleScope[];
  run: (ctx: MotionTriggerContext) => Promise<void>;
  /** Undoes `run` (close the overlay, reset the state) before the next panel. */
  cleanup?: (ctx: MotionTriggerContext) => Promise<void>;
  /** Milliseconds for the freezer to catch + pause the motion before snapshot. */
  settleMs?: number;
  /** Element screenshot for the filmstrip diagnostic; defaults to `pixelTarget`. */
  filmstripTarget?: TargetResolver;
  /**
   * A documented, tracked port gap that keeps this trigger's exact metadata
   * assertion red. When set, the D2b/D2d metadata tests register as
   * `test.fixme` with this reason (visible in reports, excluded from the
   * pass/fail count) instead of silently passing. Reference the tracked
   * finding so the marker is removed once the port is fixed.
   */
  knownDivergence?: string;
}

/**
 * D2 motion driver config. Metadata (keyframes + computed timing) is the exact
 * pair-oracle assertion; the same capture re-runs under reduced motion. Runs
 * the first scenario theme only — motion tokens are theme-independent.
 */
export interface MotionConfig {
  cases?: readonly string[];
  triggers: readonly MotionTrigger[];
  /** Filmstrip seek fractions (diagnostic); defaults to [0, .25, .5, .75, 1]. */
  frames?: readonly number[];
}

/** A keyboard walk for the D5 focus-trail driver. */
export interface FocusWalk {
  /** Stable id used in test titles. */
  id: string;
  /** Element focused before the walk; defaults to the scenario target. */
  start?: TargetResolver;
  /** Keys pressed in order (Playwright key names); focus is snapshot after each. */
  keys: readonly string[];
}

export interface DriverCase {
  /** Stable id used in test titles and waiver matching. */
  id: string;
  /** URL query params appended to the component route. */
  params?: Record<string, string>;
  /** Gesture states for this case; defaults to the scenario states. */
  states?: readonly GestureStateId[];
  /** Themes for this case; defaults to the scenario themes. */
  themes?: readonly ComparisonColorScheme[];
}

export interface PixelWaiver {
  /** Case id or "*" for any case. */
  caseId: string;
  /** Gesture state or "*" for any state. */
  state: GestureStateId | "*";
  /** Theme or "*" for any theme. */
  theme: ComparisonColorScheme | "*";
  /** Bounded threshold that replaces the strict zero-tolerance diff. */
  threshold: ScreenshotDiffThreshold;
  /** Why exactness is waived; must map to a tracked burn-down entry. */
  reason: string;
}

export interface DriverScenario {
  /** Comparison route slug (`/components/<slug>/`). */
  slug: string;
  /** Display title used in test names. */
  title: string;
  cases: readonly DriverCase[];
  /** Resolves the element whose computed styles are diffed per panel. */
  target: TargetResolver;
  /**
   * Extra named descendants diffed alongside the target under every state
   * (e.g. an icon slot, a selection indicator, a panel).
   */
  parts?: Record<string, TargetResolver>;
  /**
   * Element captured by the pixel driver; defaults to the framework canvas so
   * outside focus rings and overlays inside the canvas are not clipped.
   */
  pixelTarget?: TargetResolver;
  /** Default gesture states; defaults to all four. */
  states?: readonly GestureStateId[];
  /** Default themes; defaults to dark then light. */
  themes?: readonly ComparisonColorScheme[];
  /**
   * Readiness data-attributes awaited on the target after driving a state.
   * Defaults to the React Aria state attributes; set a state to null when the
   * component does not expose that attribute on the measured target.
   */
  stateReadiness?: Partial<Record<GestureStateId, string | null>>;
  /** Milliseconds to allow transitions to settle after a state is driven. */
  settleMs?: number;
  /** Adjust the computed-style allowlist for this scenario. */
  styleProps?: { add?: readonly string[]; remove?: readonly string[] };
  /**
   * Runs once per panel after the route is ready and before any state is
   * driven (e.g. open an overlay from its trigger). Paired with `afterPanel`
   * so the other panel starts from a clean page.
   */
  beforePanel?: (ctx: PanelContext) => Promise<void>;
  afterPanel?: (ctx: PanelContext) => Promise<void>;
  pixel?: { waivers?: readonly PixelWaiver[] };
  /**
   * D4 event-sequence driver config. Interaction logs are theme-independent,
   * so D4 runs the first scenario theme only; `cases` defaults to the first
   * scenario case.
   */
  events?: { cases?: readonly string[]; gestures: readonly EventGesture[] };
  /** D5 focus/keyboard-trail driver config; same case/theme defaults as D4. */
  focus?: { cases?: readonly string[]; walks: readonly FocusWalk[] };
  /** D2 motion driver config; same case/theme defaults as D4/D5. */
  motion?: MotionConfig;
}

export const defaultStateReadiness: Record<GestureStateId, string | null> = {
  default: null,
  "focus-visible": "data-focus-visible",
  hover: "data-hovered",
  pressed: "data-pressed",
};

export const defaultSettleMs = 220;

export function scenarioThemes(
  scenario: DriverScenario,
  caseDef: DriverCase,
): readonly ComparisonColorScheme[] {
  return caseDef.themes ?? scenario.themes ?? (["dark", "light"] as const);
}

export function scenarioStates(
  scenario: DriverScenario,
  caseDef: DriverCase,
): readonly GestureStateId[] {
  return caseDef.states ?? scenario.states ?? allGestureStates;
}

export function scenarioRoute(scenario: DriverScenario, caseDef: DriverCase): string {
  const params = new URLSearchParams(caseDef.params ?? {});
  const query = params.toString();
  return `/components/${scenario.slug}/${query ? `?${query}` : ""}`;
}

/**
 * Resolves the case subset an interaction driver runs: the listed ids, or
 * just the first (canonical) case when none are listed.
 */
export function driverCases(scenario: DriverScenario, ids?: readonly string[]): DriverCase[] {
  if (!ids) {
    return [scenario.cases[0]];
  }
  return ids.map((id) => {
    const caseDef = scenario.cases.find((candidate) => candidate.id === id);
    if (!caseDef) {
      throw new Error(`Unknown case id "${id}" for scenario "${scenario.slug}"`);
    }
    return caseDef;
  });
}

export function readinessAttribute(scenario: DriverScenario, state: GestureStateId): string | null {
  const override = scenario.stateReadiness?.[state];
  return override === undefined ? defaultStateReadiness[state] : override;
}

export function pixelThresholdFor(
  scenario: DriverScenario,
  caseDef: DriverCase,
  state: GestureStateId,
  theme: ComparisonColorScheme,
): { threshold: ScreenshotDiffThreshold; reason: string } | null {
  for (const waiver of scenario.pixel?.waivers ?? []) {
    const caseMatches = waiver.caseId === "*" || waiver.caseId === caseDef.id;
    const stateMatches = waiver.state === "*" || waiver.state === state;
    const themeMatches = waiver.theme === "*" || waiver.theme === theme;
    if (caseMatches && stateMatches && themeMatches) {
      return { threshold: waiver.threshold, reason: waiver.reason };
    }
  }
  return null;
}
