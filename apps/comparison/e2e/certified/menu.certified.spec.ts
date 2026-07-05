import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 3, overlay): Menu.
 *
 * This certifies the STYLED MENU LIST the S2 `Menu` paints — the
 * depth-independent `role="menu"` element and its item parts (label,
 * description, keyboard shortcut, icon) — across the three menu `size`s
 * (S/M/L), opened from its `MenuTrigger`.
 *
 * WHY THE `role="menu"` LIST IS THE TARGET (not the popover surface). The port
 * hand-rolls the menu's popover surface (`menuPopover` + `menuFrame`) instead of
 * reusing the certified S2 `Popover` the way upstream does (upstream Menu.tsx
 * renders `<Popover padding="none" hideArrow><div className={wrappingDiv}>` around
 * `<AriaMenu className={menu({size, isPopover})}>`). That surface-component reuse
 * — different nesting depth (port 2 divs vs upstream Popover-surface + inner
 * content div + wrappingDiv), the missing `maxWidth: calc(100vw - 24px)` surface
 * cap, and the outline/elevation details — is a REAL self-inflicted divergence,
 * but it lives OUTSIDE the `role="menu"` box and is tracked as a DEFERRED
 * follow-up (recertification.md CP9.32). Targeting the role-addressable list
 * makes this unit independent of that surface depth: the padding around the
 * items is 8px in BOTH stacks (`menuFrame` ≡ upstream `wrappingDiv`: both
 * `display:flex; size:full`; the port's `menuPopover` `padding:0` ≡ upstream's
 * `padding="none"` inner div, and `menu` carries the `padding:8`), and the
 * `layer-2` background behind the list's transparent padding is identical, so the
 * element screenshot of the list matches even though the surrounding surface
 * chrome does not yet.
 *
 * OVERLAY PATTERN (mirrors popover.certified.spec.ts): the menu portals to a
 * page-level container, so targets resolve from `page`, NOT `canvas`. Both panels
 * share the route, so the panel-major walk opens ONE panel's menu at a time —
 * `beforePanel` clicks THIS panel's "Layer actions" `ActionButton` trigger, and
 * `forEachScenarioPanel`'s per-panel fresh `page.goto` guarantees isolation.
 *
 * D1/D3 TARGET = the `ul[role="menu"]` grid itself (the `menu` style paints the
 * grid: `display:grid`, `gridTemplateColumns`, `padding:8`, `maxWidth:320`,
 * `overflow:auto`, `width:full`, `outline:none`). Item parts (`menuitem`,
 * `label`, `description`, `keyboard`, `icon`) are named D1 parts so the item's
 * grid areas, fonts, colors, and the byte-copied `transition` map are asserted
 * per size.
 *
 * CASES — `selectionMode:none` (the default) is pinned for all three so items
 * render `role="menuitem"` with NO selection indicator; the `size` S/M/L cases
 * certify the `menuItemGrid` edge-to-text tracks and the size-keyed
 * label/description fonts. The single/multiple selection indicators
 * (`menuItemCheckmark`/`menuItemCheckbox`) carry their own tracked divergences
 * (single checkmark's `aria-hidden`/`data-rsp-slot` + accent style; multiple's
 * hand-rolled checkbox box vs upstream's shared `box`) and are DEFERRED, so no
 * selection case is exercised here.
 *
 * SCOPE — applicable drivers: D1 (list box + item parts), D3 (pixel: the painted
 * list — icon glyphs are byte-identical across the two fixtures, so the strict
 * diff is clean), D7 (contrast: the item label/description on `layer-2`, both
 * themes). NOT registered here:
 *   - D6 (AX tree): the `role="menu"` subtree, accessible name, and the three
 *     `menuitem` roles DO match, but upstream's menu items expose an accessible
 *     DESCRIPTION (the "Copy the selected layer / Cmd+C" description+shortcut) and
 *     the port's do not — the item's `aria-describedby` is stripped and its
 *     description/keyboard elements never receive ids. The faithful repair is to
 *     restore upstream's TWO-CONTEXT `Text` delegation: the headless MenuItem must
 *     provide the RAC-equivalent `TextContext` (ids) + `KeyboardContext` (ids)
 *     around its children (mirroring react-aria-components Menu.tsx:613-627), and
 *     the S2 `Text`/`Keyboard` must read that headless id context IN ADDITION to
 *     the S2 styling context. That is shared `Text`/`Keyboard` infrastructure that
 *     8 already-certified field units (TextField, SearchField, NumberField,
 *     Switch, Checkbox, RadioGroup, ComboBox, DateField) already provide/consume,
 *     so it is a cross-cutting change that needs its own unit + a field-regression
 *     sweep, not a change smuggled into this overlay commit. Tracked as a DEFERRED
 *     follow-up (recertification.md CP9.32, "Menu item accessible description /
 *     two-context Text delegation"); D6 is registered when that unit lands.
 *   - D2 (motion): the popover enter/exit fade is a `menuPopover`-surface concern
 *     (the port does not internally drive `isEntering`), tracked with the shared
 *     headless-overlay realignment follow-up.
 *   - D4/D5 (events/focus): open-on-press, arrow-key roving, type-ahead, close,
 *     `onAction`/`onSelectionChange`, and focus restoration are
 *     `MenuTrigger`/collection behaviors, not the list's paint; they belong to a
 *     trigger interaction unit.
 *   - D8 (target size): item hit-area belongs to the interaction unit; the list
 *     itself is not a hit target.
 */

const triggerLabel = "Layer actions";
const menuName = "Layer actions";

/** The `ul[role="menu"]` list — the D1/D3/AX/contrast root. */
const menuList: TargetResolver = ({ page }) => page.getByRole("menu", { name: menuName });

/** The first `role="menuitem"` ("Copy") — its subgrid + `transition` map. */
const firstItem = (page: Page) =>
  page.getByRole("menu", { name: menuName }).getByRole("menuitem").first();
const menuItem: TargetResolver = ({ page }) => firstItem(page);
/** The item's label `[slot=label]` text ("Copy" exact — the description also
 *  starts with "Copy"). */
const itemLabel: TargetResolver = ({ page }) => firstItem(page).getByText("Copy", { exact: true });
/** The item's `[slot=description]` text. */
const itemDescription: TargetResolver = ({ page }) =>
  firstItem(page).getByText("Copy the selected layer", { exact: true });
/** The item's keyboard shortcut `<kbd>`. */
const itemKeyboard: TargetResolver = ({ page }) => firstItem(page).locator("kbd").first();
/** The item's leading icon `<svg>` (byte-identical glyph across both fixtures). */
const itemIcon: TargetResolver = ({ page }) => firstItem(page).locator("svg").first();

/** Click this panel's "Layer actions" trigger to open its (and only its) menu.
 *  `forEachScenarioPanel` neutralizes the pointer and does a fresh `page.goto`
 *  before `beforePanel`, so this is the only trigger fired on the page. */
const openMenu = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: triggerLabel }).first().click();
  await expect(page.getByRole("menu", { name: menuName })).toBeVisible();
};

