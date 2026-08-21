/**
 * @vitest-environment jsdom
 *
 * Direct regressions for the transition-aware focus scheduler.
 * Ported from react-aria/test/utils/runAfterTransition.test.ts.
 */

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { runAfterTransition } from "../src/utils/runAfterTransition";

class MockTransitionEvent extends Event {
  propertyName: string;

  constructor(type: string, init?: TransitionEventInit) {
    super(type, init);
    this.propertyName = init?.propertyName ?? "";
  }
}

describe("runAfterTransition", () => {
  const originalTransitionEvent = globalThis.TransitionEvent;
  const nodes = new Set<HTMLElement>();

  beforeAll(() => {
    Object.defineProperty(globalThis, "TransitionEvent", {
      configurable: true,
      value: MockTransitionEvent,
    });
    // The scheduler installs its listeners here when jsdom imports it while the
    // document is still loading.
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "TransitionEvent", {
      configurable: true,
      value: originalTransitionEvent,
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    for (const node of nodes) {
      node.remove();
    }
    nodes.clear();

    // Clear any transition that a failed assertion left in module state.
    runAfterTransition(() => {});
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function appendElement(): HTMLElement {
    const element = document.createElement("div");
    nodes.add(element);
    document.body.appendChild(element);
    return element;
  }

  function dispatchTransition(element: HTMLElement, type: string, propertyName: string): void {
    element.dispatchEvent(
      new TransitionEvent(type, {
        propertyName,
        bubbles: true,
      }),
    );
  }

  it("runs after the observation frame when no transition starts", () => {
    const callback = vi.fn();

    runAfterTransition(callback);

    expect(callback).not.toHaveBeenCalled();
    vi.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("waits until every transition property ends or is cancelled", () => {
    const element = appendElement();
    const callback = vi.fn();
    dispatchTransition(element, "transitionrun", "opacity");
    dispatchTransition(element, "transitionrun", "width");

    runAfterTransition(callback);
    vi.runOnlyPendingTimers();
    expect(callback).not.toHaveBeenCalled();

    dispatchTransition(element, "transitionend", "opacity");
    expect(callback).not.toHaveBeenCalled();

    dispatchTransition(element, "transitioncancel", "width");
    expect(callback).toHaveBeenCalledOnce();

    // Chrome can send both events for one property. The callback stays one-shot.
    dispatchTransition(element, "transitionend", "width");
    expect(callback).toHaveBeenCalledOnce();
  });

  it("runs multiple queued callbacks once after the transition ends", () => {
    const element = appendElement();
    const first = vi.fn();
    const second = vi.fn();
    dispatchTransition(element, "transitionrun", "width");

    runAfterTransition(first);
    runAfterTransition(second);
    vi.runOnlyPendingTimers();
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    dispatchTransition(element, "transitionend", "width");
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("does not let a detached transitioning element block the callback", () => {
    const element = appendElement();
    const callback = vi.fn();
    dispatchTransition(element, "transitionrun", "width");
    element.remove();
    nodes.delete(element);

    runAfterTransition(callback);
    vi.runOnlyPendingTimers();

    expect(callback).toHaveBeenCalledOnce();
  });

  it("runs synchronously when animation frames are unavailable", () => {
    const original = window.requestAnimationFrame;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: undefined,
    });
    const callback = vi.fn();

    try {
      runAfterTransition(callback);
      expect(callback).toHaveBeenCalledOnce();
    } finally {
      Object.defineProperty(window, "requestAnimationFrame", {
        configurable: true,
        value: original,
      });
    }
  });
});
