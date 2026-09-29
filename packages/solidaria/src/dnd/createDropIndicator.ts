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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDropIndicator.ts

/**
 * createDropIndicator - ARIA hook for a drop indicator within a collection.
 *
 * Ported from packages/react-aria/src/dnd/useDropIndicator.ts.
 */

import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { DroppableCollectionState, DropTarget, Key } from "@proyecto-viviana/solid-stately";
import { createStringFormatter } from "../i18n/createStringFormatter";
import { createDroppableItem } from "./createDroppableItem";
import { createDragSession } from "./DragManager";
import { dndIntlStrings } from "./intl";

type DropIndicatorLabelKey =
  | "dropOnRoot"
  | "dropOnItem"
  | "insertBetween"
  | "insertAfter"
  | "insertBefore";

type IndicatorCollectionNode = {
  type?: string;
  key?: Key;
  textValue?: string;
  prevKey?: Key | null;
  nextKey?: Key | null;
};

type IndicatorCollection = {
  getTextValue?: (key: Key) => string | undefined;
  getItem: (key: Key) => IndicatorCollectionNode | null | undefined;
};

const indicatorCollection = (state: DroppableCollectionState): IndicatorCollection | undefined => {
  const candidate = state.collection;
  if (candidate != null && typeof candidate.getItem === "function") {
    // `DroppableCollectionLike` only types the neighbor walk. Item text and
    // prevKey/nextKey live on the host collection the state now returns.
    return candidate as unknown as IndicatorCollection;
  }
  return undefined;
};

// RAC `useDropIndicator.ts:65-107`. Root `aria-labelledby` stays unset: this
// port's collection map stores a ref, not an id.
const dropIndicatorLabel = (
  target: DropTarget,
  state: DroppableCollectionState,
  format: (key: DropIndicatorLabelKey, args?: Record<string, string>) => string,
): string => {
  if (target.type === "root") {
    return format("dropOnRoot");
  }

  const collection = indicatorCollection(state);
  if (!collection) return "";

  const getText = (key: Key | null | undefined): string => {
    if (key == null) return "";
    return collection.getTextValue?.(key) ?? collection.getItem(key)?.textValue ?? "";
  };

  if (target.dropPosition === "on") {
    return format("dropOnItem", { itemText: getText(target.key) });
  }

  let before: Key | null | undefined;
  let after: Key | null | undefined;
  if (target.dropPosition === "before") {
    const prevKey = collection.getItem(target.key)?.prevKey;
    const prevNode = prevKey != null ? collection.getItem(prevKey) : null;
    before = prevNode?.type === "item" ? prevNode.key : null;
  } else {
    before = target.key;
  }

  if (target.dropPosition === "after") {
    const nextKey = collection.getItem(target.key)?.nextKey;
    const nextNode = nextKey != null ? collection.getItem(nextKey) : null;
    after = nextNode?.type === "item" ? nextNode.key : null;
  } else {
    after = target.key;
  }

  if (before != null && after != null) {
    return format("insertBetween", {
      beforeItemText: getText(before),
      afterItemText: getText(after),
    });
  }
  if (before != null) {
    return format("insertAfter", { itemText: getText(before) });
  }
  if (after != null) {
    return format("insertBefore", { itemText: getText(after) });
  }
  return "";
};

export interface DropIndicatorOptions {
  /** The drop target that the drop indicator represents. */
  target: DropTarget;
  /** The ref to the activate button. */
  activateButtonRef?: Accessor<HTMLElement | null>;
}

export interface DropIndicatorAria {
  /** Props for the drop indicator element. */
  dropIndicatorProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the drop indicator is currently the active drop target. */
  isDropTarget: boolean;
  /**
   * Whether the drop indicator is hidden, both visually and from assistive technology.
   * Use this to determine whether to omit the element from the DOM entirely.
   */
  isHidden: boolean;
}

/**
 * Handles drop interactions for a target within a droppable collection.
 *
 * RAC `useDropIndicator.ts:45-127`.
 */
export function createDropIndicator(
  props: DropIndicatorOptions,
  state: DroppableCollectionState,
  ref: Accessor<HTMLElement | null>,
): DropIndicatorAria {
  const stringFormatter = createStringFormatter(dndIntlStrings);
  const dragSession = createDragSession();
  const droppable = createDroppableItem(
    () => ({
      target: props.target,
      ref,
      activateButtonRef: props.activateButtonRef,
    }),
    state,
  );

  // RAC `useDropIndicator.ts:109-125`.
  const ariaHidden = createMemo((): "true" | undefined =>
    !dragSession() ? "true" : (droppable.dropProps["aria-hidden"] as "true" | undefined),
  );
  const isHidden = createMemo(() => !droppable.isDropTarget && !!ariaHidden());

  return {
    get dropIndicatorProps() {
      const formatter = stringFormatter();
      return {
        ...droppable.dropProps,
        "aria-roledescription": formatter.format("dropIndicator"),
        "aria-label": dropIndicatorLabel(props.target, state, (key, args) =>
          formatter.format(key, args),
        ),
        "aria-hidden": ariaHidden(),
        tabIndex: -1,
      };
    },
    get isDropTarget() {
      return droppable.isDropTarget;
    },
    get isHidden() {
      return isHidden();
    },
  };
}
