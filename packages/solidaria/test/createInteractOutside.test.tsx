/**
 * createInteractOutside tests - Port of React Aria's useInteractOutside.test.js
 *
 * Tests for detecting interactions (clicks) outside a given element.
 * Used for closing dialogs, popovers, etc. when clicking outside.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import { createInteractOutside } from "../src/overlays/createInteractOutside";
import { createSignal, type Component } from "solid-js";

// Helper to create a pointer event
function pointerEvent(type: string, opts: Partial<PointerEventInit> = {}) {
  const evt = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    button: opts.button ?? 0,
    ...opts,
  });
  return evt;
}

const originalPointerEvent = typeof PointerEvent !== "undefined" ? PointerEvent : undefined;

function disablePointerEvents() {
  try {
    delete (globalThis as any).PointerEvent;
  } catch {
    (globalThis as any).PointerEvent = undefined;
  }
}

function restorePointerEvents() {
  (globalThis as any).PointerEvent = originalPointerEvent;
}

// Test component that uses createInteractOutside
interface ExampleProps {
  onInteractOutside?: (e: PointerEvent) => void;
  onInteractOutsideStart?: (e: PointerEvent) => void;
  isDisabled?: boolean;
}

const Example: Component<ExampleProps> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  createInteractOutside({
    ref: () => ref(),
    onInteractOutside: props.onInteractOutside,
    onInteractOutsideStart: props.onInteractOutsideStart,
    isDisabled: props.isDisabled,
  });

  return (
    <div ref={setRef} data-testid="example">
      test
    </div>
  );
};

describe("createInteractOutside", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // POINTER EVENTS
  // ============================================

  describe("pointer events", () => {
    it("should fire interact outside events based on pointer events", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      // Click inside - should not fire
      const el = document.querySelector('[data-testid="example"]')!;
      fireEvent(el, pointerEvent("pointerdown"));
      fireEvent(el, pointerEvent("pointerup"));
      fireEvent.click(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      // Click outside - should fire
      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent(document.body, pointerEvent("pointerup"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      // Right click outside - should not fire
      fireEvent(document.body, pointerEvent("pointerdown", { button: 1 }));
      fireEvent(document.body, pointerEvent("pointerup", { button: 1 }));
      fireEvent.click(document.body, { button: 1 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      // Left click outside - should fire
      fireEvent(document.body, pointerEvent("pointerdown", { button: 0 }));
      fireEvent(document.body, pointerEvent("pointerup", { button: 0 }));
      fireEvent.click(document.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a pointer up without pointer down first", () => {
      // Fire pointer down before component is mounted
      fireEvent(document.body, pointerEvent("pointerdown"));

      const onInteractOutside = vi.fn();
      render(() => <Example onInteractOutside={onInteractOutside} />);

      // Fire pointer up / click - should not fire because pointerdown wasn't tracked
      fireEvent(document.body, pointerEvent("pointerup"));
      fireEvent.click(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("should call onInteractOutsideStart when interaction starts", () => {
      const onInteractOutsideStart = vi.fn();
      const onInteractOutside = vi.fn();

      render(() => (
        <Example
          onInteractOutside={onInteractOutside}
          onInteractOutsideStart={onInteractOutsideStart}
        />
      ));

      fireEvent(document.body, pointerEvent("pointerdown"));
      expect(onInteractOutsideStart).toHaveBeenCalledTimes(1);

      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // MOUSE EVENTS (FALLBACK)
  // ============================================

  describe("mouse events", () => {
    beforeEach(() => {
      disablePointerEvents();
    });

    afterEach(() => {
      restorePointerEvents();
    });

    it("should fire interact outside events based on mouse events", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      const el = document.querySelector('[data-testid="example"]')!;
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      fireEvent.mouseDown(document.body, { button: 1 });
      fireEvent.mouseUp(document.body, { button: 1 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(document.body, { button: 0 });
      fireEvent.mouseUp(document.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a mouse up without mouse down first", () => {
      fireEvent.mouseDown(document.body);

      const onInteractOutside = vi.fn();
      render(() => <Example onInteractOutside={onInteractOutside} />);

      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // TOUCH EVENTS
  // ============================================

  describe("touch events", () => {
    beforeEach(() => {
      disablePointerEvents();
    });

    afterEach(() => {
      restorePointerEvents();
    });

    it("should fire interact outside events based on touch events", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      const el = document.querySelector('[data-testid="example"]')!;
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should ignore emulated mouse events", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      const el = document.querySelector('[data-testid="example"]')!;
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a touch end without touch start first", () => {
      fireEvent.touchStart(document.body);

      const onInteractOutside = vi.fn();
      render(() => <Example onInteractOutside={onInteractOutside} />);

      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("does not handle pointer events if disabled", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle mouse events if disabled", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle touch events if disabled", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should not fire when clicking inside nested elements", () => {
      const onInteractOutside = vi.fn();

      const NestedExample: Component<{ onInteractOutside: (e: PointerEvent) => void }> = (
        props,
      ) => {
        const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

        createInteractOutside({
          ref: () => ref(),
          onInteractOutside: props.onInteractOutside,
        });

        return (
          <div ref={setRef} data-testid="outer">
            <div data-testid="inner">
              <button data-testid="nested-button">Click me</button>
            </div>
          </div>
        );
      };

      render(() => <NestedExample onInteractOutside={onInteractOutside} />);

      // Click on nested button - should not fire (it's inside the tracked element)
      const button = document.querySelector('[data-testid="nested-button"]')!;
      fireEvent(button, pointerEvent("pointerdown"));
      fireEvent.click(button);
      expect(onInteractOutside).not.toHaveBeenCalled();

      // Click outside - should fire
      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should handle element removal during interaction", () => {
      const onInteractOutside = vi.fn();

      const { unmount } = render(() => <Example onInteractOutside={onInteractOutside} />);

      // Start interaction
      fireEvent(document.body, pointerEvent("pointerdown"));

      // Unmount the component
      unmount();

      // Complete the click - should not cause errors
      fireEvent.click(document.body);

      // No errors should occur
      expect(true).toBe(true);
    });

    it("should not fire when ref is null", () => {
      const onInteractOutside = vi.fn();

      const NullRefExample: Component<{ onInteractOutside: (e: PointerEvent) => void }> = (
        props,
      ) => {
        createInteractOutside({
          ref: () => null,
          onInteractOutside: props.onInteractOutside,
        });

        return <div data-testid="no-ref">test</div>;
      };

      render(() => <NullRefExample onInteractOutside={onInteractOutside} />);

      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);

      // Should not fire because ref is null
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("should ignore events in top layer elements", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      const topLayer = document.createElement("div");
      topLayer.setAttribute("data-solidaria-top-layer", "true");
      document.body.appendChild(topLayer);

      fireEvent(topLayer, pointerEvent("pointerdown"));
      fireEvent(topLayer, pointerEvent("pointerup"));
      fireEvent.click(topLayer);

      expect(onInteractOutside).not.toHaveBeenCalled();
      document.body.removeChild(topLayer);
    });
  });

  // ============================================
  // SHADOW DOM
  // ============================================

  describe("shadow dom", () => {
    beforeEach(() => {
      disablePointerEvents();
    });

    afterEach(() => {
      restorePointerEvents();
    });

    function createShadowRoot() {
      const host = document.createElement("div");
      document.body.appendChild(host);
      const shadowRoot = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadowRoot.appendChild(container);
      return {
        host,
        shadowRoot,
        container,
        cleanup: () => document.body.removeChild(host),
      };
    }

    const ShadowExample: Component<{ onInteractOutside: (e: PointerEvent) => void }> = (props) => {
      const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

      createInteractOutside({
        ref: () => ref(),
        onInteractOutside: props.onInteractOutside,
      });

      return (
        <div ref={setRef} id="popover">
          <div id="inside-popover">inside</div>
        </div>
      );
    };

    it("does not trigger when clicking inside shadow root", () => {
      const onInteractOutside = vi.fn();
      const { shadowRoot, container, cleanup: cleanupShadow } = createShadowRoot();

      render(() => <ShadowExample onInteractOutside={onInteractOutside} />, { container });

      const inside = shadowRoot.getElementById("inside-popover")!;
      fireEvent.mouseDown(inside);
      fireEvent.mouseUp(inside);

      expect(onInteractOutside).not.toHaveBeenCalled();
      cleanupShadow();
    });

    it("triggers when clicking outside shadow root", () => {
      const onInteractOutside = vi.fn();
      const { container, cleanup: cleanupShadow } = createShadowRoot();

      render(() => <ShadowExample onInteractOutside={onInteractOutside} />, { container });

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      expect(onInteractOutside).toHaveBeenCalledTimes(1);
      cleanupShadow();
    });
  });

  // ============================================
  // INTERACTION SEQUENCE
  // ============================================

  describe("interaction sequence", () => {
    it("should require pointerdown followed by click", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      // Just click without pointerdown - should not fire
      fireEvent.click(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();

      // Complete sequence - should fire
      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should reset state after each interaction", () => {
      const onInteractOutside = vi.fn();

      render(() => <Example onInteractOutside={onInteractOutside} />);

      // First interaction
      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);

      // Second interaction - should work again
      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(2);
    });
  });
});
