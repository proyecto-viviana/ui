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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/virtualizer/utils.ts

/**
 * RTL scroll-offset helpers for the scroll view. Based on:
 * - packages/react-aria/src/virtualizer/utils.ts
 */

import type { Direction } from "../i18n/locale";

export type RTLOffsetType = "negative" | "positive-descending" | "positive-ascending";

let cachedRTLResult: RTLOffsetType | null = null;

// Original licensing for the following methods can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/bvaughn/react-window/blob/master/src/createGridComponent.js

export function getRTLOffsetType(recalculate = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    const outerDiv = document.createElement("div");
    const outerStyle = outerDiv.style;
    outerStyle.width = "50px";
    outerStyle.height = "50px";
    outerStyle.overflow = "scroll";
    outerStyle.direction = "rtl";

    const innerDiv = document.createElement("div");
    const innerStyle = innerDiv.style;
    innerStyle.width = "100px";
    innerStyle.height = "100px";

    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);

    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = "positive-descending";
    } else {
      outerDiv.scrollLeft = 1;
      if (outerDiv.scrollLeft === 0) {
        cachedRTLResult = "negative";
      } else {
        cachedRTLResult = "positive-ascending";
      }
    }

    document.body.removeChild(outerDiv);
    return cachedRTLResult;
  }

  return cachedRTLResult;
}

export function getScrollLeft(node: Element, direction: Direction): number {
  let { scrollLeft } = node;

  if (direction === "rtl") {
    const { scrollWidth, clientWidth } = node;
    switch (getRTLOffsetType()) {
      case "negative":
        scrollLeft = -scrollLeft;
        break;
      case "positive-descending":
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
    }
  }

  return scrollLeft;
}

export function setScrollLeft(node: Element, direction: Direction, scrollLeft: number): void {
  if (direction === "rtl") {
    switch (getRTLOffsetType()) {
      case "negative":
        scrollLeft = -scrollLeft;
        break;
      case "positive-ascending":
        break;
      default: {
        const { clientWidth, scrollWidth } = node;
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
      }
    }
  }

  (node as HTMLElement).scrollLeft = scrollLeft;
}
