import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import { mouseClickGesture, registerEventSequenceDriver } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerMotionDriver } from "../drivers/motion";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

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
 *    stays non-pointer and focus-visible can be driven; note React Aria's
 *    contained FocusScope restores focus after the focus-visible reset blur,
 *    so hover captures include the restored focus ring — in both panels
 *    alike if the port is faithful.
 */

const dialogTitle = "Review Changes";

const openDialogWithPointer = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().click();
  await expect(page.getByRole("dialog", { name: dialogTitle })).toBeVisible();
};

const openDialogWithKeyboard = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: dialogTitle })).toBeVisible();
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
  // Tracked port gap keeps the exact AX-tree assertion red (recertification.md
  // D6 finding T-C): the CloseButton's Cross ui-icon is absent from the port's
  // AX tree (`button "Dismiss"` exposes no child) while upstream exposes it as
  // an unnamed `img`. Root cause is the port's `createUIIcon` forcing
  // `role="img"` + auto `aria-hidden` on unlabeled ui-icons (upstream ships
  // ui-icons as raw bare `<svg>` that Chromium surfaces as an unnamed `img`),
  // compounded by `Dialog.tsx` passing an explicit `aria-hidden` to CrossIcon.
  // The faithful fix is a global `createUIIcon` change whose blast radius spans
  // the accordion/disclosure/statuslight/inline-alert chevron specs that assert
  // the port's current `aria-hidden` — a Tier-1 Icon-surface unit, deferred to
  // CP9.
  ax: {
    roots: {
      dialog: ({ page }) => page.getByRole("dialog", { name: dialogTitle }),
    },
    knownDivergences: {
      "modal-open":
        "Dialog CloseButton's Cross ui-icon missing from the AX tree vs " +
        "upstream's unnamed img — createUIIcon over-hides unlabeled ui-icons " +
        "(role=img + auto aria-hidden) where upstream ships raw bare <svg>; " +
        "compounded by Dialog.tsx's explicit CrossIcon aria-hidden. Tracked " +
        "in recertification.md D6 finding T-C; global fix deferred to CP9 " +
        "(Tier-1 Icon surfaces).",
    },
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
      { ...mouseClickGesture, settleMs: 700 },
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
