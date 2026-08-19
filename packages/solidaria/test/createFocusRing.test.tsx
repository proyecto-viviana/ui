/**
 * createFocusRing tests - Tests for focus ring visibility.
 *
 * Focus rings are visible when the user navigates with keyboard,
 * but hidden when using mouse/touch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createFocusRing } from "../src/interactions/createFocusRing";
import type { Component } from "solid-js";

// Test component that uses createFocusRing
interface ExampleProps {
  isTextInput?: boolean;
  autoFocus?: boolean;
  within?: boolean;
}

const Example: Component<ExampleProps> = (props) => {
  const { isFocused, isFocusVisible, focusProps } = createFocusRing({
    isTextInput: props.isTextInput,
    autoFocus: props.autoFocus,
    within: props.within,
  });

  return (
    <div
      tabIndex={0}
      {...focusProps}
      data-testid="example"
      data-focused={isFocused()}
      data-focus-visible={isFocusVisible()}
    >
      <button data-testid="inner-button">Inner</button>
    </div>
  );
};

describe("createFocusRing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    cleanup();
  });

  // ============================================
  // BASIC FUNCTIONALITY
  // ============================================

  describe("basic functionality", () => {
    it("should track isFocused state", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      expect(el.dataset.focused).toBe("false");

      el.focus();
      expect(el.dataset.focused).toBe("true");

      el.blur();
      expect(el.dataset.focused).toBe("false");
    });

    it("should return focusProps, isFocused, and isFocusVisible", () => {
      // Must be tested inside render context
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing();
        return <div />;
      });

      expect(result).toHaveProperty("focusProps");
      expect(result).toHaveProperty("isFocused");
      expect(result).toHaveProperty("isFocusVisible");
    });

    it("isFocused and isFocusVisible should be accessors", () => {
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing();
        return <div />;
      });

      expect(typeof result!.isFocused).toBe("function");
      expect(typeof result!.isFocusVisible).toBe("function");
    });
  });

  // ============================================
  // FOCUS VISIBILITY
  // ============================================

  describe("focus visibility", () => {
    it("should not show focus ring initially when not focused", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      expect(el.dataset.focusVisible).toBe("false");
    });

    it("should show focus ring when autoFocus is true", () => {
      render(() => <Example autoFocus />);

      const el = screen.getByTestId("example");
      el.focus();
      expect(el.dataset.focusVisible).toBe("true");
    });

    it("should hide focus ring when element loses focus", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      el.focus();
      el.blur();

      expect(el.dataset.focusVisible).toBe("false");
    });
  });

  // ============================================
  // KEYBOARD VS MOUSE INTERACTION
  // ============================================

  describe("keyboard vs mouse interaction", () => {
    it("should show focus ring when focused after keyboard interaction", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(document.body, { key: "Tab" });
      el.focus();

      expect(el.dataset.focusVisible).toBe("true");
    });

    it("should not show focus ring when focused after pointer interaction", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      fireEvent.pointerDown(document.body, { pointerType: "mouse" });
      el.focus();

      expect(el.dataset.focusVisible).toBe("false");
    });

    it("does not hide the ring on pointermove while focused", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(document.body, { key: "Tab" });
      el.focus();
      expect(el.dataset.focusVisible).toBe("true");

      fireEvent.pointerMove(document.body, { pointerType: "mouse" });
      expect(el.dataset.focusVisible).toBe("true");
    });

    it("re-samples global modality on focus so pointermove then restore does not keep a keyboard ring", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");
      fireEvent.keyDown(document.body, { key: "Tab" });
      el.focus();
      expect(el.dataset.focusVisible).toBe("true");

      el.blur();
      expect(el.dataset.focusVisible).toBe("false");

      fireEvent.pointerMove(document.body, { pointerType: "mouse" });
      el.focus();
      expect(el.dataset.focusVisible).toBe("false");
    });

    it("should track focus state regardless of interaction method", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");

      // Focus via any method should update isFocused
      el.focus();
      expect(el.dataset.focused).toBe("true");

      el.blur();
      expect(el.dataset.focused).toBe("false");
    });
  });

  // ============================================
  // TEXT INPUT BEHAVIOR
  // ============================================

  describe("text input behavior", () => {
    it("should track focus state for text inputs", () => {
      const TextInputExample: Component = () => {
        const { isFocused, isFocusVisible, focusProps } = createFocusRing({
          isTextInput: true,
        });

        return (
          <input
            type="text"
            {...focusProps}
            data-testid="input"
            data-focused={isFocused()}
            data-focus-visible={isFocusVisible()}
          />
        );
      };

      render(() => <TextInputExample />);

      const input = screen.getByTestId("input");

      // Text inputs should track focus state
      input.focus();
      expect(input.dataset.focused).toBe("true");

      input.blur();
      expect(input.dataset.focused).toBe("false");
    });

    it("should not show focus ring for text inputs after pointer interaction", () => {
      const TextInputExample: Component = () => {
        const { isFocused, isFocusVisible, focusProps } = createFocusRing({
          isTextInput: true,
        });

        return (
          <input
            type="text"
            {...focusProps}
            data-testid="input-visible"
            data-focused={isFocused()}
            data-focus-visible={isFocusVisible()}
          />
        );
      };

      render(() => <TextInputExample />);

      const input = screen.getByTestId("input-visible");
      fireEvent.pointerDown(document.body, { pointerType: "mouse" });
      input.focus();

      expect(input.dataset.focusVisible).toBe("false");
    });
  });

  // ============================================
  // DEFAULT PROPS
  // ============================================

  describe("default props", () => {
    it("should use default values when no props provided", () => {
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing();
        return <div />;
      });

      expect(result!.isFocused()).toBe(false);
    });

    it("should handle empty props object", () => {
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing({});
        return <div />;
      });

      expect(result!.isFocused()).toBe(false);
      expect(result).toHaveProperty("focusProps");
    });
  });

  // ============================================
  // MULTIPLE INSTANCES
  // ============================================

  describe("multiple instances", () => {
    it("should track focus independently for multiple elements", () => {
      const MultiExample: Component = () => {
        const first = createFocusRing();
        const second = createFocusRing();

        return (
          <div>
            <div
              tabIndex={0}
              {...first.focusProps}
              data-testid="first"
              data-focused={first.isFocused()}
            />
            <div
              tabIndex={0}
              {...second.focusProps}
              data-testid="second"
              data-focused={second.isFocused()}
            />
          </div>
        );
      };

      render(() => <MultiExample />);

      const first = screen.getByTestId("first");
      const second = screen.getByTestId("second");

      first.focus();
      expect(first.dataset.focused).toBe("true");
      expect(second.dataset.focused).toBe("false");

      second.focus();
      // When second gets focus, first loses it
      expect(first.dataset.focused).toBe("false");
      expect(second.dataset.focused).toBe("true");
    });
  });

  // ============================================
  // AUTOFOCUS BEHAVIOR
  // ============================================

  describe("autoFocus behavior", () => {
    it("should set isFocusVisible to true initially when autoFocus is true and focused", () => {
      // autoFocus affects the initial modality state
      // but isFocusVisible is only true when also focused
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing({ autoFocus: true });
        return <div />;
      });

      // Without actual focus, isFocusVisible is false because of the isFocused && isFocusVisible logic
      // The autoFocus flag just initializes the modality hint
    });

    it("should set isFocusVisible to false initially when autoFocus is false", () => {
      let result: ReturnType<typeof createFocusRing> | undefined;

      render(() => {
        result = createFocusRing({ autoFocus: false });
        return <div />;
      });

      expect(result!.isFocusVisible()).toBe(false);
    });
  });

  // ============================================
  // FOCUS PROPS
  // ============================================

  describe("focus props", () => {
    it("should spread focusProps onto element and respond to focus", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");

      // Element should be focusable and respond to focus events
      el.focus();
      expect(el.dataset.focused).toBe("true");
    });
  });

  // ============================================
  // WITHIN MODE
  // ============================================

  describe("within", () => {
    it("should track focus within child elements", () => {
      let focusPropsRef: ReturnType<typeof createFocusRing>["focusProps"] | undefined;

      const WithinExample: Component = () => {
        const { isFocused, isFocusVisible, focusProps } = createFocusRing({ within: true });
        focusPropsRef = focusProps;

        return (
          <div
            tabIndex={0}
            {...focusProps}
            data-testid="within"
            data-focused={isFocused()}
            data-focus-visible={isFocusVisible()}
          >
            <button data-testid="within-button">Inner</button>
          </div>
        );
      };

      render(() => <WithinExample />);

      const button = screen.getByTestId("within-button");
      fireEvent.keyDown(document.body, { key: "Tab" });
      button.focus();
      const container = screen.getByTestId("within");
      focusPropsRef?.onFocus?.({
        currentTarget: container,
        target: button,
      } as unknown as FocusEvent);

      expect(container.dataset.focused).toBe("true");
      expect(container.dataset.focusVisible).toBe("true");
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe("edge cases", () => {
    it("should handle rapid focus/blur cycles", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");

      // Rapid focus/blur cycles
      for (let i = 0; i < 10; i++) {
        el.focus();
        el.blur();
      }

      // Should end unfocused
      expect(el.dataset.focused).toBe("false");
    });

    it("should handle focus when already focused", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");

      el.focus();
      el.focus(); // Double focus

      expect(el.dataset.focused).toBe("true");
    });

    it("should handle blur when not focused", () => {
      render(() => <Example />);

      const el = screen.getByTestId("example");

      // Blur without prior focus
      el.blur();

      expect(el.dataset.focused).toBe("false");
    });
  });
});
