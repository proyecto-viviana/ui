/**
 * Tests for overlay hooks and utilities
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { render, fireEvent, screen, cleanup } from "@solidjs/testing-library";
// Import from source path for proper module resolution in tests
import { createOverlayTriggerState } from "../../solid-stately/src";
import { enableShadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";
import {
  createOverlayTrigger,
  createOverlay,
  createInteractOutside,
  ariaHideOutside,
  createModal,
  ModalProvider,
  OverlayContainer,
  UNSAFE_PortalProvider,
  useModalProvider,
} from "../src/overlays";

// ============================================
// createOverlayTriggerState tests
// ============================================
describe("createOverlayTriggerState", () => {
  it("starts closed by default", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("respects defaultOpen", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState({ defaultOpen: true });
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("can open and close", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      expect(state.isOpen()).toBe(false);

      state.open();
      expect(state.isOpen()).toBe(true);

      state.close();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("can toggle", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      expect(state.isOpen()).toBe(false);

      state.toggle();
      expect(state.isOpen()).toBe(true);

      state.toggle();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("supports controlled mode", () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn();
      const state = createOverlayTriggerState({
        isOpen: false,
        onOpenChange,
      });

      expect(state.isOpen()).toBe(false);

      state.open();
      // In controlled mode, onOpenChange is called but state doesn't change
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(state.isOpen()).toBe(false); // Still controlled by prop
      dispose();
    });
  });

  it("calls onOpenChange when state changes", () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn();
      const state = createOverlayTriggerState({ onOpenChange });

      state.open();
      expect(onOpenChange).toHaveBeenCalledWith(true);

      state.close();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      dispose();
    });
  });
});

// ============================================
// createOverlayTrigger tests
// ============================================
describe("createOverlayTrigger", () => {
  it("returns trigger and overlay props", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps, overlayProps } = createOverlayTrigger({ type: "dialog" }, state);

      expect(triggerProps).toBeDefined();
      expect(overlayProps).toBeDefined();
      expect(overlayProps.id).toBeDefined();
      dispose();
    });
  });

  it("sets aria-expanded based on state", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps } = createOverlayTrigger({ type: "dialog" }, state);

      expect(triggerProps["aria-expanded"]).toBe(false);

      state.open();
      expect(triggerProps["aria-expanded"]).toBe(true);
      dispose();
    });
  });

  it("sets aria-controls when open", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps, overlayProps } = createOverlayTrigger({ type: "dialog" }, state);

      expect(triggerProps["aria-controls"]).toBeUndefined();

      state.open();
      expect(triggerProps["aria-controls"]).toBe(overlayProps.id);
      dispose();
    });
  });

  it("sets aria-haspopup for menu type", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps } = createOverlayTrigger({ type: "menu" }, state);

      expect(triggerProps["aria-haspopup"]).toBe(true);
      dispose();
    });
  });

  it('sets aria-haspopup="listbox" for listbox type', () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps } = createOverlayTrigger({ type: "listbox" }, state);

      expect(triggerProps["aria-haspopup"]).toBe("listbox");
      dispose();
    });
  });

  it("does not set aria-haspopup for dialog type", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps } = createOverlayTrigger({ type: "dialog" }, state);

      expect(triggerProps["aria-haspopup"]).toBeUndefined();
      dispose();
    });
  });

  it("has onPress that toggles state", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { triggerProps } = createOverlayTrigger({ type: "dialog" }, state);

      expect(state.isOpen()).toBe(false);

      triggerProps.onPress();
      expect(state.isOpen()).toBe(true);

      triggerProps.onPress();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });
});

// ============================================
// createInteractOutside tests
// ============================================
describe("createInteractOutside", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not call onInteractOutside when clicking inside", async () => {
    const onInteractOutside = vi.fn();
    let overlayRef: HTMLDivElement | undefined;

    render(() => (
      <div>
        <div ref={(el) => (overlayRef = el)} data-testid="overlay">
          <button data-testid="inside">Inside</button>
        </div>
        <button data-testid="outside">Outside</button>
      </div>
    ));

    createRoot((dispose) => {
      createInteractOutside({
        ref: () => overlayRef ?? null,
        onInteractOutside,
        isDisabled: false,
      });

      // Simulate click inside
      fireEvent.pointerDown(screen.getByTestId("inside"), { button: 0 });
      fireEvent.pointerUp(screen.getByTestId("inside"), { button: 0 });

      expect(onInteractOutside).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("does not call onInteractOutside when disabled", async () => {
    const onInteractOutside = vi.fn();
    let overlayRef: HTMLDivElement | undefined;

    render(() => (
      <div>
        <div ref={(el) => (overlayRef = el)} data-testid="overlay">
          Overlay content
        </div>
        <button data-testid="outside">Outside</button>
      </div>
    ));

    createRoot((dispose) => {
      createInteractOutside({
        ref: () => overlayRef ?? null,
        onInteractOutside,
        isDisabled: true,
      });

      fireEvent.pointerDown(screen.getByTestId("outside"), { button: 0 });
      fireEvent.pointerUp(screen.getByTestId("outside"), { button: 0 });

      expect(onInteractOutside).not.toHaveBeenCalled();
      dispose();
    });
  });
});

// ============================================
// createOverlay tests
// ============================================
describe("createOverlay", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns overlay and underlay props", () => {
    createRoot((dispose) => {
      const { overlayProps, underlayProps } = createOverlay({ isOpen: true }, () => null);

      expect(overlayProps).toBeDefined();
      expect(underlayProps).toBeDefined();
      dispose();
    });
  });

  it("does not call onClose when isKeyboardDismissDisabled is true", () => {
    const onClose = vi.fn();
    let overlayRef: HTMLDivElement | undefined;

    render(() => (
      <div ref={(el) => (overlayRef = el)} data-testid="overlay" tabindex={0}>
        Overlay content
      </div>
    ));

    createRoot((dispose) => {
      const { overlayProps } = createOverlay(
        { isOpen: true, onClose, isKeyboardDismissDisabled: true },
        () => overlayRef ?? null,
      );

      // Manually call the keydown handler
      const keyDownHandler = overlayProps.onKeyDown as (e: KeyboardEvent) => void;
      keyDownHandler({
        key: "Escape",
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onClose).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    let overlayRef: HTMLDivElement | undefined;
    let keyDownHandler: ((e: KeyboardEvent) => void) | undefined;

    render(() => {
      // Create the overlay inside the render context so effects run properly
      const { overlayProps } = createOverlay({ isOpen: true, onClose }, () => overlayRef ?? null);
      keyDownHandler = overlayProps.onKeyDown as (e: KeyboardEvent) => void;

      return (
        <div ref={(el) => (overlayRef = el)} data-testid="overlay" tabindex={0}>
          Overlay content
        </div>
      );
    });

    // Wait for effects to run
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Manually call the keydown handler
    keyDownHandler!({
      key: "Escape",
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(onClose).toHaveBeenCalled();
  });
});

// ============================================
// ariaHideOutside tests
// ============================================
describe("ariaHideOutside", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("hides elements outside the target", () => {
    const outside = document.createElement("div");
    outside.id = "outside";
    container.appendChild(outside);

    const target = document.createElement("div");
    target.id = "target";
    container.appendChild(target);

    const revert = ariaHideOutside([target]);

    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(target.getAttribute("aria-hidden")).toBeNull();

    revert();
    expect(outside.getAttribute("aria-hidden")).toBeNull();
  });

  it("preserves existing aria-hidden values", () => {
    const alreadyHidden = document.createElement("div");
    alreadyHidden.setAttribute("aria-hidden", "true");
    container.appendChild(alreadyHidden);

    const outside = document.createElement("div");
    container.appendChild(outside);

    const target = document.createElement("div");
    container.appendChild(target);

    const revert = ariaHideOutside([target]);

    // Both should be hidden now
    expect(alreadyHidden.getAttribute("aria-hidden")).toBe("true");
    expect(outside.getAttribute("aria-hidden")).toBe("true");

    revert();
    // Originally hidden should still be hidden
    expect(alreadyHidden.getAttribute("aria-hidden")).toBe("true");
    // Outside should be restored to not hidden
    expect(outside.getAttribute("aria-hidden")).toBeNull();
  });

  it("handles multiple targets", () => {
    const outside = document.createElement("div");
    container.appendChild(outside);

    const target1 = document.createElement("div");
    container.appendChild(target1);

    const target2 = document.createElement("div");
    container.appendChild(target2);

    const revert = ariaHideOutside([target1, target2]);

    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(target1.getAttribute("aria-hidden")).toBeNull();
    expect(target2.getAttribute("aria-hidden")).toBeNull();

    revert();
  });
});

describe("ariaHideOutside with Shadow DOM enabled", () => {
  let container: HTMLDivElement;

  beforeAll(() => {
    enableShadowDOM();
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("keeps the target's composed ancestors visible and hides siblings inside its shadow root", () => {
    const outside = document.createElement("div");
    const shadowHost = document.createElement("div");
    container.append(outside, shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    const shadowSibling = document.createElement("div");
    const nestedHost = document.createElement("div");
    shadowRoot.append(shadowSibling, nestedHost);

    const nestedRoot = nestedHost.attachShadow({ mode: "open" });
    const modal = document.createElement("div");
    modal.setAttribute("role", "dialog");
    nestedRoot.appendChild(modal);

    const revert = ariaHideOutside([modal]);

    expect(outside).toHaveAttribute("aria-hidden", "true");
    expect(shadowHost).not.toHaveAttribute("aria-hidden");
    expect(nestedHost).not.toHaveAttribute("aria-hidden");
    expect(shadowSibling).toHaveAttribute("aria-hidden", "true");
    expect(modal).not.toHaveAttribute("aria-hidden");

    revert();
    expect(outside).not.toHaveAttribute("aria-hidden");
    expect(shadowSibling).not.toHaveAttribute("aria-hidden");
  });

  it("hides content added later inside an enclosing shadow root", async () => {
    const shadowHost = document.createElement("div");
    container.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    const modal = document.createElement("div");
    shadowRoot.appendChild(modal);

    const revert = ariaHideOutside([modal]);
    const addedLater = document.createElement("div");
    shadowRoot.appendChild(addedLater);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(addedLater).toHaveAttribute("aria-hidden", "true");
    revert();
    expect(addedLater).not.toHaveAttribute("aria-hidden");
  });

  it("keeps a dynamically added top-layer element visible by attribute presence", async () => {
    const target = document.createElement("div");
    container.appendChild(target);
    const revert = ariaHideOutside([target]);

    const topLayer = document.createElement("div");
    topLayer.setAttribute("data-solidaria-top-layer", "");
    document.body.appendChild(topLayer);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(topLayer).not.toHaveAttribute("aria-hidden");
    revert();
    topLayer.remove();
  });
});

// ============================================
// createModal tests
// ============================================
describe("createModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("ModalProvider provides context", () => {
    let providerAria: any;

    render(() => (
      <ModalProvider>
        {(() => {
          providerAria = useModalProvider();
          return <div>Content</div>;
        })()}
      </ModalProvider>
    ));

    expect(providerAria).toBeDefined();
    expect(providerAria.modalProviderProps).toBeDefined();
  });

  it("returns modalProps when used within ModalProvider", () => {
    let modalAria: any;

    render(() => (
      <ModalProvider>
        {(() => {
          modalAria = createModal();
          return <div>Content</div>;
        })()}
      </ModalProvider>
    ));

    expect(modalAria).toBeDefined();
    expect(modalAria.modalProps).toBeDefined();
  });

  it("OverlayContainer uses the portal provider container by default", () => {
    const portalRoot = document.createElement("div");
    document.body.appendChild(portalRoot);

    render(() => (
      <UNSAFE_PortalProvider getContainer={() => portalRoot}>
        <OverlayContainer>
          <div data-testid="overlay-content">Overlay content</div>
        </OverlayContainer>
      </UNSAFE_PortalProvider>
    ));

    expect(portalRoot.querySelector("[data-overlay-container]")).toBeTruthy();
    expect(portalRoot.querySelector('[data-testid="overlay-content"]')).toBeTruthy();

    document.body.removeChild(portalRoot);
  });

  it("OverlayContainer portalContainer prop overrides inherited portal context", () => {
    const inheritedRoot = document.createElement("div");
    const explicitRoot = document.createElement("div");
    document.body.appendChild(inheritedRoot);
    document.body.appendChild(explicitRoot);

    render(() => (
      <UNSAFE_PortalProvider getContainer={() => inheritedRoot}>
        <OverlayContainer portalContainer={explicitRoot}>
          <div data-testid="overlay-content">Overlay content</div>
        </OverlayContainer>
      </UNSAFE_PortalProvider>
    ));

    expect(inheritedRoot.querySelector("[data-overlay-container]")).toBeNull();
    expect(explicitRoot.querySelector("[data-overlay-container]")).toBeTruthy();

    document.body.removeChild(inheritedRoot);
    document.body.removeChild(explicitRoot);
  });
});
