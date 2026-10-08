import { clickLocator, dismissOverlay } from "../comparison-page";
import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerMotionDriver } from "../drivers/motion";
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
 * The `role="menu"` list stays the item-paint target (grid, padding 8,
 * max-width 320, item parts). The overlay around it is the shared S2 `Popover`
 * (`hideArrow`, `padding="none"`): dialog surface, inner content div, then the
 * `menuFrame` wrapping div around the menu — the same nesting as upstream
 * `Menu.tsx`. That dialog carries the viewport cap
 * (`max-width: calc(100vw - 24px)`) and the Popover opacity/translate
 * enter/exit. It is its own D1/D3 scenario (#106), not folded into the list:
 * item parts and the roving-tabindex trail stay on the menu, and the dialog's
 * dismiss buttons stay out of that trail.
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
 * CASES — `selectionMode:none` is pinned for the list so items render
 * `role="menuitem"` with no selection indicator and the icon part stays the
 * content glyph. Single and multiple indicators are the selection scenarios
 * below (#107).
 *
 * SCOPE — applicable drivers: D1 (list box + item parts), D3 (pixel: the painted
 * list — icon glyphs are byte-identical across the two fixtures, so the strict
 * diff is clean), D5 (focus: arrow-key roving through the open list), D6 (AX tree:
 * the `role="menu"` subtree, accessible name, AND each item's accessible
 * DESCRIPTION), D7 (contrast: the item label/description on `layer-2`, both
 * themes).
 *
 * D6 NOTE — each `menuitem` exposes its label as the accessible name AND its
 * description text + keyboard shortcut as the accessible DESCRIPTION. This
 * restores upstream's TWO-CONTEXT `Text` delegation: the headless `createMenuItem`
 * assigns the description/keyboard slot ids via `createSlotId` (≡ upstream
 * `useSlotId`, so a description-less item leaves `aria-describedby` unset instead
 * of dangling), threads those id-carrying props through `MenuItemRenderProps`, and
 * the S2 `MenuItem` merges them into its `TextContext` (description slot) +
 * `KeyboardContext` so the rendered `Text`/`Keyboard` elements carry the ids the
 * item's `aria-describedby` references.
 *
 *   MOTION (`menuMotionScenario`) — D2, the popover enter transition (S2
 *   `Popover` opacity/translate via RAC `useEnterAnimation` / Solid
 *   `createEnterAnimation`), captured from the `overlay` scope so the trigger's
 *   own press transition never leaks in. No `beforePanel`: the freezer is
 *   already running when the trigger opens the menu.
 *
 * NOT registered here:
 *   - D4/D5 (events/focus): open-on-press, arrow-key roving, type-ahead, close,
 *     `onAction`/`onSelectionChange`, and focus restoration are
 *     `MenuTrigger`/collection behaviors, not the list's paint; they belong to a
 *     trigger interaction unit.
 *   - D8 (target size): item hit-area belongs to the interaction unit; the list
 *     itself is not a hit target.
 */

const triggerLabel = "Layer actions";
const menuName = "Layer actions";

/** The closed MenuTrigger `ActionButton` in THIS panel. */
const triggerButton: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: triggerLabel }).first();

/** The `role="menu"` list — the list D1/D3/AX/contrast root. */
const menuList: TargetResolver = ({ page }) => page.getByRole("menu", { name: menuName });

/** The shared Popover dialog around the menu (accessible name is the trigger). */
const menuSurface: TargetResolver = ({ page }) => page.getByRole("dialog", { name: menuName });

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
  await clickLocator(canvas.getByRole("button", { name: triggerLabel }).first());
  await expect(page.getByRole("menu", { name: menuName })).toBeVisible();
};

/**
 * Best-effort close before the next panel. Isolation is actually guaranteed by
 * the fresh `page.goto` `forEachScenarioPanel` runs per panel; this only nudges
 * the page clean and NEVER asserts (close-on-Escape is a trigger interaction
 * contract in D4/D5 scope, not the list's).
 */
