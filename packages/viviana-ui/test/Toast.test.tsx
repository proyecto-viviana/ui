/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { ToastProvider, ToastRegion, addToast, globalToastQueue } from "../src/toast";

afterEach(() => {
  globalToastQueue.clear();
  cleanup();
});

describe("Toast (viviana-ui) view transitions", () => {
  it("runs the queue update inside the transition callback (#578)", () => {
    // The twin of solid-spectrum's regression: jsdom has no View Transitions
    // API, so the browser path is uncovered unless a faithful stub installs
    // one. Returning the mutation instead of calling it left the region
    // unrendered in every real browser.
    const calls: Array<() => unknown> = [];
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      writable: true,
      value: (callback: () => unknown) => {
        calls.push(callback);
        callback();
        return {
          ready: Promise.resolve(),
          finished: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: () => {},
        };
      },
    });

    try {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Through a transition", type: "info" });

      expect(calls.length).toBeGreaterThan(0);
      expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition;
    }
  });
});
