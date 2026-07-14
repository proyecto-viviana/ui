import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the FINAL S2 color unit): ColorSwatchPicker.
 * A single-select swatch grid — upstream S2 `ColorSwatchPicker.tsx` → `AriaColorSwatchPicker`
 * (react-aria-components/ColorSwatchPicker), which is a BARE `<ListBox>` collection:
 *
 *   AriaColorSwatchPicker = <ListBox layout={props.layout || 'grid'} selectionMode="single"
 *                                    disallowEmptySelection selectedKeys={[color.toString('hexa')]}
 *                                    onSelectionChange={…setColor}
 *                                    aria-label={props['aria-label'] ||
 *                                      (!props['aria-labelledby'] ? formatter.format('colorSwatchPicker') : undefined)}>
 *     {items.map(c => <ColorSwatchPickerItem id={c.toString('hexa')} …>)}
 *   </ListBox>
 *
 * Critically the oracle passes NO `selectionBehavior` (→ default `'toggle'` → focus
 * moves WITHOUT selecting; only Enter/Space commits) and NO `shouldFocusWrap` (→
 * default `false` → arrow nav STOPS DEAD at every grid boundary, no wrap). DOM shape
 * verified against upstream `@react-spectrum/s2` ColorSwatchPicker.tsx +
 * react-aria-components/ColorSwatchPicker.mjs + `@react-aria/…/ListKeyboardDelegate`
 * and the port stack (`createColorSwatchPicker` on the headless `Color.tsx` →
 * headless `ColorSwatchPicker`/`ColorSwatchPickerItem` → styled `colorSwatchPickerRoot`
 * + `colorSwatchPickerItemRoot` + `colorSwatchPickerSelectedOverlay` + the picker's
 * `pickerColorSwatchRoot`). The rendered subtree the fixture wrapper holds:
 *
 *   <div data-comparison-control-root="colorswatchpicker">                ← fixture wrapper
 *     <div role="listbox" aria-label="Accent color" style="display:flex;flex-wrap:wrap;gap:…">
 *       <div role="option" aria-selected="true"  style="position:relative;border-radius:…">   ← selected item
 *         <div role="img" aria-label="Rose" style="width/height/border/background:…" />        ← the swatch (D3)
 *         <div aria-hidden="true" style="position:absolute;inset:0;border:…;outline:…" />       ← selected overlay
 *       </div>
 *       <div role="option" aria-selected="false" …><div role="img" aria-label="Orange" …/></div>
 *       … (7 swatches: Rose / Orange / Yellow / Green / Blue / Violet / Pink)
 *     </div>
 *   </div>
 *
 * The target is anchored on the stable `[role="listbox"]` (RAC `ListBox` renders
 * role=listbox even under `layout="grid"` — the grid layout drives 2D keyboard nav,
 * not the role; the items stay role=option). Named parts: the first `[role="option"]`
 * (item chrome — `position:relative`, prop-driven `border-radius`), the first
 * `[role="img"]` swatch (prop-driven `width`/`height` per size, `border-radius` per
 * rounding, the flat-color-over-checkerboard `background`), and the selected item's
 * `[aria-hidden="true"]` overlay (the `position:absolute;inset:0` selection ring —
 * `border` gray-900/2 + `outline` gray-25/2 offset -4, `border-radius:inherit`).
 *
 * THREE parity divergences the port carried — all in the headless `Color.tsx`
 * `createColorSwatchPicker` / `handleGridKeyDown`, all reverted here on Parity Rule #1:
 *
 *   1. aria-label default string (D6-observable). The port HARDCODED the fallback
 *      `"Color swatch picker"`, where the oracle's react-aria-components string bundle
 *      resolves `formatter.format('colorSwatchPicker')` → en-US `"Color swatches"`. The
 *      port has no RAC-components string catalog (only its `@react-aria/color`-mirrored
 *      color catalog, which has no `colorSwatchPicker` key), so the faithful-minimal fix
 *      is to correct the hardcoded English to the oracle's en-US output — full
 *      localization of RAC-components strings is a pre-existing infra gap, deferred. The
 *      `unlabeled` D6 case (below) drives the default-injection branch and pins this.
 *
 *   2. No-wrap at grid boundaries (D5-observable). `handleGridKeyDown` fell back to a
 *      `?? getBoundaryEnabledKey(…)` WRAP on every arrow (ArrowRight/Left/Down/Up),
 *      where the oracle — `shouldFocusWrap` unset → default false — returns null at each
 *      boundary and STAYS PUT. The wrap fallbacks are dropped; the `grid-nav` focus walk
 *      (below) certifies focus stops dead at all four boundaries (right-at-end,
 *      left-at-start, down-at-bottom, up-at-top). The stray `shouldFocusWrap: true` the
 *      port also passed into `createListBox` is removed for the same reason.
 *
 *   3. Arrow-key follow-focus (DRIVER-BLIND — reverted on principle + oracle source).
 *      `handleGridKeyDown` called `state.replaceSelection(nextKey)` on every arrow move,
 *      selecting-as-you-go — but the oracle passes NO `selectionBehavior`, so its default
 *      `'toggle'` mode moves focus ONLY (Enter/Space commits the selection). The focus
 *      descriptor the D5 driver snapshots is `{ tag, role, name, scope, disabled?,
 *      tabindex? }` — it does NOT record `aria-selected`, and D1/D3/D6 capture only at
 *      rest (default selection, no arrows), so no driver can see this. It is reverted on
 *      Parity Rule #1 (the same "survey-caught, driver-blind" shape as CP9.68's i18n fix)
 *      and guarded by a headless unit assertion (arrow moves focus without mutating the
 *      selection; Enter selects).
 *
 * Applicable drivers:
 *   - D1 (rest-state style matrix) — the listbox flex-wrap grid (`display:flex`,
 *     `flex-wrap:wrap`, density-driven `gap`), the item chrome (`position:relative`,
 *     rounding-driven `border-radius`), the swatch's prop-driven geometry
 *     (`width`/`height` per size, `border-radius` per rounding, the constant border +
 *     `background` longhands), and the selected overlay (`position:absolute`, `inset:0`,
 *     the `border`/`outline` selection ring, `pointer-events:none`, `border-radius:inherit`).
 *   - D3 (pixel — the whole listbox) — every swatch + gap + the mid-grid selection ring
 *     rasterized together. Rounded/circular corners, the checkerboard tile boundaries,
 *     and the overlay's border+outline edges can round a single 8-bit LSB between two
 *     computed-identical subtrees — waived ±1 LSB below (dimensions exact, Δ≥2 rejected).
 *   - D5 (focus/keyboard) — a single `grid-nav` walk entered by a REAL Tab from the
 *     preceding `Before` boundary button (the faithful roving entry; entry navigates to
 *     the selected swatch), then
 *     ArrowRight/Left (linear, flows across rows), ArrowDown/Up (2D when the layout wraps),
 *     Home/End (jump the ends), and — the fix — arrows at all four boundaries that must
 *     STOP (no wrap). The pair-diff compares document focus + the roving `[tabindex]`
 *     layout at every step.
 *   - D6 (AX) — the `listbox` tree: its accessible name (label passthrough for `default`,
 *     the default-injected `"Color swatches"` for `unlabeled` — the branch fix #1
 *     touches, and the labelledby gate for `labelledby`), the 7 `option` children with
 *     their generated names (Rose … Pink) and the single `[selected]` marker.
 *
 * NOT registered:
 *   - D4 events: no collection unit registers D4 — selection/focus semantics are proven
 *     structurally (D6 rest selection) and via the D5 roving trail, and the follow-focus
 *     revert is covered by the headless unit guard (the drivers are rest/focus-only).
 *   - D2 motion: no transition or animation.
 *   - D7 contrast: no visible text node — the picker paints only swatches (the listbox
 *     label is not a rendered text run).
 *   - D8 target size: the option's hit box IS the swatch, whose geometry D1 already pins
 *     across the full size ramp (16/24/32/40px); the sub-24px sizes are an upstream S2
 *     design choice, identical on both panels.
 *
 * CASES — `default` (the demo default: "Accent color", size M, density regular, rounding
 * none, #e11d48 Rose selected at index 0), `compact` / `spacious` (density → `gap`),
 * `rounded-large` (size L + rounding full → 40px circles, overlay radius inherits),
 * `xs-round` (size XS + rounding default → 16px `sm`-radius), `blue-selected`
 * (defaultValue #3b82f6 → the overlay renders on a MID-grid item, index 4), plus two
 * AX-only label cases (`unlabeled`, `labelledby`; `steadyState:false` → excluded from the
 * paint matrix, resolved by id for D6).
 */

const root = '[data-comparison-control-root="colorswatchpicker"]';

/** The `<div role="listbox">` grid (the fixture wrapper's sole collection) — the D1/D3
 *  target and the D5 roving-snapshot / D6 AX root. RAC `ListBox` keeps role=listbox
 *  under `layout="grid"`; the grid layout drives 2D keyboard nav, not the role. */
const listboxTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} [role="listbox"]`);

/** The `Before` boundary button (fixture sibling, DOM order before the picker) — the D5
 *  walk's rest tabstop. `start`-focusing it and pressing `Tab` drives a REAL keyboard entry
 *  into the grid, the faithful roving-collection entry every other collection cert uses. It
 *  sits outside the `role="listbox"` roving scope, so it collapses to the outside-root
 *  sentinel in the focus snapshot. */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/** The first swatch OPTION (`[role="option"]`) — item chrome: `position:relative`,
 *  rounding-driven `border-radius`, the focus ring. */
const firstItem: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [role="option"]`).first();

