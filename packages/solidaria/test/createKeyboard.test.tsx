/**
 * createKeyboard tests - Port of React Aria's useKeyboard.test.js
 *
 * Tests keyboard interactions for focusable elements.
 * Verifies event handling, propagation control, and disabled state.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createKeyboard, type KeyboardEvent } from "../src/interactions/createKeyboard";
import type { Component } from "solid-js";

// Test component that uses createKeyboard
interface ExampleProps {
  isDisabled?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  children?: string;
}

const Example: Component<ExampleProps> = (props) => {
  const { keyboardProps } = createKeyboard({
    isDisabled: props.isDisabled,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
  });

  return (
    <div tabIndex={-1} {...keyboardProps} data-testid="example">
      {props.children}
    </div>
  );
};

describe("createKeyboard", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // BASIC FUNCTIONALITY
  // ============================================

  describe("basic functionality", () => {
    it("should handle keyboard events", () => {
      const events: { type: string; target: EventTarget | null }[] = [];
      const addEvent = (e: KeyboardEvent) => events.push({ type: e.type, target: e.target });

      render(() => <Example onKeyDown={addEvent} onKeyUp={addEvent} />);

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });
      fireEvent.keyUp(el, { key: "A" });

      expect(events).toEqual([
        { type: "keydown", target: el },
        { type: "keyup", target: el },
      ]);
    });

    it("should pass key information in events", () => {
      const events: { type: string; key: string }[] = [];
      const addEvent = (e: KeyboardEvent) => events.push({ type: e.type, key: e.key });

      render(() => <Example onKeyDown={addEvent} onKeyUp={addEvent} />);

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "Enter" });
      fireEvent.keyUp(el, { key: "Enter" });

      expect(events).toEqual([
        { type: "keydown", key: "Enter" },
        { type: "keyup", key: "Enter" },
      ]);
    });

    it("should only call onKeyDown for keydown events", () => {
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyUp).not.toHaveBeenCalled();
    });

    it("should only call onKeyUp for keyup events", () => {
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyUp(el, { key: "A" });

      expect(onKeyDown).not.toHaveBeenCalled();
      expect(onKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should not handle events when disabled", () => {
      const events: { type: string }[] = [];
      const addEvent = (e: KeyboardEvent) => events.push({ type: e.type });

      render(() => <Example isDisabled onKeyDown={addEvent} onKeyUp={addEvent} />);

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });
      fireEvent.keyUp(el, { key: "A" });

      expect(events).toEqual([]);
    });

    it("should return empty keyboardProps when disabled", () => {
      const result = createKeyboard({ isDisabled: true, onKeyDown: vi.fn() });
      expect(result.keyboardProps).toEqual({});
    });
  });

  // ============================================
  // EVENT PROPAGATION
  // ============================================

  describe("event propagation", () => {
    it("events do not bubble by default", () => {
      const onWrapperKeyDown = vi.fn();
      const onWrapperKeyUp = vi.fn();
      const onInnerKeyDown = vi.fn();
      const onInnerKeyUp = vi.fn();

      render(() => (
        <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp} data-testid="wrapper">
          <Example onKeyDown={onInnerKeyDown} onKeyUp={onInnerKeyUp} />
        </button>
      ));

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });
      fireEvent.keyUp(el, { key: "A" });

      expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
      expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
      expect(onWrapperKeyDown).not.toHaveBeenCalled();
      expect(onWrapperKeyUp).not.toHaveBeenCalled();
    });

    it("events bubble when continuePropagation is called", () => {
      const onWrapperKeyDown = vi.fn();
      const onWrapperKeyUp = vi.fn();
      const onInnerKeyDown = vi.fn((e: KeyboardEvent) => e.continuePropagation());
      const onInnerKeyUp = vi.fn((e: KeyboardEvent) => e.continuePropagation());

      render(() => (
        <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp} data-testid="wrapper">
          <Example onKeyDown={onInnerKeyDown} onKeyUp={onInnerKeyUp} />
        </button>
      ));

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });
      fireEvent.keyUp(el, { key: "A" });

      expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
      expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
      expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
      expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
    });

    it("only keydown propagates when continuePropagation called in keydown", () => {
      const onWrapperKeyDown = vi.fn();
      const onWrapperKeyUp = vi.fn();
      const onInnerKeyDown = vi.fn((e: KeyboardEvent) => e.continuePropagation());
      const onInnerKeyUp = vi.fn(); // Does not call continuePropagation

      render(() => (
        <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp} data-testid="wrapper">
          <Example onKeyDown={onInnerKeyDown} onKeyUp={onInnerKeyUp} />
        </button>
      ));

      const el = screen.getByTestId("example");
      el.focus();

      fireEvent.keyDown(el, { key: "A" });
      fireEvent.keyUp(el, { key: "A" });

      expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
      expect(onWrapperKeyUp).not.toHaveBeenCalled();
    });

    it("forwards continuePropagation to a parent-wrapped event (nested createEventHandler)", () => {
      // Simulate an event a parent createEventHandler already wrapped: it carries
      // its own continuePropagation. When the inner handler continues, the parent's
      // continuePropagation must fire too and the inner wrapper must not stop.
      const parentContinuePropagation = vi.fn();
      const stopPropagation = vi.fn();
      const onKeyDown = vi.fn((e: KeyboardEvent) => e.continuePropagation());

      const { keyboardProps } = createKeyboard({ onKeyDown });

      const event = {
        type: "keydown",
        key: "A",
        continuePropagation: parentContinuePropagation,
        stopPropagation,
      } as unknown as KeyboardEvent;

      (keyboardProps.onKeyDown as unknown as (e: KeyboardEvent) => void)(event);

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(parentContinuePropagation).toHaveBeenCalledTimes(1);
      expect(stopPropagation).not.toHaveBeenCalled();
    });

    it("leaves a parent continuePropagation untouched when the inner handler does not continue", () => {
      const parentContinuePropagation = vi.fn();
      const stopPropagation = vi.fn();
      const onKeyDown = vi.fn(); // does not continue

      const { keyboardProps } = createKeyboard({ onKeyDown });

      const event = {
        type: "keydown",
        key: "A",
        continuePropagation: parentContinuePropagation,
        stopPropagation,
      } as unknown as KeyboardEvent;

      (keyboardProps.onKeyDown as unknown as (e: KeyboardEvent) => void)(event);

      expect(parentContinuePropagation).not.toHaveBeenCalled();
      expect(stopPropagation).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // SPECIAL KEYS
  // ============================================

  describe("special keys", () => {
    it("should handle Enter key", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "Enter" });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
        }),
      );
    });

    it("should handle Space key", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: " " });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: " ",
        }),
      );
    });

    it("should handle Escape key", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "Escape" });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Escape",
        }),
      );
    });

    it("should handle Tab key", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "Tab" });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Tab",
        }),
      );
    });

    it("should handle arrow keys", () => {
      const keys: string[] = [];
      const onKeyDown = vi.fn((e: KeyboardEvent) => keys.push(e.key));

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "ArrowUp" });
      fireEvent.keyDown(el, { key: "ArrowDown" });
      fireEvent.keyDown(el, { key: "ArrowLeft" });
      fireEvent.keyDown(el, { key: "ArrowRight" });

      expect(keys).toEqual(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    });
  });

  // ============================================
  // MODIFIER KEYS
  // ============================================

  describe("modifier keys", () => {
    it("should include modifier key states", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, {
        key: "a",
        ctrlKey: true,
        shiftKey: true,
        altKey: false,
        metaKey: false,
      });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          metaKey: false,
        }),
      );
    });

    it("should handle Ctrl+key combinations", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "c", ctrlKey: true });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "c",
          ctrlKey: true,
        }),
      );
    });

    it("should handle Meta+key combinations (Cmd on Mac)", () => {
      const onKeyDown = vi.fn();

      render(() => <Example onKeyDown={onKeyDown} />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(el, { key: "v", metaKey: true });

      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "v",
          metaKey: true,
        }),
      );
    });
  });

  // ============================================
  // RETURN VALUE
  // ============================================

  describe("return value", () => {
    it("should return keyboardProps object", () => {
      const result = createKeyboard({
        onKeyDown: vi.fn(),
        onKeyUp: vi.fn(),
      });

      expect(result).toHaveProperty("keyboardProps");
      expect(typeof result.keyboardProps.onKeyDown).toBe("function");
      expect(typeof result.keyboardProps.onKeyUp).toBe("function");
    });

    it("should return undefined handlers when not provided", () => {
      const result = createKeyboard({});

      expect(result.keyboardProps.onKeyDown).toBeUndefined();
      expect(result.keyboardProps.onKeyUp).toBeUndefined();
    });

    it("should return only onKeyDown when only that is provided", () => {
      const result = createKeyboard({
        onKeyDown: vi.fn(),
      });

      expect(typeof result.keyboardProps.onKeyDown).toBe("function");
      expect(result.keyboardProps.onKeyUp).toBeUndefined();
    });
  });
});
