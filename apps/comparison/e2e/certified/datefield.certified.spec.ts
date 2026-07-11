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
 * Recertification march unit (Tier 5, date/time/color — unit 3): DateField.
 * Certified pair-oracle against the styled React Spectrum S2 DateField. The
 * React panel renders `@react-spectrum/s2` `DateField` directly; the Solid
 * panel renders `@proyecto-viviana/solid-spectrum` `DateField` (its port of the
 * same S2 macro). Both are the "Appointment date" field pinned to 2025-02-03
 * (`datefield-demo.ts`), so segment values, placeholder shapes, and paint are
 * stable across runs and stacks.
 *
 * This unit supersedes the pre-certified `e2e/datefield-visual.spec.ts` by
 * re-expressing its coverage in the certified `register*Driver` pair-oracle
 * form, where real Chromium drives focus/AX/pixels side by side.
 *
 * DateField is NOT a calendar grid — it is a SEGMENTED SPINBUTTON text input:
 * a roleless field root wrapping a labelled `role="group"` of per-part
 * `role="spinbutton"` segments (month/day/year plus `aria-hidden` literals),
 * each an independent tab stop (`tabIndex 0` on every editable segment — no
 * roving), spun with ArrowUp/Down + PageUp/Down + Home/End, typed into with
 * digit auto-advance, cleared with Backspace, and walked with ArrowLeft/Right
 * via the group's keyboard layer (react-aria `useDatePickerGroup`). The oracle
 * shape therefore differs from Calendar/RangeCalendar on every axis:
 *
 *   PAINT (`dateFieldPaintScenario`) — D1 state-matrix, D3 pixel, D7 contrast,
 *   D8 target size, D9 forced colors. D1 target = the month segment (the S2
 *   `dateSegment` macro paints `isFocused` as an accent fill with inverted
 *   text, and `isPlaceholder` shifts color), with the styled FieldGroup shell,
 *   the inner `role="group"` (upstream carries `unicode-bidi: isolate` on
 *   both), the day segment (unfocused treatment while month is focused) and
 *   the help-text row as parts. States = default + focus-visible only: the S2
 *   `dateSegment` macro has no hover branch, and segments have no press state
 *   (press lives on the group for focus management), so hover/pressed capture
 *   nothing and `data-pressed` readiness would never fire. The prop-driven
 *   case matrix (default / placeholder / invalid / disabled / readonly) is
 *   the styling space that actually varies; `disabled` is capture-at-rest
 *   (upstream drops the segments' `tabIndex` entirely when disabled, so there
 *   is nothing to focus). D3 rasterizes the field root (label + FieldGroup +
 *   invalid icon + help text) as one crop. D9 re-runs D1 under forced colors
 *   (upstream `dateSegment` has explicit `forcedColors` Highlight branches +
 *   `forcedColorAdjust: none` on the focused fill).
 *
 *   BEHAVIOR (`dateFieldBehaviorScenario`) — D5 focus trails, D6 AX tree +
 *   spin announcements, D10 RTL (FULL: state-matrix + focus halves).
 *   - D5: `segment-nav` (ArrowRight/Left through month→day→year and back, the
 *     `useDatePickerGroup` focus-manager layer), `tab-walk` (every editable
 *     segment is a real tab stop; the trail's roving layout also pins the
 *     always-rendered HiddenDateInput `<input tabindex="-1" type="date">` —
 *     clipped but visible to `checkVisibility`, so it appears in the layout
 *     and a port that omits it diverges), `spin-keys` (ArrowUp/PageUp/End/
 *     Home/ArrowDown must NOT move focus — upstream routes them to the
 *     spinbutton value model; a port that invents Home/End = first/last
 *     segment navigation diverges here), `typed-entry` (typing "2" in the
 *     month maxes it → auto-advance to day; "1" in the day stays), and
 *     `backspace` (clearing the day keeps focus; Backspace on a placeholder
 *     segment moves focus to the previous segment).
 *   - D6 tree across all five cases: the group placement (label + help text
 *     OUTSIDE the group, roleless root), composed segment names (react-aria
 *     `useLabels`: "month, Appointment date" from self + field label, via
 *     `useDisplayNames`), literals hidden, per-case [disabled]/[readonly]
 *     states, and the accessible-description pass (the `useDescription`
 *     "Selected Date: …" node referenced from the FieldGroup, the group, and
 *     the first editable segment — absent in the placeholder case; invalid
 *     spreads the describedby to every editable segment).
 *   - D6 announcements: value changes are invisible to D5 trails (segment
 *     accessible names do not include values), so the spinbutton value model
 *     is certified through the assertive live-region announcements react-aria
 *     `useSpinButton` emits on change while focused: `spin-up` (ArrowUp →
 *     "3 – March": increment + the month segment's long-form valuetext),
 *     `page-up` (PageUp → "4 – April": the ±2 month page step), `end-max`
 *     (End → "12 – December": incrementToMax — NOT segment navigation).
 *     Announce runs per case: disabled/readonly must produce IDENTICAL empty
 *     transcripts (the segment is unfocusable / the spin model is read-only).
 *   - D10 FULL under `ar-AE`: the state-matrix half diffs the group and the
 *     month segment with `direction` + `unicode-bidi` — upstream numeric
 *     segments carry explicit `direction: ltr; unicode-bidi: embed` inside
 *     the RTL group (which is why the behavior target is the GROUP: the RTL
 *     sanity assertion requires computed `direction: rtl` on the scenario
 *     target, and a segment is never rtl). The focus half re-runs all five
 *     walks: ar-AE orders segments day/month/year in the DOM and
 *     `useDatePickerGroup` maps ArrowLeft/Right GEOMETRICALLY in RTL, so the
 *     trails certify the flip; walks start from the month segment resolved by
 *     locale-independent `data-type`.
 *
 * SCOPED OUT (documented, not silent):
 *   - D2 motion — the S2 DateField has no mount/enter animation (only the
 *     transition longhands D1 already pins).
 *   - D4 event sequence — the value-change event surface (onChange payloads,
 *     ordering) is wired differently by the two fixtures (React onChange vs
 *     Solid controlled accessor); the observable interaction semantics are
 *     pinned by D5 trails + D6 announcements, the state math by the
 *     `createDateFieldState` unit suite, and the event surface itself belongs
 *     to the composed DatePicker unit later in this tier (the NumberField/
 *     RangeCalendar precedent).
 *   - Time granularities (hour/minute/second, hourCycle, hideTimeZone, zoned
 *     values) — the same segment machinery on time segments, owned by the
 *     TimeField unit (NEXT in the march); certifying them here would
 *     duplicate that unit's whole oracle.
 *   - RTL paint of the full paint matrix — D10 runs on the behavior scenario;
 *     the bidi-critical properties (`direction`, `unicode-bidi`) are diffed
 *     there on the group + month segment, and LTR paint is fully covered by
 *     the paint scenario.
 *   - The in-group native-validation `<input hidden type="text">` (upstream
 *     RAC `DateInputInner`) — display:none and unfocusable, so no driver can
 *     observe it; landed by parity in the fix, certified indirectly via the
 *     form-integration unit tests.
 */

/** The fixture wrapper both stacks render around the component. */
const root = '[data-comparison-control-root="datefield"]';

/** The control root — includes the HiddenDateInput sibling of the field root. */
const controlRoot: TargetResolver = ({ canvas }) => canvas.locator(root);
/** The field root (S2 field grid; roleless upstream) — both fixtures class it. */
const fieldRoot: TargetResolver = ({ canvas }) => canvas.locator(".comparison-datefield-root");
/**
 * The segment group — the ONE `role="group"` named from the field label. On
 * the React oracle this is the inner `DateInput` group (the styled FieldGroup
 * is `role="presentation"`, the root roleless); resolving by role+name finds
 * exactly one node per panel on both stacks, and the demo label stays English
 * under `ar-AE`, so the resolver is locale-independent.
 */
const segmentGroup: TargetResolver = ({ canvas }) =>
  canvas.getByRole("group", { name: "Appointment date" });
/**
 * Editable segments, resolved by `data-type` (present on both stacks and
 * locale-independent — under `ar-AE` the DOM order flips to day/month/year but
 * the types don't).
 */
const monthSegment: TargetResolver = ({ canvas }) =>
  canvas.locator('[role="spinbutton"][data-type="month"]');
const daySegment: TargetResolver = ({ canvas }) =>
  canvas.locator('[role="spinbutton"][data-type="day"]');
/** The styled FieldGroup shell — second field-grid child (label wrap / FieldGroup / help text). */
const fieldGroup: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-datefield-root > div:nth-child(2)");
/** The help-text row — description by default, the error row when invalid. */
const helpText: TargetResolver = ({ canvas }) =>
  canvas.locator(".comparison-datefield-root > :nth-child(3)");

const dateFieldPaintScenario: DriverScenario = {
  slug: "datefield",
  title: "DateField",
  // D1 target: the month segment — the S2 `dateSegment` macro's focused accent
  // fill / inverted text and the placeholder color live here.
  target: monthSegment,
  parts: {
    // The styled FieldGroup shell — border/background/focus-ring + the
    // fieldProps/unicode-bidi carrier on the oracle.
    fieldGroup,
    // The inner segment group — `unicode-bidi: isolate` + padding upstream.
    group: segmentGroup,
    // The day segment — the unfocused segment treatment while month is driven.
    daySegment,
    // The description/error row (span-based upstream; `<p>`/`role=alert` is a
    // port divergence this part + D6 pin).
    helpText,
  },
  // D3 rasterizes the field root: label + FieldGroup (segments, literals,
  // invalid icon) + help text as one crop. The HiddenDateInput is clipped
  // position:fixed chrome with no paint.
  pixelTarget: fieldRoot,
  cases: [
    // The resting 2025-02-03 value.
    { id: "default", params: {} },
    // No value — every segment renders its localized placeholder.
    { id: "placeholder", params: { value: "" } },
    // Invalid — error help text + InvalidIndicator icon inside the group.
    { id: "invalid", params: { isInvalid: "true" } },
    // Disabled — capture at rest: upstream segments DROP tabIndex entirely
    // (nothing to focus) and dim via the FieldGroup, not per-segment colors.
    { id: "disabled", params: { isDisabled: "true" }, states: ["default"] },
    // Read-only — segments stay real tab stops (tabIndex 0) but drop the
    // editable-only attributes; paint must not change.
    { id: "readonly", params: { isReadOnly: "true" } },
  ],
  // No hover branch in the S2 dateSegment macro and no press state on
  // segments (press lives on the group) — default + focus-visible only.
  states: ["default", "focus-visible"],
  styleProps: {
    // unicode-bidi pins the group/segment isolation model in LTR too;
    // box-sizing + minimums are where segment geometry regressions surface.
    add: ["unicode-bidi", "box-sizing", "min-width", "white-space"],
  },
  // D7: label / segment / help-text contrast on resting, invalid and disabled
  // colours, both themes, incl. the focused segment's inverted text.
  contrast: {
    cases: ["default", "invalid", "disabled"],
    root: fieldRoot,
  },
  // D8: the segments are the hit targets (pair-diff; the 24px floor is a
  // reported note, not an assertion, on this Tier-5 paired surface).
  targetSize: {
    cases: ["default"],
    root: fieldRoot,
  },
};

const dateFieldBehaviorScenario: DriverScenario = {
  slug: "datefield",
  title: "DateField",
  // The GROUP is the scenario target: D10's sanity assertion requires computed
  // `direction: rtl` on the target under ar-AE, and upstream numeric segments
  // carry explicit `direction: ltr` (unicode-bidi embed) — a segment can never
  // satisfy it. Walks start from the month segment via `start`.
  target: segmentGroup,
  parts: {
    // The month segment rides along in the D10 state-matrix half so its
    // RTL-only `direction: ltr; unicode-bidi: embed` override is diffed.
    monthSegment,
  },
  cases: [
    { id: "default", params: {} },
    { id: "placeholder", params: { value: "" } },
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "disabled", params: { isDisabled: "true" } },
    { id: "readonly", params: { isReadOnly: "true" } },
  ],
  states: ["default"],
  styleProps: {
    add: ["unicode-bidi"],
  },
  // D5 — the segment keyboard model. The roving layout is scoped to the
  // control root so the HiddenDateInput sibling (`<input tabindex="-1"
  // type="date">`, clipped but checkVisibility-visible) is pinned in every
  // trail entry alongside the three tabIndex-0 segments.
  focus: {
    cases: ["default"],
    root: controlRoot,
    walks: [
      // useDatePickerGroup ArrowLeft/Right: month → day → year → day → month.
      {
        id: "segment-nav",
        start: monthSegment,
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"],
      },
      // Every editable segment is a real tab stop: month → day → year → day.
      { id: "tab-walk", start: monthSegment, keys: ["Tab", "Tab", "Shift+Tab"] },
      // Spin keys route to the spinbutton value model and must NOT move focus
      // (an invented Home/End = first/last-segment navigation diverges here);
      // the value effects are certified by the D6 announcements below.
      {
        id: "spin-keys",
        start: monthSegment,
        keys: ["ArrowUp", "PageUp", "End", "Home", "ArrowDown"],
      },
      // Typed entry: "2" maxes the month (20 > 12) → auto-advance to day;
      // "1" in the day (10 ≤ 28) stays put accumulating.
      { id: "typed-entry", start: monthSegment, keys: ["2", "1"] },
      // Backspace: clearing the day (3 → placeholder) keeps focus on it;
      // Backspace on the now-placeholder segment focuses the previous (month).
      { id: "backspace", start: daySegment, keys: ["Backspace", "Backspace"] },
    ],
  },
  // D6 — the resting AX tree per case (group placement, composed spinbutton
  // names, literal hiding, [disabled]/[readonly] states, the "Selected Date:"
  // description graph) + the spin announcements (assertive live region from
  // useSpinButton on value change while focused; empty-for-empty on the
  // disabled/readonly cases).
  ax: {
    cases: ["default", "placeholder", "invalid", "disabled", "readonly"],
    roots: {
      field: controlRoot,
    },
    announce: [
      {
        id: "spin-up",
        run: async (ctx) => {
          await monthSegment(ctx).focus();
          await ctx.page.waitForTimeout(120);
          await ctx.page.keyboard.press("ArrowUp");
        },
      },
      {
        id: "page-up",
        run: async (ctx) => {
          await monthSegment(ctx).focus();
          await ctx.page.waitForTimeout(120);
          await ctx.page.keyboard.press("PageUp");
        },
      },
      {
        id: "end-max",
        run: async (ctx) => {
          await monthSegment(ctx).focus();
          await ctx.page.waitForTimeout(120);
          await ctx.page.keyboard.press("End");
        },
      },
    ],
  },
};

// PAINT — D1 / D3 / D7 / D8 / D9.
registerStateMatrixDriver(dateFieldPaintScenario);
registerPixelDriver(dateFieldPaintScenario);
registerContrastDriver(dateFieldPaintScenario);
registerTargetSizeDriver(dateFieldPaintScenario);
registerForcedColorsDriver(dateFieldPaintScenario);

// BEHAVIOR — D5 / D6 / D10 (FULL: RTL state matrix on the group + month
// segment bidi overrides, plus every walk re-run under ar-AE).
registerFocusTrailDriver(dateFieldBehaviorScenario);
registerAxTreeDriver(dateFieldBehaviorScenario);
registerRtlDriver(dateFieldBehaviorScenario);
