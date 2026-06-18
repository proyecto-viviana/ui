/**
 * Tests for createGridState hook.
 * Based on @react-stately/grid tests.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "solid-js";
import { createGridState, type GridCollection, type GridNode, type Key } from "../src";

// Helper to create a mock grid collection
function createMockCollection<T>(rows: { key: Key; cells: { key: Key }[] }[]): GridCollection<T> {
  const allNodes: GridNode<T>[] = [];
  const rowNodes: GridNode<T>[] = [];
  const columnNodes: GridNode<T>[] = [];

  // Create column nodes (from first row's cells)
  if (rows.length > 0) {
    rows[0].cells.forEach((cell, index) => {
      const columnNode: GridNode<T> = {
        type: "column",
        key: `column-${index}`,
        value: null,
        textValue: `Column ${index}`,
        rendered: null,
        level: 0,
        index,
        parentKey: null,
        hasChildNodes: false,
        childNodes: [],
      };
      columnNodes.push(columnNode);
      allNodes.push(columnNode);
    });
  }

  // Create row and cell nodes
  rows.forEach((row, rowIndex) => {
    const cellNodes: GridNode<T>[] = [];

    row.cells.forEach((cell, cellIndex) => {
      const cellNode: GridNode<T> = {
        type: "cell",
        key: cell.key,
        value: null,
        textValue: String(cell.key),
        rendered: null,
        level: 1,
        index: cellIndex,
        parentKey: row.key,
        hasChildNodes: false,
        childNodes: [],
        column: cellIndex,
      };
      cellNodes.push(cellNode);
      allNodes.push(cellNode);
    });

    const rowNode: GridNode<T> = {
      type: "item",
      key: row.key,
      value: null,
      textValue: String(row.key),
      rendered: null,
      level: 0,
      index: rowIndex,
      parentKey: null,
      hasChildNodes: true,
      childNodes: cellNodes,
    };
    rowNodes.push(rowNode);
    allNodes.push(rowNode);
  });

  const keyMap = new Map<Key, GridNode<T>>();
  allNodes.forEach((node) => keyMap.set(node.key, node));

  return {
    rows: rowNodes,
    columns: columnNodes,
    headerRows: [],
    get rowCount() {
      return rowNodes.length;
    },
    get columnCount() {
      return columnNodes.length;
    },
    get size() {
      return allNodes.length;
    },
    getKeys() {
      return allNodes.map((n) => n.key);
    },
    getItem(key: Key) {
      return keyMap.get(key) ?? null;
    },
    at(index: number) {
      return allNodes[index] ?? null;
    },
    getKeyBefore(key: Key) {
      const node = keyMap.get(key);
      if (!node) return null;
      const idx = allNodes.indexOf(node);
      return idx > 0 ? allNodes[idx - 1].key : null;
    },
    getKeyAfter(key: Key) {
      const node = keyMap.get(key);
      if (!node) return null;
      const idx = allNodes.indexOf(node);
      return idx < allNodes.length - 1 ? allNodes[idx + 1].key : null;
    },
    getFirstKey() {
      return allNodes[0]?.key ?? null;
    },
    getLastKey() {
      return allNodes[allNodes.length - 1]?.key ?? null;
    },
    getChildren(key: Key) {
      const node = keyMap.get(key);
      return node?.childNodes ?? [];
    },
    getTextValue(key: Key) {
      return keyMap.get(key)?.textValue ?? "";
    },
    getCell(rowKey: Key, columnKey: Key) {
      const row = keyMap.get(rowKey);
      if (!row || row.type !== "item") return null;
      const colIndex = columnNodes.findIndex((c) => c.key === columnKey);
      return row.childNodes[colIndex] ?? null;
    },
    [Symbol.iterator]() {
      return allNodes[Symbol.iterator]();
    },
  };
}

describe("createGridState", () => {
  // ============================================
  // BASIC STATE
  // ============================================

  describe("basic state", () => {
    it("should return the collection", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.collection).toBe(collection);
        dispose();
      });
    });

    it("should have empty disabled keys by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.disabledKeys.size).toBe(0);
        dispose();
      });
    });

    it("should track disabled keys", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          disabledKeys: ["row1"],
        }));

        expect(state.disabledKeys.has("row1")).toBe(true);
        expect(state.disabledKeys.has("row2")).toBe(false);
        expect(state.isDisabled("row1")).toBe(true);
        expect(state.isDisabled("row2")).toBe(false);
        dispose();
      });
    });

    it("should have keyboard navigation enabled by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.isKeyboardNavigationDisabled).toBe(false);
        dispose();
      });
    });

    it("should allow disabling keyboard navigation", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        state.setKeyboardNavigationDisabled(true);
        expect(state.isKeyboardNavigationDisabled).toBe(true);

        state.setKeyboardNavigationDisabled(false);
        expect(state.isKeyboardNavigationDisabled).toBe(false);
        dispose();
      });
    });
  });

  // ============================================
  // FOCUS STATE
  // ============================================

  describe("focus state", () => {
    it("should have no focused key by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.focusedKey).toBe(null);
        dispose();
      });
    });

    it("should not be focused by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.isFocused).toBe(false);
        dispose();
      });
    });

    it("should allow setting focused key", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({ collection }));

        state.setFocusedKey("row1");
        expect(state.focusedKey).toBe("row1");

        state.setFocusedKey("row2");
        expect(state.focusedKey).toBe("row2");
        dispose();
      });
    });

    it("should allow setting focused state", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        state.setFocused(true);
        expect(state.isFocused).toBe(true);

        state.setFocused(false);
        expect(state.isFocused).toBe(false);
        dispose();
      });
    });

    it("should track child focus strategy", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        state.setFocusedKey("row1", "first");
        expect(state.childFocusStrategy).toBe("first");

        state.setFocusedKey("row1", "last");
        expect(state.childFocusStrategy).toBe("last");
        dispose();
      });
    });

    it("should focus first cell in cell focus mode", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1a" }, { key: "cell1b" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          focusMode: "cell",
        }));

        state.setFocusedKey("row1", "first");
        expect(state.focusedKey).toBe("cell1a");
        dispose();
      });
    });

    it("should focus last cell in cell focus mode with last strategy", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1a" }, { key: "cell1b" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          focusMode: "cell",
        }));

        state.setFocusedKey("row1", "last");
        expect(state.focusedKey).toBe("cell1b");
        dispose();
      });
    });
  });

  // ============================================
  // SELECTION STATE
  // ============================================

  describe("selection state", () => {
    it("should have selection mode none by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.selectionMode).toBe("none");
        dispose();
      });
    });

    it("should have empty selection by default", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        expect(state.selectedKeys).toEqual(new Set());
        expect(state.isSelected("row1")).toBe(false);
        dispose();
      });
    });

    it("should support default selected keys", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          defaultSelectedKeys: ["row1"],
        }));

        expect(state.isSelected("row1")).toBe(true);
        expect(state.isSelected("row2")).toBe(false);
        dispose();
      });
    });

    it("should support controlled selected keys", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          selectedKeys: ["row2"],
        }));

        expect(state.isSelected("row1")).toBe(false);
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });

    it("should toggle selection", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(true);

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(false);
        dispose();
      });
    });

    it("should replace selection", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          defaultSelectedKeys: ["row1"],
        }));

        state.replaceSelection("row2");
        expect(state.isSelected("row1")).toBe(false);
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });

    it("should select all", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.selectAll();
        expect(state.selectedKeys).toBe("all");
        expect(state.isSelected("row1")).toBe(true);
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });

    it("should clear selection", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          defaultSelectedKeys: ["row1"],
        }));

        state.clearSelection();
        expect(state.isSelected("row1")).toBe(false);
        dispose();
      });
    });

    it("should toggle select all", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.toggleSelectAll();
        expect(state.selectedKeys).toBe("all");

        state.toggleSelectAll();
        expect(state.selectedKeys).toEqual(new Set());
        dispose();
      });
    });

    it("should not allow selection in none mode", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "none",
        }));

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(false);
        dispose();
      });
    });

    it("should only allow single selection in single mode", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "single",
        }));

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(true);

        state.toggleSelection("row2");
        expect(state.isSelected("row1")).toBe(false);
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });

    it("should not select disabled keys", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          disabledKeys: ["row1"],
        }));

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(false);
        dispose();
      });
    });

    it("should call onSelectionChange", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const onSelectionChange = vi.fn();
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          onSelectionChange,
        }));

        state.toggleSelection("row1");
        expect(onSelectionChange).toHaveBeenCalledWith(new Set(["row1"]));
        dispose();
      });
    });
  });

  // ============================================
  // DISABLED BEHAVIOR
  // ============================================

  describe("disabled behavior", () => {
    it("should default disabledBehavior to 'all'", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({ collection }));

        expect(state.disabledBehavior).toBe("all");
        dispose();
      });
    });

    it("should expose the configured disabledBehavior", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          disabledBehavior: "selection",
        }));

        expect(state.disabledBehavior).toBe("selection");
        dispose();
      });
    });

    it("should never select disabled keys, even under disabledBehavior 'selection'", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          disabledBehavior: "selection",
          disabledKeys: ["row1"],
        }));

        // Disabled keys are never selectable, mirroring
        // SelectionManager.canSelectItem, which ignores disabledBehavior.
        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(false);

        state.replaceSelection("row1");
        expect(state.isSelected("row1")).toBe(false);

        // A non-disabled key is still selectable.
        state.toggleSelection("row2");
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });
  });

  // ============================================
  // EXTEND SELECTION
  // ============================================

  describe("extend selection", () => {
    it("should extend selection to include range", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
          { key: "row3", cells: [{ key: "cell3" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        // Select first row to set anchor
        state.toggleSelection("row1");

        // Extend to row3
        state.extendSelection("row3");

        expect(state.isSelected("row1")).toBe(true);
        expect(state.isSelected("row2")).toBe(true);
        expect(state.isSelected("row3")).toBe(true);
        dispose();
      });
    });

    it("should replace selection if no anchor", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([
          { key: "row1", cells: [{ key: "cell1" }] },
          { key: "row2", cells: [{ key: "cell2" }] },
        ]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.extendSelection("row2");
        expect(state.isSelected("row1")).toBe(false);
        expect(state.isSelected("row2")).toBe(true);
        dispose();
      });
    });
  });

  // ============================================
  // DISALLOW EMPTY SELECTION
  // ============================================

  describe("disallow empty selection", () => {
    it("should not allow clearing selection when disallowed", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "single",
          defaultSelectedKeys: ["row1"],
          disallowEmptySelection: true,
        }));

        state.toggleSelection("row1");
        expect(state.isSelected("row1")).toBe(true);
        dispose();
      });
    });

    it("should not allow clear selection when disallowed", () => {
      createRoot((dispose) => {
        const collection = createMockCollection([{ key: "row1", cells: [{ key: "cell1" }] }]);
        const state = createGridState(() => ({
          collection,
          selectionMode: "multiple",
          defaultSelectedKeys: ["row1"],
          disallowEmptySelection: true,
        }));

        state.clearSelection();
        expect(state.isSelected("row1")).toBe(true);
        dispose();
      });
    });
  });
});
