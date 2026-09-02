import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerForcedColorsDriver } from "../drivers/forced-colors";
import {
  registerJourneyDriver,
  seedKeyboardOnlyJourney,
  seedOpenReopenScrollJourney,
} from "../drivers/journeys";
import { overlayJourneyAlphabet, registerJourneyFuzz } from "../drivers/journeys-fuzz";
import { registerPixelDriver } from "../drivers/pixel";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 4, first VIRTUAL-FOCUS collection): ComboBox.
 *
 * ComboBox = an editable `input[role="combobox"]` + a `button[aria-haspopup=
 * listbox]` chevron, wrapped in a `role="presentation"` FIELD GROUP (the bordered
 * box that paints the border/background/focus-ring), composed with a portaled
 * `role="listbox"` popover of `role="option"` rows. Two scenarios certify the two
 * paint surfaces, mirroring picker.certified.spec.ts (field + list).
 *
 * VIRTUAL FOCUS — the defining ComboBox difference from Picker/ListBox/GridList/
 * TagGroup. Those move REAL DOM focus onto the highlighted row; ComboBox keeps
 * real focus on the INPUT the whole time and highlights the active option purely
 * via `aria-activedescendant = ${listBoxId}-option-${focusedKey}` (upstream
 * `useComboBox.ts:481`; port `createComboBox.ts` emits it unconditionally, the
 * `shouldUseVirtualFocus` flag is passed to the rendered ListBox at the component
 * layer). The D5 focus trail certifies this directly: `snapshotFocus` records the
 * active element (stays the input) AND resolves its `aria-activedescendant` to a
 * descriptor (moves option→option as the arrows walk), so the two stacks' virtual
 * focus is pair-diffed entry-for-entry. ComboBox intentionally OMITS
 * `shouldUseInert` (it is non-modal), so no inert/aria-hidden trap is asserted.
 *
 * FIELD-GROUP-AS-PART focus ring — the field group `[role="presentation"]` is not
 * focusable, so `applyGestureState`'s `focus-visible` (`walk.ts`: `target.focus()`)
 * cannot land on it. The scenario TARGET is therefore the focusable INPUT, and the
 * field group is a PART: focusing the input lights the group's `isFocusWithin`
 * ring, which D1 captures on the `fieldGroup` part and D3 screenshots via
 * `pixelTarget`. This certifies the ring paint on the real element that carries it.
 * The input's OWN focus-visible token is kept faithful by `createComboBox`'s
 * `createFocusRing({ isTextInput: true })` (mirrors RAC `<Input>`): a pointer open
 * (chevron click) must not read as focus-visible, so the input — and, via the
 * option's activedescendant focus-visible inheritance — the highlighted option
 * stays on the resting neutral/accent tokens. NOT pair-diffed by D5: `snapshotFocus`
 * records the active element + its resolved `aria-activedescendant`, but NOT the
 * input's `data-focus-visible` attribute, so the focus trail does not compare that
 * attribute across stacks — the ring it would drive is certified by D1/D3 above.
 *
 * OVERLAY PATTERN (mirrors picker/menu): the listbox portals to a page-level
 * container, so LIST targets resolve from `page`, not `canvas`. `beforePanel`
 * opens ONE panel's listbox by clicking its chevron (a button open =
 * `showAllItems`, bypassing the input filter so all three options show); the
 * per-panel fresh `page.goto` guarantees isolation.
 *
 * FIXTURE — the comparison ComboBox (`combobox-demo.ts`) renders label "Plan" over
 * three options (Starter / Pro / Enterprise) with `selectedKey: "pro"` and
 * `inputValue: "Pro"`, so on open "Pro" is the single selected row (checkmark
 * visible) and Starter/Enterprise are unselected (checkmark hidden) — the same
 * `visibility` selection toggle certified on Picker.
 *
 * SCOPE — applicable drivers: D1 (state-matrix styles), D3 (pixel), D5 (focus: Tab
 * in/out of the field with the chevron excluded from the tab order; VIRTUAL
 * activedescendant walk through the open list), D6 (AX: the input's combobox
 * semantics + the `role="listbox"` subtree with per-option `aria-selected`), D7
 * (contrast), D8 (target size), D9 (forced colors), D10 (RTL: the field/chevron
 * mirrored under `ar-AE`, and — the crux for a portaled overlay — the popped
 * listbox inheriting `dir="rtl"`, the picker portal-locale fix re-certified here).
 * The ComboBox fixture routes `?locale` into the S2 `Provider`
 * (`comboBoxDemoLocaleFromWindow`), matching the picker/button/accordion wiring.
 * NOT registered here:
 *   - D2 (motion): the popover enter/exit fade is the hand-rolled popover surface
 *     concern shared with Menu's overlay-realignment follow-up.
 *   - D4 (events): open-on-type, filtering, `onSelectionChange`, custom-value
 *     commit, focus restoration are collection interaction behaviors, covered by
 *     combobox-visual.spec.ts, not the surfaces' paint.
 *   - D6 ANNOUNCEMENTS: the live-region "N options available" filter transcript is
 *     the never-before-exercised announce channel; it is calibrated separately as
 *     CP9.45b so a driver-calibration surprise cannot block the paint/focus cert.
 */

