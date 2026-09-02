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
