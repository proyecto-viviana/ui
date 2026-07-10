/**
 * createDraggableItem - ARIA hook for draggable items within a collection.
 *
 * Provides accessibility props for items that can be dragged from a collection.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  DraggableCollectionState,
  DragPreviewRenderer,
  DropOperation,
} from "@proyecto-viviana/solid-stately";
import {
  getTypes,
  writeToDataTransfer,
  DROP_OPERATION,
  EFFECT_ALLOWED,
  DROP_EFFECT_TO_DROP_OPERATION,
  setGlobalAllowedDropOperations,
  setGlobalDropEffect,
  getGlobalDropEffect,
} from "./utils";
import { setGlobalDraggingTypes } from "./createDraggableCollection";
import { beginDragging } from "./DragManager";
import { createStringFormatter } from "../i18n/createStringFormatter";
import { dndIntlStrings } from "./intl";

export interface DraggableItemOptions {
  /** The unique key of the item. */
  key: string | number;
  /** Whether the item has a separate drag button affordance. */
  hasDragButton?: boolean;
  /** Whether this item is disabled for dragging. */
  isDisabled?: boolean;
  /** Preview renderer function ref. */
  preview?: { current: DragPreviewRenderer | null };
}

export interface DraggableItemAria {
  /** Props for the draggable item element. */
  dragProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Whether the item is currently being dragged. */
  isDragging: boolean;
}

/**
 * Creates ARIA props for a draggable item within a collection.
 *
 * @param options - Accessor returning item options
 * @param state - Draggable collection state
 * @returns Draggable item ARIA props
 */
