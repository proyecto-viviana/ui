import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Avatar — the first non-interactive
 * display primitive. Upstream S2 `Avatar` and the port both render an
 * `<Image>` (a `<div slot="avatar" class=avatarRoot>…<img></div>` wrapper): the
 * wrapper div carries the circular treatment (`borderRadius: full`, the size
 * box, the `isOverBackground` outline), and the inner `<img role="img">` carries
 * the opacity reveal. The structures are byte-identical between stacks, so the
 * wrapper div is the D1 `target` and the `<img>` is a diffed `part`.
 *
 * Prop cases mirror the S2 Avatar axes — the `size` scale (16 → 96) and the
 * `isOverBackground` outline (1px default, 2px once `size >= 64` makes it
 * `isLarge`). Avatar has no `variant`/`isDisabled`, so those axes are absent.
 *
 * Applicable drivers are styling/AX-weighted — D1 (computed styles), D3 (pixel),
 * D6 (AX). The interaction and derived drivers are intentionally **not**
 * registered because they do not apply to a static image:
 *   - D2 motion: `avatarRoot` carries no `transition`; the `<img>` opacity
 *     reveal is a one-shot load artifact (identical on both stacks), not an
 *     interaction-driven animation to freeze.
 *   - D4 events / D5 focus: an avatar is neither pressable nor focusable — the
 *     wrapper is a plain `<div>` with no tabindex, role, or press handling.
 *   - D7 contrast: an image contains no text nodes to measure.
 *   - D8 target-size: an avatar is not an interactive target (no button / link /
 *     role match), so there is no hit box to floor-check.
 *
 * Default alt is "Avatar", so `getByRole("img", { name: "Avatar" })` resolves
 * the inner image on every case.
 */
const avatarScenario: DriverScenario = {
  slug: "avatar",
  title: "Avatar",
  // D1 measures the wrapper div — the element that carries the avatar's own
  // style macro (radius, size box, outline). `slot="avatar"` is emitted on that
  // wrapper by both stacks and is unique within the panel.
  target: ({ canvas }) => canvas.locator('[slot="avatar"]'),
  // The inner image carries the reveal/object-fit styles; diffing it alongside
  // the wrapper proves the port threads `imageStyles` (and the revealed opacity)
  // identically to upstream.
  parts: {
    image: ({ canvas }) => canvas.getByRole("img", { name: "Avatar" }),
  },
  cases: [
    { id: "default", params: {} },
    { id: "size-16", params: { size: "16" } },
    { id: "size-96", params: { size: "96" } },
    { id: "over-background", params: { isOverBackground: "true" } },
    // size >= 64 flips `isLarge`, so the outline is the 2px branch.
    { id: "over-background-large", params: { size: "64", isOverBackground: "true" } },
  ],
  // Non-interactive: there is no hover/focus/press treatment on the wrapper, so
  // the state matrix collapses to the single resting state (driving the other
  // gesture states would just re-capture the identical default styles).
  states: ["default"],
  // The `<img>` reveal (opacity 0 → 1 on load) is instant for the cached ~2.5KB
  // local fixture PNG (loadTime < 200ms → no 500ms opacity transition), but keep
  // a comfortable settle so a cold first load still lands fully revealed before
  // D1/D3 capture.
  settleMs: 500,
  // D6: the avatar's only AX node is the inner `img "Avatar"`. Capturing the
  // default and the over-background cases proves the `isOverBackground` outline
  // path stays a purely visual change — it must not leak a role or name.
  ax: {
    cases: ["default", "over-background"],
  },
};

registerStateMatrixDriver(avatarScenario);
registerPixelDriver(avatarScenario);
registerAxTreeDriver(avatarScenario);
