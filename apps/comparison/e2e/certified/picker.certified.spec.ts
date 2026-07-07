import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerForcedColorsDriver } from "../drivers/forced-colors";
import { registerPixelDriver } from "../drivers/pixel";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 4 opener, collection + overlay): Picker.
 *
 * Picker = a field TRIGGER button (the collapsed `pickerButton` painting the
 * selected value + chevron) composed with a portaled `role="listbox"` popover of
 * `role="option"` rows. Two scenarios certify the two paint surfaces, mirroring
 * actionmenu.certified.spec.ts (trigger + list):
 *
 *   1. TRIGGER (closed) — the always-rendered field button measured in the
 *      canvas. Certifies the `pickerButton` field surface (`fieldInput`,
 *      `focusRing`, the value truncation + chevron) across the S2 control size
 *      matrix (S/M/L) and the `isQuiet` variant, in the resting, focus-visible,
 *      and hover states. Open-on-press is a `Select`/collection interaction
 *      (D4), not the button's paint, so `pressed` is out of scope here.
 *
 *   2. LIST (opened) — the portaled listbox + its option rows. Beyond the
 *      list-box paint this certifies the SELECTED-OPTION CHECKMARK fix: the
 *      checkmark's `visibility: { default: hidden, isSelected: visible }` toggle
 *      is routed through the icon's RAW `class` (mirroring upstream S2's
 *      `className`), NOT the icon `styles` override — which filters through
 *      `iconAllowedOverrides` (faithfully lacking `visibility`) and silently
 *      stripped the toggle, painting the checkmark on every row. `visibility` is
 *      added to the style allowlist and asserted on BOTH a selected checkmark
 *      part (visible) and an unselected one (hidden), so the fix is pinned in
 *      both directions against the React oracle.
 *
 * OVERLAY PATTERN (mirrors menu/actionmenu): the listbox portals to a page-level
 * container, so LIST targets resolve from `page`, not `canvas`. Both panels share
 * the route, so `beforePanel` opens ONE panel's listbox at a time (clicks THIS
 * panel's trigger); `forEachScenarioPanel`'s per-panel fresh `page.goto`
 * guarantees isolation. The TRIGGER scenario has no `beforePanel`.
 *
 * FIXTURE — the comparison Picker (`picker-demo.ts`) renders label "Plan" over
 * three options (Starter / Pro / Enterprise) with `selectedKey: "pro"`, so on
 * open the selected row is "Pro" (its checkmark visible) and Starter/Enterprise
 * are unselected (checkmark hidden).
 *
 * SCOPE — applicable drivers: D1 (state-matrix styles), D3 (pixel), D5 (focus:
 * Tab in/out of the trigger; arrow-key roving through the open list), D6 (AX:
 * the trigger's button semantics; the `role="listbox"` subtree + per-option
 * `aria-selected`), D7 (contrast: value text on the field; option copy on
 * `layer-2`), D8 (target size: trigger + option hit areas), D9 (forced colors),
 * D10 (RTL: the trigger value/chevron mirrored under `ar-AE`; the open list's
 * option roving re-run under RTL). The Picker fixture routes `?locale` into the
 * S2 `Provider` (picker-demo.ts `pickerDemoLocaleFromWindow`), matching the
 * button/accordion locale wiring, so the D10 driver's `locale: "ar-AE"` case
 * merge flips both stacks to `dir="rtl"`.
 * NOT registered here:
 *   - D2 (motion): the popover enter/exit fade is the hand-rolled Picker popover
 *     surface concern shared with Menu's overlay-realignment follow-up.
 *   - D4 (events): open-on-press, type-ahead, `onSelectionChange`, focus
 *     restoration are `Select`/collection interaction behaviors, covered by
 *     picker-visual.spec.ts, not the surfaces' paint.
 */

/** The closed field trigger `button[aria-haspopup=listbox]` in THIS panel. Its
 *  accessible name is dynamic ("Pro Plan"), so resolve by the haspopup role. */
const triggerButton: TargetResolver = ({ canvas }) =>
  canvas.locator("button[aria-haspopup='listbox']").first();
