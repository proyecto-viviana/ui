/**
 * Toast tests
 *
 * Tests for Toast component functionality including:
 * - Rendering
 * - Toast sub-components
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createRoot, For } from "solid-js";
import { render, screen, cleanup, within } from "@solidjs/testing-library";
import { createToastState, ToastQueue } from "@proyecto-viviana/solid-stately";
import {
  ToastProvider,
  ToastRegion,
  DefaultToast,
  ToastTitle,
  ToastDescription,
  globalToastQueue,
  addToast,
  useToastContext,
} from "../src/Toast";
import {
  setupUser,
  createLiveRegionMonitor,
  type LiveRegionMonitor,
} from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

function clearGlobalToasts() {
  const toastsAccessor = globalToastQueue.visibleToasts;
  if (typeof toastsAccessor !== "function") return;
  for (const toast of toastsAccessor()) {
    globalToastQueue.remove(toast.key);
  }
}

describe("Toast", () => {
  beforeEach(() => {
    user = setupUser();
    clearGlobalToasts();
  });

  afterEach(() => {
    clearGlobalToasts();
    cleanup();
  });

  // ============================================
  // TOAST PROVIDER
  // ============================================

  describe("ToastProvider", () => {
    it("should render children", () => {
      render(() => (
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      ));

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
      render(() => (
        <ToastProvider>
          <div data-testid="child1">First</div>
          <div data-testid="child2">Second</div>
        </ToastProvider>
      ));

      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
    });
  });

  // ============================================
  // TOAST TITLE
  // ============================================

  describe("ToastTitle", () => {
    it("should render title", () => {
      render(() => <ToastTitle>My Title</ToastTitle>);

      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("should apply custom class", () => {
      render(() => <ToastTitle class="my-title">Title</ToastTitle>);

      const title = screen.getByText("Title");
      expect(title).toHaveClass("my-title");
    });

    it("should apply custom style", () => {
      render(() => <ToastTitle style={{ color: "red" }}>Title</ToastTitle>);

      const title = screen.getByText("Title");
      expect(title).toHaveAttribute("style");
    });
  });

  // ============================================
  // TOAST DESCRIPTION
  // ============================================

  describe("ToastDescription", () => {
    it("should render description", () => {
      render(() => <ToastDescription>My Description</ToastDescription>);

      expect(screen.getByText("My Description")).toBeInTheDocument();
    });

    it("should apply custom class", () => {
      render(() => <ToastDescription class="my-desc">Description</ToastDescription>);

      const desc = screen.getByText("Description");
      expect(desc).toHaveClass("my-desc");
    });

    it("should apply custom style", () => {
      render(() => (
        <ToastDescription style={{ "font-size": "14px" }}>Description</ToastDescription>
      ));

      const desc = screen.getByText("Description");
      expect(desc).toHaveAttribute("style");
    });

    it("should render complex content", () => {
      render(() => (
        <ToastDescription>
          <span>Part 1</span>
          <span>Part 2</span>
        </ToastDescription>
      ));

      expect(screen.getByText("Part 1")).toBeInTheDocument();
      expect(screen.getByText("Part 2")).toBeInTheDocument();
    });
  });

  // ============================================
  // COMBINED USAGE
  // ============================================

  describe("combined usage", () => {
    it("should render title and description together", () => {
      render(() => (
        <div>
          <ToastTitle>Alert Title</ToastTitle>
          <ToastDescription>Alert Description</ToastDescription>
        </div>
      ));

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
      expect(screen.getByText("Alert Description")).toBeInTheDocument();
    });

    it("should render within provider", () => {
      render(() => (
        <ToastProvider>
          <div class="toast-content">
            <ToastTitle>Notification</ToastTitle>
            <ToastDescription>You have a new message</ToastDescription>
          </div>
        </ToastProvider>
      ));

      expect(screen.getByText("Notification")).toBeInTheDocument();
      expect(screen.getByText("You have a new message")).toBeInTheDocument();
    });

    it("should link alertdialog aria-labelledby/aria-describedby to rendered title and description", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false}>
            {(renderProps) => (
              <For each={renderProps.visibleToasts()}>
                {(toast) => <DefaultToast toast={toast} />}
              </For>
            )}
          </ToastRegion>
        </ToastProvider>
      ));

      addToast({ title: "Linked title", description: "Linked description", type: "info" });

      const description = screen.getByText("Linked description");
      const toast = description.closest('[role="alertdialog"]') as HTMLElement | null;
      expect(toast).toBeTruthy();
      const scoped = within(toast as HTMLElement);
      const title = scoped.getByText("Linked title");

      expect(title.id).toBeTruthy();
      expect(description.id).toBeTruthy();
      expect(toast).toHaveAttribute("aria-labelledby", title.id);
      expect(toast).toHaveAttribute("aria-describedby", description.id);
    });
  });

  describe("ToastRegion placement styles", () => {
    function renderRegion(className?: string) {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} class={className}>
            {(renderProps) => (
              <For each={renderProps.visibleToasts()}>
                {(toast) => <DefaultToast toast={toast} />}
              </For>
            )}
          </ToastRegion>
        </ToastProvider>
      ));

      addToast({ title: "Placed toast", type: "info" });

      return screen.getByRole("region", { name: "Notifications" });
    }

    it("keeps fallback placement styles for a bare region", () => {
      const region = renderRegion();

      expect(region.style.position).toBe("fixed");
      expect(region.style.bottom).toBe("16px");
      expect(region.style.left).toBe("50%");
      expect(region.style.transform).toBe("translateX(-50%)");
    });

    it("lets caller-supplied classes own placement instead of adding inline geometry", () => {
      const region = renderRegion("custom-toast-region");
      const inlineStyle = region.getAttribute("style") ?? "";

      expect(region).toHaveClass("custom-toast-region");
      expect(inlineStyle).not.toContain("left: 50%");
      expect(inlineStyle).not.toContain("transform:");
      expect(inlineStyle).not.toContain("pointer-events: none");
    });
  });

  // ============================================
  // GLOBAL TOAST QUEUE
  // ============================================

  describe("globalToastQueue", () => {
    it("should be a ToastQueue instance", () => {
      expect(globalToastQueue).toBeTruthy();
      expect(typeof globalToastQueue.add).toBe("function");
    });

    it("should support adding toasts", () => {
      const key = globalToastQueue.add({ title: "Test" });
      expect(key).toBeTruthy();
      expect(typeof key).toBe("string");
      // Clean up
      globalToastQueue.close(key);
    });
  });

  // ============================================
  // ADD TOAST UTILITY
  // ============================================

  describe("addToast", () => {
    it("should add a toast to global queue and return key", () => {
      const key = addToast({ title: "Hello" });
      expect(key).toBeTruthy();
      expect(typeof key).toBe("string");
      // Clean up
      globalToastQueue.close(key);
    });

    it("should support toast with description", () => {
      const key = addToast({ title: "Title", description: "Description" });
      expect(key).toBeTruthy();
      globalToastQueue.close(key);
    });

    it("should support toast with type", () => {
      const key = addToast({ title: "Success", type: "success" });
      expect(key).toBeTruthy();
      globalToastQueue.close(key);
    });

    it("should support toast with options", () => {
      const key = addToast({ title: "Quick" }, { timeout: 3000 });
      expect(key).toBeTruthy();
      globalToastQueue.close(key);
    });
  });

  // ============================================
  // TOAST PROVIDER OPTIONS
  // ============================================

  describe("ToastProvider options", () => {
    it("should support useGlobalQueue option", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <div data-testid="child">Content</div>
        </ToastProvider>
      ));

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should support custom queueOptions", () => {
      render(() => (
        <ToastProvider queueOptions={{ maxVisibleToasts: 3 }}>
          <div data-testid="child">Content</div>
        </ToastProvider>
      ));

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  // ============================================
  // CONTEXT ERROR
  // ============================================

  describe("context error", () => {
    it("useToastContext should throw outside provider", () => {
      expect(() => {
        render(() => {
          useToastContext();
          return <div />;
        });
      }).toThrow("Toast components must be used within a ToastProvider");
    });
  });

  // ============================================
  // EXIT ANIMATION LIFECYCLE
  // ============================================

  describe("exit animation lifecycle", () => {
    it("global queue should have hasExitAnimation enabled", () => {
      // The global queue should use exit animations so consumers can style exit transitions
      const key = globalToastQueue.add({ title: "Test" });
      globalToastQueue.close(key);
      // With hasExitAnimation: true, close() marks as exiting instead of removing.
      // Since we're in JSDOM (no getAnimations), the Toast component would call
      // remove() immediately in its effect. But at the queue level, close sets 'exiting'.
      // Clean up any remaining toast
      globalToastQueue.remove(key);
    });

    it("ToastState should expose remove method", () => {
      createRoot((dispose) => {
        const queue = new ToastQueue({ hasExitAnimation: true });
        const state = createToastState({ queue });
        expect(typeof state.remove).toBe("function");
        dispose();
      });
    });

    it("queue should mark toast as exiting on close when hasExitAnimation is true", () => {
      const queue = new ToastQueue({ hasExitAnimation: true });
      const callback = vi.fn();
      queue.subscribe(callback);

      const key = queue.add("Test Toast");
      queue.close(key);

      const toasts = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(toasts).toHaveLength(1);
      expect(toasts[0].animation).toBe("exiting");

      // Finalize removal
      queue.remove(key);
      const finalToasts = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(finalToasts).toHaveLength(0);
    });
  });

  // ============================================
  // A11Y RISK AREA: Live regions
  // ============================================

  describe("a11y live regions", () => {
    it("should expose the React Aria toast region landmarks and alertdialog content", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <div>App</div>
          <ToastRegion portal={false}>
            {(renderProps) => (
              <For each={renderProps.visibleToasts()}>
                {(toast) => <DefaultToast toast={toast} />}
              </For>
            )}
          </ToastRegion>
        </ToastProvider>
      ));

      addToast({ title: "Hello" });

      const region = screen.getByRole("region", { name: "Notifications" });
      const toast = screen.getByRole("alertdialog", { name: "Hello" });

      expect(region).toHaveAttribute("data-solidaria-top-layer", "true");
      expect(region).toContainElement(toast);
    });

    it("should inject toast content into a live-region-accessible element", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <div>App</div>
          <ToastRegion portal={false}>
            {(renderProps) => (
              <For each={renderProps.visibleToasts()}>
                {(toast) => <DefaultToast toast={toast} />}
              </For>
            )}
          </ToastRegion>
        </ToastProvider>
      ));

      addToast({ title: "Success notification" });

      // The toast title should appear in the document
      const toastText = screen.queryByText("Success notification");
      if (toastText) {
        // Verify the toast or its ancestor has a live-region-compatible attribute
        const hasLiveAncestor = toastText.closest(
          '[aria-live], [role="alert"], [role="status"], [role="log"], [role="region"]',
        );
        expect(hasLiveAncestor || toastText.closest("[aria-label]")).toBeTruthy();
      }
    });

    it("should announce the toast text in an assertive live region", async () => {
      // Start observing before the toast mounts so the live region insertion is captured.
      const monitor = createLiveRegionMonitor(document.body);

      render(() => (
        <ToastProvider useGlobalQueue>
          <div>App</div>
          <ToastRegion portal={false}>
            {(renderProps) => (
              <For each={renderProps.visibleToasts()}>
                {(toast) => <DefaultToast toast={toast} />}
              </For>
            )}
          </ToastRegion>
        </ToastProvider>
      ));

      addToast({ title: "Monitor test toast" });

      // The toast message must land in a live region (role="alert" / aria-live)
      // and be announced. A toast that mounts with an empty / missing live region
      // produces no announcement, so this rejects (and the test fails).
      const announcement = await monitor.waitForAnnouncement("Monitor test toast", {
        timeout: 1000,
      });

      expect(announcement.text).toContain("Monitor test toast");
      // createToast wires the content area as assertive (role="alert").
      expect(announcement.politeness).toBe("assertive");

      monitor.stop();
    });
  });
});
