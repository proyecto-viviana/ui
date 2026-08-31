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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/overlays/ariaHideOutside.ts

/**
 * Hides all elements in the DOM outside the given targets from screen readers.
 * Ported from packages/react-aria/src/overlays/ariaHideOutside.ts.
 */

import { shadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";
import { getOwnerDocument, getOwnerWindow, nodeContains } from "../utils";
import { createShadowTreeWalker } from "../utils/ShadowTreeWalker";

const supportsInert = typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype;

function isAlwaysVisibleNode(node: HTMLElement | SVGElement): boolean {
  return node.dataset.liveAnnouncer === "true" || node.dataset.solidariaTopLayer !== undefined;
}

export interface AriaHideOutsideOptions {
  /** The root element to start hiding from. */
  root?: Element;
  /** Whether to use the `inert` attribute instead of `aria-hidden`. */
  shouldUseInert?: boolean;
}

// Keeps a ref count of all hidden elements. Added to when hiding an element, and
// subtracted from when showing it again. When it reaches zero, aria-hidden is removed.
const refCountMap = new WeakMap<Element, number>();

interface ObserverWrapper {
  visibleNodes: Set<Element>;
  hiddenNodes: Set<Element>;
  observe: () => void;
  disconnect: () => void;
}

const observerStack: ObserverWrapper[] = [];

/**
 * Hides all elements in the DOM outside the given targets from screen readers using aria-hidden,
 * and returns a function to revert these changes. In addition, changes to the DOM are watched
 * and new elements outside the targets are automatically hidden.
 * @param targets - The elements that should remain visible.
 * @param options - Options for hiding behavior.
 * @returns - A function to restore all hidden elements.
 */
export function ariaHideOutside(
  targets: Element[],
  options?: AriaHideOutsideOptions | Element,
): () => void {
  const windowObj = getOwnerWindow(targets?.[0]);
  const opts = options instanceof windowObj.Element ? { root: options } : options;
  const root = opts?.root ?? getOwnerDocument(targets?.[0]).body;
  const shouldUseInert = opts?.shouldUseInert && supportsInert;
  const visibleNodes = new Set<Element>(targets);
  const hiddenNodes = new Set<Element>();

  const shadowRootsToWatch = new Set<ShadowRoot>();
  if (shadowDOM()) {
    const boundary = root.getRootNode();
    for (const target of targets) {
      let current = target.getRootNode();
      while (current instanceof windowObj.ShadowRoot && current !== boundary) {
        shadowRootsToWatch.add(current);
        current = current.host.getRootNode();
      }
    }
  }

  const getHidden = (element: Element): boolean => {
    return shouldUseInert && element instanceof windowObj.HTMLElement
      ? element.inert
      : element.getAttribute("aria-hidden") === "true";
  };

  const setHidden = (element: Element, hidden: boolean): void => {
    if (shouldUseInert && element instanceof windowObj.HTMLElement) {
      element.inert = hidden;
    } else if (hidden) {
      element.setAttribute("aria-hidden", "true");
    } else {
      element.removeAttribute("aria-hidden");
      if (element instanceof windowObj.HTMLElement) {
        // We only ever call setHidden with hidden = false when the nodeCount is 1 aka
        // we are trying to make the element visible to screen readers again, so remove inert as well
        element.inert = false;
      }
    }
  };

  const hide = (node: Element): void => {
    let refCount = refCountMap.get(node) ?? 0;

    // If already aria-hidden, and the ref count is zero, then this element
    // was already hidden and there's nothing for us to do.
    if (getHidden(node) && refCount === 0) {
      return;
    }

    if (refCount === 0) {
      setHidden(node, true);
    }

    hiddenNodes.add(node);
    refCountMap.set(node, refCount + 1);
  };

  const walk = (walkRoot: Element): void => {
    // Keep live announcer and top layer elements (e.g. toasts) visible.
    for (const element of walkRoot.querySelectorAll(
      "[data-live-announcer], [data-solidaria-top-layer]",
    )) {
      visibleNodes.add(element);
    }

    const acceptNode = (node: Element): number => {
      // Skip this node and its children if it is one of the target nodes, or a live announcer.
      // Also skip children of already hidden nodes, as aria-hidden is recursive. An exception is
      // made for elements with role="row" since VoiceOver on iOS has issues hiding elements with role="row".
      // For that case we want to hide the cells inside as well (https://bugs.webkit.org/show_bug.cgi?id=222623).
      if (
        hiddenNodes.has(node) ||
        visibleNodes.has(node) ||
        (node.parentElement &&
          hiddenNodes.has(node.parentElement) &&
          node.parentElement.getAttribute("role") !== "row")
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      // Skip this node but continue to children if one of the targets is inside the node.
      for (const target of visibleNodes) {
        if (nodeContains(node, target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = createShadowTreeWalker(
      getOwnerDocument(walkRoot),
      walkRoot,
      NodeFilter.SHOW_ELEMENT,
      { acceptNode },
    );

    // TreeWalker does not include the root.
    const acceptRoot = acceptNode(walkRoot);
    if (acceptRoot === NodeFilter.FILTER_ACCEPT) {
      hide(walkRoot);
    }

    if (acceptRoot !== NodeFilter.FILTER_REJECT) {
      let node = walker.nextNode() as Element;
      while (node != null) {
        hide(node);
        node = walker.nextNode() as Element;
      }
    }
  };

  // If there is already a MutationObserver listening from a previous call,
  // disconnect it so the new one takes over.
  if (observerStack.length) {
    observerStack[observerStack.length - 1].disconnect();
  }

  walk(root);

  const processMutations = (changes: MutationRecord[]): void => {
    for (const change of changes) {
      if (change.type !== "childList") {
        continue;
      }

      // If the parent element of the added nodes is not within one of the targets,
      // and not already inside a hidden node, hide all of the new children.
      if (
        change.target.isConnected &&
        ![...visibleNodes, ...hiddenNodes].some((node) => nodeContains(node, change.target))
      ) {
        for (const node of change.addedNodes) {
          if (
            (node instanceof windowObj.HTMLElement || node instanceof windowObj.SVGElement) &&
            isAlwaysVisibleNode(node)
          ) {
            visibleNodes.add(node);
          } else if (node instanceof windowObj.Element) {
            walk(node);
          }
        }
      }

      if (shadowDOM()) {
        for (const shadowRoot of shadowRootsToWatch) {
          if (!shadowRoot.isConnected) {
            observer.disconnect();
            break;
          }
        }
      }
    }
  };

  const observer = new windowObj.MutationObserver(processMutations);

  observer.observe(root, { childList: true, subtree: true });

  const shadowObservers = new Set<MutationObserver>();
  if (shadowDOM()) {
    for (const shadowRoot of shadowRootsToWatch) {
      const shadowObserver = new windowObj.MutationObserver(processMutations);
      shadowObserver.observe(shadowRoot, { childList: true, subtree: true });
      shadowObservers.add(shadowObserver);
    }
  }

  const observerWrapper: ObserverWrapper = {
    visibleNodes,
    hiddenNodes,
    observe() {
      observer.observe(root, { childList: true, subtree: true });
    },
    disconnect() {
      observer.disconnect();
    },
  };

  observerStack.push(observerWrapper);

  return (): void => {
    observer.disconnect();
    if (shadowDOM()) {
      for (const shadowObserver of shadowObservers) {
        shadowObserver.disconnect();
      }
    }

    for (const node of hiddenNodes) {
      const count = refCountMap.get(node);
      if (count == null) {
        continue;
      }
      if (count === 1) {
        setHidden(node, false);
        refCountMap.delete(node);
      } else {
        refCountMap.set(node, count - 1);
      }
    }

    // Remove this observer from the stack, and start the previous one.
    if (observerWrapper === observerStack[observerStack.length - 1]) {
      observerStack.pop();
      if (observerStack.length) {
        observerStack[observerStack.length - 1].observe();
      }
    } else {
      observerStack.splice(observerStack.indexOf(observerWrapper), 1);
    }
  };
}

/**
 * Keeps an element visible when aria-hiding is active.
 * Used for elements like live regions that should remain accessible.
 */
export function keepVisible(element: Element): (() => void) | undefined {
  const observer = observerStack[observerStack.length - 1];
  if (observer && !observer.visibleNodes.has(element)) {
    observer.visibleNodes.add(element);
    return () => {
      observer.visibleNodes.delete(element);
    };
  }
}
