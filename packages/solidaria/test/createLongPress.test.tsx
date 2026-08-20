/**
 * createLongPress tests - Port of React Aria's useLongPress.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createLongPress, type LongPressEvent } from "../src/interactions/createLongPress";
import { createPress, type PressEvent } from "../src/interactions/createPress";
import { mergeProps } from "../src/utils/mergeProps";
import { Dynamic } from "solid-js/web";
import type { Component } from "solid-js";

interface ExampleProps {
  elementType?: string;
  onLongPressStart?: (e: LongPressEvent) => void;
  onLongPressEnd?: (e: LongPressEvent) => void;
  onLongPress?: (e: LongPressEvent) => void;
  threshold?: number;
  isDisabled?: boolean;
  accessibilityDescription?: string;
}

const Example: Component<ExampleProps> = (props) => {
  const { longPressProps } = createLongPress({
    isDisabled: props.isDisabled,
    onLongPressStart: props.onLongPressStart,
    onLongPressEnd: props.onLongPressEnd,
    onLongPress: props.onLongPress,
    threshold: props.threshold,
    accessibilityDescription: props.accessibilityDescription,
  });

  return (
    <Dynamic component={props.elementType ?? "div"} {...longPressProps} tabIndex={0}>
      test
    </Dynamic>
  );
};

interface ExampleWithPressProps extends ExampleProps {
  onPress?: (e: PressEvent) => void;
  onPressStart?: (e: PressEvent) => void;
  onPressEnd?: (e: PressEvent) => void;
}

const ExampleWithPress: Component<ExampleWithPressProps> = (props) => {
  const { longPressProps } = createLongPress({
    onLongPressStart: props.onLongPressStart,
    onLongPressEnd: props.onLongPressEnd,
    onLongPress: props.onLongPress,
    threshold: props.threshold,
  });
  const { pressProps } = createPress({
    onPress: props.onPress,
    onPressStart: props.onPressStart,
    onPressEnd: props.onPressEnd,
  });

  return (
    <Dynamic
      component={props.elementType ?? "div"}
      {...mergeProps(longPressProps, pressProps)}
      tabIndex={0}
    >
      test
    </Dynamic>
  );
};

describe("createLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("should perform a long press", () => {
    const events: LongPressEvent[] = [];
    const addEvent = (e: LongPressEvent) => events.push(e);
    render(() => (
      <Example onLongPressStart={addEvent} onLongPressEnd={addEvent} onLongPress={addEvent} />
    ));

    const el = screen.getByText("test");

    fireEvent.pointerDown(el, { pointerType: "touch" });
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    vi.advanceTimersByTime(400);
    expect(events).toHaveLength(1);

    vi.advanceTimersByTime(200);
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpressend",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpress",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    fireEvent.pointerUp(el, { pointerType: "touch" });
    expect(events).toHaveLength(3);
  });

  it("should cancel if pointer ends before timeout", () => {
    const events: LongPressEvent[] = [];
    const addEvent = (e: LongPressEvent) => events.push(e);
    render(() => (
      <Example onLongPressStart={addEvent} onLongPressEnd={addEvent} onLongPress={addEvent} />
    ));

    const el = screen.getByText("test");

    fireEvent.pointerDown(el, { pointerType: "touch" });
    vi.advanceTimersByTime(200);
    fireEvent.pointerUp(el, { pointerType: "touch" });

    vi.advanceTimersByTime(800);
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
      {
        type: "longpressend",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);
  });

  it("should cancel other press events", () => {
    const events: Array<LongPressEvent | PressEvent> = [];
    const addEvent = (e: LongPressEvent | PressEvent) => events.push(e);
    render(() => (
      <ExampleWithPress
        onLongPressStart={addEvent as (e: LongPressEvent) => void}
        onLongPressEnd={addEvent as (e: LongPressEvent) => void}
        onLongPress={addEvent as (e: LongPressEvent) => void}
        onPressStart={addEvent as (e: PressEvent) => void}
        onPressEnd={addEvent as (e: PressEvent) => void}
        onPress={addEvent as (e: PressEvent) => void}
      />
    ));

    const el = screen.getByText("test");

    fireEvent.pointerDown(el, { pointerType: "touch" });
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(el, { pointerType: "touch" });

    expect(events.map((event) => event.type)).toEqual([
      "longpressstart",
      "pressstart",
      "longpressend",
      "pressend",
      "longpress",
    ]);
  });

  it("should not cancel press events if pointer ends before timer", () => {
    const events: Array<LongPressEvent | PressEvent> = [];
    const addEvent = (e: LongPressEvent | PressEvent) => events.push(e);
    render(() => (
      <ExampleWithPress
        onLongPressStart={addEvent as (e: LongPressEvent) => void}
        onLongPressEnd={addEvent as (e: LongPressEvent) => void}
        onLongPress={addEvent as (e: LongPressEvent) => void}
        onPressStart={addEvent as (e: PressEvent) => void}
        onPressEnd={addEvent as (e: PressEvent) => void}
        onPress={addEvent as (e: PressEvent) => void}
      />
    ));

    const el = screen.getByText("test");

    fireEvent.pointerDown(el, { pointerType: "touch" });
    vi.advanceTimersByTime(300);
    fireEvent.pointerUp(el, { pointerType: "touch" });
    fireEvent.click(el, { detail: 1 });

    expect(events.map((event) => event.type)).toEqual([
      "longpressstart",
      "pressstart",
      "longpressend",
      "pressend",
      "press",
    ]);
  });

  it("allows changing the threshold", () => {
    const events: LongPressEvent[] = [];
    const addEvent = (e: LongPressEvent) => events.push(e);
    render(() => (
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800}
      />
    ));

    const el = screen.getByText("test");

    fireEvent.pointerDown(el, { pointerType: "touch" });
    vi.advanceTimersByTime(600);
    expect(events).toEqual([
      {
        type: "longpressstart",
        target: el,
        pointerType: "touch",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0,
      },
    ]);

    vi.advanceTimersByTime(800);
    expect(events.map((event) => event.type)).toEqual([
      "longpressstart",
      "longpressend",
      "longpress",
    ]);
  });

  it("supports accessibilityDescription", () => {
    render(() => (
      <Example accessibilityDescription="Long press to open menu" onLongPress={() => {}} />
    ));

    const el = screen.getByText("test");
    expect(el).toHaveAttribute("aria-describedby");

    const description = document.getElementById(el.getAttribute("aria-describedby")!);
    expect(description).toHaveTextContent("Long press to open menu");
  });

  it("does not show accessibilityDescription if disabled", () => {
    render(() => (
      <Example
        accessibilityDescription="Long press to open menu"
        onLongPress={() => {}}
        isDisabled
      />
    ));

    const el = screen.getByText("test");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("does not show accessibilityDescription if no onLongPress handler", () => {
    render(() => <Example accessibilityDescription="Long press to open menu" />);

    const el = screen.getByText("test");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("prevents context menu events on touch", () => {
    render(() => <Example onLongPress={() => {}} />);

    const el = screen.getByText("test");
    fireEvent.pointerDown(el, { pointerType: "touch" });
    vi.advanceTimersByTime(600);

    const performDefault = fireEvent.contextMenu(el);
    expect(performDefault).toBe(false);

    fireEvent.pointerUp(el, { pointerType: "touch" });
  });

  it("should not fire any events for keyboard interactions", () => {
    const events: LongPressEvent[] = [];
    const addEvent = (e: LongPressEvent) => events.push(e);
    render(() => (
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800}
      />
    ));

    const el = screen.getByText("test");
    fireEvent.keyDown(el, { key: " " });
    vi.advanceTimersByTime(600);
    fireEvent.keyUp(el, { key: " " });

    expect(events).toHaveLength(0);
  });
});
