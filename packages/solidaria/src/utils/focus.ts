/**
 * Focus management utilities.
 * Based on @react-aria/utils focus utilities.
 */

import { getEventTarget, getOwnerDocument, getOwnerWindow, isFocusable } from "./dom";

/**
 * Focuses an element without scrolling the page.
 * Uses preventScroll option with fallback for older browsers.
 */
export function focusWithoutScrolling(element: HTMLElement | null): void {
  if (!element) return;

  try {
    element.focus({ preventScroll: true });
  } catch {
    // Fallback for browsers that don't support preventScroll
    const scrollableElements = getScrollableAncestors(element);
    const scrollPositions = scrollableElements.map((el) => ({
      element: el,
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft,
    }));

    element.focus();

    for (const { element: el, scrollTop, scrollLeft } of scrollPositions) {
      el.scrollTop = scrollTop;
      el.scrollLeft = scrollLeft;
    }
  }
}

/**
 * Gets all scrollable ancestors of an element.
 */
function getScrollableAncestors(element: Element): Element[] {
  const ancestors: Element[] = [];
  let parent = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowX === "auto" ||
      overflowX === "scroll"
    ) {
      ancestors.push(parent);
    }

    parent = parent.parentElement;
  }

  // Also include the document scrolling element
  const doc = getOwnerDocument(element);
  ancestors.push(doc.documentElement);

  return ancestors;
}

/**
 * Prevents focus from moving to a new element temporarily.
 * Used when clicking on a button that shouldn't steal focus.
 */
export function preventFocus(target: Element | null): (() => void) | undefined {
  while (target && !isFocusable(target)) {
    target = target.parentElement;
  }

  const ownerWindow = getOwnerWindow(target);
  const activeElement = ownerWindow.document.activeElement as HTMLElement | null;

  if (!activeElement || activeElement === target) {
    return undefined;
  }

  let isRefocusing = false;

  const onBlur = (event: FocusEvent) => {
    if (getEventTarget(event) === activeElement || isRefocusing) {
      event.stopImmediatePropagation();
    }
  };

  const onFocusOut = (event: FocusEvent) => {
    if (getEventTarget(event) === activeElement || isRefocusing) {
      event.stopImmediatePropagation();

      if (!target && !isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  const onFocus = (event: FocusEvent) => {
    if (getEventTarget(event) === target || isRefocusing) {
      event.stopImmediatePropagation();
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    if (getEventTarget(event) === target || isRefocusing) {
      event.stopImmediatePropagation();

      if (!isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  ownerWindow.addEventListener("blur", onBlur, true);
  ownerWindow.addEventListener("focusout", onFocusOut, true);
  ownerWindow.addEventListener("focusin", onFocusIn, true);
  ownerWindow.addEventListener("focus", onFocus, true);

  const raf = ownerWindow.requestAnimationFrame(cleanup);

  function cleanup() {
    ownerWindow.cancelAnimationFrame(raf);
    ownerWindow.removeEventListener("blur", onBlur, true);
    ownerWindow.removeEventListener("focusout", onFocusOut, true);
    ownerWindow.removeEventListener("focusin", onFocusIn, true);
    ownerWindow.removeEventListener("focus", onFocus, true);
    isRefocusing = false;
  }

  return cleanup;
}

/**
 * Safely focuses an element, alias for focusWithoutScrolling.
 * This matches the react-aria focusSafely function name.
 */
export const focusSafely = focusWithoutScrolling;
