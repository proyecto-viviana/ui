/**
 * createTableColumnHeader - Provides accessibility for a table column header.
 * Based on @react-aria/table/useTableColumnHeader.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTableColumnHeaderProps, TableColumnHeaderAria } from "./types";
import { getTableData } from "./createTable";

/**
 * Creates accessibility props for a table column header.
 */
export function createTableColumnHeader<T extends object>(
  props: Accessor<AriaTableColumnHeaderProps>,
  state: Accessor<TableState<T, TableCollection<T>>>,
  _ref: Accessor<HTMLTableCellElement | null>,
): TableColumnHeaderAria {
  const [isPressed, setIsPressed] = createSignal(false);
  let ignoreNextClick = false;
  let ignoreNextClickTimeout: ReturnType<typeof setTimeout> | undefined;

  const isFocused = createMemo(() => {
    const s = state();
    const p = props();
    return s.focusedKey === p.node.key;
  });

  const sortColumn = () => {
    const s = state();
    const p = props();

    if (p.allowsSorting) {
      s.sort(p.node.key);
    }
  };

  const clearPendingClickIgnore = () => {
    if (ignoreNextClickTimeout != null) {
      clearTimeout(ignoreNextClickTimeout);
      ignoreNextClickTimeout = undefined;
    }
  };

  const ignorePointerGeneratedClick = () => {
    clearPendingClickIgnore();
    ignoreNextClick = true;
    ignoreNextClickTimeout = setTimeout(() => {
      ignoreNextClick = false;
      ignoreNextClickTimeout = undefined;
    }, 0);
  };

  // Handle click for sorting. Pointer activation is handled on pointerup because
  // focusing the table header can re-render its child content before a native
  // click is dispatched.
  const onClick = () => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      clearPendingClickIgnore();
      return;
    }

    sortColumn();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const p = props();

    if (
      p.allowsSorting &&
      (e.key === "Enter" || e.key === " " || e.key === "Space" || e.key === "Spacebar")
    ) {
      e.preventDefault();
      sortColumn();
    }
  };

  const onFocus = () => {
    const s = state();
    const p = props();
    s.setFocusedKey(p.node.key);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }

    setIsPressed(true);
  };

  const onPointerUp = () => {
    if (isPressed()) {
      ignorePointerGeneratedClick();
      sortColumn();
    }

    setIsPressed(false);
  };

  const onPointerCancel = () => {
    setIsPressed(false);
  };

  const columnHeaderProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;
    const tableData = getTableData(s);

    // Determine sort state
    let ariaSort: "none" | "ascending" | "descending" | undefined = undefined;
    if (p.allowsSorting) {
      const sortDescriptor = s.sortDescriptor;
      if (sortDescriptor?.column === node.key) {
        ariaSort = sortDescriptor.direction;
      } else {
        ariaSort = "none";
      }
    }

    const baseProps: Record<string, unknown> = {
      role: "columnheader",
      id: tableData ? `${tableData.tableId}-${node.key}` : undefined,
      "aria-sort": ariaSort,
      tabIndex: isFocused() ? 0 : -1,
      onFocus,
    };

    // Add click handler if sortable
    if (p.allowsSorting) {
      baseProps.onClick = onClick;
      baseProps.onKeyDown = onKeyDown;
      baseProps.onPointerDown = onPointerDown;
      baseProps.onPointerUp = onPointerUp;
      baseProps.onPointerCancel = onPointerCancel;
      baseProps.onPointerLeave = onPointerCancel;
      baseProps.style = { cursor: "pointer" };
    }

    // Add aria-colindex for virtualized tables
    if (p.isVirtualized && node.column != null) {
      baseProps["aria-colindex"] = node.column + 1; // 1-based
    }

    // Add colspan if present
    if (node.colspan != null && node.colspan > 1) {
      baseProps["aria-colspan"] = node.colspan;
      baseProps.colSpan = node.colspan;
    }

    return baseProps as JSX.HTMLAttributes<HTMLTableCellElement>;
  });

  return {
    get columnHeaderProps() {
      return columnHeaderProps();
    },
  };
}
