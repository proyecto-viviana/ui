/**
 * Tests for collection state management
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import {
  ListCollection,
  createListCollection,
  createListState,
  createSelectionState,
  useMultipleSelectionState,
  useMenuTriggerState,
  createMenuState,
  createMenuTriggerState,
} from "../src";

// ============================================
// ListCollection tests
// ============================================
describe("ListCollection", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  it("creates a collection from items", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
      getTextValue: (item) => item.label,
    });

    expect(collection.size).toBe(3);
  });

  it("can get item by key", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
      getTextValue: (item) => item.label,
    });

    const item = collection.getItem("b");
    expect(item).not.toBeNull();
    expect(item?.value).toEqual({ key: "b", label: "Banana" });
  });

  it("can get first and last keys", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
    });

    expect(collection.getFirstKey()).toBe("a");
    expect(collection.getLastKey()).toBe("c");
  });

  it("can get key before and after", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
    });

    expect(collection.getKeyAfter("a")).toBe("b");
    expect(collection.getKeyAfter("b")).toBe("c");
    expect(collection.getKeyAfter("c")).toBeNull();

    expect(collection.getKeyBefore("c")).toBe("b");
    expect(collection.getKeyBefore("b")).toBe("a");
    expect(collection.getKeyBefore("a")).toBeNull();
  });

  it("can iterate over items", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
    });

    const keys: string[] = [];
    for (const item of collection) {
      keys.push(item.key as string);
    }

    expect(keys).toEqual(["a", "b", "c"]);
  });

  it("can get text value", () => {
    const collection = createListCollection(items, {
      getKey: (item) => item.key,
      getTextValue: (item) => item.label,
    });

    expect(collection.getTextValue("a")).toBe("Apple");
    expect(collection.getTextValue("b")).toBe("Banana");
  });

  it("uses index as default key", () => {
    const simpleItems = ["Apple", "Banana", "Cherry"];
    const collection = createListCollection(simpleItems);

    expect(collection.getFirstKey()).toBe(0);
    expect(collection.getLastKey()).toBe(2);
  });
});

// ============================================
// createSelectionState tests
// ============================================
describe("createSelectionState", () => {
  it("starts with no selection by default", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "single",
      });

      expect(state.selectedKeys().size).toBe(0);
      dispose();
    });
  });

  it("supports default selected keys", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "single",
        defaultSelectedKeys: ["a"],
      });

      expect(state.selectedKeys().has("a")).toBe(true);
      dispose();
    });
  });

  it("can toggle selection in single mode", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "single",
      });

      state.toggleSelection("a");
      expect(state.selectedKeys().has("a")).toBe(true);

      state.toggleSelection("a");
      expect(state.selectedKeys().has("a")).toBe(false);
      dispose();
    });
  });

  it("replaces selection in single mode", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "single",
      });

      state.replaceSelection("a");
      expect(state.selectedKeys().has("a")).toBe(true);

      state.replaceSelection("b");
      expect(state.selectedKeys().has("a")).toBe(false);
      expect(state.selectedKeys().has("b")).toBe(true);
      dispose();
    });
  });

  it("can select multiple in multiple mode", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "multiple",
      });

      state.toggleSelection("a");
      state.toggleSelection("b");

      expect(state.selectedKeys().has("a")).toBe(true);
      expect(state.selectedKeys().has("b")).toBe(true);
      expect(state.selectedKeys().size).toBe(2);
      dispose();
    });
  });

  it("can clear selection", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "multiple",
      });

      state.toggleSelection("a");
      state.toggleSelection("b");
      state.clearSelection();

      expect(state.selectedKeys().size).toBe(0);
      dispose();
    });
  });

  it("respects disallowEmptySelection", () => {
    createRoot((dispose) => {
      const state = createSelectionState({
        selectionMode: "single",
        disallowEmptySelection: true,
        defaultSelectedKeys: ["a"],
      });

      state.toggleSelection("a");
      // Should not deselect when disallowEmptySelection is true
      expect(state.selectedKeys().has("a")).toBe(true);
      dispose();
    });
  });

  it("calls onSelectionChange", () => {
    createRoot((dispose) => {
      const onSelectionChange = vi.fn();
      const state = createSelectionState({
        selectionMode: "single",
        onSelectionChange,
      });

      state.toggleSelection("a");
      expect(onSelectionChange).toHaveBeenCalled();
      dispose();
    });
  });
});

describe("selection module compatibility aliases", () => {
  it("useMultipleSelectionState maps to createSelectionState behavior", () => {
    createRoot((dispose) => {
      const state = useMultipleSelectionState({
        selectionMode: "multiple",
        defaultSelectedKeys: ["a"],
      });

      expect(state.selectedKeys().has("a")).toBe(true);
      state.toggleSelection("b");
      expect(state.selectedKeys().has("b")).toBe(true);
      dispose();
    });
  });
});

// ============================================
// createListState tests
// ============================================
describe("createListState", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  it("creates a list state with collection", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
      });

      expect(state.collection().size).toBe(3);
      dispose();
    });
  });

  it("tracks focused key", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
      });

      expect(state.focusedKey()).toBeNull();

      state.setFocusedKey("b");
      expect(state.focusedKey()).toBe("b");
      dispose();
    });
  });

  it("can check if key is selected", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        defaultSelectedKeys: ["a"],
      });

      expect(state.isSelected("a")).toBe(true);
      expect(state.isSelected("b")).toBe(false);
      dispose();
    });
  });

  it("can check if key is disabled", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        disabledKeys: ["b"],
      });

      expect(state.isDisabled("a")).toBe(false);
      expect(state.isDisabled("b")).toBe(true);
      dispose();
    });
  });

  it("can select items", () => {
    createRoot((dispose) => {
      const state = createListState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
      });

      state.select("a");
      expect(state.isSelected("a")).toBe(true);
      dispose();
    });
  });
});

// ============================================
// createMenuState tests
// ============================================
describe("createMenuState", () => {
  const items = [
    { key: "copy", label: "Copy" },
    { key: "paste", label: "Paste" },
    { key: "delete", label: "Delete" },
  ];

  it("creates menu state", () => {
    createRoot((dispose) => {
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      expect(state.collection().size).toBe(3);
      dispose();
    });
  });

  it("defaults to action-only selection mode", () => {
    createRoot((dispose) => {
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        defaultSelectedKeys: ["copy"],
      });

      expect(state.selectionMode()).toBe("none");
      state.select("paste");
      expect(state.isSelected("copy")).toBe(false);
      expect(state.isSelected("paste")).toBe(false);
      dispose();
    });
  });

  it("supports opt-in menu selection", () => {
    createRoot((dispose) => {
      const onSelectionChange = vi.fn();
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "multiple",
        defaultSelectedKeys: ["copy"],
        onSelectionChange,
      });

      state.select("paste");

      expect(state.selectionMode()).toBe("multiple");
      expect(state.isSelected("copy")).toBe(true);
      expect(state.isSelected("paste")).toBe(true);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set(["copy", "paste"]));
      dispose();
    });
  });

  it("calls onClose when close is called", () => {
    createRoot((dispose) => {
      const onClose = vi.fn();
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        onClose,
      });

      state.close();
      expect(onClose).toHaveBeenCalled();
      dispose();
    });
  });
});

// ============================================
// createMenuTriggerState tests
// ============================================
describe("createMenuTriggerState", () => {
  it("starts closed by default", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("can open and close", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();

      state.open();
      expect(state.isOpen()).toBe(true);

      state.close();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("can toggle", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();

      state.toggle();
      expect(state.isOpen()).toBe(true);

      state.toggle();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("calls onOpenChange", () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn();
      const state = createMenuTriggerState({ onOpenChange });

      state.open();
      expect(onOpenChange).toHaveBeenCalledWith(true);

      state.close();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      dispose();
    });
  });
});

describe("menu module compatibility aliases", () => {
  it("useMenuTriggerState maps to menu trigger state behavior", () => {
    createRoot((dispose) => {
      const state = useMenuTriggerState();
      expect(state.isOpen()).toBe(false);
      state.open();
      expect(state.isOpen()).toBe(true);
      state.close();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });
});
