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
 * On iOS, long press triggers text selection. The only way to prevent this
 * is to set user-select: none on the entire page. On other platforms,
 * we can just set it on the target element.
 */

import { isIOS } from "./platform";
import { getOwnerDocument } from "./dom";

type State = "default" | "disabled" | "restoring";

// Global state to manage text selection across multiple press interactions
let state: State = "default";
let savedUserSelect = "";
let modifiedElementMap = new WeakMap<HTMLElement, string>();

/**
 * Disables text selection on the page or element during press.
 * On iOS, applies to the entire document. On other platforms, just the target.
 */
export function disableTextSelection(target?: HTMLElement): void {
  if (isIOS()) {
    // iOS requires disabling selection on the entire page
    if (state === "default") {
      const documentElement = getOwnerDocument(target).documentElement;
      savedUserSelect = documentElement.style.webkitUserSelect;
      documentElement.style.webkitUserSelect = "none";
    }
    state = "disabled";
  } else if (target) {
    // On other platforms, just disable on the target
    const element = target as HTMLElement;
    if (!modifiedElementMap.has(element)) {
      modifiedElementMap.set(element, element.style.userSelect);
      element.style.userSelect = "none";
    }
  }
}

/**
 * Restores text selection after press ends.
 * On iOS, waits 300ms to avoid selection appearing during tap.
 */
export function restoreTextSelection(target?: HTMLElement): void {
  if (isIOS()) {
    // Don't restore if another press is active
    if (state !== "disabled") {
      return;
    }

    state = "restoring";

    // Wait for iOS to finish any pending selection actions
    // 300ms is the iOS long-press delay
    setTimeout(() => {
      // Use runAfterTransition to avoid CSS recomputation during animation
      runAfterTransition(() => {
        // Only restore if still in 'restoring' state (no new press started)
        if (state === "restoring") {
          const documentElement = getOwnerDocument(target).documentElement;
          if (savedUserSelect) {
            documentElement.style.webkitUserSelect = savedUserSelect;
          } else {
            documentElement.style.removeProperty("-webkit-user-select");
          }
          savedUserSelect = "";
          state = "default";
        }
      });
    }, 300);
  } else if (target) {
    // On other platforms, restore immediately
    const element = target as HTMLElement;
    const savedValue = modifiedElementMap.get(element);
    if (savedValue !== undefined) {
      if (savedValue) {
        element.style.userSelect = savedValue;
      } else {
        element.style.removeProperty("user-select");
      }
      modifiedElementMap.delete(element);
    }
  }
}

// Tracks pending transitions for runAfterTransition
const pendingTransitions = new Set<() => void>();
let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Runs a callback after CSS transitions complete.
 * Batches multiple callbacks to avoid unnecessary layout thrashing.
 */
function runAfterTransition(callback: () => void): void {
  // If we haven't started tracking transitions, run immediately
  pendingTransitions.add(callback);

  // Debounce - wait for any transitions to settle
  if (transitionTimeout != null) {
    clearTimeout(transitionTimeout);
  }

  transitionTimeout = setTimeout(() => {
    // Run all pending callbacks
    for (const cb of pendingTransitions) {
      cb();
    }
    pendingTransitions.clear();
    transitionTimeout = null;
  }, 0);
}
