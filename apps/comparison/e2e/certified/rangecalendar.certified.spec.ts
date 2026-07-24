import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerForcedColorsDriver } from "../drivers/forced-colors";
import { registerPixelDriver } from "../drivers/pixel";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification march unit (Tier 5, date/time/color — unit 2): RangeCalendar.
 * Certified pair-oracle against the styled React Spectrum S2 RangeCalendar. The
 * React panel renders `@react-spectrum/s2` `RangeCalendar` directly; the Solid
 * panel renders `@proyecto-viviana/solid-spectrum` `RangeCalendar` (its port of
 * the same S2 macro). Both are the "Trip dates" range calendar, mounted on the
 * deterministic February 2025 anchor (`rangecalendar-demo.ts` pins the selected
 * range to days 3→7, `constrainRange` to minValue 2025-02-03 / maxValue
 * 2025-02-20, and marks days 10-11 unavailable), so every grid geometry, cell
 * name, range fill, and paint is stable across runs and across stacks.
 *
 * This unit supersedes the pre-certified `e2e/rangecalendar-visual.spec.ts`
 * (strict pixel + range-layer + forced-colors + `ar-AE` arrow-flip contracts) by
 * re-expressing its coverage in the certified `register*Driver` pair-oracle form,
 * where the browser drives real Chromium focus/AX/pixels side-by-side.
 *
 * RangeCalendar owns BOTH surfaces (like Calendar, CP9.58, and TagGroup, CP9.44)
 * — a single publicly styled S2 component that is its own base — so the cert
 * splits into two scenarios in this one file. What makes the unit distinct from
 * Calendar is the RANGE: a contiguous selection whose start/end cells carry the
 * accent fill and whose interior renders two `role="presentation"` sibling layers
 * — a range background (`z-index:-1`, `blue-subtle`) and a range border
 * (`z-index:1`, top/bottom `blue-800` hairlines) — that stitch the days into one
 * pill. That layered range paint is exactly where a port condition-threading bug
 * (`isSelectionStart`/`isSelectionEnd`/`isPreviousDayNotSelected` in
 * `RangeCalendar.tsx` `RangeCalendarCellContent`) surfaces.
 *
 *   PAINT (`rangeCalendarPaintScenario`) — D1 state-matrix, D3 pixel, D7 contrast,
 *   D8 target size, D9 forced colors. The prop-driven case matrix (default range /
 *   unavailable / invalid / multi-month / disabled) is captured at rest: these are
 *   the styling states that actually vary. D1 target = the range-START cell button
 *   (day 3, the accent-filled pill head); the range-MIDDLE cell (day 5, neutral
 *   text over the presentation background) and the range-END cell (day 7, the
 *   accent-filled pill tail) are diffed alongside as parts, so the three distinct
 *   range-cell treatments are all pinned. The grid container is a part too
 *   (border/geometry, where multi-month layout shows). D3 rasterizes the whole
 *   `role="application"` root together so the accent endpoints, the presentation
 *   range background/border layers, the unavailable strike layer, and the
 *   header/nav tokens are pixel-diffed as one crop (the day-3 D1 target cannot see
 *   the header or its own presentation siblings). D9 re-runs the D1 capture under
 *   forced-colors — the old spec's range-fill / range-border / unavailable-strike
 *   forced-colors contract.
 *
 *   BEHAVIOR (`rangeCalendarBehaviorScenario`) — D5 focus trail over the grid's
 *   arrow keyboard model, D6 AX tree of the resting `role="application"` subtree,
 *   D10 RTL. The day grid is a roving-tabindex `role="grid"` of `role="gridcell"`
 *   cells whose inner `role="button"` carries the localized full-date accessible
 *   name; the selected range publishes `aria-selected` on days 3-7 with the
 *   endpoints named, which D6 pins. Arrows walk the week/day axes
 *   (`createRangeCalendarGrid` handleKeyDown, shared with Calendar). D10 re-runs
 *   the SAME arrow walk under `ar-AE` (focus-only) to certify the RTL flip —
 *   ArrowRight moves to the PREVIOUS day under `dir="rtl"` — is identical on both
 *   stacks. Both fixtures thread `locale` into their Provider, so `ar-AE` renders
 *   a true RTL container.
 *
 * SCOPED OUT (documented, not silent):
 *   - D2 motion — the S2 RangeCalendar has no mount/enter animation of its own
 *     (only the `transition` longhands that D1 already pins).
 *   - D4 event sequence — the interactions that mutate value are range anchor /
 *     extend / commit (click or Enter on cells). Their focus/roving contract is
 *     pinned by D5, the resulting range paint + AX are pinned by the paint scenario
 *     and D6, the anchor→highlight→commit computation is covered by the
 *     `createRangeCalendarState` unit suite, and the value-change event surface is
 *     better certified on the composed DateRangePicker unit later in this tier.
 *   - RTL PAINT — D10 runs focus-only; LTR paint is captured in full by the paint
 *     scenario, and the RTL grid is DOM-order-mirrored (the arrow flip is the
 *     behavioral divergence, certified by the RTL focus walk).
 */

