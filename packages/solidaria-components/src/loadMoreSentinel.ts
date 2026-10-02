/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