/** The editable `input[role="combobox"]` in THIS panel — the real focus owner and
 *  the scenario TARGET (focusable, so `focus-visible` lands here and lights the
 *  field group's focus-within ring). */
const comboBoxInput: TargetResolver = ({ canvas }) =>
  canvas.locator('input[role="combobox"]').first();
/** The `role="presentation"` FIELD GROUP wrapping the input + chevron — the box
 *  that paints the border/background/focus-ring. Parity: S2 `FieldGroup`
 *  (ComboBox.tsx:710) and the port (`combobox/index.tsx:583`) both render it as
 *  the single presentation element in the closed field. */
const fieldGroup: TargetResolver = ({ canvas }) => canvas.locator('[role="presentation"]').first();
/** The chevron `button[aria-haspopup=listbox]` — dynamic accessible name, so
 *  resolve by the haspopup role. */
const chevronButton: TargetResolver = ({ canvas }) =>
  canvas.locator("button[aria-haspopup='listbox']").first();

/** The portaled `role="listbox"` (one open per panel via per-panel goto). */
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

/** Click this panel's chevron to open its (and only its) listbox with all items
 *  (a button open is `showAllItems`, so the "Pro" input filter is bypassed). */
const openComboBox = async ({ canvas, page }: PanelContext) => {
  await canvas.locator("button[aria-haspopup='listbox']").first().click();
  await expect(page.getByRole("listbox").first()).toBeVisible();
};

/** Best-effort close before the next panel (isolation is the per-panel `goto`);
 *  NEVER asserts — close-on-Escape is a D4 interaction contract, not the list's. */
const closeComboBox = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/** Scenario 1 — the closed field across the S2 size matrix + `isInvalid`, in the
 *  resting/focus-visible/hover states. Target = the focusable input; the bordered
 *  paint lives on the `fieldGroup` part + `pixelTarget`. */
const fieldScenario: DriverScenario = {
  slug: "combobox",
  title: "ComboBox field",
  target: comboBoxInput,
  pixelTarget: fieldGroup,
  states: ["default", "focus-visible", "hover"],
  cases: [
    { id: "size-s", params: { size: "S" } },
    { id: "size-m", params: { size: "M" } },
    { id: "size-l", params: { size: "L" } },
    { id: "invalid-m", params: { size: "M", isInvalid: "true" } },
  ],
  parts: {
    fieldGroup: fieldGroup,
    chevron: chevronButton,
  },
  // D5: Tab enters the input and — the chevron being `excludeFromTabOrder` —
  // leaves the field without stopping on the button; Shift+Tab returns. Both
  // panels must produce the identical trail (same single tab stop).
  focus: {
    cases: ["size-m"],
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab"] }],
  },
  // D7: label + description contrast, both themes. (The input value lives in
  // `.value` with no child text node — like TextField/SearchField, not measured;
  // the chevron glyph is a currentColor svg with no text. So measure the field's
  // real text — the `<label>` and description — at panel scope, not `fieldGroup`.)
  contrast: {
    cases: ["size-m"],
    // The label + description live OUTSIDE the field group (the default contrast
    // root falls back to `pixelTarget` = fieldGroup, which holds no text node).
    // Measure at panel/canvas scope to reach them.
    root: ({ canvas }) => canvas,
  },
  // D6: the input's combobox semantics (role, `aria-expanded=false`,
  // `aria-controls`, accessible name via the field label) + the chevron button.
  ax: {
    cases: ["size-m"],
    roots: {
      field: fieldGroup,
    },
  },
  // D8: the field group's border-box hit area.
  targetSize: {
    cases: ["size-m"],
    root: fieldGroup,
  },
};

