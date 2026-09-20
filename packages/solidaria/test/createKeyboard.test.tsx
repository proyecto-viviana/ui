/**
 * createKeyboard tests - Port of React Aria's useKeyboard.test.js
 *
 * Tests keyboard interactions for focusable elements.
 * Verifies event handling, propagation control, and disabled state.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  createKeyboard,
  type KeyboardEvent,
  type KeyboardShortcutBindings,
} from "../src/interactions/createKeyboard";
import type { Component } from "solid-js";

// Test component that uses createKeyboard
interface ExampleProps {
  isDisabled?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  shortcuts?: KeyboardShortcutBindings;
  allowRepeats?: boolean;
  allowComposing?: boolean;
  children?: string;
}

const Example: Component<ExampleProps> = (props) => {
  const { keyboardProps } = createKeyboard({
    isDisabled: props.isDisabled,
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    shortcuts: props.shortcuts,
    allowRepeats: props.allowRepeats,
    allowComposing: props.allowComposing,
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
    vi.restoreAllMocks();
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

  describe("shortcuts", () => {
    it("matches a shortcut, prevents the default action, and stops propagation", () => {
      const action = vi.fn();
      const parentKeyDown = vi.fn();

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Example shortcuts={{ Escape: action }} />
        </div>
      ));

      const event = new window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      screen.getByTestId("example").dispatchEvent(event);

      expect(action).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
      expect(parentKeyDown).not.toHaveBeenCalled();
    });

    it("continues propagation when no shortcut matches", () => {
      const action = vi.fn();
      const parentKeyDown = vi.fn();

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Example shortcuts={{ Escape: action }} />
        </div>
      ));

      fireEvent.keyDown(screen.getByTestId("example"), { key: "Enter" });

      expect(action).not.toHaveBeenCalled();
      expect(parentKeyDown).toHaveBeenCalledTimes(1);
    });

    it("maps Mod to Meta on macOS and Control on other platforms", () => {
      const macAction = vi.fn();
      vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
      const macKeyboard = createKeyboard({ shortcuts: { "Mod+s": macAction } });
      const macTarget = document.createElement("button");
      macTarget.addEventListener("keydown", macKeyboard.keyboardProps.onKeyDown as EventListener);

      macTarget.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true }),
      );
      macTarget.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }),
      );
      expect(macAction).toHaveBeenCalledTimes(1);

      vi.restoreAllMocks();
      const windowsAction = vi.fn();
      vi.spyOn(window.navigator, "platform", "get").mockReturnValue("Win32");
      const windowsKeyboard = createKeyboard({ shortcuts: { "Mod+s": windowsAction } });
      const windowsTarget = document.createElement("button");
      windowsTarget.addEventListener(
        "keydown",
        windowsKeyboard.keyboardProps.onKeyDown as EventListener,
      );

      windowsTarget.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }),
      );
      windowsTarget.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true }),
      );
      expect(windowsAction).toHaveBeenCalledTimes(1);
    });

    it("ignores repeated keydown events unless allowRepeats is true", () => {
      const ignoredAction = vi.fn();
      const allowedAction = vi.fn();
      render(() => (
        <>
          <Example shortcuts={{ a: ignoredAction }}>ignored</Example>
          <Example shortcuts={{ a: allowedAction }} allowRepeats>
            allowed
          </Example>
        </>
      ));

      const examples = screen.getAllByTestId("example");
      fireEvent.keyDown(examples[0], { key: "a", repeat: true });
      fireEvent.keyDown(examples[1], { key: "a", repeat: true });

      expect(ignoredAction).not.toHaveBeenCalled();
      expect(allowedAction).toHaveBeenCalledTimes(1);
    });

    it("ignores composing keydown events unless allowComposing is true", () => {
      const ignoredAction = vi.fn();
      const allowedAction = vi.fn();
      render(() => (
        <>
          <Example shortcuts={{ a: ignoredAction }}>ignored</Example>
          <Example shortcuts={{ a: allowedAction }} allowComposing>
            allowed
          </Example>
        </>
      ));

      const examples = screen.getAllByTestId("example");
      fireEvent.keyDown(examples[0], { key: "a", isComposing: true });
      fireEvent.keyDown(examples[1], { key: "a", isComposing: true });

      expect(ignoredAction).not.toHaveBeenCalled();
      expect(allowedAction).toHaveBeenCalledTimes(1);
    });

    it("does not run shortcuts on keyup", () => {
      const action = vi.fn();
      render(() => <Example shortcuts={{ a: action }} />);

      const example = screen.getByTestId("example");
      fireEvent.keyUp(example, { key: "a" });
      fireEvent.keyUp(example, { key: "a", repeat: true });
      fireEvent.keyUp(example, { key: "a", isComposing: true });

      expect(action).not.toHaveBeenCalled();
    });

    it("runs user handlers before shortcuts", () => {
      const calls: string[] = [];
      render(() => (
        <Example
          onKeyDown={() => calls.push("user keydown")}
          onKeyUp={() => calls.push("user keyup")}
          shortcuts={{ a: () => calls.push("shortcut") }}
        />
      ));

      const example = screen.getByTestId("example");
      fireEvent.keyDown(example, { key: "a" });
      fireEvent.keyUp(example, { key: "a" });

      expect(calls).toEqual(["user keydown", "shortcut", "user keyup"]);
    });

    it("does not install shortcut handlers when disabled", () => {
      const action = vi.fn();
      const result = createKeyboard({ isDisabled: true, shortcuts: { a: action } });

      expect(result.keyboardProps).toEqual({});
    });

    it("validates shortcut bindings before it removes handlers for a disabled target", () => {
      expect(() => createKeyboard({ isDisabled: true, shortcuts: { Mod: vi.fn() } })).toThrow(
        /Invalid keyboard shortcut/,
      );
    });

    it("stops propagation when the first composed shortcut handles the key", () => {
      const parentKeyDown = vi.fn();

      const Component = () => {
        const first = createKeyboard({ shortcuts: { ArrowLeft: () => undefined } });
        const second = createKeyboard({
          shortcuts: { Enter: () => undefined },
          ...first.keyboardProps,
        });
        return <button {...second.keyboardProps}>Save</button>;
      };

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Component />
        </div>
      ));
      fireEvent.keyDown(screen.getByRole("button", { name: "Save" }), { key: "ArrowLeft" });

      expect(parentKeyDown).not.toHaveBeenCalled();
    });

    it("continues propagation when the only matching composed shortcut continues", () => {
      const parentKeyDown = vi.fn();

      const Component = () => {
        const first = createKeyboard({
          shortcuts: { ArrowLeft: () => ({ shouldContinuePropagation: true }) },
        });
        const second = createKeyboard({
          shortcuts: { Enter: () => undefined },
          ...first.keyboardProps,
        });
        return <button {...second.keyboardProps}>Save</button>;
      };

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Component />
        </div>
      ));
      fireEvent.keyDown(screen.getByRole("button", { name: "Save" }), { key: "ArrowLeft" });

      expect(parentKeyDown).toHaveBeenCalledTimes(1);
    });

    it("stops propagation when the second composed shortcut handles the key", () => {
      const parentKeyDown = vi.fn();

      const Component = () => {
        const first = createKeyboard({
          shortcuts: { ArrowLeft: () => ({ shouldContinuePropagation: true }) },
        });
        const second = createKeyboard({
          shortcuts: { ArrowLeft: () => undefined },
          ...first.keyboardProps,
        });
        return <button {...second.keyboardProps}>Save</button>;
      };

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Component />
        </div>
      ));
      fireEvent.keyDown(screen.getByRole("button", { name: "Save" }), { key: "ArrowLeft" });

      expect(parentKeyDown).not.toHaveBeenCalled();
    });

    it("continues propagation when all composed shortcuts continue", () => {
      const parentKeyDown = vi.fn();

      const Component = () => {
        const first = createKeyboard({
          shortcuts: { ArrowLeft: () => ({ shouldContinuePropagation: true }) },
        });
        const second = createKeyboard({
          shortcuts: { ArrowLeft: () => ({ shouldContinuePropagation: true }) },
          ...first.keyboardProps,
        });
        return <button {...second.keyboardProps}>Save</button>;
      };

      render(() => (
        <div onKeyDown={parentKeyDown}>
          <Component />
        </div>
      ));
      fireEvent.keyDown(screen.getByRole("button", { name: "Save" }), { key: "ArrowLeft" });

      expect(parentKeyDown).toHaveBeenCalledTimes(1);
    });

    it("ignores events whose target is outside the current target", () => {
      const action = vi.fn();
      const currentTarget = document.createElement("div");
      const outsideTarget = document.createElement("button");
      const stopPropagation = vi.fn();
      const event = {
        key: "a",
        currentTarget,
        target: outsideTarget,
        composedPath: () => [outsideTarget],
        stopPropagation,
      } as unknown as globalThis.KeyboardEvent;
      const result = createKeyboard({ shortcuts: { a: action } });

      (result.keyboardProps.onKeyDown as (event: globalThis.KeyboardEvent) => void)(event);

      expect(action).not.toHaveBeenCalled();
      expect(stopPropagation).not.toHaveBeenCalled();
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
