/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { announce, clearAnnouncer, destroyAnnouncer } from "../src/live-announcer";

// Mark as test environment for immediate announcements
(globalThis as Record<string, unknown>).IS_SOLIDARIA_TEST = true;

describe("liveAnnouncer", () => {
  beforeEach(() => {
    // Clean up any existing announcer
    destroyAnnouncer();
  });

  afterEach(() => {
    // Clean up after each test
    destroyAnnouncer();
  });

  describe("announce", () => {
    it("should create live announcer element in DOM", () => {
      announce("Test message");

      const announcer = document.querySelector("[data-live-announcer]");
      expect(announcer).toBeTruthy();
    });

    it("should create assertive and polite log regions", () => {
      announce("Test");

      const announcer = document.querySelector("[data-live-announcer]");
      const logs = announcer?.querySelectorAll('[role="log"]');

      expect(logs?.length).toBe(2);

      const assertiveLog = announcer?.querySelector('[aria-live="assertive"]');
      const politeLog = announcer?.querySelector('[aria-live="polite"]');

      expect(assertiveLog).toBeTruthy();
      expect(politeLog).toBeTruthy();
    });

    it("should add message to assertive log by default", () => {
      announce("Assertive message");

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      expect(assertiveLog?.textContent).toBe("Assertive message");
    });

    it("should add message to polite log when specified", () => {
      announce("Polite message", "polite");

      const politeLog = document.querySelector('[aria-live="polite"]');
      expect(politeLog?.textContent).toBe("Polite message");
    });

    it("should handle aria-labelledby messages", () => {
      // Create an element to reference
      const referenceEl = document.createElement("div");
      referenceEl.id = "my-label";
      referenceEl.textContent = "Label content";
      document.body.appendChild(referenceEl);

      announce({ "aria-labelledby": "my-label" });

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      const messageEl = assertiveLog?.querySelector('[aria-labelledby="my-label"]');

      expect(messageEl).toBeTruthy();
      expect(messageEl?.getAttribute("role")).toBe("img");

      // Cleanup
      referenceEl.remove();
    });

    it("should reuse existing announcer on subsequent calls", () => {
      announce("First message");
      announce("Second message");

      const announcers = document.querySelectorAll("[data-live-announcer]");
      expect(announcers.length).toBe(1);

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      expect(assertiveLog?.children.length).toBe(2);
    });

    it("should remove messages after timeout", async () => {
      vi.useFakeTimers();

      announce("Temporary message", "assertive", 1000);

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      expect(assertiveLog?.textContent).toBe("Temporary message");

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(1000);

      expect(assertiveLog?.textContent).toBe("");

      vi.useRealTimers();
    });

    it("should not remove empty messages", async () => {
      vi.useFakeTimers();

      announce("", "assertive", 100);

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      const messageCount = assertiveLog?.children.length ?? 0;

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(200);

      // Empty message should not have a timeout
      expect(assertiveLog?.children.length).toBe(messageCount);

      vi.useRealTimers();
    });
  });

  describe("clearAnnouncer", () => {
    it("should clear assertive log", () => {
      announce("Message 1", "assertive");
      announce("Message 2", "assertive");

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      expect(assertiveLog?.children.length).toBe(2);

      clearAnnouncer("assertive");

      expect(assertiveLog?.children.length).toBe(0);
    });

    it("should clear polite log", () => {
      announce("Polite 1", "polite");
      announce("Polite 2", "polite");

      const politeLog = document.querySelector('[aria-live="polite"]');
      expect(politeLog?.children.length).toBe(2);

      clearAnnouncer("polite");

      expect(politeLog?.children.length).toBe(0);
    });

    it("should clear both logs when no assertiveness specified", () => {
      announce("Assertive", "assertive");
      announce("Polite", "polite");

      clearAnnouncer();

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      const politeLog = document.querySelector('[aria-live="polite"]');

      expect(assertiveLog?.children.length).toBe(0);
      expect(politeLog?.children.length).toBe(0);
    });

    it("should do nothing if announcer does not exist", () => {
      // Should not throw
      expect(() => clearAnnouncer("assertive")).not.toThrow();
    });
  });

  describe("destroyAnnouncer", () => {
    it("should remove announcer from DOM", () => {
      announce("Test");

      let announcer = document.querySelector("[data-live-announcer]");
      expect(announcer).toBeTruthy();

      destroyAnnouncer();

      announcer = document.querySelector("[data-live-announcer]");
      expect(announcer).toBeNull();
    });

    it("should allow creating new announcer after destroy", () => {
      announce("First");
      destroyAnnouncer();

      announce("After destroy");

      const announcer = document.querySelector("[data-live-announcer]");
      expect(announcer).toBeTruthy();

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      expect(assertiveLog?.textContent).toBe("After destroy");
    });

    it("should do nothing if announcer does not exist", () => {
      // Should not throw
      expect(() => destroyAnnouncer()).not.toThrow();
    });
  });

  describe("visually hidden styles", () => {
    it("should apply visually hidden styles to announcer", () => {
      announce("Test");

      const announcer = document.querySelector("[data-live-announcer]") as HTMLElement;

      expect(announcer.style.position).toBe("absolute");
      expect(announcer.style.width).toBe("1px");
      expect(announcer.style.height).toBe("1px");
      expect(announcer.style.overflow).toBe("hidden");
    });
  });

  describe("aria attributes", () => {
    it("should have correct aria-relevant attribute", () => {
      announce("Test");

      const assertiveLog = document.querySelector('[aria-live="assertive"]');
      const politeLog = document.querySelector('[aria-live="polite"]');

      expect(assertiveLog?.getAttribute("aria-relevant")).toBe("additions");
      expect(politeLog?.getAttribute("aria-relevant")).toBe("additions");
    });

    it('should have role="log" on live regions', () => {
      announce("Test");

      const logs = document.querySelectorAll('[role="log"]');
      expect(logs.length).toBe(2);
    });
  });
});
