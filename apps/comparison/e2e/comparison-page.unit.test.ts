import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { Locator, Page } from "@playwright/test";
import { scrollLocatorIntoView, scrollWindowTo } from "./comparison-page";
import { performStep } from "./drivers/journeys-steps";
import type { PanelContext } from "./drivers/scenario";

/**
 * No harness scroll may hand the page back while the `scroll` event it queued
 * is still undelivered — not `scrollLocatorIntoView`, and not the D13
 * `scrollPage` step, which scrolls the document.
 *
 * Chromium dispatches that event at the next rendering update, not in the task
 * that scrolled. Upstream React Aria closes any overlay whose trigger sits
 * inside the scrolled tree (`useCloseOnScroll`, mirrored by the port), so the
 * next step can open an overlay INTO that queued event: the overlay opens,
 * registers its scroll listener, and the stale event closes it again. That is
 * the certified tooltip flake of #608, and in a browser it is a race with a
 * ~20 ms margin — untestable as an ordering. The contract that removes the race
 * is testable here: the primitive waits for the event.
 *
 * The stub is the whole browser this needs: an element whose `scrollIntoView`
 * (or a `window.scrollTo`) moves a scroll offset and leaves one `scroll` event
 * queued, a window that collects the capture listener, and a
 * `renderingUpdate()` that delivers it. It can move the window offset or an
 * ancestor's, because which one moved is what decides whether the helper waits
 * at all.
 */

interface ScrollStub {
  locator: Locator;
  page: Page;
  renderingUpdate: () => void;
  waitCount: () => number;
  windowScrollY: () => number;
}

/**
 * `scroller` says what the scroll moves. `window` is the page scroller;
 * `ancestor` is the shape #608 actually walked into — the canvas scrolls
 * inside `<main>`, so an ANCESTOR offset moves and the window never does. A
 * detector that only reads `window.scrollY` sees nothing there and returns
 * without waiting, which is the whole defect.
 */
function createScrollStub({
  scrolls,
  scroller = "window",
}: {
  scrolls: boolean;
  scroller?: "window" | "ancestor";
}): ScrollStub {
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
    scrollTo(_x: number, y: number) {
      if (!scrolls || fakeWindow.scrollY === y) {
        return;
      }
      fakeWindow.scrollY = y;
      pendingScroll = true;
    },
  };

  const parent = { scrollTop: 0, scrollLeft: 0, parentElement: null };

  const element = {
    scrollTop: 0,
    scrollLeft: 0,
    parentElement: scroller === "ancestor" ? parent : null,
    scrollIntoView() {
      if (!scrolls) {
        return;
      }
      if (scroller === "ancestor") {
        parent.scrollTop = 240;
      } else {
        fakeWindow.scrollY = 240;
      }
      pendingScroll = true;
    },
  };

  /** `page.locator(":root")` — the document element `scrollWindowTo` scrolls through. */
  const root = { scrollTop: 0, scrollLeft: 0, parentElement: null };

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

  const evaluateOn =
    (node: unknown) => async (fn: (el: unknown, arg?: unknown) => unknown, arg?: unknown) =>
      withFakeWindow(() => fn(node, arg));

  const page = {
    evaluate: async (fn: (arg?: unknown) => unknown, arg?: unknown) =>
      withFakeWindow(() => fn(arg)),
    waitForTimeout: async () => {
      waits += 1;
      await new Promise((resolve) => setTimeout(resolve, 1));
    },
    locator: () => ({ evaluate: evaluateOn(root) }),
  };

  const locator = {
    evaluate: evaluateOn(element),
    page: () => page,
  };

  return {
    locator: locator as unknown as Locator,
    page: page as unknown as Page,
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
    windowScrollY: () => fakeWindow.scrollY as number,
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

  it("waits when an ancestor scrolled and the window did not", async () => {
    const stub = createScrollStub({ scrolls: true, scroller: "ancestor" });
    let returned = false;
    const call = scrollLocatorIntoView(stub.locator, "center").then(() => {
      returned = true;
    });

    await realTime(20);
    assert.equal(stub.windowScrollY(), 0, "the ancestor scrolled, not the window");
    assert.equal(
      returned,
      false,
      "returned with the ancestor's `scroll` event still queued: that is the #608 walk, where the canvas scrolls inside `<main>`",
    );

    stub.renderingUpdate();
    await call;
    assert.equal(returned, true, "must return once the queued scroll event is delivered");
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

/**
 * The wait belongs to the page, not to one helper. `scrollLocatorIntoView` is
 * not the only thing in the harness that scrolls: the D13 `scrollPage` step
 * scrolls the document, and the document is the one scroller whose tree
 * contains every trigger, so upstream `useCloseOnScroll` closes anything opened
 * into its event. A step pair the fuzz alphabet generates freely —
 * `scrollPage(200)` then a click on a trigger already in view — would open an
 * overlay into a queued event with no wait anywhere in between.
 */
describe("D13 scrollPage", () => {
  const panelContext = (stub: ScrollStub) =>
    ({
      page: stub.page,
      canvas: stub.locator,
      framework: "solid",
    }) as unknown as PanelContext;

  it("does not return while the scroll event it queued is undelivered", async () => {
    const stub = createScrollStub({ scrolls: true });
    let returned = false;
    const call = performStep(panelContext(stub), {
      type: "scrollPage",
      y: 200,
      label: "scrollPage(200)",
    }).then(() => {
      returned = true;
    });

    await realTime(20);
    assert.equal(
      returned,
      false,
      "returned with its `scroll` event still queued: the next step's overlay would be closed by it",
    );

    stub.renderingUpdate();
    await call;
    assert.equal(returned, true, "must return once the queued scroll event is delivered");
  });

  it("waits through `scrollWindowTo`, the same primitive", async () => {
    const stub = createScrollStub({ scrolls: true });
    let returned = false;
    const call = scrollWindowTo(stub.page, 200).then(() => {
      returned = true;
    });

    await realTime(20);
    assert.equal(returned, false, "the document scroll must be delivered before the next step");

    stub.renderingUpdate();
    await call;
    assert.equal(returned, true, "must return once the queued scroll event is delivered");
  });

  it("costs no wait when the page is already at that offset", async () => {
    const stub = createScrollStub({ scrolls: false });
    await performStep(panelContext(stub), { type: "scrollPage", y: 0, label: "scrollPage(0)" });
    assert.equal(stub.waitCount(), 0, "a scroll that moves nothing queues no event");
  });
});
