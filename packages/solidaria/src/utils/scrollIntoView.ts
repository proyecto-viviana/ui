/**
 * Scroll-into-view utilities.
 * Based on @react-aria/utils scrollIntoView (react-aria/src/utils/scrollIntoView.ts).
 */

import { getScrollParents } from "./dom";
import { isIOS } from "./platform";
import { isTestEnv } from "./env";

interface ScrollIntoViewOpts {
  /** The position to align items along the block axis in. */
  block?: ScrollLogicalPosition;
  /** The position to align items along the inline axis in. */
  inline?: ScrollLogicalPosition;
}

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null;
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  opts: ScrollIntoViewOpts = {},
): void {
  const { block = "nearest", inline = "nearest" } = opts;

  if (scrollView === element) {
    return;
  }

  let y = scrollView.scrollTop;
  let x = scrollView.scrollLeft;

  const target = element.getBoundingClientRect();
  const view = scrollView.getBoundingClientRect();
  const itemStyle = window.getComputedStyle(element);
  const viewStyle = window.getComputedStyle(scrollView);
  const root = document.scrollingElement || document.documentElement;
  const isRoot = scrollView === root;

  const viewTop = scrollView === root ? 0 : view.top;
  const viewBottom = scrollView === root ? scrollView.clientHeight : view.bottom;
  const viewLeft = scrollView === root ? 0 : view.left;
  const viewRight = scrollView === root ? scrollView.clientWidth : view.right;

  const scrollMarginTop = parseFloat(itemStyle.scrollMarginTop) || 0;
  const scrollMarginBottom = parseFloat(itemStyle.scrollMarginBottom) || 0;
  const scrollMarginLeft = parseFloat(itemStyle.scrollMarginLeft) || 0;
  const scrollMarginRight = parseFloat(itemStyle.scrollMarginRight) || 0;

  const scrollPaddingTop = parseFloat(viewStyle.scrollPaddingTop) || 0;
  const scrollPaddingBottom = parseFloat(viewStyle.scrollPaddingBottom) || 0;
  const scrollPaddingLeft = parseFloat(viewStyle.scrollPaddingLeft) || 0;
  const scrollPaddingRight = parseFloat(viewStyle.scrollPaddingRight) || 0;

  const borderTopWidth = parseFloat(viewStyle.borderTopWidth) || 0;
  const borderBottomWidth = parseFloat(viewStyle.borderBottomWidth) || 0;
  const borderLeftWidth = parseFloat(viewStyle.borderLeftWidth) || 0;
  const borderRightWidth = parseFloat(viewStyle.borderRightWidth) || 0;

  const scrollAreaTop = target.top - scrollMarginTop;
  const scrollAreaBottom = target.bottom + scrollMarginBottom;
  const scrollAreaLeft = target.left - scrollMarginLeft;
  const scrollAreaRight = target.right + scrollMarginRight;

  const scrollBarOffsetX = scrollView === root ? 0 : borderLeftWidth + borderRightWidth;
  const scrollBarOffsetY = scrollView === root ? 0 : borderTopWidth + borderBottomWidth;
  const scrollBarWidth =
    scrollView === root ? 0 : scrollView.offsetWidth - scrollView.clientWidth - scrollBarOffsetX;
  const scrollBarHeight =
    scrollView === root ? 0 : scrollView.offsetHeight - scrollView.clientHeight - scrollBarOffsetY;

  const scrollPortTop = viewTop + (isRoot ? 0 : borderTopWidth) + scrollPaddingTop;
  const scrollPortBottom =
    viewBottom - (isRoot ? 0 : borderBottomWidth) - scrollPaddingBottom - scrollBarHeight;
  let scrollPortLeft = viewLeft + (isRoot ? 0 : borderLeftWidth) + scrollPaddingLeft;
  let scrollPortRight = viewRight - (isRoot ? 0 : borderRightWidth) - scrollPaddingRight;

  // IOS always positions the scrollbar on the right ¯\_(ツ)_/¯
  if (viewStyle.direction === "rtl" && !isIOS()) {
    scrollPortLeft += scrollBarWidth;
  } else {
    scrollPortRight -= scrollBarWidth;
  }

  const shouldScrollBlock = scrollAreaTop < scrollPortTop || scrollAreaBottom > scrollPortBottom;
  const shouldScrollInline = scrollAreaLeft < scrollPortLeft || scrollAreaRight > scrollPortRight;

  if (shouldScrollBlock && block === "start") {
    y += scrollAreaTop - scrollPortTop;
  } else if (shouldScrollBlock && block === "center") {
    y += (scrollAreaTop + scrollAreaBottom) / 2 - (scrollPortTop + scrollPortBottom) / 2;
  } else if (shouldScrollBlock && block === "end") {
    y += scrollAreaBottom - scrollPortBottom;
  } else if (shouldScrollBlock && block === "nearest") {
    const start = scrollAreaTop - scrollPortTop;
    const end = scrollAreaBottom - scrollPortBottom;
    y += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (shouldScrollInline && inline === "start") {
    x += scrollAreaLeft - scrollPortLeft;
  } else if (shouldScrollInline && inline === "center") {
    x += (scrollAreaLeft + scrollAreaRight) / 2 - (scrollPortLeft + scrollPortRight) / 2;
  } else if (shouldScrollInline && inline === "end") {
    x += scrollAreaRight - scrollPortRight;
  } else if (shouldScrollInline && inline === "nearest") {
    const start = scrollAreaLeft - scrollPortLeft;
    const end = scrollAreaRight - scrollPortRight;
    x += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (isTestEnv()) {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;
    return;
  }

  scrollView.scrollTo({ left: x, top: y });
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional
 * `opts.containingElement` that will be centered in the viewport prior to scrolling the
 * targetElement into view. If scrolling is prevented on the body (e.g. targetElement is in a
 * popover), this will only scroll the scroll parents of the targetElement up to but not including
 * the body itself.
 */
export function scrollIntoViewport(
  targetElement: Element | null,
  opts: ScrollIntoViewportOpts = {},
): void {
  const { containingElement } = opts;
  if (targetElement && targetElement.isConnected) {
    const root = document.scrollingElement || document.documentElement;
    const isScrollPrevented = window.getComputedStyle(root).overflow === "hidden";
    if (!isScrollPrevented) {
      const { left: originalLeft, top: originalTop } = targetElement.getBoundingClientRect();

      // use scrollIntoView({block: 'nearest'}) instead of .focus to check if the element is fully in view or not since .focus()
      // won't cause a scroll if the element is already focused and doesn't behave consistently when an element is partially out of view horizontally vs vertically
      targetElement?.scrollIntoView?.({ block: "nearest" });
      const { left: newLeft, top: newTop } = targetElement.getBoundingClientRect();
      // Account for sub pixel differences from rounding
      if (Math.abs(originalLeft - newLeft) > 1 || Math.abs(originalTop - newTop) > 1) {
        containingElement?.scrollIntoView?.({ block: "center", inline: "center" });
        targetElement.scrollIntoView?.({ block: "nearest" });
      }
    } else {
      const { left: originalLeft, top: originalTop } = targetElement.getBoundingClientRect();

      // If scrolling is prevented, we don't want to scroll the body since it might move the overlay partially offscreen and the user can't scroll it back into view.
      let scrollParents = getScrollParents(targetElement, true);
      for (const scrollParent of scrollParents) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
      }
      const { left: newLeft, top: newTop } = targetElement.getBoundingClientRect();
      // Account for sub pixel differences from rounding
      if (Math.abs(originalLeft - newLeft) > 1 || Math.abs(originalTop - newTop) > 1) {
        scrollParents = containingElement ? getScrollParents(containingElement, true) : [];
        // scroll containing element into view first, then rescroll target element into view like the non chrome flow above
        for (const scrollParent of scrollParents) {
          scrollIntoView(scrollParent as HTMLElement, containingElement as HTMLElement, {
            block: "center",
            inline: "center",
          });
        }
        for (const scrollParent of getScrollParents(targetElement, true)) {
          scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
        }
      }
    }
  }
}
