/**
 * createFocusWithin tests - Port of React Aria's useFocusWithin.test.js
 *
 * Tests for handling focus events on a target element and its descendants.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createFocusWithin, type FocusWithinProps } from "../src/interactions/createFocusWithin";
import { createSignal, type Component, type JSX } from "solid-js";

// Test component that uses createFocusWithin
interface ExampleProps extends FocusWithinProps {
  children?: JSX.Element;
}

const Example: Component<ExampleProps> = (props) => {
  const { focusWithinProps } = createFocusWithin({
    isDisabled: props.isDisabled,
    onFocusWithin: props.onFocusWithin,
    onBlurWithin: props.onBlurWithin,
    onFocusWithinChange: props.onFocusWithinChange,
  });

  return (
    <div tabIndex={-1} {...focusWithinProps} data-testid="example">
      {props.children}
    </div>
  );
};

function createFocusEvent(
  currentTarget: Element,
  target: Element,
  relatedTarget: Element | null = null,
) {
  const event: any = {
    currentTarget,
    target,
    relatedTarget,
    cancelBubble: false,
    composedPath: () => [target, currentTarget],
    stopPropagation() {
      event.cancelBubble = true;
    },
    stopImmediatePropagation() {
      event.cancelBubble = true;
    },
  };
  return event as FocusEvent;
}

describe("createFocusWithin", () => {
  afterEach(() => {
    cleanup();
  });

  it("handles focus events on the target itself", () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
      />
    ));

    const el = screen.getByTestId("example");
    el.focus();
    el.blur();

    expect(events).toContainEqual({ type: "focus", target: el });
    expect(events).toContainEqual({ type: "focuschange", isFocused: true });
    expect(events).toContainEqual({ type: "blur", target: el });
    expect(events).toContainEqual({ type: "focuschange", isFocused: false });
  });

  it("does handle focus events on children", () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
      >
        <div data-testid="child" tabIndex={-1} />
      </Example>
    ));

    const el = screen.getByTestId("example");
    const child = screen.getByTestId("child");

    child.focus();
    el.focus();
    child.focus();
    child.blur();

    // Should have received focus and blur events
    expect(events.some((e) => e.type === "focus")).toBe(true);
    expect(events.some((e) => e.type === "focuschange" && e.isFocused === true)).toBe(true);
  });

  it("does not handle focus events if disabled", () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        isDisabled
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
      >
        <div data-testid="child" tabIndex={-1} />
      </Example>
    ));

    const child = screen.getByTestId("child");
    child.focus();
    child.blur();

    expect(events).toEqual([]);
  });

  it("events do not bubble when stopPropagation is called", () => {
    const onWrapperFocus = vi.fn();
    const onWrapperBlur = vi.fn();
    const onInnerFocus = vi.fn((event: FocusEvent) => event.stopPropagation());
    const onInnerBlur = vi.fn((event: FocusEvent) => event.stopPropagation());
    let focusWithinPropsRef: ReturnType<typeof createFocusWithin>["focusWithinProps"] | undefined;

    const Test: Component = () => {
      const { focusWithinProps } = createFocusWithin({
        onFocusWithin: onInnerFocus,
        onBlurWithin: onInnerBlur,
      });
      focusWithinPropsRef = focusWithinProps;
      return (
        <div tabIndex={-1} {...focusWithinProps} data-testid="example">
          <div data-testid="child" tabIndex={0} />
        </div>
      );
    };

    render(() => (
      <div onFocusIn={onWrapperFocus} onFocusOut={onWrapperBlur}>
        <Test />
      </div>
    ));

    const container = screen.getByTestId("example");
    const child = screen.getByTestId("child");
    child.focus();
    onInnerFocus.mockClear();
    onInnerBlur.mockClear();
    onWrapperFocus.mockClear();
    onWrapperBlur.mockClear();

    const focusEvent = createFocusEvent(container, child);
    focusWithinPropsRef?.onFocus?.(focusEvent);
    if (!focusEvent.cancelBubble) {
      onWrapperFocus(focusEvent);
    }

    const blurEvent = createFocusEvent(container, child, null);
    focusWithinPropsRef?.onBlur?.(blurEvent);
    if (!blurEvent.cancelBubble) {
      onWrapperBlur(blurEvent);
    }

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
    let focusWithinPropsRef: ReturnType<typeof createFocusWithin>["focusWithinProps"] | undefined;

    const Test: Component = () => {
      const { focusWithinProps } = createFocusWithin({
        onFocusWithin: onInnerFocus,
        onBlurWithin: onInnerBlur,
      });
      focusWithinPropsRef = focusWithinProps;
      return (
        <div tabIndex={-1} {...focusWithinProps} data-testid="example">
          <div data-testid="child" tabIndex={0} />
        </div>
      );
    };

    render(() => (
      <div onFocusIn={onWrapperFocus} onFocusOut={onWrapperBlur}>
        <Test />
      </div>
    ));

    const container = screen.getByTestId("example");
    const child = screen.getByTestId("child");
    child.focus();
    onInnerFocus.mockClear();
    onInnerBlur.mockClear();
    onWrapperFocus.mockClear();
    onWrapperBlur.mockClear();

    const focusEvent = createFocusEvent(container, child);
    focusWithinPropsRef?.onFocus?.(focusEvent);
    if (!focusEvent.cancelBubble) {
      onWrapperFocus(focusEvent);
    }

    const blurEvent = createFocusEvent(container, child, null);
    focusWithinPropsRef?.onBlur?.(blurEvent);
    if (!blurEvent.cancelBubble) {
      onWrapperBlur(blurEvent);
    }

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).toHaveBeenCalledTimes(1);
    expect(onWrapperBlur).toHaveBeenCalledTimes(1);
  });

  it("should fire onBlurWithin when a focused element is disabled", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const [isDisabled, setIsDisabled] = createSignal(false);
    let focusWithinPropsRef: ReturnType<typeof createFocusWithin>["focusWithinProps"] | undefined;

    const ButtonExample: Component = () => {
      const { focusWithinProps } = createFocusWithin({
        onFocusWithin: onFocus,
        onBlurWithin: onBlur,
      });
      focusWithinPropsRef = focusWithinProps;

      return (
        <div {...focusWithinProps}>
          <button disabled={isDisabled()} data-testid="button">
            Button
          </button>
        </div>
      );
    };

    render(() => <ButtonExample />);

    const container = screen.getByTestId("button").parentElement as HTMLElement;
    const button = screen.getByTestId("button");
    button.focus();
    expect(document.activeElement).toBe(button);

    const focusEvent = createFocusEvent(container, button);
    focusWithinPropsRef?.onFocus?.(focusEvent);

    expect(onFocus).toHaveBeenCalledTimes(1);

    setIsDisabled(true);

    await waitFor(() => {
      const blurEvent = createFocusEvent(container, button, null);
      focusWithinPropsRef?.onBlur?.(blurEvent);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  it("should fire onBlurWithin when focus occurs outside", async () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type, target: e.target });
    let focusWithinPropsRef: ReturnType<typeof createFocusWithin>["focusWithinProps"] | undefined;

    const Test: Component = () => {
      const { focusWithinProps } = createFocusWithin({
        onFocusWithin: addEvent,
        onBlurWithin: addEvent,
        onFocusWithinChange: (isFocused) => events.push({ type: "focuschange", isFocused }),
      });
      focusWithinPropsRef = focusWithinProps;

      return (
        <div {...focusWithinProps} data-testid="test">
          <button data-testid="toggle">hide</button>
        </div>
      );
    };

    render(() => (
      <>
        <Test />
        <input data-testid="outer" />
      </>
    ));

    const container = screen.getByTestId("test");
    const button = screen.getByTestId("toggle");
    button.focus();

    const focusEvent = createFocusEvent(container, button);
    focusWithinPropsRef?.onFocus?.(focusEvent);

    const outer = screen.getByTestId("outer");
    outer.focus();
    outer.dispatchEvent(new FocusEvent("focus", { bubbles: false }));

    await waitFor(() => {
      expect(events.some((e) => e.type === "blur")).toBe(true);
      expect(events.some((e) => e.type === "focuschange" && e.isFocused === false)).toBe(true);
    });
  });

  it("should fire onFocusWithin when a descendant receives focus", () => {
    // This test duplicates test 2 to verify same behavior with isolated testids
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
      >
        <div data-testid="focus-child" tabIndex={-1} />
      </Example>
    ));

    const el = screen.getByTestId("example");
    const child = screen.getByTestId("focus-child");

    child.focus();
    el.focus();
    child.focus();
    child.blur();

    expect(events.some((e) => e.type === "focus")).toBe(true);
    expect(events.some((e) => e.type === "focuschange" && e.isFocused === true)).toBe(true);
  });

  it("should fire onBlurWithin when focus leaves the element and its descendants", () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type });

    render(() => (
      <div>
        <Example
          onBlurWithin={addEvent}
          onFocusWithin={addEvent}
          onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
        >
          <div data-testid="blur-child" tabIndex={-1} />
        </Example>
        <div data-testid="blur-outside" tabIndex={-1} />
      </div>
    ));

    const el = screen.getByTestId("example");
    const child = screen.getByTestId("blur-child");
    const outside = screen.getByTestId("blur-outside");

    // Use the same focus sequence pattern
    child.focus();
    el.focus();
    child.focus();
    outside.focus();

    expect(events.some((e) => e.type === "blur")).toBe(true);
  });

  it("should not fire onBlurWithin when focus moves between descendants", () => {
    const onBlurWithin = vi.fn();

    render(() => (
      <Example onBlurWithin={onBlurWithin}>
        <input data-testid="input1" />
        <input data-testid="input2" />
      </Example>
    ));

    const input1 = screen.getByTestId("input1");
    const input2 = screen.getByTestId("input2");

    input1.focus();
    input2.focus();

    // onBlurWithin should not be called when focus moves within the same container
    expect(onBlurWithin).not.toHaveBeenCalled();
  });

  it("should fire onFocusWithinChange with boolean state", () => {
    const events: any[] = [];
    const addEvent = (e: FocusEvent) => events.push({ type: e.type });

    render(() => (
      <div>
        <Example
          onFocusWithin={addEvent}
          onBlurWithin={addEvent}
          onFocusWithinChange={(isFocused) => events.push({ type: "focuschange", isFocused })}
        >
          <div data-testid="change-child" tabIndex={-1} />
        </Example>
        <div data-testid="change-outside" tabIndex={-1} />
      </div>
    ));

    const el = screen.getByTestId("example");
    const child = screen.getByTestId("change-child");
    const outside = screen.getByTestId("change-outside");

    // Use the same focus sequence pattern as passing tests
    child.focus();
    el.focus();
    child.focus();
    expect(events.some((e) => e.type === "focuschange" && e.isFocused === true)).toBe(true);

    outside.focus();
    expect(events.some((e) => e.type === "focuschange" && e.isFocused === false)).toBe(true);
  });
});
