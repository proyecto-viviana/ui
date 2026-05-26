/**
 * createTableRow - Provides accessibility for a table row.
 * Based on @react-aria/table/useTableRow.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { Key, TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTableRowProps, TableRowAria } from "./types";
import { getTableData } from "./createTable";

/**
 * Creates accessibility props for a table row.
 */
export function createTableRow<T extends object>(
  props: Accessor<AriaTableRowProps>,
  state: Accessor<TableState<T, TableCollection<T>>>,
  _ref: Accessor<HTMLTableRowElement | null>,
): TableRowAria {
  const [isPressed, setIsPressed] = createSignal(false);
  let didSelectOnPointer = false;
  let didActionOnPointer = false;

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

    // Add aria-rowindex for virtualized tables
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return baseProps as JSX.HTMLAttributes<HTMLTableRowElement>;
  });

  return {
    get rowProps() {
      return rowProps();
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
  };
}
