/**
 * createHover tests - Port of React Aria's useHover.test.js
 *
 * Tests hover interactions for mouse and pointer events.
 * Verifies that touch events don't trigger hover (mouse-only behavior).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createHover, type HoverEvent, type HoverProps } from "../src/interactions/createHover";
import type { Component } from "solid-js";
import { createSignal } from "solid-js";

const originalPointerEvent = typeof PointerEvent !== "undefined" ? PointerEvent : undefined;

function enablePointerEventsMock() {
  class TestPointerEvent extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init as MouseEventInit);
      this.pointerType = init.pointerType ?? "mouse";
    }
  }

  (globalThis as any).PointerEvent = TestPointerEvent;
}

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

function triggerPointerOver(
  hoverProps: HoverProps,
  element: Element,
  pointerType: "mouse" | "pen" | "touch",
  eventTarget: Element = element,
) {
  hoverProps.onPointerOver?.({
    currentTarget: element,
    target: eventTarget,
    pointerType,
  } as PointerEvent);
}

function triggerPointerOut(
  hoverProps: HoverProps,
  element: Element,
  pointerType: "mouse" | "pen" | "touch",
  eventTarget: Element = element,
) {
  hoverProps.onPointerOut?.({
    currentTarget: element,
    target: eventTarget,
    pointerType,
  } as PointerEvent);
}

function triggerMouseEnter(hoverProps: HoverProps, element: Element) {
  hoverProps.onMouseEnter?.({
    currentTarget: element,
    target: element,
  } as MouseEvent);
}

function triggerMouseLeave(hoverProps: HoverProps, element: Element) {
  hoverProps.onMouseLeave?.({
    currentTarget: element,
    target: element,
  } as MouseEvent);
}

function triggerTouchStart(hoverProps: HoverProps, element: Element) {
  (hoverProps as unknown as { onTouchStart?: (event: TouchEvent) => void }).onTouchStart?.({
    currentTarget: element,
    target: element,
  } as TouchEvent);
}

// Test component that uses createHover
interface ExampleProps {
  isDisabled?: boolean;
  onHoverStart?: (e: HoverEvent) => void;
  onHoverEnd?: (e: HoverEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  exposeHoverProps?: (props: HoverProps) => void;
}

const Example: Component<ExampleProps> = (props) => {
  const { hoverProps, isHovered } = createHover(() => ({
    isDisabled: props.isDisabled,
    onHoverStart: props.onHoverStart,
    onHoverEnd: props.onHoverEnd,
    onHoverChange: props.onHoverChange,
  }));

  props.exposeHoverProps?.(hoverProps);

  return (
    <div {...hoverProps} data-testid="test-element">
      test{isHovered() && "-hovered"}
      <div data-testid="inner-target" />
    </div>
  );
};

describe("createHover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    cleanup();
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  it("does not handle hover events if disabled", () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push(e);

    let hoverPropsRef: HoverProps | undefined;
    render(() => (
      <Example
        isDisabled
        onHoverStart={addEvent}
        onHoverEnd={addEvent}
        onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
        exposeHoverProps={(props) => {
          hoverPropsRef = props;
        }}
      />
    ));

    const el = screen.getByTestId("test-element");
    triggerMouseEnter(hoverPropsRef!, el);
    triggerMouseLeave(hoverPropsRef!, el);

    expect(events).toEqual([]);
  });

  // ============================================
  // POINTER EVENTS
  // ============================================

  describe("pointer events", () => {
    beforeEach(() => {
      enablePointerEventsMock();
    });

    afterEach(() => {
      restorePointerEvents();
    });

    it("should fire hover events based on pointer events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "mouse");
      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(events).toContainEqual(
        expect.objectContaining({
          type: "hoverstart",
          pointerType: "mouse",
        }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: true });
      expect(events).toContainEqual(
        expect.objectContaining({
          type: "hoverend",
          pointerType: "mouse",
        }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: false });
    });

    it("hover event target should be the element we attached listeners to", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      const inner = screen.getByTestId("inner-target");

      // Hover over inner element - target should still be the outer element
      triggerPointerOver(hoverPropsRef!, el, "mouse", inner);
      triggerPointerOut(hoverPropsRef!, el, "mouse", inner);

      // Check that the target is the element with hoverProps, not the inner element
      const hoverStart = events.find((e) => e.type === "hoverstart");
      expect(hoverStart).toBeDefined();
      expect(hoverStart.target).toBe(el);
    });

    it("should not fire hover events when pointerType is touch", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "touch");
      triggerPointerOut(hoverPropsRef!, el, "touch");

      expect(events).toEqual([]);
    });

    it("ignores emulated mouse events following touch events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch" }));
      triggerPointerOver(hoverPropsRef!, el, "touch");
      triggerPointerOut(hoverPropsRef!, el, "touch");

      // Emulated mouse events should be ignored immediately after touch
      triggerPointerOver(hoverPropsRef!, el, "mouse");
      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(events).toEqual([]);
    });

    it("supports mouse events following touch events after a delay", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch" }));
      triggerPointerOver(hoverPropsRef!, el, "touch");
      triggerPointerOut(hoverPropsRef!, el, "touch");

      vi.advanceTimersByTime(100);

      triggerPointerOver(hoverPropsRef!, el, "mouse");
      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverstart", pointerType: "mouse" }),
      );
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
    });

    it("should visually change component with pointer events", () => {
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      expect(el.textContent).toBe("test");

      triggerPointerOver(hoverPropsRef!, el, "mouse");
      expect(el.textContent).toBe("test-hovered");

      triggerPointerOut(hoverPropsRef!, el, "mouse");
      expect(el.textContent).toBe("test");
    });

    it("should not visually change component when pointerType is touch", () => {
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      triggerPointerOver(hoverPropsRef!, el, "touch");
      expect(el.textContent).toBe("test");

      triggerPointerOut(hoverPropsRef!, el, "touch");
      expect(el.textContent).toBe("test");
    });

    it("should fire hover events for pen pointerType", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "pen");
      triggerPointerOut(hoverPropsRef!, el, "pen");

      expect(events).toContainEqual(
        expect.objectContaining({
          type: "hoverstart",
          pointerType: "pen",
        }),
      );
      expect(events).toContainEqual(
        expect.objectContaining({
          type: "hoverend",
          pointerType: "pen",
        }),
      );
    });

    it("should end hover when disabled", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;
      const [isDisabled, setIsDisabled] = createSignal(false);

      const Test: Component = () => (
        <Example
          isDisabled={isDisabled()}
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      );

      render(() => <Test />);

      let el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "mouse");
      expect(el.textContent).toBe("test-hovered");

      events.length = 0;
      setIsDisabled(true);

      el = screen.getByTestId("test-element");
      expect(el.textContent).toBe("test");
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: false });
    });

    it("should trigger onHoverEnd after an element is removed", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      const Test: Component = () => {
        const [show, setShow] = createSignal(true);
        const { hoverProps, isHovered } = createHover({
          onHoverStart: addEvent,
          onHoverEnd: addEvent,
          onHoverChange: (isHovering) => addEvent({ type: "hoverchange", isHovering }),
        });
        hoverPropsRef = hoverProps;

        return (
          <div {...hoverProps} data-testid="test" data-hovered={isHovered() || undefined}>
            {show() ? <button onClick={() => setShow(false)}>hide</button> : null}
          </div>
        );
      };

      render(() => <Test />);

      const el = screen.getByTestId("test");
      triggerPointerOver(hoverPropsRef!, el, "mouse");
      expect(el).toHaveAttribute("data-hovered", "true");

      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.queryByRole("button")).toBeNull();

      // Pointerover on a new target should end hover
      fireEvent.pointerOver(document.body, { pointerType: "mouse" });
      expect(el).not.toHaveAttribute("data-hovered");

      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: false });
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

    it("should fire hover events based on mouse events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerMouseEnter(hoverPropsRef!, el);
      triggerMouseLeave(hoverPropsRef!, el);
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverstart", pointerType: "mouse" }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: true });
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: false });
    });

    it("should visually change component with mouse events", () => {
      let hoverPropsRef: HoverProps | undefined;
      render(() => (
        <Example
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      triggerMouseEnter(hoverPropsRef!, el);
      expect(el.textContent).toBe("test-hovered");

      triggerMouseLeave(hoverPropsRef!, el);
      expect(el.textContent).toBe("test");
    });

    it("ignores emulated mouse events following touch events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerTouchStart(hoverPropsRef!, el);
      document.dispatchEvent(new Event("touchend"));

      // Emulated mouse events after touch should be ignored
      triggerMouseEnter(hoverPropsRef!, el);
      triggerMouseLeave(hoverPropsRef!, el);

      expect(events).toEqual([]);
    });

    it("supports mouse events following touch events after a delay", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerTouchStart(hoverPropsRef!, el);
      document.dispatchEvent(new Event("touchend"));
      triggerMouseEnter(hoverPropsRef!, el);
      triggerMouseLeave(hoverPropsRef!, el);

      vi.advanceTimersByTime(100);

      triggerMouseEnter(hoverPropsRef!, el);
      triggerMouseLeave(hoverPropsRef!, el);

      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverstart", pointerType: "mouse" }),
      );
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
    });

    it("should end hover when disabled", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      let hoverPropsRef: HoverProps | undefined;
      const [isDisabled, setIsDisabled] = createSignal(false);

      const Test: Component = () => (
        <Example
          isDisabled={isDisabled()}
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      );

      render(() => <Test />);

      let el = screen.getByTestId("test-element");
      triggerMouseEnter(hoverPropsRef!, el);
      expect(el.textContent).toBe("test-hovered");

      events.length = 0;
      setIsDisabled(true);

      el = screen.getByTestId("test-element");
      expect(el.textContent).toBe("test");
      expect(events).toContainEqual(
        expect.objectContaining({ type: "hoverend", pointerType: "mouse" }),
      );
      expect(events).toContainEqual({ type: "hoverchange", isHovering: false });
    });
  });

  // ============================================
  // TOUCH EVENTS
  // ============================================

  describe("touch events", () => {
    it("should not fire hover events based on touch events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);

      render(() => (
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={(isHovering) => addEvent({ type: "hoverchange", isHovering })}
        />
      ));

      const el = screen.getByTestId("test-element");
      fireEvent.touchStart(el);
      fireEvent.touchMove(el);
      fireEvent.touchEnd(el);

      expect(events).toEqual([]);
    });

    it("should not visually change component with touch events", () => {
      render(() => <Example />);

      const el = screen.getByTestId("test-element");

      fireEvent.touchStart(el);
      expect(el.textContent).toBe("test");

      fireEvent.touchMove(el);
      expect(el.textContent).toBe("test");

      fireEvent.touchEnd(el);
      expect(el.textContent).toBe("test");
    });
  });

  // ============================================
  // HOVER STATE TRACKING
  // ============================================

  describe("hover state", () => {
    it("should track isHovered state", () => {
      let hoverPropsRef: HoverProps | undefined;
      render(() => (
        <Example
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      expect(el.textContent).not.toContain("-hovered");

      triggerPointerOver(hoverPropsRef!, el, "mouse");
      expect(el.textContent).toContain("-hovered");

      triggerPointerOut(hoverPropsRef!, el, "mouse");
      expect(el.textContent).not.toContain("-hovered");
    });

    it("should not double-fire hoverstart if already hovered", () => {
      const onHoverStart = vi.fn();
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={onHoverStart}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      triggerPointerOver(hoverPropsRef!, el, "mouse");
      triggerPointerOver(hoverPropsRef!, el, "mouse");

      expect(onHoverStart).toHaveBeenCalledTimes(1);
    });

    it("should not fire hoverend if not hovered", () => {
      const onHoverEnd = vi.fn();
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverEnd={onHoverEnd}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");

      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(onHoverEnd).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // EVENT CALLBACKS
  // ============================================

  describe("event callbacks", () => {
    it("should call onHoverStart when hover starts", () => {
      const onHoverStart = vi.fn();
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverStart={onHoverStart}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "mouse");

      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverStart).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "hoverstart",
          pointerType: "mouse",
          target: el,
        }),
      );
    });

    it("should call onHoverEnd when hover ends", () => {
      const onHoverEnd = vi.fn();
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverEnd={onHoverEnd}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "mouse");
      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "hoverend",
          pointerType: "mouse",
          target: el,
        }),
      );
    });

    it("should call onHoverChange with boolean state", () => {
      const onHoverChange = vi.fn();
      let hoverPropsRef: HoverProps | undefined;

      render(() => (
        <Example
          onHoverChange={onHoverChange}
          exposeHoverProps={(props) => {
            hoverPropsRef = props;
          }}
        />
      ));

      const el = screen.getByTestId("test-element");
      triggerPointerOver(hoverPropsRef!, el, "mouse");

      expect(onHoverChange).toHaveBeenCalledWith(true);

      triggerPointerOut(hoverPropsRef!, el, "mouse");

      expect(onHoverChange).toHaveBeenCalledWith(false);
    });
  });
});
