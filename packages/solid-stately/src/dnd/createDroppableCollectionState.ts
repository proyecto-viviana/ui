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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/dnd/useDroppableCollectionState.ts

/**
 * Droppable collection state management for solid-stately.
 *
 * Provides reactive state for accepting drops onto a collection.
 *
 * Ported from packages/react-stately/src/dnd/useDroppableCollectionState.ts.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type {
  DropItem,
  DropTarget,
  DropOperation,
  DragTypes,
  DroppableCollectionEnterEvent,
  DroppableCollectionMoveEvent,
  DroppableCollectionActivateEvent,
  DroppableCollectionExitEvent,
  DroppableCollectionDropEvent,
  DroppableCollectionInsertDropEvent,
  DroppableCollectionRootDropEvent,
  DroppableCollectionOnItemDropEvent,
  DroppableCollectionReorderEvent,
  ItemDropTarget,
} from "./types";
import type { Collection } from "../collections/types";

export interface DroppableCollectionStateOptions {
  /**
   * The drag types that the droppable collection accepts.
   * @default 'all'
   */
  acceptedDragTypes?: "all" | Array<string | symbol>;
  /**
   * A function returning the drop operation to be performed.
   */
  getDropOperation?: (
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
  ) => DropOperation;
  /** Handler that is called when a valid drag enters a drop target. */
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void;
  /** Handler that is called after a valid drag is held over a drop target. */
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void;
  /** Handler that is called when a valid drag exits a drop target. */
  onDropExit?: (e: DroppableCollectionExitEvent) => void;
  /** Handler that is called when a valid drag is dropped. */
  onDrop?: (e: DroppableCollectionDropEvent) => void;
  /** Handler that is called when external items are dropped "between" items. */
  onInsert?: (e: DroppableCollectionInsertDropEvent) => void;
  /** Handler that is called when external items are dropped on the collection's root. */
  onRootDrop?: (e: DroppableCollectionRootDropEvent) => void;
  /** Handler that is called when items are dropped "on" an item. */
  onItemDrop?: (e: DroppableCollectionOnItemDropEvent) => void;
  /** Handler that is called when items are reordered within the collection. */
  onReorder?: (e: DroppableCollectionReorderEvent) => void;
  /** Handler that is called when items are moved within the source collection. */
  onMove?: (e: DroppableCollectionReorderEvent) => void;
  /** A function returning whether a given target is a valid "on" drop target. */
  shouldAcceptItemDrop?: (target: ItemDropTarget, types: DragTypes) => boolean;
  /**
   * The host collection. Used by the default drop-operation feature detection to
   * confirm a reorder stays within the same parent and to prevent dropping an
   * item onto itself or a descendant. Optional: a flat collection (e.g. a plain
   * ListBox) is always "within parent" and has no descendants, so omitting it is
   * faithful for flat hosts.
   */
  collection?: Collection<unknown>;
  /** Whether the droppable collection is disabled. */
  isDisabled?: boolean;
}

export interface DroppableCollectionState {
  /** Whether a drag is currently over the collection. */
  readonly isDropTarget: boolean;
  /** The current drop target within the collection. */
  readonly target: DropTarget | null;
  /** Whether the collection is disabled for drops. */
  readonly isDisabled: boolean;
  /** Set the current drop target. */
  setTarget(target: DropTarget | null): void;
  /** Check if a drag type is accepted. */
  isAccepted(types: DragTypes): boolean;
  /** Enter the collection with a drop target. */
  enterTarget(target: DropTarget, x: number, y: number): void;
  /** Move to a new target within the collection. */
  moveToTarget(target: DropTarget, x: number, y: number): void;
  /** Exit the collection. */
  exitTarget(x: number, y: number): void;
  /** Activate the current target. */
  activateTarget(x: number, y: number): void;
  /** Perform a drop on the collection. */
  drop(
    items: DropItem[],
    dropOperation: DropOperation,
    isInternal: boolean,
    draggingKeys?: Set<string | number>,
  ): void;
  /**
   * Get the drop operation for a target. `isInternal` is true when the active
   * drag originated from this same collection; `draggingKeys` are the keys being
   * dragged. Both feed the handler-aware feature detection that decides whether a
   * given drop position (before/after/on/root) is a valid target — e.g. a
   * reorder-only collection rejects "on" targets, matching React Aria.
   */
  getDropOperation(
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
    isInternal?: boolean,
    draggingKeys?: Set<string | number>,
  ): DropOperation;
  /** Check if an item drop should be accepted. */
  shouldAcceptItemDrop(target: ItemDropTarget, types: DragTypes): boolean;
}

