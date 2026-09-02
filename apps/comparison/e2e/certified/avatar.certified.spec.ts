import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { test } from "@playwright/test";

/**
 * S2 `Image.tsx:185-201, 316` (Solid `packages/solid-spectrum/src/image/index.tsx:126-130, 269-295`)
 * sets `transition: isTransitioning ? 'opacity' : 'none'` with
 * `isTransitioning = isRevealed && loadTime > 200`. Without a delayed fetch,
 * React pays the cold load (transitioning) and Solid hits cache (`none`).
 * Delaying both fetches above 200 ms with `Cache-Control: no-store` puts
 * them on the transitioning branch (`loadTime > 200` stays `opacity`; S2
 * never clears it). `route.continue()` left React on the memory-cache
 * `img.complete` path (`none`) while Solid waited for `onLoad` (`opacity`).
 * There is no `avatargroup.certified.spec.ts` (AvatarGroup uses
 * `/fixtures/avatar-group/*`, a different path).
 */
const AVATAR_FIXTURE_URL = "**/fixtures/avatar/docs-avatar.png";
const IMAGE_TRANSITION_THRESHOLD_MS = 200;
const AVATAR_FIXTURE_ROUTE_DELAY_MS = IMAGE_TRANSITION_THRESHOLD_MS + 100;

test.beforeEach(async ({ page }) => {
  await page.route(AVATAR_FIXTURE_URL, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, AVATAR_FIXTURE_ROUTE_DELAY_MS));
    const response = await route.fetch();
    const body = await response.body();
    const headers = { ...response.headers(), "cache-control": "no-store" };
    await route.fulfill({ status: response.status(), headers, body });
  });
});

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
  // Delayed no-store fetch (beforeEach) so both panels take loadTime > 200
  // (`transition-property: opacity`, which S2 does not clear). settle covers
  // the 500 ms reveal after that delayed load.
  settleMs: 800,
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
