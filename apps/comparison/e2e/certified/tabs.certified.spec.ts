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
    // touch-tap used to diverge on the mid-flight roving `tabIndex`: tapping a
    // tab focuses it, and the port set `focusedKey` in the item's `onFocus`
    // (native `focus`) handler, flipping the roving `tabIndex` to 0 a whole
    // event before React did. React's `onFocus` is a `focusin`-delegated
    // listener at the app root, so its roving reflection lands one event later —
    // at `focusin`, which for a touch tap (selection on press-up, after focus)
    // still reads tabIndex="-1". Fixed by binding the port's roving-tabindex
    // commit to `focusin` (createTabs.ts `handleFocusIn`) to match React's
    // delegation: the D4 oracle's document capture-phase read at `focusin` now
    // runs before the at-target write, so touch reads -1 and mouse (which syncs
    // focusedKey on press-start, before focus) reads 0 — both matching React. No
    // waiver remains; all D4 gestures are green.
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
  // tab labels' color (150ms). Certified green as of CP9.47, which closed the
  // two port gaps that used to keep the metadata red (see
  // `.claude/current/recertification.md` D2 findings T-A/T-B):
  //   T-A — the indicator now FLIPs. `SharedElement` was storing its geometry
  //     snapshot in a component-disposal `onCleanup`, but per-tab indicators are
  //     never disposed on selection change (only their `isVisible` flips), so the
  //     snapshot was never captured. Ported React's two-phase commit: the store
  //     lives in a render-effect cleanup (fires on every isVisible flip, before
  //     any FLIP read), a render-phase mount-promotion mounts the incoming
  //     indicator, and the FLIP read reacts to that element mounting.
  //   T-B — the hidden overflow-measurement TabList no longer applies the
  //     selection/disabled color variants to its `aria-hidden` measurement copies
  //     (mirroring upstream HiddenTabs' `className({size, density})`), so the
  //     measurement copy of the selected tab no longer emits a phantom
  //     `transition: default` color change that doubled the count.
  // The still-deferred "Tabs always renders the overflow picker" structural gate
  // is a distinct issue and invisible here: the measurement TabList is `inert` +
  // `aria-hidden`, so it contributes no transitions the panel-scoped motion
  // driver observes.
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
