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

/**
 * A scripted interaction the D6 driver expects to emit a screen-reader
 * announcement (a ComboBox result count, a Toast, a form-validation error).
 * The live-region transcript captured during `run` on each panel is diffed.
 */
export interface AxAnnounceTrigger {
  /** Stable id used in test titles. */
  id: string;
  run: (ctx: MotionTriggerContext) => Promise<void>;
  /**
   * Milliseconds to wait for the announcement to land. The live announcer is
   * created lazily with a 100ms first-announce delay, so keep this generous
   * (defaults to 500).
   */
  settleMs?: number;
  /**
   * A documented, tracked port gap that keeps this announcement red; registers
   * the test as `test.fixme` (visible in reports, excluded from pass/fail)
   * instead of silently passing. See `MotionTrigger.knownDivergence`.
   */
  knownDivergence?: string;
}

/**
 * D6 AX-tree + announcements driver config. The AX tree (roles/names/states via
 * `ariaSnapshot` + an accessible-description pass) is the resting-structure
 * assertion; `announce` triggers exercise the live-region transcript. Runs the
 * first scenario theme only — semantics are theme-independent.
 */
export interface AxConfig {
  cases?: readonly string[];
  /**
   * Elements whose AX subtree is snapshotted, keyed by a stable label; defaults
   * to the panel canvas. Overlay components point a root at their portal (e.g.
   * `page.getByRole("dialog")`) since the portal renders outside the canvas.
   */
  roots?: Record<string, TargetResolver>;
  /** Scripted interactions expected to emit live-region announcements. */
  announce?: readonly AxAnnounceTrigger[];
  /**
   * Case ids whose AX-tree assertion is a documented, tracked port gap, mapped
   * to the reason. Registers that case as `test.fixme` (visible in reports,
   * excluded from pass/fail) instead of silently passing — the same mechanism
   * as `MotionTrigger.knownDivergence`. Reference the tracked finding so the
   * marker is removed once the port is fixed.
   */
  knownDivergences?: Record<string, string>;
}

/**
 * D7 contrast driver config. Every text node's foreground/effective-background
 * contrast ratio is captured per D1 gesture state × theme and pair-diffed
 * (port == upstream). The WCAG AA floor (and AAA target) is computed and
 * reported per stack — the parity rule forbids diverging from upstream, so a
 * ratio that falls below AA in *both* stacks is a reported upstream note, not a
 * port defect (a port-only drop is already caught by the pair diff). The
 * absolute AA assertion is reserved for Tier-6 custom surfaces (no upstream
 * pair), enabled via `assertAA`.
 */
export interface ContrastConfig {
  cases?: readonly string[];
  /** Subtree whose text nodes are measured; defaults to `pixelTarget ?? canvas`. */
  root?: TargetResolver;
  /** Hard-fail on any sub-AA node (Tier-6 custom surfaces with no oracle). */
  assertAA?: boolean;
}

/**
 * D8 target-size driver config. Every interactive element's border-box is
 * captured across the scenario's size cases and pair-diffed (port == upstream).
 * The WCAG 2.5.8 (24px) floor and 2.5.5 (44px) target are reported per stack
 * for the same parity reason as D7; `assert24` makes the 24px floor a hard
 * assertion for Tier-6 custom surfaces. Theme/state-independent, so it runs the
 * first theme at the default state only.
 */
export interface TargetSizeConfig {
  cases?: readonly string[];
  /** Subtree whose interactive elements are measured; defaults to `pixelTarget ?? canvas`. */
  root?: TargetResolver;
  /** Hard-fail on any sub-24px target (Tier-6 custom surfaces with no oracle). */
  assert24?: boolean;
}

/** A keyboard walk for the D5 focus-trail driver. */
export interface FocusWalk {
  /** Stable id used in test titles. */
  id: string;
  /** Element focused before the walk; defaults to the scenario target. */
  start?: TargetResolver;
  /**
   * How focus enters the walk. Default `"focus"` calls `start.focus()`
   * (programmatic) — correct for a static widget whose focusable target is
   * unambiguous. `"keyboard"` SKIPS the programmatic focus and lets the walk
   * keys drive focus from wherever the scenario's `beforePanel` left it — the
   * faithful entry for an auto-focusing overlay (e.g. an OPEN menu, whose
   * `FocusScope autoFocus` already holds focus). Programmatic `.focus()` on an
   * auto-advancing collection item seeds the collection's `focusedKey`
   * differently across React and Solid, so `"focus"` fabricates an entry-order
   * divergence there; `"keyboard"` exercises the real keyboard path both stacks
   * share. `start` is still used only for the pre-walk visibility gate.
   */
  entry?: "focus" | "keyboard";
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
  /**
   * Whether this case is a steady state the style/pixel drivers (D1/D3) may
   * capture. Defaults to true. Set false for a case whose rendered output is
   * non-deterministic in wall-clock time — e.g. an ActionButton `isPending`
   * spinner that only mounts after a 1s delay, so the two panels' captures
   * could straddle the 1s boundary and disagree. Such a case is still exercised
   * by the interaction drivers (D4 press suppression, D6 pre-spinner aria state)
   * that reference it explicitly and capture at a deterministic moment.
   */
  steadyState?: boolean;
}

/** Cases the steady-state capture drivers (D1/D3) may screenshot/measure. */
export function steadyStateCases(scenario: DriverScenario): DriverCase[] {
  return scenario.cases.filter((caseDef) => caseDef.steadyState !== false);
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
   *
   * `knownDivergences` maps a `${caseId} · ${gestureId}` test title to a
   * documented, tracked port gap that keeps that one event log red. It registers
   * the test as `test.fixme` (visible in reports, excluded from pass/fail)
   * instead of silently passing — the same mechanism as
   * `AxConfig.knownDivergences`. Keyed per case+gesture (not on the shared
   * gesture object) so a divergence in one scenario never masks the same gesture
   * elsewhere. Reference the tracked finding so the marker is removed once the
   * port is fixed.
   */
  events?: {
    cases?: readonly string[];
    gestures: readonly EventGesture[];
    knownDivergences?: Record<string, string>;
  };
  /**
   * D5 focus/keyboard-trail driver config; same case/theme defaults as D4.
   * `root` (optional, mirrors `contrast.root`/`ax.root`) scopes the roving-tabindex
   * snapshot to a subtree so an overlay composite's deferred surface chrome (e.g.
   * Menu's hand-rolled popover `role="dialog"` + Dismiss button) does not leak into
   * the certified element's focus trail.
   */
  focus?: { cases?: readonly string[]; walks: readonly FocusWalk[]; root?: TargetResolver };
  /** D2 motion driver config; same case/theme defaults as D4/D5. */
  motion?: MotionConfig;
  /** D6 AX-tree + announcements driver config; runs the first theme only. */
  ax?: AxConfig;
  /** D7 contrast driver config; runs all scenario states × themes like D1. */
  contrast?: ContrastConfig;
  /** D8 target-size driver config; runs the first theme at default state. */
  targetSize?: TargetSizeConfig;
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
