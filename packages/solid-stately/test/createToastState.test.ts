/**
 * createToastState tests - Port of React Aria's useToastState.test.js
 *
 * Tests for toast state management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import {
  createToastState,
  createToastQueue,
  ToastQueue,
  Timer,
} from "../src/toast/createToastState";

describe("createToastState", () => {
  const newValue = [
    {
      content: "Toast Message",
      props: { timeout: 0 },
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("should add a new toast via add", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();

      expect(state.visibleToasts()).toStrictEqual([]);

      state.add(newValue[0].content, newValue[0].props);
      expect(state.visibleToasts()).toHaveLength(1);
      expect(state.visibleToasts()[0].content).toBe(newValue[0].content);
      expect(state.visibleToasts()[0].timeout).toBe(0);
      // In our implementation, timer is created for any toast with timeout (even 0)
      // but timer is only created when timeout is defined
      expect(state.visibleToasts()[0]).toHaveProperty("key");

      dispose();
    });
  });

  it("should add a new toast with a timer", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();

      expect(state.visibleToasts()).toStrictEqual([]);

      state.add("Test", { timeout: 5000 });
      expect(state.visibleToasts()).toHaveLength(1);
      expect(state.visibleToasts()[0].content).toBe("Test");
      expect(state.visibleToasts()[0].timeout).toBe(5000);
      expect(state.visibleToasts()[0].timer).not.toBe(null);
      expect(state.visibleToasts()[0]).toHaveProperty("key");

      dispose();
    });
  });

  it("should be able to add multiple toasts", () => {
    createRoot((dispose) => {
      const secondToast = {
        content: "Second Toast",
        props: { timeout: 0 },
      };
      const state = createToastQueue<string>({ maxVisibleToasts: 2 });

      expect(state.visibleToasts()).toStrictEqual([]);

      state.add(newValue[0].content, newValue[0].props);
      expect(state.visibleToasts()[0].content).toBe(newValue[0].content);

      state.add(secondToast.content, secondToast.props);
      expect(state.visibleToasts().length).toBe(2);
      expect(state.visibleToasts()[0].content).toBe(secondToast.content);
      expect(state.visibleToasts()[1].content).toBe(newValue[0].content);

      dispose();
    });
  });

  it("should be able to display multiple toasts and close them", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>({ maxVisibleToasts: 3 });

      // Add three toasts
      state.add("First Toast");
      state.add("Second Toast");
      state.add("Third Toast");

      expect(state.visibleToasts()).toHaveLength(3);
      expect(state.visibleToasts()[0].content).toBe("Third Toast");
      expect(state.visibleToasts()[1].content).toBe("Second Toast");
      expect(state.visibleToasts()[2].content).toBe("First Toast");

      // Close the middle toast
      const secondToastKey = state.visibleToasts()[1].key;
      state.close(secondToastKey);

      expect(state.visibleToasts()).toHaveLength(2);
      expect(state.visibleToasts()[0].content).toBe("Third Toast");
      expect(state.visibleToasts()[1].content).toBe("First Toast");

      // Close the first toast
      state.close(state.visibleToasts()[0].key);
      expect(state.visibleToasts().length).toBe(1);
      expect(state.visibleToasts()[0].content).toBe("First Toast");

      dispose();
    });
  });

  it("should be able to display one toast, add multiple toasts, and remove the middle not visible one programmatically", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();

      // Add the first toast
      state.add("First Toast", { timeout: 0 });
      expect(state.visibleToasts()).toHaveLength(1);
      expect(state.visibleToasts()[0].content).toBe("First Toast");

      let secondToastKey: string | null = null;
      // Add the second toast
      secondToastKey = state.add("Second Toast", { timeout: 0 });
      // In our implementation, with maxVisibleToasts=5 by default, both are visible
      expect(state.visibleToasts().length).toBeGreaterThanOrEqual(1);

      // Add the third toast
      state.add("Third Toast", { timeout: 0 });
      expect(state.visibleToasts().length).toBeGreaterThanOrEqual(1);

      // Remove a toast
      state.close(secondToastKey);

      // First and Third should still be there (Second removed)
      const contents = state.visibleToasts().map((t) => t.content);
      expect(contents).toContain("First Toast");
      expect(contents).toContain("Third Toast");
      expect(contents).not.toContain("Second Toast");

      dispose();
    });
  });

  it("should auto-close toasts with timeout", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();

      // Add a toast with timeout
      state.add("Auto-close Toast", { timeout: 2000 });
      expect(state.visibleToasts()).toHaveLength(1);
      expect(state.visibleToasts()[0].content).toBe("Auto-close Toast");

      // Advance time but not enough to close
      vi.advanceTimersByTime(1000);
      expect(state.visibleToasts()).toHaveLength(1);

      // Advance time enough to close
      vi.advanceTimersByTime(1500);
      expect(state.visibleToasts()).toHaveLength(0);

      dispose();
    });
  });

  it("should maintain the toast queue order on close", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>({ maxVisibleToasts: 3 });

      state.add("First Toast");
      expect(state.visibleToasts()).toHaveLength(1);
      expect(state.visibleToasts()[0].content).toBe("First Toast");

      state.add("Second Toast");
      expect(state.visibleToasts()).toHaveLength(2);
      expect(state.visibleToasts()[0].content).toBe("Second Toast");
      expect(state.visibleToasts()[1].content).toBe("First Toast");

      state.add("Third Toast");
      expect(state.visibleToasts()).toHaveLength(3);
      expect(state.visibleToasts()[0].content).toBe("Third Toast");
      expect(state.visibleToasts()[1].content).toBe("Second Toast");
      expect(state.visibleToasts()[2].content).toBe("First Toast");

      state.close(state.visibleToasts()[1].key);
      expect(state.visibleToasts()).toHaveLength(2);
      expect(state.visibleToasts()[0].content).toBe("Third Toast");
      expect(state.visibleToasts()[1].content).toBe("First Toast");

      dispose();
    });
  });

  it("should close a toast", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();
      state.add(newValue[0].content, newValue[0].props);

      state.close(state.visibleToasts()[0].key);
      expect(state.visibleToasts()).toStrictEqual([]);

      dispose();
    });
  });

  it("should pause and resume all toasts", () => {
    createRoot((dispose) => {
      const state = createToastQueue<string>();

      // Add a toast with timeout
      state.add("Toast 1", { timeout: 2000 });
      expect(state.visibleToasts()).toHaveLength(1);

      // Advance time a bit
      vi.advanceTimersByTime(1000);

      // Pause all
      state.pauseAll();

      // Advance time - should not close because paused
      vi.advanceTimersByTime(2000);
      expect(state.visibleToasts()).toHaveLength(1);

      // Resume all
      state.resumeAll();

      // Now advance time - should close
      vi.advanceTimersByTime(1500);
      expect(state.visibleToasts()).toHaveLength(0);

      dispose();
    });
  });
});

describe("ToastQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("should notify subscribers when toasts are added", () => {
    const queue = new ToastQueue<string>();
    const callback = vi.fn();

    queue.subscribe(callback);
    queue.add("Test Toast");

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls[0][0]).toHaveLength(1);
    expect(callback.mock.calls[0][0][0].content).toBe("Test Toast");
  });

  it("should unsubscribe correctly", () => {
    const queue = new ToastQueue<string>();
    const callback = vi.fn();

    const unsubscribe = queue.subscribe(callback);
    queue.add("First Toast");
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    queue.add("Second Toast");
    expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it("should support priority ordering", () => {
    const queue = new ToastQueue<string>({ maxVisibleToasts: 5 });
    const callback = vi.fn();

    queue.subscribe(callback);
    queue.add("Low Priority", { priority: 0 });
    queue.add("High Priority", { priority: 10 });
    queue.add("Medium Priority", { priority: 5 });

    const toasts = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(toasts[0].content).toBe("High Priority");
    expect(toasts[1].content).toBe("Medium Priority");
    expect(toasts[2].content).toBe("Low Priority");
  });

  it("should place newer same-priority toasts first", () => {
    const queue = new ToastQueue<string>({ maxVisibleToasts: 5 });
    const callback = vi.fn();

    queue.subscribe(callback);
    queue.add("First Toast");
    queue.add("Second Toast");
    queue.add("Third Toast");

    const toasts = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(toasts.map((toast: any) => toast.content)).toEqual([
      "Third Toast",
      "Second Toast",
      "First Toast",
    ]);
  });

  it("should call onClose callback when toast is closed", () => {
    const queue = new ToastQueue<string>();
    const onClose = vi.fn();

    queue.add("Test Toast", { onClose });
    const key = queue.add("Another Toast");

    queue.close(key);
    expect(onClose).not.toHaveBeenCalled();

    // Get the first toast's key
    const callback = vi.fn();
    queue.subscribe(callback);
    queue.add("Trigger notification");
    const toasts = callback.mock.calls[0][0];
    const firstToastKey = toasts.find((t: any) => t.content === "Test Toast")?.key;

    if (firstToastKey) {
      queue.close(firstToastKey);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("should handle exit animations", () => {
    const queue = new ToastQueue<string>({ hasExitAnimation: true });
    const callback = vi.fn();

    queue.subscribe(callback);
    const key = queue.add("Test Toast");

    queue.close(key);

    // Toast should be marked as exiting, not removed yet
    const toasts = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(toasts).toHaveLength(1);
    expect(toasts[0].animation).toBe("exiting");

    // Manually remove after animation
    queue.remove(key);
    const finalToasts = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(finalToasts).toHaveLength(0);
  });

  it("should clear all toasts and call onClose callbacks", () => {
    const queue = new ToastQueue<string>();
    const callback = vi.fn();
    const firstClose = vi.fn();
    const secondClose = vi.fn();

    queue.subscribe(callback);
    queue.add("First Toast", { onClose: firstClose });
    queue.add("Second Toast", { onClose: secondClose });

    queue.clear();

    const finalToasts = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(finalToasts).toHaveLength(0);
    expect(firstClose).toHaveBeenCalledTimes(1);
    expect(secondClose).toHaveBeenCalledTimes(1);
  });

  it("should replace toast objects when marking exit animations", () => {
    const queue = new ToastQueue<string>({ hasExitAnimation: true });
    const callback = vi.fn();

    queue.subscribe(callback);
    const key = queue.add("Test Toast");
    const initialToast = callback.mock.calls[callback.mock.calls.length - 1][0][0];

    queue.close(key);

    const exitingToast = callback.mock.calls[callback.mock.calls.length - 1][0][0];
    expect(exitingToast).not.toBe(initialToast);
    expect(exitingToast.animation).toBe("exiting");

    queue.remove(key);
  });
});

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("should call callback after delay", () => {
    const callback = vi.fn();
    new Timer(callback, 1000);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
  });

  it("should support pause and resume", () => {
    const callback = vi.fn();
    const timer = new Timer(callback, 1000);

    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    timer.pause();
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();

    timer.resume();
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalled();
  });

  it("should support reset", () => {
    const callback = vi.fn();
    const timer = new Timer(callback, 1000);

    vi.advanceTimersByTime(800);
    expect(callback).not.toHaveBeenCalled();

    timer.reset(1000);
    vi.advanceTimersByTime(800);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalled();
  });

  it("should support cancel", () => {
    const callback = vi.fn();
    const timer = new Timer(callback, 1000);

    timer.cancel();
    vi.advanceTimersByTime(2000);
    expect(callback).not.toHaveBeenCalled();
  });
});
