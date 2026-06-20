/**
 * FocusScope component for managing focus containment, restoration, and auto-focus.
 * Based on @react-aria/focus FocusScope.
 */

import {
  createContext,
  useContext,
  createEffect,
  onCleanup,
  type JSX,
  type Accessor,
  type ParentComponent,
  createSignal,
  onMount,
} from "solid-js";
import { isServer } from "solid-js/web";
import { getOwnerDocument, isFocusable, isTabbable } from "../utils";
import { focusSafely } from "../utils/focus";

export interface FocusScopeProps {
  /** The contents of the focus scope. */
  children: JSX.Element;
  /**
   * Whether to contain focus inside the scope, so users cannot
   * move focus outside, for example in a modal dialog.
   */
  contain?: boolean;
  /**
   * Whether to restore focus back to the element that was focused
   * when the focus scope mounted, after the focus scope unmounts.
   */
  restoreFocus?: boolean;
  /** Whether to auto focus the first focusable element in the focus scope on mount. */
  autoFocus?: boolean;
}

export interface FocusManagerOptions {
  /** The element to start searching from. The currently focused element by default. */
  from?: Element;
  /** Whether to only include tabbable elements, or all focusable elements. */
  tabbable?: boolean;
  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;
  /** A callback that determines whether the given element is focused. */
  accept?: (node: Element) => boolean;
}

export interface FocusManager {
  /** Moves focus to the next focusable or tabbable element in the focus scope. */
  focusNext(opts?: FocusManagerOptions): HTMLElement | null;
  /** Moves focus to the previous focusable or tabbable element in the focus scope. */
  focusPrevious(opts?: FocusManagerOptions): HTMLElement | null;
  /** Moves focus to the first focusable or tabbable element in the focus scope. */
  focusFirst(opts?: FocusManagerOptions): HTMLElement | null;
  /** Moves focus to the last focusable or tabbable element in the focus scope. */
  focusLast(opts?: FocusManagerOptions): HTMLElement | null;
}

interface FocusScopeContextValue {
  focusManager: FocusManager;
  scopeRef: Accessor<Element[]>;
}

const FocusScopeContext = createContext<FocusScopeContextValue | null>(null);

/**
 * Returns a FocusManager interface for the parent FocusScope.
 * A FocusManager can be used to programmatically move focus within
 * a FocusScope, e.g. in response to user events like keyboard navigation.
 */
export function useFocusManager(): FocusManager | undefined {
  return useContext(FocusScopeContext)?.focusManager;
}

/**
 * Gets all focusable elements within a scope.
 */
function getFocusableElements(scope: Element[], tabbable = false): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const filter = tabbable ? isTabbable : isFocusable;

  for (const scopeElement of scope) {
    // Check the element itself
    if (filter(scopeElement)) {
      elements.push(scopeElement as HTMLElement);
    }

    // Check all descendants
    const descendants = scopeElement.querySelectorAll("*");
    for (let i = 0; i < descendants.length; i++) {
      const el = descendants[i];
      if (filter(el)) {
        elements.push(el as HTMLElement);
      }
    }
  }

  return elements;
}

/**
 * Checks if an element is within a scope.
 */
function isElementInScope(element: Element | null, scope: Element[]): boolean {
  if (!element) return false;
  return scope.some((node) => node.contains(element));
}

/**
 * Gets the active element, accounting for shadow DOM.
 */
function getActiveElement(doc: Document): Element | null {
  let activeElement = doc.activeElement;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
}

/**
 * A FocusScope manages focus for its descendants. It supports containing focus inside
 * the scope, restoring focus to the previously focused element on unmount, and auto
 * focusing children on mount. It also acts as a container for a programmatic focus
 * management interface that can be used to move focus forward and back in response
 * to user events.
 */
