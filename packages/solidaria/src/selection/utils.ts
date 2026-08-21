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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/selection/utils.ts

/**
 * Selection helpers shared across collection item hooks.
 * Ported from packages/react-aria/src/selection/utils.ts.
 */

import type { Accessor } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import { isAppleDevice } from "../utils/platform";
import { createId } from "../ssr";

/**
 * Resolves the DOM element rendered for a collection item by its key, scoped to
 * the owning collection when a `data-collection` id is present. Mirrors
 * `@react-aria/selection`'s `getItemElement`, adapted to take a Solid ref
 * accessor instead of a React ref object.
 */
export function getItemElement(ref: Accessor<HTMLElement | null>, key: Key): HTMLElement | null {
  const root = ref();
  if (!root) {
    return null;
  }
  let selector = `[data-key="${CSS.escape(String(key))}"]`;
  const collectionId = root.dataset.collection;
  if (collectionId) {
    selector = `[data-collection="${CSS.escape(collectionId)}"]${selector}`;
  }
  return root.querySelector<HTMLElement>(selector);
}

/**
 * A stable, SSR-safe id for a collection, shared between the collection
 * container and its items so {@link getItemElement} can scope a query by
 * `data-collection` (needed to disambiguate nested collections).
 *
 * Divergence from upstream: React's `useCollectionId` keys this WeakMap by the
 * collection object and relies on a render-stable `useId`. A Solid collection is
 * rebuilt with a new identity whenever its items change, so we key by the
 * SelectionManager instance instead — it is created once and never replaced, so
 * the container and its items always resolve to the same entry — and generate
 * the id with our SSR-safe `createId`.
 */
const collectionIdMap = new WeakMap<object, string>();

/**
 * Registers (on first call) and returns the collection id for a SelectionManager.
 * The collection container calls this; its items read the same id via
 * {@link getCollectionId}. Must be called within a reactive owner (uses createId).
 */
export function registerCollectionId(manager: object): string {
  let id = collectionIdMap.get(manager);
  if (id == null) {
    id = createId();
    collectionIdMap.set(manager, id);
  }
  return id;
}

/**
 * Returns the collection id registered for a SelectionManager, or `undefined`
 * when its container has not registered one (e.g. an item not yet wired into a
 * `createSelectableCollection`). A Solid `undefined` attribute is omitted, so an
 * unregistered item simply renders no `data-collection`.
 */
export function getCollectionId(manager: object): string | undefined {
  return collectionIdMap.get(manager);
}

/** The modifier-key fields consulted by {@link isNonContiguousSelectionModifier}. */
interface ModifierKeyEvent {
  altKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Returns whether the modifier for non-contiguous (toggle) keyboard selection
 * is pressed. Mirrors `@react-aria/selection`'s `isNonContiguousSelectionModifier`:
 * Ctrl + Arrow Up/Down has a system-wide meaning on macOS, so Apple devices use
 * Alt instead; Windows and Ubuntu use Ctrl.
 */
export function isNonContiguousSelectionModifier(e: ModifierKeyEvent): boolean {
  return isAppleDevice() ? e.altKey === true : e.ctrlKey === true;
}
