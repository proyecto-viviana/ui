import type { Locator, Page } from "@playwright/test";
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
