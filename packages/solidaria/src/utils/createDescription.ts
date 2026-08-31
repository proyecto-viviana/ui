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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useDescription.ts

/**
 * createDescription - Creates a hidden element for dynamic aria-describedby content.
 *
 * This utility creates a visually hidden element containing description text and
 * returns an aria-describedby prop pointing to it. Multiple components using the
 * same description will share the same element (reference counted).
 *
 * Port of @react-aria/utils/useDescription.
 *
 * @example
 * ```tsx
 * function SortableColumn(props) {
 *   const descriptionProps = createDescription(
 *     () => props.sortDirection ? `Sorted ${props.sortDirection}` : undefined
 *   );
 *
 *   return (
 *     <th {...descriptionProps}>
 *       {props.children}
 *     </th>
 *   );
 * }
 * ```
 */

import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface DescriptionProps {
  "aria-describedby"?: string;
}

let descriptionId = 0;
const descriptionNodes = new Map<string, { refCount: number; element: Element }>();

/**
 * Creates an invisible description element and returns aria-describedby props.
 *
 * The element is created in the DOM and reference counted - multiple uses of
 * the same description text will share the same element. When all references
 * are removed, the element is cleaned up.
 *
 * @param description - Accessor that returns the description text, or undefined
 * @returns Object with aria-describedby prop (or empty object if no description)
 *
 * @example
 * ```tsx
 * const descProps = createDescription(() => 'Press Enter to submit');
 * return <button {...descProps}>Submit</button>;
 * ```
 */
export function createDescription(description: Accessor<string | undefined>): DescriptionProps {
  if (isServer) {
    return {};
  }

  const [id, setId] = createSignal<string | undefined>();

  createEffect(() => {
    const desc = description();

    if (!desc) {
      setId(undefined);
      return;
    }

    let node = descriptionNodes.get(desc);

    if (!node) {
      const newId = `solidaria-description-${descriptionId++}`;
      setId(newId);

      const element = document.createElement("div");
      element.id = newId;
      element.style.display = "none";
      element.textContent = desc;
      document.body.appendChild(element);

      node = { refCount: 0, element };
      descriptionNodes.set(desc, node);
    } else {
      setId(node.element.id);
    }

    node.refCount++;

    onCleanup(() => {
      if (node && --node.refCount === 0) {
        node.element.remove();
        descriptionNodes.delete(desc);
      }
    });
  });

  return {
    get "aria-describedby"() {
      const desc = description();
      return desc ? id() : undefined;
    },
  };
}

/**
 * Utility to get all active description nodes (for testing).
 * @internal
 */
export function getDescriptionNodeCount(): number {
  return descriptionNodes.size;
}

/**
 * Utility to clear all description nodes (for testing cleanup).
 * @internal
 */
export function clearDescriptionNodes(): void {
  for (const [, node] of descriptionNodes) {
    node.element.remove();
  }
  descriptionNodes.clear();
}
