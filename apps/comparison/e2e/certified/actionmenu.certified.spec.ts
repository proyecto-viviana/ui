import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 3, overlay): ActionMenu.
 *
 * ActionMenu = an icon-only `ActionButton` TRIGGER (the `More` "⋯" glyph,
 * `aria-label` "More actions") composed with the certified S2 `Menu` list. Two
 * scenarios certify the two paint surfaces:
 *
 *   1. TRIGGER (closed) — the genuinely ActionMenu-distinct surface: the port
 *      renders `s2ActionButton` with a `MoreIcon`, mapping `ActionMenu.size` ->
 *      `ActionButton.size`. This certifies that size passthrough (S/M/L), the
 *      `isQuiet` variant, and the `More` glyph paint identically to upstream S2's
 *      `ActionMenu` trigger. The trigger is always rendered, so this scenario
 *      measures the canvas button directly — no open.
 *
 *   2. LIST (opened) — proves ActionMenu composes the ALREADY-CERTIFIED Menu
 *      faithfully. ActionMenu reuses the exact `s2-menu-styles.ts` (`menuPopover`,
 *      `menuFrame`, `menu`, `MenuItem`) certified in CP9.32 (Menu), driven by its
 *      `menuSize` prop, and hand-rolls the same popover surface. So this scenario
 *      re-runs the Menu list drivers against ActionMenu's `menuSize` S/M/L to catch
 *      any `menuSize`-passthrough or Popover-wiring divergence, and it inherits
 *      CP9.32's tracked artifacts verbatim (see SCOPE).
 *
 * OVERLAY PATTERN (mirrors menu.certified.spec.ts): the menu portals to a
 * page-level container, so LIST targets resolve from `page`, not `canvas`. Both
 * panels share the route, so `beforePanel` opens ONE panel's menu at a time (clicks
 * THIS panel's "More actions" trigger); `forEachScenarioPanel`'s per-panel fresh
 * `page.goto` guarantees isolation. The TRIGGER scenario has no `beforePanel` — the
 * button is measured in its default closed state.
 *
 * SCOPE — applicable drivers: D1 (trigger button + item parts), D3 (pixel:
 * icon-only trigger glyph + painted list), D5 (focus: arrow-key roving through the
 * open list — same roving-tabindex contract certified on Menu, CP9.37), D7
 * (contrast: item copy on `layer-2`).
 * The LIST scenario carries CP9.32's tracked/deferred artifacts UNCHANGED:
 *   - `styleProps.remove:["outline-color"]` — an unobservable computed-style channel
 *     (both stacks now `<div role="menu">`; `outline-style:none` on both, zero paint).
 *     A `color`-inheritance delta, NOT retired by the ul→div refactor (see CP9.37).
 *   - D6 (AX): the item accessible DESCRIPTION gap (stripped `aria-describedby` /
 *     unassigned description+keyboard ids) is the same shared two-context `Text`
 *     delegation follow-up as Menu — deferred, registered when that unit lands.
 *   - D2 (motion): the hand-rolled `ActionMenuPopover` enter/exit fade is the same
 *     surface concern as Menu's `menuPopover`, tracked with the overlay realignment.
 *   - D4/D8 (open-on-press, type-ahead, `onAction`, hit-area) are
 *     `MenuTrigger`/collection/interaction behaviors, not paint — trigger unit.
 */

const triggerName = "More actions";
const menuName = "More actions";

/** The closed trigger button (icon-only `More` ActionButton) in THIS panel. */
const triggerButton: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: triggerName }).first();
/** The trigger's `More` glyph `<svg>`. */
const triggerIcon: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: triggerName }).first().locator("svg").first();

/** The `ul[role="menu"]` list (accessible name inherits the trigger label). */
const menuList: TargetResolver = ({ page }) => page.getByRole("menu", { name: menuName });

/** The first `role="menuitem"` ("Copy"). */
const firstItem = (page: Page) =>
  page.getByRole("menu", { name: menuName }).getByRole("menuitem").first();
