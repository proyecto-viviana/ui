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

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { DroppableCollectionState, DropTarget } from "@proyecto-viviana/solid-stately";
import { createStringFormatter } from "../i18n/createStringFormatter";
import { createDroppableItem } from "./createDroppableItem";
import { createDragSession } from "./DragManager";
import { dndIntlStrings } from "./intl";

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
      return {
        ...droppable.dropProps,
        "aria-roledescription": stringFormatter().format("dropIndicator"),
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
