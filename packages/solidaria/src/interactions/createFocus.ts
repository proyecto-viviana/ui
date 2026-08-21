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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useFocus.ts

/**
 * createFocus - Handles focus events for the immediate target.
 *
 * This is a 1-1 port of React-Aria's useFocus hook adapted for SolidJS.
 * Focus events on child elements will be ignored.
 */

import { JSX, onCleanup } from "solid-js";
import { getOwnerDocument, getEventTarget } from "../utils";
function getActiveElement(doc: Document): Element | null {
  let activeElement = doc.activeElement;
  while (activeElement && (activeElement as Element).shadowRoot?.activeElement) {
    activeElement = (activeElement as Element).shadowRoot?.activeElement ?? null;
  }
  return activeElement;
}

export interface FocusEvents {
  /** Handler that is called when the element receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the element loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the element's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
}

export interface CreateFocusProps extends FocusEvents {
  /** Whether the focus events should be disabled. */
  isDisabled?: boolean;
}

export interface FocusResult {
  /** Props to spread onto the target element. */
  focusProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Synthetic blur event handler for Firefox bug workaround.
 * React (and we) don't fire onBlur when an element is disabled.
 * Most browsers fire a native focusout event in this case, except for Firefox.
 * We use a MutationObserver to watch for the disabled attribute.
 */
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

      const onBlurHandler = (_blurEvent: Event) => {
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

      // Return cleanup function
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
 * Handles focus events for the immediate target.
 * Focus events on child elements will be ignored.
 *
 * Based on react-aria's useFocus but adapted for SolidJS.
 */
export function createFocus(props: CreateFocusProps = {}): FocusResult {
  // Read isDisabled/handlers off `props` directly (not via destructure): a Solid
  // hook body runs once, so a destructure would freeze them at call time. The
  // handlers read props.x live and the returned props are getters, mirroring
  // upstream useFocus's per-render re-read. guard:idiomatic-solid.
  let cleanupRef: (() => void) | undefined;
  const syntheticBlurHandler = createSyntheticBlurHandler();

  // Cleanup on unmount
  onCleanup(() => {
    if (cleanupRef) {
      cleanupRef();
    }
  });

  const onBlur: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    // Only handle if target is the currentTarget (not bubbled from children)
    if (e.target === e.currentTarget) {
      if (props.onBlur) {
        props.onBlur(e);
      }

      if (props.onFocusChange) {
        props.onFocusChange(false);
      }

      cleanupRef?.();
      cleanupRef = undefined;
    }
  };

  const onFocus: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    // Double check that document.activeElement actually matches e.target
    // in case a previously chained focus handler already moved focus somewhere else.
    const ownerDocument = getOwnerDocument(e.target);
    const activeElement = ownerDocument ? getActiveElement(ownerDocument) : null;

    if (e.target === e.currentTarget && activeElement === getEventTarget(e)) {
      if (props.onFocus) {
        props.onFocus(e);
      }

      if (props.onFocusChange) {
        props.onFocusChange(true);
      }

      // Set up synthetic blur handler for Firefox bug
      cleanupRef = syntheticBlurHandler(e, e.target);
    }
  };

  // If disabled or no handlers, return empty props. Getters re-read props so a
  // later isDisabled/handler change is reflected (the body itself runs once).
  return {
    focusProps: {
      get onFocus() {
        if (props.isDisabled) {
          return undefined;
        }
        return props.onFocus || props.onFocusChange || props.onBlur ? onFocus : undefined;
      },
      get onBlur() {
        if (props.isDisabled) {
          return undefined;
        }
        return props.onBlur || props.onFocusChange ? onBlur : undefined;
      },
    },
  };
}
