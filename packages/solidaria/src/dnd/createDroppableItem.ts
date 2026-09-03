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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDrop.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDroppableItem.ts

/**
 * createDroppableItem - ARIA hook for droppable items within a collection.
 *
 * Provides accessibility props for items that can receive drops.
 *
 * Ported from:
 * - packages/react-aria/src/dnd/useDroppableItem.ts
 * - packages/react-aria/src/dnd/useDrop.ts
 */

import { createEffect, createMemo, onCleanup, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  DragType,
  DragTypes,
  DroppableCollectionState,
  DropTarget,
  DropOperation,
} from "@proyecto-viviana/solid-stately";
import { getGlobalDraggingCollectionRef, getGlobalDraggingKeys } from "./createDraggableCollection";
import { getGlobalDropCollectionRef, getDroppableCollectionRef } from "./createDroppableCollection";
import { createDragSession, isVirtualDragging, registerDropItem } from "./DragManager";
import {
  DragTypesImpl,
  DROP_OPERATION,
  DROP_OPERATION_ALLOWED,
  DROP_OPERATION_TO_DROP_EFFECT,
  getGlobalAllowedDropOperations,
  getTypes,
} from "./utils";

export interface DroppableItemOptions {
  /** The unique key of the item. Used when `target` is omitted (`dropPosition: "on"`). */
  key?: string | number;
  /**
   * The drop target this node represents. RAC `useDroppableItem.ts:27`.
   * Drop indicators pass before/after/on; collection items default to `"on"`.
   */
  target?: DropTarget;
  /** Reference to the item element. */
  ref: Accessor<HTMLElement | null>;
  /** Whether this item is disabled for dropping. */
  isDisabled?: boolean;
  /** The ref to the activate button. RAC `useDroppableItem.ts:29`. */
  activateButtonRef?: Accessor<HTMLElement | null>;
}

export interface DroppableItemAria {
  /** Props for the droppable item element. */
  dropProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the item is currently a drop target. */
  isDropTarget: boolean;
}

const wrapKeyboardTypes = (types: Set<string>): DragTypes => ({
  has: (type: DragType | DragType[]) => {
    if (typeof type === "string") return types.has(type);
    if (Array.isArray(type)) return type.some((t) => typeof t === "string" && types.has(t));
    return false;
  },
});

const isInternalDropOperation = (state: DroppableCollectionState): boolean => {
  // RAC `utils.ts:411-416` `isInternalDropOperation(droppableCollectionRef)`:
  // dragging collection === this collection's ref (falling back to the global
  // drop-collection ref if the WeakMap entry is not yet written).
  const dragging = getGlobalDraggingCollectionRef();
  const dropping = getDroppableCollectionRef(state)?.() ?? getGlobalDropCollectionRef();
  return dragging != null && dragging === dropping;
};

const resolveTarget = (opts: DroppableItemOptions): DropTarget | null => {
  if (opts.target) return opts.target;
  if (opts.key != null) {
    return { type: "item", key: opts.key, dropPosition: "on" };
  }
  return null;
};

/**
 * Creates ARIA props for a droppable item within a collection.
 *
 * @param options - Accessor returning item options
 * @param state - Droppable collection state
 * @returns Droppable item ARIA props
 */
