/**
 * Tests for createScrollIntoViewOnFocus.
 *
 * Mirrors the focused-key scroll behavior of @react-aria/selection's
 * useSelectableCollection for activedescendant collections: when the focused key
 * changes via keyboard navigation, the focused item is scrolled into the
 * viewport; pointer-driven changes and background (inactive) collections are not.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createSignal, type Accessor } from "solid-js";
import { createScrollIntoViewOnFocus } from "../src/selection/createScrollIntoViewOnFocus";
import { setInteractionModality } from "../src/interactions/createInteractionModality";

// Flush the hook's queueMicrotask deferral (FIFO after the effect schedules it).
const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function TestCollection(props: {
  focusedKey: Accessor<string | null>;
  isActive?: Accessor<boolean>;
}) {
  let root: HTMLUListElement | undefined;
  createScrollIntoViewOnFocus({
    focusedKey: () => props.focusedKey(),
    isActive: props.isActive ? () => props.isActive!() : undefined,
    ref: () => root,
  });
  return (
    <ul ref={root} role="listbox">
      <li data-key="a" role="option">
        A
      </li>
      <li data-key="b" role="option">
        B
      </li>
      <li data-key="c" role="option">
        C
      </li>
    </ul>
  );
}

// Give each option its own scrollIntoView mock so calls don't cross-talk through
// the shared prototype (jsdom items inherit a single scrollIntoView otherwise).
function mockScroll(element: HTMLElement): ReturnType<typeof vi.fn> {
  const fn = vi.fn();
  element.scrollIntoView = fn;
  return fn;
}

describe("createScrollIntoViewOnFocus", () => {
  beforeEach(() => {
    // jsdom doesn't implement scrollIntoView; provide a prototype default so
    // scrollIntoViewport has a method to call on the (unmocked) container.
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    setInteractionModality("keyboard");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("scrolls the focused option into view on keyboard navigation", async () => {
    const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
    render(() => <TestCollection focusedKey={focusedKey} isActive={() => true} />);

    const scrollB = mockScroll(screen.getByText("B"));

    setInteractionModality("keyboard");
    setFocusedKey("b");
    await flushMicrotasks();

    expect(scrollB).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("does not scroll for pointer-driven focus changes", async () => {
    const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
    render(() => <TestCollection focusedKey={focusedKey} isActive={() => true} />);

    const scrollB = mockScroll(screen.getByText("B"));

    setInteractionModality("pointer");
    setFocusedKey("b");
    await flushMicrotasks();

    expect(scrollB).not.toHaveBeenCalled();
  });

  it("does not scroll while the collection is inactive", async () => {
    const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
    render(() => <TestCollection focusedKey={focusedKey} isActive={() => false} />);

    const scrollB = mockScroll(screen.getByText("B"));

    setInteractionModality("keyboard");
    setFocusedKey("b");
    await flushMicrotasks();

    expect(scrollB).not.toHaveBeenCalled();
  });

  it("scrolls only the newly focused option as navigation continues", async () => {
    const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
    render(() => <TestCollection focusedKey={focusedKey} isActive={() => true} />);

    const scrollB = mockScroll(screen.getByText("B"));
    const scrollC = mockScroll(screen.getByText("C"));

    setFocusedKey("b");
    await flushMicrotasks();
    expect(scrollB).toHaveBeenCalledTimes(1);
    expect(scrollC).not.toHaveBeenCalled();

    setFocusedKey("c");
    await flushMicrotasks();
    expect(scrollB).toHaveBeenCalledTimes(1);
    expect(scrollC).toHaveBeenCalledTimes(1);
  });

  it("no-ops when the focused key has no matching element", async () => {
    const [focusedKey, setFocusedKey] = createSignal<string | null>(null);
    render(() => <TestCollection focusedKey={focusedKey} isActive={() => true} />);

    // A key with no rendered item (e.g. a virtualizer slice that hasn't
    // committed it yet) must not throw.
    setFocusedKey("missing");
    await expect(flushMicrotasks()).resolves.toBeUndefined();
  });
});
