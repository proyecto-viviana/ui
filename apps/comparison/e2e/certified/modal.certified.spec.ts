import { expect } from "@playwright/test";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerPixelDriver } from "../drivers/pixel";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 3, overlay): Modal.
 *
 * The Dialog pilot (`dialog.certified.spec.ts`) already certifies the dialog
 * CONTENT surface and, through it, a slice of the modal chain: its D1/D3 target
 * is `role="dialog"` and its pixel/contrast/target-size root is
 * `role="dialog".locator("..")` — the RAC `Modal` box (`dialogModal`: the
 * `--s2-container-bg: layer-2` surface, radius, outline) — plus D6 (AX subtree),
 * D2 (overlay+modal enter/exit motion), D4/D5 (open/close/focus-trap), and D8
 * (dismiss sentinel). All at the single default size `M`.
 *
 * This Modal unit certifies the two surfaces of the S2 `Modal` component the
 * pilot leaves uncovered, reusing the SAME `dialog` route (no new fixture):
 *
 *   1. The BACKDROP — the outermost `ModalOverlay` (`dialogOverlay`): the dimmed
 *      `transparent-black-500` layer with `isolation: isolate`. The pilot never
 *      asserts computed style on it. Upstream S2 and the port nest identically
 *      (`ModalOverlay → div(modalWrapper) → Modal → Dialog`, verified against
 *      `@react-spectrum/s2@1.5.1` `private/Modal.mjs`), so the backdrop resolves
 *      as `role="dialog".locator("../../..")` in BOTH stacks.
 *   2. The MODAL BOX AT EVERY SIZE — `dialogModal`'s size-keyed `width`
 *      (S 400 / M 480 / L 640 / XL 960, clamped to `max-width: 90vw`). The pilot
 *      proves the box paints identically at M; this walks the full S/M/L/XL
 *      matrix so the size variant is certified end-to-end.
 *
 * DELIBERATE EXCLUSIONS (faithful React→Solid divergences, NOT asserted):
 *   - Backdrop/wrapper `position`, `inset`, `z-index`: `Dialog.tsx` documents
 *     that the port portals with a `position: fixed` strategy where upstream's
 *     `modalWrapper` is a page-height `absolute` overlay (a portal-strategy
 *     difference, not a visual one). `position`/`inset`/`z-index` are not in the
 *     D1 default allowlist; the backdrop scenario also `remove`s `width`/`height`
 *     so the fixed-viewport-vs-absolute-page-height geometry never enters the
 *     diff. What IS certified is the backdrop's byte-copied paint
 *     (`background-color: transparent-black-500`, `isolation: isolate`).
 *   - D6/D7/D8/D2/D4/D5: owned by the Dialog pilot (the backdrop carries no text,
 *     role, hit target, or focusable control; the enter/exit motion and the
 *     open/close/focus contracts are the DialogTrigger's, certified there).
 *
 * OVERLAY PATTERN (mirrors dialog/popover): the modal portals to a page-level
 * container, so targets resolve from `page`, not `canvas`. `forEachScenarioPanel`
 * does a fresh `page.goto` per panel, so `beforePanel` opens ONE panel's modal at
 * a time by clicking its `Open Dialog` trigger.
 */

const dialogTitle = "Review Changes";

/** The RAC `Modal` box (`dialogModal`) — `role="dialog"`'s parent, where both
 *  stacks paint the `layer-2` surface + the size-keyed width. */
const modalBox: TargetResolver = ({ page }) =>
  page.getByRole("dialog", { name: dialogTitle }).locator("..");

/** The outermost `ModalOverlay` backdrop (`dialogOverlay`) — three levels up
 *  (dialog → modal → wrapper → overlay), identical nesting in both stacks. */
const modalBackdrop: TargetResolver = ({ page }) =>
  page.getByRole("dialog", { name: dialogTitle }).locator("../../..");

/** Click this panel's `Open Dialog` trigger to open its (and only its) modal. */
const openModal = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().click();
  await expect(page.getByRole("dialog", { name: dialogTitle })).toBeVisible();
};

/** Best-effort close before the next panel; isolation is guaranteed by the fresh
 *  per-panel `page.goto`. Never asserts (close is a DialogTrigger D4 contract). */
const closeModal = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/**
 * Modal box across the full S/M/L/XL size matrix. D1 certifies the size-keyed
 * `width` (400/480/640/960 → `max-width: 90vw`), `border-radius` (xl), the
 * `layer-2` background, and the transparent WHCM outline; D3 pixel-proves the
 * painted box is byte-identical at each width. A modal surface has no
 * hover/press affordances, so the size × theme matrix is the whole surface;
 * settle past the 250ms(+160ms delay) enter transition before measuring.
 */
const modalSizeScenario: DriverScenario = {
  slug: "dialog",
  title: "Modal box (sizes)",
  beforePanel: openModal,
  afterPanel: closeModal,
  target: modalBox,
  pixelTarget: modalBox,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "size-s", params: { size: "S" } },
    { id: "size-m", params: { size: "M" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
  ],
  // Default allowlist covers bg/border/radius/outline/width/height/display. Add
  // the modal-box box constraints the size map drives (max-width 90vw, max-height
  // 90%) and box-sizing.
  styleProps: {
    add: ["max-width", "max-height", "box-sizing"],
  },
};

/**
 * Backdrop dim, one case (the backdrop is size-independent — same
 * `transparent-black-500` overlay at every modal size). D1 only: the byte-copied
 * `background-color` + `isolation`. `width`/`height` are removed from the diff
 * because the port's fixed-viewport overlay and upstream's absolute page-height
 * overlay report different geometry by design (a faithful portal-strategy
 * divergence); no pixel driver is registered (a full-viewport semi-transparent
 * layer over each stack's own page is not a clean pair-diff surface).
 */
const backdropScenario: DriverScenario = {
  slug: "dialog",
  title: "Modal backdrop",
  beforePanel: openModal,
  afterPanel: closeModal,
  target: modalBackdrop,
  states: ["default"],
  settleMs: 500,
  cases: [{ id: "backdrop", params: { size: "M" } }],
  styleProps: {
    add: ["isolation"],
    remove: ["width", "height"],
  },
};

registerStateMatrixDriver(modalSizeScenario);
registerPixelDriver(modalSizeScenario);
registerStateMatrixDriver(backdropScenario);
