import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@solidjs/testing-library";
import { createSignal, createRoot, Show } from "solid-js";
import { createTooltipTriggerState, resetTooltipState } from "@proyecto-viviana/solid-stately";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { createTooltip, createTooltipTrigger } from "../src/tooltip";

describe("createTooltipTrigger", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it("should provide aria-describedby when tooltip is open", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ isOpen: true });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <div {...tooltipProps} data-testid="tooltip">
            Tooltip content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const tooltip = screen.getByTestId("tooltip");

    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  it("should not have aria-describedby when tooltip is closed", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ isOpen: false });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <div {...tooltipProps} data-testid="tooltip">
            Tooltip content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });

  it("should assign unique id to tooltip", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState();
      const { tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <div {...tooltipProps} data-testid="tooltip">
          Content
        </div>
      );
    }

    render(() => <TestComponent />);
    const tooltip = screen.getByTestId("tooltip");

    expect(tooltip.id).toBeTruthy();
    expect(tooltip.id.length).toBeGreaterThan(0);
  });

  it("should close tooltip on Escape key when open", async () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ defaultOpen: true });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);

    // Tooltip should be visible
    expect(screen.queryByTestId("tooltip")).not.toBeNull();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });

    // Tooltip should be hidden
    expect(screen.queryByTestId("tooltip")).toBeNull();
  });

  it("should respect isDisabled prop", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState();
      const { triggerProps } = createTooltipTrigger({ isDisabled: true }, state, () => ref);

      return (
        <button ref={ref} {...triggerProps} data-testid="trigger">
          Hover me
        </button>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    // Hover should not open tooltip when disabled
    fireEvent.pointerEnter(trigger);
    vi.advanceTimersByTime(2000);

    // State should still be closed (we can't check state directly, but aria-describedby should be null)
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });
});

describe("createTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it('should add role="tooltip" to the element', () => {
    function TestComponent() {
      const { tooltipProps } = createTooltip();

      return (
        <div {...tooltipProps} data-testid="tooltip">
          Tooltip content
        </div>
      );
    }

    render(() => <TestComponent />);
    const tooltip = screen.getByTestId("tooltip");

    expect(tooltip.getAttribute("role")).toBe("tooltip");
  });

  it("should keep tooltip open when hovering over it", async () => {
    function TestComponent() {
      const [isOpen, setIsOpen] = createSignal(true);
      const state = {
        isOpen,
        open: (immediate?: boolean) => setIsOpen(true),
        close: (immediate?: boolean) => setIsOpen(false),
      };
      const { tooltipProps } = createTooltip({}, state);

      return (
        <Show when={isOpen()}>
          <div {...tooltipProps} data-testid="tooltip">
            Tooltip content
          </div>
        </Show>
      );
    }

    render(() => <TestComponent />);
    const tooltip = screen.getByTestId("tooltip");

    // Hover over tooltip
    fireEvent.pointerEnter(tooltip);

    // Tooltip should remain visible
    expect(screen.queryByTestId("tooltip")).not.toBeNull();
  });

  it("should pass through aria labeling props", () => {
    function TestComponent() {
      const { tooltipProps } = createTooltip({
        "aria-label": "Custom label",
      });

      return (
        <div {...tooltipProps} data-testid="tooltip">
          Content
        </div>
      );
    }

    render(() => <TestComponent />);
    const tooltip = screen.getByTestId("tooltip");

    expect(tooltip.getAttribute("aria-label")).toBe("Custom label");
  });
});

