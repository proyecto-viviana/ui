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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/grid/useGridCell.ts

/**
 * createGridCell - Provides accessibility for a grid cell.
 * Based on @react-aria/grid/useGridCell.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { GridState, GridCollection } from "@proyecto-viviana/solid-stately";
import type { GridCellProps, GridCellAria } from "./types";
import { getGridData } from "./createGrid";

/**
 * Creates accessibility props for a grid cell.
 */
export function createGridCell<T extends object>(
  props: Accessor<GridCellProps>,
  state: Accessor<GridState<T, GridCollection<T>>>,
  _ref: Accessor<HTMLElement | null>,
): GridCellAria {
  const [isPressed, setIsPressed] = createSignal(false);

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    // Check if parent row is selected
    const node = s.collection.getItem(p.key);
    if (node?.parentKey != null) {
      return s.isSelected(node.parentKey);
    }
    return false;
  });

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    // Check if parent row is disabled
    const node = s.collection.getItem(p.key);
    if (node?.parentKey != null) {
      return s.isDisabled(node.parentKey);
    }
    return false;
  });

  const isFocused = createMemo(() => {
    const s = state();
    const p = props();
    return s.focusedKey === p.key;
  });

  // Handle click/press for cell actions
  const onClick = (e: MouseEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Get grid metadata for actions
    const gridData = getGridData(s);
    const onCellAction = gridData?.actions.onCellAction;

    // Get parent row key for selection
    const node = s.collection.getItem(p.key);
    const rowKey = node?.parentKey;

    // Handle selection on parent row
    if (rowKey != null && s.selectionMode !== "none") {
      if (e.shiftKey && s.selectionMode === "multiple") {
        s.extendSelection(rowKey);
      } else if (e.ctrlKey || e.metaKey) {
        s.toggleSelection(rowKey);
      } else {
        // Replace selection
        s.replaceSelection(rowKey);
      }
    }

    // Call cell action handler
    if (onCellAction) {
      onCellAction(p.key);
    }

    if (p.onAction) {
      p.onAction();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Enter or Space triggers cell action
    if (e.key === "Enter" || e.key === " ") {
      // Only handle if there's an action to trigger
      const gridData = getGridData(s);
      const onCellAction = gridData?.actions.onCellAction;

      if (onCellAction || p.onAction) {
        e.preventDefault();

        if (onCellAction) {
          onCellAction(p.key);
        }

        if (p.onAction) {
          p.onAction();
        }
      }
    }
  };

  const onFocus = () => {
    const s = state();
    const p = props();
    s.setFocusedKey(p.key);
  };

  const onPointerDown = () => {
    setIsPressed(true);
  };

  const onPointerUp = () => {
    setIsPressed(false);
  };

  const cellProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = s.collection.getItem(p.key);

    // Determine the role based on node type
    let role: string = "gridcell";
    if (node?.type === "rowheader") {
      role = "rowheader";
    } else if (node?.type === "column") {
      role = "columnheader";
    }

    const baseProps: Record<string, unknown> = {
      role,
      "aria-disabled": isDisabled() || undefined,
      "aria-selected": s.selectionMode !== "none" ? isSelected() : undefined,
      tabIndex: isFocused() ? 0 : -1,
      onClick,
      onKeyDown,
      onFocus,
      onPointerDown,
      onPointerUp,
    };

    // Add column index for virtualized grids
    if (p.isVirtualized && node?.column != null) {
      baseProps["aria-colindex"] = node.column + 1; // aria-colindex is 1-based
    }

    // Add colspan if present
    if (node?.colspan != null && node.colspan > 1) {
      baseProps["aria-colspan"] = node.colspan;
    }

    return baseProps as JSX.HTMLAttributes<HTMLElement>;
  });

  return {
    get cellProps() {
      return cellProps();
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
    get isFocused() {
      return isFocused();
    },
  };
}
