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
import { createSignal, flush } from "solid-js";

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
  flush();
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
  flush();
}

function triggerMouseEnter(hoverProps: HoverProps, element: Element) {
  hoverProps.onMouseEnter?.({
    currentTarget: element,
    target: element,
  } as MouseEvent);
  flush();
}

function triggerMouseLeave(hoverProps: HoverProps, element: Element) {
  hoverProps.onMouseLeave?.({
    currentTarget: element,
    target: element,
  } as MouseEvent);
  flush();
}

function triggerTouchStart(hoverProps: HoverProps, element: Element) {
  (hoverProps as unknown as { onTouchStart?: (event: TouchEvent) => void }).onTouchStart?.({
    currentTarget: element,
    target: element,
  } as TouchEvent);
  flush();
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
  // POINTER EVENTS
  // ============================================

  describe("pointer events", () => {
    beforeEach(() => {
      enablePointerEventsMock();
    });

    afterEach(() => {
      cleanup();
      restorePointerEvents();
    });

    it("ignores native hover while disabled and works after enabling", () => {
      const events: Array<HoverEvent | boolean> = [];
      const [isDisabled, setIsDisabled] = createSignal(true);
      render(() => (
        <Example
          isDisabled={isDisabled()}
          onHoverStart={(event) => events.push(event)}
          onHoverEnd={(event) => events.push(event)}
          onHoverChange={(hovered) => events.push(hovered)}
        />
      ));
      const el = screen.getByTestId("test-element");
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" }));
      expect(events).toEqual([]);
      expect(el.textContent).toBe("test");

      setIsDisabled(false);
      flush();
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      expect(el.textContent).toBe("test-hovered");
      el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" }));
      expect(events).toEqual([
        { type: "hoverstart", target: el, pointerType: "mouse" },
        true,
        { type: "hoverend", target: el, pointerType: "mouse" },
        false,
      ]);
      expect(el.textContent).toBe("test");
    });

    it("ends once when disabled inside native hover start and can restart", () => {
      const events: Array<HoverEvent | boolean> = [];
      const [isDisabled, setIsDisabled] = createSignal(false);
      let disableOnStart = true;
      render(() => (
        <Example
          isDisabled={isDisabled()}
          onHoverStart={(event) => {
            events.push(event);
            if (disableOnStart) setIsDisabled(true);
          }}
          onHoverEnd={(event) => events.push(event)}
          onHoverChange={(hovered) => events.push(hovered)}
        />
      ));
      const el = screen.getByTestId("test-element");
      const cycle = [
        { type: "hoverstart", target: el, pointerType: "mouse" },
        true,
        { type: "hoverend", target: el, pointerType: "mouse" },
        false,
      ];
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      expect(events).toEqual(cycle);
      expect(el.textContent).toBe("test");
      el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" }));
      document.body.dispatchEvent(
        new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }),
      );
      expect(events).toEqual(cycle);

      disableOnStart = false;
      setIsDisabled(false);
      flush();
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      expect(el.textContent).toBe("test-hovered");
      el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse" }));
      expect(events).toEqual([...cycle, ...cycle]);
      expect(el.textContent).toBe("test");
    });

    it("keeps native hover active while moving between children", () => {
      const events: Array<HoverEvent | boolean> = [];
      const Test = () => {
        const { hoverProps, isHovered } = createHover({
          onHoverStart: (event) => events.push(event),
          onHoverEnd: (event) => events.push(event),
          onHoverChange: (hovered) => events.push(hovered),
        });
        return (
          <div {...hoverProps} data-testid="owner" data-hovered={isHovered() ? "true" : "false"}>
            <span data-testid="first">first</span>
            <span data-testid="second">second</span>
          </div>
        );
      };
      render(() => <Test />);
      const owner = screen.getByTestId("owner");
      const first = screen.getByTestId("first");
      const second = screen.getByTestId("second");
      first.dispatchEvent(
        new PointerEvent("pointerover", {
          bubbles: true,
          pointerType: "mouse",
          relatedTarget: document.body,
        }),
      );
      const start = [{ type: "hoverstart", target: owner, pointerType: "mouse" }, true];
      expect(events).toEqual(start);
      first.dispatchEvent(
        new PointerEvent("pointerout", {
          bubbles: true,
          pointerType: "mouse",
          relatedTarget: second,
        }),
      );
      expect(events).toEqual(start);
      expect(owner).toHaveAttribute("data-hovered", "true");
      second.dispatchEvent(
        new PointerEvent("pointerover", {
          bubbles: true,
          pointerType: "mouse",
          relatedTarget: first,
        }),
      );
      expect(events).toEqual(start);
      second.dispatchEvent(
        new PointerEvent("pointerout", {
          bubbles: true,
          pointerType: "mouse",
          relatedTarget: document.body,
        }),
      );
      expect(events).toEqual([
        ...start,
        { type: "hoverend", target: owner, pointerType: "mouse" },
        false,
      ]);
      expect(owner).toHaveAttribute("data-hovered", "false");
    });

    it("removes its exact outside listener on owner disposal without terminal callbacks", () => {
      const add = vi.spyOn(document, "addEventListener");
      const remove = vi.spyOn(document, "removeEventListener");
      const events: Array<HoverEvent | boolean> = [];
      try {
        const { unmount } = render(() => (
          <Example
            onHoverStart={(event) => events.push(event)}
            onHoverEnd={(event) => events.push(event)}
            onHoverChange={(hovered) => events.push(hovered)}
          />
        ));
        const el = screen.getByTestId("test-element");
        el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        const registrations = add.mock.calls.filter(
          ([type, , options]) =>
            type === "pointerover" && typeof options === "object" && options.capture,
        );
        expect(registrations).toHaveLength(1);
        const registration = registrations[0]!;
        expect(events).toEqual([{ type: "hoverstart", target: el, pointerType: "mouse" }, true]);
        expect(remove.mock.calls).not.toContainEqual(registration);
        unmount();
        expect(el.isConnected).toBe(false);
        expect(
          remove.mock.calls.filter(
            (call) =>
              call[0] === registration[0] &&
              call[1] === registration[1] &&
              call[2] === registration[2],
          ),
        ).toHaveLength(1);
        document.body.dispatchEvent(
          new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }),
        );
        expect(events).toEqual([{ type: "hoverstart", target: el, pointerType: "mouse" }, true]);
      } finally {
        cleanup();
        add.mockRestore();
        remove.mockRestore();
      }
    });

    it("shares touch suppression until the final native hover owner is disposed", () => {
      const add = vi.spyOn(document, "addEventListener");
      const remove = vi.spyOn(document, "removeEventListener");
      const onHoverStart = vi.fn();
      try {
        const first = render(() => <Example />);
        const second = render(() => <Example onHoverStart={onHoverStart} />);
        const registrations = add.mock.calls.filter(([type]) => type === "pointerup");
        expect(registrations).toHaveLength(1);
        const registration = registrations[0]!;
        first.unmount();
        expect(remove.mock.calls).not.toContainEqual(registration);
        const el = second.container.querySelector('[data-testid="test-element"]')!;
        document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch" }));
        el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        expect(onHoverStart).not.toHaveBeenCalled();
        expect(el.textContent).toBe("test");
        vi.runAllTimers();
        el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
        expect(onHoverStart).toHaveBeenCalledExactlyOnceWith({
          type: "hoverstart",
          target: el,
          pointerType: "mouse",
        });
        expect(el.textContent).toBe("test-hovered");
        second.unmount();
        expect(
          remove.mock.calls.filter(
            (call) =>
              call[0] === registration[0] &&
              call[1] === registration[1] &&
              call[2] === registration[2],
          ),
        ).toHaveLength(1);
      } finally {
        cleanup();
        add.mockRestore();
        remove.mockRestore();
      }
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
      flush();

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

      const Test: Component = () => {
        const [show, setShow] = createSignal(true);
        const { hoverProps, isHovered } = createHover({
          onHoverStart: addEvent,
          onHoverEnd: addEvent,
          onHoverChange: (isHovering) => addEvent({ type: "hoverchange", isHovering }),
        });

        return (
          <div {...hoverProps} data-testid="test" data-hovered={isHovered() ? "true" : undefined}>
            {show() ? <button onClick={() => setShow(false)}>hide</button> : null}
          </div>
        );
      };

      render(() => <Test />);

      const el = screen.getByTestId("test");
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
      expect(el).toHaveAttribute("data-hovered", "true");

      const button = screen.getByRole("button");
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(screen.queryByRole("button")).toBeNull();

      // Pointerover on a new target should end hover
      document.body.dispatchEvent(
        new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }),
      );
      expect(el).not.toHaveAttribute("data-hovered");

      expect(events).toEqual([
        { type: "hoverstart", target: el, pointerType: "mouse" },
        { type: "hoverchange", isHovering: true },
        { type: "hoverend", target: el, pointerType: "mouse" },
        { type: "hoverchange", isHovering: false },
      ]);
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
      cleanup();
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
      flush();

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
