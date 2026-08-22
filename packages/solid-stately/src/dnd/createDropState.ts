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

/**
 * Drop state management for solid-stately.
 *
 * Provides reactive state for drop target operations.
 *
 * Ported from packages/react-aria/src/dnd/useDrop.ts.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type {
  DropItem,
  DropEnterEvent,
  DropMoveEvent,
  DropExitEvent,
  DropActivateEvent,
  DropEvent,
  DropOperation,
  DragTypes,
} from "./types";

export interface DropStateOptions {
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

export interface DropState {
  /** Whether the drop target is currently being hovered or focused. */
  readonly isDropTarget: boolean;
  /** Whether the drop target is disabled. */
  readonly isDisabled: boolean;
  /** Whether there is a drop button. */
  readonly hasDropButton: boolean;
  /** Enter the drop target. */
  enterTarget(x: number, y: number): void;
  /** Move within the drop target. */
  moveInTarget(x: number, y: number): void;
  /** Exit the drop target. */
  exitTarget(x: number, y: number): void;
  /** Activate the drop target (after holding). */
  activateTarget(x: number, y: number): void;
  /** Perform a drop on the target. */
  drop(x: number, y: number, items: DropItem[], dropOperation: DropOperation): void;
  /** Get the drop operation for given types. */
  getDropOperation(types: DragTypes, allowedOperations: DropOperation[]): DropOperation;
  /** Get the drop operation for a specific point. */
  getDropOperationForPoint(
    types: DragTypes,
    allowedOperations: DropOperation[],
    x: number,
    y: number,
  ): DropOperation;
}

/**
 * Creates drop state for managing drop target operations.
 *
 * @param props - Accessor returning drop state options
 * @returns Drop state object
 */
export function createDropState(props: Accessor<DropStateOptions>): DropState {
  const getProps = createMemo(() => props());

  const [isDropTarget, setIsDropTarget] = createSignal(false);

  const enterTarget = (x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    setIsDropTarget(true);

    if (typeof p.onDropEnter === "function") {
      p.onDropEnter({
        type: "dropenter",
        x,
        y,
      });
    }
  };

  const moveInTarget = (x: number, y: number) => {
    const p = getProps();
    if (!isDropTarget() || p.isDisabled) return;

    if (typeof p.onDropMove === "function") {
      p.onDropMove({
        type: "dropmove",
        x,
        y,
      });
    }
  };

  const exitTarget = (x: number, y: number) => {
    const p = getProps();

    setIsDropTarget(false);

    if (typeof p.onDropExit === "function") {
      p.onDropExit({
        type: "dropexit",
        x,
        y,
      });
    }
  };

  const activateTarget = (x: number, y: number) => {
    const p = getProps();
    if (p.isDisabled) return;

    if (typeof p.onDropActivate === "function") {
      p.onDropActivate({
        type: "dropactivate",
        x,
        y,
      });
    }
  };

  const drop = (x: number, y: number, items: DropItem[], dropOperation: DropOperation) => {
    const p = getProps();
    if (p.isDisabled) return;

    setIsDropTarget(false);

    if (typeof p.onDrop === "function") {
      p.onDrop({
        type: "drop",
        x,
        y,
        items,
        dropOperation,
      });
    }
  };

  const getDropOperation = (
    types: DragTypes,
    allowedOperations: DropOperation[],
  ): DropOperation => {
    const p = getProps();
    if (typeof p.getDropOperation === "function") {
      return p.getDropOperation(types, allowedOperations);
    }
    return allowedOperations[0] ?? "cancel";
  };

  const getDropOperationForPoint = (
    types: DragTypes,
    allowedOperations: DropOperation[],
    x: number,
    y: number,
  ): DropOperation => {
    const p = getProps();
    if (typeof p.getDropOperationForPoint === "function") {
      return p.getDropOperationForPoint(types, allowedOperations, x, y);
    }
    return getDropOperation(types, allowedOperations);
  };

  return {
    get isDropTarget() {
      return isDropTarget();
    },
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get hasDropButton() {
      return getProps().hasDropButton ?? false;
    },
    enterTarget,
    moveInTarget,
    exitTarget,
    activateTarget,
    drop,
    getDropOperation,
    getDropOperationForPoint,
  };
}
