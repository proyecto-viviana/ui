/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDraggableCollection.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/utils.ts

/**
 * createDraggableCollection - ARIA hook for draggable collection items.
 *
 * Provides accessibility support for dragging items from a collection
 * component like ListBox, GridList, or Table.
 *
 * Ported from:
 * - packages/react-aria/src/dnd/useDraggableCollection.ts
 * - packages/react-aria/src/dnd/utils.ts
 */

import { onOwnedCleanup } from "../utils/owner";
import { createMemo, createEffect, createSignal, untrack } from "solid-js";
import type { Accessor } from "solid-js";
import type { DraggableCollectionState } from "@proyecto-viviana/solid-stately";
import { getTypes } from "./utils";
import { isVirtualDragging } from "./DragManager";

// Global state for tracking the dragging collection. These back the reactive
// `isVirtualDragging` gate that decides whether drop indicators render across
// every mounted collection, so they must be Solid signals — React re-renders the
// whole collection tree on a drag-state change, but Solid's fine-grained
// reactivity only re-runs the indicator JSX if it subscribed to a signal. Plain
// module `let`s would make the gate read a stale snapshot and never re-render.
const [globalDraggingCollectionRef, setGlobalDraggingCollectionRefSignal] =
  createSignal<HTMLElement | null>(null, { ownedWrite: true });
const [globalDraggingKeys, setGlobalDraggingKeysSignal] = createSignal<Set<string | number>>(
  new Set(),
  { ownedWrite: true },
);
const [globalDraggingTypes, setGlobalDraggingTypesSignal] = createSignal<Set<string>>(new Set(), {
  ownedWrite: true,
});

export function setGlobalDraggingCollectionRef(ref: HTMLElement | null): void {
  setGlobalDraggingCollectionRefSignal(ref);
}

export function getGlobalDraggingCollectionRef(): HTMLElement | null {
  return globalDraggingCollectionRef();
}

export function setGlobalDraggingKeys(keys: Set<string | number>): void {
  setGlobalDraggingKeysSignal(new Set(keys));
}

export function getGlobalDraggingKeys(): Set<string | number> {
  return new Set(globalDraggingKeys());
}

export function setGlobalDraggingTypes(types: Set<string>): void {
  setGlobalDraggingTypesSignal(new Set(types));
}

export function getGlobalDraggingTypes(): Set<string> {
  return new Set(globalDraggingTypes());
}

export interface DraggableCollectionOptions {
  /** Reference to the collection element. */
  ref: Accessor<HTMLElement | null>;
}

export interface DraggableCollectionAria {
  /** The draggable collection state. */
  state: DraggableCollectionState;
}

/**
 * Creates ARIA support for a draggable collection.
 *
 * @param _options - Collection options
 * @param state - Draggable collection state
 * @returns Draggable collection ARIA result
 */
export function createDraggableCollection(
  options: DraggableCollectionOptions,
  state: DraggableCollectionState,
): DraggableCollectionAria {
  const ref = createMemo(() => options.ref());
  let published: HTMLElement | null = null;

  // Track dragging state globally. Subscribe in compute; write globals in apply
  // so this is not a forbidden write inside a tracked effect.
  createEffect(
    () => ({
      currentRef: ref(),
      size: state.draggingKeys.size,
      keys: state.draggingKeys,
      virtual: isVirtualDragging(),
    }),
    ({ currentRef, size, keys, virtual }) => {
      const clearIfOwner = () => {
        if (
          untrack(getGlobalDraggingCollectionRef) === currentRef ||
          untrack(getGlobalDraggingCollectionRef) === published
        ) {
          published = null;
          setGlobalDraggingCollectionRef(null);
          setGlobalDraggingKeys(new Set());
          setGlobalDraggingTypes(new Set());
        }
      };

      if (size > 0) {
        // Never write `null` over the element `createDraggableItem` stamped
        // synchronously on keyboard pickup (RAC `useDraggableCollection.ts:29-32`
        // sets `draggingCollectionRef` during render; a null `ref()` here would
        // make `isInternal` false, `onReorder` cancel, and the collection drop
        // out of `validDropTargets` so focusing the indicator bounces to
        // `listbox:Permissions`).
        if (currentRef && untrack(getGlobalDraggingCollectionRef) !== currentRef) {
          published = currentRef;
          setGlobalDraggingCollectionRef(currentRef);
        }
        setGlobalDraggingKeys(keys);
        setGlobalDraggingTypes(getTypes(state.getItems(keys)));
        // Solid 2 apply cleanup runs on dispose even when onOwnedCleanup is a
        // no-op (tests that createRoot-dispose before a later owner flush).
        return clearIfOwner;
      }

      // A keyboard DragManager session owns these globals until teardown. Clearing
      // them here races `beginDragging`'s rAF `setup()` when this effect still
      // sees `draggingKeys.size === 0`.
      if (virtual) {
        return;
      }

      // Clear global drag tracking when this collection is no longer dragging.
      clearIfOwner();
    },
  );

  // Clean up on unmount
  onOwnedCleanup(() => {
    if (
      untrack(getGlobalDraggingCollectionRef) === published ||
      untrack(getGlobalDraggingCollectionRef) === untrack(ref)
    ) {
      setGlobalDraggingCollectionRef(null);
      setGlobalDraggingKeys(new Set());
      setGlobalDraggingTypes(new Set());
    }
    published = null;
  });

  return {
    state,
  };
}
