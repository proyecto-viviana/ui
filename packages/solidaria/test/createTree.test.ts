/**
 * Tests for createTree, createTreeItem, createTreeSelectionCheckbox
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createTree, createTreeItem, createTreeSelectionCheckbox, getTreeData } from "../src/tree";
import {
  createTreeState,
  createTreeCollection,
  type TreeState,
  type TreeItemData,
  type TreeCollection,
} from "@proyecto-viviana/solid-stately";

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
          children: [{ key: "1.2.1", value: { name: "Item 1.2.1" }, textValue: "Item 1.2.1" }],
        },
      ],
    },
    {
      key: "2",
      value: { name: "Item 2" },
      textValue: "Item 2",
    },
  ];
}

function createState(
  options: {
    expandedKeys?: Iterable<string | number>;
    defaultExpandedKeys?: Iterable<string | number>;
    selectionMode?: "none" | "single" | "multiple";
    disabledKeys?: Iterable<string | number>;
    disabledBehavior?: "selection" | "all";
  } = {},
): TreeState<TestItem, TreeCollection<TestItem>> {
  const items = createTestItems();
  return createTreeState<TestItem, TreeCollection<TestItem>>(() => ({
    collectionFactory: (expandedKeys) => createTreeCollection(items, expandedKeys),
    ...options,
  }));
}

describe("createTree", () => {
  it("should return treeProps with correct role", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({ "aria-label": "Test Tree" }),
        () => state,
        ref,
      );

      expect(treeProps.role).toBe("treegrid");
      expect(treeProps["aria-label"]).toBe("Test Tree");

      dispose();
    });
  });

  it("should have tabIndex 0 when not disabled", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      expect(treeProps.tabIndex).toBe(0);

      dispose();
    });
  });

  it("should not have tabIndex when disabled", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({ isDisabled: true }),
        () => state,
        ref,
      );

      expect(treeProps.tabIndex).toBeUndefined();
      expect(treeProps["aria-disabled"]).toBe(true);

      dispose();
    });
  });

  it("should have aria-multiselectable when selection mode is multiple", () => {
    createRoot((dispose) => {
      const state = createState({ selectionMode: "multiple" });
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      expect(treeProps["aria-multiselectable"]).toBe(true);

      dispose();
    });
  });

  it("should store tree data accessible via getTreeData", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      createTree(
        () => ({ onAction }),
        () => state,
        ref,
      );

      const treeData = getTreeData(state);
      expect(treeData).toBeDefined();
      expect(treeData?.actions.onAction).toBe(onAction);

      dispose();
    });
  });

  it("toggles selection with Space from focused tree container", () => {
    createRoot((dispose) => {
      const state = createState({ selectionMode: "multiple" });
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      (treeProps.onFocus as ((e: FocusEvent) => void) | undefined)?.({} as FocusEvent);

      expect(state.isSelected("1")).toBe(false);

      const preventDefault = vi.fn();
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: " ",
        preventDefault,
      } as unknown as KeyboardEvent);

      expect(preventDefault).toHaveBeenCalled();
      expect(state.isSelected("1")).toBe(true);

      dispose();
    });
  });

  it("calls onAction with Enter from focused tree container", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({ onAction }),
        () => state,
        ref,
      );

      (treeProps.onFocus as ((e: FocusEvent) => void) | undefined)?.({} as FocusEvent);

      const preventDefault = vi.fn();
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: "Enter",
        preventDefault,
      } as unknown as KeyboardEvent);

      expect(preventDefault).toHaveBeenCalled();
      expect(onAction).toHaveBeenCalledWith("1");

      dispose();
    });
  });
});

describe("createTreeItem", () => {
  it("should return rowProps with correct role", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { rowProps } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(rowProps.role).toBe("row");

      dispose();
    });
  });

  it("should return gridCellProps with correct role", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { gridCellProps } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(gridCellProps.role).toBe("gridcell");

      dispose();
    });
  });

  it("should have aria-expanded for expandable items", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { rowProps, isExpanded, isExpandable } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(rowProps["aria-expanded"]).toBe(true);
      expect(isExpanded).toBe(true);
      expect(isExpandable).toBe(true);

      dispose();
    });
  });

  it("should not have aria-expanded for leaf items", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("2")!;

      const { rowProps, isExpanded, isExpandable } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(rowProps["aria-expanded"]).toBeUndefined();
      expect(isExpanded).toBe(false);
      expect(isExpandable).toBe(false);

      dispose();
    });
  });

  it("should have aria-level attribute", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node1 = state.collection.getItem("1")!;
      const item1 = createTreeItem(
        () => ({ node: node1 }),
        () => state,
        ref,
      );
      expect(item1.rowProps["aria-level"]).toBe(1); // level 0 + 1 = 1

      const node11 = state.collection.getItem("1.1")!;
      const item11 = createTreeItem(
        () => ({ node: node11 }),
        () => state,
        ref,
      );
      expect(item11.rowProps["aria-level"]).toBe(2); // level 1 + 1 = 2

      dispose();
    });
  });

  it("should track selection state", () => {
    createRoot((dispose) => {
      const state = createState({ selectionMode: "single" });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const item = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(item.isSelected).toBe(false);
      expect(item.rowProps["aria-selected"]).toBe(false);

      state.toggleSelection("1");

      expect(item.isSelected).toBe(true);
      expect(item.rowProps["aria-selected"]).toBe(true);

      dispose();
    });
  });

  it("should track disabled state", () => {
    createRoot((dispose) => {
      const state = createState({ disabledKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { isDisabled, rowProps } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(isDisabled).toBe(true);
      expect(rowProps["aria-disabled"]).toBe(true);

      dispose();
    });
  });

  it("should provide expandButtonProps", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { expandButtonProps, isExpanded } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(expandButtonProps.type).toBe("button");
      expect(expandButtonProps["aria-label"]).toBe("Expand");
      expect(isExpanded).toBe(false);

      dispose();
    });
  });

  it("should update expandButtonProps aria-label when expanded", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const node = state.collection.getItem("1")!;

      const { expandButtonProps, isExpanded } = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(expandButtonProps["aria-label"]).toBe("Collapse");
      expect(isExpanded).toBe(true);

      dispose();
    });
  });

  it("should track level", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1", "1.2"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node1 = state.collection.getItem("1")!;
      expect(
        createTreeItem(
          () => ({ node: node1 }),
          () => state,
          ref,
        ).level,
      ).toBe(0);

      const node11 = state.collection.getItem("1.1")!;
      expect(
        createTreeItem(
          () => ({ node: node11 }),
          () => state,
          ref,
        ).level,
      ).toBe(1);

      const node121 = state.collection.getItem("1.2.1")!;
      expect(
        createTreeItem(
          () => ({ node: node121 }),
          () => state,
          ref,
        ).level,
      ).toBe(2);

      dispose();
    });
  });
});

describe("createTreeSelectionCheckbox", () => {
  it("should return checkboxProps", () => {
    createRoot((dispose) => {
      const state = createState({ selectionMode: "multiple" });

      const { checkboxProps } = createTreeSelectionCheckbox(
        () => ({ key: "1" }),
        () => state,
      );

      expect(checkboxProps.type).toBe("checkbox");
      expect(checkboxProps["aria-label"]).toBe("Select");

      dispose();
    });
  });

  it("should track checked state", () => {
    createRoot((dispose) => {
      const state = createState({ selectionMode: "multiple" });

      const checkbox = createTreeSelectionCheckbox(
        () => ({ key: "1" }),
        () => state,
      );

      expect(checkbox.checkboxProps.checked).toBe(false);

      state.toggleSelection("1");

      // Re-access the getter to get updated props
      expect(checkbox.checkboxProps.checked).toBe(true);

      dispose();
    });
  });

  it("should track disabled state", () => {
    createRoot((dispose) => {
      const state = createState({
        selectionMode: "multiple",
        disabledKeys: ["1"],
      });

      const { checkboxProps } = createTreeSelectionCheckbox(
        () => ({ key: "1" }),
        () => state,
      );

      expect(checkboxProps.disabled).toBe(true);

      dispose();
    });
  });
});

describe("createTree RTL direction parity", () => {
  it("ArrowLeft expands and ArrowRight collapses in RTL", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({ direction: "rtl" }),
        () => state,
        ref,
      );

      // Focus the tree → auto-focuses first item (key '1' which is expandable)
      (treeProps.onFocus as ((e: FocusEvent) => void) | undefined)?.({} as FocusEvent);
      expect(state.focusedKey).toBe("1");
      expect(state.isExpanded("1")).toBe(false);

      // ArrowLeft in RTL = expand
      const preventDefault = vi.fn();
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: "ArrowLeft",
        preventDefault,
      } as unknown as KeyboardEvent);

      expect(state.isExpanded("1")).toBe(true);
      expect(preventDefault).toHaveBeenCalled();

      // ArrowRight in RTL = collapse
      const preventDefault2 = vi.fn();
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: "ArrowRight",
        preventDefault: preventDefault2,
      } as unknown as KeyboardEvent);

      expect(state.isExpanded("1")).toBe(false);

      dispose();
    });
  });

  it("ArrowRight expands and ArrowLeft collapses in LTR (default)", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const { treeProps } = createTree(
        () => ({}), // default direction = ltr
        () => state,
        ref,
      );

      (treeProps.onFocus as ((e: FocusEvent) => void) | undefined)?.({} as FocusEvent);

      // ArrowRight in LTR = expand
      const preventDefault = vi.fn();
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: "ArrowRight",
        preventDefault,
      } as unknown as KeyboardEvent);

      expect(state.isExpanded("1")).toBe(true);

      // ArrowLeft in LTR = collapse
      (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.isExpanded("1")).toBe(false);

      dispose();
    });
  });
});

describe("createTreeItem ARIA parity", () => {
  it("should have aria-posinset and aria-setsize on root items", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node1 = state.collection.getItem("1")!;
      const item1 = createTreeItem(
        () => ({ node: node1 }),
        () => state,
        ref,
      );

      // Item 1 is first of 2 root items
      expect(item1.rowProps["aria-posinset"]).toBe(1);
      expect(item1.rowProps["aria-setsize"]).toBe(2);

      const node2 = state.collection.getItem("2")!;
      const item2 = createTreeItem(
        () => ({ node: node2 }),
        () => state,
        ref,
      );

      // Item 2 is second of 2 root items
      expect(item2.rowProps["aria-posinset"]).toBe(2);
      expect(item2.rowProps["aria-setsize"]).toBe(2);

      dispose();
    });
  });

  it("should have aria-posinset and aria-setsize on child items", () => {
    createRoot((dispose) => {
      const state = createState({ defaultExpandedKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);

      // Item 1 has 2 children: 1.1 and 1.2
      const node11 = state.collection.getItem("1.1")!;
      const item11 = createTreeItem(
        () => ({ node: node11 }),
        () => state,
        ref,
      );

      expect(item11.rowProps["aria-posinset"]).toBe(1);
      expect(item11.rowProps["aria-setsize"]).toBe(2);

      const node12 = state.collection.getItem("1.2")!;
      const item12 = createTreeItem(
        () => ({ node: node12 }),
        () => state,
        ref,
      );

      expect(item12.rowProps["aria-posinset"]).toBe(2);
      expect(item12.rowProps["aria-setsize"]).toBe(2);

      dispose();
    });
  });

  it("should have aria-label from node textValue", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node = state.collection.getItem("1")!;
      const item = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(item.rowProps["aria-label"]).toBe("Item 1");

      dispose();
    });
  });

  it("should prefer explicit textValue prop for aria-label", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node = state.collection.getItem("1")!;
      const item = createTreeItem(
        () => ({ node, textValue: "Custom Label" }),
        () => state,
        ref,
      );

      expect(item.rowProps["aria-label"]).toBe("Custom Label");

      dispose();
    });
  });

  it("should have row id", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node = state.collection.getItem("1")!;
      const item = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(item.rowProps.id).toBeTruthy();

      dispose();
    });
  });

  it("expand button should have aria-labelledby linking to row", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node = state.collection.getItem("1")!;
      const item = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      const rowId = item.rowProps.id;
      const buttonId = item.expandButtonProps.id;

      expect(rowId).toBeTruthy();
      expect(buttonId).toBeTruthy();
      expect(item.expandButtonProps["aria-labelledby"]).toBe(`${buttonId} ${rowId}`);

      dispose();
    });
  });

  it("expand button should not have aria-labelledby for leaf items", () => {
    createRoot((dispose) => {
      const state = createState();
      const [ref] = createSignal<HTMLDivElement | null>(null);

      const node = state.collection.getItem("2")!; // leaf item
      const item = createTreeItem(
        () => ({ node }),
        () => state,
        ref,
      );

      expect(item.expandButtonProps["aria-labelledby"]).toBeUndefined();

      dispose();
    });
  });
});

describe("createTree disabled key navigation parity", () => {
  // Dispatch a keydown through the tree's onKeyDown handler.
  const press = (treeProps: { onKeyDown?: unknown }, key: string) => {
    (treeProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.({
      key,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);
  };

  it("ArrowDown/ArrowUp skip disabled rows under the default 'all' behavior", () => {
    createRoot((dispose) => {
      // Visible rows: 1, 1.1 (disabled), 1.2, 2
      const state = createState({ defaultExpandedKeys: ["1"], disabledKeys: ["1.1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      state.setFocusedKey("1");
      press(treeProps, "ArrowDown");
      expect(state.focusedKey).toBe("1.2"); // skipped 1.1

      press(treeProps, "ArrowUp");
      expect(state.focusedKey).toBe("1"); // skipped 1.1 going back

      dispose();
    });
  });

  it("ArrowDown lands on a disabled row under disabledBehavior 'selection'", () => {
    createRoot((dispose) => {
      const state = createState({
        defaultExpandedKeys: ["1"],
        disabledKeys: ["1.1"],
        disabledBehavior: "selection",
      });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      state.setFocusedKey("1");
      press(treeProps, "ArrowDown");
      expect(state.focusedKey).toBe("1.1"); // focusable; only selection is disabled

      dispose();
    });
  });

  it("Enter fires onAction but does not select a disabled row under 'selection'", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const state = createState({
        defaultExpandedKeys: ["1"],
        disabledKeys: ["1.1"],
        disabledBehavior: "selection",
        selectionMode: "single",
      });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const { treeProps } = createTree(
        () => ({ onAction }),
        () => state,
        ref,
      );

      // 1.1 is focusable under "selection": Enter fires onAction but must not
      // select it (Space selection stays blocked independently).
      state.setFocusedKey("1.1");
      press(treeProps, "Enter");

      expect(onAction).toHaveBeenCalledWith("1.1");
      expect(state.isSelected("1.1")).toBe(false);

      dispose();
    });
  });

  it("Home and End land on the first/last enabled row under 'all'", () => {
    createRoot((dispose) => {
      // Visible rows: 1 (disabled), 1.1, 1.2, 2 (disabled)
      const state = createState({ defaultExpandedKeys: ["1"], disabledKeys: ["1", "2"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      press(treeProps, "Home");
      expect(state.focusedKey).toBe("1.1"); // first enabled

      press(treeProps, "End");
      expect(state.focusedKey).toBe("1.2"); // last enabled

      dispose();
    });
  });

  it("focusing the tree enters on the first enabled row under 'all'", () => {
    createRoot((dispose) => {
      // Root row "1" is disabled; first enabled visible row is "1.1".
      const state = createState({ defaultExpandedKeys: ["1"], disabledKeys: ["1"] });
      const [ref] = createSignal<HTMLDivElement | null>(null);
      const { treeProps } = createTree(
        () => ({}),
        () => state,
        ref,
      );

      (treeProps.onFocus as ((e: FocusEvent) => void) | undefined)?.({} as FocusEvent);
      expect(state.focusedKey).toBe("1.1");

      dispose();
    });
  });
});
