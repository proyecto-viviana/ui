import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 3, last unit): DropZone (+ FileTrigger).
 *
 * DropZone is NOT an overlay — it is a static on-canvas drop target box, so
 * targets resolve from `canvas` (not `page`). The box is a `<div>` (the RAC
 * DropZone root) carrying the `dropzone` S2 style: dashed gray-300 2px border,
 * lg radius, 24px padding, border-box, centered flex. Inside sits a
 * `VisuallyHidden` `<button>` (the keyboard/paste affordance whose focus ring
 * the root mirrors) and the IllustratedMessage children. FileTrigger is a
 * headless wrapper with no paint surface of its own (it renders a hidden file
 * input + its trigger child), so it carries no independent visual state to
 * certify here; the DropZone box is the whole paint story.
 *
 * PORT FAITHFULNESS verified against `react-aria-components/src/DropZone.tsx`
 * and `@react-spectrum/s2/src/DropZone.tsx` while building this cert:
 *   - The route passes `id` / `aria-describedby` / `aria-details` to the root,
 *     but neither stack forwards them: upstream RAC does `delete DOMProps.id`
 *     and `filterDOMProps(props, {global:true})` (which drops describedby/details
 *     — they are not global attributes), and the port splits the same three into
 *     a `local` bag that is never re-applied. So both roots render WITHOUT those
 *     attributes — identical AX trees. This is a faithful match, not a port gap
 *     (the accepted DropZone validation note records the same "runtime is the
 *     authority, not the broad API table" decision).
 *   - The `dropzone` / `banner` style tokens in the port are byte-identical to
 *     S2 (border default:dashed/gray-300 → drop-target:solid/blue-800/blue-200,
 *     focus-visible:blue-800; banner absolute accent pill, white bold, size-keyed
 *     max-width). The D1/D3 pair diffs are the proof.
 *
 * STATE MODEL — the box's meaningful visual states are not all reachable through
 * the walk's four gesture states, so two of the three states are driven by a
 * `beforePanel` that establishes a persistent non-gesture state, then the walk
 * captures the resting "default" gesture step over it (the same pattern the Toast
 * unit uses to open its overlay):
 *   - default: the resting dashed box, across the three sizes (S/M/L).
 *   - focus-visible: `beforePanel` focuses the VisuallyHidden button; the root
 *     mirrors it to `data-focus-visible`, flipping the border to blue-800. The
 *     walk cannot drive this as a gesture because it `.focus()`es the measured
 *     target (the box), which is not itself focusable — only the inner button is.
 *   - drop-target: `beforePanel` fires synthetic `dragenter`/`dragover` (the
 *     proven `dropzone-visual.spec.ts` gesture) so `data-drop-target` flips the
 *     border to solid blue-800 and the background to blue-200; the `filled` case
 *     additionally paints the absolute replace banner (covered by the D3 crop).
 *
 * SCOPE — applicable drivers: D1 (box computed styles), D3 (pixel: the whole
 * box, banner included in the filled drop-target crop), D6 (AX: the box subtree —
 * the hidden drop button's accessible name + the IllustratedMessage heading /
 * content), D7 (contrast: the heading/content copy on the box, both themes). NOT
 * registered: D2 (no resting transition — the drop-target enter is a token color
 * change certified as a steady state), D4/D5 (drag/drop event ordering + the
 * click→focus delegation are interaction behaviours), D8 (the only interactive
 * element is the 1px VisuallyHidden button — its geometry is a headless
 * VisuallyHidden concern, not this box's hit area, which has no interactive role).
 */

const rootSelector = '[data-comparison-control-root="dropzone"]';

/** The DropZone box — the RAC root div carrying the `dropzone` style. */
const dropZoneBox: TargetResolver = ({ canvas }) => canvas.locator(rootSelector).first();
/** The VisuallyHidden keyboard/paste button whose focus ring the box mirrors. */
const dropButton: TargetResolver = ({ canvas }) => canvas.locator(`${rootSelector} button`).first();

/**
 * Focus the hidden drop button so the root box mirrors `data-focus-visible`
 * (border → blue-800). Programmatic focus yields focus-visible in this harness —
 * the same mechanism the walk's focus-visible gesture state relies on.
 */
const focusDropButton = async (ctx: PanelContext) => {
  await dropButton(ctx).focus();
  await expect(dropZoneBox(ctx)).toHaveAttribute("data-focus-visible", "true");
};

/**
 * Drive the box into the active drop-target state with the proven synthetic drag
 * gesture (`dropzone-visual.spec.ts`): a DataTransfer carrying one file, then
 * `dragenter` + `dragover`. The state persists (no dragleave/drop) through the
 * settle and the cloned-element screenshot.
 */
const enterDropTarget = async (ctx: PanelContext) => {
  const box = dropZoneBox(ctx);
  const dataTransfer = await ctx.page.evaluateHandle(() => {
    const dt = new DataTransfer();
    Object.defineProperty(dt, "effectAllowed", { value: "copy", configurable: true });
    dt.items.add(new File(["hello"], "hello.txt", { type: "text/plain" }));
    return dt;
  });
  try {
    await box.dispatchEvent("dragenter", { clientX: 16, clientY: 16, dataTransfer });
    await box.dispatchEvent("dragover", { clientX: 24, clientY: 24, dataTransfer });
  } finally {
    await dataTransfer.dispose();
  }
  await expect(box).toHaveAttribute("data-drop-target", "true");
};

/** Scenario 1 — the resting box across the three sizes. Certifies the dashed
 *  border / radius / padding / centered-flex geometry (default allowlist plus
 *  the box's position + box-sizing), the hidden-button accessible name, the
 *  IllustratedMessage subtree, and the copy contrast. */
const dropZoneScenario: DriverScenario = {
  slug: "dropzone",
  title: "DropZone",
  target: dropZoneBox,
  pixelTarget: dropZoneBox,
  states: ["default"],
  cases: [
    { id: "small", params: { size: "S" } },
    { id: "medium", params: { size: "M" } },
    { id: "large", params: { size: "L" } },
  ],
  styleProps: {
    add: ["position", "box-sizing"],
  },
  // D6: the box subtree — the VisuallyHidden drop button's accessible name and
  // the IllustratedMessage heading/content. Structure is size-independent, so
  // the first case covers it.
  ax: {
    roots: {
      dropzone: dropZoneBox,
    },
  },
  // D7: the heading + content copy on the box, both themes.
  contrast: {
    root: dropZoneBox,
  },
};

/** Scenario 2 — the focus-visible box (border → blue-800). `beforePanel` focuses
 *  the hidden button so the root mirrors the ring; measured at the resting M
 *  size. Certifies that focus alone changes only the border color (background /
 *  border-style stay at their default, unlike the drop-target state). */
const dropZoneFocusScenario: DriverScenario = {
  slug: "dropzone",
  title: "DropZone focus-visible",
  target: dropZoneBox,
  pixelTarget: dropZoneBox,
  states: ["default"],
  settleMs: 300,
  beforePanel: focusDropButton,
  cases: [{ id: "medium", params: { size: "M" } }],
  styleProps: {
    add: ["position", "box-sizing"],
  },
};

/** Scenario 3 — the active drop-target box. `beforePanel` fires the synthetic
 *  drag so the border goes solid blue-800 and the background blue-200; the
 *  `filled` case additionally paints the absolute accent replace banner (its
 *  render is covered by the D3 box crop). */
const dropZoneDropTargetScenario: DriverScenario = {
  slug: "dropzone",
  title: "DropZone drop target",
  target: dropZoneBox,
  pixelTarget: dropZoneBox,
  states: ["default"],
  settleMs: 300,
  beforePanel: enterDropTarget,
  cases: [
    { id: "empty", params: { size: "M" } },
    {
      id: "filled",
      params: { size: "M", isFilled: "true", replaceMessage: "Drop file to replace" },
    },
  ],
  styleProps: {
    add: ["position", "box-sizing"],
  },
};

registerStateMatrixDriver(dropZoneScenario);
registerPixelDriver(dropZoneScenario);
registerAxTreeDriver(dropZoneScenario);
registerContrastDriver(dropZoneScenario);

registerStateMatrixDriver(dropZoneFocusScenario);
registerPixelDriver(dropZoneFocusScenario);

registerStateMatrixDriver(dropZoneDropTargetScenario);
registerPixelDriver(dropZoneDropTargetScenario);
