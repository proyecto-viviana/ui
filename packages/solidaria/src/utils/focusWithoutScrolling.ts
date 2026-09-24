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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/focusWithoutScrolling.ts

let supportsPreventScrollCached: boolean | null = null;

export function supportsPreventScroll(): boolean {
  if (supportsPreventScrollCached == null) {
    supportsPreventScrollCached = false;
    try {
      const focusElem = document.createElement("div");
      focusElem.focus({
        get preventScroll() {
          supportsPreventScrollCached = true;
          return true;
        },
      });
    } catch {
      // Ignore
    }
  }
  return supportsPreventScrollCached;
}

/** Reset the cached feature detection value. Exported for testing only. */
export function resetSupportsPreventScroll(): void {
  supportsPreventScrollCached = null;
}

interface ScrollableElement {
  element: HTMLElement;
  scrollTop: number;
  scrollLeft: number;
}

function getScrollableElements(element: HTMLElement): ScrollableElement[] {
  let parent = element.parentNode;
  const scrollableElements: ScrollableElement[] = [];
  const rootScrollingElement = document.scrollingElement || document.documentElement;
  while (parent instanceof HTMLElement && parent !== rootScrollingElement) {
    if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) {
      scrollableElements.push({
        element: parent,
        scrollTop: parent.scrollTop,
        scrollLeft: parent.scrollLeft,
      });
    }
    parent = parent.parentNode;
  }
  if (rootScrollingElement instanceof HTMLElement) {
    scrollableElements.push({
      element: rootScrollingElement,
      scrollTop: rootScrollingElement.scrollTop,
      scrollLeft: rootScrollingElement.scrollLeft,
    });
  }
  return scrollableElements;
}

function restoreScrollPosition(scrollableElements: ScrollableElement[]): void {
  for (const { element, scrollTop, scrollLeft } of scrollableElements) {
    element.scrollTop = scrollTop;
    element.scrollLeft = scrollLeft;
  }
}

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
  if (supportsPreventScroll()) {
    element.focus({ preventScroll: true, ...options });
  } else {
    const scrollableElements = getScrollableElements(element);
    element.focus(options);
    restoreScrollPosition(scrollableElements);
  }
}
