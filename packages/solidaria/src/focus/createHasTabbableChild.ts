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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/focus/useHasTabbableChild.ts

import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";
import { getFocusableTreeWalker } from "../utils/dom";

interface HasTabbableChildOptions {
  isDisabled?: Accessor<boolean>;
}

/**
 * Returns whether an element has a tabbable child, and updates as its children
 * or their focusability change.
 *
 * @private
 */
export function createHasTabbableChild(
  ref: Accessor<Element | null | undefined>,
  options?: HasTabbableChildOptions,
): Accessor<boolean> {
  const [hasTabbableChild, setHasTabbableChild] = createSignal(false);

  createEffect(() => {
    const element = ref();
    if (!element || options?.isDisabled?.()) {
      setHasTabbableChild(false);
      return;
    }

    const update = () => {
      const walker = getFocusableTreeWalker(element, { tabbable: true });
      setHasTabbableChild(Boolean(walker.nextNode()));
    };
    let isCurrent = true;

    update();
    // Selection can make a force-mounted panel reactive before Solid applies
    // the corresponding `inert` DOM update. Recheck once that DOM work settles,
    // matching React Aria's post-render layout-effect observation.
    queueMicrotask(() => {
      if (isCurrent && ref() === element && !options?.isDisabled?.()) {
        update();
      }
    });

    const observer =
      typeof MutationObserver === "undefined" ? undefined : new MutationObserver(update);
    observer?.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["tabindex", "disabled", "inert", "data-inert"],
    });
    onCleanup(() => {
      isCurrent = false;
      observer?.disconnect();
    });
  });

  return () => (options?.isDisabled?.() ? false : hasTabbableChild());
}
