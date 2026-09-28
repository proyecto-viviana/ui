/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTableColumnResize.ts

/**
 * ARIA hook for table column resize interactions.
 * Based on @react-aria/table/useTableColumnResize.
 *
 * Provides pointer-drag and keyboard-based column resizing with
 * correct ARIA attributes for screen readers.
 */

import { createSignal, createMemo, onCleanup, createTrackedEffect } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Key, TableColumnResizeState } from "@proyecto-viviana/solid-stately";
import { createStringFormatter, useLocale } from "../i18n";
import { tableIntlStrings } from "./intl";
import { createInteractionModality } from "../interactions/createInteractionModality";
import { createMove } from "../interactions/createMove";
import { createPress } from "../interactions/createPress";
import { createKeyboard } from "../interactions/createKeyboard";
import { createDescription } from "../utils/createDescription";
import { mergeProps } from "../utils/mergeProps";
import { focusSafely } from "../utils/focus";
import { createGlobalListeners } from "../utils";

export interface CreateTableColumnResizeProps {
  /** The column being resized. */
  column: { key: Key };
  /** Accessible label for the resizer. */
  "aria-label": string;
  /**
   * Ref to the trigger if resizing was started from a column header menu. If it's provided, focus
   * will be returned there when resizing is done.
   */
  triggerRef?: () => HTMLElement | null;
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
  /**
   * Whether this column is currently being resized via a mouse drag (e.g. to render a cursor
   * overlay).
   */
  isMouseResizing: Accessor<boolean>;
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
  inputRef?: () => HTMLInputElement | null,
): TableColumnResizeResult {
  const getProps = () => props();
  const getState = () => state();
  const locale = useLocale();
  const stringFormatter = createStringFormatter(tableIntlStrings, "@react-aria/table");
  const { modality } = createInteractionModality();

  let isResizingRef = false;
  let lastSize: Map<Key, number> | null = null;
  let wasFocusedOnResizeStart = false;

  const [isMouseResizing, setIsMouseResizing] = createSignal(false);
  const isResizing = createMemo(() => getState().resizingColumn() === getProps().column.key);
  // useTableColumnResize describes the hidden input only for keyboard and
  // virtual users, and only while a column-header menu trigger is absent.
  const descriptionProps = createDescription(() => {
    const trigger = getProps().triggerRef?.() ?? null;
    let current = modality();
    if (current === "virtual" && typeof window !== "undefined" && "ontouchstart" in window) {
      current = null;
    }
    if (trigger != null || (current !== "keyboard" && current !== "virtual") || isResizing()) {
      return undefined;
    }
    return stringFormatter().format("resizerDescription");
  });

  const isRtl = createMemo(() => {
    const l = locale();
    return l?.direction === "rtl";
  });

  const { addGlobalListener, removeAllGlobalListeners } = createGlobalListeners();

  let internalInputRef: HTMLInputElement | null = null;
  const getInput = () => inputRef?.() ?? internalInputRef;

  const focusInput = () => {
    const input = getInput();
    if (input) {
      focusSafely(input);
    }
  };

  const startResize = () => {
    const key = getProps().column.key;
    if (!isResizingRef) {
      lastSize = getState().updateResizedColumns(key, getState().getColumnWidth(key));
      getState().startResize(key);
      (
        getState() as unknown as {
          tableState?: { setKeyboardNavigationDisabled?: (disabled: boolean) => void };
        }
      ).tableState?.setKeyboardNavigationDisabled?.(true);
      getProps().onResizeStart?.(lastSize);

      // Listen for window-level cancel events while resize is active
      const onCancel = () => {
        endResize();
      };
      addGlobalListener("pointercancel", onCancel, { isWindow: true });
      addGlobalListener("touchcancel", onCancel, { isWindow: true });
    }
    isResizingRef = true;
  };

  const resize = (newWidth: number) => {
    const key = getProps().column.key;
    const sizes = getState().updateResizedColumns(key, newWidth);
    getProps().onResize?.(sizes);
    lastSize = sizes;
  };

  const endResize = () => {
    const key = getProps().column.key;
    removeAllGlobalListeners();
    if (isResizingRef || getState().resizingColumn() === key) {
      if (lastSize == null) {
        lastSize = getState().updateResizedColumns(key, getState().getColumnWidth(key));
      }

      getState().endResize();
      (
        getState() as unknown as {
          tableState?: { setKeyboardNavigationDisabled?: (disabled: boolean) => void };
        }
      ).tableState?.setKeyboardNavigationDisabled?.(false);
      getProps().onResizeEnd?.(lastSize);
      isResizingRef = false;

      const trigger = getProps().triggerRef?.();
      if (trigger && !wasFocusedOnResizeStart) {
        focusSafely(trigger);
      }
    }
    lastSize = null;
  };

  // Ensure resize never remains active if component unmounts while resizing
  onCleanup(() => {
    if (isResizingRef || getState().resizingColumn() === getProps().column.key) {
      endResize();
    }
  });

  // Synchronize when state initiates resizing externally (e.g. via column header menu)
  let prevResizingColumn: Key | null = null;
  createTrackedEffect(() => {
    const resizingCol = getState().resizingColumn();
    const key = getProps().column.key;
    if (prevResizingColumn !== resizingCol && resizingCol != null && resizingCol === key) {
      const activeEl = typeof document !== "undefined" ? document.activeElement : null;
      wasFocusedOnResizeStart = activeEl === getInput();
      startResize();
      const timeout = setTimeout(() => focusInput(), 0);
      const voTimeout = setTimeout(() => focusInput(), 400);
      return () => {
        clearTimeout(timeout);
        clearTimeout(voTimeout);
      };
    }
    prevResizingColumn = resizingCol;
  });

  // Shared move lifecycle: drag movements and completion
  const columnResizeWidthRef = { current: 0 };
  const { moveProps } = createMove({
    onMoveStart(e) {
      if (getProps().isDisabled) return;
      const key = getProps().column.key;
      columnResizeWidthRef.current = getState().getColumnWidth(key);
      if (e.pointerType === "mouse") {
        setIsMouseResizing(true);
      }
      startResize();
    },
    onMove(e) {
      if (getProps().isDisabled) return;
      let { deltaX, deltaY, pointerType } = e;
      if (isRtl()) {
        deltaX *= -1;
      }
      if (pointerType === "keyboard") {
        if (deltaY !== 0 && deltaX === 0) {
          deltaX = deltaY * -1;
        }
        deltaX *= KEYBOARD_STEP;
      }
      if (deltaX !== 0) {
        columnResizeWidthRef.current += deltaX;
        resize(columnResizeWidthRef.current);
      }
    },
    onMoveEnd() {
      columnResizeWidthRef.current = 0;
      setIsMouseResizing(false);
      endResize();
    },
  });

  // Press interaction for tap, click, and hold lifecycle
  const { pressProps } = createPress({
    isDisabled: () => getProps().isDisabled ?? false,
    preventFocusOnPress: true,
    onPressStart: (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.pointerType === "keyboard") {
        return;
      }
      if (e.pointerType === "virtual" && getState().resizingColumn() != null) {
        endResize();
        return;
      }

      focusInput();

      if (e.pointerType !== "virtual") {
        startResize();
      }
    },
    onPress: (e) => {
      if (
        ((e.pointerType === "touch" && wasFocusedOnResizeStart) || e.pointerType === "mouse") &&
        getState().resizingColumn() != null
      ) {
        endResize();
      }
    },
    onPressEnd: () => {
      // If press ends or cancels without an active move drag, ensure resize never remains stuck
      if (!isMouseResizing() && columnResizeWidthRef.current === 0) {
        endResize();
      }
    },
  });

  const { keyboardProps } = createKeyboard({
    shortcuts: {
      Escape: () => endResize(),
      Enter: () => {
        if (isResizingRef || getState().resizingColumn() === getProps().column.key) {
          endResize();
        } else {
          startResize();
        }
      },
      " ": () => endResize(),
      Tab: () => endResize(),
    },
  });

  // Keyboard resize on the hidden input
  const onInputKeyDown = (e: KeyboardEvent) => {
    if (getProps().isDisabled) return;
    const key = getProps().column.key;
    const rtlMul = isRtl() ? -1 : 1;

    switch (e.key) {
      case "Enter": {
        e.stopPropagation();
        e.preventDefault();
        if (isResizingRef || getState().resizingColumn() === key) {
          endResize();
        } else {
          startResize();
        }
        break;
      }
      case "Escape": {
        e.stopPropagation();
        e.preventDefault();
        if (isResizingRef || getState().resizingColumn() === key) {
          endResize();
        }
        break;
      }
      case "Tab": {
        if (isResizingRef || getState().resizingColumn() === key) {
          endResize();
        }
        break;
      }
      case "ArrowRight": {
        e.stopPropagation();
        e.preventDefault();
        const currentWidth = getState().getColumnWidth(key);
        resize(currentWidth + KEYBOARD_STEP * rtlMul);
        break;
      }
      case "ArrowLeft": {
        e.stopPropagation();
        e.preventDefault();
        const currentWidth = getState().getColumnWidth(key);
        resize(currentWidth - KEYBOARD_STEP * rtlMul);
        break;
      }
    }
  };

  // Screen reader range input change
  const onInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newWidth = parseFloat(input.value);
    if (isNaN(newWidth)) return;

    const key = getProps().column.key;
    if (!isResizing()) {
      startResize();
    }
    resize(newWidth);
    endResize();
  };

  const resizerProps: JSX.HTMLAttributes<HTMLDivElement> = mergeProps<
    JSX.HTMLAttributes<HTMLDivElement>
  >(
    {
      role: "presentation",
      tabIndex: -1,
    },
    keyboardProps,
    moveProps,
    pressProps,
    {
      style: {
        "touch-action": "none",
        cursor: "col-resize",
      },
    },
  );

  const inputProps: JSX.InputHTMLAttributes<HTMLInputElement> = {
    ref: (el: HTMLInputElement | null) => {
      internalInputRef = el;
    },
    get type() {
      return "range";
    },
    get tabindex() {
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
    get "aria-valuetext"() {
      const value = Math.floor(getState().getColumnWidth(getProps().column.key));
      return stringFormatter().format("columnSize", { value });
    },
    get "aria-describedby"() {
      return descriptionProps["aria-describedby"];
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
    onKeyDown: onInputKeyDown,
    onChange: onInputChange,
    onBlur: () => {
      endResize();
    },
  };

  return {
    resizerProps,
    inputProps,
    isResizing,
    isMouseResizing,
  };
}