export function createDroppableItem(
  options: Accessor<DroppableItemOptions>,
  state: DroppableCollectionState,
): DroppableItemAria {
  const getOptions = createMemo(() => options());
  const resolvedTarget = createMemo(() => resolveTarget(getOptions()));
  const dragSession = createDragSession();

  const isDropTarget = createMemo(() => {
    const target = resolvedTarget();
    if (target == null) return false;
    if (typeof state.isDropTargetFor === "function") {
      return state.isDropTargetFor(target);
    }
    // Tests and RAC-shaped mocks expose `isDropTarget(target)` or only `target`.
    const predicate = (state as { isDropTarget?: unknown }).isDropTarget;
    if (typeof predicate === "function") {
      return Boolean((predicate as (dropTarget: DropTarget) => boolean)(target));
    }
    const current = state.target;
    if (!current) return false;
    if (current.type !== target.type) return false;
    if (current.type === "root" && target.type === "root") return true;
    if (current.type !== "item" || target.type !== "item") return false;
    return current.key === target.key && current.dropPosition === target.dropPosition;
  });

  // RAC `useDroppableItem.ts:49-68`: register with DragManager once the node exists.
  createEffect(() => {
    const el = getOptions().ref();
    const target = resolvedTarget();
    const activateButtonRef = getOptions().activateButtonRef;
    if (!el || !target) return;
    const unregister = registerDropItem({
      element: el,
      target,
      getDropOperation: (types, allowedOperations) => {
        return state.getDropOperation(
          target,
          wrapKeyboardTypes(types),
          allowedOperations,
          isInternalDropOperation(state),
          getGlobalDraggingKeys(),
        );
      },
      activateButtonRef,
    });
    onCleanup(unregister);
  });

  // RAC `useDroppableItem.ts:84-88`: focus the node when it becomes the active
  // virtual-drag target. Deferred to a microtask so this does not nest inside the
  // `setTarget` Solid flush (`onDropEnter` → indicator mount). A rAF lost the
  // race to collection focus under parallel Playwright workers.
  createEffect(() => {
    const el = getOptions().ref();
    if (!dragSession() || !isDropTarget() || !el) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && isVirtualDragging() && isDropTarget()) {
        el.focus();
      }
    });
    onCleanup(() => {
      cancelled = true;
    });
  });

  const isValidDropTarget = createMemo(() => {
    const session = dragSession();
    const target = resolvedTarget();
    if (!session || !target) return false;
    return (
      state.getDropOperation(
        target,
        wrapKeyboardTypes(getTypes(session.dragTarget.items)),
        session.dragTarget.allowedDropOperations,
        isInternalDropOperation(state),
        getGlobalDraggingKeys(),
      ) !== "cancel"
    );
  });

  const getTarget = (dropPosition: "before" | "on" | "after"): DropTarget => {
    const { key } = getOptions();
    return {
      type: "item",
      key: key as string | number,
      dropPosition,
    };
  };

  const getDropOperation = (e: DragEvent, target: DropTarget): DropOperation => {
    if (!e.dataTransfer) return "cancel";

    const types = new DragTypesImpl(e.dataTransfer);
    let allowedBits = DROP_OPERATION_ALLOWED[e.dataTransfer.effectAllowed] || DROP_OPERATION.all;

    // Use global allowed operations for internal drags
    const globalAllowed = getGlobalAllowedDropOperations();
    if (globalAllowed) {
      allowedBits &= globalAllowed;
    }

    const allowedOperations: DropOperation[] = [];
    if (allowedBits & DROP_OPERATION.move) allowedOperations.push("move");
    if (allowedBits & DROP_OPERATION.copy) allowedOperations.push("copy");
    if (allowedBits & DROP_OPERATION.link) allowedOperations.push("link");

    return state.getDropOperation(target, types, allowedOperations);
  };

  let dropActivateTimer: ReturnType<typeof setTimeout> | undefined;
  const DROP_ACTIVATE_TIMEOUT = 800;

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const opts = getOptions();
    if (opts.isDisabled || opts.key == null) return;

    // Determine drop position based on cursor position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.y;
    const height = rect.height;

    let dropPosition: "before" | "on" | "after";
    if (y < height * 0.25) {
      dropPosition = "before";
    } else if (y > height * 0.75) {
      dropPosition = "after";
    } else {
      dropPosition = "on";
    }

    const target = getTarget(dropPosition);
    const operation = getDropOperation(e, target);

    if (operation !== "cancel") {
      state.setTarget(target);
      e.dataTransfer!.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[
        operation
      ] as DataTransfer["dropEffect"];
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const opts = getOptions();
    if (opts.isDisabled || opts.key == null) return;

    // Update drop position based on cursor
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    const height = rect.height;

    let dropPosition: "before" | "on" | "after";
    if (y < height * 0.25) {
      dropPosition = "before";
    } else if (y > height * 0.75) {
      dropPosition = "after";
    } else {
      dropPosition = "on";
    }

    const target = getTarget(dropPosition);
    const operation = getDropOperation(e, target);

    if (operation !== "cancel") {
      state.setTarget(target);
      e.dataTransfer!.dropEffect = DROP_OPERATION_TO_DROP_EFFECT[
        operation
      ] as DataTransfer["dropEffect"];

      // Handle drop activate for 'on' position
      clearTimeout(dropActivateTimer);
      if (dropPosition === "on") {
        dropActivateTimer = setTimeout(() => {
          state.activateTarget(x, y);
        }, DROP_ACTIVATE_TIMEOUT);
      }
    } else {
      e.dataTransfer!.dropEffect = "none";
    }
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(dropActivateTimer);

    // Only clear target if leaving this item
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      // Clear if no longer over this item
      const { key } = getOptions();
      if (state.target?.type === "item" && state.target.key === key) {
        // State clearing handled by parent collection
      }
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(dropActivateTimer);

    // Drop handling is done by the parent collection
  };

  const dropProps = createMemo(() => {
    const opts = getOptions();
    // RAC `useVirtualDrop.ts:61-70` + `useDroppableItem.ts:90-94`.
    const session = dragSession();
    const ariaHidden = !session || isValidDropTarget() ? undefined : "true";
    const virtualProps: JSX.HTMLAttributes<HTMLElement> = {
      onClick: () => {},
      "aria-hidden": ariaHidden,
    };

    if (opts.isDisabled || opts.key == null) {
      return virtualProps;
    }

    return {
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      ...virtualProps,
    };
  });

  return {
    get dropProps() {
      return dropProps() as DroppableItemAria["dropProps"];
    },
    get isDropTarget() {
      return isDropTarget();
    },
  };
}