const menuItem: TargetResolver = ({ page }) => firstItem(page);
/** The item's label `[slot=label]` ("Copy" exact — the description also starts with "Copy"). */
const itemLabel: TargetResolver = ({ page }) => firstItem(page).getByText("Copy", { exact: true });
/** The item's `[slot=description]` text. */
const itemDescription: TargetResolver = ({ page }) =>
  firstItem(page).getByText("Copy the selected text", { exact: true });
/** The item's keyboard shortcut `<kbd>`. */
const itemKeyboard: TargetResolver = ({ page }) => firstItem(page).locator("kbd").first();
/** The item's leading icon `<svg>` (byte-identical glyph across both fixtures). */
const itemIcon: TargetResolver = ({ page }) => firstItem(page).locator("svg").first();

/** Click this panel's "More actions" trigger to open its (and only its) menu. */
const openMenu = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: triggerName }).first().click();
  await expect(page.getByRole("menu", { name: menuName })).toBeVisible();
};

/** Best-effort close before the next panel (isolation is the per-panel `goto`);
 *  NEVER asserts — close-on-Escape is a D4/D5 trigger contract, not the list's. */
const closeMenu = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/** Scenario 1 — the closed icon-only trigger across the ActionButton size matrix
 *  + `isQuiet`. Default allowlist covers the button's color/bg/border/radius/
 *  padding/size/transform/transition; the `More` glyph is a named part. */
const triggerScenario: DriverScenario = {
  slug: "actionmenu",
  title: "ActionMenu trigger",
  target: triggerButton,
  pixelTarget: triggerButton,
  states: ["default"],
  cases: [
    { id: "size-s", params: { size: "S" } },
    { id: "size-m", params: { size: "M" } },
    { id: "size-l", params: { size: "L" } },
    { id: "quiet-m", params: { size: "M", isQuiet: "true" } },
  ],
  parts: {
    icon: triggerIcon,
  },
};

/** Scenario 2 — the opened list, proving faithful composition of the certified
 *  Menu across ActionMenu's `menuSize`. Mirrors menu.certified.spec.ts exactly,
 *  including the tracked `outline-color` removal (CP9.32). */
const listScenario: DriverScenario = {
  slug: "actionmenu",
  title: "ActionMenu list",
  beforePanel: openMenu,
  afterPanel: closeMenu,
  target: menuList,
  pixelTarget: menuList,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { menuSize: "S" } },
    { id: "size-m", params: { menuSize: "M" } },
    { id: "size-l", params: { menuSize: "L" } },
  ],
  parts: {
    item: menuItem,
    label: itemLabel,
    description: itemDescription,
    keyboard: itemKeyboard,
    icon: itemIcon,
  },
  // Add the list-box constraints beyond the default allowlist (`max-width` cap +
  // both `overflow` axes); remove the unobservable `outline-color` channel — a
  // `color`-inheritance delta (both stacks now `<div role="menu">`;
  // `outline-style:none` on both, zero paint; `outline-style`/`outline-width` stay
  // asserted). NOT retired by the ul→div refactor (CP9.37); tracked separately.
  styleProps: {
    add: ["max-width", "overflow-x", "overflow-y"],
    remove: ["outline-color"],
  },
  contrast: {
    cases: ["size-m"],
    root: menuList,
  },
  // D5: arrow-key roving through the open list — the same roving-tabindex
  // contract certified on Menu. `root: menuList` scopes the snapshot to the
  // `role="menu"` list (the deferred popover surface — dialog wrapper + Dismiss
  // button — stays out of the trail). `entry: "keyboard"` drives the real
  // keyboard path both stacks share (`beforePanel` opens the menu and its
  // FocusScope autoFocus already holds focus), instead of a synthetic `.focus()`
  // that seeds `focusedKey` divergently.
  focus: {
    cases: ["size-m"],
    root: menuList,
    walks: [
      {
        id: "arrow-roving",
        start: menuList,
        entry: "keyboard",
        keys: ["ArrowDown", "ArrowDown", "ArrowDown", "Home", "End", "ArrowUp"],
      },
    ],
  },
};

registerStateMatrixDriver(triggerScenario);
registerPixelDriver(triggerScenario);

registerStateMatrixDriver(listScenario);
registerPixelDriver(listScenario);
registerContrastDriver(listScenario);
registerFocusTrailDriver(listScenario);
