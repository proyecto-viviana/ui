/**
 * Table state management for Table components.
 * Based on @react-stately/table/useTableState.
 */

import { createMemo, type Accessor } from "solid-js";
import { createGridState } from "../grid/createGridState";
import type { Key } from "../collections/types";
import type {
  TableState,
  TableStateOptions,
  TableCollection,
  SortDescriptor,
  SortDirection,
} from "./types";

const OPPOSITE_SORT_DIRECTION: Record<SortDirection, SortDirection> = {
  ascending: "descending",
  descending: "ascending",
};

/**
 * Creates state management for a table component.
 * Extends grid state with sorting and table-specific features.
 */
export function createTableState<
  T extends object,
  C extends TableCollection<T> = TableCollection<T>,
>(options: Accessor<TableStateOptions<T, C>>): TableState<T, C> {
  const getOptions = () => options();

  // Create the underlying grid state
  const gridState = createGridState<T, C>(() => ({
    collection: getOptions().collection,
    disabledKeys: getOptions().disabledKeys,
    disabledBehavior: getOptions().disabledBehavior,
    focusMode: getOptions().focusMode,
    selectionMode: getOptions().selectionMode,
    selectionBehavior: getOptions().selectionBehavior,
    disallowEmptySelection: getOptions().disallowEmptySelection,
    selectedKeys: getOptions().selectedKeys,
    defaultSelectedKeys: getOptions().defaultSelectedKeys,
    onSelectionChange: getOptions().onSelectionChange,
  }));

  // Memoized sort descriptor
  const sortDescriptor = createMemo<SortDescriptor | null>(() => {
    return getOptions().sortDescriptor ?? null;
  });

  // Show selection checkboxes
  const showSelectionCheckboxes = createMemo(() => {
    return getOptions().showSelectionCheckboxes ?? false;
  });

  // Sort function
  const sort = (columnKey: Key, direction?: SortDirection) => {
    const opts = getOptions();
    const currentSort = opts.sortDescriptor;

    // Determine direction
    let newDirection: SortDirection;
    if (direction) {
      newDirection = direction;
    } else if (currentSort?.column === columnKey) {
      // Toggle direction if sorting same column
      newDirection = OPPOSITE_SORT_DIRECTION[currentSort.direction];
    } else {
      // Default to ascending for new column
      newDirection = "ascending";
    }

    opts.onSortChange?.({
      column: columnKey,
      direction: newDirection,
    });
  };

  return {
    // Forward grid state properties
    get collection() {
      return getOptions().collection;
    },
    get disabledKeys() {
      return gridState.disabledKeys;
    },
    get disabledBehavior() {
      return gridState.disabledBehavior;
    },
    get isKeyboardNavigationDisabled() {
      return gridState.isKeyboardNavigationDisabled;
    },
    get focusedKey() {
      return gridState.focusedKey;
    },
    get childFocusStrategy() {
      return gridState.childFocusStrategy;
    },
    get isFocused() {
      return gridState.isFocused;
    },
    get selectionMode() {
      return gridState.selectionMode;
    },
    get selectionBehavior() {
      return gridState.selectionBehavior;
    },
    get disallowEmptySelection() {
      return gridState.disallowEmptySelection;
    },
    get selectedKeys() {
      return gridState.selectedKeys;
    },

    // Grid state methods
    isSelected: gridState.isSelected,
    isDisabled: gridState.isDisabled,
    setFocusedKey: gridState.setFocusedKey,
    setFocused: gridState.setFocused,
    toggleSelection: gridState.toggleSelection,
    replaceSelection: gridState.replaceSelection,
    setSelectionBehavior: gridState.setSelectionBehavior,
    setSelectedKeys: gridState.setSelectedKeys,
    extendSelection: gridState.extendSelection,
    selectAll: gridState.selectAll,
    clearSelection: gridState.clearSelection,
    toggleSelectAll: gridState.toggleSelectAll,
    setKeyboardNavigationDisabled: gridState.setKeyboardNavigationDisabled,

    // Table-specific properties
    get showSelectionCheckboxes() {
      return showSelectionCheckboxes();
    },
    get sortDescriptor() {
      return sortDescriptor();
    },
    sort,

    // A plain table has no expandable rows.
    get expandedKeys(): "all" | Set<Key> {
      return EMPTY_EXPANDED_KEYS;
    },
    get treeColumn(): Key | null {
      return getOptions().collection.treeColumn ?? null;
    },
    toggleKey: () => {},
  };
}

const EMPTY_EXPANDED_KEYS: Set<Key> = new Set();