/** The RangeCalendar root — both stacks expose `role="application"` named "Trip dates …". */
const calendar: TargetResolver = ({ canvas }) =>
  canvas.getByRole("application", { name: /Trip dates/i });
/** The first (or only) day grid — `role="grid"` (`<table>`). */
const grid: TargetResolver = (ctx) => calendar(ctx).getByRole("grid").first();
/**
 * The range-START cell button (day 3) — the accent-filled pill head, present in
 * every case (the demo range always begins on day 3). Resolved by the stable date
 * part of its localized accessible name so a `selected` name suffix can't miss it.
 */
const rangeStartCell: TargetResolver = (ctx) =>
  calendar(ctx).getByRole("button", { name: /February 3, 2025/ });
/** The range-MIDDLE cell button (day 5) — neutral text over the presentation range background. */
const rangeMiddleCell: TargetResolver = (ctx) =>
  calendar(ctx).getByRole("button", { name: /February 5, 2025/ });
/**
 * The range-END cell button (day 7) — the accent-filled pill tail. Both endpoints
 * carry the range-description PREFIX ("Selected Range: Monday, February 3 to Friday,
 * February 7, 2025, …"), so the bare "February 7, 2025" appears in the START cell's
 * name too. What is UNIQUE to the end cell across every case is the join-comma
 * before its own weekday label: the prefix reads "…to Friday" (a space, no comma),
 * and the start cell's own label reads "…, Monday, February 3, 2025", so only the
 * end cell's name contains ", Friday, February 7, 2025". Anchoring on that (rather
 * than a trailing "selected") keeps the resolver stable in the DISABLED case too,
 * where the port correctly drops the "selected" suffix on both stacks (a disabled
 * cell is not reported selected — `createRangeCalendarState` isSelected gate).
 */
const rangeEndCell: TargetResolver = (ctx) =>
  calendar(ctx).getByRole("button", { name: /, Friday, February 7, 2025/ });
/**
 * The roving-focus seed for the D5 arrow walk — the single cell button carrying
 * `tabindex="0"` (the `focusedValue` cell = day 15 here). Resolved by roving
 * tabindex, NOT by name, precisely because D10 re-runs this walk under `ar-AE`
 * where the cell's localized aria-label is Arabic: only the roving tabindex is
 * locale-independent, and both stacks put `tabIndex 0` on exactly the focused
 * cell (`createRangeCalendarCell` buttonProps `isFocused ? 0 : -1`).
 */
const rovingCell: TargetResolver = (ctx) => calendar(ctx).locator('[role="button"][tabindex="0"]');