describe("createTooltipTrigger - hover behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it("opens tooltip on hover after delay", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState();
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip" role="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    // Hover over trigger
    fireEvent.pointerEnter(trigger);

    // Tooltip should not be visible immediately
    expect(screen.queryByTestId("tooltip")).toBeNull();

    // Advance timers
    vi.advanceTimersByTime(2000);

    // Tooltip should now be visible
    expect(screen.queryByTestId("tooltip")).not.toBeNull();
  });

  it("opens tooltip immediately with delay: 0", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ delay: 0 });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip" role="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    // Hover over trigger
    fireEvent.pointerEnter(trigger);
    vi.advanceTimersByTime(0);

    // Tooltip should be visible immediately
    expect(screen.queryByTestId("tooltip")).not.toBeNull();
  });

  it("does not open tooltip from touch hover events", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ delay: 0 });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip" role="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    fireEvent(trigger, createPointerEvent("pointerenter", { pointerId: 1, pointerType: "touch" }));
    vi.advanceTimersByTime(0);

    expect(screen.queryByTestId("tooltip")).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });

  it("hides tooltip when hover leaves the trigger", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ delay: 0 });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip" role="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    // Hover over trigger
    fireEvent.pointerEnter(trigger);
    vi.advanceTimersByTime(0);

    // Tooltip should be visible
    expect(screen.queryByTestId("tooltip")).not.toBeNull();

    // Leave trigger
    fireEvent.pointerLeave(trigger);
    vi.advanceTimersByTime(500);

    // Tooltip should be hidden
    expect(screen.queryByTestId("tooltip")).toBeNull();
  });

  it("does not close tooltip on non-press keyboard keys", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ delay: 0 });
      const { triggerProps, tooltipProps } = createTooltipTrigger({}, state, () => ref);

      return (
        <>
          <button ref={ref} {...triggerProps} data-testid="trigger">
            Hover me
          </button>
          <Show when={state.isOpen()}>
            <div {...tooltipProps} data-testid="tooltip" role="tooltip">
              Tooltip content
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    fireEvent.pointerEnter(trigger);
    vi.advanceTimersByTime(0);
    expect(screen.queryByTestId("tooltip")).not.toBeNull();

    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    expect(screen.queryByTestId("tooltip")).not.toBeNull();
  });
});

describe("createTooltipTrigger - focus behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  // Note: Focus-based tooltip opening requires keyboard modality detection (focus-visible)
  // which uses module-level state that doesn't reset properly between tests in jsdom.
  // This tests the state API directly instead of relying on the modality detection.
  it("tooltip state responds to open() calls", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ delay: 0 });

      expect(state.isOpen()).toBe(false);

      // Open with immediate=true (simulates focus-visible)
      state.open(true);
      expect(state.isOpen()).toBe(true);

      dispose();
    });
  });

  it("tooltip state responds to close() calls", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ delay: 0, defaultOpen: true });

      expect(state.isOpen()).toBe(true);

      // Close immediately
      state.close(true);
      expect(state.isOpen()).toBe(false);

      dispose();
    });
  });

  it("tooltip triggerProps include focus and blur handlers", () => {
    function TestComponent() {
      let ref: HTMLButtonElement | undefined;
      const state = createTooltipTriggerState({ delay: 0 });
      const { triggerProps } = createTooltipTrigger({}, state, () => ref);

      // Check that the trigger props contain focus handlers
      expect(typeof triggerProps.onFocus).toBe("function");
      expect(typeof triggerProps.onBlur).toBe("function");

      return (
        <button ref={ref} {...triggerProps} data-testid="trigger">
          Focus me
        </button>
      );
    }

    render(() => <TestComponent />);
  });
});

describe("createTooltipTrigger - global tooltip behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it("closes other tooltips when a new one opens", () => {
    function TestComponent() {
      let ref1: HTMLButtonElement | undefined;
      let ref2: HTMLButtonElement | undefined;
      const state1 = createTooltipTriggerState({ delay: 0 });
      const state2 = createTooltipTriggerState({ delay: 0 });
      const { triggerProps: triggerProps1, tooltipProps: tooltipProps1 } = createTooltipTrigger(
        {},
        state1,
        () => ref1,
      );
      const { triggerProps: triggerProps2, tooltipProps: tooltipProps2 } = createTooltipTrigger(
        {},
        state2,
        () => ref2,
      );

      return (
        <>
          <button ref={ref1} {...triggerProps1} data-testid="trigger1">
            Trigger 1
          </button>
          <Show when={state1.isOpen()}>
            <div {...tooltipProps1} data-testid="tooltip1" role="tooltip">
              Tooltip 1
            </div>
          </Show>

          <button ref={ref2} {...triggerProps2} data-testid="trigger2">
            Trigger 2
          </button>
          <Show when={state2.isOpen()}>
            <div {...tooltipProps2} data-testid="tooltip2" role="tooltip">
              Tooltip 2
            </div>
          </Show>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger1 = screen.getByTestId("trigger1");
    const trigger2 = screen.getByTestId("trigger2");

    // Hover over trigger1
    fireEvent.pointerEnter(trigger1);
    vi.advanceTimersByTime(0);

    // Tooltip1 should be visible
    expect(screen.queryByTestId("tooltip1")).not.toBeNull();

    // Hover over trigger2
    fireEvent.pointerLeave(trigger1);
    fireEvent.pointerEnter(trigger2);
    vi.advanceTimersByTime(100);

    // Tooltip2 should be visible and tooltip1 hidden (after close delay)
    vi.advanceTimersByTime(500);
    expect(screen.queryByTestId("tooltip2")).not.toBeNull();
    expect(screen.queryByTestId("tooltip1")).toBeNull();
  });
});
