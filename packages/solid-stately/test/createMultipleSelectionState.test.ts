/**
 * Tests for createMultipleSelectionState and selectionBehavior state transitions.
 *
 * Verifies selectionBehavior rules across the selection engine and adapters:
 * - defaulting to toggle
 * - initializing to replace
 * - dynamic transition to toggle (e.g. touch long press via setSelectionBehavior)
 * - resetting back to replace when selection becomes empty
 * - maintaining toggle when selection is not empty or "all"
 * - not resetting when selectionBehavior prop is toggle
 * - synchronizing when selectionBehavior prop changes
 *
 * Covers:
 * - createMultipleSelectionState
 * - SelectionManager
 * - createListState
 * - createGridState
 * - createTreeState
 * - createTableState
 */

import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import { createSignal } from "./owned-signal";
import { createMultipleSelectionState } from "../src/selection/createMultipleSelectionState";
import { Selection } from "../src/selection/Selection";
import { SelectionManager } from "../src/selection/SelectionManager";
import { ListCollection } from "../src/collections/ListCollection";
import { createListState } from "../src/collections/createListState";
import { createGridState, type GridCollection, type GridNode, type Key } from "../src";
import {
  createTreeState,
  createTreeCollection,
  type TreeItemData,
  type TreeCollection,
} from "../src/tree";
import { createTableState, createTableCollection } from "../src/table";

describe("createMultipleSelectionState — selectionBehavior", () => {
  it("defaults selectionBehavior to toggle when prop is omitted", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({});
      expect(state.selectionBehavior).toBe("toggle");
      dispose();
    });
  });

  it("initializes selectionBehavior to replace when prop is replace", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "replace",
      });
      expect(state.selectionBehavior).toBe("replace");
      dispose();
    });
  });

  it("allows setting selectionBehavior to toggle from replace", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["a"]),
      });
      expect(state.selectionBehavior).toBe("replace");

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");
      dispose();
    });
  });

  it("resets selectionBehavior back to replace when selection becomes empty", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["a"]),
      });
      expect(state.selectionBehavior).toBe("replace");

      // Enter toggle mode (e.g. touch long press)
      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      // Deselect all items -> becomes empty
      state.setSelectedKeys(new Selection());
      flush();
      expect(state.selectedKeys.size).toBe(0);
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });

  it("keeps selectionBehavior as toggle if selection is non-empty", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["a"]),
      });

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      // Select another item -> non-empty
      state.setSelectedKeys(new Selection(["b"]));
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      dispose();
    });
  });

  it("does not reset selectionBehavior when selection is 'all'", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["a"]),
      });

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      state.setSelectedKeys("all" as unknown as Selection);
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      dispose();
    });
  });

  it("does not reset selectionBehavior when selectionBehavior prop is toggle", () => {
    createRoot((dispose) => {
      const state = createMultipleSelectionState({
        selectionBehavior: "toggle",
        defaultSelectedKeys: new Set(["a"]),
      });
      expect(state.selectionBehavior).toBe("toggle");

      state.setSelectedKeys(new Selection());
      flush();
      expect(state.selectedKeys.size).toBe(0);
      expect(state.selectionBehavior).toBe("toggle");

      dispose();
    });
  });

  it("syncs internal state when selectionBehavior prop changes dynamically", () => {
    createRoot((dispose) => {
      const [behavior, setBehavior] = createSignal<"replace" | "toggle">("replace");
      const state = createMultipleSelectionState({
        get selectionBehavior() {
          return behavior();
        },
      });

      expect(state.selectionBehavior).toBe("replace");

      setBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      setBehavior("replace");
      flush();
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });
});

describe("createMultipleSelectionState — standard accessor", () => {
  it("reads selectionMode from a standard accessor and leaves onSelectionChange a field", () => {
    const onSelectionChange = vi.fn();
    const [mode, setMode] = createSignal<"single" | "multiple">("single");
    let dispose!: () => void;
    let state!: ReturnType<typeof createMultipleSelectionState>;

    createRoot((done) => {
      dispose = done;
      state = createMultipleSelectionState(() => ({
        selectionMode: mode(),
        onSelectionChange,
      }));
    });

    expect(state.selectionMode).toBe("single");
    expect(onSelectionChange).not.toHaveBeenCalled();

    setMode("multiple");
    flush();
    expect(state.selectionMode).toBe("multiple");

    state.setSelectedKeys(new Selection(["a"]));
    flush();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(state.selectedKeys.has("a")).toBe(true);
    dispose();
  });
});

