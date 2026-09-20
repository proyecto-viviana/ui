/**
 * createFocus tests - Tests for focus event handling.
 *
 * Tests focus/blur events for the immediate target element.
 * Focus events on child elements are ignored.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, cleanup, waitFor, fireEvent } from "@solidjs/testing-library";
import { createFocus } from "../src/interactions/createFocus";
import { createSignal, type Component } from "solid-js";

// Test component that uses createFocus
interface ExampleProps {
  isDisabled?: boolean;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

const Example: Component<ExampleProps> = (props) => {
  const { focusProps } = createFocus({
    isDisabled: props.isDisabled,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onFocusChange: props.onFocusChange,
  });

  return (
    <div tabIndex={0} {...focusProps} data-testid="example">
      <button data-testid="inner-button">Inner</button>
    </div>
  );
};

function createShadowRootContainer() {
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

describe("createFocus", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // BASIC FUNCTIONALITY
  // ============================================

  describe("basic functionality", () => {
    it("should fire onFocus when element receives focus", () => {
      const onFocus = vi.fn();

      render(() => <Example onFocus={onFocus} />);

      const el = screen.getByTestId("example");
      // Use actual focus() to properly set document.activeElement
      el.focus();

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it("should fire onBlur when element loses focus", () => {
      const onBlur = vi.fn();

      render(() => <Example onBlur={onBlur} />);

      const el = screen.getByTestId("example");
      el.focus();
      fireEvent.focusIn(el);
      el.blur();
      fireEvent.focusOut(el);

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should fire onFocusChange with true when focused", () => {
      const onFocusChange = vi.fn();

      render(() => <Example onFocusChange={onFocusChange} />);

      const el = screen.getByTestId("example");
      el.focus();

      expect(onFocusChange).toHaveBeenCalledWith(true);
    });

    it("should fire onFocusChange with false when blurred", () => {
      const onFocusChange = vi.fn();

      render(() => <Example onFocusChange={onFocusChange} />);

      const el = screen.getByTestId("example");
      el.focus();
      fireEvent.focusIn(el);
      el.blur();
      fireEvent.focusOut(el);

      expect(onFocusChange).toHaveBeenCalledWith(false);
    });

    it("should call all handlers in sequence", () => {
      const events: string[] = [];
      const onFocus = vi.fn(() => events.push("onFocus"));
      const onBlur = vi.fn(() => events.push("onBlur"));
      const onFocusChange = vi.fn((isFocused) => events.push(`onFocusChange:${isFocused}`));

      render(() => <Example onFocus={onFocus} onBlur={onBlur} onFocusChange={onFocusChange} />);

      const el = screen.getByTestId("example");
      el.focus();
      el.blur();

      expect(events).toEqual(["onFocus", "onFocusChange:true", "onBlur", "onFocusChange:false"]);
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should not fire onFocus when disabled", () => {
      const onFocus = vi.fn();

      render(() => <Example isDisabled onFocus={onFocus} />);

      const el = screen.getByTestId("example");
      el.focus();

      expect(onFocus).not.toHaveBeenCalled();
    });

    it("should not fire onBlur when disabled", () => {
      const onBlur = vi.fn();

      render(() => <Example isDisabled onBlur={onBlur} />);

      const el = screen.getByTestId("example");
      el.focus();
      el.blur();

      expect(onBlur).not.toHaveBeenCalled();
    });

    it("should not fire onFocusChange when disabled", () => {
      const onFocusChange = vi.fn();

      render(() => <Example isDisabled onFocusChange={onFocusChange} />);

      const el = screen.getByTestId("example");
      el.focus();

      expect(onFocusChange).not.toHaveBeenCalled();
    });

    it("should return empty focusProps when disabled", () => {
      const result = createFocus({ isDisabled: true, onFocus: vi.fn() });
      expect(result.focusProps).toEqual({});
    });

    it("should fire onBlur when a focused element is disabled", async () => {
      const ButtonExample: Component<{
        disabled?: boolean;
        onFocus?: (e: FocusEvent) => void;
        onBlur?: (e: FocusEvent) => void;
      }> = (props) => {
        const { focusProps } = createFocus({
          onFocus: props.onFocus,
          onBlur: props.onBlur,
        });

        return (
          <button disabled={props.disabled} {...focusProps} data-testid="button">
            Button
          </button>
        );
      };

      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const [isDisabled, setIsDisabled] = createSignal(false);
      render(() => <ButtonExample disabled={isDisabled()} onFocus={onFocus} onBlur={onBlur} />);

      const button = screen.getByTestId("button");
      button.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);

      setIsDisabled(true);

      await waitFor(() => {
        expect(onBlur).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ============================================
  // CHILD ELEMENT FOCUS
  // ============================================

  describe("child element focus", () => {
    it("should not fire onFocus when child receives focus", () => {
      const onFocus = vi.fn();

      render(() => <Example onFocus={onFocus} />);

      const innerButton = screen.getByTestId("inner-button");
      innerButton.focus();

      // Focus on child should not trigger parent's onFocus
      expect(onFocus).not.toHaveBeenCalled();
    });

    it("should not fire onBlur when child loses focus", () => {
      const onBlur = vi.fn();

      render(() => <Example onBlur={onBlur} />);

      const innerButton = screen.getByTestId("inner-button");
      innerButton.focus();
      innerButton.blur();

      // Blur on child should not trigger parent's onBlur
      expect(onBlur).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // EVENT PROPERTIES
  // ============================================

  describe("event properties", () => {
    it("should pass the focus event to onFocus handler", () => {
      const onFocus = vi.fn();

      render(() => <Example onFocus={onFocus} />);

      const el = screen.getByTestId("example");
      el.focus();

      expect(onFocus).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "focus",
          target: el,
        }),
      );
    });

    it("should pass the blur event to onBlur handler", () => {
      const onBlur = vi.fn();

      render(() => <Example onBlur={onBlur} />);

      const el = screen.getByTestId("example");
      el.focus();
      el.blur();

      expect(onBlur).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "blur",
          target: el,
        }),
      );
    });
  });

  // ============================================
  // EVENT PROPAGATION
  // ============================================

  describe("event propagation", () => {
    it("events do not bubble when stopPropagation is called", () => {
      const onWrapperFocus = vi.fn();
      const onWrapperBlur = vi.fn();
      const onInnerFocus = vi.fn((event: FocusEvent) => event.stopImmediatePropagation());
      const onInnerBlur = vi.fn((event: FocusEvent) => event.stopImmediatePropagation());

      render(() => (
        <div onFocus={onWrapperFocus} onBlur={onWrapperBlur}>
          <Example onFocus={onInnerFocus} onBlur={onInnerBlur} />
        </div>
      ));

      const el = screen.getByTestId("example");
      el.focus();
      onInnerFocus.mockClear();
      onInnerBlur.mockClear();
      onWrapperFocus.mockClear();
      onWrapperBlur.mockClear();
      fireEvent.focus(el, { bubbles: true });
      fireEvent.blur(el, { bubbles: true });

      expect(onInnerFocus).toHaveBeenCalledTimes(1);
      expect(onInnerBlur).toHaveBeenCalledTimes(1);
      expect(onWrapperFocus).not.toHaveBeenCalled();
      expect(onWrapperBlur).not.toHaveBeenCalled();
    });

    it("events bubble by default", () => {
      const onWrapperFocus = vi.fn();
      const onWrapperBlur = vi.fn();
      const onInnerFocus = vi.fn();
      const onInnerBlur = vi.fn();

      render(() => (
        <div onFocus={onWrapperFocus} onBlur={onWrapperBlur}>
          <Example onFocus={onInnerFocus} onBlur={onInnerBlur} />
        </div>
      ));

      const el = screen.getByTestId("example");
      el.focus();
      onInnerFocus.mockClear();
      onInnerBlur.mockClear();
      onWrapperFocus.mockClear();
      onWrapperBlur.mockClear();
      fireEvent.focus(el, { bubbles: true });
      fireEvent.blur(el, { bubbles: true });

      expect(onInnerFocus).toHaveBeenCalledTimes(1);
      expect(onInnerBlur).toHaveBeenCalledTimes(1);
      expect(onWrapperFocus).toHaveBeenCalledTimes(1);
      expect(onWrapperBlur).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // RETURN VALUE
  // ============================================

  describe("return value", () => {
    it("should return focusProps object", () => {
      const result = createFocus({
        onFocus: vi.fn(),
        onBlur: vi.fn(),
      });

      expect(result).toHaveProperty("focusProps");
    });

    it("should include onFocus when handler provided", () => {
      const result = createFocus({ onFocus: vi.fn() });
      expect(typeof result.focusProps.onFocus).toBe("function");
    });

    it("should include onBlur when handler provided", () => {
      const result = createFocus({ onBlur: vi.fn() });
      expect(typeof result.focusProps.onBlur).toBe("function");
    });

    it("should include both when onFocusChange provided", () => {
      const result = createFocus({ onFocusChange: vi.fn() });
      expect(typeof result.focusProps.onFocus).toBe("function");
      expect(typeof result.focusProps.onBlur).toBe("function");
    });

    it("should return empty focusProps when no handlers provided", () => {
      const result = createFocus({});
      expect(result.focusProps.onFocus).toBeUndefined();
      expect(result.focusProps.onBlur).toBeUndefined();
    });
  });

  // ============================================
  // MULTIPLE FOCUS/BLUR CYCLES
  // ============================================

  describe("multiple focus/blur cycles", () => {
    it("should handle multiple focus/blur cycles", () => {
      const onFocusChange = vi.fn();

      render(() => <Example onFocusChange={onFocusChange} />);

      const el = screen.getByTestId("example");

      el.focus();
      el.blur();
      el.focus();
      el.blur();
      el.focus();

      expect(onFocusChange).toHaveBeenCalledTimes(5);
      expect(onFocusChange.mock.calls).toEqual([[true], [false], [true], [false], [true]]);
    });
  });

  // ============================================
  // FORM ELEMENTS
  // ============================================

  describe("form elements", () => {
    const FormExample: Component<ExampleProps> = (props) => {
      const { focusProps } = createFocus({
        isDisabled: props.isDisabled,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
      });

      return <input type="text" {...focusProps} data-testid="input" />;
    };

    it("should work with input elements", () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      render(() => <FormExample onFocus={onFocus} onBlur={onBlur} />);

      const input = screen.getByTestId("input");
      input.focus();
      input.blur();

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should work with button elements", () => {
      const ButtonExample: Component<ExampleProps> = (props) => {
        const { focusProps } = createFocus({
          onFocus: props.onFocus,
          onBlur: props.onBlur,
        });

        return (
          <button {...focusProps} data-testid="button">
            Click
          </button>
        );
      };

      const onFocus = vi.fn();
      const onBlur = vi.fn();

      render(() => <ButtonExample onFocus={onFocus} onBlur={onBlur} />);

      const button = screen.getByTestId("button");
      button.focus();
      button.blur();

      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // SHADOW DOM
  // ============================================

  describe("shadow dom", () => {
    it("handles focus events inside shadow root", () => {
      const events: Array<{ type: string; target: EventTarget | null }> = [];
      const addEvent = (event: FocusEvent) =>
        events.push({ type: event.type, target: event.target });
      const { container, cleanup: cleanupShadow, shadowRoot } = createShadowRootContainer();

      const { unmount } = render(
        () => (
          <Example
            onFocus={addEvent}
            onBlur={addEvent}
            onFocusChange={(isFocused) =>
              events.push({ type: "focuschange", target: isFocused ? "focused" : "blurred" })
            }
          />
        ),
        { container },
      );

      const el = shadowRoot.querySelector('[data-testid="example"]') as HTMLElement;
      el.focus();
      fireEvent.focusIn(el);
      el.blur();
      fireEvent.focusOut(el);

      expect(events).toEqual([
        { type: "focus", target: el },
        { type: "focuschange", target: "focused" },
        { type: "blur", target: el },
        { type: "focuschange", target: "blurred" },
      ]);

      unmount();
      cleanupShadow();
    });

    it("does not handle focus events if disabled in shadow root", () => {
      const events: Array<{ type: string; target: EventTarget | null }> = [];
      const addEvent = (event: FocusEvent) =>
        events.push({ type: event.type, target: event.target });
      const { container, cleanup: cleanupShadow, shadowRoot } = createShadowRootContainer();

      const { unmount } = render(
        () => (
          <Example
            isDisabled
            onFocus={addEvent}
            onBlur={addEvent}
            onFocusChange={(isFocused) =>
              events.push({ type: "focuschange", target: isFocused ? "focused" : "blurred" })
            }
          />
        ),
        { container },
      );

      const el = shadowRoot.querySelector('[data-testid="example"]') as HTMLElement;
      el.focus();
      fireEvent.focusIn(el);
      el.blur();
      fireEvent.focusOut(el);

      expect(events).toEqual([]);

      unmount();
      cleanupShadow();
    });
  });
});