/** Scenario 2 — the opened listbox + option rows. Certifies the VIRTUAL-FOCUS
 *  activedescendant walk (active stays the input) and the selected-option
 *  checkmark visibility toggle (same surface/fix as Picker). */
const listScenario: DriverScenario = {
  slug: "combobox",
  title: "ComboBox list",
  beforePanel: openComboBox,
  afterPanel: closeComboBox,
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
  // Add the option grid tracks and — for the checkmark toggle — `visibility`, so
  // the checkmark parts assert the `hidden`/`visible` selection state against the
  // React oracle (`visibility` is not in the default allowlist).
  styleProps: {
    add: ["grid-template-columns", "grid-template-areas", "visibility"],
    // VIRTUALIZER-DECOMPOSITION divergence (documented, paint-identical, shared
    // with Picker): upstream S2 wraps the ListBox in a `<Virtualizer
    // layoutOptions={{ padding: 8 }}>` (ComboBox.tsx:807), so the 8px list inset
    // lives in the virtualizer LAYOUT and the listbox ELEMENT computes
    // `padding: 0`; our non-virtualized port expresses the same inset as CSS
    // `padding: 8` on the listbox element. The net option insets are identical, so
    // the `padding` channel (0 ↔ 8) is dropped here.
    remove: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  },
  // D7: the option label copy on the `layer-2` listbox surface, both themes.
  contrast: {
    cases: ["size-m"],
    root: listbox,
  },
  // D5: the VIRTUAL-FOCUS arrow walk. Focus stays on the input (`start:
  // comboBoxInput`); each arrow moves `aria-activedescendant` to the next option,
  // captured by `snapshotFocus`'s activeDescendant descriptor. `root: listbox`
  // scopes the roving-tabindex snapshot to the option subtree (which, being
  // virtual-focus, carries NO roving tabindex — so the trail is the active input +
  // its moving activedescendant, exactly the channel under test).
  focus: {
    cases: ["size-m"],
    root: listbox,
    walks: [
      {
        id: "virtual-activedescendant",
        start: comboBoxInput,
        keys: ["ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"],
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

registerStateMatrixDriver(fieldScenario);
registerPixelDriver(fieldScenario);
registerFocusTrailDriver(fieldScenario);
registerAxTreeDriver(fieldScenario);
registerContrastDriver(fieldScenario);
registerTargetSizeDriver(fieldScenario);
registerForcedColorsDriver(fieldScenario);
registerRtlDriver(fieldScenario, { cases: ["size-m"] });

registerStateMatrixDriver(listScenario);
registerPixelDriver(listScenario);
registerFocusTrailDriver(listScenario);
registerAxTreeDriver(listScenario);
registerContrastDriver(listScenario);
registerTargetSizeDriver(listScenario);
registerForcedColorsDriver(listScenario);
registerRtlDriver(listScenario, { cases: ["size-m"] });

/**
 * D13 journeys drive the CLOSED field (no beforePanel). Overlay geometry is
 * relative to the input (scenario target); clicks use the chevron so a button
 * open shows every option (`showAllItems`).
 */
registerJourneyDriver(fieldScenario, [
  seedOpenReopenScrollJourney(chevronButton),
  seedKeyboardOnlyJourney("St"),
]);
registerJourneyFuzz(
  fieldScenario,
  overlayJourneyAlphabet({
    trigger: chevronButton,
    input: comboBoxInput,
    optionNames: ["Starter", "Pro", "Enterprise"],
  }),
);