/** The trigger's selected-value text ("Pro"). */
const triggerValue: TargetResolver = ({ canvas }) =>
  canvas.locator("button[aria-haspopup='listbox']").first().getByText("Pro", { exact: true });
/** The trigger's chevron `<svg>` — the TRAILING glyph in the default,
 *  non-invalid, non-loading state.
 *
 *  SELECTVALUE CONTENT-MIRROR divergence (documented, paint-identical): upstream
 *  RAC `SelectValue` clones the ENTIRE selected item's rendered node into the
 *  collapsed trigger — for "Pro" that is `[checkmark <svg>, <Text slot=label>]` —
 *  then S2 hides every direct child except the icon/avatar/label slots with a
 *  `&> :not([slot=icon],[slot=avatar],[slot=label],[data-slot=label]) {display:none}`
 *  rule (Picker.tsx:668). So React's trigger carries a LEADING `display:none`
 *  checkmark `<svg>` before the chevron. Our headless `SelectValue` mirrors the
 *  selected `selectedText` (label only), not the whole node, so it has no hidden
 *  checkmark — a paint-identical structural divergence (the extra svg is
 *  `display:none`). Tracked follow-up: mirror the full selected node (so a
 *  selected item's `icon`/`avatar` slot survives into the trigger). Resolving the
 *  chevron as the TRAILING svg (`.last()`) targets the same painted glyph in both
 *  stacks regardless of the mirrored hidden checkmark. */
const triggerChevron: TargetResolver = ({ canvas }) =>
  canvas.locator("button[aria-haspopup='listbox']").first().locator("svg").last();

/** The portaled `ul[role="listbox"]` (one open per panel via per-panel goto). */
const listbox: TargetResolver = ({ page }) => page.getByRole("listbox").first();

/** The first `role="option"` ("Starter") — its subgrid + row paint. */
const firstOption = (page: Page) => page.getByRole("listbox").first().getByRole("option").first();
const option: TargetResolver = ({ page }) => firstOption(page);
/** The option's label text. */
const optionLabel: TargetResolver = ({ page }) =>
  firstOption(page).getByText("Starter", { exact: true });
/** The SELECTED option's ("Pro") checkmark `<svg>` — must be `visibility: visible`. */
const checkmarkSelected: TargetResolver = ({ page }) =>
  page.getByRole("option", { name: "Pro" }).locator("svg").first();
/** An UNSELECTED option's ("Starter") checkmark `<svg>` — must be `visibility: hidden`. */
const checkmarkUnselected: TargetResolver = ({ page }) =>
  page.getByRole("option", { name: "Starter" }).locator("svg").first();

/** Click this panel's trigger to open its (and only its) listbox. */
const openPicker = async ({ canvas, page }: PanelContext) => {
  await canvas.locator("button[aria-haspopup='listbox']").first().click();
  await expect(page.getByRole("listbox").first()).toBeVisible();
};

/** Best-effort close before the next panel (isolation is the per-panel `goto`);
 *  NEVER asserts — close-on-Escape is a D4 trigger contract, not the list's. */
const closePicker = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/** Scenario 1 — the closed field trigger across the S2 size matrix + `isQuiet`,
 *  in the resting/focus-visible/hover states (open-on-press is D4, excluded). */
const triggerScenario: DriverScenario = {
  slug: "picker",
  title: "Picker trigger",
  target: triggerButton,
  pixelTarget: triggerButton,
  states: ["default", "focus-visible", "hover"],
  cases: [
    { id: "size-s", params: { size: "S" } },
    { id: "size-m", params: { size: "M" } },
    { id: "size-l", params: { size: "L" } },
    { id: "quiet-m", params: { size: "M", isQuiet: "true" } },
  ],
  parts: {
    value: triggerValue,
    chevron: triggerChevron,
  },
  // D5: Tab enters/leaves the trigger identically in both panels.
  focus: {
    cases: ["size-m"],
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] }],
  },
  // D7: the selected value text on the field background, all states, both themes.
  contrast: {
    cases: ["size-m"],
    root: triggerButton,
  },
  // D6: the trigger's button semantics (role, `aria-haspopup=listbox`,
  // `aria-expanded=false`, accessible name via the field label).
  ax: {
    cases: ["size-m"],
    roots: {
      trigger: triggerButton,
    },
  },
  // D8: the trigger's border-box hit area.
  targetSize: {
    cases: ["size-m"],
    root: triggerButton,
  },
};

