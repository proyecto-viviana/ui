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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/overlays/useCloseOnScroll.ts

import { createTrackedEffect } from "solid-js";
import { getEventTarget, nodeContains, addGlobalScrollListener } from "../utils";
import { onCloseMap } from "./createOverlayTrigger";

export interface CloseOnScrollOptions {
  triggerRef: () => Element | null;
  isOpen?: () => boolean;
  onClose?: (() => void) | null;
}

/**
 * Closes an overlay when an ancestor of the trigger scrolls.
 * Uses `addGlobalScrollListener` so scroll events across Shadow DOM boundaries are observed.
 */
export function createCloseOnScroll(opts: CloseOnScrollOptions): void {
  const isOpen = () => (opts.isOpen ? opts.isOpen() : true);

  createTrackedEffect(() => {
    if (!isOpen() || opts.onClose === null) {
      return;
    }

    const trigger = opts.triggerRef();
    if (!trigger) {
      return;
    }

    const onScroll = (e: Event) => {
      // Ignore if scrolling a region outside the trigger's tree.
      const target = getEventTarget(e);
      // window is not a Node and doesn't have contains, but window contains everything
      if (!trigger || (target instanceof Node && !nodeContains(target, trigger))) {
        return;
      }

      // Ignore scroll events on any input or textarea as the cursor position can cause it to scroll
      // such as in a combobox. Clicking the dropdown button places focus on the input, and if the
      // text inside the input extends beyond the 'end', then it will scroll so the cursor is visible at the end.
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      const onCloseHandler = opts.onClose || onCloseMap.get(trigger);
      if (onCloseHandler) {
        onCloseHandler();
      }
    };

    let canceled = false;
    let cleanup = addGlobalScrollListener(trigger, onScroll, true);
    let rafId: number | null = null;

    if (!trigger.isConnected) {
      const rebind = () => {
        if (!canceled && trigger.isConnected) {
          cleanup();
          cleanup = addGlobalScrollListener(trigger, onScroll, true);
        }
      };
      if (typeof queueMicrotask === "function") {
        queueMicrotask(rebind);
      }
      if (typeof requestAnimationFrame === "function") {
        rafId = requestAnimationFrame(rebind);
      }
    }

    return () => {
      canceled = true;
      if (rafId !== null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafId);
      }
      cleanup();
    };
  });
}
