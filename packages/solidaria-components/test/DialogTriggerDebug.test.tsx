/**
 * Debug test for DialogTrigger + Button integration
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { useContext } from "solid-js";
import { DialogTriggerContext } from "../src/contexts";
import { DialogTrigger } from "../src/Dialog";
import { Modal, ModalOverlay } from "../src/Modal";
import { Dialog } from "../src/Dialog";
import { Button } from "../src/Button";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("DialogTrigger Debug", () => {
  afterEach(() => {
    cleanup();
  });

  it("should provide context to children", () => {
    let capturedContext: any = null;

    function ContextCapture() {
      capturedContext = useContext(DialogTriggerContext);
      return <div data-testid="capture">Context: {capturedContext ? "found" : "null"}</div>;
    }

    render(() => (
      <DialogTrigger>
        <ContextCapture />
        <Modal>
          <Dialog aria-label="Test">Content</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.state).toBeDefined();
    expect(typeof capturedContext.state.toggle).toBe("function");
    expect(typeof capturedContext.state.isOpen).toBe("function");
  });

  it("should toggle state when toggle is called directly", () => {
    let capturedContext: any = null;

    function ContextCapture() {
      capturedContext = useContext(DialogTriggerContext);
      return (
        <button data-testid="toggle-btn" onClick={() => capturedContext?.state.toggle()}>
          Toggle
        </button>
      );
    }

    render(() => (
      <DialogTrigger>
        <ContextCapture />
        <Modal>
          <Dialog aria-label="Test">Content</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(capturedContext.state.isOpen()).toBe(false);

    const btn = screen.getByTestId("toggle-btn");
    btn.click();

    expect(capturedContext.state.isOpen()).toBe(true);
  });

  it("Button should receive DialogTriggerContext", () => {
    let buttonContext: any = "not-set";

    // Create a test button that captures its context
    function TestButton(props: { children: any }) {
      buttonContext = useContext(DialogTriggerContext);
      return <button data-testid="test-btn">{props.children}</button>;
    }

    render(() => (
      <DialogTrigger>
        <TestButton>Open</TestButton>
        <Modal>
          <Dialog aria-label="Test">Content</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(buttonContext).not.toBe("not-set");
    expect(buttonContext).not.toBeNull();
    expect(buttonContext.state).toBeDefined();
  });

  it("Button component should receive context and toggle on click", async () => {
    const user = setupUser();
    let dialogTriggerState: any = null;

    function StateCapture() {
      const ctx = useContext(DialogTriggerContext);
      dialogTriggerState = ctx?.state;
      return null;
    }

    render(() => (
      <DialogTrigger>
        <StateCapture />
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Test">Content</Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(dialogTriggerState).not.toBeNull();
    expect(dialogTriggerState.isOpen()).toBe(false);

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);

    // Check if state changed
    expect(dialogTriggerState.isOpen()).toBe(true);
  });

  it("Dialog close function should close the dialog", async () => {
    const user = setupUser();
    let dialogTriggerState: any = null;

    function StateCapture() {
      const ctx = useContext(DialogTriggerContext);
      dialogTriggerState = ctx?.state;
      return null;
    }

    render(() => (
      <DialogTrigger>
        <StateCapture />
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Test">
            {({ close }) => (
              <>
                <span>Content</span>
                <button data-testid="close-btn" onClick={() => close()}>
                  Close
                </button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(dialogTriggerState.isOpen()).toBe(false);

    // Open dialog
    const openBtn = screen.getByRole("button", { name: "Open" });
    await user.click(openBtn);
    expect(dialogTriggerState.isOpen()).toBe(true);

    // Close dialog using render prop close function
    const closeBtn = screen.getByTestId("close-btn");
    await user.click(closeBtn);
    expect(dialogTriggerState.isOpen()).toBe(false);
  });

  it("ModalOverlay should apply custom class", async () => {
    const user = setupUser();

    render(() => (
      <DialogTrigger>
        <Button>Open</Button>
        <ModalOverlay class="custom-overlay">
          <Modal class="custom-modal">
            <Dialog aria-label="Test">Content</Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    ));

    const button = screen.getByRole("button", { name: "Open" });
    await user.click(button);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Check class hierarchy
    const modal = dialog.closest(".custom-modal");
    const overlay = dialog.closest(".custom-overlay");

    expect(modal).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  it("Dialog close with Button component should close the dialog", async () => {
    const user = setupUser();
    let dialogTriggerState: any = null;

    function StateCapture() {
      const ctx = useContext(DialogTriggerContext);
      dialogTriggerState = ctx?.state;
      return null;
    }

    render(() => (
      <DialogTrigger>
        <StateCapture />
        <Button>Open</Button>
        <Modal>
          <Dialog aria-label="Test">
            {({ close }) => (
              <>
                <span>Content</span>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    ));

    expect(dialogTriggerState.isOpen()).toBe(false);

    // Open dialog
    const openBtn = screen.getByRole("button", { name: "Open" });
    await user.click(openBtn);
    expect(dialogTriggerState.isOpen()).toBe(true);

    // Close dialog using Button component with onPress={close}
    const closeBtn = screen.getByRole("button", { name: "Close" });
    await user.click(closeBtn);
    expect(dialogTriggerState.isOpen()).toBe(false);
  });
});
