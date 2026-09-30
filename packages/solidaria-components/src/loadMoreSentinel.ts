// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useLoadMoreSentinel.ts

import { getScrollParent } from "@proyecto-viviana/solidaria/utils";

/**
 * IntersectionObserver init for a collection load-more sentinel.
 * These items omit `direction`, so this is the pin's default end margin.
 * A start margin belongs to a caller that passes `direction: "start"`.
 */
export function loadMoreSentinelObserverInit(
  sentinel: Element,
  scrollOffset: number,
): IntersectionObserverInit {
  const margin = 100 * scrollOffset;
  return {
    root: getScrollParent(sentinel),
    rootMargin: `0px ${margin}% ${margin}% ${margin}%`,
  };
}
