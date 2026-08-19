/**
 * Focus management utilities.
 * Based on @react-aria/utils focus utilities.
 */

import { getInteractionModality } from "../interactions/createInteractionModality";
import {
  getActiveElement,
  getEventTarget,
  getOwnerDocument,
  getOwnerWindow,
  isFocusable,
} from "./dom";
import { runAfterTransition } from "./runAfterTransition";

/**
 * Extra `element.focus()` options besides `preventScroll`, which this helper
 * always sets. `focusVisible` is the HTML focus option that requests CSS
 * `:focus-visible` (Chrome 131+); ignored by browsers that don't implement it.
 */
export type FocusWithoutScrollingOptions = Pick<FocusOptions, "focusVisible">;

/**
 * Focuses an element without scrolling the page.
 * Uses preventScroll option with fallback for older browsers.
 */
export function focusWithoutScrolling(
  element: HTMLElement | null,
  options?: FocusWithoutScrollingOptions,
): void {
  if (!element) return;

  const focusOptions: FocusOptions = { preventScroll: true, ...options };

  try {
    element.focus(focusOptions);
  } catch {
    // Fallback for browsers that don't support preventScroll
    const scrollableElements = getScrollableAncestors(element);
    const scrollPositions = scrollableElements.map((el) => ({
      element: el,
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft,
    }));

    element.focus(options);

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
 * Run `fn` after paint. Mirrors React `useEffect` relative to `preventFocus`,
 * which holds focus with capture listeners until the next animation frame.
 * Overlay auto-focus that runs in the same flush as the opening click is yanked
 * back onto the trigger; this delay is the Solid equivalent of upstream's
 * `useEffect` auto-focus.
 */
export function runAfterPaint(fn: () => void, doc?: Document): () => void {
  const ownerDoc = doc ?? (typeof document !== "undefined" ? document : undefined);
  const win = ownerDoc?.defaultView ?? (typeof window !== "undefined" ? window : undefined);
  if (!win) {
    fn();
    return () => {};
  }

  // Window timers return `number` (DOM); `types: ["node"]` types global
  // `setTimeout` as `NodeJS.Timeout`. Hold the union so both views compile.
  let timeoutId: ReturnType<typeof setTimeout> | number | undefined;
  let cancelled = false;

  const run = () => {
    if (cancelled) return;
    fn();
  };

  const scheduleTimeout = () => {
    if (cancelled) return;
    timeoutId = win.setTimeout(run, 0);
  };

  let frameId: number | undefined;
  if (typeof win.requestAnimationFrame === "function") {
    frameId = win.requestAnimationFrame(scheduleTimeout);
  } else {
    scheduleTimeout();
  }

  return () => {
    cancelled = true;
    if (frameId != null) {
      win.cancelAnimationFrame(frameId);
    }
    if (timeoutId !== undefined) {
      win.clearTimeout(timeoutId);
    }
  };
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
 * Focus an element while avoiding page scroll and VoiceOver/iOS transition
 * side effects. Port of @react-aria/interactions focusSafely: virtual-modality
 * focus waits until in-flight CSS transitions end so contain-restore after a
 * programmatic focus (Playwright `.focus()`, screen readers) does not beat a
 * following pointermove.
 */
export function focusSafely(
  element: HTMLElement | null,
  options?: FocusWithoutScrollingOptions,
): void {
  if (!element?.isConnected) {
    return;
  }

  const ownerDocument = getOwnerDocument(element);
  if (getInteractionModality() === "virtual") {
    const lastFocusedElement = getActiveElement(ownerDocument);
    runAfterTransition(() => {
      const activeElement = getActiveElement(ownerDocument);
      if (
        (activeElement === lastFocusedElement || activeElement === ownerDocument.body) &&
        element.isConnected
      ) {
        focusWithoutScrolling(element, options);
      }
    });
  } else {
    focusWithoutScrolling(element, options);
  }
}
