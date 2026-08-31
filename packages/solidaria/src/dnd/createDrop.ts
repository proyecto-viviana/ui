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
 * createDrop - ARIA hook for drop operations.
 *
 * Provides accessibility props for drop target elements with support for
 * mouse, touch, and keyboard interactions.
 *
 * Ported from packages/react-aria/src/dnd/useDrop.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import { createDropState } from "@proyecto-viviana/solid-stately";
import type { AriaDropOptions, DropAria } from "./types";
import {
  readFromDataTransfer,
  DragTypesImpl,
  DROP_OPERATION,
  DROP_OPERATION_ALLOWED,
  DROP_OPERATION_TO_DROP_EFFECT,
  DROP_EFFECT_TO_DROP_OPERATION,
  setGlobalDropEffect,
  getGlobalAllowedDropOperations,
} from "./utils";
import type { DropOperation } from "@proyecto-viviana/solid-stately";

const DROP_ACTIVATE_TIMEOUT = 800;

/**
 * Creates ARIA props for a drop target element.
 *
 * @param props - Accessor returning drop options
 * @returns Drop ARIA props and state
 */
export function createDrop(props: Accessor<AriaDropOptions>): DropAria {
  const getProps = createMemo(() => props());

  const state = createDropState(() => ({
    getDropOperation: getProps().getDropOperation,
    onDropEnter: getProps().onDropEnter,
    onDropMove: getProps().onDropMove,
    onDropActivate: getProps().onDropActivate,
    onDropExit: getProps().onDropExit,
    onDrop: getProps().onDrop,
    hasDropButton: getProps().hasDropButton,
    isDisabled: getProps().isDisabled,
  }));

  let x = 0;
  let y = 0;
  let dragOverElements = new Set<Element>();
  let dropEffect: DataTransfer["dropEffect"] = "none";
  let allowedOperations = DROP_OPERATION.all;
  let dropActivateTimer: ReturnType<typeof setTimeout> | undefined;

  const fireDropEnter = (e: DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    state.enterTarget(e.clientX - rect.x, e.clientY - rect.y);
  };

  const fireDropExit = (e: DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    state.exitTarget(e.clientX - rect.x, e.clientY - rect.y);
  };

  const getAllowedOperations = (e: DragEvent): number => {
    let allowed =
      DROP_OPERATION_ALLOWED[e.dataTransfer?.effectAllowed ?? "none"] ?? DROP_OPERATION.none;

    // Use global allowed operations if set (for internal drags)
    const globalAllowed = getGlobalAllowedDropOperations();
    if (globalAllowed) {
      allowed &= globalAllowed;
    }

    let modifierAllowed = DROP_OPERATION.none;

    // macOS: Alt=copy, Ctrl=link, Cmd=move
    // Windows/Linux: Alt=link, Shift=move, Ctrl=copy
    const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

    if (isMac) {
      if (e.altKey) modifierAllowed |= DROP_OPERATION.copy;
      if (e.ctrlKey) modifierAllowed |= DROP_OPERATION.link;
      if (e.metaKey) modifierAllowed |= DROP_OPERATION.move;
    } else {
      if (e.altKey) modifierAllowed |= DROP_OPERATION.link;
      if (e.shiftKey) modifierAllowed |= DROP_OPERATION.move;
      if (e.ctrlKey) modifierAllowed |= DROP_OPERATION.copy;
    }

    if (modifierAllowed) {
      return allowed & modifierAllowed;
    }

    return allowed;
  };

  const allowedOperationsToArray = (ops: number): DropOperation[] => {
    const result: DropOperation[] = [];
    if (ops & DROP_OPERATION.move) result.push("move");
    if (ops & DROP_OPERATION.copy) result.push("copy");
    if (ops & DROP_OPERATION.link) result.push("link");
    return result;
  };

  const getDropOperationForAllowed = (allowed: number, operation: DropOperation): DropOperation => {
    const op = DROP_OPERATION[operation];
    return allowed & op ? operation : "cancel";
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragOverElements.add(e.target as Element);
    if (dragOverElements.size > 1) {
      return;
    }

    const p = getProps();
    const allowedOpsBits = getAllowedOperations(e);
    const allowedOps = allowedOperationsToArray(allowedOpsBits);
    let dropOp: DropOperation = allowedOps[0] ?? "cancel";

    if (typeof p.getDropOperation === "function" && e.dataTransfer) {
      const types = new DragTypesImpl(e.dataTransfer);
      dropOp = getDropOperationForAllowed(allowedOpsBits, p.getDropOperation(types, allowedOps));
    }

    if (typeof p.getDropOperationForPoint === "function" && e.dataTransfer) {
      const types = new DragTypesImpl(e.dataTransfer);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dropOp = getDropOperationForAllowed(
        allowedOpsBits,
        p.getDropOperationForPoint(types, allowedOps, e.clientX - rect.x, e.clientY - rect.y),
      );
    }

    x = e.clientX;
    y = e.clientY;
    allowedOperations = allowedOpsBits;
    dropEffect = (DROP_OPERATION_TO_DROP_EFFECT[dropOp] || "none") as DataTransfer["dropEffect"];

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = dropEffect;
    }

    if (dropOp !== "cancel") {
      fireDropEnter(e);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const allowedOpsBits = getAllowedOperations(e);

    // Skip if position and operations haven't changed
    if (e.clientX === x && e.clientY === y && allowedOpsBits === allowedOperations) {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = dropEffect;
      }
      return;
    }

    x = e.clientX;
    y = e.clientY;

    const prevDropEffect = dropEffect;
    const p = getProps();

    if (allowedOpsBits !== allowedOperations) {
      const allowedOps = allowedOperationsToArray(allowedOpsBits);
      let dropOp: DropOperation = allowedOps[0] ?? "cancel";

      if (typeof p.getDropOperation === "function" && e.dataTransfer) {
        const types = new DragTypesImpl(e.dataTransfer);
        dropOp = getDropOperationForAllowed(allowedOpsBits, p.getDropOperation(types, allowedOps));
      }
      dropEffect = (DROP_OPERATION_TO_DROP_EFFECT[dropOp] || "none") as DataTransfer["dropEffect"];
    }

    if (typeof p.getDropOperationForPoint === "function" && e.dataTransfer) {
      const types = new DragTypesImpl(e.dataTransfer);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dropOp = getDropOperationForAllowed(
        allowedOpsBits,
        p.getDropOperationForPoint(
          types,
          allowedOperationsToArray(allowedOpsBits),
          x - rect.x,
          y - rect.y,
        ),
      );
      dropEffect = (DROP_OPERATION_TO_DROP_EFFECT[dropOp] || "none") as DataTransfer["dropEffect"];
    }

    allowedOperations = allowedOpsBits;

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = dropEffect;
    }

    if (dropEffect === "none" && prevDropEffect !== "none") {
      fireDropExit(e);
    } else if (dropEffect !== "none" && prevDropEffect === "none") {
      fireDropEnter(e);
    }

    if (dropEffect !== "none") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      state.moveInTarget(x - rect.x, y - rect.y);
    }

    clearTimeout(dropActivateTimer);

    if (typeof p.onDropActivate === "function" && dropEffect !== "none") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const activateX = x - rect.x;
      const activateY = y - rect.y;
      dropActivateTimer = setTimeout(() => {
        state.activateTarget(activateX, activateY);
      }, DROP_ACTIVATE_TIMEOUT);
    }
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track drag over elements (WebKit workaround for relatedTarget being null)
    dragOverElements.delete(e.target as Element);

    for (const element of dragOverElements) {
      if (!e.currentTarget || !(e.currentTarget as Element).contains(element)) {
        dragOverElements.delete(element);
      }
    }

    if (dragOverElements.size > 0) {
      return;
    }

    if (dropEffect !== "none") {
      fireDropExit(e);
    }

    clearTimeout(dropActivateTimer);
  };

  const onDropHandler = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track drop effect globally for Chrome Android
    setGlobalDropEffect(dropEffect);

    const p = getProps();
    if (typeof p.onDrop === "function" && e.dataTransfer) {
      const items = readFromDataTransfer(e.dataTransfer);
      const dropOperation = DROP_EFFECT_TO_DROP_OPERATION[dropEffect];
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      state.drop(e.clientX - rect.x, e.clientY - rect.y, items, dropOperation);
    }

    dragOverElements.clear();
    fireDropExit(e);
    clearTimeout(dropActivateTimer);
  };

  const dropProps = createMemo(() => {
    const p = getProps();

    if (p.isDisabled) {
      return {};
    }

    const baseProps: Record<string, unknown> = {
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop: onDropHandler,
    };

    return baseProps;
  });

  const dropButtonProps = createMemo(() => {
    const p = getProps();

    if (p.isDisabled) {
      return {
        disabled: true,
      };
    }

    return {
      type: "button" as const,
      "aria-label": "Drop",
    };
  });

  return {
    get dropProps() {
      return dropProps() as DropAria["dropProps"];
    },
    get isDropTarget() {
      return state.isDropTarget;
    },
    get dropButtonProps() {
      return dropButtonProps() as DropAria["dropButtonProps"];
    },
  };
}
