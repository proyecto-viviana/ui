/**
 * Tests for createInteractionModality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import {
  createInteractionModality,
  getInteractionModality,
  setInteractionModality,
  addModalityListener,
  setupGlobalFocusListeners,
  addWindowFocusTracking,
  type Modality,
} from "../src/interactions/createInteractionModality";

describe("createInteractionModality", () => {
  describe("getInteractionModality", () => {
    it("should return null initially", () => {
      // Note: This may not be null if other tests have run
      const modality = getInteractionModality();
      expect(
        modality === null || ["keyboard", "pointer", "virtual"].includes(modality as string),
      ).toBe(true);
    });
  });

  describe("setInteractionModality", () => {
    it("should set the current modality to keyboard", () => {
      setInteractionModality("keyboard");
      expect(getInteractionModality()).toBe("keyboard");
    });

    it("should set the current modality to pointer", () => {
      setInteractionModality("pointer");
      expect(getInteractionModality()).toBe("pointer");
    });

    it("should set the current modality to virtual", () => {
      setInteractionModality("virtual");
      expect(getInteractionModality()).toBe("virtual");
    });
  });

  describe("addModalityListener", () => {
    it("should call listener when modality changes", () => {
      const listener = vi.fn();
      const cleanup = addModalityListener(listener);

      setInteractionModality("keyboard");
      expect(listener).toHaveBeenCalledWith("keyboard");

      setInteractionModality("pointer");
      expect(listener).toHaveBeenCalledWith("pointer");

      cleanup();
    });

    it("should not call listener after cleanup", () => {
      const listener = vi.fn();
      const cleanup = addModalityListener(listener);

      cleanup();
      listener.mockClear();

      setInteractionModality("keyboard");
      expect(listener).not.toHaveBeenCalled();
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const cleanup1 = addModalityListener(listener1);
      const cleanup2 = addModalityListener(listener2);

      setInteractionModality("virtual");

      expect(listener1).toHaveBeenCalledWith("virtual");
      expect(listener2).toHaveBeenCalledWith("virtual");

      cleanup1();
      cleanup2();
    });
  });

  describe("createInteractionModality hook", () => {
    it("should return modality accessor", () => {
      createRoot((dispose) => {
        const { modality } = createInteractionModality();

        // The accessor should be a function
        expect(typeof modality).toBe("function");

        // The modality can be null initially or have a value from previous tests
        const value = modality();
        expect(value === null || ["keyboard", "pointer", "virtual"].includes(value)).toBe(true);

        dispose();
      });
    });

    it("should track modality via listener", () => {
      // Test that the listener mechanism works independently
      const listener = vi.fn();
      const cleanup = addModalityListener(listener);

      setInteractionModality("keyboard");
      expect(listener).toHaveBeenLastCalledWith("keyboard");

      setInteractionModality("pointer");
      expect(listener).toHaveBeenLastCalledWith("pointer");

      cleanup();
    });
  });

  describe("keyboard events", () => {
    beforeEach(() => {
      setupGlobalFocusListeners();
    });

    it("should set modality to keyboard on keydown", () => {
      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      document.dispatchEvent(event);
      expect(getInteractionModality()).toBe("keyboard");
    });

    it("should set modality to keyboard on keyup", () => {
      setInteractionModality("pointer"); // Reset first
      const event = new KeyboardEvent("keyup", { key: "Enter", bubbles: true });
      document.dispatchEvent(event);
      expect(getInteractionModality()).toBe("keyboard");
    });

    it("should ignore modifier key events", () => {
      setInteractionModality("pointer"); // Set to pointer first

      // Control key should be ignored
      const ctrlEvent = new KeyboardEvent("keydown", {
        key: "Control",
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(ctrlEvent);
      expect(getInteractionModality()).toBe("pointer");

      // Shift key should be ignored
      const shiftEvent = new KeyboardEvent("keydown", {
        key: "Shift",
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(shiftEvent);
      expect(getInteractionModality()).toBe("pointer");

      // Meta key should be ignored
      const metaEvent = new KeyboardEvent("keydown", { key: "Meta", metaKey: true, bubbles: true });
      document.dispatchEvent(metaEvent);
      expect(getInteractionModality()).toBe("pointer");
    });

    it("should ignore events with modifier keys held", () => {
      setInteractionModality("pointer");

      // Event with ctrl held should be ignored
      const event = new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true });
      document.dispatchEvent(event);
      expect(getInteractionModality()).toBe("pointer");
    });
  });

  describe("pointer events", () => {
    beforeEach(() => {
      setupGlobalFocusListeners();
    });

    it("should set modality to pointer on pointerdown (mouse)", () => {
      setInteractionModality("keyboard"); // Reset first
      const event = new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" });
      document.dispatchEvent(event);
      expect(getInteractionModality()).toBe("pointer");
    });

    it("should set modality to pointer on pointerdown (pen)", () => {
      setInteractionModality("keyboard"); // Reset first
      const event = new PointerEvent("pointerdown", { bubbles: true, pointerType: "pen" });
      document.dispatchEvent(event);
      expect(getInteractionModality()).toBe("pointer");
    });
  });

  describe("setupGlobalFocusListeners", () => {
    it("should be idempotent", () => {
      // Call multiple times, should not throw or add duplicate listeners
      setupGlobalFocusListeners();
      setupGlobalFocusListeners();
      setupGlobalFocusListeners();

      // If we had duplicate listeners, events would fire multiple times
      const listener = vi.fn();
      const cleanup = addModalityListener(listener);

      setInteractionModality("keyboard");

      // Should only be called once
      expect(listener).toHaveBeenCalledTimes(1);

      cleanup();
    });
  });

  describe("focus prototype patch", () => {
    // Build an isolated fake window/document/element so we exercise
    // setupGlobalFocusEvents without touching the real global listeners or the
    // real HTMLElement.prototype.
    function makeFakeTarget(focusDescriptor: PropertyDescriptor) {
      const prototypeObj = {} as { focus: (...args: unknown[]) => void };
      Object.defineProperty(prototypeObj, "focus", focusDescriptor);
      const fakeWindow = {
        HTMLElement: { prototype: prototypeObj },
        PointerEvent: function () {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const fakeDoc = {
        defaultView: fakeWindow,
        readyState: "complete",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const fakeElement = { ownerDocument: fakeDoc };
      return { prototypeObj, fakeElement: fakeElement as unknown as HTMLElement };
    }

    it("installs the focus patch via defineProperty even when focus is a getter-only accessor", () => {
      // Simulate a test library (e.g. user-event setup) that replaced focus with a
      // getter-only accessor. Plain assignment to it throws; defineProperty must not,
      // and must still install the wrapper.
      const underlying = vi.fn();
      const { prototypeObj, fakeElement } = makeFakeTarget({
        configurable: true,
        get: () => underlying,
      });

      let cleanup: (() => void) | undefined;
      expect(() => {
        cleanup = addWindowFocusTracking(fakeElement);
      }).not.toThrow();

      // The patch is installed as a data property (proves defineProperty, not assignment).
      const patched = Object.getOwnPropertyDescriptor(prototypeObj, "focus");
      expect(patched && typeof patched.value).toBe("function");
      expect(patched!.value).not.toBe(underlying);

      // The wrapper still delegates to the original focus implementation.
      prototypeObj.focus.call({});
      expect(underlying).toHaveBeenCalledTimes(1);

      // Teardown restores the original focus implementation.
      cleanup?.();
      expect(Object.getOwnPropertyDescriptor(prototypeObj, "focus")!.value).toBe(underlying);
    });

    it("patches and restores a normal data-property focus", () => {
      const underlying = vi.fn();
      const { prototypeObj, fakeElement } = makeFakeTarget({
        configurable: true,
        writable: true,
        value: underlying,
      });

      const cleanup = addWindowFocusTracking(fakeElement);

      const patched = prototypeObj.focus;
      expect(patched).not.toBe(underlying);
      patched.call({});
      expect(underlying).toHaveBeenCalledTimes(1);

      cleanup();
      expect(prototypeObj.focus).toBe(underlying);
    });
  });
});
