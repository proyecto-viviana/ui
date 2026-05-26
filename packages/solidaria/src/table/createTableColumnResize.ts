/**
 * ARIA hook for table column resize interactions.
 * Based on @react-aria/table/useTableColumnResize.
 *
 * Provides pointer-drag and keyboard-based column resizing with
 * correct ARIA attributes for screen readers.
 */

import { createSignal, createMemo, type Accessor, type JSX } from "solid-js";
import type { Key, TableColumnResizeState } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";

export interface CreateTableColumnResizeProps {
  /** The column being resized. */
  column: { key: Key };
  /** Accessible label for the resizer. */
  "aria-label": string;
  /** Whether resizing is disabled. */
  isDisabled?: boolean;
  /** Called when a resize operation starts. */
  onResizeStart?: (widths: Map<Key, number>) => void;
  /** Called during resize with updated widths. */
  onResize?: (widths: Map<Key, number>) => void;
  /** Called when resize operation ends. */
  onResizeEnd?: (widths: Map<Key, number>) => void;
}

export interface TableColumnResizeResult {
  /** Props for the visible resizer handle element (div). */
  resizerProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the hidden range input (screen reader accessible). */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Whether this column is currently being resized. */
  isResizing: Accessor<boolean>;
}

const KEYBOARD_STEP = 10; // px per arrow key press

/**
 * Creates ARIA-compliant column resize behavior.
 *
 * Returns props for a visible drag handle (div) and a visually-hidden
 * range input that allows keyboard and screen-reader users to resize columns.
 */
export function createTableColumnResize(
  props: Accessor<CreateTableColumnResizeProps>,
  state: Accessor<TableColumnResizeState>,
): TableColumnResizeResult {
  const getProps = () => props();
  const getState = () => state();
  const locale = useLocale();

  const [isPointerDragging, setIsPointerDragging] = createSignal(false);
  const [isKeyboardResizing, setIsKeyboardResizing] = createSignal(false);

  const isResizing = createMemo(() => getState().resizingColumn() === getProps().column.key);

  const isRtl = createMemo(() => {
    const l = locale();
    return l?.direction === "rtl";
  });

  // ---- Pointer (mouse/touch) drag ----

  let startX = 0;
  let startWidth = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (getProps().isDisabled) return;
    e.preventDefault();
    e.stopPropagation();

    const key = getProps().column.key;
    startX = e.clientX;
    startWidth = getState().getColumnWidth(key);

    getState().startResize(key);
    getProps().onResizeStart?.(getState().columnWidths());
    setIsPointerDragging(true);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isPointerDragging()) return;
    e.preventDefault();

    const deltaX = e.clientX - startX;
    const direction = isRtl() ? -1 : 1;
    const newWidth = startWidth + deltaX * direction;

    const key = getProps().column.key;
    const widths = getState().updateResizedColumns(key, newWidth);
    getProps().onResize?.(widths);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isPointerDragging()) return;
    e.preventDefault();
    setIsPointerDragging(false);
    getState().endResize();
    getProps().onResizeEnd?.(getState().columnWidths());
  };

  // ---- Keyboard resize (on the hidden input) ----

  const onKeyDown = (e: KeyboardEvent) => {
    if (getProps().isDisabled) return;

    const key = getProps().column.key;
    const rtlMul = isRtl() ? -1 : 1;

    switch (e.key) {
      case "Enter": {
        if (isKeyboardResizing()) {
          // End resize
          setIsKeyboardResizing(false);
          getState().endResize();
          getProps().onResizeEnd?.(getState().columnWidths());
        } else {
          // Start resize
          setIsKeyboardResizing(true);
          getState().startResize(key);
          getProps().onResizeStart?.(getState().columnWidths());
        }
        e.preventDefault();
        break;
      }
      case "Escape": {
        if (isKeyboardResizing()) {
          setIsKeyboardResizing(false);
          getState().endResize();
          getProps().onResizeEnd?.(getState().columnWidths());
          e.preventDefault();
        }
        break;
      }
      case "Tab": {
        if (isKeyboardResizing()) {
          setIsKeyboardResizing(false);
          getState().endResize();
          getProps().onResizeEnd?.(getState().columnWidths());
        }
        // Let Tab propagate for focus management
        break;
      }
      case "ArrowRight": {
        if (isKeyboardResizing()) {
          const currentWidth = getState().getColumnWidth(key);
          const widths = getState().updateResizedColumns(
            key,
            currentWidth + KEYBOARD_STEP * rtlMul,
          );
          getProps().onResize?.(widths);
          e.preventDefault();
        }
        break;
      }
      case "ArrowLeft": {
        if (isKeyboardResizing()) {
          const currentWidth = getState().getColumnWidth(key);
          const widths = getState().updateResizedColumns(
            key,
            currentWidth - KEYBOARD_STEP * rtlMul,
          );
          getProps().onResize?.(widths);
          e.preventDefault();
        }
        break;
      }
    }
  };

  // Handle input change (from screen reader range slider)
  const onInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newWidth = parseFloat(input.value);
    if (isNaN(newWidth)) return;

    const key = getProps().column.key;
    if (!isResizing()) {
      getState().startResize(key);
      getProps().onResizeStart?.(getState().columnWidths());
    }

    const widths = getState().updateResizedColumns(key, newWidth);
    getProps().onResize?.(widths);

    // End immediately for discrete input changes
    getState().endResize();
    getProps().onResizeEnd?.(getState().columnWidths());
  };

  // Visible resize handle props. The accessible resize control is the hidden
  // range input below, matching React Aria's ColumnResizer structure.
  const resizerProps: JSX.HTMLAttributes<HTMLDivElement> = {
    role: "presentation",
    tabIndex: -1,
    style: {
      "touch-action": "none",
      cursor: "col-resize",
    },
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };

  // Visually hidden range input props
  const inputProps: JSX.InputHTMLAttributes<HTMLInputElement> = {
    get type() {
      return "range";
    },
    get tabIndex() {
      return getProps().isDisabled ? -1 : 0;
    },
    get disabled() {
      return getProps().isDisabled;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-orientation"() {
      return "horizontal" as const;
    },
    get min() {
      return getState().getColumnMinWidth(getProps().column.key);
    },
    get max() {
      const maxW = getState().getColumnMaxWidth(getProps().column.key);
      return maxW === Infinity ? 9999 : maxW;
    },
    get value() {
      return getState().getColumnWidth(getProps().column.key);
    },
    style: {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      "white-space": "nowrap",
      "border-width": "0",
    },
    onKeyDown,
    onChange: onInputChange,
  };

  return {
    resizerProps,
    inputProps,
    isResizing,
  };
}
