/**
 * Tests for createTreeState
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createTreeState, TreeCollection, createTreeCollection } from "../src/tree";
import type {
  TreeItemData,
  TreeStateOptions,
  TreeCollection as ITreeCollection,
} from "../src/tree";

interface TestItem {
  name: string;
}

function createTestItems(): TreeItemData<TestItem>[] {
  return [
    {
      key: "1",
      value: { name: "Item 1" },
      textValue: "Item 1",
      children: [
        { key: "1.1", value: { name: "Item 1.1" }, textValue: "Item 1.1" },
        {
          key: "1.2",
          value: { name: "Item 1.2" },
          textValue: "Item 1.2",
          children: [
            { key: "1.2.1", value: { name: "Item 1.2.1" }, textValue: "Item 1.2.1" },
            { key: "1.2.2", value: { name: "Item 1.2.2" }, textValue: "Item 1.2.2" },
          ],
        },
        { key: "1.3", value: { name: "Item 1.3" }, textValue: "Item 1.3" },
      ],
    },
    {
      key: "2",
      value: { name: "Item 2" },
      textValue: "Item 2",
      children: [{ key: "2.1", value: { name: "Item 2.1" }, textValue: "Item 2.1" }],
    },
    { key: "3", value: { name: "Item 3" }, textValue: "Item 3" },
  ];
}

function createState<T extends object>(
  optionsFn: () => Partial<TreeStateOptions<T, ITreeCollection<T>>>,
  items: TreeItemData<T>[],
) {
  return createTreeState<T, ITreeCollection<T>>(() => ({
    collectionFactory: (expandedKeys: Set<string | number>) =>
      createTreeCollection(items, expandedKeys) as ITreeCollection<T>,
    ...optionsFn(),
  }));
}

describe("createTreeState", () => {
  describe("collection", () => {
    it("should create a tree collection with root items only when nothing is expanded", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.collection.size).toBe(3);
        expect(state.collection.rows.length).toBe(3);

        const keys = [...state.collection.getKeys()];
        expect(keys).toEqual(["1", "2", "3"]);

        dispose();
      });
    });

    it("should include children when parent is expanded", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1"] }), items);

        expect(state.collection.size).toBe(6); // 3 roots + 3 children of '1'

        const keys = [...state.collection.getKeys()];
        expect(keys).toEqual(["1", "1.1", "1.2", "1.3", "2", "3"]);

        dispose();
      });
    });

    it("should include nested children when multiple levels are expanded", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1", "1.2"] }), items);

        expect(state.collection.size).toBe(8); // 3 + 3 + 2

        const keys = [...state.collection.getKeys()];
        expect(keys).toEqual(["1", "1.1", "1.2", "1.2.1", "1.2.2", "1.3", "2", "3"]);

        dispose();
      });
    });
  });

  it("provides prev/next sibling keys", () => {
    createRoot((dispose) => {
      const items = createTestItems();
      const state = createState(() => ({ defaultExpandedKeys: ["1"] }), items);

      expect(state.collection.getKeyAfter("1")).toBe("1.1");
      expect(state.collection.getKeyAfter("1.3")).toBe("2");
      expect(state.collection.getKeyBefore("2")).toBe("1.3");
      expect(state.collection.getKeyBefore("1.1")).toBe("1");

      dispose();
    });
  });

  describe("expansion state", () => {
    it("should start with no expanded keys by default", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.expandedKeys.size).toBe(0);
        expect(state.isExpanded("1")).toBe(false);
        expect(state.isExpanded("2")).toBe(false);

        dispose();
      });
    });

    it("should respect defaultExpandedKeys", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1", "2"] }), items);

        expect(state.expandedKeys.size).toBe(2);
        expect(state.isExpanded("1")).toBe(true);
        expect(state.isExpanded("2")).toBe(true);
        expect(state.isExpanded("3")).toBe(false);

        dispose();
      });
    });

    it("should toggle expansion state", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.isExpanded("1")).toBe(false);
        expect(state.collection.size).toBe(3);

        state.toggleKey("1");

        expect(state.isExpanded("1")).toBe(true);
        expect(state.collection.size).toBe(6);

        state.toggleKey("1");

        expect(state.isExpanded("1")).toBe(false);
        expect(state.collection.size).toBe(3);

        dispose();
      });
    });

    it("should expand a specific key", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.isExpanded("1")).toBe(false);

        state.expandKey("1");
        expect(state.isExpanded("1")).toBe(true);

        // Calling expand again should be a no-op
        state.expandKey("1");
        expect(state.isExpanded("1")).toBe(true);

        dispose();
      });
    });

    it("should collapse a specific key", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1"] }), items);

        expect(state.isExpanded("1")).toBe(true);

        state.collapseKey("1");
        expect(state.isExpanded("1")).toBe(false);

        // Calling collapse again should be a no-op
        state.collapseKey("1");
        expect(state.isExpanded("1")).toBe(false);

        dispose();
      });
    });

    it("should not toggle non-expandable items", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1"] }), items);

        // '1.1' is a leaf node (no children)
        expect(state.isExpanded("1.1")).toBe(false);
        state.toggleKey("1.1");
        expect(state.isExpanded("1.1")).toBe(false);

        dispose();
      });
    });

    it("should call onExpandedChange callback", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const items = createTestItems();
        const state = createState(() => ({ onExpandedChange }), items);

        state.toggleKey("1");

        expect(onExpandedChange).toHaveBeenCalledTimes(1);
        expect(onExpandedChange).toHaveBeenCalledWith(new Set(["1"]));

        dispose();
      });
    });

    it("should support controlled expanded keys", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const items = createTestItems();
        const state = createState(
          () => ({
            expandedKeys: ["1"],
            onExpandedChange,
          }),
          items,
        );

        expect(state.isExpanded("1")).toBe(true);
        expect(state.collection.size).toBe(6);

        // In controlled mode, toggleKey should call onExpandedChange
        // but not actually change the state (since it's controlled)
        state.toggleKey("1");

        expect(onExpandedChange).toHaveBeenCalledWith(new Set());
        // State doesn't change until parent updates expandedKeys

        dispose();
      });
    });

    it("should setExpandedKeys to replace all expanded keys", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ defaultExpandedKeys: ["1"] }), items);

        expect(state.isExpanded("1")).toBe(true);
        expect(state.isExpanded("2")).toBe(false);

        state.setExpandedKeys(new Set(["2"]));

        expect(state.isExpanded("1")).toBe(false);
        expect(state.isExpanded("2")).toBe(true);

        dispose();
      });
    });
  });

  describe("selection state", () => {
    it("should default to no selection", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.selectionMode).toBe("none");
        expect(state.selectedKeys).toEqual(new Set());

        dispose();
      });
    });

    it("should support single selection", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ selectionMode: "single" }), items);

        expect(state.isSelected("1")).toBe(false);

        state.toggleSelection("1");
        expect(state.isSelected("1")).toBe(true);
        expect(state.isSelected("2")).toBe(false);

        // Selecting another item deselects the first
        state.toggleSelection("2");
        expect(state.isSelected("1")).toBe(false);
        expect(state.isSelected("2")).toBe(true);

        dispose();
      });
    });

    it("should support multiple selection", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ selectionMode: "multiple" }), items);

        state.toggleSelection("1");
        state.toggleSelection("2");

        expect(state.isSelected("1")).toBe(true);
        expect(state.isSelected("2")).toBe(true);
        expect(state.isSelected("3")).toBe(false);

        dispose();
      });
    });

    it("should support default selected keys", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(
          () => ({
            selectionMode: "multiple",
            defaultSelectedKeys: ["1", "2"],
          }),
          items,
        );

        expect(state.isSelected("1")).toBe(true);
        expect(state.isSelected("2")).toBe(true);
        expect(state.isSelected("3")).toBe(false);

        dispose();
      });
    });

    it("should call onSelectionChange callback", () => {
      createRoot((dispose) => {
        const onSelectionChange = vi.fn();
        const items = createTestItems();
        const state = createState(
          () => ({
            selectionMode: "single",
            onSelectionChange,
          }),
          items,
        );

        state.toggleSelection("1");

        expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1"]));

        dispose();
      });
    });

    it("should support select all in multiple mode", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ selectionMode: "multiple" }), items);

        state.selectAll();

        expect(state.selectedKeys).toBe("all");
        expect(state.isSelected("1")).toBe(true);
        expect(state.isSelected("2")).toBe(true);
        expect(state.isSelected("3")).toBe(true);

        dispose();
      });
    });

    it("should support clear selection", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(
          () => ({
            selectionMode: "multiple",
            defaultSelectedKeys: ["1", "2"],
          }),
          items,
        );

        expect(state.selectedKeys).toEqual(new Set(["1", "2"]));

        state.clearSelection();

        expect(state.selectedKeys).toEqual(new Set());

        dispose();
      });
    });
  });

  describe("disabled state", () => {
    it("should track disabled keys", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({ disabledKeys: ["1", "2"] }), items);

        expect(state.isDisabled("1")).toBe(true);
        expect(state.isDisabled("2")).toBe(true);
        expect(state.isDisabled("3")).toBe(false);

        dispose();
      });
    });

    it("should not toggle disabled items when disabledBehavior is all", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(
          () => ({
            disabledKeys: ["1"],
            disabledBehavior: "all",
          }),
          items,
        );

        expect(state.isExpanded("1")).toBe(false);

        state.toggleKey("1");

        expect(state.isExpanded("1")).toBe(false);

        dispose();
      });
    });

    it("should not select disabled items in selection mode", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(
          () => ({
            selectionMode: "single",
            disabledKeys: ["1"],
            disabledBehavior: "all",
          }),
          items,
        );

        state.toggleSelection("1");

        expect(state.isSelected("1")).toBe(false);

        dispose();
      });
    });

    it("should not select disabled items even when disabledBehavior is 'selection'", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(
          () => ({
            selectionMode: "single",
            disabledKeys: ["1"],
            disabledBehavior: "selection",
          }),
          items,
        );

        // canSelectItem blocks disabled keys regardless of disabledBehavior, so a
        // 'selection'-disabled key still cannot be toggled, replaced, or extended.
        state.toggleSelection("1");
        expect(state.isSelected("1")).toBe(false);

        state.replaceSelection("1");
        expect(state.isSelected("1")).toBe(false);

        // A non-disabled key is still selectable under 'selection'.
        state.toggleSelection("2");
        expect(state.isSelected("2")).toBe(true);

        dispose();
      });
    });

    it("should expose the resolved disabledBehavior (default 'all')", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        expect(createState(() => ({}), items).disabledBehavior).toBe("all");
        expect(createState(() => ({ disabledBehavior: "selection" }), items).disabledBehavior).toBe(
          "selection",
        );

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focused key", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.focusedKey).toBe(null);

        state.setFocusedKey("1");
        expect(state.focusedKey).toBe("1");

        state.setFocusedKey("2");
        expect(state.focusedKey).toBe("2");

        state.setFocusedKey(null);
        expect(state.focusedKey).toBe(null);

        dispose();
      });
    });

    it("should track focused state", () => {
      createRoot((dispose) => {
        const items = createTestItems();
        const state = createState(() => ({}), items);

        expect(state.isFocused).toBe(false);

        state.setFocused(true);
        expect(state.isFocused).toBe(true);

        state.setFocused(false);
        expect(state.isFocused).toBe(false);

        dispose();
      });
    });
  });

  describe("TreeCollection", () => {
    it("should correctly report node levels", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1", "1.2"]));

      expect(collection.getItem("1")?.level).toBe(0);
      expect(collection.getItem("1.1")?.level).toBe(1);
      expect(collection.getItem("1.2")?.level).toBe(1);
      expect(collection.getItem("1.2.1")?.level).toBe(2);
    });

    it("should correctly report parent keys", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1", "1.2"]));

      expect(collection.getParentKey("1")).toBe(null);
      expect(collection.getParentKey("1.1")).toBe("1");
      expect(collection.getParentKey("1.2.1")).toBe("1.2");
    });

    it("should correctly navigate with getKeyBefore and getKeyAfter", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1"]));

      // With '1' expanded: ['1', '1.1', '1.2', '1.3', '2', '3']
      expect(collection.getKeyBefore("1")).toBe(null);
      expect(collection.getKeyAfter("1")).toBe("1.1");
      expect(collection.getKeyBefore("1.2")).toBe("1.1");
      expect(collection.getKeyAfter("1.3")).toBe("2");
      expect(collection.getKeyAfter("3")).toBe(null);
    });

    it("should get first and last keys", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1"]));

      expect(collection.getFirstKey()).toBe("1");
      expect(collection.getLastKey()).toBe("3");
    });

    it("should get children of a node", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1"]));

      const children = [...collection.getChildren("1")];
      expect(children.map((c) => c.key)).toEqual(["1.1", "1.2", "1.3"]);
    });

    it("should iterate over visible nodes only", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set());

      const allKeys = [...collection].map((n) => n.key);
      expect(allKeys).toEqual(["1", "2", "3"]);
    });

    it("should get item by index", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1"]));

      expect(collection.at(0)?.key).toBe("1");
      expect(collection.at(1)?.key).toBe("1.1");
      expect(collection.at(5)?.key).toBe("3");
      expect(collection.at(6)).toBe(null);
    });

    it("should track expandable and expanded state on nodes", () => {
      const items = createTestItems();
      const collection = new TreeCollection(items, new Set(["1"]));

      const item1 = collection.getItem("1");
      expect(item1?.isExpandable).toBe(true);
      expect(item1?.isExpanded).toBe(true);

      const item11 = collection.getItem("1.1");
      expect(item11?.isExpandable).toBeFalsy(); // undefined or false for leaf nodes
      expect(item11?.isExpanded).toBeFalsy();

      const item2 = collection.getItem("2");
      expect(item2?.isExpandable).toBe(true);
      expect(item2?.isExpanded).toBe(false);
    });
  });
});
