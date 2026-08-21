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
 * Recertification march unit (Tier 5, date/time/color — unit 6): DateRangePicker.
 * Certified pair-oracle against the styled React Spectrum S2 DateRangePicker. The
 * React panel renders `@react-spectrum/s2` `DateRangePicker` directly; the Solid
 * panel renders `@proyecto-viviana/solid-spectrum` `DateRangePicker` (its port of
 * the same S2 macro). Both are the "Trip dates" range picker
 * (`daterangepicker-demo.ts`), so segment values, placeholder shapes, the range
 * calendar popover, and paint are stable across runs and stacks.
 *
 * This unit supersedes the pre-certified `e2e/daterangepicker-visual.spec.ts` by
 * re-expressing its coverage in the certified `register*Driver` pair-oracle form,
 * where real Chromium drives focus/AX/pixels/events side by side.
 *
 * DateRangePicker is the composed sibling of the certified DatePicker (unit 5):
 * TWO certified DateField segmented-spinbutton inputs (unit 3) joined by a
 * separator + a calendar-trigger BUTTON + a RangeCalendar popover (unit 2). The
 * DISTINCT certified surface here is THE RANGE — the two fields, the `–`
 * separator, and the cross-field keyboard model that walks segment focus and
 * auto-advance across the start↔end boundary through a SHARED focus manager.
 *
 * The S2 oracle's structure (confirmed against the pinned `@react-spectrum/s2` +
 * `react-aria-components` source; S2's `DateRangePicker` reuses the SAME
 * `CalendarButton`/`CalendarPopover` as `DatePicker`) is:
 *
 *   - The OUTER root is ROLELESS (RAC `DateRangePicker` renders a bare `<div>`
 *     with the DOM/renderProps/focus props; `useDateRangePicker` hands
 *     `role="group"` + the labelled `aria-labelledby`/outer-arrow-nav to
 *     `GroupContext`, NOT to the root). The port's roleless root is
 *     `<div ref={setFieldRef}>` — the ref scopes the shared segment focus manager.
 *   - The `FieldGroup` shell is `role="presentation"` (S2 sets an explicit local
 *     `role="presentation"`; RAC `Group`'s `role={props.role ?? 'group'}` with a
 *     local-wins `useContextProps` means the S2 role overrides the context group
 *     role). The styled port spreads `pickerAria.groupProps` then overrides
 *     `role="presentation"` (later JSX attr wins).
 *   - BOTH inner `DateInput` groups (start + end) are ALSO `role="presentation"`:
 *     `useDateRangePicker` stamps `[roleSymbol]:'presentation'` on the start/end
 *     fieldProps it hands to `createDateField`, so each field's group renders
 *     `role="presentation"` and routes ArrowLeft/Right up to the OUTER group's
 *     shared arrow-nav layer (which walks across BOTH fields). NO labelled
 *     `role="group"` exists anywhere.
 *   - The segments are `role="spinbutton"` named from the field label +
 *     start/end sublabel ("month, Start Date" / "month, End Date" via
 *     `stringFormatter.format('startDate'|'endDate')` threaded through the shared
 *     `hookData` WeakMap). The separator is an `aria-hidden` `–` span. The
 *     CalendarButton is `aria-label="Calendar"` (`stringFormatter.format(
 *     'calendar')`), `aria-haspopup="dialog"`, `aria-expanded`, NO `aria-controls`.
 *     The dialog popover is labelled `${buttonId} ${labelledBy}` with NO
 *     `aria-label`.
 *
 * The port's certified divergences (all faithful red→green in the source pass
 * this unit gates on):
 *   1. the roleless root — the range fields route their field props through the
 *      certified `createDateField` (was the placeholder `start/endInputProps`),
 *      giving the two DateInput groups `role="presentation"` + the shared
 *      focus-manager arrow-nav, and the outer root a bare `<div ref>`.
 *   2. the styled FieldGroup now spreads `pickerAria.groupProps` (label /
 *      describedby / `aria-disabled` / outer arrow-nav + press) under its
 *      `role="presentation"` override — previously the group semantics were
 *      dropped, so the range fields had no shared arrow-nav and no group labelling.
 *   3. the CalendarButton emitted only `data-open`/`data-disabled` — no
 *      `data-hovered`/`data-pressed`/`data-focus-visible`, so its S2 baseColor
 *      hover/press fill and focus ring never painted. The trigger now mirrors the
 *      DatePicker port's button (own focus-ring/hover, `isButtonPressed` press
 *      signal, `pressScale`).
 *   4. the FieldGroup's `baseColor("neutral")` text/border hover step never
 *      brightened (D7) — the styled shell now recomputes its class with
 *      `isHovered` from a `createHover` on the presentation node.
 *
 * SCENARIOS:
 *   PAINT (`dateRangePickerPaintScenario`) — D1/D3/D7/D8/D9. Target = the calendar
 *   trigger BUTTON (states default + focus-visible + hover + pressed, certifying
 *   divergence #3). Parts: the FieldGroup shell, the start month segment, the `–`
 *   separator, the end month segment, the help-text row (the RANGE surface).
 *   `pressed` is captured mouse-DOWN (the popover opens on release — the last
 *   state's reset — harmless). Prop cases: placeholder / value / invalid /
 *   disabled (unfocusable at rest) / readonly (upstream disables the trigger when
 *   read-only).
 *
 *   BEHAVIOR (`dateRangePickerBehaviorScenario`) — D5/D6/D10. Target = the picker
 *   root (whole-field bidi container; `direction: rtl` under ar-AE). D5 walks:
 *   `range-arrow-nav` (ArrowRight/Left crossing start→end via the shared focus
 *   manager — divergences #1/#2), `tab-walk` (every segment of BOTH fields is a
 *   tab stop, then the trigger), `spin-keys` (ArrowUp/PageUp/End/Home must NOT
 *   move focus). D6 ax root = the picker root across all five cases (roleless
 *   root, the dual "Start Date"/"End Date" spinbutton names, the button name,
 *   [disabled]/[readonly]). D10 re-runs the walks + diffs the root/segment bidi
 *   under ar-AE.
 *
 *   POPOVER (`dateRangePickerPopoverScenario`) — D6/D5 on the OPEN overlay. Opened
 *   with the keyboard so focus-modality stays non-pointer. D6 root = the dialog
 *   (its labelling/no-aria-label composition); D5 = the focus trail once open.
 *   The RangeCalendar grid internals are certified by the RangeCalendar unit
 *   (CP9.59); this pins only the dialog wrapper + trail.
 *
 *   EVENTS (`dateRangePickerTriggerScenario`, `dateRangePickerValueScenario`) —
 *   D4. `dateRangePickerTriggerScenario` records open→Escape→close (onOpenChange +
 *   focus restoration). `dateRangePickerValueScenario` records a start-field
 *   segment spin (ArrowUp on the start month segment → onChange with the
 *   incremented range start) plus a mouse click, interleaving the `onChange`
 *   `comparison:callback` at the same position across both stacks.
 *
 *   MOTION (`dateRangePickerMotionScenario`) — D2, the popover enter transition
 *   (S2 `CalendarPopover` via RAC `useEnterAnimation`), captured from the
 *   `overlay` scope so the trigger's own press transition never leaks in.
 *
 * SCOPED OUT (documented, not silent):
 *   - The RangeCalendar grid's own paint / AX / contrast / target-size — already
 *     certified by the RangeCalendar unit (CP9.59); the popover scenario certifies
 *     only the composition (dialog wrapper labelling + focus trail), not the grid
 *     internals, to avoid duplicating that oracle.
 *   - The TimeField sub-panels (granularity hour/minute/second, "Start time" /
 *     "End time") — the composed TimeField is certified by CP9.61; a datetime
 *     granularity here would duplicate it. Day granularity (no TimeFields) is the
 *     certified shape.
 *   - RTL paint of the full paint matrix — D10 runs on the behavior scenario; the
 *     bidi-critical props (`direction`, `unicode-bidi`) are diffed there on the
 *     root + both month segments, LTR paint is fully covered by the paint scenario.
 */

/** The field root — both fixtures class the S2 DateRangePicker root with this. */
const pickerRoot: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-daterangepicker-root");

/**
 * The calendar trigger button — resolved by `aria-haspopup="dialog"` (present on
 * both stacks, name-independent so it survives the "Calendar" vs "Open calendar"
 * divergence and the ar-AE locale).
 */
const trigger: TargetResolver = ({ canvas }) =>
  canvas.locator('.comparison-daterangepicker-root button[aria-haspopup="dialog"]');

/**
 * The START field's month segment — the FIRST `data-type="month"` spinbutton. The
 * start `<DateInput slot="start">` group is always DOM-first (source order),
 * before the separator and the end field, so `.first()` is the start month across
 * locales (ar-AE flips visual order via CSS, not DOM order). `data-type` is
 * locale-independent.
 */
const startMonthSegment: TargetResolver = ({ canvas }) =>
  canvas.locator('[role="spinbutton"][data-type="month"]').first();

/**
 * The END field's month segment — the LAST `data-type="month"` spinbutton (the
 * end `<DateInput slot="end">` group is DOM-last).
 */
const endMonthSegment: TargetResolver = ({ canvas }) =>
  canvas.locator('[role="spinbutton"][data-type="month"]').last();

/**
 * The range separator — the `aria-hidden` `–` between the two fields. Part of the
 * distinct range surface (paint only; it is out of the a11y tree).
 */
const separator: TargetResolver = ({ canvas }) =>
  canvas.locator('.comparison-daterangepicker-root [aria-hidden="true"]', { hasText: "–" }).first();

/**
 * The styled FieldGroup shell — the `role="presentation"` field grid's second
 * child (label wrap / FieldGroup / help text), mirroring the DatePicker cert's
 * nth-child idiom. It contains both DateInput groups, the separator, the invalid
 * icon, and the trigger.
 */
const fieldGroup: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-daterangepicker-root > div:nth-child(2)");

/** The help-text row — description by default, the error row when invalid. */
const helpText: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-daterangepicker-root > :nth-child(3)");

/** The open range calendar popover — portaled outside the canvas, unique per panel. */
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
  // The resting placeholder value (demo defaults: startValue/endValue "").
  { id: "placeholder", params: {} },
  // A committed range — the start field renders 2025-02-03, the end field
  // 2025-02-14, the field carries its help-text description row.
  { id: "value", params: { startValue: "2025-02-03", endValue: "2025-02-14" } },
  // Invalid — error help text + InvalidIndicator icon inside the FieldGroup.
  {
    id: "invalid",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isInvalid: "true" },
  },
  // Disabled — capture at rest: the disabled trigger is unfocusable, so hover/
  // press/focus-visible have nothing to drive.
  {
    id: "disabled",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isDisabled: "true" },
    states: ["default"] as const,
  },
  // Read-only — upstream `useDateRangePicker` disables the trigger
  // (`isDisabled: props.isDisabled || props.isReadOnly`), so the button is
  // unfocusable: hover/press/focus-visible have nothing to drive → default only.
  {
    id: "readonly",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isReadOnly: "true" },
    states: ["default"] as const,
  },
];

const dateRangePickerPaintScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker",
  // D1 target: the calendar trigger button — the S2 CalendarButton's baseColor
  // hover/press fill + focus ring live here (divergence #3).
  target: trigger,
  parts: {
    // The FieldGroup shell — border/background/focus-ring + both composed fields.
    fieldGroup,
    // The start month segment — the start DateField spinbutton.
    startMonthSegment,
    // The `–` separator — the distinct range surface.
    separator,
    // The end month segment — the end DateField spinbutton.
    endMonthSegment,
    // The description/error row.
    helpText,
  },
  // D3 rasterizes the whole closed field: label + FieldGroup (both fields, the
  // separator, invalid icon, trigger) + help text. The popover is closed.
  pixelTarget: pickerRoot,
  cases: paintCases,
  // A button HAS hover/press/focus-visible states: the S2 CalendarButton paints
  // all three, so the paint matrix drives them.
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
  { id: "value", params: { startValue: "2025-02-03", endValue: "2025-02-14" } },
  {
    id: "invalid",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isInvalid: "true" },
  },
  {
    id: "disabled",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isDisabled: "true" },
  },
  {
    id: "readonly",
    params: { startValue: "2025-02-03", endValue: "2025-02-14", isReadOnly: "true" },
  },
];

const dateRangePickerBehaviorScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker",
  // The picker ROOT is the target: D10's sanity assertion requires computed
  // `direction: rtl` under ar-AE, which the whole-field root satisfies (a segment
  // carries `direction: ltr`). Walks start from the start month segment.
  target: pickerRoot,
  parts: {
    // Both month segments ride along in the D10 state-matrix half so their
    // RTL-only `direction: ltr` bidi override is diffed on each field.
    startMonthSegment,
    endMonthSegment,
  },
  cases: behaviorCases,
  states: ["default"],
  styleProps: {
    add: ["unicode-bidi"],
  },
  // D5 — the composed RANGE keyboard model. Scoped to the picker root (both
  // fields + the button live inside it; the HiddenDateInput form siblings, if
  // any, are outside).
  focus: {
    cases: ["placeholder"],
    root: pickerRoot,
    walks: [
      // The DISTINCT range surface: ArrowRight/Left walk segment focus ACROSS the
      // start→end field boundary through the shared focus manager
      // (startMonth → startDay → startYear → endMonth → endDay → …back). The
      // presentation fields bubble the arrows to the outer group's shared arrow-nav
      // (divergences #1/#2 — the range fields had no shared nav before).
      {
        id: "range-arrow-nav",
        start: startMonthSegment,
        keys: ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"],
      },
      // Every editable segment of BOTH fields is a real tab stop AND the trigger
      // follows them: startMonth → startDay → startYear → endMonth → endDay →
      // endYear → button → endYear.
      {
        id: "tab-walk",
        start: startMonthSegment,
        keys: ["Tab", "Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab"],
      },
      // Spin keys route to the spinbutton value model and must NOT move focus.
      {
        id: "spin-keys",
        start: startMonthSegment,
        keys: ["ArrowUp", "PageUp", "End", "Home", "ArrowDown"],
      },
    ],
  },
  // D6 — the resting AX tree per case: the ROLELESS root, the dual
  // "…, Start Date" / "…, End Date" spinbutton names, the button name "Calendar",
  // the aria-hidden separator, and [disabled]/[readonly] states.
  ax: {
    cases: ["placeholder", "value", "invalid", "disabled", "readonly"],
    roots: {
      field: pickerRoot,
    },
  },
};

const dateRangePickerPopoverScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker popover",
  beforePanel: openPopoverWithKeyboard,
  afterPanel: closePopover,
  target: popover,
  states: ["default"],
  settleMs: 400,
  cases: [{ id: "open", params: { startValue: "2025-02-03", endValue: "2025-02-14" } }],
  // D6: the open overlay's AX composition — role=dialog labelled by the button +
  // field label with NO aria-label. The RangeCalendar grid internals are certified
  // by the RangeCalendar unit; this pins only the dialog wrapper.
  ax: {
    roots: {
      dialog: popover,
    },
  },
  // D5: the focus trail once open. Entry is `keyboard` — the popover auto-focuses
  // the range calendar's focused day on open, so the walk drives from there rather
  // than re-seeding focus programmatically.
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
const dateRangePickerTriggerScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker trigger",
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
  },
};

/**
 * D4 — the value-change surface, certified on the composed range picker. Target =
 * the start month segment; the gesture spins it up by one (ArrowUp on 2025-02-03 →
 * 2025-03-03) and the log must interleave the `onChange` `comparison:callback` at
 * the same position across both stacks.
 */
const dateRangePickerValueScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker value change",
  target: startMonthSegment,
  cases: [{ id: "value", params: { startValue: "2025-02-03", endValue: "2025-02-14" } }],
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
const dateRangePickerMotionScenario: DriverScenario = {
  slug: "daterangepicker",
  title: "DateRangePicker motion",
  target: trigger,
  pixelTarget: popover,
  cases: [{ id: "open", params: { startValue: "2025-02-03", endValue: "2025-02-14" } }],
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
registerStateMatrixDriver(dateRangePickerPaintScenario);
registerPixelDriver(dateRangePickerPaintScenario);
registerContrastDriver(dateRangePickerPaintScenario);
registerTargetSizeDriver(dateRangePickerPaintScenario);
registerForcedColorsDriver(dateRangePickerPaintScenario);

// BEHAVIOR — D5 / D6 / D10.
registerFocusTrailDriver(dateRangePickerBehaviorScenario);
registerAxTreeDriver(dateRangePickerBehaviorScenario);
registerRtlDriver(dateRangePickerBehaviorScenario);

// POPOVER — D6 / D5 on the open overlay.
registerAxTreeDriver(dateRangePickerPopoverScenario);
registerFocusTrailDriver(dateRangePickerPopoverScenario);

// EVENTS — D4 (open/close + value change).
registerEventSequenceDriver(dateRangePickerTriggerScenario);
registerEventSequenceDriver(dateRangePickerValueScenario);

// MOTION — D2 (popover enter).
registerMotionDriver(dateRangePickerMotionScenario);
