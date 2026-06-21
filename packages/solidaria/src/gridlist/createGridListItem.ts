/**
 * createGridListItem - Provides accessibility for a grid list item.
 * Based on @react-aria/gridlist/useGridListItem.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { GridState, GridCollection } from "@proyecto-viviana/solid-stately";
import type { AriaGridListItemProps, GridListItemAria } from "./types";
import { getGridListData } from "./createGridList";

/**
 * Creates accessibility props for a grid list item.
 */
export function createGridListItem<
  T extends object,
  C extends GridCollection<T> = GridCollection<T>,
>(
  props: Accessor<AriaGridListItemProps>,
  state: Accessor<GridState<T, C>>,
  _ref: Accessor<HTMLElement | null>,
): GridListItemAria {
  const [isPressed, setIsPressed] = createSignal(false);
  let isPointerPressed = false;
  let ignoreNextClick = false;

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.node.key);
  });

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return s.isDisabled(p.node.key);
  });

  // Disabled keys only block keyboard interaction under disabledBehavior "all".
  // Under "selection" the row stays focusable and actionable; selection itself is
  // still blocked (state.toggleSelection self-guards on the raw disabled set, and
  // the Space branch below guards too). Mirrors SelectionManager.isDisabled /
  // ListKeyboardDelegate.isDisabled in React Aria — and the grid hook's own
  // navigation gate, now that selection/activation live here rather than on the
  // grid container.
  const isInteractionDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return s.isDisabled(p.node.key) && s.disabledBehavior === "all";
  });

  const isFocused = createMemo(() => {
    const s = state();
    const p = props();
    return s.focusedKey === p.node.key;
  });

  const handleActivation = (e: MouseEvent | PointerEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Get grid list metadata for actions
    const gridListData = getGridListData(s);
    const onAction = gridListData?.actions.onAction;

    // Handle selection
    if (s.selectionMode !== "none") {
      if (e.shiftKey && s.selectionMode === "multiple") {
        s.extendSelection(p.node.key);
      } else if (p.selectionBehavior === "toggle" || e.ctrlKey || e.metaKey) {
        s.toggleSelection(p.node.key);
      } else {
        // Replace selection or toggle if already selected
        if (isSelected() && s.selectedKeys !== "all") {
          const selectedKeys = s.selectedKeys as Set<unknown>;
          if (selectedKeys.size === 1) {
            // Single selection, trigger action
            if (onAction) {
              onAction(p.node.key);
            }
            if (p.onAction) {
              p.onAction();
            }
          } else {
            s.replaceSelection(p.node.key);
          }
        } else {
          s.replaceSelection(p.node.key);
        }
      }
    } else {
      // No selection mode, just trigger action
      if (onAction) {
        onAction(p.node.key);
      }
      if (p.onAction) {
        p.onAction();
      }
    }
  };

  // Handle click/press for selection and actions.
  const onClick = (e: MouseEvent) => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }

    handleActivation(e);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();

    if (isInteractionDisabled()) return;

    if (e.key === "Enter") {
      // Get grid list metadata for actions
      const gridListData = getGridListData(s);
      const onAction = gridListData?.actions.onAction;

      if (onAction || p.onAction) {
        e.preventDefault();

        if (onAction) {
          onAction(p.node.key);
        }

        if (p.onAction) {
          p.onAction();
        }
      }
    } else if (e.key === " " || e.key === "Space" || e.key === "Spacebar") {
      // Space toggles selection. Guard on the raw disabled set so a row that is
      // focusable-but-not-selectable (disabledBehavior "selection") treats Space
      // as a no-op rather than preventing default scroll on a toggle that state
      // would reject anyway.
      if (s.selectionMode !== "none" && !s.isDisabled(p.node.key)) {
        e.preventDefault();
        s.toggleSelection(p.node.key);
      }
    }
  };

  const onFocus = () => {
    const s = state();
    const p = props();
    s.setFocusedKey(p.node.key);
  };

  const onPointerDown = () => {
    if (isDisabled()) return;
    isPointerPressed = true;
    setIsPressed(true);
  };

  const onPointerUp = (e: PointerEvent) => {
    const wasPointerPressed = isPointerPressed;
    isPointerPressed = false;
    setIsPressed(false);

    if (!wasPointerPressed || isDisabled()) return;

    const currentTarget = e.currentTarget;
    const target = e.target;
    if (
      currentTarget instanceof HTMLElement &&
      target instanceof Node &&
      !currentTarget.contains(target)
    ) {
      return;
    }

    ignoreNextClick = true;
    handleActivation(e);
  };

  const onPointerCancel = () => {
    isPointerPressed = false;
    setIsPressed(false);
  };

  const onPointerLeave = () => {
    isPointerPressed = false;
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
      onKeyDown,
      onFocus,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    };

    // Add aria-rowindex for virtualized lists
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return baseProps as JSX.HTMLAttributes<HTMLElement>;
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
      return isDisabled();
    },
    get isPressed() {
      return isPressed();
    },
  };
}
