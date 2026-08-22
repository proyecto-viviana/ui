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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/dnd/useDraggableCollectionState.ts

/**
 * Draggable collection state management for solid-stately.
 *
 * Provides reactive state for dragging items from a collection.
 *
 * Ported from packages/react-stately/src/dnd/useDraggableCollectionState.ts.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type {
  DragItem,
  DraggableCollectionStartEvent,
  DraggableCollectionMoveEvent,
  DraggableCollectionEndEvent,
  DropOperation,
  DragPreviewRenderer,
} from "./types";

export interface DraggableCollectionStateOptions<T = object> {
  /** A function that returns the items being dragged. */
  getItems: (keys: Set<string | number>) => DragItem[];
  /** Function that returns the allowed drop operations. */
  getAllowedDropOperations?: () => DropOperation[];
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DraggableCollectionStartEvent) => void;
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DraggableCollectionMoveEvent) => void;
  /** Handler that is called when the drag operation ends. */
  onDragEnd?: (e: DraggableCollectionEndEvent) => void;
  /** Whether the drag operation is disabled. */
  isDisabled?: boolean;
  /** Preview renderer function ref. */
  preview?: { current: DragPreviewRenderer | null };
}

export interface DraggableCollectionState {
  /** Whether items are currently being dragged. */
  readonly isDragging: boolean;
  /** The keys of the items being dragged. */
  readonly draggingKeys: Set<string | number>;
  /** Whether dragging is disabled. */
  readonly isDisabled: boolean;
  /** Start a drag operation with the given keys. */
  startDrag(keys: Set<string | number>, x: number, y: number): void;
  /** Update drag position. */
  moveDrag(x: number, y: number): void;
  /** End a drag operation. */
  endDrag(x: number, y: number, dropOperation: DropOperation, isInternal: boolean): void;
  /** Cancel a drag operation. */
  cancelDrag(): void;
  /** Get the items being dragged for the given keys. */
  getItems(keys: Set<string | number>): DragItem[];
  /** Get allowed drop operations. */
  getAllowedDropOperations(): DropOperation[];
  /** Preview renderer. */
  readonly preview: { current: DragPreviewRenderer | null } | undefined;
}

/**
 * Creates state for dragging items from a collection.
 *
 * @param props - Accessor returning draggable collection options
 * @returns Draggable collection state object
 */
export function createDraggableCollectionState<T = object>(
  props: Accessor<DraggableCollectionStateOptions<T>>,
): DraggableCollectionState {
  const getProps = createMemo(() => props());

  const [isDragging, setIsDragging] = createSignal(false);
  const [draggingKeys, setDraggingKeys] = createSignal<Set<string | number>>(new Set());

  const startDrag = (keys: Set<string | number>, x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    setIsDragging(true);
    setDraggingKeys(keys);

    if (typeof p.onDragStart === "function") {
      p.onDragStart({
        type: "dragstart",
        x,
        y,
        keys,
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
        keys: draggingKeys(),
      });
    }
  };

  const endDrag = (x: number, y: number, dropOperation: DropOperation, isInternal: boolean) => {
    const p = getProps();
    const keys = draggingKeys();

    setIsDragging(false);
    setDraggingKeys(new Set<string | number>());

    if (typeof p.onDragEnd === "function") {
      p.onDragEnd({
        type: "dragend",
        x,
        y,
        dropOperation,
        keys,
        isInternal,
      });
    }
  };

  const cancelDrag = () => {
    endDrag(0, 0, "cancel", false);
  };

  const getItems = (keys: Set<string | number>) => {
    const p = getProps();
    return p.getItems(keys);
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
    get draggingKeys() {
      return draggingKeys();
    },
    get isDisabled() {
      return getProps().isDisabled ?? false;
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
