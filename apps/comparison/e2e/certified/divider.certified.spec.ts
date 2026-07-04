import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Divider — a non-interactive, text-less
 * separator primitive. Upstream S2 `Divider` and the port both render a single
 * leaf `Separator` element (RAC `Separator` / the port's headless `Separator`),
 * and the `divider`/`dividerStyles` `style()` macro is **byte-identical between
 * the two source files** (same colour table, geometry, and allowed overrides),
 * so the whole parity surface is: does the port reproduce upstream's computed
 * box (D1/D3) and its `role="separator"` semantics (D6)?
 *
 * Element/AX structure (verified against RAC `Separator` + `useSeparator`, which
 * the port's `Separator` + `createSeparator` mirror line-for-line):
 *   - S2 `Divider` never passes `elementType`, so both stacks default it to
 *     `undefined`. `Separator` renders `<hr>` for that default, switching to
 *     `<div>` only when `orientation === 'vertical'` (an `<hr>` cannot be
 *     vertical). Because `useSeparator`/`createSeparator` branch on the *raw*
 *     `elementType` (`undefined !== 'hr'`), both stacks add an **explicit**
 *     `role="separator"` on the element in every case, plus
 *     `aria-orientation="vertical"` on the vertical `<div>` (horizontal leaves
 *     `aria-orientation` at its `separator` default of horizontal → omitted).
 *   - So: horizontal ⇒ `<hr role="separator">`; vertical ⇒
 *     `<div role="separator" aria-orientation="vertical">`. Identical on both.
 *
 * Applicable drivers — **D1** (computed styles: the colour table + the
 * orientation/size geometry are the headline), **D3** (pixel: the 1–4px line),
 * and **D6** (AX: the `separator` role is exposed identically on the implicit-role
 * `<hr>` and the explicit-role vertical `<div>`). The rest are **not** registered:
 *   - D2 motion: the `divider` macro carries no transition/animation — a divider
 *     has no state that moves.
 *   - D4 events / D5 focus: `role="separator"`, no tabindex or press handling —
 *     not interactive or focusable.
 *   - D7 contrast: a divider carries no text, so there is no text/background pair
 *     for the contrast driver to measure. (Its non-text graphical contrast is the
 *     same `gray-200`/`gray-800`/`transparent-overlay` token on both stacks — a
 *     shared-token positive control already asserted byte-for-byte by D1's
 *     `background-color`.) This mirrors the Avatar unit, which likewise narrowed
 *     D7 away for lack of text.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 */
const dividerScenario: DriverScenario = {
  slug: "divider",
  title: "Divider",
  // The separator element (`<hr>` or vertical `<div>`) carries the `divider`
  // macro. `data-comparison-control-root="divider"` is threaded onto it by both
  // fixtures and survives `filterDOMProps(props, {global: true})` on both stacks,
  // so it is present and unique on the leaf element.
  target: ({ canvas }) => canvas.locator('[data-comparison-control-root="divider"]'),
  cases: [
    { id: "default", params: {} },
    // size S/L switch the emulated-border thickness (1px / 4px). size L is also
    // the colour-table exception: the fill darkens gray-200 → gray-800.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    // orientation:vertical flips the element to `<div role="separator"
    // aria-orientation="vertical">` and moves the emulated border from height to
    // width (2px). vertical-l exercises the 4px vertical rail + the gray-800 fill.
    { id: "vertical", params: { orientation: "vertical" } },
    { id: "vertical-l", params: { orientation: "vertical", size: "L" } },
    // staticColor swaps the fill to the transparent-overlay ramp over the
    // fixture's coloured backdrop. static-white-l exercises the size-L overlay
    // exception (transparent-overlay-200 → transparent-overlay-800).
    { id: "static-white", params: { staticColor: "white" } },
    { id: "static-white-l", params: { staticColor: "white", size: "L" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // The divider's defining box is a flex child (`alignSelf: 'stretch'`,
  // `flexGrow: 0`, `flexShrink: 0`) — none of which are in the default D1
  // allowlist. Add them so the pair diff sees the stretch/grow/shrink behaviour
  // alongside the width/height/background-color/border-radius the default already
  // covers.
  styleProps: {
    add: ["align-self", "flex-grow", "flex-shrink"],
  },
  // D6: prove the `separator` role is exposed identically — on the implicit-role
  // horizontal `<hr>` (default) and the explicit-role vertical `<div>` (vertical).
  // `ariaSnapshot()` surfaces the role (not `aria-orientation`, which it does not
  // render); the orientation attribute itself is asserted faithful by the
  // shared, unit-tested `createSeparator` ↔ `useSeparator` port.
  ax: {
    cases: ["default", "vertical"],
  },
};

registerStateMatrixDriver(dividerScenario);
registerPixelDriver(dividerScenario);
registerAxTreeDriver(dividerScenario);
