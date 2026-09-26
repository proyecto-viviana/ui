/**
 * Tests for createTableColumnResizeState fractional table width and sizing behavior.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot, createSignal, flush } from "solid-js";
import { createTableColumnResizeState } from "../src/table/createTableColumnResizeState";

describe("createTableColumnResizeState", () => {
  it("keeps columns flush with a fractional table width matching upstream", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 1000.5,
        columns: [
          { key: "name", width: "1fr" },
          { key: "type", width: "1fr" },
        ],
      }));

      expect(state.getColumnWidth("name")).toBe(500);
      expect(state.getColumnWidth("type")).toBe(500.5);
      expect(state.getColumnWidth("name") + state.getColumnWidth("type")).toBe(1000.5);
      dispose();
    });
  });

  it("handles js fp rounding errors matching upstream", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 1000.7,
        columns: [
          { key: "name", width: "1fr" },
          { key: "type", width: "1fr" },
        ],
      }));

      expect(state.getColumnWidth("name")).toBe(500);
      expect(state.getColumnWidth("type")).toBe(500.7);
      expect(state.getColumnWidth("name") + state.getColumnWidth("type")).toBe(1000.7);
      dispose();
    });
  });

  it("distributes integer widths with cascading rounding to eliminate rounding gap", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 800,
        columns: [{ key: "c1" }, { key: "c2" }, { key: "c3" }],
      }));

      const w1 = state.getColumnWidth("c1");
      const w2 = state.getColumnWidth("c2");
      const w3 = state.getColumnWidth("c3");

      expect([w1, w2, w3]).toStrictEqual([267, 266, 267]);
      expect(w1 + w2 + w3).toBe(800);
      dispose();
    });
  });

  it("distributes fractional table width across three columns and preserves exact sum", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 1000.5,
        columns: [{ key: "c1" }, { key: "c2" }, { key: "c3" }],
      }));

      const w1 = state.getColumnWidth("c1");
      const w2 = state.getColumnWidth("c2");
      const w3 = state.getColumnWidth("c3");

      expect([w1, w2, w3]).toStrictEqual([333, 334, 333.5]);
      expect(w1 + w2 + w3).toBe(1000.5);
      dispose();
    });
  });

  it("handles percentage widths with fractional table width", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 1000.5,
        columns: [
          { key: "c1", width: "25%" },
          { key: "c2", width: "75%" },
        ],
      }));

      const w1 = state.getColumnWidth("c1");
      const w2 = state.getColumnWidth("c2");

      expect(w1).toBe(250);
      expect(w2).toBe(750.5);
      expect(w1 + w2).toBe(1000.5);
      dispose();
    });
  });

  it("floors resized width and preserves sub-pixel remainder on the last column", () => {
    createRoot((dispose) => {
      const state = createTableColumnResizeState(() => ({
        tableWidth: 1000.5,
        columns: [
          { key: "c1", width: "1fr", minWidth: 100, maxWidth: 600 },
          { key: "c2", width: "1fr", minWidth: 100, maxWidth: 600 },
        ],
      }));

      // Resizing c1 floors the requested width
      const updated = state.updateResizedColumns("c1", 420.8);
      flush();
      expect(updated.get("c1")).toBe(420);
      expect(state.getColumnWidth("c1")).toBe(420);
      expect(state.getColumnWidth("c2")).toBe(500.5);

      // Resizing last column gives it the remainder
      const updatedLast = state.updateResizedColumns("c2", 350.2);
      flush();
      expect(updatedLast.get("c2")).toBe(350.5);
      expect(state.getColumnWidth("c2")).toBe(350.5);

      dispose();
    });
  });

  it("updates reactively when tableWidth changes between integer and fractional values", () => {
    createRoot((dispose) => {
      const [width, setWidth] = createSignal(1000, { ownedWrite: true });
      const state = createTableColumnResizeState(() => ({
        tableWidth: width(),
        columns: [
          { key: "col1", width: "1fr" },
          { key: "col2", width: "1fr" },
        ],
      }));

      expect(state.getColumnWidth("col1")).toBe(500);
      expect(state.getColumnWidth("col2")).toBe(500);

      // Switch to fractional width
      setWidth(1000.25);
      flush();
      expect(state.getColumnWidth("col1")).toBe(500);
      expect(state.getColumnWidth("col2")).toBe(500.25);
      expect(state.getColumnWidth("col1") + state.getColumnWidth("col2")).toBe(1000.25);

      // Switch back to integer width
      setWidth(600);
      flush();
      expect(state.getColumnWidth("col1")).toBe(300);
      expect(state.getColumnWidth("col2")).toBe(300);
      expect(state.getColumnWidth("col1") + state.getColumnWidth("col2")).toBe(600);

      dispose();
    });
  });
});
