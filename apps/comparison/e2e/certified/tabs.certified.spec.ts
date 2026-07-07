import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { mouseClickGesture, registerEventSequenceDriver, touchTapGesture } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerMotionDriver } from "../drivers/motion";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification pilot: Tabs. The gesture target is the initially
 * unselected "Parity" tab so hover/press drive real state transitions
 * (pressing selects it — in both panels alike, which is exactly what the
 * pair oracle compares). Parts cover the tablist container, the initially
 * selected tab, and the active tabpanel; part locators re-resolve on every
 * capture, so the tabpanel swap after selection is handled naturally.
 */
const tabsScenario: DriverScenario = {
  slug: "tabs",
  title: "Tabs",
  target: ({ canvas }) => canvas.getByRole("tab", { name: "Parity" }),
  parts: {
    tablist: ({ canvas }) => canvas.getByRole("tablist"),
    "selected-tab": ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
    tabpanel: ({ canvas }) => canvas.getByRole("tabpanel"),
  },
  cases: [
    { id: "horizontal-regular" },
    { id: "vertical-compact", params: { orientation: "vertical", density: "compact" } },
    { id: "disabled-all", params: { isDisabled: "true" }, states: ["default"] },
  ],
  // D4: pointer and touch selection of an unselected tab, plus arrow-key
  // roving from the selected tab (automatic activation: the arrow both moves
  // focus and selects, so onSelectionChange must interleave identically).
  events: {
    cases: ["horizontal-regular"],
    gestures: [
      mouseClickGesture,
      touchTapGesture,
      {
        id: "arrow-next-from-selected",
        target: ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
        run: async ({ page, target }) => {
          await target.focus();
          await page.keyboard.press("ArrowRight");
        },
      },
    ],
    // touch-tap is the irreducible "React batched-effect vs Solid synchronous
    // reactivity" commit-timing gap. Tapping a tab focuses it, and both stacks
    // set focusedKey in the item's onFocus handler. In Solid that write flips the
    // roving `tabIndex` reactively and synchronously *inside* the native `focus`
    // dispatch — so the oracle's capture-phase read at the following `focusin`
    // already sees tabIndex="0". React defers the DOM write to its post-event
    // commit, so at `focusin` the tab still reads tabIndex="-1". The callbacks and
    // event order are identical; only the tabIndex attribute value observed
    // mid-flight differs. Matching React here means emulating its commit-defer for
    // the roving-tabindex write — a SharedElement-wide change that would regress
    // the D5 roving snapshots (which assert exactly-one-tab-at-0 synchronously).
    // Tracked in recertification.md; deferred to CP9 alongside the D2 SharedElement
    // two-phase-commit work.
    knownDivergences: {
      "horizontal-regular · touch-tap":
        "React batched-effect vs Solid synchronous reactivity: Solid flips the " +
        "roving tabIndex to 0 inside the native `focus` dispatch (before the " +
        "oracle's capture-phase `focusin` read), while React defers the DOM write " +
        "to its commit phase so the tab still reads tabIndex=-1 at `focusin`. " +
        "Event order and callbacks are identical; only the mid-flight attribute " +
        "value differs. A faithful fix needs React's commit-defer for the roving " +
        "write, which would regress the D5 roving snapshots. Tracked in " +
        "recertification.md; deferred to CP9.",
    },
  },
  // D5: the roving-tabindex walk — arrows, Home, End across the tablist; the
  // roving snapshot must show exactly one tab at tabindex=0 after every key.
  focus: {
    cases: ["horizontal-regular"],
    walks: [
      {
        id: "arrow-roving",
        start: ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "Home", "End"],
      },
    ],
  },
  // D2: selecting an unselected tab slides the selection indicator
  // (`transition: [translate,width,height]`, 200ms, `out`) and cross-fades the
  // tab labels' color (150ms). Two tracked port gaps keep the exact metadata
  // red (see `.claude/current/recertification.md` D2 findings T-A/T-B):
  //   T-A — the indicator never FLIPs. `SharedElement` stores its geometry
  //     snapshot in a component-disposal `onCleanup`, but per-tab indicators are
  //     never disposed on selection change (only their `isVisible` flips), so no
  //     snapshot is captured and no translate/width transition runs. A faithful
  //     fix needs React's two-phase commit (store all snapshots before any FLIP
  //     read) — a SharedElement-wide change deferred to CP9.
  //   T-B — the always-rendered hidden overflow-measurement TabList applies the
  //     full `tab` style (incl. `transition: default`) to its `aria-hidden`
  //     measurement copies, so selection change emits phantom color transitions,
  //     doubling the count vs upstream. A facet of the "Tabs always renders the
  //     overflow picker" gate, also deferred to CP9.
  motion: {
    cases: ["horizontal-regular"],
    triggers: [
      {
        id: "select-indicator",
        scopes: ["panel"],
        run: async ({ canvas }) => {
          await canvas.getByRole("tab", { name: "Parity" }).click();
        },
        settleMs: 160,
        knownDivergence:
          "Tabs D2 findings T-A (SelectionIndicator never FLIPs — SharedElement " +
          "snapshot cleanup only fires on disposal, not isVisible flip; needs " +
          "two-phase-commit fix) + T-B (hidden overflow-measurement tabs carry " +
          "transition:default → phantom color transitions). Tracked in " +
          "recertification.md; deferred to CP9.",
      },
    ],
  },
  // D6: the canvas AX tree captures the tablist, each tab (with `[selected]`
  // on the active one), and the active tabpanel. `aria-hidden` measurement
  // copies are excluded from the AX tree by construction, but an always-rendered
  // overflow picker (the T-B gate) would surface here as an extra node — exactly
  // the kind of semantics drift D6 is meant to catch. Tabs emit no live-region
  // announcements, so no `announce` triggers.
  ax: {
    cases: ["horizontal-regular"],
  },
  // D7: tab-label contrast (selected vs unselected carry different token
  // colors) plus the tabpanel body text, across all gesture states — pressing
  // the Parity tab selects it, so the walk also measures the post-selection
  // color. Both themes; a positive control against the certified Tabs colors.
  contrast: {
    cases: ["horizontal-regular"],
  },
  // D8: every `role=tab` hit box at regular and compact density. The always-
  // rendered overflow picker is CSS-hidden, so `checkVisibility` filters it out
  // of the measured set — D8 confirms it contributes no phantom target (the
  // same T-B gate D6 watches for on the AX side).
  targetSize: {
    cases: ["horizontal-regular", "vertical-compact"],
  },
};

registerStateMatrixDriver(tabsScenario);
registerPixelDriver(tabsScenario);
registerEventSequenceDriver(tabsScenario);
registerFocusTrailDriver(tabsScenario);
registerMotionDriver(tabsScenario);
registerAxTreeDriver(tabsScenario);
registerContrastDriver(tabsScenario);
registerTargetSizeDriver(tabsScenario);
