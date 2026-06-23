/**
 * createGridListItem - Provides accessibility for a grid list item.
 * Based on @react-aria/gridlist/useGridListItem.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  Collection,
  GridState,
  GridCollection,
  Key,
  Selection,
} from "@proyecto-viviana/solid-stately";
import type { AriaGridListItemProps, GridListItemAria } from "./types";
import { getGridListData } from "./createGridList";
import {
  createSelectableItem,
  type SelectableItemState,
} from "../selection/createSelectableItem";
import { mergeCollectionRowInteractionProps } from "../selection/createCollectionRowInteraction";
import { mergeProps } from "../utils/mergeProps";

/**
 * Creates accessibility props for a grid list item.
 */
export function createGridListItem<
  T extends object,
  C extends GridCollection<T> = GridCollection<T>,
>(
  props: Accessor<AriaGridListItemProps>,
  state: Accessor<GridState<T, C>>,
  ref: Accessor<HTMLElement | null>,
): GridListItemAria {
  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.node.key);
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
      const gridListData = getGridListData(s);
      const onAction = gridListData?.actions.onAction;

      return {
        key: p.node.key,
        id: `${gridListData?.gridListId ?? "gridlist"}-row-${String(p.node.key)}`,
        isVirtualized: p.isVirtualized,
        shouldSelectOnPressUp: gridListData?.shouldSelectOnPressUp ?? false,
        onAction:
          onAction || p.onAction
            ? () => {
                p.onAction?.();
                onAction?.(p.node.key);
              }
            : undefined,
      };
    },
    selectableState,
    ref,
  );

  const rowProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;

    const baseProps: Record<string, unknown> = {
      role: "row",
      "aria-selected": s.selectionMode !== "none" ? isSelected() : undefined,
      "aria-disabled": selectableItem.isDisabled() || undefined,
    };

    // Add aria-rowindex for virtualized lists
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    const gridListData = getGridListData(s);
    const mergedProps = mergeProps<JSX.HTMLAttributes<HTMLElement>>(
      selectableItem.itemProps,
      baseProps,
    );

    return mergeCollectionRowInteractionProps(mergedProps, {
      ref,
      keyboardNavigationBehavior: () => gridListData?.keyboardNavigationBehavior ?? "arrow",
      direction: () => gridListData?.direction ?? "ltr",
    });
  });

  const gridCellProps = createMemo(() => {
    return {
      role: "gridcell",
    } as JSX.HTMLAttributes<HTMLDivElement>;
  });

  return {
    get rowProps() {
      return rowProps();
    },
    get gridCellProps() {
      return gridCellProps();
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
  };
}
