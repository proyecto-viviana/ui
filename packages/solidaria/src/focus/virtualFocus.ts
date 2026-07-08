/**
 * Virtual-focus event dispatch primitives.
 *
 * A faithful port of @react-aria/focus's `virtualFocus` module. Under virtual
 * focus (e.g. Autocomplete), real DOM focus stays on an input while the
 * "focused" collection option is indicated by `aria-activedescendant`. Moving
 * that virtual cursor dispatches synthetic `focus`/`blur` events (with matching
 * bubbling `focusin`/`focusout`) on the option elements so listeners — notably
 * the autocomplete input's `focusin` handler that mirrors the active descendant
 * — react as if the element were really focused.
 */

import { getActiveElement, getOwnerDocument } from "../utils/dom";

/**
 * Moves virtual focus to `to`, dispatching a virtual blur on the previously
 * virtually-focused element (if any) and a virtual focus on `to` (if non-null).
 */
export function moveVirtualFocus(to: Element | null): void {
  const from = getVirtuallyFocusedElement(getOwnerDocument(to));
  if (from !== to) {
    if (from) {
      dispatchVirtualBlur(from, to);
    }
    if (to) {
      dispatchVirtualFocus(to, from);
    }
  }
}

/** Dispatches synthetic `blur` + bubbling `focusout` events on `from`. */
export function dispatchVirtualBlur(from: Element, to: Element | null): void {
  from.dispatchEvent(new FocusEvent("blur", { relatedTarget: to }));
  from.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: to }));
}

/** Dispatches synthetic `focus` + bubbling `focusin` events on `to`. */
export function dispatchVirtualFocus(to: Element, from: Element | null): void {
  to.dispatchEvent(new FocusEvent("focus", { relatedTarget: from }));
  to.dispatchEvent(new FocusEvent("focusin", { bubbles: true, relatedTarget: from }));
}

/**
 * Returns the currently virtually-focused element: the element referenced by the
 * active element's `aria-activedescendant`, or the active element itself.
 */
export function getVirtuallyFocusedElement(document: Document): Element | null {
  const activeElement = getActiveElement(document);
  const activeDescendant = activeElement?.getAttribute("aria-activedescendant");
  if (activeDescendant) {
    return document.getElementById(activeDescendant) || activeElement;
  }

  return activeElement;
}
