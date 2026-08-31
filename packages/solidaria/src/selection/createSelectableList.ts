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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/selection/useSelectableList.ts

/**
 * createSelectableList - keyboard navigation and selection for a list collection.
 * Based on `packages/react-aria/src/selection/useSelectableList.ts`.
 *
 * React → Solid adaptations (faithful to upstream behavior):
 *  - `ref` / `scrollRef` are Solid accessors.
 *  - The default `ListKeyboardDelegate` is built inside a `createMemo` so it is
 *    recreated whenever the collection, disabled keys, disabled behavior, or
 *    collator change (the house convention — the delegate stores those as plain
 *    values; see {@link ListKeyboardDelegate}). This is the Solid equivalent of
 *    upstream's `useMemo` keyed on the same inputs.
 *  - Upstream takes `collection` and `disabledKeys` as separate props; our
 *    SelectionManager already exposes them as reactive getters
 *    (`manager.collection`, `manager.disabledKeys`, `manager.disabledBehavior`),
 *    so the delegate is derived from the manager — a single source of truth.
 *    A `layoutDelegate` may still be supplied for virtualized collections.
 */

import { createMemo } from "solid-js";
import type { KeyboardDelegate } from "../grid/types";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createCollator } from "../i18n";
import { ListKeyboardDelegate } from "./ListKeyboardDelegate";
import type { LayoutDelegate } from "./DOMLayoutDelegate";
import {
  createSelectableCollection,
  type CreateSelectableCollectionOptions,
  type SelectableCollectionAria,
} from "./createSelectableCollection";

export interface CreateSelectableListOptions<T = unknown> extends Omit<
  CreateSelectableCollectionOptions<T>,
  "keyboardDelegate"
> {
  /**
   * A delegate object that implements behavior for keyboard focus movement.
   * Defaults to a {@link ListKeyboardDelegate} derived from the selection manager.
   */
  keyboardDelegate?: MaybeAccessor<KeyboardDelegate>;
  /**
   * A delegate object that provides layout information for items in the
   * collection. Supply this for virtualized collections; by default layout is
   * read from the DOM.
   */
  layoutDelegate?: LayoutDelegate;
  /** The primary orientation of the list items. @default "vertical" */
  orientation?: "horizontal" | "vertical";
  /** The text direction used for horizontal navigation. */
  direction?: "ltr" | "rtl";
}

export interface SelectableListAria {
  /** Props for the list element. */
  listProps: SelectableCollectionAria["collectionProps"];
}

/**
 * Handles interactions with a selectable list collection.
 */
export function createSelectableList<T = unknown>(
  options: CreateSelectableListOptions<T>,
): SelectableListAria {
  const manager = options.selectionManager;

  // By default, a ListKeyboardDelegate is provided which queries layout
  // information from the DOM (e.g. for page up/page down). When virtualized, a
  // layoutDelegate is passed in to override that.
  const collator = createCollator({ usage: "search", sensitivity: "base" });
  const keyboardDelegate = createMemo<KeyboardDelegate>(() => {
    if (options.keyboardDelegate != null) {
      return access(options.keyboardDelegate);
    }
    return new ListKeyboardDelegate<T>({
      collection: manager.collection,
      disabledKeys: manager.disabledKeys,
      disabledBehavior: manager.disabledBehavior,
      ref: options.ref,
      collator: collator(),
      layoutDelegate: options.layoutDelegate,
      orientation: options.orientation,
      direction: options.direction,
    });
  });

  const collection = createSelectableCollection<T>({
    ...options,
    keyboardDelegate,
  });

  // Forward `collectionProps` as a getter rather than destructuring it: it is a
  // recomputed-per-access getter (the Solid equivalent of React re-rendering the
  // hook), so the roving `tabIndex` stays reactive to the focused key. Reading it
  // into a local would freeze it at its first value.
  return {
    get listProps() {
      return collection.collectionProps;
    },
  };
}
