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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useInteractOutside.ts

/**
 * Detects interactions outside a given element.
 * Based on @react-aria/interactions useInteractOutside.
 */

import { createEffect, onCleanup } from "solid-js";
import { getOwnerDocument } from "../utils";

export interface InteractOutsideProps {
  /** Reference to the element to detect interactions outside of. */
  ref: () => Element | null;
  /** Handler called when an interaction outside the element completes. */
  onInteractOutside?: (e: PointerEvent) => void;
  /** Handler called when an interaction outside the element starts. */
  onInteractOutsideStart?: (e: PointerEvent) => void;
  /** Whether the interact outside events should be disabled. */
  isDisabled?: boolean;
}

/**
 * Detects interactions outside a given element, used in components like
 * Dialogs and Popovers so they can close when a user clicks outside them.
 */
export function createInteractOutside(props: InteractOutsideProps): void {
  let isPointerDown = false;
  let ignoreEmulatedMouseEvents = false;

  createEffect(() => {
    const { ref, onInteractOutside, onInteractOutsideStart, isDisabled } = props;

    if (isDisabled) {
      return;
    }

    const element = ref();
    const documentObject = getOwnerDocument(element);

    const onPointerDown = (e: PointerEvent) => {
      if (onInteractOutside && isValidEvent(e, ref)) {
        if (onInteractOutsideStart) {
          onInteractOutsideStart(e);
        }
        isPointerDown = true;
      }
    };

    const triggerInteractOutside = (e: PointerEvent) => {
      if (onInteractOutside) {
        onInteractOutside(e);
      }
    };

    // Use pointer events if available. Otherwise, fall back to mouse and touch events.
    if (typeof PointerEvent !== "undefined") {
      const onClick = (e: PointerEvent) => {
        if (isPointerDown && isValidEvent(e, ref)) {
          triggerInteractOutside(e);
        }
        isPointerDown = false;
      };

      // Use click instead of pointerup to avoid Android Chrome issue
      // https://issues.chromium.org/issues/40732224
      documentObject.addEventListener("pointerdown", onPointerDown as EventListener, true);
      documentObject.addEventListener("click", onClick as EventListener, true);

      onCleanup(() => {
        documentObject.removeEventListener("pointerdown", onPointerDown as EventListener, true);
        documentObject.removeEventListener("click", onClick as EventListener, true);
      });
    } else {
      // Fallback for environments without PointerEvent (mainly tests)
      const onMouseUp = (e: MouseEvent) => {
        if (ignoreEmulatedMouseEvents) {
          ignoreEmulatedMouseEvents = false;
        } else if (isPointerDown && isValidEvent(e as unknown as PointerEvent, ref)) {
          triggerInteractOutside(e as unknown as PointerEvent);
        }
        isPointerDown = false;
      };

      const onTouchEnd = (e: TouchEvent) => {
        ignoreEmulatedMouseEvents = true;
        if (isPointerDown && isValidEvent(e as unknown as PointerEvent, ref)) {
          triggerInteractOutside(e as unknown as PointerEvent);
        }
        isPointerDown = false;
      };

      const onMouseDown = (e: MouseEvent) => {
        if (onInteractOutside && isValidEvent(e as unknown as PointerEvent, ref)) {
          if (onInteractOutsideStart) {
            onInteractOutsideStart(e as unknown as PointerEvent);
          }
          isPointerDown = true;
        }
      };

      const onTouchStart = (e: TouchEvent) => {
        if (onInteractOutside && isValidEvent(e as unknown as PointerEvent, ref)) {
          if (onInteractOutsideStart) {
            onInteractOutsideStart(e as unknown as PointerEvent);
          }
          isPointerDown = true;
        }
      };

      documentObject.addEventListener("mousedown", onMouseDown as EventListener, true);
      documentObject.addEventListener("mouseup", onMouseUp as EventListener, true);
      documentObject.addEventListener("touchstart", onTouchStart as EventListener, true);
      documentObject.addEventListener("touchend", onTouchEnd as EventListener, true);

      onCleanup(() => {
        documentObject.removeEventListener("mousedown", onMouseDown as EventListener, true);
        documentObject.removeEventListener("mouseup", onMouseUp as EventListener, true);
        documentObject.removeEventListener("touchstart", onTouchStart as EventListener, true);
        documentObject.removeEventListener("touchend", onTouchEnd as EventListener, true);
      });
    }
  });
}

function isValidEvent(
  event: PointerEvent | MouseEvent | TouchEvent,
  ref: () => Element | null,
): boolean {
  // Only handle primary button clicks
  if ("button" in event && event.button > 0) {
    return false;
  }

  if (event.target) {
    // If the event target is no longer in the document, ignore
    const ownerDocument = (event.target as Element).ownerDocument;
    if (!ownerDocument || !ownerDocument.documentElement.contains(event.target as Node)) {
      return false;
    }
    // If the target is within a top layer element (e.g. toasts), ignore
    if ((event.target as Element).closest?.("[data-solidaria-top-layer]")) {
      return false;
    }
  }

  const element = ref();
  if (!element) {
    return false;
  }

  // When the event source is inside a Shadow DOM, event.target is just the shadow root.
  // Using event.composedPath instead means we can get the actual element inside the shadow root.
  return !event.composedPath().includes(element);
}
