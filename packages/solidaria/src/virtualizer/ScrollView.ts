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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/virtualizer/ScrollView.tsx

/**
 * Scroll-view observer for a virtualized collection. Attaches to the collection
 * element (`scrollRef`) rather than rendering a wrapper. Based on:
 * - packages/react-aria/src/virtualizer/ScrollView.tsx (`useScrollView`)
 */

import {
  createEffect,
  createRenderEffect,
  createSignal,
  onCleanup,
  type Accessor,
  type JSX,
} from "solid-js";
import {
  addEvent,
  getEventTarget,
  getOwnerDocument,
  getPropagationTargets,
  nodeContains,
} from "../utils/dom";
import { useLocale } from "../i18n/locale";
import { getScrollLeft } from "./utils";

export interface ScrollViewSize {
  width: number;
  height: number;
}

export interface CreateScrollViewOptions {
  /** The collection element that scrolls. RAC `useScrollView` `ref`. */
  getScrollElement: Accessor<HTMLElement | null | undefined>;
  /**
   * Whether the collection may scroll with the page. RAC CollectionRoot
   * hardcodes this `true` (`Virtualizer.tsx:109,140`).
   */
  allowsWindowScrolling?: Accessor<boolean>;
  /** Content size used to clamp rubber-band scroll. RAC `contentSize`. */
  contentSize?: Accessor<ScrollViewSize>;
  onScrollPositionChange?: (position: { x: number; y: number }) => void;
  onViewportOffsetChange?: (offset: number) => void;
  onSizeChange?: (size: ScrollViewSize) => void;
  onWindowViewportChange?: (height: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
}

export interface ScrollViewAria {
  isScrolling: Accessor<boolean>;
  contentProps: Accessor<JSX.HTMLAttributes<HTMLDivElement>>;
}

/**
 * Observes scroll and size on a collection element and returns content-wrapper
 * props. RAC `useScrollView` (`ScrollView.tsx:70-404`): CollectionRoot applies
 * only `contentProps` (`Virtualizer.tsx:133-146`); overflow lives on the
 * collection via the consumer (S2 `overflow: auto`).
 */
export function createScrollView(options: CreateScrollViewOptions): ScrollViewAria {
  const [isScrolling, setIsScrolling] = createSignal(false);
  const locale = useLocale();
  const allowsWindowScrolling = () => options.allowsWindowScrolling?.() ?? true;

  let scrollFrame: number | undefined;
  let scrollEndTimeout: ReturnType<typeof setTimeout> | undefined;

  const updateSize = (element: HTMLElement) => {
    const nextHeight = element.clientHeight;
    const nextWidth = element.clientWidth;
    options.onSizeChange?.({ width: nextWidth, height: nextHeight });
  };

  const updateWindowViewport = () => {
    if (typeof window === "undefined") return;
    options.onWindowViewportChange?.(window.innerHeight);
  };

  const updateViewportOffset = (element: HTMLElement) => {
    if (!allowsWindowScrolling()) return;
    const rect = element.getBoundingClientRect();
    const next = rect.y < 0 ? -rect.y : 0;
    options.onViewportOffsetChange?.(next);
  };

  createRenderEffect(() => {
    const element = options.getScrollElement();
    if (!element) return;
    // RAC `useScrollView` `ScrollView.tsx:305-315` initializes viewport size
    // in a layout effect so the first visible-rect emit has a real size.
    updateSize(element);
    updateWindowViewport();
    updateViewportOffset(element);
  });

  createEffect(() => {
    const element = options.getScrollElement();
    if (!element) return;

    updateSize(element);
    updateWindowViewport();
    updateViewportOffset(element);

    const handleResize = () => {
      const current = options.getScrollElement();
      if (!current) return;
      updateSize(current);
      updateWindowViewport();
      updateViewportOffset(current);
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => handleResize()) : null;
    resizeObserver?.observe(element);

    // RAC `useScrollView` `ScrollView.tsx:221-229`: capturing scroll on
    // getPropagationTargets so ancestor/page scroll updates viewportOffset.
    const handleDocumentScroll = (e: Event) => {
      const current = options.getScrollElement();
      if (!current) return;
      const target = getEventTarget(e) as Node | null;
      if (target != null && !nodeContains(target, current) && target !== current) {
        return;
      }
      const isContainer = target === current;
      if (!isContainer && !allowsWindowScrolling()) return;

      if (!isScrolling()) {
        setIsScrolling(true);
        options.onScrollStart?.();
      }
      if (scrollEndTimeout != null) clearTimeout(scrollEndTimeout);
      // RAC `ScrollView.tsx:188-205`: 300ms after the last scroll.
      scrollEndTimeout = setTimeout(() => {
        scrollEndTimeout = undefined;
        setIsScrolling(false);
        options.onScrollEnd?.();
      }, 300);

      if (scrollFrame != null) cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = undefined;
        const live = options.getScrollElement();
        if (!live) return;
        if (isContainer) {
          const direction = locale().direction;
          const nextY = Math.max(0, live.scrollTop);
          const nextX = Math.max(0, getScrollLeft(live, direction));
          options.onScrollPositionChange?.({ x: nextX, y: nextY });
        } else {
          updateViewportOffset(live);
        }
        updateSize(live);
      });
    };

    const ownerDocument = getOwnerDocument(element);
    const cleanupScroll = addEvent(
      getPropagationTargets(element, ownerDocument),
      "scroll",
      handleDocumentScroll,
      true,
    );

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      cleanupScroll();
      if (scrollFrame != null) cancelAnimationFrame(scrollFrame);
      if (scrollEndTimeout != null) clearTimeout(scrollEndTimeout);
    });
  });

  const contentProps = (): JSX.HTMLAttributes<HTMLDivElement> => ({
    // RAC `useScrollView` `contentProps` `ScrollView.tsx:400-403`.
    role: "presentation",
    style: {
      position: "relative",
      "pointer-events": isScrolling() ? "none" : undefined,
    },
  });

  return {
    isScrolling,
    contentProps,
  };
}
