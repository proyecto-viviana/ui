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
 * Recertification march unit (Tier 5, date/time/color — the OPENER): Calendar.
 * Certified pair-oracle against the styled React Spectrum S2 Calendar. The React
 * panel renders `@react-spectrum/s2` `Calendar` directly; the Solid panel renders
 * `@proyecto-viviana/solid-spectrum` `Calendar` (its port of the same S2 macro).
 * Both are the "Event date" calendar, mounted on the deterministic February 2025
 * anchor (`calendar-demo.ts` pins minValue 2025-02-03 / maxValue 2025-02-20 and
 * marks days 10-11 unavailable), so every grid geometry, cell name, and paint is
 * stable across runs and across stacks.
 *
 * This unit supersedes the two pre-certified Calendar specs
 * (`e2e/calendar-visual.spec.ts` strict pixel + forced-colors contracts,
 * `e2e/calendar-contract.spec.ts` role/AX + keyboard + `ar-AE` arrow-flip) by
 * re-expressing their coverage in the certified `register*Driver` pair-oracle
 * form, where the browser drives real Chromium focus/AX/pixels side-by-side.
 *
 * Calendar owns BOTH surfaces (like TagGroup, CP9.44) — a single publicly styled
 * S2 component that is its own base — so the cert splits into two scenarios in
 * this one file:
 *
 *   PAINT (`calendarPaintScenario`) — D1 state-matrix, D3 pixel, D7 contrast,
 *   D8 target size, D9 forced colors. The prop-driven case matrix (selected /
 *   unavailable / invalid / multi-month / disabled) is captured at rest: these
 *   are the styling states that actually vary, and where a port condition-
 *   threading bug surfaces. D1 target = the day-3 cell button (its state —
 *   selected fill / invalid / disabled dim — changes per case); the grid
 *   container is diffed alongside as a part (border/geometry, where multi-month
 *   layout shows). D3 rasterizes the whole `role="application"` root together so
 *   the selection fill, the unavailable strike layer, and the header/nav tokens
 *   are pixel-diffed as one crop (mirroring the old `fixedCalendarRootScreenshot`
 *   pair diff). D9 re-runs the D1 capture under forced-colors — the old spec's
 *   selected-paint / unavailable-strike / error-text forced-colors contract.
 *
 *   BEHAVIOR (`calendarBehaviorScenario`) — D5 focus trail over the grid's arrow
 *   keyboard model, D6 AX tree of the resting `role="application"` subtree, D10
 *   RTL. The day grid is a roving-tabindex `role="grid"` of `role="gridcell"`
 *   cells whose inner `role="button"` carries the localized full-date accessible
 *   name; arrows walk the week/day axes (`createCalendarGrid` handleKeyDown). D10
 *   re-runs the SAME arrow walk under `ar-AE` (focus-only) to certify the RTL
 *   flip — ArrowRight moves to the PREVIOUS day under `dir="rtl"`
 *   (`createCalendarGrid.ts:66-83`) — is identical on both stacks. Both fixtures
 *   thread `locale` into their Provider, so `ar-AE` renders a true RTL container.
 *
 * SCOPED OUT (documented, not silent):
 *   - D2 motion — the S2 Calendar has no mount/enter animation of its own (only
 *     the `transition` longhands that D1 already pins).
 *   - D4 event sequence — the only interaction that mutates value is date
 *     selection (a click/Enter on a cell); its focus/roving contract is pinned by
 *     D5, and the value-change event surface is better certified on the composed
 *     DatePicker unit later in this tier.
 *   - RTL PAINT — D10 runs focus-only; LTR paint is captured in full by the paint
 *     scenario, and the RTL grid is DOM-order-mirrored (arrow flip is the
 *     behavioral divergence, certified by the RTL focus walk).
 */

/** The Calendar root — both stacks expose `role="application"` named "Event date …". */
const calendar: TargetResolver = ({ canvas }) =>
  canvas.getByRole("application", { name: /Event date/i });
/** The first (or only) day grid — `role="grid"` (`<table>`). */
const grid: TargetResolver = (ctx) => calendar(ctx).getByRole("grid").first();
/**
 * The day-3 cell button — present in every case (Feb view always shows day 3),
 * and the element whose paint state varies across the case matrix (unselected →
 * selected fill → invalid → disabled dim). Resolved by the stable date part of
 * its localized accessible name so a `selected`/`today` name suffix can't miss it.
 */
