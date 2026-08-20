import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerEventSequenceDriver } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerMotionDriver } from "../drivers/motion";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, EventGesture, PanelContext } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification pilot: Dialog — the overlay/portal proof for the walk
 * engine. The dialog renders in a page-level portal, so targets resolve from
 * the page, not the panel canvas; the panel-major walk guarantees only one
 * panel's dialog is ever open. Two scenarios:
 *
 * 1. `dialog` — the modal surface itself, default state only (a dialog
 *    surface has no hover/press affordances).
 * 2. `dialog` close button — full gesture walk on a control inside the open
 *    overlay. The dialog is opened with the keyboard so the input modality
 *    stays non-pointer and focus-visible can be driven. Contain restores
 *    after the focus-visible reset blur; hover then pointermoves, which
 *    flips RAC modality to pointer without notifying listeners.
 *    `useFocusRing` re-samples `isFocusVisible()` on the restore focus
 *    change, so the hover capture does **not** keep the keyboard ring.
 */

const dialogTitle = "Review Changes";

const openDialogWithPointer = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().click();
  await expect(page.getByRole("dialog", { name: dialogTitle })).toBeVisible();
};

const openDialogWithKeyboard = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: dialogTitle });
  await expect(dialog).toBeVisible();
  // `useDialog` focuses the dialog surface when no descendant owns autofocus,
  // then deliberately blurs + refocuses it after 500ms for iOS VoiceOver
  // (upstream useDialog.ts and the port both implement that exact timer).
  // Visibility/focus alone can therefore win the race with the refocus under
  // full-suite load, leaking setup events into the close gesture's recording.
  // Drain the specified timer and hold the setup contract at its final focus
  // destination before D4 starts recording.
  await page.waitForTimeout(600);
  await expect(dialog).toBeFocused();
};

const closeDialog = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

const surfaceScenario: DriverScenario = {
  slug: "dialog",
  title: "Dialog surface",
  beforePanel: openDialogWithPointer,
  afterPanel: closeDialog,
  target: ({ page }) => page.getByRole("dialog", { name: dialogTitle }),
  // The dialog portals outside the panel canvas, so the canvas default would
  // miss it entirely. Shoot the dialog's parent — the modal element — because
  // that is where both stacks paint the surface (--s2-container-bg: layer-2,
  // border radius, elevation shadow); role=dialog itself is transparent.
  pixelTarget: ({ page }) => page.getByRole("dialog", { name: dialogTitle }).locator(".."),
  states: ["default"],
  settleMs: 400,
  cases: [{ id: "modal-open" }],
  parts: {
    heading: ({ page }) =>
      page.getByRole("dialog", { name: dialogTitle }).getByRole("heading", { name: dialogTitle }),
  },
  // D6: the overlay AX proof. `beforePanel` opens the dialog, so the root is
  // the portaled dialog itself (the canvas default would miss it). The subtree
  // captures role=dialog + its accessible name, the heading, and the action
  // buttons; the modal's `aria-modal`/focus semantics land in the D5 focus
  // trap. No live-region announcement fires on dialog open, so no `announce`.
  //
  // The CloseButton cross is a bare ui-icon in both stacks, so Chromium exposes
  // the same unnamed `img` child beneath the labelled dismiss button. This was
  // previously waived, but the global bare-ui-icon fix landed in CP9.35 and the
  // waiver would now hide a regression in that completed parity work.
  ax: {
    roots: {
      dialog: ({ page }) => page.getByRole("dialog", { name: dialogTitle }),
    },
  },
  // D7: contrast of every text node inside the open dialog — the heading, the
  // body copy, and the action-button labels — against their composited
  // surface (`--s2-container-bg: layer-2`). Root is the portaled dialog
  // (`pixelTarget`, the modal surface), which `beforePanel` opens.
  contrast: {
    root: ({ page }) => page.getByRole("dialog", { name: dialogTitle }).locator(".."),
  },
  // D8: every interactive control inside the open dialog — the visible
  // CloseButton, the footer action buttons, AND RAC's injected screen-reader
  // "dismiss sentinel" (tabindex=-1, aria-label="Dismiss"), measured for its
  // hit box. The 24px/44px floors are reported. This pilot rediscovered +
  // fixed a real port divergence: the port had inlined
  // the visually-hidden reset onto the sentinel button (collapsing it to 1x1)
  // where upstream wraps a bare button (~16x6) in a VisuallyHidden div — now
  // mirrored faithfully in Modal.tsx, so the sentinel measures identically.
  targetSize: {
    root: ({ page }) => page.getByRole("dialog", { name: dialogTitle }).locator(".."),
  },
};

