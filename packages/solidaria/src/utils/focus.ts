/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/focusSafely.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/utils.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/focusWithoutScrolling.ts

/**
 * Focus management utilities.
 * Based on these pinned React Aria sources:
 * - packages/react-aria/src/utils/focusWithoutScrolling.ts
 * - packages/react-aria/src/interactions/utils.ts
 * - packages/react-aria/src/interactions/focusSafely.ts
 *
 * runAfterPaint and the focusVisible option are local Solid adapters.
 */

import {
  getInteractionModality,
  setIgnoreFocusEvent,
} from "../interactions/createInteractionModality";
import {
  getActiveElement,
  getEventTarget,
  getOwnerDocument,
  getOwnerWindow,
  isFocusable,
  isShadowRoot,
  nodeContains,
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
  const win = ownerDoc
    ? (ownerDoc.defaultView ?? undefined)
    : typeof window !== "undefined"
      ? window
      : undefined;
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
  // The browser will focus the nearest focusable ancestor of our target.
  while (target && !isFocusable(target, { skipVisibilityCheck: true })) {
    target = target.parentElement;
  }

  const ownerWindow = getOwnerWindow(target);
  const activeElement = getActiveElement(ownerWindow.document) as HTMLElement | null;
  if (!activeElement || activeElement === target) {
    return undefined;
  }

  // Listen on the target's root (document or shadow root) so we catch focus events inside
  // shadow DOM; they do not reach the main window.
  const targetRoot = target?.getRootNode();
  const root = targetRoot != null && isShadowRoot(targetRoot) ? targetRoot : ownerWindow;

  // Focus is "moving to target" when it moves to the button or to a descendant of the button
  // (e.g. SVG icon)
  const isFocusMovingToTarget = (focusTarget: Element | null) =>
    focusTarget === target || (focusTarget != null && nodeContains(target, focusTarget));
  // Blur/focusout events have their target as the element losing focus. Stop propagation when
  // that is the previously focused element (activeElement) or a descendant (e.g. in shadow DOM).
  const isBlurFromActiveElement = (eventTarget: Element | null) =>
    eventTarget === activeElement ||
    (activeElement != null && eventTarget != null && nodeContains(activeElement, eventTarget));

  setIgnoreFocusEvent(true);
  let isRefocusing = false;
  const onBlur: EventListener = (e) => {
    if (isBlurFromActiveElement(getEventTarget(e) as Element) || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  const onFocusOut: EventListener = (e) => {
    if (isBlurFromActiveElement(getEventTarget(e) as Element) || isRefocusing) {
      e.stopImmediatePropagation();

      // If there was no focusable ancestor, we don't expect a focus event.
      // Re-focus the original active element here.
      if (!target && !isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  const onFocus: EventListener = (e) => {
    if (isFocusMovingToTarget(getEventTarget(e) as Element) || isRefocusing) {
      e.stopImmediatePropagation();
    }
  };

  const onFocusIn: EventListener = (e) => {
    if (isFocusMovingToTarget(getEventTarget(e) as Element) || isRefocusing) {
      e.stopImmediatePropagation();

      if (!isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  root.addEventListener("blur", onBlur, true);
  root.addEventListener("focusout", onFocusOut, true);
  root.addEventListener("focusin", onFocusIn, true);
  root.addEventListener("focus", onFocus, true);

  const raf = ownerWindow.requestAnimationFrame(cleanup);

  function cleanup() {
    ownerWindow.cancelAnimationFrame(raf);
    root.removeEventListener("blur", onBlur, true);
    root.removeEventListener("focusout", onFocusOut, true);
    root.removeEventListener("focusin", onFocusIn, true);
    root.removeEventListener("focus", onFocus, true);
    setIgnoreFocusEvent(false);
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