/**
 * Best-effort close before the next panel. Isolation is actually guaranteed by
 * the fresh `page.goto` `forEachScenarioPanel` runs per panel; this only nudges
 * the page clean and NEVER asserts (close-on-Escape is a trigger interaction
 * contract in D4/D5 scope, not the list's).
 */
const closeMenu = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

const listScenario: DriverScenario = {
  slug: "menu",
  title: "Menu list",
  beforePanel: openMenu,
  afterPanel: closeMenu,
  target: menuList,
  pixelTarget: menuList,
  // The list has no hover/press affordance of its own (item hover is per-item,
  // a D4/D5 interaction concern) — the rest matrix (size × theme) is the whole
  // list. Upstream fades the popover in over 200ms; settle before measuring.
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S", selectionMode: "none" } },
    { id: "size-m", params: { size: "M", selectionMode: "none" } },
    { id: "size-l", params: { size: "L", selectionMode: "none" } },
  ],
  parts: {
    item: menuItem,
    label: itemLabel,
    description: itemDescription,
    keyboard: itemKeyboard,
    icon: itemIcon,
  },
  // Default allowlist covers color/bg/border/radius/font/padding/margin/gap/
  // width/height/display/transform/transition. Add the list box constraints the
  // `menu` style drives beyond it: `max-width` (the 320 cap) and the
  // `overflow-x`/`overflow-y` pair (upstream's popover `overflow:auto` on both
  // axes).
  //
  // REMOVE `outline-color`: it is an UNOBSERVABLE computed-style artifact of the
  // deferred element-type divergence, not an independent style bug. Upstream (RAC)
  // renders the menu as `<div role="menu">`; the port renders `<ul role="menu">`
  // (+ `<li>` items, compensated with `margin:0`/`list-style-type:none` so the box
  // paints identically — D3 confirms). Neither element carries ANY outline-color
  // CSS rule, and both compute `outline-style: none`, so nothing paints. Chromium
  // still reports a computed `outline-color`: for upstream's `<div>` it resolves to
  // a theme-invariant UA value (`rgb(16,16,16)`), for the port's `<ul>` it resolves
  // to `currentColor` (the neutral text color, `light-dark(rgb(41,41,41),
  // rgb(219,219,219))`). That delta is a pure `<div>`-vs-`<ul>` UA quirk with zero
  // visual effect. `outline-style` + `outline-width` STAY in the comparison (both
  // `none`/`0` on both stacks), so the "menu list paints no outline" contract is
  // still certified; only the unpainted `outline-color` channel is excluded. When
  // the tracked `<ul>`→`<div>` structural refactor lands (recertification.md
  // CP9.32, "Menu ul→div element-type parity"), this removal is dropped and
  // `outline-color` matches natively.
  styleProps: {
    add: ["max-width", "overflow-x", "overflow-y"],
    remove: ["outline-color"],
  },
  // D7: the item label + description copy on the `layer-2` menu surface, both
  // themes. Size-independent, so one case is the whole contrast surface.
  contrast: {
    cases: ["size-m"],
    root: menuList,
  },
};

registerStateMatrixDriver(listScenario);
registerPixelDriver(listScenario);
registerContrastDriver(listScenario);
