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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/textSelection.ts

/**
 * Text selection management utilities.
 * Ported from packages/react-aria/src/interactions/textSelection.ts.
 *
 * On iOS WebKit, long press triggers text selection. The only way to prevent
 * this is to set user-select: none on the entire page. On other platforms,
 * we can just set it on the target element.
 */

import { getOwnerDocument } from "./dom";
import { isIOS, isWebKit } from "./platform";
import { runAfterTransition } from "./runAfterTransition";

type State = "default" | "disabled" | "restoring";

// State matters for iOS page-level selection. Other platforms store each target.
let state: State = "default";
let savedUserSelect = "";
const modifiedElementMap = new WeakMap<Element, string>();

function selectionProperty(target: HTMLElement | SVGElement): "userSelect" | "webkitUserSelect" {
  return "userSelect" in target.style ? "userSelect" : "webkitUserSelect";
}

/**
 * Disables text selection on the page or element during press.
 * On iOS WebKit, applies to the entire document. On other platforms, just the target.
 */
export function disableTextSelection(target?: Element): void {
  if (isIOS() && isWebKit()) {
    if (state === "default") {
      const documentElement = getOwnerDocument(target).documentElement;
      savedUserSelect = documentElement.style.webkitUserSelect;
      documentElement.style.webkitUserSelect = "none";
    }

    state = "disabled";
  } else if (target instanceof HTMLElement || target instanceof SVGElement) {
    const property = selectionProperty(target);
    modifiedElementMap.set(target, target.style[property]);
    target.style[property] = "none";
  }
}

/**
 * Restores text selection after press ends.
 * On iOS WebKit, waits 300ms, then until in-flight CSS transitions end.
 * A value written over `none` during the press is left in place.
 */
export function restoreTextSelection(target?: Element): void {
  if (isIOS() && isWebKit()) {
    // Already default, or a restore is already queued.
    if (state !== "disabled") {
      return;
    }

    state = "restoring";

    setTimeout(() => {
      runAfterTransition(() => {
        if (state === "restoring") {
          const documentElement = getOwnerDocument(target).documentElement;
          if (documentElement.style.webkitUserSelect === "none") {
            documentElement.style.webkitUserSelect = savedUserSelect || "";
          }

          savedUserSelect = "";
          state = "default";
        }
      });
    }, 300);
  } else if (target instanceof HTMLElement || target instanceof SVGElement) {
    if (modifiedElementMap.has(target)) {
      const savedValue = modifiedElementMap.get(target) ?? "";
      const property = selectionProperty(target);

      if (target.style[property] === "none") {
        target.style[property] = savedValue;
      }

      if (target.getAttribute("style") === "") {
        target.removeAttribute("style");
      }
      modifiedElementMap.delete(target);
    }
  }
}
