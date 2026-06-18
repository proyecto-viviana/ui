/**
 * createTableRow - Provides accessibility for a table row.
 * Based on @react-aria/table/useTableRow.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { Key, TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTableRowProps, TableRowAria, ExpandButtonProps } from "./types";
import { getTableData } from "./createTable";
import { useLocale } from "../i18n";

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
  _ref: Accessor<HTMLTableRowElement | null>,
): TableRowAria {
  const [isPressed, setIsPressed] = createSignal(false);
  const locale = useLocale();
  let didSelectOnPointer = false;
  let didActionOnPointer = false;

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

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return !!p.isDisabled || s.isDisabled(p.node.key);
  });

  const isFocused = createMemo(() => {
    const s = state();
    const p = props();
    return s.focusedKey === p.node.key;
  });

  const isInteractive = () => {
    const s = state();
    const p = props();
    const tableData = getTableData(s);
    return (
      s.selectionMode !== "none" || !!tableData?.actions.onRowAction || !!p.onAction || !!p.href
    );
  };

  const selectRow = (e: MouseEvent | PointerEvent | KeyboardEvent, forceReplace = false) => {
    const s = state();
    const p = props();

    if (s.selectionMode !== "none") {
      if (e.shiftKey && s.selectionMode === "multiple") {
        s.extendSelection(p.node.key);
      } else if (!forceReplace && (e.ctrlKey || e.metaKey || s.selectionBehavior === "toggle")) {
        s.toggleSelection(p.node.key);
      } else if (!forceReplace && s.selectionMode === "single" && s.isSelected(p.node.key)) {
        s.toggleSelection(p.node.key);
      } else {
        // Replace selection
        s.replaceSelection(p.node.key);
      }
    }
  };

  const activateLink = (e: MouseEvent | KeyboardEvent) => {
    props().onLinkAction?.(e);
  };

  const runRowAction = (p: AriaTableRowProps, onRowAction: ((key: Key) => void) | undefined) => {
    if (onRowAction) {
      onRowAction(p.node.key);
    }

    if (p.onAction) {
      p.onAction();
    }
  };

  const isFromInteractiveElement = (e: Event) => {
    const target = e.target;
    if (!(target instanceof Element)) return false;
    return !!target.closest(
      'a[href],button,input,select,textarea,[role="button"],[role="checkbox"],[role="link"]',
    );
  };

  // Handle click/press for selection
  const onClick = (e: MouseEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Get table metadata for actions
    const tableData = getTableData(s);
    const onRowAction = tableData?.actions.onRowAction;

    if (isFromInteractiveElement(e)) {
      didSelectOnPointer = false;
      didActionOnPointer = false;
      return;
    }

    if (p.href) {
      if (s.selectionBehavior === "replace" && s.selectionMode !== "none") {
        if (!didSelectOnPointer) {
          selectRow(e, true);
        }
      } else if (!didActionOnPointer) {
        activateLink(e);
      }
      didSelectOnPointer = false;
      didActionOnPointer = false;
      return;
    }

    if (!didSelectOnPointer) {
      selectRow(e);
    }
    didSelectOnPointer = false;

    if (!didActionOnPointer) {
      runRowAction(p, onRowAction);
    }
    didActionOnPointer = false;
  };

  const onDblClick = (e: MouseEvent) => {
    const s = state();
    const p = props();

    if (isDisabled() || !p.href || s.selectionBehavior !== "replace") return;

    activateLink(e);
  };

  const onKeyDown = (e: KeyboardEvent) => {
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

    if (e.key === "Enter") {
      e.preventDefault();

      // Get table metadata for actions
      const tableData = getTableData(s);
      const onRowAction = tableData?.actions.onRowAction;

      if (p.href) {
        activateLink(e);
        return;
      }

      // Handle selection
      if (s.selectionMode !== "none") {
        selectRow(e);
      }

      // Call action handler
      if (onRowAction) {
        onRowAction(p.node.key);
      }

      if (p.onAction) {
        p.onAction();
      }
    }

    if (e.key === " " || e.key === "Space" || e.key === "Spacebar") {
      e.preventDefault();

      if (p.href && s.selectionMode !== "none") {
        selectRow(e, s.selectionBehavior === "replace");
        return;
      }

      if (p.href) {
        activateLink(e);
        return;
      }

      if (s.selectionMode !== "none") {
        selectRow(e);
      }
    }
  };

  const onFocus = () => {
    const s = state();
    const p = props();
    s.setFocusedKey(p.node.key);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (isInteractive() && !isDisabled()) {
      setIsPressed(true);
    }
    const s = state();
    const tableData = getTableData(s);
    if (s.selectionMode !== "none" && !tableData?.shouldSelectOnPressUp && !isDisabled()) {
      selectRow(e);
      didSelectOnPointer = true;
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    const s = state();
    const p = props();
    const tableData = getTableData(s);
    if (s.selectionMode !== "none" && tableData?.shouldSelectOnPressUp && !isDisabled()) {
      selectRow(e);
      didSelectOnPointer = true;
    }
    if (
      s.selectionMode === "none" &&
      tableData?.shouldSelectOnPressUp &&
      !isDisabled() &&
      !isFromInteractiveElement(e)
    ) {
      if (p.href) {
        activateLink(e);
      } else {
        runRowAction(p, tableData?.actions.onRowAction);
      }
      didActionOnPointer = true;
    }
    setIsPressed(false);
  };

  const rowProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;

    const baseProps: Record<string, unknown> = {
      role: "row",
      "aria-selected": s.selectionMode !== "none" ? isSelected() : undefined,
      "aria-disabled": isDisabled() || undefined,
      tabIndex: isFocused() ? 0 : -1,
      onClick,
      onDblClick,
      onKeyDown,
      onFocus,
      onPointerDown,
      onPointerUp,
    };

    // Tree-grid rows expose their nesting depth, position and expansion state.
    if (s.treeColumn != null) {
      const { posinset, setsize } = siblingInfo();
      baseProps["aria-expanded"] = hasChildRows() ? isExpanded() : undefined;
      baseProps["aria-level"] = node.level + 1; // 1-based
      baseProps["aria-posinset"] = posinset;
      baseProps["aria-setsize"] = setsize;
    }

    // Add aria-rowindex for virtualized tables. Tree grids omit it (matches upstream).
    if (p.isVirtualized && s.treeColumn == null && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return baseProps as JSX.HTMLAttributes<HTMLTableRowElement>;
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
      return isPressed();
    },
    get isExpanded() {
      return isExpanded();
    },
    get hasChildRows() {
      return hasChildRows();
    },
  };
}
