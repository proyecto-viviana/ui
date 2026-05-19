/**
 * Tests for solidaria-components Dialog
 *
 * Ported from react-aria-components Dialog.test.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Dialog, DialogTrigger, Heading, type DialogRenderProps } from "../src/Dialog";
import { Modal, ModalOverlay } from "../src/Modal";
import { Button } from "../src/Button";
import {
  setupUser,
  assertAriaIdIntegrity,
  createFocusFlowRecorder,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("Dialog", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should have a base default set of attributes", () => {
    render(() => (
      <Dialog>
        <Heading>Title</Heading>
      </Dialog>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("solidaria-Dialog");
  });

  it("should render dialog with aria-label", () => {
    render(() => (
      <Dialog aria-label="Settings">
        <p>Content</p>
      </Dialog>
    ));

    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(dialog).toBeInTheDocument();
  });

  it("should render dialog with aria-labelledby from Heading", () => {
    render(() => (
      <Dialog>
        <Heading>My Dialog Title</Heading>
        <p>Content</p>
      </Dialog>
    ));

    const dialog = screen.getByRole("dialog");
    const heading = screen.getByRole("heading");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const headingId = heading.getAttribute("id");

    // Dialog and heading should always be linked for accessible naming.
    expect(labelledBy).toBeTruthy();
    expect(headingId).toBeTruthy();
    expect(labelledBy).toBe(headingId);
  });

  it("should support custom Heading levels", () => {
    render(() => (
      <Dialog aria-label="Test">
        <Heading level={3}>H3 Title</Heading>
      </Dialog>
    ));

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("H3 Title");
  });

  it('should support role="alertdialog"', () => {
    render(() => (
      <Dialog role="alertdialog" aria-label="Alert">
        <p>Alert content</p>
      </Dialog>
    ));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should support render props with close function", () => {
    const closeFn = vi.fn();
    render(() => (
      <Dialog onClose={closeFn}>
        {({ close }) => (
          <>
            <Heading>Test</Heading>
            <button onClick={() => close()}>Close</button>
          </>
        )}
      </Dialog>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });
    closeButton.click();
    expect(closeFn).toHaveBeenCalled();
  });
});

describe("DialogTrigger", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should work with Modal", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog role="alertdialog" aria-label="Alert">
            {({ close }) => (
              <>
                <Heading>Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);

    // Run timers for modal to open
    vi.runAllTimers();

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();

    const closeButton = within(dialog).getByRole("button", { name: "Close" });
    await user.click(closeButton);

    // Run timers for modal to close
    vi.runAllTimers();

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("works with modal", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Delete</Button>
        <Modal data-test="modal">
          <Dialog role="alertdialog" data-test="dialog">
            {({ close }) => (
              <>
                <Heading>Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Delete" }));
    vi.runAllTimers();

    const dialog = screen.getByRole("alertdialog");
    const heading = screen.getByRole("heading");
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
    expect(dialog).toHaveAttribute("data-test", "dialog");
    expect(dialog.closest(".solidaria-Modal")).toHaveAttribute("data-test", "modal");
    expect(dialog.closest(".solidaria-ModalOverlay")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    vi.runAllTimers();
    expect(dialog).not.toBeInTheDocument();
  });

  it("has dismiss button when isDismissable", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Delete</Button>
        <Modal data-test="modal" isDismissable>
          <Dialog role="alertdialog" data-test="dialog">
            {() => (
              <>
                <Heading>Alert</Heading>
                <Button>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Delete" }));
    vi.runAllTimers();

    const dialog = screen.getByRole("alertdialog");
    await user.click(screen.getByLabelText("Dismiss"));
    vi.runAllTimers();

    expect(dialog).not.toBeInTheDocument();
  });

  it("should work with ModalOverlay", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <ModalOverlay class="overlay">
          <Modal class="modal">
            <Dialog aria-label="Test">
              {({ close }) => (
                <>
                  <Heading>Title</Heading>
                  <Button onPress={close}>Close</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    ));

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);

    vi.runAllTimers();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest(".modal")).toBeInTheDocument();
    expect(dialog.closest(".overlay")).toBeInTheDocument();
  });

  it("works with modal and custom underlay", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Delete</Button>
        <ModalOverlay class="underlay" data-test="underlay">
          <Modal class="modal" data-test="modal">
            <Dialog role="alertdialog" data-test="dialog">
              {({ close }) => (
                <>
                  <Heading>Alert</Heading>
                  <Button onPress={close}>Close</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Delete" }));
    vi.runAllTimers();

    const dialog = screen.getByRole("alertdialog");
    const heading = screen.getByRole("heading");
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
    expect(dialog).toHaveAttribute("data-test", "dialog");
    expect(dialog.closest(".modal")).toHaveAttribute("data-test", "modal");
    expect(dialog.closest(".underlay")).toHaveAttribute("data-test", "underlay");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    vi.runAllTimers();
    expect(dialog).not.toBeInTheDocument();
  });

  it("should get default aria label from trigger", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Settings</Button>
        <Modal>
          <Dialog>Test</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    const button = screen.getByRole("button", { name: "Settings" });
    await user.click(button);
    vi.runAllTimers();

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", button.id);
  });

  it("should support render props", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog>
            {({ close }) => (
              <>
                <Heading>Help</Heading>
                <Button onPress={close}>Dismiss</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Open" }));
    vi.runAllTimers();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Dismiss" }));
    vi.runAllTimers();
    expect(dialog).not.toBeInTheDocument();
  });

  it("should support controlled isOpen", async () => {
    const [isOpen, setIsOpen] = createSignal(false);
    const onOpenChange = vi.fn((open: boolean) => setIsOpen(open));

    render(() => (
      <DialogTrigger isOpen={isOpen()} onOpenChange={onOpenChange}>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Controlled">
            <p>Content</p>
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    setIsOpen(true);
    vi.runAllTimers();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled(); // Not called on programmatic change
  });

  it("should support defaultOpen", () => {
    render(() => (
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Default Open">
            <p>Content</p>
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    // Should be open by default
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should call onOpenChange when dialog opens and closes", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <DialogTrigger onOpenChange={onOpenChange}>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Test">
            {({ close }) => (
              <>
                <Heading>Title</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);
    vi.runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(true);

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);
    vi.runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });
});

describe("Modal", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should support Modal being used standalone with isOpen", () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Standalone Modal">
          <p>A modal</p>
        </Dialog>
      </Modal>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("A modal");
  });

  it("should support Modal being used standalone", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isDismissable isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Modal">A modal</Dialog>
      </Modal>
    ));

    expect(screen.getByRole("dialog")).toHaveTextContent("A modal");
    await user.click(document.body);
    vi.runAllTimers();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("isOpen and defaultOpen should override state from context", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <DialogTrigger>
        <Button />
        <Modal isDismissable isOpen onOpenChange={onOpenChange}>
          <Dialog aria-label="Modal">A modal</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(screen.getByRole("dialog")).toHaveTextContent("A modal");
    await user.click(document.body);
    vi.runAllTimers();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports isEntering and isExiting props", async () => {
    const { unmount } = render(() => (
      <Modal isOpen isEntering>
        <Dialog aria-label="Modal">A modal</Dialog>
      </Modal>
    ));

    let overlay = screen.getByRole("dialog").closest(".solidaria-ModalOverlay");
    expect(overlay).toHaveAttribute("data-entering");

    unmount();
    render(() => (
      <Modal isOpen isExiting>
        <Dialog aria-label="Modal">A modal</Dialog>
      </Modal>
    ));

    overlay = screen.getByRole("dialog").closest(".solidaria-ModalOverlay");
    expect(overlay).toHaveAttribute("data-exiting");
  });

  it("should close on outside click when isDismissable", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isDismissable isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Dismissable Modal">
          <p>Content</p>
        </Dialog>
      </Modal>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Click outside
    await user.click(document.body);
    vi.runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should close with Escape after dismissable outside click and reopen", async () => {
    const onOpenChange = vi.fn();
    const [isOpen, setIsOpen] = createSignal(false);
    const handleOpenChange = (open: boolean) => {
      onOpenChange(open);
      setIsOpen(open);
    };

    render(() => (
      <DialogTrigger isOpen={isOpen()} onOpenChange={handleOpenChange}>
        <Button>Open dialog</Button>
        <Modal isDismissable>
          <Dialog aria-label="Reopened dialog">
            <p>Content</p>
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog", { name: "Reopened dialog" })).toBeInTheDocument();

    await user.click(document.body);
    vi.runAllTimers();
    expect(screen.queryByRole("dialog", { name: "Reopened dialog" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog", { name: "Reopened dialog" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    vi.runAllTimers();
    expect(screen.queryByRole("dialog", { name: "Reopened dialog" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("should close on Escape key", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Escape Modal">
          <p>Content</p>
        </Dialog>
      </Modal>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    await user.keyboard("{Escape}");
    vi.runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should not close on outside click when not isDismissable", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Non-dismissable Modal">
          <p>Content</p>
        </Dialog>
      </Modal>
    ));

    await user.click(document.body);
    vi.runAllTimers();

    // Should not call onOpenChange for outside click
    // Escape still works by default
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("should support isKeyboardDismissDisabled", async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Modal isOpen isKeyboardDismissDisabled onOpenChange={onOpenChange}>
        <Dialog aria-label="No Escape Modal">
          <p>Content</p>
        </Dialog>
      </Modal>
    ));

    await user.keyboard("{Escape}");
    vi.runAllTimers();

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("should support render props for state-based styling", () => {
    render(() => (
      <Modal isOpen>
        {({ isEntering, isExiting }) => (
          <div data-testid="render-props-test" data-entering={isEntering} data-exiting={isExiting}>
            <Dialog aria-label="Render Props Modal">
              <p>Content</p>
            </Dialog>
          </div>
        )}
      </Modal>
    ));

    const wrapper = screen.getByTestId("render-props-test");
    expect(wrapper).toBeInTheDocument();
    // Modal is open so not entering or exiting
    expect(wrapper).not.toHaveAttribute("data-entering", "true");
    expect(wrapper).not.toHaveAttribute("data-exiting", "true");
  });
});

// ============================================
// A11Y RISK AREA: Focus management + ARIA IDs
// ============================================

describe("Dialog a11y focus & ARIA integrity", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should move focus inside dialog on open", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Focus Test">
            {({ close }) => (
              <>
                <Heading>Title</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    const openBtn = screen.getByRole("button", { name: "Open" });
    await user.click(openBtn);
    vi.runAllTimers();

    const dialog = screen.getByRole("dialog");
    // Focus should be within the dialog
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("should contain Tab focus inside the dialog", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Tab Trap Test">
            {({ close }) => (
              <>
                <Heading>Title</Heading>
                <Button onPress={close}>Close dialog</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Open" }));
    vi.runAllTimers();

    const dialog = screen.getByRole("dialog", { name: "Tab Trap Test" });
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.tab();
    vi.runAllTimers();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();

    await user.tab();
    vi.runAllTimers();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("should restore focus to trigger on Escape close", async () => {
    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Restore Focus Test">
            <Heading>Title</Heading>
            <p>Content</p>
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    const openBtn = screen.getByRole("button", { name: "Open" });
    await user.click(openBtn);
    vi.runAllTimers();

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    vi.runAllTimers();

    // After closing, the dialog should be gone
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openBtn).toHaveFocus();
  });

  it("ARIA ID integrity: dialog aria-labelledby resolves", () => {
    render(() => (
      <Dialog>
        <Heading>My Dialog Title</Heading>
        <p>Content</p>
      </Dialog>
    ));

    assertAriaIdIntegrity(document.body);
  });

  it("ARIA ID integrity: modal dialog with Heading", async () => {
    render(() => (
      <Modal isOpen>
        <Dialog>
          <Heading>Modal Title</Heading>
          <p>Content</p>
        </Dialog>
      </Modal>
    ));

    vi.runAllTimers();

    assertAriaIdIntegrity(document.body);
  });
});
