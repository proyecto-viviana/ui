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

/**
 * Drag state management for solid-stately.
 *
 * Provides reactive state for drag operations.
 *
 * Ported from packages/react-aria/src/dnd/useDrag.ts.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type {
  DragItem,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DropOperation,
  DragPreviewRenderer,
} from "./types";

export interface DragStateOptions {
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
  /** Whether the drag operation is disabled. */
  isDisabled?: boolean;
  /** Whether there is a separate drag button affordance. */
  hasDragButton?: boolean;
  /** Preview renderer function ref. */
  preview?: { current: DragPreviewRenderer | null };
}

export interface DragState {
  /** Whether an element is currently being dragged. */
  readonly isDragging: boolean;
  /** Whether drag is disabled. */
  readonly isDisabled: boolean;
  /** Start a drag operation. */
  startDrag(x: number, y: number): void;
  /** Update drag position. */
  moveDrag(x: number, y: number): void;
  /** End a drag operation. */
  endDrag(x: number, y: number, dropOperation: DropOperation): void;
  /** Cancel a drag operation. */
  cancelDrag(): void;
  /** Get the items being dragged. */
  getItems(): DragItem[];
  /** Get allowed drop operations. */
  getAllowedDropOperations(): DropOperation[];
  /** Whether there is a drag button. */
  readonly hasDragButton: boolean;
  /** Preview renderer. */
  readonly preview: { current: DragPreviewRenderer | null } | undefined;
}

/**
 * Creates drag state for managing drag operations.
 *
 * @param props - Accessor returning drag state options
 * @returns Drag state object
 */
export function createDragState(props: Accessor<DragStateOptions>): DragState {
  const getProps = createMemo(() => props());

  const [isDragging, setIsDragging] = createSignal(false);

  const startDrag = (x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    setIsDragging(true);

    if (typeof p.onDragStart === "function") {
      p.onDragStart({
        type: "dragstart",
        x,
        y,
      });
    }
  };

  const moveDrag = (x: number, y: number) => {
    const p = getProps();
    if (!isDragging() || p.isDisabled) return;

    if (typeof p.onDragMove === "function") {
      p.onDragMove({
        type: "dragmove",
        x,
        y,
      });
    }
  };

  const endDrag = (x: number, y: number, dropOperation: DropOperation) => {
    const p = getProps();
    if (!isDragging()) return;

    setIsDragging(false);

    if (typeof p.onDragEnd === "function") {
      p.onDragEnd({
        type: "dragend",
        x,
        y,
        dropOperation,
      });
    }
  };

  const cancelDrag = () => {
    endDrag(0, 0, "cancel");
  };

  const getItems = () => {
    const p = getProps();
    return p.getItems();
  };

  const getAllowedDropOperations = (): DropOperation[] => {
    const p = getProps();
    if (typeof p.getAllowedDropOperations === "function") {
      return p.getAllowedDropOperations();
    }
    return ["move", "copy", "link"];
  };

  return {
    get isDragging() {
      return isDragging();
    },
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get hasDragButton() {
      return getProps().hasDragButton ?? false;
    },
    get preview() {
      return getProps().preview;
    },
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    getItems,
    getAllowedDropOperations,
  };
}
