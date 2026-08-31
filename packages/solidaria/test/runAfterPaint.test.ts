/**
 * @vitest-environment jsdom
 *
 * Direct regressions for the frame-to-timer scheduler used by overlay focus.
 */

import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { runAfterPaint } from "../src/utils/focus";

describe("runAfterPaint", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs after one animation frame and then one timer", () => {
    let frame: FrameRequestCallback | undefined;
    let timer: TimerHandler | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 41;
    });
    vi.spyOn(window, "setTimeout").mockImplementation(((callback: TimerHandler) => {
      timer = callback;
      return 42;
    }) as typeof window.setTimeout);
    const callback = vi.fn();

    runAfterPaint(callback);
    expect(callback).not.toHaveBeenCalled();

    frame?.(0);
    expect(callback).not.toHaveBeenCalled();

    if (typeof timer === "function") timer();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("cancels a pending animation frame", () => {
    let frame: FrameRequestCallback | undefined;
    const cancelFrame = vi.spyOn(window, "cancelAnimationFrame");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 51;
    });
    const callback = vi.fn();

    const cancel = runAfterPaint(callback);
    cancel();
    frame?.(0);

    expect(cancelFrame).toHaveBeenCalledWith(51);
    expect(callback).not.toHaveBeenCalled();
  });

  it("cancels a pending timer after the frame", () => {
    let frame: FrameRequestCallback | undefined;
    let timer: TimerHandler | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 61;
    });
    vi.spyOn(window, "setTimeout").mockImplementation(((callback: TimerHandler) => {
      timer = callback;
      return 62;
    }) as typeof window.setTimeout);
    const clearTimer = vi.spyOn(window, "clearTimeout");
    const callback = vi.fn();

    const cancel = runAfterPaint(callback);
    frame?.(0);
    cancel();
    if (typeof timer === "function") timer();

    expect(clearTimer).toHaveBeenCalledWith(62);
    expect(callback).not.toHaveBeenCalled();
  });

  it("uses the timer directly when animation frames are unavailable", () => {
    const original = window.requestAnimationFrame;
    let timer: TimerHandler | undefined;
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: undefined,
    });
    vi.spyOn(window, "setTimeout").mockImplementation(((callback: TimerHandler) => {
      timer = callback;
      return 71;
    }) as typeof window.setTimeout);
    const callback = vi.fn();

    try {
      runAfterPaint(callback);
      expect(callback).not.toHaveBeenCalled();
      if (typeof timer === "function") timer();
      expect(callback).toHaveBeenCalledOnce();
    } finally {
      Object.defineProperty(window, "requestAnimationFrame", {
        configurable: true,
        value: original,
      });
    }
  });

  it("runs synchronously when the owner document has no window", () => {
    const ownerlessDocument = document.implementation.createHTMLDocument();
    const callback = vi.fn();

    const cancel = runAfterPaint(callback, ownerlessDocument);

    expect(callback).toHaveBeenCalledOnce();
    expect(() => cancel()).not.toThrow();
  });
});
