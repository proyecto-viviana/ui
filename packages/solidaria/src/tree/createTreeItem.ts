/**
 * createTreeItem - Provides accessibility for a tree item.
 * Based on @react-aria/tree/useTreeItem.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type {
  Collection,
  Key,
  Selection,
  TreeState,
  TreeCollection,
} from "@proyecto-viviana/solid-stately";
import type { AriaTreeItemProps, TreeItemAria } from "./types";
import { getTreeData } from "./createTree";
import {
  createSelectableItem,
  type SelectableItemState,
} from "../selection/createSelectableItem";
import { mergeCollectionRowInteractionProps } from "../selection/createCollectionRowInteraction";
import { mergeProps } from "../utils/mergeProps";

/**
 * Creates accessibility props for a tree item.
 */
export function createTreeItem<T extends object, C extends TreeCollection<T> = TreeCollection<T>>(
  props: Accessor<AriaTreeItemProps<T>>,
  state: Accessor<TreeState<T, C>>,
  ref: Accessor<HTMLElement | null>,
): TreeItemAria {
  const fallbackRowId = createId();
  const expandButtonId = createId();

  const rowId = createMemo(() => {
    const treeData = getTreeData(state());
    return treeData ? `${treeData.treeId}-row-${String(props().node.key)}` : fallbackRowId;
  });

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.node.key);
  });

  const isExpanded = createMemo(() => {
    const s = state();
    const p = props();
    return s.isExpanded(p.node.key);
  });

  const isExpandable = createMemo(() => {
    const p = props();
    return p.node.isExpandable ?? false;
  });

  const level = createMemo(() => {
    const p = props();
    return p.node.level;
  });

  const selectableState: SelectableItemState<T> = {
    collection: () => state().collection as unknown as Collection<T>,
    isFocused: () => state().isFocused,
    setFocused: (focused: boolean) => state().setFocused(focused),
    focusedKey: () => state().focusedKey,
    childFocusStrategy: () => state().childFocusStrategy,
    setFocusedKey: (key: Key | null, strategy) => state().setFocusedKey(key, strategy),
    selectionMode: () => state().selectionMode,
    selectionBehavior: () => props().selectionBehavior ?? state().selectionBehavior,
    disallowEmptySelection: () => state().disallowEmptySelection,
    selectedKeys: () => state().selectedKeys as Selection,
    disabledKeys: () => state().disabledKeys,
    disabledBehavior: () => state().disabledBehavior,
    isEmpty: () => {
      const keys = state().selectedKeys;
      return keys !== "all" && keys.size === 0;
    },
    isSelectAll: () => state().selectedKeys === "all",
    isSelected: (key: Key) => state().isSelected(key),
    isDisabled: (key: Key) => {
      const s = state();
      const item = s.collection.getItem(key);
      return (
        s.disabledBehavior === "all" &&
        s.isDisabled(key) &&
        item?.props?.disabledBehavior !== "selection"
      );
    },
    canSelectItem: (key: Key) => {
      const s = state();
      return s.selectionMode !== "none" && !s.isDisabled(key);
    },
    setSelectionBehavior: (behavior) => state().setSelectionBehavior(behavior),
    toggleSelection: (key: Key) => state().toggleSelection(key),
    replaceSelection: (key: Key) => state().replaceSelection(key),
    setSelectedKeys: (keys: Iterable<Key>) => state().setSelectedKeys(keys),
    selectAll: () => state().selectAll(),
    clearSelection: () => state().clearSelection(),
    toggleSelectAll: () => state().toggleSelectAll(),
    extendSelection: (toKey: Key, _collection: Collection<T>) => state().extendSelection(toKey),
  };

  const selectableItem = createSelectableItem<T>(
    () => {
      const s = state();
      const p = props();
      const treeData = getTreeData(s);
      const treeAction = treeData?.actions.onAction;
      const shouldToggleOnAction =
        !treeAction && !p.onAction && s.selectionMode === "none" && isExpandable();

      return {
        key: p.node.key,
        id: rowId(),
        isVirtualized: p.isVirtualized,
        isDisabled: p.isDisabled,
        onAction:
          treeAction || p.onAction || shouldToggleOnAction
            ? () => {
                p.onAction?.();
                treeAction?.(p.node.key);
                if (shouldToggleOnAction) {
                  s.toggleKey(p.node.key);
                }
              }
            : undefined,
      };
    },
    selectableState,
    ref,
  );

  // Compute sibling position (aria-posinset/aria-setsize)
  const siblingInfo = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;
    const parentKey = node.parentKey;

    if (parentKey != null) {
      const parentNode = s.collection.getItem(parentKey);
      if (parentNode) {
        return {
          posinset: node.index + 1, // 1-based
          setsize: parentNode.childNodes.length,
        };
      }
    }

    // Root-level: count root nodes
    const rootNodes = s.collection.rows.filter((n) => n.level === 0);
    const rootIndex = rootNodes.findIndex((n) => n.key === node.key);
    return {
      posinset: rootIndex >= 0 ? rootIndex + 1 : node.index + 1,
      setsize: rootNodes.length,
    };
  });

  const rowProps = createMemo(() => {
    const p = props();
    const node = p.node;
    const { posinset, setsize } = siblingInfo();

    // Use textValue for aria-label (if available), or explicit textValue prop
    const textValue = p.textValue ?? node.textValue;

    const baseProps: Record<string, unknown> = {
      role: "row",
      "aria-label": textValue || undefined,
      "aria-selected": selectableState.canSelectItem?.(node.key) ? isSelected() : undefined,
      "aria-disabled": selectableItem.isDisabled() || undefined,
      "aria-expanded": isExpandable() ? isExpanded() : undefined,
      "aria-level": node.level + 1, // 1-based for ARIA
      "aria-posinset": posinset,
      "aria-setsize": setsize,
    };

    // Add aria-rowindex for virtualized trees
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    const treeData = getTreeData(state());
    const mergedProps = mergeProps<JSX.HTMLAttributes<HTMLDivElement>>(
      selectableItem.itemProps,
      baseProps,
    );

    return mergeCollectionRowInteractionProps(mergedProps, {
      ref,
      keyboardNavigationBehavior: () => treeData?.keyboardNavigationBehavior ?? "arrow",
      direction: () => treeData?.direction ?? "ltr",
    });
  });

  const gridCellProps = createMemo(() => {
    return {
      role: "gridcell",
      "aria-colindex": 1,
    } as JSX.HTMLAttributes<HTMLDivElement>;
  });

  // Expand button handler
  const onExpandClick = (e: MouseEvent) => {
    e.stopPropagation(); // Don't trigger row click
    const s = state();
    const p = props();

    if (selectableItem.isDisabled()) return;

    s.toggleKey(p.node.key);
  };

  const stopPointerPropagation = (e: Event) => {
    // Prevent row pointer handlers from flipping pressed state and re-rendering
    // before the button click handler can run.
    e.stopPropagation();
  };

  const expandButtonProps = createMemo(() => {
    const baseProps: Record<string, unknown> = {
      type: "button",
      id: expandButtonId,
      "aria-label": isExpanded() ? "Collapse" : "Expand",
      "aria-labelledby": isExpandable() ? `${expandButtonId} ${rowId()}` : undefined,
      "data-react-aria-prevent-focus": true,
      onClick: onExpandClick,
      onPointerDown: stopPointerPropagation,
      onPointerUp: stopPointerPropagation,
      onMouseDown: stopPointerPropagation,
      onMouseUp: stopPointerPropagation,
      tabIndex: -1, // Not in tab order, use arrow keys
      "aria-hidden": !isExpandable() ? true : undefined,
    };

    return baseProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  });

  return {
    get rowProps() {
      return rowProps();
    },
    get gridCellProps() {
      return gridCellProps();
    },
    get expandButtonProps() {
      return expandButtonProps();
    },
    get isSelected() {
      return isSelected();
    },
    get isDisabled() {
      return selectableItem.isDisabled();
    },
    get isPressed() {
      return selectableItem.isPressed();
    },
    get isExpanded() {
      return isExpanded();
    },
    get isExpandable() {
      return isExpandable();
    },
    get level() {
      return level();
    },
  };
}
