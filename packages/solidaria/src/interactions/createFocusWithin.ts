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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useFocusWithin.ts

/**
 * createFocusWithin - Handles focus events for the target and its descendants.
 *
 * This is a 1-1 port of React-Aria's useFocusWithin hook adapted for SolidJS.
 */

import { JSX, onCleanup } from "solid-js";
import { getOwnerDocument, getEventTarget, nodeContains, createGlobalListeners } from "../utils";
import { setEventTarget } from "../utils/events";

export interface FocusWithinProps {
  /** Whether the focus within events should be disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the target element or a descendant receives focus. */
  onFocusWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the target element and all descendants lose focus. */
  onBlurWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the focus within state changes. */
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinResult {
  /** Props to spread onto the target element. */
  focusWithinProps: JSX.HTMLAttributes<HTMLElement>;
}

function getActiveElement(doc: Document): Element | null {
  let activeElement = doc.activeElement;
  while (activeElement && (activeElement as Element).shadowRoot?.activeElement) {
    activeElement = (activeElement as Element).shadowRoot?.activeElement ?? null;
  }
  return activeElement;
}

function createSyntheticBlurHandler(): (
  _e: FocusEvent,
  target: Element,
) => (() => void) | undefined {
  let isFocused = false;
  let observer: MutationObserver | null = null;

  return (_e: FocusEvent, target: Element) => {
    if (
      target instanceof HTMLButtonElement ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      isFocused = true;

      const onBlurHandler = () => {
        isFocused = false;

        if (observer) {
          observer.disconnect();
          observer = null;
        }
      };

      target.addEventListener("focusout", onBlurHandler, { once: true });

      observer = new MutationObserver(() => {
        if (isFocused && (target as HTMLButtonElement).disabled) {
          isFocused = false;
          observer?.disconnect();
          observer = null;
          const ownerDocument = target.ownerDocument;
          const relatedTarget =
            target === ownerDocument.activeElement ? null : ownerDocument.activeElement;
          target.dispatchEvent(new FocusEvent("blur", { relatedTarget }));
          target.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget }));
        }
      });

      observer.observe(target, { attributes: true, attributeFilter: ["disabled"] });

      return () => {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      };
    }

    return undefined;
  };
}

/**
 * Handles focus events for the target and its descendants.
 *
 * Based on react-aria's useFocusWithin but adapted for SolidJS.
 */
export function createFocusWithin(props: FocusWithinProps = {}): FocusWithinResult {
  // Read isDisabled/handlers off `props` directly (not via destructure): a Solid
  // hook body runs once, so destructuring would freeze them at call time and drop
  // reactive updates — createOverlay/createVisuallyHidden pass a live isDisabled
  // getter. The handlers below read props.x live; the return is getter-based so a
  // later isDisabled flip re-computes. Mirrors upstream useFocusWithin's re-read.

  // State tracking
  let isFocusWithin = false;

  // Global listeners manager
  const { addGlobalListener, removeAllGlobalListeners } = createGlobalListeners();
  const syntheticBlurHandler = createSyntheticBlurHandler();
  let cleanupRef: (() => void) | undefined;

  // Cleanup on unmount
  onCleanup(() => {
    cleanupRef?.();
    removeAllGlobalListeners();
  });

  const onBlur: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    // Ignore events bubbling through portals
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }

    // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (isFocusWithin && !e.currentTarget.contains(e.relatedTarget as Node)) {
      isFocusWithin = false;
      removeAllGlobalListeners();
      cleanupRef?.();
      cleanupRef = undefined;

      if (props.onBlurWithin) {
        props.onBlurWithin(e);
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(false);
      }
    }
  };

  const onFocus: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    // Ignore events bubbling through portals
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }

    // Double check that document.activeElement actually matches e.target
    // in case a previously chained focus handler already moved focus somewhere else.
    const ownerDocument = getOwnerDocument(e.target);
    const activeElement = ownerDocument ? getActiveElement(ownerDocument) : null;

    if (!isFocusWithin && activeElement === getEventTarget(e)) {
      if (props.onFocusWithin) {
        props.onFocusWithin(e);
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(true);
      }

      isFocusWithin = true;
      cleanupRef = syntheticBlurHandler(e, e.target);

      // Browsers don't fire blur events when elements are removed from the DOM.
      // However, if a focus event occurs outside the element we're tracking, we
      // can manually fire onBlur.
      const currentTarget = e.currentTarget;

      addGlobalListener(
        "focus",
        (focusEvent: Event) => {
          if (
            isFocusWithin &&
            !nodeContains(currentTarget, (focusEvent as FocusEvent).target as Element)
          ) {
            // Create a synthetic blur event
            const window = ownerDocument?.defaultView;
            if (window) {
              const nativeEvent = new window.FocusEvent("blur", {
                relatedTarget: (focusEvent as FocusEvent).target as Element,
              });
              setEventTarget(nativeEvent, currentTarget);

              isFocusWithin = false;
              removeAllGlobalListeners();

              if (props.onBlurWithin) {
                props.onBlurWithin(nativeEvent);
              }

              if (props.onFocusWithinChange) {
                props.onFocusWithinChange(false);
              }
              cleanupRef?.();
              cleanupRef = undefined;
            }
          }
        },
        { capture: true },
      );
    }
  };

  return {
    focusWithinProps: {
      get onFocus() {
        return props.isDisabled ? undefined : onFocus;
      },
      get onBlur() {
        return props.isDisabled ? undefined : onBlur;
      },
    },
  };
}
