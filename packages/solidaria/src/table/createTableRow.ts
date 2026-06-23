/**
 * createTableRow - Provides accessibility for a table row.
 * Based on @react-aria/table/useTableRow.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  Collection,
  Key,
  Selection,
  TableState,
  TableCollection,
} from "@proyecto-viviana/solid-stately";
import type { AriaTableRowProps, TableRowAria, ExpandButtonProps } from "./types";
import { getTableData } from "./createTable";
import { useLocale } from "../i18n";
import {
  createSelectableItem,
  type SelectableItemState,
} from "../selection/createSelectableItem";
import { mergeProps } from "../utils/mergeProps";

/**
 * Arrow keys that expand/collapse a tree-grid row, mirroring `@react-aria/table`.
 * Direction is flipped under RTL.
 */
const EXPANSION_KEYS = {
  expand: { ltr: "ArrowRight", rtl: "ArrowLeft" },
  collapse: { ltr: "ArrowLeft", rtl: "ArrowRight" },
} as const;

/**
 * Creates accessibility props for a table row.
 */
export function createTableRow<T extends object>(
  props: Accessor<AriaTableRowProps>,
  state: Accessor<TableState<T, TableCollection<T>>>,
  ref: Accessor<HTMLTableRowElement | null>,
): TableRowAria {
  const locale = useLocale();

  // Tree-grid (expandable rows): only active when the collection has a tree column.
  const isTreeRow = createMemo(() => state().treeColumn != null);

  const hasChildRows = createMemo(() => props().node.isExpandable ?? false);

  const isExpanded = createMemo(() => {
    const s = state();
    if (s.treeColumn == null) return false;
    return s.expandedKeys === "all" || s.expandedKeys.has(props().node.key);
  });

  // aria-posinset / aria-setsize among same-level sibling rows.
  const siblingInfo = createMemo(() => {
    const s = state();
    const node = props().node;
    if (node.parentKey != null) {
      const parent = s.collection.getItem(node.parentKey);
      if (parent) {
        const siblings = parent.childNodes.filter((n) => n.type === "item");
        return { posinset: node.index + 1, setsize: siblings.length };
      }
    }
    const rootRows = s.collection.body.childNodes.filter((n) => n.type === "item");
    const rootIndex = rootRows.findIndex((n) => n.key === node.key);
    return {
      posinset: rootIndex >= 0 ? rootIndex + 1 : node.index + 1,
      setsize: rootRows.length,
    };
  });

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
    selectionBehavior: () => state().selectionBehavior,
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
      const tableData = getTableData(s);
      const onRowAction = tableData?.actions.onRowAction;
      const hasAction = !!p.onAction || !!onRowAction || !!p.href;

      return {
        key: p.node.key,
        id: `${tableData?.tableId ?? "table"}-row-${String(p.node.key)}`,
        isVirtualized: p.isVirtualized,
        shouldSelectOnPressUp: tableData?.shouldSelectOnPressUp ?? false,
        isDisabled: !!p.isDisabled || s.collection.size === 0,
        onAction: hasAction
          ? (event) => {
              p.onAction?.();
              onRowAction?.(p.node.key);
              if (p.href) {
                p.onLinkAction?.(event);
              }
            }
          : undefined,
      };
    },
    selectableState,
    ref,
  );

  const isDisabled = () => selectableItem.isDisabled();

  const onTreeGridKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Tree-grid expand/collapse with Left/Right arrows (flipped under RTL). Handled before
    // selection/navigation; stopping propagation prevents the grid's arrow navigation when
    // expansion consumes the key.
    if (s.treeColumn != null) {
      const direction = locale().direction === "rtl" ? "rtl" : "ltr";
      const key = p.node.key;
      const expanded = s.expandedKeys;
      if (
        e.key === EXPANSION_KEYS.expand[direction] &&
        s.focusedKey === key &&
        hasChildRows() &&
        expanded !== "all" &&
        !expanded.has(key)
      ) {
        s.toggleKey(key);
        e.stopPropagation();
        return;
      } else if (e.key === EXPANSION_KEYS.collapse[direction] && s.focusedKey === key) {
        if (expanded !== "all") {
          if (hasChildRows() && expanded.has(key)) {
            s.toggleKey(key);
            e.stopPropagation();
            return;
          } else if (!expanded.has(key) && p.node.parentKey != null && p.node.level > 0) {
            // Leaf or already-collapsed row: move focus to the parent row.
            s.setFocusedKey(p.node.parentKey);
            e.stopPropagation();
            return;
          }
        } else {
          s.toggleKey(key);
          e.stopPropagation();
          return;
        }
      }
    }
  };

  const rowProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;

    const baseProps: Record<string, unknown> = {
      role: "row",
      "aria-selected": s.selectionMode !== "none" ? isSelected() : undefined,
      "aria-disabled": isDisabled() || undefined,
    };

    // Tree-grid rows expose their nesting depth, position and expansion state.
    if (s.treeColumn != null) {
      const { posinset, setsize } = siblingInfo();
      baseProps["aria-expanded"] = hasChildRows() ? isExpanded() : undefined;
      baseProps["aria-level"] = node.level + 1; // 1-based
      baseProps["aria-posinset"] = posinset;
      baseProps["aria-setsize"] = setsize;
      baseProps.onKeyDown = onTreeGridKeyDown;
    }

    // Add aria-rowindex for virtualized tables. Tree grids omit it (matches upstream).
    if (p.isVirtualized && s.treeColumn == null && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return mergeProps<JSX.HTMLAttributes<HTMLTableRowElement>>(
      selectableItem.itemProps as unknown as JSX.HTMLAttributes<HTMLTableRowElement>,
      baseProps,
    );
  });

  // Chevron button for expanding/collapsing a tree-grid row. Press-based so it flows through
  // our Button's `createPress`, and excluded from the tab order — reached via the row's
  // Left/Right arrow keys instead. Mirrors `@react-aria/table`'s `expandButtonProps`; whether a
  // chevron renders for a leaf row is the consumer's call (gate on `hasChildItems`), matching S2.
  const onExpandPress = () => {
    const s = state();
    const p = props();
    if (isDisabled()) return;
    s.toggleKey(p.node.key);
    s.setFocused(true);
    s.setFocusedKey(p.node.key);
  };

  const expandButtonProps = createMemo<ExpandButtonProps>(() => ({
    isDisabled: isDisabled(),
    onPress: onExpandPress,
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    "data-react-aria-prevent-focus": true,
    "aria-label": isExpanded() ? "Collapse" : "Expand",
  }));

  return {
    get rowProps() {
      return rowProps();
    },
    get expandButtonProps() {
      return expandButtonProps();
    },
    get isSelected() {
      return isSelected();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isPressed() {
      return selectableItem.isPressed();
    },
    get isExpanded() {
      return isExpanded();
    },
    get hasChildRows() {
      return hasChildRows();
    },
  };
}
