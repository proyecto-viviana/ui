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
 * createDrag - ARIA hook for drag operations.
 *
 * Provides accessibility props for draggable elements with support for
 * mouse, touch, and keyboard interactions.
 *
 * Ported from packages/react-aria/src/dnd/useDrag.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import { createDragState, type DropOperation } from "@proyecto-viviana/solid-stately";
import type { AriaDragOptions, DragAria } from "./types";
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

/**
 * Creates ARIA props for a draggable element.
 *
 * @param props - Accessor returning drag options
 * @returns Drag ARIA props and state
 */
export function createDrag(props: Accessor<AriaDragOptions>): DragAria {
  const getProps = createMemo(() => props());

  const state = createDragState(() => ({
    getItems: getProps().getItems,
    getAllowedDropOperations: getProps().getAllowedDropOperations,
    onDragStart: getProps().onDragStart,
    onDragMove: getProps().onDragMove,
    onDragEnd: getProps().onDragEnd,
    isDisabled: getProps().isDisabled,
    hasDragButton: getProps().hasDragButton,
    preview: getProps().preview,
  }));

  const stringFormatter = createStringFormatter(dndIntlStrings);

  let lastX = 0;
  let lastY = 0;

  const onDragStart = (e: DragEvent) => {
    if (e.defaultPrevented) return;
    e.stopPropagation();

    const p = getProps();

    state.startDrag(e.clientX, e.clientY);

    const items = state.getItems();
    setGlobalDraggingTypes(getTypes(items));
    e.dataTransfer?.clearData?.();
    if (e.dataTransfer) {
      writeToDataTransfer(e.dataTransfer, items);
    }

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

    if (typeof p.preview?.current === "function" && e.dataTransfer) {
      p.preview.current(items, (node, userX, userY) => {
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
    state.endDrag(e.clientX, e.clientY, dropOperation);

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

      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      state.startDrag(rect.x + rect.width / 2, rect.y + rect.height / 2);

      const items = state.getItems();
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

      // Hand control to the keyboard DragManager session: it installs the
      // document-capture listeners that drive Tab-cycling across drop targets,
      // Arrow navigation within a target, and Enter/Escape drop/cancel.
      beginDragging(
        {
          element: el,
          items,
          allowedDropOperations:
            allowedOps.length > 0 ? allowedOps : (["move", "copy", "link"] as DropOperation[]),
          onDragEnd: (ev) => {
            state.endDrag(ev.x, ev.y, ev.dropOperation);
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
    const p = getProps();

    if (p.isDisabled) {
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

    if (!p.hasDragButton) {
      baseProps.onKeyDown = onKeyDown;
      baseProps.onKeyUp = onKeyUp;
    }

    return baseProps;
  });

  const dragButtonProps = createMemo(() => {
    const p = getProps();

    if (p.isDisabled) {
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
      return dragProps() as DragAria["dragProps"];
    },
    get dragButtonProps() {
      return dragButtonProps() as DragAria["dragButtonProps"];
    },
    get isDragging() {
      return state.isDragging;
    },
  };
}