const rangeCalendarPaintScenario: DriverScenario = {
  slug: "rangecalendar",
  title: "RangeCalendar",
  // D1 target: the range-start cell (day 3), whose treatment changes per case.
  target: rangeStartCell,
  parts: {
    // The grid container — border/geometry; where multi-month layout shows.
    grid,
    // The range interior + tail — the two other distinct range-cell treatments.
    rangeMiddle: rangeMiddleCell,
    rangeEnd: rangeEndCell,
  },
  // D3 pixels the whole application root so the accent endpoints, the presentation
  // range background/border layers, the unavailable strike, the header title and
  // the prev/next nav tokens rasterize as one crop (the day-3 D1 target cannot see
  // the header or its own presentation siblings).
  pixelTarget: calendar,
  cases: [
    // The resting 3→7 range — accent pill head/tail + presentation interior.
    { id: "default", params: {} },
    // Unavailable dates (10-11) render the strike treatment outside the range.
    { id: "unavailable", params: { unavailableDates: "true" } },
    // Invalid — the range fill + border go negative and the error text renders.
    {
      id: "invalid",
      params: { isInvalid: "true", errorMessage: "Choose a valid date range." },
    },
    // Two-month layout — heading compaction + flush grids.
    { id: "multimonth", params: { visibleMonths: "2" } },
    // Disabled calendar — cells + nav dim and drop their affordances.
    { id: "disabled", params: { isDisabled: "true" } },
  ],
  states: ["default"],
  // The default allowlist covers fill/border/radius/outline/shadow/geometry/
  // transition longhands and text color/font. Add grid placement so a cell- or
  // grid-template regression (multi-month, seven-column geometry) surfaces.
  styleProps: {
    add: ["box-sizing", "grid-template-columns", "grid-template-rows"],
  },
  // D7: the day-number, heading and error-message contrast on the resting (range
  // fill) and invalid colours, both themes. Rooted at the calendar root so the
  // header and error text are measured alongside the grid.
  contrast: {
    cases: ["default", "invalid"],
    root: calendar,
  },
  // D8: the calendar hit targets (day cells + prev/next nav buttons); rooted at
  // the calendar root so the nav buttons (outside the grid) are measured too.
  targetSize: {
    cases: ["default", "disabled"],
    root: calendar,
  },
};

const rangeCalendarBehaviorScenario: DriverScenario = {
  slug: "rangecalendar",
  title: "RangeCalendar",
  target: rovingCell,
  cases: [
    // Single-month, day-15 focused — the deterministic arrow-walk seed (the range
    // stays 3→7; focusedValue only moves the roving cell, not the selection).
    { id: "default", params: { focusedValue: "2025-02-15" } },
  ],
  // D5 — the day grid's arrow keyboard model. Programmatic focus on the roving
  // day-15 cell (already tabIndex 0 under focusedValue), then walk the day/week
  // axes; the trail (active cell descriptor + full roving-tabindex layout) is
  // scoped to the calendar subtree and pair-diffed entry-for-entry. Pure grid nav
  // only — no PageUp/Down/Home/End so the month page never changes mid-walk.
  focus: {
    cases: ["default"],
    root: calendar,
    walks: [
      {
        id: "grid-nav",
        keys: ["ArrowRight", "ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"],
      },
    ],
  },
  // D6 — the resting application subtree: the grid role, the seven `<th scope>`
  // weekday headers, the gridcell/button cell names, the `aria-selected` range
  // (days 3-7) + roving states, the live heading, and the prev/next nav button
  // names, pair-diffed vs the S2 oracle.
  ax: {
    cases: ["default"],
    roots: {
      calendar,
    },
  },
};

// PAINT — D1 / D3 / D7 / D8 / D9.
registerStateMatrixDriver(rangeCalendarPaintScenario);
registerPixelDriver(rangeCalendarPaintScenario);
registerContrastDriver(rangeCalendarPaintScenario);
registerTargetSizeDriver(rangeCalendarPaintScenario);
registerForcedColorsDriver(rangeCalendarPaintScenario);

// BEHAVIOR — D5 / D6 / D10 (RTL focus-only: certifies the arrow flip).
registerFocusTrailDriver(rangeCalendarBehaviorScenario);
registerAxTreeDriver(rangeCalendarBehaviorScenario);
registerRtlDriver(rangeCalendarBehaviorScenario, { focusOnly: true });
