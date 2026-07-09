import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4): StepList.
 *
 * SCOPING — why the oracle is the react-aria HOOKS, not S2 or RAC. React
 * Spectrum S2 1.5.x ships NO StepList and react-aria-components exposes no
 * StepList *component* either. The only surviving upstream is the pinned
 * react-aria (3.50.0) `useStepList` / `useStepListItem` HOOKS plus react-stately
 * (3.48.0) `useStepListState` — the direct source of our `createStepList` /
 * `createStep` / `createStepListState` port. So the React panel here is those
 * hooks hand-wired exactly as the vendored `@adobe/react-spectrum` StepList /
 * StepListItem wire them (see `react/fixtures/styled.js` `ReactStepListBody`),
 * and the pair diff certifies the port against its real upstream ("no S2
 * component" ≠ "no oracle" — the ActionGroup precedent). This is a BEHAVIOR cert
 * (D5 focus + D6 AX); paint is scoped out (see below).
 *
 * WHAT THIS CERTIFIES — the selectability + naming contract of the three hooks,
 * entry for entry:
 *   1. Selectability model (the crux). A step is selectable — and therefore
 *      tabbable (`useStepListItem` tabIndex `!isDisabled ? 0 : undefined`,
 *      `isDisabled = !state.isSelectable(key)`) — iff it is COMPLETED, is the
 *      FIRST step, or its PREVIOUS step is completed
 *      (`useStepListState.isSelectable = isCompleted(step) || isCompleted(prev)
 *      || step === firstKey`). There is NO "step after the currently SELECTED
 *      step" clause: a fresh list exposes only step 1, and the immediate-next
 *      step opens when its predecessor is *completed*, not merely selected. The
 *      port had invented that extra clause (`prevKey === selectedKey()`); the D5
 *      `(start)` roving snapshot — taken before any Tab — pins the difference
 *      the browser catches (in the `default` case the port made step 2 tabbable;
 *      upstream leaves only step 1).
 *   2. Native-Tab focus order (D5). StepList nav is browser-native Tab across the
 *      selectable steps (`useStepList` wraps `useSelectableList` with
 *      `allowsTabNavigation: true`, so Tab escapes rather than roving), with the
 *      list container itself never tabbable (`tabIndex: undefined`). The walks
 *      Tab in from a boundary button and out the far side, so the exact set and
 *      order of tabbable steps pair-diffs.
 *   3. State semantics (D6). `role="link"`, `aria-current="step"` on the selected
 *      step, `aria-disabled` on every non-selectable step; the accessible name is
 *      composed via `aria-labelledby` from a marker (step number), a
 *      visually-hidden state prefix ("Current: " / "Completed: " / "Not
 *      completed: "), and the label — mirroring `@adobe/react-spectrum`
 *      StepListItem. The port had invented a flat `aria-label` ("Step 1: …, …")
 *      on the anchor; the D6 name diff pins the composed-name contract.
 *
 * jsdom can only observe the tabIndex proxy; the REAL native-Tab
 * `document.activeElement` order and the computed accessible name are
 * browser-only, so these e2e trails are the artifact that pins the behavior
 * against the hook oracle.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux. `default` (fresh — only step 1 selectable) and
 *     `progress` (step 2 completed, step 3 selected — steps 1-3 selectable) each
 *     entered via a Tab trampoline from the Before button and walked out through
 *     the After button, so the at-rest tabbable set + native-Tab order pair-diff.
 *   - D6 (AX tree) — the list subtree roles/names/states across all four cases
 *     (`default` / `progress` / `disabled` / `readonly`).
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — there
 *     is no styled S2 StepList oracle to pixel-diff against (S2 ships no
 *     component). The styled Solid layer is verified for self-containment, not
 *     pixel-diffed against a missing oracle.
 *   - D2 (motion) — no enter/exit animation.
 *   - D4 (events) — the press/selection event model is exercised through the
 *     shared selection-manager / interaction-hook family, per the hook-family
 *     rule; StepList selection is a click/Enter/Space delegate over it.
 *   - D9 (forced colors) — a paint concern, moot without a styled oracle.
 *   - D10 (RTL) — StepList navigation is native-Tab + vertical; it has no
 *     RTL-flipped arrow axis. The only localized surface is the container's
 *     DEFAULT `aria-label` ("Step List"), which both fixtures bypass with a fixed
 *     label, so there is nothing RTL-specific to diff. Localized state-prefix
 *     naming is tracked as tech-debt, not certified here.
 *   - Container Home/End/typeahead (`useSelectableList` under `allowsTabNavigation`)
 *     — the port's `createStepListState` is hand-rolled (no selection-manager /
 *     collection), so it wires no container key nav; the walks press only Tab, the
 *     documented StepList interaction (the vendored @adobe/react-spectrum StepList
 *     tests exercise Tab + Enter only). Porting container key-nav is a state-layer
 *     rewrite deferred as tech-debt.
 *
 * FIXTURE (`steplist-demo.ts`) — a `Before` button, a StepList labelled "Checkout
 * steps" with four steps (Details / Select offers / Fallback offer / Summary),
 * and an `After` button. `defaultSelectedKey`, `defaultLastCompletedStep`,
 * `disabledKeys`, `isDisabled`, and `isReadOnly` are prop-driven; the boundary
 * buttons let the walk cross the list's tab boundary so native-Tab entry/exit is
 * exercised faithfully. Cases keep `selectedIdx === lastCompleted + 1` so the
 * upstream auto-complete effect never fires and the resting state is stable.
 */

/** The StepList root (`<ol>`) in THIS panel's canvas, resolved by the stable
 *  control-root marker both stacks stamp on the list element. */
const list: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="steplist"]');