export const FocusScope: ParentComponent<FocusScopeProps> = (props) => {
  if (isServer) {
    return <>{props.children}</>;
  }

  let startRef: HTMLSpanElement | undefined;
  let endRef: HTMLSpanElement | undefined;
  const [scopeElements, setScopeElements] = createSignal<Element[]>([]);

  // Store the element that was focused when the scope mounted
  let nodeToRestore: Element | null = null;

  const getRestorableElement = (element: Element | null, doc: Document): Element | null => {
    if (!element || element === doc.body || element === doc.documentElement) {
      return null;
    }
    return element;
  };

  // Create focus manager
  const focusManager: FocusManager = {
    focusNext(opts = {}) {
      const scope = scopeElements();
      if (scope.length === 0) return null;

      const { from, tabbable = true, wrap = false, accept } = opts;
      const elements = getFocusableElements(scope, tabbable).filter((el) => !accept || accept(el));
      const doc = getOwnerDocument(scope[0]);
      const current = from || getActiveElement(doc);

      if (!current || elements.length === 0) return null;

      const currentIndex = elements.indexOf(current as HTMLElement);
      let nextIndex = currentIndex + 1;

      if (nextIndex >= elements.length) {
        if (wrap) {
          nextIndex = 0;
        } else {
          return null;
        }
      }

      const nextElement = elements[nextIndex];
      if (nextElement) {
        focusSafely(nextElement);
        return nextElement;
      }

      return null;
    },

    focusPrevious(opts = {}) {
      const scope = scopeElements();
      if (scope.length === 0) return null;

      const { from, tabbable = true, wrap = false, accept } = opts;
      const elements = getFocusableElements(scope, tabbable).filter((el) => !accept || accept(el));
      const doc = getOwnerDocument(scope[0]);
      const current = from || getActiveElement(doc);

      if (!current || elements.length === 0) return null;

      const currentIndex = elements.indexOf(current as HTMLElement);
      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        if (wrap) {
          prevIndex = elements.length - 1;
        } else {
          return null;
        }
      }

      const prevElement = elements[prevIndex];
      if (prevElement) {
        focusSafely(prevElement);
        return prevElement;
      }

      return null;
    },

    focusFirst(opts = {}) {
      const scope = scopeElements();
      if (scope.length === 0) return null;

      const { tabbable = true, accept } = opts;
      const elements = getFocusableElements(scope, tabbable).filter((el) => !accept || accept(el));

      if (elements.length > 0) {
        focusSafely(elements[0]);
        return elements[0];
      }

      return null;
    },

    focusLast(opts = {}) {
      const scope = scopeElements();
      if (scope.length === 0) return null;

      const { tabbable = true, accept } = opts;
      const elements = getFocusableElements(scope, tabbable).filter((el) => !accept || accept(el));

      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        focusSafely(lastElement);
        return lastElement;
      }

      return null;
    },
  };

  // Collect scope elements after render
  onMount(() => {
    if (!startRef || !endRef) return;

    const nodes: Element[] = [];
    let node = startRef.nextSibling;
    while (node && node !== endRef) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        nodes.push(node as Element);
      }
      node = node.nextSibling;
    }
    setScopeElements(nodes);
  });

  // Save the currently focused element for restoration (must happen before autoFocus/contain effects run).
  onMount(() => {
    if (!props.restoreFocus) return;

    // Focus can be in the main document, or inside this iframe's document.
    const scopeDoc = startRef ? getOwnerDocument(startRef) : document;
    const scopeActive = getActiveElement(scopeDoc);
    const topActive = getActiveElement(document);

    // If the scope is in an iframe and that iframe is currently focused, prefer the iframe document's active element.
    if (
      scopeDoc !== document &&
      document.activeElement instanceof HTMLIFrameElement &&
      document.activeElement.contentDocument === scopeDoc &&
      scopeActive &&
      scopeActive !== scopeDoc.body
    ) {
      nodeToRestore = getRestorableElement(scopeActive, scopeDoc);
      return;
    }

    nodeToRestore = getRestorableElement(topActive, document);
  });

  // Auto-focus first element
  createEffect(() => {
    if (!props.autoFocus) return;

    const scope = scopeElements();
    if (scope.length === 0) return;

    const doc = getOwnerDocument(scope[0]);
    const activeElement = getActiveElement(doc);

    // Only auto-focus if focus is not already inside the scope
    if (!isElementInScope(activeElement, scope)) {
      focusManager.focusFirst();
    }
  });

  // Focus containment
  createEffect(() => {
    if (!props.contain) return;

    const scope = scopeElements();
    if (scope.length === 0) return;

    const doc = getOwnerDocument(scope[0]);
    let focusedNode: Element | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      const scope = scopeElements();
      const activeElement = getActiveElement(doc);
      if (!isElementInScope(activeElement, scope)) {
        return;
      }

      const elements = getFocusableElements(scope, true);
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        focusSafely(lastElement);
      } else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        focusSafely(firstElement);
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const scope = scopeElements();
      const target = e.target as Element;

      if (isElementInScope(target, scope)) {
        focusedNode = target;
      } else if (focusedNode) {
        // Focus escaped the scope, bring it back
        focusSafely(focusedNode as HTMLElement);
      } else {
        // No previous focus, focus first element
        focusManager.focusFirst();
      }
    };

    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("focusin", onFocusIn, true);

    onCleanup(() => {
      doc.removeEventListener("keydown", onKeyDown, true);
      doc.removeEventListener("focusin", onFocusIn, true);
    });
  });

  // Restore focus on unmount
  onCleanup(() => {
    if (props.restoreFocus && nodeToRestore && (nodeToRestore as HTMLElement).focus) {
      const doc = getOwnerDocument(nodeToRestore as Element);
      const win = doc.defaultView ?? window;

      // Use requestAnimationFrame to ensure the element is still in the DOM
      win.requestAnimationFrame(() => {
        if (nodeToRestore && doc.body.contains(nodeToRestore as Node)) {
          (nodeToRestore as HTMLElement).focus();
        }
      });
    }
  });

  return (
    <FocusScopeContext.Provider value={{ focusManager, scopeRef: scopeElements }}>
      <span data-focus-scope-start hidden ref={startRef} />
      {props.children}
      <span data-focus-scope-end hidden ref={endRef} />
    </FocusScopeContext.Provider>
  );
};

export default FocusScope;
