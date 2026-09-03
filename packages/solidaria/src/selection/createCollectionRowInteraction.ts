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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/gridlist/useGridListItem.ts

import type { Accessor, JSX } from "solid-js";
import {
  getActiveElement,
  getEventTarget,
  getFocusableTreeWalker,
  getScrollParent,
  isFocusable,
  isTabbable,
  nodeContains,
} from "../utils/dom";
import { focusSafely } from "../utils/focus";
import { scrollIntoViewport } from "../utils/scrollIntoView";

type KeyboardNavigationBehavior = "arrow" | "tab";

interface CollectionRowInteractionOptions {
  ref: Accessor<HTMLElement | null>;
  keyboardNavigationBehavior: Accessor<KeyboardNavigationBehavior>;
  direction?: Accessor<"ltr" | "rtl">;
}

type CollectionRowInteractionProps<T extends HTMLElement> = JSX.HTMLAttributes<T> & {
  onKeyDownCapture?: JSX.EventHandler<T, KeyboardEvent>;
  "oncapture:keydown"?: JSX.EventHandler<T, KeyboardEvent>;
};

/**
 * Nested ActionMenu / checkbox widgets in an arrow-nav row are focusable but
 * `tabIndex=-1`, so `isTabbable` misses them. Walk to the nearest focusable
 * ancestor inside the row (the event target is often an SVG inside the trigger).
 */
function isNestedFocusableChild(row: Element, target: Element): boolean {
  let el: Element | null = target;
  while (el && el !== row) {
    if (isFocusable(el)) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function lastFocusable(walker: TreeWalker): HTMLElement | null {
  let last: Node | null = null;
  let next: Node | null;
  while ((next = walker.nextNode())) {
    last = next;
  }
  return last instanceof HTMLElement ? last : null;
}

function scrollFocusedElementIntoView(row: HTMLElement, element: HTMLElement): void {
  focusSafely(element);
  scrollIntoViewport(element, { containingElement: getScrollParent(row) });
}

function redispatchCollectionArrowKey(row: HTMLElement, event: KeyboardEvent): void {
  row.parentElement?.dispatchEvent(
    new KeyboardEvent(event.type, {
      altKey: event.altKey,
      bubbles: true,
      cancelable: event.cancelable,
      code: event.code,
      composed: event.composed,
      ctrlKey: event.ctrlKey,
      key: event.key,
      location: event.location,
      metaKey: event.metaKey,
      repeat: event.repeat,
      shiftKey: event.shiftKey,
    }),
  );
}

function shouldIgnoreRowEvent(event: Event, row: HTMLElement): boolean {
  const target = getEventTarget<Element>(event);
  const currentTarget = event.currentTarget as Element | null;
  return (
    !target || !currentTarget || !nodeContains(currentTarget, target) || !nodeContains(row, target)
  );
}

export function mergeCollectionRowInteractionProps<T extends HTMLElement>(
  rowProps: CollectionRowInteractionProps<T>,
  options: CollectionRowInteractionOptions,
): CollectionRowInteractionProps<T> {
  const baseOnKeyDownCapture = (rowProps["oncapture:keydown"] ?? rowProps.onKeyDownCapture) as
    | ((event: KeyboardEvent) => void)
    | undefined;
  const baseOnKeyDown = rowProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined;
  const baseOnPointerDown = rowProps.onPointerDown as ((event: PointerEvent) => void) | undefined;
  const baseOnMouseDown = rowProps.onMouseDown as ((event: MouseEvent) => void) | undefined;

  const onKeyDownCapture = (event: KeyboardEvent) => {
    const row = options.ref();
    const activeElement = getActiveElement(row?.ownerDocument);
    if (
      options.keyboardNavigationBehavior() !== "arrow" ||
      !row ||
      !activeElement ||
      shouldIgnoreRowEvent(event, row)
    ) {
      baseOnKeyDownCapture?.(event);
      return;
    }

    const direction = options.direction?.() ?? "ltr";
    const walker = getFocusableTreeWalker(row);
    walker.currentNode = activeElement;

    switch (event.key) {
      case "ArrowLeft": {
        const focusable =
          direction === "rtl"
            ? (walker.nextNode() as HTMLElement | null)
            : (walker.previousNode() as HTMLElement | null);

        event.preventDefault();
        event.stopPropagation();

        if (focusable) {
          scrollFocusedElementIntoView(row, focusable);
        } else if (direction === "rtl") {
          scrollFocusedElementIntoView(row, row);
        } else {
          walker.currentNode = row;
          const lastElement = lastFocusable(walker);
          if (lastElement) {
            scrollFocusedElementIntoView(row, lastElement);
          }
        }
        break;
      }
      case "ArrowRight": {
        const focusable =
          direction === "rtl"
            ? (walker.previousNode() as HTMLElement | null)
            : (walker.nextNode() as HTMLElement | null);

        event.preventDefault();
        event.stopPropagation();

        if (focusable) {
          scrollFocusedElementIntoView(row, focusable);
        } else if (direction === "ltr") {
          scrollFocusedElementIntoView(row, row);
        } else {
          walker.currentNode = row;
          const lastElement = lastFocusable(walker);
          if (lastElement) {
            scrollFocusedElementIntoView(row, lastElement);
          }
        }
        break;
      }
      case "ArrowUp":
      case "ArrowDown": {
        if (!event.altKey) {
          event.preventDefault();
          event.stopPropagation();
          redispatchCollectionArrowKey(row, event);
        }
        break;
      }
    }

    if (!event.cancelBubble) {
      baseOnKeyDownCapture?.(event);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const row = options.ref();
    const target = getEventTarget<Element>(event);
    const activeElement = getActiveElement(row?.ownerDocument);

    if (row && target && activeElement && !shouldIgnoreRowEvent(event, row)) {
      if (options.keyboardNavigationBehavior() === "tab" && target !== row && event.key !== "Tab") {
        event.stopPropagation();
        return;
      }

      if (options.keyboardNavigationBehavior() === "tab" && event.key === "Tab") {
        const walker = getFocusableTreeWalker(row, { tabbable: true });
        walker.currentNode = activeElement;
        const next = event.shiftKey ? walker.previousNode() : walker.nextNode();

        if (next) {
          event.stopPropagation();
        }
      }
    }

    if (!event.cancelBubble) {
      baseOnKeyDown?.(event);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    const row = options.ref();
    const target = getEventTarget<Element>(event);
    if (row && target && target !== row && isNestedFocusableChild(row, target)) {
      event.stopPropagation();
      return;
    }
    baseOnPointerDown?.(event);
  };

  const onMouseDown = (event: MouseEvent) => {
    const row = options.ref();
    const target = getEventTarget<Element>(event);
    if (row && target && target !== row && isNestedFocusableChild(row, target)) {
      event.stopPropagation();
      return;
    }
    baseOnMouseDown?.(event);
  };

  const captureHandler =
    options.keyboardNavigationBehavior() === "arrow" ? onKeyDownCapture : baseOnKeyDownCapture;

  return {
    ...rowProps,
    // Solid ignores React's `onKeyDownCapture` on a spread; `oncapture:keydown` is
    // the live capture binding (same prefix as createDraggableItem). Keep the
    // RAC name so unit tests can still invoke the handler off rowProps.
    "oncapture:keydown": captureHandler,
    onKeyDownCapture: captureHandler,
    onKeyDown,
    onPointerDown,
    onMouseDown,
  };
}