/** The boundary button BEFORE the list in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/**
 * Main scenario. `default` fresh state exposes ONLY step 1 (the invented
 * "prev===selected" clause the port drops would have exposed step 2). D6 runs
 * across all four cases; the D5 `default` walk Tabs in (→ step 1) and straight
 * out to After, pinning the single-tabbable-step at-rest layout.
 */
const scenario: DriverScenario = {
  slug: "steplist",
  title: "StepList",
  target: list,
  states: ["default"],
  cases: [
    { id: "default", params: {} },
    {
      id: "progress",
      params: { defaultSelectedKey: "fallback-offer", defaultLastCompletedStep: "select-offers" },
    },
    {
      id: "disabled",
      params: { defaultSelectedKey: "select-offers", isDisabled: "true" },
    },
    {
      id: "readonly",
      params: {
        defaultSelectedKey: "select-offers",
        defaultLastCompletedStep: "details",
        isReadOnly: "true",
      },
    },
  ],
  focus: {
    cases: ["default"],
    root: list,
    walks: [
      {
        id: "tab",
        start: beforeButton,
        keys: ["Tab", "Tab"],
      },
    ],
  },
  ax: {
    cases: ["default", "progress", "disabled", "readonly"],
    roots: {
      list,
    },
  },
};

/**
 * Progress D5 scenario. Steps 1-3 are selectable (step 2 completed, step 3
 * selected + its predecessor completed), so four Tabs walk step 1 → step 2 →
 * step 3 → out to After — the multi-step native-Tab order. A separate scenario so
 * this longer walk pairs only with the `progress` case (the focus driver runs
 * every walk on every listed case).
 */
const progressFocusScenario: DriverScenario = {
  slug: "steplist",
  title: "StepList (progress)",
  target: list,
  states: ["default"],
  cases: [
    {
      id: "progress",
      params: { defaultSelectedKey: "fallback-offer", defaultLastCompletedStep: "select-offers" },
    },
  ],
  focus: {
    cases: ["progress"],
    root: list,
    walks: [
      {
        id: "tab",
        start: beforeButton,
        keys: ["Tab", "Tab", "Tab", "Tab"],
      },
    ],
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
registerFocusTrailDriver(progressFocusScenario);