const closeButtonMouseClick: EventGesture = {
  id: "mouse-click",
  run: async ({ page, target }) => {
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (!box) {
      throw new Error("Dialog close button has no bounding box");
    }

    // The visual center is occupied by CrossIcon. React and Solid faithfully
    // use different runtimes for the same svg, and a center coordinate can land
    // on button/svg/path depending on subpixel placement. Exercise the real
    // button hit area just inside its left edge and prove the browser resolves
    // that coordinate to the button itself before emitting trusted events. The
    // event log remains exact; no target normalization hides DOM differences.
    const point = {
      x: box.x + Math.min(6, box.width / 4),
      y: box.y + box.height / 2,
    };
    expect(
      await target.evaluate(
        (element, position) => document.elementFromPoint(position.x, position.y) === element,
        point,
      ),
    ).toBe(true);

    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.up();
  },
};

const closeButtonScenario: DriverScenario = {
  slug: "dialog",
  title: "Dialog close button",
  beforePanel: openDialogWithKeyboard,
  afterPanel: closeDialog,
  target: ({ page }) =>
    page
      .getByRole("dialog", { name: dialogTitle })
      .getByRole("button", { name: /dismiss|close/i })
      .first(),
  pixelTarget: ({ page }) =>
    page
      .getByRole("dialog", { name: dialogTitle })
      .getByRole("button", { name: /dismiss|close/i })
      .first(),
  settleMs: 400,
  cases: [{ id: "modal-close-button" }],
  // D4: closing gestures from inside the open dialog — the log must show the
  // same dismissal path (press events on the close button vs a bare Escape
  // keydown), the same onOpenChange(false) position, and the same focus
  // restoration to the trigger.
  events: {
    gestures: [
      { ...closeButtonMouseClick, settleMs: 700 },
      {
        id: "escape-close",
        run: async ({ page }) => {
          await page.keyboard.press("Escape");
        },
        settleMs: 700,
      },
    ],
  },
  // D5: the focus trap — Tab cycles inside the dialog and must never escape
  // to the page behind it.
  focus: {
    walks: [{ id: "trap-cycle", keys: ["Tab", "Tab", "Tab", "Shift+Tab"] }],
  },
};

/**
 * D4-only scenario: the full open → close cycle recorded from the trigger.
 * No `beforePanel` — the gesture itself opens the dialog, so the log captures
 * trigger press events, onOpenChange(true), focus moving into the dialog,
 * the Escape dismissal, onOpenChange(false), and focus restoration, all in
 * one ordered sequence.
 */
const triggerScenario: DriverScenario = {
  slug: "dialog",
  title: "Dialog trigger",
  target: ({ canvas }) => canvas.getByRole("button", { name: "Open Dialog" }).first(),
  cases: [{ id: "modal-trigger" }],
  events: {
    gestures: [
      {
        id: "open-escape-close",
        run: async ({ page, target }) => {
          await target.focus();
          await page.keyboard.press("Enter");
          await expect(page.getByRole("dialog", { name: dialogTitle })).toBeVisible();
          await page.waitForTimeout(600);
          await page.keyboard.press("Escape");
          await expect(page.getByRole("dialog")).toHaveCount(0);
        },
        settleMs: 700,
      },
    ],
  },
};

/**
 * D2-only scenario: the enter/exit motion. No `beforePanel` opens the dialog —
 * the trigger opens it while the freezer is already running, so the transient
 * enter transition (upstream Modal: overlay opacity + surface opacity/translate,
 * driven by `useEnterAnimation`) is caught and paused on its first frame.
 * Captured from the `overlay` scope only, so the trigger button's own
 * `transition: 'default'` never leaks into the dialog's motion comparison.
 */
const motionScenario: DriverScenario = {
  slug: "dialog",
  title: "Dialog motion",
  target: ({ canvas }) => canvas.getByRole("button", { name: "Open Dialog" }).first(),
  pixelTarget: ({ page }) => page.getByRole("dialog", { name: dialogTitle }).locator(".."),
  cases: [{ id: "modal-open" }],
  motion: {
    triggers: [
      {
        id: "open-enter",
        scopes: ["overlay"],
        run: async ({ canvas, page }) => {
          await canvas.getByRole("button", { name: "Open Dialog" }).first().click();
          await expect(page.getByRole("dialog", { name: dialogTitle })).toHaveCount(1);
        },
        cleanup: async ({ page }) => {
          await page.keyboard.press("Escape");
          await expect(page.getByRole("dialog")).toHaveCount(0);
        },
        settleMs: 260,
      },
    ],
  },
};

registerStateMatrixDriver(surfaceScenario);
registerStateMatrixDriver(closeButtonScenario);
registerPixelDriver(surfaceScenario);
registerPixelDriver(closeButtonScenario);
registerEventSequenceDriver(closeButtonScenario);
registerEventSequenceDriver(triggerScenario);
registerFocusTrailDriver(closeButtonScenario);
registerMotionDriver(motionScenario);
registerAxTreeDriver(surfaceScenario);
registerContrastDriver(surfaceScenario);
registerTargetSizeDriver(surfaceScenario);