export function createDraggableItem(
  options: Accessor<DraggableItemOptions>,
  state: DraggableCollectionState,
): DraggableItemAria {
  const getOptions = createMemo(() => options());

  const stringFormatter = createStringFormatter(dndIntlStrings);

  // Track position for drag move
  let lastX = 0;
  let lastY = 0;

  const isDragging = createMemo(() => {
    const key = getOptions().key;
    return state.draggingKeys.has(key);
  });

  const getKeysForDrag = (): Set<string | number> => {
    const { key } = getOptions();
    // If the key is not selected, only drag that item
    // If it is selected, drag all selected items
    // For now, just return the single key
    return new Set([key]);
  };

  const onDragStart = (e: DragEvent) => {
    if (e.defaultPrevented) return;
    e.stopPropagation();

    const opts = getOptions();
    if (opts.isDisabled || state.isDisabled) return;

    const keys = getKeysForDrag();

    // Start drag state
    state.startDrag(keys, e.clientX, e.clientY);

    // Get items and write to data transfer
    const items = state.getItems(keys);
    setGlobalDraggingTypes(getTypes(items));
    e.dataTransfer?.clearData?.();
    if (e.dataTransfer) {
      writeToDataTransfer(e.dataTransfer, items);
    }

    // Set allowed drop operations
    let allowed = DROP_OPERATION.all;
    const allowedOps = state.getAllowedDropOperations();
    if (allowedOps.length > 0) {
      allowed = DROP_OPERATION.none;
      for (const op of allowedOps) {
        allowed |= DROP_OPERATION[op] || DROP_OPERATION.none;
      }
    }

    setGlobalAllowedDropOperations(allowed);
    const effectAllowed = EFFECT_ALLOWED[allowed] || "none";
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = (
        effectAllowed === "cancel" ? "none" : effectAllowed
      ) as DataTransfer["effectAllowed"];
    }

    // Handle custom preview from item options or collection state.
    const preview = opts.preview ?? state.preview;
    if (typeof preview?.current === "function" && e.dataTransfer) {
      preview.current(items, (node, userX, userY) => {
        if (!node || !e.dataTransfer) return;

        const size = node.getBoundingClientRect();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        let defaultX = e.clientX - rect.x;
        let defaultY = e.clientY - rect.y;

        if (defaultX > size.width || defaultY > size.height) {
          defaultX = size.width / 2;
          defaultY = size.height / 2;
        }

        let offsetX = typeof userX === "number" ? userX : defaultX;
        let offsetY = typeof userY === "number" ? userY : defaultY;

        offsetX = Math.max(0, Math.min(offsetX, size.width));
        offsetY = Math.max(0, Math.min(offsetY, size.height));

        e.dataTransfer.setDragImage(node, offsetX, offsetY);
      });
    }

    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onDrag = (e: DragEvent) => {
    e.stopPropagation();

    if (e.clientX === lastX && e.clientY === lastY) {
      return;
    }

    state.moveDrag(e.clientX, e.clientY);

    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onDragEnd = (e: DragEvent) => {
    e.stopPropagation();

    let dropEffect: string = e.dataTransfer?.dropEffect ?? "none";
    // Chrome Android fix - use global drop effect
    if (getGlobalDropEffect()) {
      dropEffect = getGlobalDropEffect()!;
    }

    const dropOperation = DROP_EFFECT_TO_DROP_OPERATION[dropEffect];
    const isInternal = false; // Would check global state
    state.endDrag(e.clientX, e.clientY, dropOperation, isInternal);

    setGlobalAllowedDropOperations(DROP_OPERATION.none);
    setGlobalDraggingTypes(new Set());
    setGlobalDropEffect(undefined);
  };

  // Keyboard/screen reader drag initiation
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();

      const opts = getOptions();
      if (opts.isDisabled || state.isDisabled) return;

      const el = e.currentTarget as HTMLElement;
      const keys = getKeysForDrag();
      const rect = el.getBoundingClientRect();
      state.startDrag(keys, rect.x + rect.width / 2, rect.y + rect.height / 2);

      const items = state.getItems(keys);
      setGlobalDraggingTypes(getTypes(items));

      const allowedOps = state.getAllowedDropOperations();
      let allowed = DROP_OPERATION.all;
      if (allowedOps.length > 0) {
        allowed = DROP_OPERATION.none;
        for (const op of allowedOps) {
          allowed |= DROP_OPERATION[op] || DROP_OPERATION.none;
        }
      }
      setGlobalAllowedDropOperations(allowed);

      // Hand control to the keyboard DragManager session, which drives
      // Tab-cycling across drop targets and Enter/Escape drop/cancel.
      beginDragging(
        {
          element: el,
          items,
          allowedDropOperations:
            allowedOps.length > 0 ? allowedOps : (["move", "copy", "link"] as DropOperation[]),
          onDragEnd: (ev) => {
            state.endDrag(ev.x, ev.y, ev.dropOperation, false);
            setGlobalAllowedDropOperations(DROP_OPERATION.none);
            setGlobalDraggingTypes(new Set());
            setGlobalDropEffect(undefined);
          },
        },
        stringFormatter(),
      );
    }
  };

  const dragProps = createMemo(() => {
    const opts = getOptions();

    if (opts.isDisabled || state.isDisabled) {
      return {
        draggable: false as const,
      };
    }

    const baseProps: Record<string, unknown> = {
      draggable: true as const,
      onDragStart,
      onDrag,
      onDragEnd,
    };

    // Add keyboard handlers if no separate drag button
    if (!opts.hasDragButton) {
      baseProps.onKeyDown = onKeyDown;
      baseProps.onKeyUp = onKeyUp;
    }

    return baseProps;
  });

  const dragButtonProps = createMemo(() => {
    const opts = getOptions();

    if (opts.isDisabled || state.isDisabled) {
      return {
        disabled: true,
      };
    }

    return {
      type: "button" as const,
      "aria-label": "Drag",
      onKeyDown,
      onKeyUp,
    };
  });

  return {
    get dragProps() {
      return dragProps() as DraggableItemAria["dragProps"];
    },
    get dragButtonProps() {
      return dragButtonProps() as DraggableItemAria["dragButtonProps"];
    },
    get isDragging() {
      return isDragging();
    },
  };
}