/** The first swatch itself (`[role="img"]` inside the first option) — prop-driven
 *  `width`/`height` (size) + `border-radius` (rounding) + the flat-color `background`. */
const firstSwatch: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [role="option"] [role="img"]`).first();

/** The selected item's selection overlay — the `[aria-hidden="true"]` div rendered only
 *  under the selected option (`position:absolute;inset:0` ring). Resolves to whichever
 *  option is selected (Rose at index 0 by default, Blue at index 4 in `blue-selected`),
 *  so it also asserts the overlay actually renders. */
const selectedOverlay: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [role="option"][aria-selected="true"] [aria-hidden="true"]`);

const colorSwatchPickerScenario: DriverScenario = {
  slug: "colorswatchpicker",
  title: "ColorSwatchPicker",
  target: listboxTarget,
  parts: {
    item: firstItem,
    swatch: firstSwatch,
    overlay: selectedOverlay,
  },
  cases: [
    // The demo default — "Accent color", size M (32px swatches), density regular,
    // rounding none, defaultValue #e11d48 → Rose selected at index 0 (the overlay sits
    // on the first option).
    { id: "default", params: {} },
    // density compact → the listbox `gap` tightens.
    { id: "compact", params: { density: "compact" } },
    // density spacious → the listbox `gap` widens.
    { id: "spacious", params: { density: "spacious" } },
    // size L + rounding full → 40px circular swatches, item + overlay radius follow
    // (the overlay `border-radius:inherit`s the circle).
    { id: "rounded-large", params: { size: "L", rounding: "full" } },
    // size XS + rounding default → 16px `sm`-radius swatches (the smallest geometry).
    { id: "xs-round", params: { size: "XS", rounding: "default" } },
    // defaultValue #3b82f6 → Blue selected at index 4: the selection overlay renders on
    // a MID-grid option (not the first), pinning the ring on a non-first item for D1/D3.
    { id: "blue-selected", params: { defaultValue: "#3b82f6" } },
    // AX-only (steadyState:false → out of the paint matrix): ariaLabel="" → no label →
    // the picker injects its default name. Oracle en-US = "Color swatches"; the port
    // HARDCODED "Color swatch picker" (fix #1). D6 pins the corrected string here.
    { id: "unlabeled", params: { ariaLabel: "" }, steadyState: false },
    // AX-only: aria-labelledby present → the default-name gate (`!aria-labelledby`) must
    // NOT fire, so NEITHER panel injects a fallback aria-label (both resolve nameless).
    {
      id: "labelledby",
      params: { ariaLabel: "", ariaLabelledBy: "external-label" },
      steadyState: false,
    },
  ],
  // Rest only — the grid's rest paint is fully prop-driven (color / size / density /
  // rounding / selection); the keyboard behavior is certified by D5, not a gesture state.
  states: ["default"],
  styleProps: {
    add: [
      // The listbox flex-wrap grid arrangement (`gap` = column-gap/row-gap are already
      // in the default allowlist).
      "flex-wrap",
      "flex-direction",
      // The item chrome (`position:relative`) and the overlay's absolute inset ring
      // (`position:absolute` + `inset:0` → top/right/bottom/left:0).
      "position",
      "top",
      "right",
      "bottom",
      "left",
      // The overlay is click-through.
      "pointer-events",
      // The swatch + overlay `border-box` (borders sit inside the size box).
      "box-sizing",
      // The swatch `background` shorthand's companions the default allowlist omits — the
      // checkerboard layer is positioned `0% 50%` at `16px 16px`. `background-color` +
      // `background-image` are already captured.
      "background-position",
      "background-size",
      "background-repeat",
    ],
  },
  // D3: rounded/circular swatch corners, the checkerboard conic-gradient tile
  // boundaries, and the selection overlay's `border` + offset `outline` edges can round
  // a single 8-bit LSB (Δ=1, grayscale) between two computed-identical DOM subtrees (all
  // D1 styles match; the swatch + grid CSS mirror upstream byte-for-byte). Tolerate one
  // LSB per channel everywhere while keeping dimensions exact and rejecting Δ≥2.
  pixel: {
    waivers: [
      {
        caseId: "*",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason:
          "colorswatchpicker-antialias-1lsb: rounded/circular swatch corners + checkerboard tile boundaries + selection overlay border/outline edges round ±1 LSB grayscale",
      },
    ],
  },
  // D5: one walk. Enter through a REAL Tab keypress from the preceding `Before` boundary
  // button — the faithful roving-collection entry (a roving option is `tabIndex -1`, so you
  // cannot Tab straight to it; the container is the rest tabstop with `focusedKey == null`,
  // so `[role="listbox"]` carries `tabIndex 0`). On entry both stacks'
  // `useSelectableCollection`/`onListBoxFocus` navigate to `firstSelectedKey`, pulling real
  // DOM focus onto the selected swatch. A synthetic container `.focus()` does NOT achieve
  // this in Solid: it navigates `focusedKey` (the roving layout matches) but leaves DOM
  // focus on the container — `createFocusWithin`'s `onFocus` is non-bubbling, so the
  // follow-focus delegate never fires — diverging from React's synchronous delegate. The
  // real Tab is what flips `isFocused` and delegates identically (proven by the green
  // standalone ListBox cert, which enters the grid the same way). After entry: linear
  // ArrowRight/Left, 2D ArrowDown/Up (real moves when the layout wraps, matched no-ops when
  // it is a single row), Home/End jumps, and — the fix — arrows at all four boundaries that
  // must STOP (no wrap): ArrowRight at End, ArrowDown at the bottom row, ArrowLeft at Home,
  // ArrowUp at the top row. The pair-diff compares document focus + the roving `[tabindex]`
  // layout (scoped to the listbox) at every step; the port's pre-fix wrap fallbacks diverge
  // at every boundary.
  focus: {
    cases: ["default"],
    root: listboxTarget,
    walks: [
      {
        id: "grid-nav",
        // Focus the `Before` button (default `entry: "focus"`); the leading `Tab` then
        // enters the grid for real, delegating focus onto the selected swatch.
        start: beforeButton,
        keys: [
          "Tab",
          "ArrowRight",
          "ArrowRight",
          "ArrowLeft",
          "ArrowDown",
          "ArrowUp",
          "End",
          "ArrowRight",
          "ArrowDown",
          "Home",
          "ArrowLeft",
          "ArrowUp",
        ],
      },
    ],
  },
  // D6: the `listbox` tree — its accessible name and the 7 `option` children with their
  // generated names (Rose … Pink, both panels via the same ported `getColorName`) and
  // the single `[selected]` marker. `default` pins label passthrough ("Accent color");
  // `unlabeled` pins the default-injected name ("Color swatches" — fix #1); `labelledby`
  // pins the `!aria-labelledby` gate (no fallback label injected). NO knownDivergences.
  ax: {
    cases: ["default", "unlabeled", "labelledby"],
    roots: {
      listbox: listboxTarget,
    },
  },
};

registerStateMatrixDriver(colorSwatchPickerScenario);
registerPixelDriver(colorSwatchPickerScenario);
registerFocusTrailDriver(colorSwatchPickerScenario);
registerAxTreeDriver(colorSwatchPickerScenario);
