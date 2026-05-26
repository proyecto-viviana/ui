/**
 * createTreeItem - Provides accessibility for a tree item.
 * Based on @react-aria/tree/useTreeItem.
 */

import { createMemo, createSignal, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TreeState, TreeCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTreeItemProps, TreeItemAria } from "./types";
import { getTreeData } from "./createTree";

/**
 * Creates accessibility props for a tree item.
 */
export function createTreeItem<T extends object, C extends TreeCollection<T> = TreeCollection<T>>(
  props: Accessor<AriaTreeItemProps<T>>,
  state: Accessor<TreeState<T, C>>,
  _ref: Accessor<HTMLElement | null>,
): TreeItemAria {
  const [isPressed, setIsPressed] = createSignal(false);
  const rowId = createId();
  const expandButtonId = createId();

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.node.key);
  });

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return p.isDisabled === true || s.isDisabled(p.node.key);
  });

  const isFocused = createMemo(() => {
    const s = state();
    const p = props();
    return s.focusedKey === p.node.key;
  });

  const isExpanded = createMemo(() => {
    const s = state();
    const p = props();
    return s.isExpanded(p.node.key);
  });

  const isExpandable = createMemo(() => {
    const p = props();
    return p.node.isExpandable ?? false;
  });

  const level = createMemo(() => {
    const p = props();
    return p.node.level;
  });

  // Handle click/press for selection and actions
  const onClick = (e: MouseEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    // Get tree metadata for actions
    const treeData = getTreeData(s);
    const onAction = treeData?.actions.onAction;

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

  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();

    if (isDisabled()) return;

    if (e.key === "Enter") {
      // Get tree metadata for actions
      const treeData = getTreeData(s);
      const onAction = treeData?.actions.onAction;

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
      // Space toggles selection
      if (s.selectionMode !== "none") {
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
    setIsPressed(true);
  };

  const onPointerUp = () => {
    setIsPressed(false);
  };

  // Compute sibling position (aria-posinset/aria-setsize)
  const siblingInfo = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;
    const parentKey = node.parentKey;

    if (parentKey != null) {
      const parentNode = s.collection.getItem(parentKey);
      if (parentNode) {
        return {
          posinset: node.index + 1, // 1-based
          setsize: parentNode.childNodes.length,
        };
      }
    }

    // Root-level: count root nodes
    const rootNodes = s.collection.rows.filter((n) => n.level === 0);
    const rootIndex = rootNodes.findIndex((n) => n.key === node.key);
    return {
      posinset: rootIndex >= 0 ? rootIndex + 1 : node.index + 1,
      setsize: rootNodes.length,
    };
  });

  const rowProps = createMemo(() => {
    const s = state();
    const p = props();
    const node = p.node;
    const { posinset, setsize } = siblingInfo();

    // Use textValue for aria-label (if available), or explicit textValue prop
    const textValue = p.textValue ?? node.textValue;

    const baseProps: Record<string, unknown> = {
      role: "row",
      id: rowId,
      "aria-label": textValue || undefined,
      "aria-selected": s.selectionMode !== "none" ? isSelected() : undefined,
      "aria-disabled": isDisabled() || undefined,
      "aria-expanded": isExpandable() ? isExpanded() : undefined,
      "aria-level": node.level + 1, // 1-based for ARIA
      "aria-posinset": posinset,
      "aria-setsize": setsize,
      tabIndex: isFocused() ? 0 : -1,
      onClick,
      onKeyDown,
      onFocus,
      onPointerDown,
      onPointerUp,
    };

    // Add aria-rowindex for virtualized trees
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return baseProps as JSX.HTMLAttributes<HTMLDivElement>;
  });

  const gridCellProps = createMemo(() => {
    return {
      role: "gridcell",
    } as JSX.HTMLAttributes<HTMLDivElement>;
  });

  // Expand button handler
  const onExpandClick = (e: MouseEvent) => {
    e.stopPropagation(); // Don't trigger row click
    const s = state();
    const p = props();

    if (isDisabled()) return;

    s.toggleKey(p.node.key);
  };

  const stopPointerPropagation = (e: Event) => {
    // Prevent row pointer handlers from flipping pressed state and re-rendering
    // before the button click handler can run.
    e.stopPropagation();
  };

  const expandButtonProps = createMemo(() => {
    const baseProps: Record<string, unknown> = {
      type: "button",
      id: expandButtonId,
      "aria-label": isExpanded() ? "Collapse" : "Expand",
      "aria-labelledby": isExpandable() ? `${expandButtonId} ${rowId}` : undefined,
      onClick: onExpandClick,
      onPointerDown: stopPointerPropagation,
      onPointerUp: stopPointerPropagation,
      onMouseDown: stopPointerPropagation,
      onMouseUp: stopPointerPropagation,
      tabIndex: -1, // Not in tab order, use arrow keys
      "aria-hidden": !isExpandable() ? true : undefined,
    };

    return baseProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  });

  return {
    get rowProps() {
      return rowProps();
    },
    get gridCellProps() {
      return gridCellProps();
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
    get isExpandable() {
      return isExpandable();
    },
    get level() {
      return level();
    },
  };
}