describe("SelectionManager — selectionBehavior", () => {
  function createManager(options: { selectionBehavior?: "replace" | "toggle" } = {}) {
    const items = [{ key: "a" }, { key: "b" }];
    const collection = new ListCollection(items);
    const rawState = createMultipleSelectionState({
      selectionBehavior: options.selectionBehavior ?? "replace",
      defaultSelectedKeys: new Set(["a"]),
      selectionMode: "multiple",
    });
    return {
      manager: new SelectionManager(() => collection, rawState),
      rawState,
    };
  }

  it("exposes selectionBehavior from underlying state", () => {
    createRoot((dispose) => {
      const { manager } = createManager({ selectionBehavior: "replace" });
      expect(manager.selectionBehavior).toBe("replace");
      dispose();
    });
  });

  it("allows setting selectionBehavior to toggle via manager", () => {
    createRoot((dispose) => {
      const { manager } = createManager({ selectionBehavior: "replace" });
      manager.setSelectionBehavior("toggle");
      flush();
      expect(manager.selectionBehavior).toBe("toggle");
      dispose();
    });
  });

  it("resets selectionBehavior to replace when clearing selection via manager", () => {
    createRoot((dispose) => {
      const { manager } = createManager({ selectionBehavior: "replace" });
      manager.setSelectionBehavior("toggle");
      flush();
      expect(manager.selectionBehavior).toBe("toggle");

      manager.clearSelection();
      flush();
      expect(manager.isEmpty).toBe(true);
      expect(manager.selectionBehavior).toBe("replace");
      dispose();
    });
  });
});

describe("createListState — selectionBehavior", () => {
  const items = [{ key: "a" }, { key: "b" }];

  it("initializes selectionBehavior to replace when configured", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        selectionMode: "multiple",
        selectionBehavior: "replace",
      });
      expect(state.selectionBehavior()).toBe("replace");
      expect(state.selectionManager.selectionBehavior).toBe("replace");
      dispose();
    });
  });

  it("switches selectionBehavior to toggle via state or selectionManager", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: ["a"],
      });
      expect(state.selectionBehavior()).toBe("replace");

      state.selectionManager.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior()).toBe("toggle");
      expect(state.selectionManager.selectionBehavior).toBe("toggle");

      // Reset on empty
      state.clearSelection();
      flush();
      expect(state.selectionBehavior()).toBe("replace");
      expect(state.selectionManager.selectionBehavior).toBe("replace");
      dispose();
    });
  });

  it("syncs selectionBehavior when prop changes dynamically", () => {
    createRoot((dispose) => {
      const [behavior, setBehavior] = createSignal<"replace" | "toggle">("replace");
      const state = createListState({
        items,
        selectionMode: "multiple",
        get selectionBehavior() {
          return behavior();
        },
      });

      expect(state.selectionBehavior()).toBe("replace");

      setBehavior("toggle");
      flush();
      expect(state.selectionBehavior()).toBe("toggle");

      setBehavior("replace");
      flush();
      expect(state.selectionBehavior()).toBe("replace");
      dispose();
    });
  });
});