/** Scenario 2 — the opened listbox + option rows. Certifies the selected-option
 *  checkmark fix (visibility toggle routed through raw `class`, not the filtered
 *  icon `styles` override). */
const listScenario: DriverScenario = {
  slug: "picker",
  title: "Picker list",
  beforePanel: openPicker,
  afterPanel: closePicker,
  target: listbox,
  pixelTarget: listbox,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S" } },
    { id: "size-m", params: { size: "M" } },
    { id: "size-l", params: { size: "L" } },
  ],
  parts: {
    option: option,
    label: optionLabel,
    checkmarkSelected: checkmarkSelected,
    checkmarkUnselected: checkmarkUnselected,
  },
  // Add the option grid tracks (the `menuItem`-derived subgrid the option paints)
  // and — the crux of the checkmark fix — `visibility`, so the checkmark parts
  // assert the `hidden`/`visible` selection toggle against the React oracle
  // (`visibility` is not in the default allowlist).
  styleProps: {
    add: ["grid-template-columns", "grid-template-areas", "visibility"],
    // VIRTUALIZER-DECOMPOSITION divergence (documented, paint-identical): upstream
    // S2 wraps the ListBox in a `<Virtualizer layout={ListLayout} layoutOptions={{
    // padding: 8 }}>`, so the 8px list inset lives in the virtualizer LAYOUT and
    // the listbox ELEMENT computes `padding: 0`. Our port is non-virtualized and
    // expresses the same inset as CSS `padding: 8` on the listbox element. The net
    // option insets are identical (asserted by picker-visual.spec.ts), so the
    // `padding` channel (0 ↔ 8) is dropped here. Precedent: menu's outline-color.
    remove: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  },
  // D7: the option label copy on the `layer-2` listbox surface, both themes.
  contrast: {
    cases: ["size-m"],
    root: listbox,
  },
  // D5: arrow-key roving through the open list. `root: listbox` scopes the
  // roving-tabindex snapshot to the `role="listbox"` (the deferred popover
  // surface stays out of the trail). `entry: "keyboard"` drives the real
  // keyboard path both stacks share — the Picker autofocuses the SELECTED option
  // ("Pro") on open, so the walk starts from there in both stacks instead of a
  // synthetic `.focus()` that would seed `focusedKey` divergently.
  focus: {
    cases: ["size-m"],
    root: listbox,
    walks: [
      {
        id: "arrow-roving",
        start: listbox,
        entry: "keyboard",
        keys: ["ArrowUp", "ArrowDown", "ArrowDown", "Home", "End"],
      },
    ],
  },
  // D6: the `role="listbox"` subtree — roles/names/states, including per-option
  // `aria-selected` (the selected "Pro" row is the single `aria-selected=true`).
  ax: {
    cases: ["size-m"],
    roots: {
      listbox: listbox,
    },
  },
  // D8: the option row border-box hit area.
  targetSize: {
    cases: ["size-m"],
    root: listbox,
  },
};

registerStateMatrixDriver(triggerScenario);
registerPixelDriver(triggerScenario);
registerFocusTrailDriver(triggerScenario);
registerAxTreeDriver(triggerScenario);
registerContrastDriver(triggerScenario);
registerTargetSizeDriver(triggerScenario);
registerForcedColorsDriver(triggerScenario);
registerRtlDriver(triggerScenario, { cases: ["size-m"] });

registerStateMatrixDriver(listScenario);
registerPixelDriver(listScenario);
registerFocusTrailDriver(listScenario);
registerAxTreeDriver(listScenario);
registerContrastDriver(listScenario);
registerTargetSizeDriver(listScenario);
registerForcedColorsDriver(listScenario);
registerRtlDriver(listScenario, { cases: ["size-m"] });
