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

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  DroppableCollectionState,
  DropTarget,
  DropOperation,
} from "@proyecto-viviana/solid-stately";
import {
  DragTypesImpl,
  DROP_OPERATION,
  DROP_OPERATION_ALLOWED,
  DROP_OPERATION_TO_DROP_EFFECT,
  getGlobalAllowedDropOperations,
} from "./utils";

export interface DroppableItemOptions {
  /** The unique key of the item. */
  key: string | number;
  /** Reference to the item element. */
  ref: Accessor<HTMLElement | null>;
  /** Whether this item is disabled for dropping. */
  isDisabled?: boolean;
}

export interface DroppableItemAria {
  /** Props for the droppable item element. */
  dropProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the item is currently a drop target. */
  isDropTarget: boolean;
}

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

  const isDropTarget = createMemo(() => {
    const { key } = getOptions();
    const target = state.target;
    return target?.type === "item" && target.key === key;
  });

  const getTarget = (dropPosition: "before" | "on" | "after"): DropTarget => {
    const { key } = getOptions();
    return {
      type: "item",
      key,
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
    if (opts.isDisabled) return;

    // Determine drop position based on cursor position
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
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const opts = getOptions();
    if (opts.isDisabled) return;

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

    if (opts.isDisabled) {
      return {};
    }

    return {
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
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
