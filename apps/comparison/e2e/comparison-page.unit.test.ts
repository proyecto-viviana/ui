import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { Locator } from "@playwright/test";
import { scrollLocatorIntoView } from "./comparison-page";

/**
 * `scrollLocatorIntoView` must not hand the page back while the `scroll` event
 * its own `scrollIntoView` queued is still undelivered.
 *
 * Chromium dispatches that event at the next rendering update, not in the task
 * that called `scrollIntoView`. Upstream React Aria closes any overlay whose
 * trigger sits inside the scrolled tree (`useCloseOnScroll`, mirrored by the
 * port), so the next helper can open an overlay INTO that queued event: the
 * overlay opens, registers its scroll listener, and the stale event closes it
 * again. That is the certified tooltip flake of #608, and in a browser it is a
 * race with a ~20 ms margin — untestable as an ordering. The contract that
 * removes the race is testable here: the helper waits for the event.
 *
 * The stub is the whole browser this needs: an element whose `scrollIntoView`
 * moves a scroll offset and leaves one `scroll` event queued, a window that
 * collects the capture listener, and a `renderingUpdate()` that delivers it.
 */

interface ScrollStub {
  locator: Locator;
  renderingUpdate: () => void;
  waitCount: () => number;
}

function createScrollStub({ scrolls }: { scrolls: boolean }): ScrollStub {
  const scrollListeners: Array<() => void> = [];
  let pendingScroll = false;
  let waits = 0;

  const fakeWindow: Record<string, unknown> = {
    scrollX: 0,
    scrollY: 0,
    addEventListener(type: string, listener: () => void) {
      if (type === "scroll") {
        scrollListeners.push(listener);
      }
    },
  };

  const element = {
    scrollTop: 0,
    scrollLeft: 0,
    parentElement: null,
    scrollIntoView() {
      if (!scrolls) {
        return;
      }
      fakeWindow.scrollY = 240;
      pendingScroll = true;
    },
  };

  const withFakeWindow = <T>(run: () => T): T => {
    const globals = globalThis as { window?: unknown };
    const previous = globals.window;
    globals.window = fakeWindow;
    try {
      return run();
    } finally {
      globals.window = previous;
    }
  };

  const page = {
    evaluate: async (fn: (arg?: unknown) => unknown, arg?: unknown) =>
      withFakeWindow(() => fn(arg)),
    waitForTimeout: async () => {
      waits += 1;
      await new Promise((resolve) => setTimeout(resolve, 1));
    },
  };

  const locator = {
    evaluate: async (fn: (el: unknown, arg?: unknown) => unknown, arg?: unknown) =>
      withFakeWindow(() => fn(element, arg)),
    page: () => page,
  };

  return {
    locator: locator as unknown as Locator,
    renderingUpdate() {
      if (!pendingScroll) {
        return;
      }
      pendingScroll = false;
      withFakeWindow(() => {
        for (const listener of scrollListeners) {
          listener();
        }
      });
    },
    waitCount: () => waits,
  };
}

const realTime = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("scrollLocatorIntoView", () => {
  it("does not return while the scroll event it queued is undelivered", async () => {
    const stub = createScrollStub({ scrolls: true });
    let returned = false;
    const call = scrollLocatorIntoView(stub.locator, "center").then(() => {
      returned = true;
    });

    await realTime(20);
    assert.equal(
      returned,
      false,
      "returned with its `scroll` event still queued: an overlay opened next would be closed by it",
    );

    stub.renderingUpdate();
    await call;
    assert.equal(returned, true, "must return once the queued scroll event is delivered");
  });

  it("returns without waiting when nothing scrolled", async () => {
    const stub = createScrollStub({ scrolls: false });
    await scrollLocatorIntoView(stub.locator, "center");
    assert.equal(stub.waitCount(), 0, "an element already in view must cost no wait");
  });

  it("gives up at its budget instead of deadlocking when no rendering update comes", async () => {
    const stub = createScrollStub({ scrolls: true });
    const startedAt = Date.now();
    await scrollLocatorIntoView(stub.locator, "center");
    assert.ok(stub.waitCount() > 0, "must have polled for the event");
    assert.ok(
      Date.now() - startedAt < 5_000,
      "a machine that never issues a rendering update must proceed, not hang",
    );
  });
});
