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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDrag.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDrop.ts

/**
 * Drag and Drop ARIA types for solidaria.
 *
 * Ported from:
 * - packages/react-aria/src/dnd/useDrag.ts
 * - packages/react-aria/src/dnd/useDrop.ts
 */

import type { JSX } from "solid-js";
import type {
  DragItem,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DropEnterEvent,
  DropMoveEvent,
  DropActivateEvent,
  DropExitEvent,
  DropEvent,
  DropOperation,
  DragTypes,
  DragPreviewRenderer,
} from "@proyecto-viviana/solid-stately";

export interface AriaDragOptions {
  /** A function that returns the items being dragged. */
  getItems: () => DragItem[];
  /** Function that returns the allowed drop operations. */
  getAllowedDropOperations?: () => DropOperation[];
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DragStartEvent) => void;
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DragMoveEvent) => void;
  /** Handler that is called when the drag operation ends. */
  onDragEnd?: (e: DragEndEvent) => void;
  /** Whether there is a separate drag button affordance. */
  hasDragButton?: boolean;
  /** Whether the drag operation is disabled. */
  isDisabled?: boolean;
  /** Preview renderer function ref. */
  preview?: { current: DragPreviewRenderer | null };
}

export interface DragAria {
  /** Props for the draggable element. */
  dragProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Whether the element is currently being dragged. */
  isDragging: boolean;
}

export interface AriaDropOptions {
  /**
   * A function returning the drop operation to be performed.
   */
  getDropOperation?: (types: DragTypes, allowedOperations: DropOperation[]) => DropOperation;
  /**
   * A function returning the drop operation for a specific point.
   */
  getDropOperationForPoint?: (
    types: DragTypes,
    allowedOperations: DropOperation[],
    x: number,
    y: number,
  ) => DropOperation;
  /** Handler that is called when a valid drag enters the drop target. */
  onDropEnter?: (e: DropEnterEvent) => void;
  /** Handler that is called when a valid drag is moved within the drop target. */
  onDropMove?: (e: DropMoveEvent) => void;
  /** Handler that is called after a valid drag is held over the drop target. */
  onDropActivate?: (e: DropActivateEvent) => void;
  /** Handler that is called when a valid drag exits the drop target. */
  onDropExit?: (e: DropExitEvent) => void;
  /** Handler that is called when a valid drag is dropped on the drop target. */
  onDrop?: (e: DropEvent) => void;
  /** Whether there is a separate drop button affordance. */
  hasDropButton?: boolean;
  /** Whether the drop target is disabled. */
  isDisabled?: boolean;
}

export interface DropAria {
  /** Props for the droppable element. */
  dropProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the drop target is currently being hovered or focused. */
  isDropTarget: boolean;
  /** Props for the explicit drop button affordance, if any. */
  dropButtonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}