describe("createGridState — selectionBehavior", () => {
  function createMockGridCollection(): GridCollection<object> {
    const rowNode: GridNode<object> = {
      type: "item",
      key: "row-1",
      value: null,
      textValue: "row-1",
      rendered: null,
      level: 0,
      index: 0,
      parentKey: null,
      hasChildNodes: false,
      childNodes: [],
    };
    return {
      rows: [rowNode],
      columns: [],
      headerRows: [],
      rowCount: 1,
      columnCount: 0,
      size: 1,
      getKeys: () => ["row-1"],
      getItem: (key: Key) => (key === "row-1" ? rowNode : null),
      at: (index: number) => (index === 0 ? rowNode : null),
      getKeyBefore: () => null,
      getKeyAfter: () => null,
      getFirstKey: () => "row-1",
      getLastKey: () => "row-1",
      getChildren: () => [],
      getTextValue: () => "row-1",
    };
  }

  it("initializes selectionBehavior to replace and switches to toggle", () => {
    createRoot((dispose) => {
      const collection = createMockGridCollection();
      const state = createGridState(() => ({
        collection,
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["row-1"]),
      }));

      expect(state.selectionBehavior).toBe("replace");

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      state.clearSelection();
      flush();
      expect(state.isEmpty).toBe(true);
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });

  it("syncs selectionBehavior when prop changes dynamically", () => {
    createRoot((dispose) => {
      const [behavior, setBehavior] = createSignal<"replace" | "toggle">("replace");
      const collection = createMockGridCollection();
      const state = createGridState(() => ({
        collection,
        selectionMode: "multiple",
        selectionBehavior: behavior(),
      }));

      expect(state.selectionBehavior).toBe("replace");

      setBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      setBehavior("replace");
      flush();
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });
});

describe("createTreeState — selectionBehavior", () => {
  interface TreeItem {
    name: string;
  }
  const treeItems: TreeItemData<TreeItem>[] = [
    { key: "1", value: { name: "Item 1" }, textValue: "Item 1" },
    { key: "2", value: { name: "Item 2" }, textValue: "Item 2" },
  ];

  it("initializes selectionBehavior to replace and switches to toggle", () => {
    createRoot((dispose) => {
      const state = createTreeState<TreeItem, TreeCollection<TreeItem>>(() => ({
        collectionFactory: (expandedKeys: Set<Key>) =>
          createTreeCollection(treeItems, expandedKeys) as TreeCollection<TreeItem>,
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["1"]),
      }));

      expect(state.selectionBehavior).toBe("replace");

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      state.clearSelection();
      flush();
      expect(state.selectedKeys.size).toBe(0);
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });

  it("syncs selectionBehavior when prop changes dynamically", () => {
    createRoot((dispose) => {
      const [behavior, setBehavior] = createSignal<"replace" | "toggle">("replace");
      const state = createTreeState<TreeItem, TreeCollection<TreeItem>>(() => ({
        collectionFactory: (expandedKeys: Set<Key>) =>
          createTreeCollection(treeItems, expandedKeys) as TreeCollection<TreeItem>,
        selectionMode: "multiple",
        selectionBehavior: behavior(),
      }));

      expect(state.selectionBehavior).toBe("replace");

      setBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      setBehavior("replace");
      flush();
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });
});

describe("createTableState — selectionBehavior", () => {
  interface RowItem {
    id: string;
    name: string;
  }
  const columns = [{ key: "name", name: "Name" }];
  const rows: RowItem[] = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  it("initializes selectionBehavior to replace and switches to toggle", () => {
    createRoot((dispose) => {
      const collection = createTableCollection({
        columns,
        rows,
        getKey: (item) => item.id,
      });

      const state = createTableState(() => ({
        collection,
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: new Set(["1"]),
      }));

      expect(state.selectionBehavior).toBe("replace");

      state.setSelectionBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      state.clearSelection();
      flush();
      expect(state.isEmpty).toBe(true);
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });

  it("syncs selectionBehavior when prop changes dynamically", () => {
    createRoot((dispose) => {
      const [behavior, setBehavior] = createSignal<"replace" | "toggle">("replace");
      const collection = createTableCollection({
        columns,
        rows,
        getKey: (item) => item.id,
      });

      const state = createTableState(() => ({
        collection,
        selectionMode: "multiple",
        selectionBehavior: behavior(),
      }));

      expect(state.selectionBehavior).toBe("replace");

      setBehavior("toggle");
      flush();
      expect(state.selectionBehavior).toBe("toggle");

      setBehavior("replace");
      flush();
      expect(state.selectionBehavior).toBe("replace");

      dispose();
    });
  });
});
