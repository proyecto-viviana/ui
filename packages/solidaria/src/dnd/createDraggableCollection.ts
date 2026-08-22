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

import {
  createMemo,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
} from "solid-js";
import type { DraggableCollectionState } from "@proyecto-viviana/solid-stately";
import { getTypes } from "./utils";

// Global state for tracking the dragging collection. These back the reactive
// `isVirtualDragging` gate that decides whether drop indicators render across
// every mounted collection, so they must be Solid signals — React re-renders the
// whole collection tree on a drag-state change, but Solid's fine-grained
// reactivity only re-runs the indicator JSX if it subscribed to a signal. Plain
// module `let`s would make the gate read a stale snapshot and never re-render.
const [globalDraggingCollectionRef, setGlobalDraggingCollectionRefSignal] =
  createSignal<HTMLElement | null>(null);
const [globalDraggingKeys, setGlobalDraggingKeysSignal] = createSignal<Set<string | number>>(
  new Set(),
);
const [globalDraggingTypes, setGlobalDraggingTypesSignal] = createSignal<Set<string>>(new Set());

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

  // Track dragging state globally. This effect subscribes to THIS collection's
  // `state.draggingKeys`; the global-ref reads are untracked so writing the
  // globals (which are now signals) can't re-trigger this same effect into a
  // loop — only a real change in this collection's dragging keys should re-run it.
  createEffect(() => {
    const currentRef = ref();
    if (state.draggingKeys.size > 0) {
      if (untrack(getGlobalDraggingCollectionRef) !== currentRef) {
        setGlobalDraggingCollectionRef(currentRef);
      }
      setGlobalDraggingKeys(state.draggingKeys);
      setGlobalDraggingTypes(getTypes(state.getItems(state.draggingKeys)));
      return;
    }

    // Clear global drag tracking when this collection is no longer dragging.
    if (untrack(getGlobalDraggingCollectionRef) === currentRef) {
      setGlobalDraggingCollectionRef(null);
      setGlobalDraggingKeys(new Set());
      setGlobalDraggingTypes(new Set());
    }
  });

  // Clean up on unmount
  onCleanup(() => {
    if (untrack(getGlobalDraggingCollectionRef) === ref()) {
      setGlobalDraggingCollectionRef(null);
      setGlobalDraggingKeys(new Set());
      setGlobalDraggingTypes(new Set());
    }
  });

  return {
    state,
  };
}