/**
 * Symbol for directory drag type.
 */
export const DIRECTORY_DRAG_TYPE: symbol = Symbol("directory");

/**
 * Creates state for accepting drops onto a collection.
 *
 * @param props - Accessor returning droppable collection options
 * @returns Droppable collection state object
 */
export function createDroppableCollectionState(
  props: Accessor<DroppableCollectionStateOptions>,
): DroppableCollectionState {
  const getProps = createMemo(() => props());

  const [isDropTarget, setIsDropTarget] = createSignal(false);
  const [target, setTarget] = createSignal<DropTarget | null>(null);

  const isAccepted = (types: DragTypes): boolean => {
    const p = getProps();
    const acceptedTypes = p.acceptedDragTypes ?? "all";

    if (acceptedTypes === "all") {
      return true;
    }

    for (const type of acceptedTypes) {
      if (types.has(type)) {
        return true;
      }
    }

    return false;
  };

  const enterTarget = (dropTarget: DropTarget, x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    setIsDropTarget(true);
    setTarget(dropTarget);

    if (typeof p.onDropEnter === "function") {
      p.onDropEnter({
        type: "dropenter",
        x,
        y,
        target: dropTarget,
      });
    }
  };

  const moveToTarget = (dropTarget: DropTarget, x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    const prevTarget = target();
    setTarget(dropTarget);

    // Fire exit/enter events if target changed
    if (prevTarget && !targetsEqual(prevTarget, dropTarget)) {
      if (typeof p.onDropExit === "function") {
        p.onDropExit({
          type: "dropexit",
          x,
          y,
          target: prevTarget,
        });
      }

      if (typeof p.onDropEnter === "function") {
        p.onDropEnter({
          type: "dropenter",
          x,
          y,
          target: dropTarget,
        });
      }
    }
  };

  const exitTarget = (x: number, y: number) => {
    const p = getProps();
    const currentTarget = target();

    setIsDropTarget(false);
    setTarget(null);

    if (currentTarget && typeof p.onDropExit === "function") {
      p.onDropExit({
        type: "dropexit",
        x,
        y,
        target: currentTarget,
      });
    }
  };

  const activateTarget = (x: number, y: number) => {
    const p = getProps();
    const currentTarget = target();
    if (p.isDisabled || !currentTarget) return;

    if (typeof p.onDropActivate === "function") {
      p.onDropActivate({
        type: "dropactivate",
        x,
        y,
        target: currentTarget,
      });
    }
  };

  const drop = (
    items: DropItem[],
    dropOperation: DropOperation,
    isInternal: boolean,
    draggingKeys?: Set<string | number>,
  ) => {
    const p = getProps();
    const currentTarget = target();
    if (p.isDisabled || !currentTarget) return;

    setIsDropTarget(false);
    setTarget(null);

    // Call the generic onDrop handler
    if (typeof p.onDrop === "function") {
      p.onDrop({
        type: "drop",
        x: 0,
        y: 0,
        items,
        dropOperation,
        target: currentTarget,
      });
    }

    // Call specific handlers based on the drop type
    if (currentTarget.type === "root") {
      if (typeof p.onRootDrop === "function") {
        p.onRootDrop({
          items,
          dropOperation,
        });
      }
    } else if (currentTarget.type === "item") {
      if (isInternal && draggingKeys) {
        // Reorder or move within the same collection
        if (currentTarget.dropPosition === "on") {
          if (typeof p.onMove === "function") {
            p.onMove({
              keys: draggingKeys,
              dropOperation,
              target: currentTarget,
            });
          }
        } else {
          if (typeof p.onReorder === "function") {
            p.onReorder({
              keys: draggingKeys,
              dropOperation,
              target: currentTarget,
            });
          }
        }
      } else {
        // External drop
        if (currentTarget.dropPosition === "on") {
          if (typeof p.onItemDrop === "function") {
            p.onItemDrop({
              items,
              dropOperation,
              isInternal,
              target: currentTarget,
            });
          }
        } else {
          if (typeof p.onInsert === "function") {
            p.onInsert({
              items,
              dropOperation,
              target: currentTarget,
            });
          }
        }
      }
    }
  };

  // Faithful of react-stately's `isDraggingWithinParent`: every dragged item must
  // share the target's parent for a reorder to be valid. A flat collection (no
  // `collection` provided) has a single implicit parent, so this is always true.
  const isDraggingWithinParent = (
    target: ItemDropTarget,
    draggingKeys: Set<string | number>,
  ): boolean => {
    const collection = getProps().collection;
    if (!collection) return true;
    const targetNode = collection.getItem(target.key);
    for (const key of draggingKeys) {
      const node = collection.getItem(key);
      if (node?.parentKey !== targetNode?.parentKey) {
        return false;
      }
    }
    return true;
  };

  // Faithful of react-stately's `defaultGetDropOperation`: decide whether a drop
  // position is a valid target from the handlers that are actually wired. A
  // reorder-only collection (only `onReorder`) accepts before/after but rejects
  // "on"; an item-drop collection accepts "on"; and so on.
  const defaultGetDropOperation = (
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
    isInternal: boolean,
    draggingKeys: Set<string | number>,
  ): DropOperation => {
    const p = getProps();

    if (p.isDisabled || !target) {
      return "cancel";
    }

    if (!isAccepted(types)) {
      return "cancel";
    }

    const isValidInsert =
      p.onInsert &&
      target.type === "item" &&
      !isInternal &&
      (target.dropPosition === "before" || target.dropPosition === "after");
    const isValidReorder =
      p.onReorder &&
      target.type === "item" &&
      isInternal &&
      (target.dropPosition === "before" || target.dropPosition === "after") &&
      isDraggingWithinParent(target, draggingKeys);

    const isItemDropAllowed =
      target.type !== "item" ||
      target.dropPosition !== "on" ||
      !p.shouldAcceptItemDrop ||
      p.shouldAcceptItemDrop(target, types);

    const isValidMove = p.onMove && target.type === "item" && isInternal && isItemDropAllowed;

    // Feedback was that internal root drop was weird, so it is prevented.
    const isValidRootDrop = p.onRootDrop && target.type === "root" && !isInternal;

    // Automatically prevent items (e.g. folders) from being dropped on themselves.
    const isValidOnItemDrop =
      p.onItemDrop &&
      target.type === "item" &&
      target.dropPosition === "on" &&
      !(isInternal && target.key != null && draggingKeys.has(target.key)) &&
      isItemDropAllowed;

    if (
      p.onDrop ||
      isValidInsert ||
      isValidReorder ||
      isValidMove ||
      isValidRootDrop ||
      isValidOnItemDrop
    ) {
      if (typeof p.getDropOperation === "function") {
        return p.getDropOperation(target, types, allowedOperations);
      }
      return allowedOperations[0] ?? "cancel";
    }

    return "cancel";
  };

  const getDropOperation = (
    dropTarget: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
    isInternal: boolean = false,
    draggingKeys: Set<string | number> = new Set(),
  ): DropOperation => {
    // Prevent dropping items onto themselves or their descendants (faithful of
    // react-stately's `getDropOperation` guard). Only meaningful for a nested
    // collection; a flat host has no descendants.
    if (isInternal && dropTarget.type === "item" && draggingKeys.size > 0) {
      if (draggingKeys.has(dropTarget.key) && dropTarget.dropPosition === "on") {
        return "cancel";
      }

      const collection = getProps().collection;
      if (collection) {
        let currentKey: string | number | null = dropTarget.key;
        while (currentKey != null) {
          const item = collection.getItem(currentKey);
          const parentKey = item?.parentKey;
          if (parentKey != null && draggingKeys.has(parentKey)) {
            return "cancel";
          }
          currentKey = parentKey ?? null;
        }
      }
    }

    return defaultGetDropOperation(dropTarget, types, allowedOperations, isInternal, draggingKeys);
  };

  const shouldAcceptItemDrop = (dropTarget: ItemDropTarget, types: DragTypes): boolean => {
    const p = getProps();

    if (!isAccepted(types)) {
      return false;
    }

    if (typeof p.shouldAcceptItemDrop === "function") {
      return p.shouldAcceptItemDrop(dropTarget, types);
    }

    return true;
  };

  return {
    get isDropTarget() {
      return isDropTarget();
    },
    get target() {
      return target();
    },
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    setTarget,
    isAccepted,
    enterTarget,
    moveToTarget,
    exitTarget,
    activateTarget,
    drop,
    getDropOperation,
    shouldAcceptItemDrop,
  };
}

/**
 * Check if two drop targets are equal.
 */
function targetsEqual(a: DropTarget, b: DropTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "root" && b.type === "root") return true;
  if (a.type === "item" && b.type === "item") {
    return a.key === b.key && a.dropPosition === b.dropPosition;
  }
  return false;
}
