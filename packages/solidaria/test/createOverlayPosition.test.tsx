/**
 * createOverlayPosition tests — RAC 1.21.0 window-scroll reposition
 * (`useOverlayPosition.ts:370-383`). Window scroll must re-run positioning
 * while a visual-viewport resize is in progress (iOS virtual keyboard).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, render } from "@solidjs/testing-library";
import { createOverlayPosition } from "../src/popover/createOverlayPosition";

const mockVisualViewport = vi.hoisted(() => {
  const target = new EventTarget() as EventTarget & {
    offsetTop: number;
    offsetLeft: number;
    pageTop: number;
    pageLeft: number;
    width: number;
    height: number;
    scale: number;
  };
  target.offsetTop = 0;
  target.offsetLeft = 0;
  target.pageTop = 80;
  target.pageLeft = 0;
  target.width = 1024;
  target.height = 768;
  target.scale = 1;
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: target,
  });
  return target;
});

describe("createOverlayPosition window scroll", () => {
  beforeEach(() => {
    class NoopResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", NoopResizeObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("repositions when a scroll event fires on window during visual-viewport resize", () => {
    let measureCalls = 0;
    const targetRect = {
      top: 10,
      left: 20,
      width: 40,
      height: 20,
      bottom: 30,
      right: 60,
      x: 20,
      y: 10,
      toJSON() {
        return {};
      },
    } as DOMRect;

    function Example() {
      let target: HTMLButtonElement | undefined;
      let overlay: HTMLDivElement | undefined;
      createOverlayPosition({
        targetRef: () => target ?? null,
        overlayRef: () => overlay ?? null,
        isOpen: true,
        shouldFlip: false,
        containerPadding: 0,
        getTargetRect: () => {
          measureCalls++;
          return targetRect;
        },
      });
      return (
        <div>
          <button ref={target}>trigger</button>
          <div ref={overlay}>overlay</div>
        </div>
      );
    }

    render(() => <Example />);
    const afterMount = measureCalls;
    expect(afterMount).toBeGreaterThan(0);

    mockVisualViewport.dispatchEvent(new Event("resize"));
    const afterResize = measureCalls;
    expect(afterResize).toBeGreaterThan(afterMount);

    window.dispatchEvent(new Event("scroll"));
    expect(measureCalls).toBeGreaterThan(afterResize);
  });
});

/**
 * RAC `useOverlayPosition.test.tsx` layout contract. jsdom rects are zero unless
 * we read inline style, matching the RAC test's getBoundingClientRect stub.
 */
describe("createOverlayPosition measured placement", () => {
  const originalGetBoundingClientRect = window.HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    class NoopResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", NoopResizeObserver);

    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        offsetTop: 0,
        offsetLeft: 0,
        pageTop: 0,
        pageLeft: 0,
        width: 500,
        height: 768,
        scale: 1,
        addEventListener() {},
        removeEventListener() {},
      },
    });
    document.body.style.margin = "0";
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      value: 768,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 500,
    });
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(
      function (this: HTMLElement) {
        return parseInt(this.style.width, 10) || 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return parseInt(this.style.height, 10) || 0;
      },
    );
    window.HTMLElement.prototype.getBoundingClientRect = function () {
      const rect = originalGetBoundingClientRect.apply(this);
      if (this.tagName === "BODY") {
        return {
          ...rect,
          height: this.clientHeight,
          width: this.clientWidth,
        };
      }
      const left = parseInt(this.style.left, 10) || 0;
      const top = parseInt(this.style.top, 10) || 0;
      const width = parseInt(this.style.width, 10) || 0;
      const height = parseInt(this.style.height, 10) || 0;
      return {
        ...rect,
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        x: left,
        y: top,
        toJSON() {
          return {};
        },
      };
    };
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    document.body.style.margin = "";
  });

  it("keeps preferred bottom placement and reports measured top/left on overlayProps.style", () => {
    function Example() {
      let target: HTMLDivElement | undefined;
      let overlay: HTMLDivElement | undefined;
      const { overlayProps, placement } = createOverlayPosition({
        targetRef: () => target ?? null,
        overlayRef: () => overlay ?? null,
        isOpen: true,
        arrowSize: 8,
      });
      return (
        <>
          <div
            ref={target}
            data-testid="trigger"
            style={{ left: "10px", top: "250px", width: "100px", height: "100px" }}
          >
            Trigger
          </div>
          <div
            ref={overlay}
            data-testid="overlay"
            data-placement={placement() ?? undefined}
            style={{ width: "300px", height: "200px", ...overlayProps.style }}
          >
            overlay
          </div>
        </>
      );
    }

    const { getByTestId } = render(() => <Example />);
    const overlay = getByTestId("overlay");

    expect(overlay.getAttribute("data-placement")).toBe("bottom");
    expect(overlay.style.position).toBe("absolute");
    expect(overlay.style.left).toBe("12px");
    expect(overlay.style.top).toBe("350px");
    expect(overlay.style.maxHeight).toBe("406px");
  });

  it("does not flip preferred bottom when more space remains below the trigger", () => {
    function Example() {
      let target: HTMLDivElement | undefined;
      let overlay: HTMLDivElement | undefined;
      const { overlayProps, placement } = createOverlayPosition({
        targetRef: () => target ?? null,
        overlayRef: () => overlay ?? null,
        isOpen: true,
        placement: "bottom",
        shouldFlip: true,
        arrowSize: 8,
      });
      return (
        <>
          <div
            ref={target}
            data-testid="trigger"
            style={{ left: "10px", top: "80px", width: "100px", height: "40px" }}
          >
            Trigger
          </div>
          <div
            ref={overlay}
            data-testid="overlay"
            data-placement={placement() ?? undefined}
            style={{ width: "300px", height: "200px", ...overlayProps.style }}
          >
            overlay
          </div>
        </>
      );
    }

    const { getByTestId } = render(() => <Example />);
    expect(getByTestId("overlay").getAttribute("data-placement")).toBe("bottom");
  });
});
