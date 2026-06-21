/**
 * createTable - Provides accessibility for a table component.
 * Based on @react-aria/table/useTable.
 */

import { createMemo, createEffect, on, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TableState, TableCollection, Key, GridNode } from "@proyecto-viviana/solid-stately";
import type { AriaTableProps, TableAria } from "./types";
import { useLocale } from "../i18n";
import { announce } from "../live-announcer";
import { scrollIntoViewport } from "../utils";
import { getInteractionModality } from "../interactions/createInteractionModality";

// Global map to store table metadata for child components
const tableMap = new WeakMap<
  object,
  {
    tableId: string;
    actions: { onRowAction?: (key: Key) => void; onCellAction?: (key: Key) => void };
    shouldSelectOnPressUp?: boolean;
    focusMode?: "row" | "cell";
  }
>();

/**
 * Get the table metadata for child components.
 */
export function getTableData<T>(state: TableState<T, TableCollection<T>>) {
  return tableMap.get(state);
}

/**
 * Helper to get cells from a row by iterating children
 */
function getChildCells<T>(collection: TableCollection<T>, rowKey: Key): GridNode<T>[] {
  const children = collection.getChildren(rowKey);
  return [...children].filter((node) => node.type === "cell" || node.type === "rowheader");
}

/**
 * Helper to get cell at specific index in a row
 */
function getCellAtIndex<T>(
  collection: TableCollection<T>,
  rowKey: Key,
  index: number,
): GridNode<T> | null {
  const cells = getChildCells(collection, rowKey);
  return cells[index] ?? null;
}

/**
 * Helper to check if a node is a cell
 */
function isCell<T>(node: GridNode<T> | null): boolean {
  return node?.type === "cell" || node?.type === "rowheader";
}

/**
 * Helper to check if a node is a row
 */
function isRow<T>(node: GridNode<T> | null): boolean {
  return node?.type === "item";
}

/**
 * Creates accessibility props for a table component.
 */