const dayThreeCell: TargetResolver = (ctx) =>
  calendar(ctx).getByRole("button", { name: /February 3, 2025/ });
/**
 * The roving-focus seed for the D5 arrow walk — the single cell button carrying
 * `tabindex="0"` (the `focusedValue` cell = day 15 here). Resolved by roving
 * tabindex, NOT by name, precisely because D10 re-runs this walk under `ar-AE`
 * where the cell's localized aria-label is Arabic: only the roving tabindex is
 * locale-independent, and both stacks put `tabIndex 0` on exactly the focused
 * cell (`createCalendarCell` buttonProps `isFocused ? 0 : -1`).
 */
const rovingCell: TargetResolver = (ctx) => calendar(ctx).locator('[role="button"][tabindex="0"]');

const calendarPaintScenario: DriverScenario = {
  slug: "calendar",
  title: "Calendar",
  // D1 target: the day-3 cell, whose treatment changes per case below.
  target: dayThreeCell,
  parts: {
    // The grid container — border/geometry; where multi-month layout shows.
    grid,
  },
  // D3 pixels the whole application root so the selection fill, the unavailable
  // strike layer, the header title and the prev/next nav tokens rasterize as one
  // crop (the day-3 D1 target cannot see the header or the aria-hidden strike).
  pixelTarget: calendar,
  cases: [
    // Unselected grid, day-15 focused (no painted selection).
    { id: "default", params: { focusedValue: "2025-02-15" } },
    // Controlled selection — day 3 carries the selection fill.
    { id: "selected", params: { value: "2025-02-03" } },
    // Unavailable dates (10-11) render the strike treatment; day 3 selected.
    { id: "unavailable", params: { value: "2025-02-03", unavailableDates: "true" } },
    // Invalid — the selected cell goes aria-invalid + the error text renders.
    {
      id: "invalid",
      params: {
        value: "2025-02-03",
        isInvalid: "true",
        errorMessage: "Choose an available date.",
      },
    },
    // Two-month layout — heading compaction + flush grids.
    { id: "multimonth", params: { focusedValue: "2025-02-15", visibleMonths: "2" } },
    // Disabled calendar — cells + nav dim and drop their affordances.
    { id: "disabled", params: { focusedValue: "2025-02-15", isDisabled: "true" } },
  ],
  states: ["default"],
  // The default allowlist covers fill/border/radius/outline/shadow/geometry/
  // transition longhands and text color/font. Add grid placement so a cell- or
  // grid-template regression (multi-month, seven-column geometry) surfaces.
  styleProps: {
    add: ["box-sizing", "grid-template-columns", "grid-template-rows"],
  },
  // D7: the day-number, heading and error-message contrast on the resting,
  // selected and invalid colours, both themes. Rooted at the calendar root so the
  // header and error text are measured alongside the grid.
  contrast: {
    cases: ["default", "selected", "invalid"],
    root: calendar,
  },
  // D8: the calendar hit targets (day cells + prev/next nav buttons); rooted at
  // the calendar root so the nav buttons (outside the grid) are measured too.
  targetSize: {
    cases: ["default", "disabled"],
    root: calendar,
  },
};

const calendarBehaviorScenario: DriverScenario = {
  slug: "calendar",
  title: "Calendar",
  target: rovingCell,
  cases: [
    // Single-month, day-15 focused — the deterministic arrow-walk seed.
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
  // weekday headers, the gridcell/button cell names + roving states, the live
  // heading, and the prev/next nav button names, pair-diffed vs the S2 oracle.
  ax: {
    cases: ["default"],
    roots: {
      calendar,
    },
  },
};

// PAINT — D1 / D3 / D7 / D8 / D9.
registerStateMatrixDriver(calendarPaintScenario);
registerPixelDriver(calendarPaintScenario);
registerContrastDriver(calendarPaintScenario);
registerTargetSizeDriver(calendarPaintScenario);
registerForcedColorsDriver(calendarPaintScenario);

// BEHAVIOR — D5 / D6 / D10 (RTL focus-only: certifies the arrow flip).
registerFocusTrailDriver(calendarBehaviorScenario);
registerAxTreeDriver(calendarBehaviorScenario);
registerRtlDriver(calendarBehaviorScenario, { focusOnly: true });
