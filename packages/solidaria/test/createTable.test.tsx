/**
 * Tests for createTable ARIA hook - announcement infrastructure tests.
 *
 * Note: The createTable hook integrates with createTableState which requires
 * a TableCollection built via createTableCollection. Full integration tests
 * for sort announcements are in the solid-stately package (createTableState.test.ts)
 * and E2E tests in the Table component.
 *
 * These tests verify that the announcement infrastructure is properly set up.
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { cleanup } from "@solidjs/testing-library";
import { announce, clearAnnouncer } from "../src/live-announcer";

describe("createTable announcement infrastructure", () => {
  beforeEach(() => {
    clearAnnouncer();
  });

  afterEach(() => {
    cleanup();
    clearAnnouncer();
  });

  describe("announce function", () => {
    it("exists and can be called with assertive mode", () => {
      expect(typeof announce).toBe("function");

      // Should not throw
      expect(() => {
        announce("Test announcement", "assertive", 500);
      }).not.toThrow();
    });

    it("can be called with polite mode", () => {
      expect(() => {
        announce("Polite announcement", "polite", 500);
      }).not.toThrow();
    });

    it("can be called with custom timeout", () => {
      expect(() => {
        announce("Timed announcement", "assertive", 1000);
      }).not.toThrow();
    });
  });

  describe("clearAnnouncer function", () => {
    it("exists and can be called", () => {
      expect(typeof clearAnnouncer).toBe("function");

      expect(() => {
        clearAnnouncer("assertive");
      }).not.toThrow();
    });

    it("can clear polite announcements", () => {
      expect(() => {
        clearAnnouncer("polite");
      }).not.toThrow();
    });

    it("can clear all announcements", () => {
      expect(() => {
        clearAnnouncer();
      }).not.toThrow();
    });
  });
});