export function createTable<T extends object>(
  props: Accessor<AriaTableProps>,
  state: Accessor<TableState<T, TableCollection<T>>>,
  ref: Accessor<HTMLTableElement | null>,
): TableAria {
  const id = createId(props().id);
  const locale = useLocale();

  // Track previous sort descriptor for announcements
  let prevSortDescriptor: { column: Key; direction: "ascending" | "descending" } | null = null;
  let isFirstRender = true;
  let typeaheadBuffer = "";
  let typeaheadTimeout: ReturnType<typeof setTimeout> | undefined;

  // Store metadata for child components
  const storeTableData = () => {
    const s = state();
    const p = props();
    tableMap.set(s, {
      tableId: id,
      actions: {
        onRowAction: p.onRowAction,
        onCellAction: p.onCellAction,
      },
      shouldSelectOnPressUp: p.shouldSelectOnPressUp,
      focusMode: p.focusMode,
    });
  };

  // Update table data whenever props/state changes
  createMemo(() => {
    storeTableData();
  });

  // Announce sort changes (only after initial render)
  createEffect(
    on(
      () => state().sortDescriptor,
      (sortDescriptor) => {
        if (isFirstRender) {
          isFirstRender = false;
          prevSortDescriptor = sortDescriptor;
          return;
        }

        if (
          sortDescriptor &&
          (sortDescriptor.column !== prevSortDescriptor?.column ||
            sortDescriptor.direction !== prevSortDescriptor?.direction)
        ) {
          const collection = state().collection;
          const column = collection.columns.find((c) => c.key === sortDescriptor.column);
          const columnName = column?.textValue ?? String(sortDescriptor.column);
          const directionText =
            sortDescriptor.direction === "ascending" ? "ascending" : "descending";

          announce(`Sorted by ${columnName}, ${directionText}`, "assertive", 500);
        }

        prevSortDescriptor = sortDescriptor;
      },
    ),
  );

  // Keyboard navigation handler with full 2D navigation
  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const collection = s.collection;
    const p = props();
    const focusMode = p.focusMode ?? "row";
    const isRTL = locale().direction === "rtl";
    const setFocusedKey = (key: Key) => {
      s.setFocusedKey(key);
    };
    const runTypeahead = (focusedKey: Key, focusedItem: GridNode<T>) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
        return false;
      }

      // A leading Spacebar is a selection/action key, not the start of a type-ahead
      // search. Mirror upstream useTypeSelect (`search.length === 0 && character === ' '`)
      // and let it fall through so the focused row's own Space handler toggles selection.
      // Once a search is active, Space continues the query as normal.
      if (e.key === " " && typeaheadBuffer.length === 0) {
        return false;
      }

      typeaheadBuffer += e.key.toLocaleLowerCase();
      if (typeaheadTimeout) {
        clearTimeout(typeaheadTimeout);
      }
      typeaheadTimeout = setTimeout(() => {
        typeaheadBuffer = "";
        typeaheadTimeout = undefined;
      }, 500);

      const rows = Array.from(collection).filter((node) => !s.isDisabled(node.key));
      if (rows.length === 0) {
        return true;
      }

      const currentRowKey =
        isCell(focusedItem) && focusedItem.parentKey != null ? focusedItem.parentKey : focusedKey;
      const currentIndex = rows.findIndex((node) => node.key === currentRowKey);
      const orderedRows =
        currentIndex >= 0
          ? [...rows.slice(currentIndex + 1), ...rows.slice(0, currentIndex + 1)]
          : rows;
      const match = orderedRows.find((node) =>
        collection.getTextValue(node.key).toLocaleLowerCase().startsWith(typeaheadBuffer),
      );

      if (match) {
        e.preventDefault();
        setFocusedKey(match.key);
      }

      return true;
    };

    if (s.isKeyboardNavigationDisabled) {
      return;
    }

    const focusedKey = s.focusedKey;
    if (focusedKey == null) {
      // If nothing is focused, focus the first item
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        const firstKey = collection.getFirstKey();
        if (firstKey != null) {
          e.preventDefault();
          setFocusedKey(firstKey);
        }
      }
      return;
    }

    const focusedItem = collection.getItem(focusedKey);
    if (!focusedItem) return;

    let nextKey: Key | null = null;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        // If focused on a cell, move to the same column in the next row
        if (isCell(focusedItem) && focusedItem.parentKey != null) {
          const nextRowKey = collection.getKeyAfter(focusedItem.parentKey);
          if (nextRowKey != null) {
            const cellIndex = focusedItem.index;
            const nextCell = getCellAtIndex(collection, nextRowKey, cellIndex);
            nextKey = nextCell?.key ?? nextRowKey;
          }
        } else {
          // Move to next row
          nextKey = collection.getKeyAfter(focusedKey);
        }
        break;
      }

      case "ArrowUp": {
        e.preventDefault();
        // If focused on a cell, move to the same column in the previous row
        if (isCell(focusedItem) && focusedItem.parentKey != null) {
          const prevRowKey = collection.getKeyBefore(focusedItem.parentKey);
          if (prevRowKey != null) {
            const cellIndex = focusedItem.index;
            const prevCell = getCellAtIndex(collection, prevRowKey, cellIndex);
            nextKey = prevCell?.key ?? prevRowKey;
          }
        } else {
          // Move to previous row
          nextKey = collection.getKeyBefore(focusedKey);
        }
        break;
      }

      case "ArrowRight": {
        e.preventDefault();
        const goNext = !isRTL;

        if (isRow(focusedItem)) {
          // If on a row, go to the first/last cell
          const cells = getChildCells(collection, focusedKey);
          if (cells.length > 0) {
            nextKey = goNext ? cells[0].key : cells[cells.length - 1].key;
          }
        } else if (isCell(focusedItem) && focusedItem.parentKey != null) {
          // If on a cell, go to the next/prev cell
          const cells = getChildCells(collection, focusedItem.parentKey);
          const currentIndex = focusedItem.index;
          const targetIndex = goNext ? currentIndex + 1 : currentIndex - 1;

          if (targetIndex >= 0 && targetIndex < cells.length) {
            nextKey = cells[targetIndex].key;
          } else if (focusMode === "row") {
            // Wrap to row
            nextKey = focusedItem.parentKey;
          } else {
            // Wrap to first/last cell
            nextKey = goNext ? cells[0].key : cells[cells.length - 1].key;
          }
        }
        break;
      }

      case "ArrowLeft": {
        e.preventDefault();
        const goNext = isRTL;

        if (isRow(focusedItem)) {
          // If on a row, go to the last/first cell
          const cells = getChildCells(collection, focusedKey);
          if (cells.length > 0) {
            nextKey = goNext ? cells[0].key : cells[cells.length - 1].key;
          }
        } else if (isCell(focusedItem) && focusedItem.parentKey != null) {
          // If on a cell, go to the prev/next cell
          const cells = getChildCells(collection, focusedItem.parentKey);
          const currentIndex = focusedItem.index;
          const targetIndex = goNext ? currentIndex + 1 : currentIndex - 1;

          if (targetIndex >= 0 && targetIndex < cells.length) {
            nextKey = cells[targetIndex].key;
          } else if (focusMode === "row") {
            // Wrap to row
            nextKey = focusedItem.parentKey;
          } else {
            // Wrap to first/last cell
            nextKey = goNext ? cells[0].key : cells[cells.length - 1].key;
          }
        }
        break;
      }

      case "Home": {
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+Home: Go to first row/cell
          const firstRowKey = collection.getFirstKey();
          if (firstRowKey != null) {
            if (isCell(focusedItem) || focusMode === "cell") {
              const cells = getChildCells(collection, firstRowKey);
              nextKey = cells[0]?.key ?? firstRowKey;
            } else {
              nextKey = firstRowKey;
            }
          }
        } else if (isCell(focusedItem) && focusedItem.parentKey != null) {
          // Home: Go to first cell in current row
          const cells = getChildCells(collection, focusedItem.parentKey);
          nextKey = cells[0]?.key ?? null;
        } else {
          // On row: go to first row
          nextKey = collection.getFirstKey();
        }
        break;
      }

      case "End": {
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+End: Go to last row/cell
          const lastRowKey = collection.getLastKey();
          if (lastRowKey != null) {
            if (isCell(focusedItem) || focusMode === "cell") {
              const cells = getChildCells(collection, lastRowKey);
              nextKey = cells[cells.length - 1]?.key ?? lastRowKey;
            } else {
              nextKey = lastRowKey;
            }
          }
        } else if (isCell(focusedItem) && focusedItem.parentKey != null) {
          // End: Go to last cell in current row
          const cells = getChildCells(collection, focusedItem.parentKey);
          nextKey = cells[cells.length - 1]?.key ?? null;
        } else {
          // On row: go to last row
          nextKey = collection.getLastKey();
        }
        break;
      }

      case "PageDown": {
        e.preventDefault();
        // Move down by roughly a page (using DOM measurements if available)
        const el = ref();
        if (el && el.clientHeight > 0) {
          const visibleHeight = el.clientHeight;
          let currentKey: Key | null = focusedKey;
          let traveled = 0;

          // If on a cell, start from the parent row
          if (isCell(focusedItem) && focusedItem.parentKey != null) {
            currentKey = focusedItem.parentKey;
          }

          // Move down until we've traveled approximately one page
          while (currentKey != null && traveled < visibleHeight) {
            const next = collection.getKeyAfter(currentKey);
            if (next == null) break;

            // Estimate row height (default to 40px if we can't measure)
            const rowElement = el.querySelector(`[data-key="${currentKey}"]`);
            traveled += rowElement?.clientHeight ?? 40;
            currentKey = next;
          }

          if (currentKey != null) {
            // If we started on a cell, focus the same column in the new row
            if (isCell(focusedItem)) {
              const cellIndex = focusedItem.index;
              const targetCell = getCellAtIndex(collection, currentKey, cellIndex);
              nextKey = targetCell?.key ?? currentKey;
            } else {
              nextKey = currentKey;
            }
          }
        } else {
          // Fallback: move 10 rows
          let count = 10;
          let current: Key | null =
            isCell(focusedItem) && focusedItem.parentKey != null
              ? focusedItem.parentKey
              : focusedKey;
          while (count > 0 && current != null) {
            const next = collection.getKeyAfter(current);
            if (next == null) break;
            current = next;
            count--;
          }
          if (current != null && isCell(focusedItem)) {
            const targetCell = getCellAtIndex(collection, current, focusedItem.index);
            nextKey = targetCell?.key ?? current;
          } else {
            nextKey = current;
          }
        }
        break;
      }

      case "PageUp": {
        e.preventDefault();
        // Move up by roughly a page
        const el = ref();
        if (el && el.clientHeight > 0) {
          const visibleHeight = el.clientHeight;
          let currentKey: Key | null = focusedKey;
          let traveled = 0;

          // If on a cell, start from the parent row
          if (isCell(focusedItem) && focusedItem.parentKey != null) {
            currentKey = focusedItem.parentKey;
          }

          // Move up until we've traveled approximately one page
          while (currentKey != null && traveled < visibleHeight) {
            const prev = collection.getKeyBefore(currentKey);
            if (prev == null) break;

            const rowElement = el.querySelector(`[data-key="${currentKey}"]`);
            traveled += rowElement?.clientHeight ?? 40;
            currentKey = prev;
          }

          if (currentKey != null) {
            if (isCell(focusedItem)) {
              const cellIndex = focusedItem.index;
              const targetCell = getCellAtIndex(collection, currentKey, cellIndex);
              nextKey = targetCell?.key ?? currentKey;
            } else {
              nextKey = currentKey;
            }
          }
        } else {
          // Fallback: move 10 rows
          let count = 10;
          let current: Key | null =
            isCell(focusedItem) && focusedItem.parentKey != null
              ? focusedItem.parentKey
              : focusedKey;
          while (count > 0 && current != null) {
            const prev = collection.getKeyBefore(current);
            if (prev == null) break;
            current = prev;
            count--;
          }
          if (current != null && isCell(focusedItem)) {
            const targetCell = getCellAtIndex(collection, current, focusedItem.index);
            nextKey = targetCell?.key ?? current;
          } else {
            nextKey = current;
          }
        }
        break;
      }

      case "Escape":
        if (p.escapeKeyBehavior !== "none") {
          s.clearSelection();
        }
        return;

      case "a":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (s.selectionMode === "multiple") {
            s.selectAll();
          }
        }
        return;

      // NOTE: Space/Enter selection is intentionally NOT handled here. Upstream
      // useSelectableCollection has no ' '/Enter case — keyboard selection is owned
      // by the row (useSelectableItem, ported in createTableRow). Handling it here too
      // double-toggled the selection (row toggles on, grid toggles back off → no-op),
      // since the row handler does not stop propagation. Space/Enter fall through to
      // the type-ahead path below, which ignores a leading Space and bails on Enter.

      default:
        if (runTypeahead(focusedKey, focusedItem)) {
          return;
        }
        return;
    }

    if (nextKey != null) {
      setFocusedKey(nextKey);

      // Handle shift+arrow for range selection
      if (e.shiftKey && s.selectionMode === "multiple") {
        // For cells, select the parent row
        const focusedNode = collection.getItem(nextKey);
        const keyToSelect =
          focusedNode && isCell(focusedNode) && focusedNode.parentKey != null
            ? focusedNode.parentKey
            : nextKey;
        s.extendSelection(keyToSelect);
      }
    }
  };

  // Focus handling
  const onFocus = (e: FocusEvent) => {
    const s = state();
    const el = ref();

    if (!el?.contains(e.target as Element)) {
      return;
    }

    if (!s.isFocused) {
      s.setFocused(true);

      // If no key is focused, focus the first one
      if (s.focusedKey == null) {
        const firstKey = s.collection.getFirstKey();
        if (firstKey != null) {
          s.setFocusedKey(firstKey);
        }
      }
    }
  };

  const onBlur = (e: FocusEvent) => {
    const s = state();
    const el = ref();

    // Only blur if focus is leaving the table entirely
    if (el && !el.contains(e.relatedTarget as Element)) {
      s.setFocused(false);
    }
  };

  // Mirror React Aria's useSelectableCollection: once the roving tabindex for
  // the focused key has been committed to the DOM, move browser focus onto that
  // element from a post-commit effect — looking it up by its stable data-key
  // rather than by transient tabindex. Doing this imperatively during the key
  // handler (in a microtask) raced Solid's reconciliation and dropped focus to
  // <body>, so Space/Enter never reached the grid's selection handler.
  createEffect(() => {
    const s = state();
    const key = s.focusedKey;
    const el = ref();
    if (!el || key == null) {
      return;
    }

    // Only manage focus while it already lives inside the table — i.e. the user
    // is navigating with the keyboard. We gate on the *physical* position of
    // browser focus rather than the grid's logical `isFocused` signal: focus can
    // land directly on a row (a pointer click, or programmatic row focus) without
    // ever firing the grid's own non-bubbling focus handler, so `isFocused` stays
    // false even though the table genuinely holds focus. The contains() check is
    // also what keeps us from pulling focus back from elsewhere on the page when
    // the focused key changes from a background interaction.
    const active = document.activeElement;
    if (!active || (active !== el && !el.contains(active))) {
      return;
    }

    const target = el.querySelector<HTMLElement>(`[data-key="${key}"]`);
    if (target && target !== active) {
      target.focus();

      // Reveal the newly focused row/cell when navigating with the keyboard,
      // mirroring useSelectableCollection. Pointer-driven focus changes should
      // not shift the scroll position under the user's finger.
      if (getInteractionModality() !== "pointer") {
        scrollIntoViewport(target, { containingElement: el });
      }
    }
  });

  // Warn if no label is provided
  createMemo(() => {
    const p = props();
    if (!p["aria-label"] && !p["aria-labelledby"]) {
      console.warn("Table: An aria-label or aria-labelledby prop is required for accessibility.");
    }
  });

  const gridProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = {
      role: "grid",
      id,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      "aria-multiselectable": s.selectionMode === "multiple" ? "true" : undefined,
      // Keep the grid itself tabbable so keyboard users can enter
      // row/cell navigation without requiring a prior pointer interaction.
      tabIndex: 0,
      onKeyDown,
      onFocus,
      onBlur,
    };

    if (p.isVirtualized) {
      baseProps["aria-rowcount"] = s.collection.rowCount;
      baseProps["aria-colcount"] = s.collection.columnCount;
    }

    return baseProps as JSX.HTMLAttributes<HTMLTableElement>;
  });

  return {
    get gridProps() {
      return gridProps();
    },
  };
}
