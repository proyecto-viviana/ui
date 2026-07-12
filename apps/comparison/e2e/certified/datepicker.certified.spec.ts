import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { mouseClickGesture, registerEventSequenceDriver } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerForcedColorsDriver } from "../drivers/forced-colors";
import { registerMotionDriver } from "../drivers/motion";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerRtlDriver } from "../drivers/rtl";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification march unit (Tier 5, date/time/color — unit 5): DatePicker.
 * Certified pair-oracle against the styled React Spectrum S2 DatePicker. The
 * React panel renders `@react-spectrum/s2` `DatePicker` directly; the Solid
 * panel renders `@proyecto-viviana/solid-spectrum` `DatePicker` (its port of
 * the same S2 macro). Both are the "Due date" picker (`datepicker-demo.ts`),
 * so segment values, placeholder shapes, the calendar popover, and paint are
 * stable across runs and stacks.
 *
 * This unit supersedes the pre-certified `e2e/datepicker-visual.spec.ts` by
 * re-expressing its coverage in the certified `register*Driver` pair-oracle
 * form, where real Chromium drives focus/AX/pixels/events side by side.
 *
 * DatePicker is the first COMPOSED Tier-5 unit: the certified DateField
 * segmented-spinbutton input (unit 3) + a calendar-trigger BUTTON + a Calendar
 * popover (unit 1). The S2 oracle's structure (confirmed against the pinned
 * `@react-spectrum/s2` + `react-aria-components` source) is:
 *
 *   - The OUTER root is ROLELESS (RAC `DatePicker` renders a bare `<div>` with
 *     the DOM/renderProps/focus props; `useDatePicker` hands `role="group"` +
 *     the labelled `aria-labelledby`/arrow-nav to `GroupContext`, NOT to the
 *     root). The port WRONGLY put a labelled `role="group"` on the outermost
 *     root wrapping label + field + help — the loud D6 divergence this unit
 *     certifies away.
 *   - The `FieldGroup` shell is `role="presentation"` (S2 sets an explicit
 *     local `role="presentation"`; RAC `Group`'s `role={props.role ?? 'group'}`
 *     with a local-wins `useContextProps` means the S2 role overrides the
 *     context group role).
 *   - The inner `DateInput` group is ALSO `role="presentation"`:
 *     `useDatePicker` stamps `[roleSymbol]:'presentation'` on the fieldProps it
 *     hands to `DateFieldContext`, so `useDateField` renders the inner group
 *     `role="presentation"` (and routes ArrowLeft/Right through the OUTER
 *     group's `useDatePickerGroup` layer, not the inner one). NO labelled
 *     `role="group"` exists anywhere.
 *   - The segments are `role="spinbutton"` named from the FieldLabel; the
 *     CalendarButton is `aria-label="Calendar"` (`stringFormatter.format(
 *     'calendar')`), `aria-haspopup="dialog"`, `aria-expanded`, and carries NO
 *     `aria-controls`. The dialog popover is labelled `${buttonId} ${labelledBy}`
 *     with NO `aria-label`.
 *
 * The port's certified divergences (all faithful red→green in this unit):
 *   1. outer root `role="group"` (labelled) → roleless.
 *   2. the group keyboard layer (`createDatePickerGroup`: ArrowLeft/Right
 *      segment nav + Alt+ArrowDown open) is UNWIRED into the composed picker's
 *      groupProps — the segments never walk.
 *   3. the CalendarButton emits only `data-open`/`data-disabled` — no
 *      `data-hovered`/`data-pressed`/`data-focus-visible`, so its S2 baseColor
 *      hover/press fill and focus ring never paint.
 *   4. the button's default `aria-label` is "Open calendar" (port intl) vs the
 *      upstream "Calendar".
 *   5. the port invented `aria-controls` on the button (upstream has none).
 *   6. the port added a redundant `aria-label` on the dialog (upstream: labelled
 *      only, no aria-label).
 *   7. the port's groupProps carry extra `aria-readonly`/`aria-required`/
 *      `aria-invalid` vs the upstream group's `role`/`aria-disabled`/labelled/
 *      describedby only.
 *
 * SCENARIOS:
 *   PAINT (`datePickerPaintScenario`) — D1/D3/D7/D8/D9. Target = the calendar
 *   trigger BUTTON (the new interactive surface); states = default +
 *   focus-visible + hover + pressed (certifies divergence #3 — until the button
 *   emits the readiness attrs, the S2 hover/press/focus paint has no port
 *   equivalent). Parts: the FieldGroup shell, the month segment, the help-text
 *   row. `pressed` is captured mouse-DOWN (the popover opens on release, which
 *   is the LAST state's reset — harmless). Prop cases: placeholder / value /
 *   invalid / disabled (at rest, the disabled button is unfocusable) / readonly.
 *
 *   BEHAVIOR (`datePickerBehaviorScenario`) — D5/D6/D10. Target = the picker
 *   root (whole-field bidi container; `direction: rtl` under ar-AE). D5 walks:
 *   `segment-nav` (ArrowRight/Left through month→day→year — certifies #2),
 *   `tab-walk` (month→day→year→BUTTON→year: every segment a tab stop plus the
 *   trigger after them), `spin-keys` (ArrowUp/PageUp/End/Home must NOT move
 *   focus). D6 ax root = the picker root across all five cases (certifies #1 the
 *   roleless root, #4 the button name, composed spinbutton names, [disabled]/
 *   [readonly]). D10 re-runs the walks + diffs the root/segment bidi under ar-AE.
 *
 *   POPOVER (`datePickerPopoverScenario`) — D6/D5 on the OPEN overlay. Opened
 *   with the keyboard so focus-modality stays non-pointer; the panel-major walk
 *   guarantees only one panel's dialog is open, so `page.getByRole("dialog")`
 *   is unique. D6 root = the dialog (certifies the dialog labelling/no-aria-label
 *   composition); D5 = the focus trail once open.
 *
 *   EVENTS (`datePickerTriggerScenario`, `datePickerValueScenario`) — D4, the
 *   value-change surface DEFERRED by DateField/TimeField, now closed here.
 *   `datePickerTriggerScenario` records open→Escape→close (the onOpenChange
 *   surface + focus restoration). `datePickerValueScenario` records a segment
 *   spin (ArrowUp on the month segment → onChange with the incremented date):
 *   the same segment value model DateField deferred, now pinned as a
 *   `comparison:callback` interleaved in the ordered DOM-event log.
 *
 *   MOTION (`datePickerMotionScenario`) — D2, the popover enter transition (S2
 *   `CalendarPopover` via RAC `useEnterAnimation`), captured from the `overlay`
 *   scope so the trigger's own press transition never leaks in.
 *
 * SCOPED OUT (documented, not silent):
 *   - The Calendar grid's own paint / AX / contrast / target-size — already
 *     certified by the Calendar unit (CP9.58); the popover scenario certifies
 *     only the composition (dialog wrapper labelling + focus trail), not the
 *     grid internals, to avoid duplicating that oracle.
 *   - The TimeField sub-panel (granularity hour/minute/second) — the composed
 *     TimeField is certified by CP9.61; a datetime granularity here would
 *     duplicate it. Day granularity (no TimeField) is the certified shape.
 *   - RTL paint of the full paint matrix — D10 runs on the behavior scenario;
 *     the bidi-critical props (`direction`, `unicode-bidi`) are diffed there on
 *     the root + month segment, LTR paint is fully covered by the paint scenario.
 */

/** The field root — both fixtures class the S2 DatePicker root with this. */
const pickerRoot: TargetResolver = ({ canvas }) => canvas.locator(".comparison-datepicker-root");

/**
 * The calendar trigger button — resolved by `aria-haspopup="dialog"` (present
 * on both stacks, name-independent so it survives the "Calendar" vs
 * "Open calendar" divergence and the ar-AE locale).
 */
const trigger: TargetResolver = ({ canvas }) =>
  canvas.locator('.comparison-datepicker-root button[aria-haspopup="dialog"]');

/**
 * Editable segments, resolved by `data-type` (present on both stacks and
 * locale-independent — under ar-AE the DOM order flips but the types don't).
 */
const monthSegment: TargetResolver = ({ canvas }) =>
  canvas.locator('[role="spinbutton"][data-type="month"]');

/**
 * The styled FieldGroup shell — the `role="presentation"` field grid's second
 * child (label wrap / FieldGroup / help text), mirroring the DateField cert's
 * nth-child idiom. It contains the segments, the invalid icon, and the trigger.
 */
const fieldGroup: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-datepicker-root > div:nth-child(2)");

/** The help-text row — description by default, the error row when invalid. */
const helpText: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-datepicker-root > :nth-child(3)");

/** The open calendar popover — portaled outside the canvas, unique per panel. */
const popover: TargetResolver = ({ page }) => page.getByRole("dialog");

const openPopoverWithKeyboard = async ({ canvas, page }: PanelContext) => {
  await trigger({ canvas, page, framework: "react" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
};

const closePopover = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

const paintCases = [
  // The resting placeholder value (demo default: value "").
  { id: "placeholder", params: {} },
  // A committed value — segments render 2025-02-14, the field carries the
  // "Selected Date:" description graph.
  { id: "value", params: { value: "2025-02-14" } },
  // Invalid — error help text + InvalidIndicator icon inside the FieldGroup.
  { id: "invalid", params: { value: "2025-02-14", isInvalid: "true" } },
  // Disabled — capture at rest: the disabled trigger is unfocusable, so hover/
  // press/focus-visible have nothing to drive.
  { id: "disabled", params: { value: "2025-02-14", isDisabled: "true" }, states: ["default"] as const },
  // Read-only — like disabled, upstream `useDatePicker` disables the trigger
  // (`isDisabled: props.isDisabled || props.isReadOnly`), so the button is
  // unfocusable: hover/press/focus-visible have nothing to drive → default only.
  { id: "readonly", params: { value: "2025-02-14", isReadOnly: "true" }, states: ["default"] as const },
];

const datePickerPaintScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker",
  // D1 target: the calendar trigger button — the S2 CalendarButton's baseColor
  // hover/press fill + focus ring live here (divergence #3).
  target: trigger,
  parts: {
    // The FieldGroup shell — border/background/focus-ring + the composed field.
    fieldGroup,
    // The month segment — the DateField spinbutton composed into the picker.
    monthSegment,
    // The description/error row.
    helpText,
  },
  // D3 rasterizes the whole closed field: label + FieldGroup (segments, invalid
  // icon, trigger) + help text. The popover is closed (no portal node).
  pixelTarget: pickerRoot,
  cases: paintCases,
  // A button HAS hover/press/focus-visible states (unlike a bare date segment):
  // the S2 CalendarButton paints all three, so the paint matrix drives them.
  states: ["default", "focus-visible", "hover", "pressed"],
  styleProps: {
    // unicode-bidi pins the group/segment isolation model; box-sizing + minimums
    // are where the composed button/segment geometry regressions surface.
    add: ["unicode-bidi", "box-sizing", "min-width", "white-space"],
  },
  contrast: {
    cases: ["value", "invalid", "disabled"],
    root: pickerRoot,
  },
  targetSize: {
    cases: ["value"],
    root: pickerRoot,
  },
};

const behaviorCases = [
  { id: "placeholder", params: {} },
  { id: "value", params: { value: "2025-02-14" } },
  { id: "invalid", params: { value: "2025-02-14", isInvalid: "true" } },
  { id: "disabled", params: { value: "2025-02-14", isDisabled: "true" } },
  { id: "readonly", params: { value: "2025-02-14", isReadOnly: "true" } },
];

const datePickerBehaviorScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker",
  // The picker ROOT is the target: D10's sanity assertion requires computed
  // `direction: rtl` under ar-AE, which the whole-field root satisfies (a
  // segment carries `direction: ltr`). Walks start from the month segment.
  target: pickerRoot,
  parts: {
    // The month segment rides along in the D10 state-matrix half so its
    // RTL-only `direction: ltr` bidi override is diffed.
    monthSegment,
  },
  cases: behaviorCases,
  states: ["default"],
  styleProps: {
    add: ["unicode-bidi"],
  },
  // D5 — the composed keyboard model. Scoped to the picker root (the button +
  // segments live inside it; the HiddenDateInput form sibling, if any, is
  // outside).
  focus: {
    cases: ["placeholder"],
    root: pickerRoot,
    walks: [
      // createDatePickerGroup ArrowLeft/Right: month → day → year → day → month
      // (divergence #2 — unwired in the port, the segments never walk).
      {
        id: "segment-nav",
        start: monthSegment,
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"],
      },
      // Every editable segment is a real tab stop AND the trigger follows them:
      // month → day → year → button → year.
      { id: "tab-walk", start: monthSegment, keys: ["Tab", "Tab", "Tab", "Shift+Tab"] },
      // Spin keys route to the spinbutton value model and must NOT move focus.
      {
        id: "spin-keys",
        start: monthSegment,
        keys: ["ArrowUp", "PageUp", "End", "Home", "ArrowDown"],
      },
    ],
  },
  // D6 — the resting AX tree per case: the ROLELESS root (divergence #1 — the
  // port's labelled role=group wrapping everything is the loud red), the
  // composed spinbutton names, the button name "Calendar" (divergence #4),
  // literal hiding, and [disabled]/[readonly] states.
  ax: {
    cases: ["placeholder", "value", "invalid", "disabled", "readonly"],
    roots: {
      field: pickerRoot,
    },
  },
};

const datePickerPopoverScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker popover",
  beforePanel: openPopoverWithKeyboard,
  afterPanel: closePopover,
  target: popover,
  states: ["default"],
  settleMs: 400,
  cases: [{ id: "open", params: { value: "2025-02-14" } }],
  // D6: the open overlay's AX composition — role=dialog labelled by the button +
  // field label with NO aria-label (divergence #6). The Calendar grid internals
  // are certified by the Calendar unit; this pins only the dialog wrapper.
  ax: {
    roots: {
      dialog: popover,
    },
  },
  // D5: the focus trail once open. Entry is `keyboard` — the popover auto-focuses
  // the calendar's focused day on open, so the walk drives from there rather than
  // re-seeding focus programmatically.
  focus: {
    root: popover,
    walks: [{ id: "open-trap", entry: "keyboard", keys: ["Tab", "Tab", "Shift+Tab"] }],
  },
};

/**
 * D4 — the open→close event surface recorded from the trigger. No `beforePanel`;
 * the gesture opens the popover so the log captures trigger press events,
 * onOpenChange(true), focus moving into the dialog, the Escape dismissal,
 * onOpenChange(false), and focus restoration, all in one ordered sequence.
 */
const datePickerTriggerScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker trigger",
  target: trigger,
  cases: [{ id: "placeholder", params: {} }],
  events: {
    gestures: [
      {
        id: "open-escape-close",
        run: async ({ page, target }) => {
          await target.focus();
          await page.keyboard.press("Enter");
          await expect(page.getByRole("dialog")).toBeVisible();
          await page.waitForTimeout(600);
          await page.keyboard.press("Escape");
          await expect(page.getByRole("dialog")).toHaveCount(0);
        },
        settleMs: 700,
      },
    ],
    knownDivergences: {
      "placeholder · open-escape-close":
        "React batched-effect vs Solid synchronous reactivity: on Escape, RAC " +
        "defers the overlay teardown + FocusScope focus-restoration past the " +
        "current event dispatch (its passive-effect commit), so `keyup` fires on " +
        "the still-focused calendar cell BEFORE `focusout`/`focusin` move focus " +
        "back to the trigger. Solid unmounts the `<Show>` and restores focus " +
        "synchronously inside the Escape `keydown` handler, so `focusout`/" +
        "`focusin` land first and `keyup` fires on the trigger. Same events, same " +
        "callbacks, same `defaultPrevented`; only the keyup↔focus interleave " +
        "differs. A faithful fix needs a one-frame teardown defer (the " +
        "`createAnimation` `deferNoAnimation` trick, which only engages for " +
        "exit-animated overlays; this popover's exit motion is scoped out for " +
        "this unit). Dismiss-ordering facet of the event-ordering epic in " +
        "recertification.md — DISTINCT from the value-change surface this unit " +
        "closes, which is certified green by the `value · segment-spin-up` " +
        "gesture (ArrowUp → onChange interleaved identically).",
    },
  },
};

/**
 * D4 — the value-change surface DateField/TimeField deferred, now closed on the
 * composed picker. Target = the month segment; the gesture spins it up by one
 * (ArrowUp on 2025-02-14 → 2025-03-14) and the log must interleave the
 * `onChange` `comparison:callback` at the same position across both stacks.
 */
const datePickerValueScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker value change",
  target: monthSegment,
  cases: [{ id: "value", params: { value: "2025-02-14" } }],
  events: {
    gestures: [
      {
        id: "segment-spin-up",
        run: async ({ page, target }) => {
          await target.focus();
          await page.keyboard.press("ArrowUp");
        },
        settleMs: 350,
      },
      { ...mouseClickGesture, settleMs: 350 },
    ],
  },
};

