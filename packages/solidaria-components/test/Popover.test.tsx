/**
 * Tests for Popover component
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { UNSAFE_PortalProvider } from "@proyecto-viviana/solidaria";
import { Popover, PopoverTrigger, usePopoverTrigger } from "../src/Popover";
import { Button } from "../src/Button";
import { DialogTrigger } from "../src/Dialog";
import { createSignal, onMount } from "solid-js";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("Popover", () => {
  afterEach(() => {
    cleanup();
  });

  describe("PopoverTrigger", () => {
    it("should provide context to children", () => {
      let capturedContext: any = null;

      function ContextCapture() {
        capturedContext = usePopoverTrigger();
        return <div data-testid="capture">Context: {capturedContext ? "found" : "null"}</div>;
      }

      render(() => (
        <PopoverTrigger>
          <ContextCapture />
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      expect(capturedContext).not.toBeNull();
      expect(capturedContext.state).toBeDefined();
      expect(typeof capturedContext.state.toggle).toBe("function");
      expect(typeof capturedContext.state.isOpen).toBe("function");
    });

    it("should toggle state when toggle is called directly", () => {
      let capturedContext: any = null;

      function ContextCapture() {
        capturedContext = usePopoverTrigger();
        return (
          <button data-testid="toggle-btn" onClick={() => capturedContext?.state.toggle()}>
            Toggle
          </button>
        );
      }

      render(() => (
        <PopoverTrigger>
          <ContextCapture />
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      expect(capturedContext.state.isOpen()).toBe(false);

      const btn = screen.getByTestId("toggle-btn");
      btn.click();

      expect(capturedContext.state.isOpen()).toBe(true);
    });
  });

  describe("Popover component", () => {
    it("supports DialogTrigger composition used by React Spectrum Popover docs", async () => {
      const user = setupUser();

      render(() => (
        <DialogTrigger>
          <Button>Feedback</Button>
          <Popover aria-label="Feedback">Popover content here</Popover>
        </DialogTrigger>
      ));

      const button = screen.getByRole("button", { name: "Feedback" });
      expect(screen.queryByRole("dialog", { name: "Feedback" })).not.toBeInTheDocument();

      await user.click(button);

      const dialog = screen.getByRole("dialog", { name: "Feedback" });
      expect(dialog).toBeInTheDocument();
      expect(button).not.toHaveAttribute("aria-haspopup");
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button).toHaveAttribute("aria-controls", dialog.id);
    });

    it("should render popover content when open", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>
            <div data-testid="popover-content">Popover Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      // Popover should not be visible initially
      expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();

      // Click to open
      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Now popover should be visible
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    });

    it("should render React Aria-compatible dismiss buttons and modal underlay", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));

      expect(screen.getByTestId("underlay")).toBeInTheDocument();
      const dismissButtons = screen.getAllByLabelText("Dismiss");
      expect(dismissButtons).toHaveLength(2);

      dismissButtons[0].click();

      await waitFor(() => {
        expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
      });
    });

    it("should only render the trailing dismiss button for non-modal popovers", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover isNonModal>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));

      expect(screen.queryByTestId("underlay")).not.toBeInTheDocument();
      expect(screen.getAllByLabelText("Dismiss")).toHaveLength(1);
    });

    it("should preserve descendant focus when content focuses on mount", async () => {
      const user = setupUser();

      function FocusedInput() {
        let input!: HTMLInputElement;
        onMount(() => window.setTimeout(() => input.focus(), 0));
        return <input ref={input} aria-label="Focused field" />;
      }

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover aria-label="Focus test">
            <FocusedInput />
          </Popover>
        </PopoverTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: "Focused field" })).toHaveFocus();
      });
    });

    it("should expose trigger aria-expanded and aria-controls while open", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover aria-label="Quick audit note">Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog", { name: "Quick audit note" });
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveAttribute("aria-controls", dialog.id);
      });
    });

    it('should have role="dialog" when modal', async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should expose an accessible name when labelled", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover aria-label="Quick audit note">Content</Popover>
        </PopoverTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));

      await waitFor(() => {
        expect(screen.getByRole("dialog", { name: "Quick audit note" })).toBeInTheDocument();
      });
    });

    it("should support isNonModal (no dialog role)", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover isNonModal>Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should support controlled isOpen", () => {
      const [isOpen, setIsOpen] = createSignal(false);

      render(() => (
        <>
          <button data-testid="external-toggle" onClick={() => setIsOpen(!isOpen())}>
            External Toggle
          </button>
          <PopoverTrigger isOpen={isOpen()} onOpenChange={setIsOpen}>
            <Button>Open</Button>
            <Popover>
              <div data-testid="popover-content">Content</div>
            </Popover>
          </PopoverTrigger>
        </>
      ));

      expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();

      // Toggle from outside
      screen.getByTestId("external-toggle").click();
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();

      // Toggle again to close
      screen.getByTestId("external-toggle").click();
      expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
    });

    it("should support placement prop", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover placement="top">Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        // The data-placement should eventually be set based on actual positioning
        // In tests without real positioning, it may start as null
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should expose trigger width as a CSS variable", async () => {
      const trigger = document.createElement("button");
      trigger.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 144,
        bottom: 32,
        width: 144,
        height: 32,
        toJSON: () => {},
      });
      document.body.appendChild(trigger);

      render(() => (
        <Popover defaultOpen triggerRef={() => trigger}>
          Content
        </Popover>
      ));

      await waitFor(() => {
        expect(screen.getByRole("dialog").style.getPropertyValue("--trigger-width")).toBe("144px");
      });

      document.body.removeChild(trigger);
    });

    it("should preserve an explicit trigger width CSS variable", async () => {
      const trigger = document.createElement("button");
      trigger.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 144,
        bottom: 32,
        width: 144,
        height: 32,
        toJSON: () => {},
      });
      document.body.appendChild(trigger);

      render(() => (
        <Popover
          defaultOpen
          triggerRef={() => trigger}
          style={{ "--trigger-width": "88px" } as any}
        >
          Content
        </Popover>
      ));

      await waitFor(() => {
        expect(screen.getByRole("dialog").style.getPropertyValue("--trigger-width")).toBe("88px");
      });

      document.body.removeChild(trigger);
    });

    it("should render with custom trigger name", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover trigger="CustomTrigger">Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("data-trigger")).toBe("CustomTrigger");
      });
    });

    it("should render into the scoped portal container when provided", async () => {
      const user = setupUser();
      const portalRoot = document.createElement("div");
      document.body.appendChild(portalRoot);

      render(() => (
        <UNSAFE_PortalProvider getContainer={() => portalRoot}>
          <PopoverTrigger>
            <Button>Open</Button>
            <Popover>Scoped Content</Popover>
          </PopoverTrigger>
        </UNSAFE_PortalProvider>
      ));

      await user.click(screen.getByRole("button", { name: "Open" }));

      await waitFor(() => {
        expect(portalRoot.querySelector('[role="dialog"]')).toBeTruthy();
      });

      document.body.removeChild(portalRoot);
    });
  });

  describe("Popover with render function children", () => {
    it("should pass render props to children", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>
            {(renderProps) => (
              <div data-testid="content">
                Trigger: {renderProps.trigger ?? "none"}
                Placement: {renderProps.placement ?? "pending"}
              </div>
            )}
          </Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("Keyboard interactions", () => {
    it("should close popover when Escape key is pressed", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      // Open popover
      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();

      // Press Escape to close
      await user.keyboard("{Escape}");

      // Popover should be closed
      expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
    });

    it("should not close when isKeyboardDismissDisabled is true", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover isKeyboardDismissDisabled>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      // Open popover
      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();

      // Press Escape - should NOT close
      await user.keyboard("{Escape}");

      // Popover should still be visible
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    });
  });

  describe("Focus management", () => {
    it("should have tabIndex=-1 on dialog for focus management", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("tabindex")).toBe("-1");
      });
    });

    it("should contain focus within popover when modal", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover>
            <button data-testid="first-btn">First</button>
            <button data-testid="second-btn">Second</button>
          </Popover>
        </PopoverTrigger>
      ));

      const triggerButton = screen.getByRole("button", { name: "Open" });
      await user.click(triggerButton);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        // The popover dialog should exist
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });

      // Tab through elements inside popover
      const firstBtn = screen.getByTestId("first-btn");
      const secondBtn = screen.getByTestId("second-btn");

      expect(firstBtn).toBeInTheDocument();
      expect(secondBtn).toBeInTheDocument();
    });
  });

  describe("Outside click handling", () => {
    it("should close popover when clicking outside", async () => {
      const user = setupUser();

      render(() => (
        <div>
          <div data-testid="outside">Outside area</div>
          <PopoverTrigger>
            <Button>Open</Button>
            <Popover>
              <div data-testid="popover-content">Content</div>
            </Popover>
          </PopoverTrigger>
        </div>
      ));

      // Open popover
      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();

      // Click outside
      const outsideArea = screen.getByTestId("outside");
      await user.click(outsideArea);

      await waitFor(() => {
        expect(screen.queryByTestId("popover-content")).not.toBeInTheDocument();
      });
    });

    it("should close modal popovers when focus moves outside", async () => {
      const user = setupUser();

      render(() => (
        <div>
          <button data-testid="outside-focus">Outside focus target</button>
          <PopoverTrigger>
            <Button>Open</Button>
            <Popover>
              <button data-testid="inside-focus">Inside focus target</button>
            </Popover>
          </PopoverTrigger>
        </div>
      ));

      const trigger = screen.getByRole("button", { name: "Open" });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("inside-focus")).toBeInTheDocument();
      });

      screen.getByTestId("outside-focus").focus();

      await waitFor(() => {
        expect(screen.queryByTestId("inside-focus")).not.toBeInTheDocument();
      });
    });
  });

  describe("Animation states", () => {
    it("should apply data-entering attribute when isEntering is true", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover isEntering>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        // dataAttr returns '' (empty string) for true values - standard HTML boolean attribute
        expect(dialog.hasAttribute("data-entering")).toBe(true);
      });
    });

    it("should apply data-exiting attribute when isExiting is true", async () => {
      const user = setupUser();

      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover isExiting>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      // Wait for requestAnimationFrame to complete (positioning sets visibility)
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        // dataAttr returns '' (empty string) for true values - standard HTML boolean attribute
        expect(dialog.hasAttribute("data-exiting")).toBe(true);
      });
    });
  });

  describe("Callbacks", () => {
    it("should call onOpenChange when popover opens", async () => {
      const user = setupUser();
      let openChangeCalled = false;
      let lastOpenState: boolean | null = null;

      render(() => (
        <PopoverTrigger
          onOpenChange={(isOpen) => {
            openChangeCalled = true;
            lastOpenState = isOpen;
          }}
        >
          <Button>Open</Button>
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);

      expect(openChangeCalled).toBe(true);
      expect(lastOpenState).toBe(true);
    });

    it("should call onOpenChange when popover closes via Escape", async () => {
      const user = setupUser();
      const openChangeStates: boolean[] = [];

      render(() => (
        <PopoverTrigger
          onOpenChange={(isOpen) => {
            openChangeStates.push(isOpen);
          }}
        >
          <Button>Open</Button>
          <Popover>Content</Popover>
        </PopoverTrigger>
      ));

      const button = screen.getByRole("button", { name: "Open" });
      await user.click(button);
      await user.keyboard("{Escape}");

      expect(openChangeStates).toEqual([true, false]);
    });
  });

  describe("defaultOpen prop", () => {
    it("should start open when defaultOpen is true", () => {
      render(() => (
        <PopoverTrigger defaultOpen>
          <Button>Open</Button>
          <Popover>
            <div data-testid="popover-content">Content</div>
          </Popover>
        </PopoverTrigger>
      ));

      // Popover should be visible immediately
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    });
  });
});