const closeMenu = async ({ page }: PanelContext) => {
  await dismissOverlay(page.getByRole("menu", { name: menuName }));
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
  // width/height/display/transform/transition, including `outline-color`.
  // Add the list box constraints the `menu` style drives beyond it:
  // `max-width` (the 320 cap) and the `overflow-x`/`overflow-y` pair.
  styleProps: {
    add: ["max-width", "overflow-x", "overflow-y"],
  },
  // D7: the item label + description copy on the `layer-2` menu surface, both
  // themes. Size-independent, so one case is the whole contrast surface.
  contrast: {
    cases: ["size-m"],
    root: menuList,
  },
  // D5: arrow-key roving through the open menu. `root: menuList` scopes the
  // roving-tabindex snapshot to the `role="menu"` list. The dialog surface is
  // certified on `surfaceScenario`; its dismiss buttons stay out of this trail.
  focus: {
    cases: ["size-m"],
    root: menuList,
    walks: [
      {
        id: "arrow-roving",
        // Keyboard entry: `beforePanel` opens the menu (its FocusScope autoFocus
        // already holds focus), so the walk drives the real keyboard path both
        // stacks share instead of a synthetic `.focus()` that seeds `focusedKey`
        // divergently. `start` (menuList) is only the pre-walk visibility gate.
        start: menuList,
        entry: "keyboard",
        keys: ["ArrowDown", "ArrowDown", "ArrowDown", "Home", "End", "ArrowUp"],
      },
    ],
  },
  // D6: the `role="menu"` subtree — roles/names/states via `ariaSnapshot` plus
  // the accessible-description pass. Certifies that each `menuitem` exposes its
  // label as the accessible name AND its description + keyboard shortcut as the
  // accessible DESCRIPTION (upstream's two-context `Text`/`Keyboard` id
  // delegation), size-independent so one case is the whole subtree.
  ax: {
    cases: ["size-m"],
    roots: {
      menu: menuList,
    },
  },
};

registerStateMatrixDriver(listScenario);
registerPixelDriver(listScenario);
registerContrastDriver(listScenario);
registerFocusTrailDriver(listScenario);
registerAxTreeDriver(listScenario);

/**
 * The shared Popover dialog. Sizes follow the list (content-sized width; the
 * menu `size` changes the dialog's height). Placements pin `shouldFlip` so
 * each axis stays where it was requested: top, left, right, and bottom/end.
 * D1 adds the surface `max-width` cap and `box-sizing`. No arrow parts
 * (`hideArrow`). D5/D6/D7 stay on the list — dismiss buttons and the menu AX
 * tree are not re-certified here.
 */
const surfaceScenario: DriverScenario = {
  slug: "menu",
  title: "Menu popover surface",
  beforePanel: openMenu,
  afterPanel: closeMenu,
  target: menuSurface,
  pixelTarget: menuSurface,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S", selectionMode: "none" } },
    { id: "size-m", params: { size: "M", selectionMode: "none" } },
    { id: "size-l", params: { size: "L", selectionMode: "none" } },
    {
      id: "placement-top",
      params: {
        size: "M",
        selectionMode: "none",
        direction: "top",
        align: "start",
        shouldFlip: "false",
      },
    },
    {
      id: "placement-left",
      params: {
        size: "M",
        selectionMode: "none",
        direction: "left",
        align: "start",
        shouldFlip: "false",
      },
    },
    {
      id: "placement-right",
      params: {
        size: "M",
        selectionMode: "none",
        direction: "right",
        align: "start",
        shouldFlip: "false",
      },
    },
    {
      id: "placement-end",
      params: {
        size: "M",
        selectionMode: "none",
        direction: "bottom",
        align: "end",
        shouldFlip: "false",
      },
    },
  ],
  styleProps: {
    add: ["max-width", "box-sizing"],
  },
};

registerStateMatrixDriver(surfaceScenario);
registerPixelDriver(surfaceScenario);

/**
 * D2 — the popover enter motion. No `beforePanel`; the trigger opens the menu
 * while the freezer is already running, so the transient enter transition (S2
 * `Popover` opacity/translate via `useEnterAnimation`) is caught and paused on
 * its first frame, captured from the `overlay` scope only. The filmstrip
 * target is the dialog surface.
 */
