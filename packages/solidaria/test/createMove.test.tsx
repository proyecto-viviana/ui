/**
 * createMove tests - Port of React Aria's useMove.test.js
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createMove } from "../src/interactions/createMove";
import type { Component } from "solid-js";

const EXAMPLE_ELEMENT_TESTID = "example";

interface ExampleProps {
  onMoveStart?: (e: any) => void;
  onMove?: (e: any) => void;
  onMoveEnd?: (e: any) => void;
  children?: any;
}

const Example: Component<ExampleProps> = (props) => {
  const { moveProps } = createMove({
    onMoveStart: props.onMoveStart,
    onMove: props.onMove,
    onMoveEnd: props.onMoveEnd,
  });

  return (
    <div tabIndex={-1} {...moveProps} data-testid={EXAMPLE_ELEMENT_TESTID}>
      {props.children}
    </div>
  );
};

describe("createMove", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    cleanup();
  });

  const defaultModifiers = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  };

  describe("mouse events", () => {
    it("responds to mouse events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      // In our jsdom environment we have PointerEvent, so simulate mouse via pointer events.
      fireEvent.pointerDown(el, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 1,
        pageY: 30,
      });
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(window, { pointerType: "mouse", pointerId: 1, pageX: 10, pageY: 25 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "mouse", ...defaultModifiers },
        { type: "move", pointerType: "mouse", deltaX: 9, deltaY: -5, ...defaultModifiers },
      ]);
      fireEvent.pointerUp(window, { pointerType: "mouse", pointerId: 1 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "mouse", ...defaultModifiers },
        { type: "move", pointerType: "mouse", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "mouse", ...defaultModifiers },
      ]);
    });

    it("does not respond to right click", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {
        pointerType: "mouse",
        pointerId: 1,
        button: 2,
        pageX: 1,
        pageY: 30,
      });
      fireEvent.pointerMove(window, {
        pointerType: "mouse",
        pointerId: 1,
        button: 2,
        pageX: 10,
        pageY: 25,
      });
      fireEvent.pointerUp(window, {
        pointerType: "mouse",
        pointerId: 1,
        button: 2,
        pageX: 10,
        pageY: 25,
      });
      expect(events).toStrictEqual([]);
    });

    it("does not fire anything when clicking", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 1,
        pageY: 30,
      });
      fireEvent.pointerUp(window, { pointerType: "mouse", pointerId: 1, pageX: 1, pageY: 30 });
      expect(events).toStrictEqual([]);
    });
  });

  describe("touch events", () => {
    let originalPointerEvent: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalPointerEvent = Object.getOwnPropertyDescriptor(window, "PointerEvent");
      Object.defineProperty(window, "PointerEvent", { value: undefined, configurable: true });
    });

    afterEach(() => {
      if (originalPointerEvent) {
        Object.defineProperty(window, "PointerEvent", originalPointerEvent);
      } else {
        // @ts-expect-error - cleanup
        delete (window as any).PointerEvent;
      }
    });

    it("responds to touch events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "touch", ...defaultModifiers },
        { type: "move", pointerType: "touch", deltaX: 9, deltaY: -5, ...defaultModifiers },
      ]);
      fireEvent.touchEnd(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "touch", ...defaultModifiers },
        { type: "move", pointerType: "touch", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "touch", ...defaultModifiers },
      ]);
    });

    it("ends with touchcancel", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      fireEvent.touchMove(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      fireEvent.touchCancel(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });

      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "touch", ...defaultModifiers },
        { type: "move", pointerType: "touch", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "touch", ...defaultModifiers },
      ]);
    });

    it("does not fire anything when tapping", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      fireEvent.touchEnd(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      expect(events).toStrictEqual([]);
    });

    it("ignores additional touches", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      fireEvent.touchStart(el, { changedTouches: [{ identifier: 2, pageX: 1, pageY: 30 }] });
      fireEvent.touchMove(el, { changedTouches: [{ identifier: 2, pageX: 10, pageY: 40 }] });
      fireEvent.touchEnd(el, { changedTouches: [{ identifier: 2, pageX: 10, pageY: 40 }] });
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "touch", ...defaultModifiers },
        { type: "move", pointerType: "touch", deltaX: 9, deltaY: -5, ...defaultModifiers },
      ]);
      fireEvent.touchEnd(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "touch", ...defaultModifiers },
        { type: "move", pointerType: "touch", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "touch", ...defaultModifiers },
      ]);
    });
  });

  describe("user-select: none", () => {
    const mockUserSelect = "text";
    const oldUserSelect = document.documentElement.style.webkitUserSelect;
    let platformGetter: ReturnType<typeof vi.spyOn> | undefined;

    beforeAll(() => {
      platformGetter = vi.spyOn(window.navigator, "platform", "get");
    });

    afterEach(() => {
      platformGetter?.mockReset();
      document.documentElement.style.webkitUserSelect = oldUserSelect;
    });

    it("adds and removes user-select: none to the body (iOS)", () => {
      platformGetter?.mockReturnValue("iPhone");
      document.documentElement.style.webkitUserSelect = mockUserSelect;

      render(() => <Example onMoveStart={() => {}} onMove={() => {}} onMoveEnd={() => {}} />);
      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe("none");
      fireEvent.touchMove(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe("none");
      fireEvent.touchEnd(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe("none");
      vi.advanceTimersByTime(316);
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });

    it("does not add user-select: none to the body (non-iOS)", () => {
      platformGetter?.mockReturnValue("Android");
      document.documentElement.style.webkitUserSelect = mockUserSelect;

      render(() => <Example onMoveStart={() => {}} onMove={() => {}} onMoveEnd={() => {}} />);
      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchMove(window, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchEnd(window, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });
  });

  it("does not bubble to createMove on parent elements", () => {
    const eventsChild: any[] = [];
    const eventsParent: any[] = [];
    const addEventChild = (e: any) => eventsChild.push(e);
    const addEventParent = (e: any) => eventsParent.push(e);

    render(() => (
      <Example onMoveStart={addEventParent} onMove={addEventParent} onMoveEnd={addEventParent}>
        <Example onMoveStart={addEventChild} onMove={addEventChild} onMoveEnd={addEventChild} />
      </Example>
    ));

    const [, el] = screen.getAllByTestId(EXAMPLE_ELEMENT_TESTID);

    fireEvent.touchStart(el, { changedTouches: [{ identifier: 1, pageX: 1, pageY: 30 }] });
    fireEvent.touchMove(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ identifier: 1, pageX: 10, pageY: 25 }] });

    expect(eventsChild.map((event) => event.type)).toEqual(["movestart", "move", "moveend"]);
    expect(eventsParent).toStrictEqual([]);
  });

  describe("keypresses", () => {
    it.each`
      key             | result
      ${"ArrowUp"}    | ${{ deltaX: 0, deltaY: -1 }}
      ${"ArrowDown"}  | ${{ deltaX: 0, deltaY: 1 }}
      ${"ArrowLeft"}  | ${{ deltaX: -1, deltaY: 0 }}
      ${"ArrowRight"} | ${{ deltaX: 1, deltaY: 0 }}
    `("responds to keypresses: $key", ({ key, result }) => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);
      fireEvent.keyDown(el, { key });

      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "keyboard", ...defaultModifiers },
        { type: "move", pointerType: "keyboard", ...defaultModifiers, ...result },
        { type: "moveend", pointerType: "keyboard", ...defaultModifiers },
      ]);
    });

    it("allows handling other key events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => (
        <div onKeyDown={(e) => addEvent({ type: e.type, key: e.key })}>
          <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />
        </div>
      ));

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);
      fireEvent.keyDown(el, { key: "PageUp" });

      expect(events).toStrictEqual([{ type: "keydown", key: "PageUp" }]);
    });
  });

  describe("pointer events", () => {
    it("responds to pointer events", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, { pointerType: "pen", pointerId: 1, pageX: 1, pageY: 30 });
      fireEvent.pointerMove(window, { pointerType: "pen", pointerId: 1, pageX: 10, pageY: 25 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "pen", ...defaultModifiers },
        { type: "move", pointerType: "pen", deltaX: 9, deltaY: -5, ...defaultModifiers },
      ]);
      fireEvent.pointerUp(window, { pointerType: "pen", pointerId: 1 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "pen", ...defaultModifiers },
        { type: "move", pointerType: "pen", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "pen", ...defaultModifiers },
      ]);
    });

    it("does not respond to right click", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {
        pointerType: "pen",
        pointerId: 1,
        pageX: 1,
        pageY: 30,
        button: 2,
      });
      fireEvent.pointerMove(window, {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
        button: 2,
      });
      fireEvent.pointerUp(window, {
        pointerType: "pen",
        pointerId: 1,
        pageX: 10,
        pageY: 25,
        button: 2,
      });

      expect(events).toStrictEqual([]);
    });

    it("ends with pointercancel", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, { pointerType: "pen", pointerId: 1, pageX: 1, pageY: 30 });
      fireEvent.pointerMove(window, { pointerType: "pen", pointerId: 1, pageX: 10, pageY: 25 });
      fireEvent.pointerCancel(window, { pointerType: "pen", pointerId: 1 });

      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "pen", ...defaultModifiers },
        { type: "move", pointerType: "pen", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "pen", ...defaultModifiers },
      ]);
    });

    it("does not fire anything when tapping", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, { pointerType: "pen", pointerId: 1, pageX: 1, pageY: 30 });
      fireEvent.pointerUp(window, { pointerType: "pen", pointerId: 1, pageX: 1, pageY: 30 });
      expect(events).toStrictEqual([]);
    });

    it("ignores any additional pointers", () => {
      const events: any[] = [];
      const addEvent = (e: any) => events.push(e);
      render(() => <Example onMoveStart={addEvent} onMove={addEvent} onMoveEnd={addEvent} />);

      const el = screen.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, { pointerType: "pen", pointerId: 1, pageX: 1, pageY: 30 });
      fireEvent.pointerDown(el, { pointerType: "pen", pointerId: 2, pageX: 1, pageY: 30 });
      fireEvent.pointerMove(window, { pointerType: "pen", pointerId: 2, pageX: 10, pageY: 40 });
      fireEvent.pointerUp(window, { pointerType: "pen", pointerId: 2, pageX: 10, pageY: 40 });
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(window, { pointerType: "pen", pointerId: 1, pageX: 10, pageY: 25 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "pen", ...defaultModifiers },
        { type: "move", pointerType: "pen", deltaX: 9, deltaY: -5, ...defaultModifiers },
      ]);
      fireEvent.pointerUp(window, { pointerType: "pen", pointerId: 1, pageX: 10, pageY: 25 });
      expect(events).toStrictEqual([
        { type: "movestart", pointerType: "pen", ...defaultModifiers },
        { type: "move", pointerType: "pen", deltaX: 9, deltaY: -5, ...defaultModifiers },
        { type: "moveend", pointerType: "pen", ...defaultModifiers },
      ]);
    });
  });
});