/**
 * D2 — the popover enter motion. No `beforePanel`; the trigger opens the popover
 * while the freezer is already running, so the transient enter transition (S2
 * `CalendarPopover` opacity/translate via `useEnterAnimation`) is caught and
 * paused on its first frame, captured from the `overlay` scope only.
 */
const datePickerMotionScenario: DriverScenario = {
  slug: "datepicker",
  title: "DatePicker motion",
  target: trigger,
  pixelTarget: popover,
  cases: [{ id: "open", params: { value: "2025-02-14" } }],
  motion: {
    triggers: [
      {
        id: "open-enter",
        scopes: ["overlay"],
        run: async ({ target, page }) => {
          await target.click();
          await expect(page.getByRole("dialog")).toHaveCount(1);
        },
        cleanup: async ({ page }) => {
          await page.keyboard.press("Escape");
          await expect(page.getByRole("dialog")).toHaveCount(0);
        },
        settleMs: 260,
      },
    ],
  },
};

// PAINT — D1 / D3 / D7 / D8 / D9.
registerStateMatrixDriver(datePickerPaintScenario);
registerPixelDriver(datePickerPaintScenario);
registerContrastDriver(datePickerPaintScenario);
registerTargetSizeDriver(datePickerPaintScenario);
registerForcedColorsDriver(datePickerPaintScenario);

// BEHAVIOR — D5 / D6 / D10.
registerFocusTrailDriver(datePickerBehaviorScenario);
registerAxTreeDriver(datePickerBehaviorScenario);
registerRtlDriver(datePickerBehaviorScenario);

// POPOVER — D6 / D5 on the open overlay.
registerAxTreeDriver(datePickerPopoverScenario);
registerFocusTrailDriver(datePickerPopoverScenario);

// EVENTS — D4 (open/close + value change).
registerEventSequenceDriver(datePickerTriggerScenario);
registerEventSequenceDriver(datePickerValueScenario);

// MOTION — D2 (popover enter).
registerMotionDriver(datePickerMotionScenario);