const menuMotionScenario: DriverScenario = {
  slug: "menu",
  title: "Menu motion",
  target: triggerButton,
  pixelTarget: menuSurface,
  cases: [{ id: "open", params: { size: "M", selectionMode: "none" } }],
  motion: {
    triggers: [
      {
        id: "open-enter",
        scopes: ["overlay"],
        run: async ({ target, page }) => {
          await clickLocator(target);
          await expect(page.getByRole("menu", { name: menuName })).toHaveCount(1);
        },
        cleanup: async ({ page }) => {
          await page.keyboard.press("Escape");
          await expect(page.getByRole("menu", { name: menuName })).toHaveCount(0);
        },
        settleMs: 260,
      },
    ],
  },
};

registerMotionDriver(menuMotionScenario);

/** An item by accessible name: action, radio (single), or checkbox (multiple). */
const menuItemNamed = (page: Page, name: string) => {
  const menu = page.getByRole("menu", { name: menuName });
  return menu
    .getByRole("menuitem", { name })
    .or(menu.getByRole("menuitemradio", { name }))
    .or(menu.getByRole("menuitemcheckbox", { name }));
};

const selectedIndicator = (page: Page) => menuItemNamed(page, "Copy").locator("svg").first();
const unselectedIndicator = (page: Page) => menuItemNamed(page, "Delete").locator("svg").first();
/** Selected "Copy" indicator. Single mode hides the other rows' checkmarks. */
const checkmarkSelected: TargetResolver = ({ page }) => selectedIndicator(page);
/** Unselected "Delete" indicator (hidden checkmark, or the empty checkbox). */
const checkmarkUnselected: TargetResolver = ({ page }) => unselectedIndicator(page);
/** Multiple-mode checkbox box around the selected "Copy" icon. */
const checkboxSelected: TargetResolver = ({ page }) => selectedIndicator(page).locator("..");
/** Multiple-mode checkbox box around the unselected "Delete" icon. */
const checkboxUnselected: TargetResolver = ({ page }) => unselectedIndicator(page).locator("..");

const selectionStyleProps = {
  add: ["max-width", "overflow-x", "overflow-y", "visibility", "aspect-ratio"],
};

/** Single selection. Copy is selected; Delete's checkmark stays hidden. */
const singleSelectionScenario: DriverScenario = {
  slug: "menu",
  title: "Menu single selection",
  beforePanel: openMenu,
  afterPanel: closeMenu,
  target: menuList,
  pixelTarget: menuList,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S", selectionMode: "single" } },
    { id: "size-m", params: { size: "M", selectionMode: "single" } },
    { id: "size-l", params: { size: "L", selectionMode: "single" } },
  ],
  parts: {
    checkmarkSelected,
    checkmarkUnselected,
  },
  styleProps: selectionStyleProps,
  contrast: {
    cases: ["size-m"],
    root: menuList,
  },
  ax: {
    cases: ["size-m"],
    roots: {
      menu: menuList,
    },
  },
};

/** Multiple selection. Copy and Duplicate are selected; Delete is not. */
const multipleSelectionScenario: DriverScenario = {
  slug: "menu",
  title: "Menu multiple selection",
  beforePanel: openMenu,
  afterPanel: closeMenu,
  target: menuList,
  pixelTarget: menuList,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S", selectionMode: "multiple" } },
    { id: "size-m", params: { size: "M", selectionMode: "multiple" } },
    { id: "size-l", params: { size: "L", selectionMode: "multiple" } },
  ],
  parts: {
    checkmarkSelected,
    checkmarkUnselected,
    checkboxSelected,
    checkboxUnselected,
  },
  styleProps: selectionStyleProps,
  contrast: {
    cases: ["size-m"],
    root: menuList,
  },
  ax: {
    cases: ["size-m"],
    roots: {
      menu: menuList,
    },
  },
};

registerStateMatrixDriver(singleSelectionScenario);
registerPixelDriver(singleSelectionScenario);
registerContrastDriver(singleSelectionScenario);
registerAxTreeDriver(singleSelectionScenario);
registerStateMatrixDriver(multipleSelectionScenario);
registerPixelDriver(multipleSelectionScenario);
registerContrastDriver(multipleSelectionScenario);
registerAxTreeDriver(multipleSelectionScenario);
