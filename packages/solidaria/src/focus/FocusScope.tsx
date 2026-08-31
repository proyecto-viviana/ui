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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/focus/FocusScope.tsx

/**
 * FocusScope component for managing focus containment, restoration, and auto-focus.
 * Ported from packages/react-aria/src/focus/FocusScope.tsx.
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
import {
  getOwnerDocument,
  isFocusable,
  isTabbable,
  getFocusableTreeWalker,
  getActiveElement,
} from "../utils";
import { focusSafely, runAfterPaint } from "../utils/focus";

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

/**
 * Walks a TreeWalker to its final (deepest-last) node, mirroring the `last`
 * helper in @react-aria/focus.
 */
function lastFocusable(walker: TreeWalker): HTMLElement | null {
  let next: HTMLElement | undefined;
  let last: Node | null;
  do {
    last = walker.lastChild();
    if (last) {
      next = last as HTMLElement;
    }
  } while (last);
  return next ?? null;
}

/**
 * Creates a FocusManager rooted at the given ref element, independent of any
 * FocusScope. Mirrors @react-aria/focus's `createFocusManager`: it walks the
 * focusable tree with `getFocusableTreeWalker` so segment/spinbutton navigation
 * inside a date field group behaves exactly like upstream.
 */
export function createFocusManager(
  ref: () => HTMLElement | null | undefined,
  defaultOptions: FocusManagerOptions = {},
): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;
      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getActiveElement(getOwnerDocument(root));
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (node && root.contains(node)) {
        walker.currentNode = node;
      }
      let nextNode = walker.nextNode() as HTMLElement | null;
      if (!nextNode && wrap) {
        walker.currentNode = root;
        nextNode = walker.nextNode() as HTMLElement | null;
      }
      if (nextNode) {
        focusSafely(nextNode);
      }
      return nextNode;
    },

    focusPrevious(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;
      const {
        from,
        tabbable = defaultOptions.tabbable,
        wrap = defaultOptions.wrap,
        accept = defaultOptions.accept,
      } = opts;
      const node = from || getActiveElement(getOwnerDocument(root));
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      if (node && root.contains(node)) {
        walker.currentNode = node;
      } else {
        const next = lastFocusable(walker);
        if (next) {
          focusSafely(next);
        }
        return next;
      }
      let previousNode = walker.previousNode() as HTMLElement | null;
      if (!previousNode && wrap) {
        walker.currentNode = root;
        const lastNode = lastFocusable(walker);
        if (!lastNode) {
          return null;
        }
        previousNode = lastNode;
      }
      if (previousNode) {
        focusSafely(previousNode);
      }
      return previousNode;
    },

    focusFirst(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;
      const { tabbable = defaultOptions.tabbable, accept = defaultOptions.accept } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      const nextNode = walker.nextNode() as HTMLElement | null;
      if (nextNode) {
        focusSafely(nextNode);
      }
      return nextNode;
    },

    focusLast(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;
      const { tabbable = defaultOptions.tabbable, accept = defaultOptions.accept } = opts;
      const walker = getFocusableTreeWalker(root, { tabbable, accept });
      const next = lastFocusable(walker);
      if (next) {
        focusSafely(next);
      }
      return next;
    },
  };
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
 * Auto-focus target for a scope. Mirrors @react-aria/focus `getFirstInScope`:
 * prefer a tabbable node, then fall back to the first focusable node (e.g. a
 * `tabIndex={-1}` overlay root) when nothing is tabbable yet.
 */
function firstInScope(scope: Element[]): HTMLElement | undefined {
  return getFocusableElements(scope, true)[0] ?? getFocusableElements(scope, false)[0];
}

function focusFirstInScope(scope: Element[]): void {
  const target = firstInScope(scope);
  if (target) {
    focusSafely(target);
  }
}

/**
 * Collects the element siblings between FocusScope sentinels. React's
 * FocusScope re-runs this in `useLayoutEffect` on every render; Solid only
 * re-runs the component body once, so callers must re-collect when the DOM
 * between the sentinels changes (portaled overlay children, delayed collections).
 */
function collectScopeElements(
  start: HTMLElement | null | undefined,
  end: HTMLElement | null | undefined,
): Element[] {
  if (!start || !end) {
    return [];
  }

  const nodes: Element[] = [];
  let node: ChildNode | null = start.nextSibling;
  while (node && node !== end) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      nodes.push(node as Element);
    }
    node = node.nextSibling;
  }
  return nodes;
}

function sameElements(a: Element[], b: Element[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * A scope is identified by its (stable) scope-elements accessor; `null` is the
 * tree root. Mirrors @react-aria/focus's `ScopeRef`.
 */
type ScopeRef = Accessor<Element[]> | null;

interface FocusScopeTreeNode {
  scopeRef: ScopeRef;
  parent: FocusScopeTreeNode | null;
  children: Set<FocusScopeTreeNode>;
}

/**
 * A registry of the live FocusScopes and their parent/child relationships,
 * mirroring @react-aria/focus's `focusScopeTree`. The DOM tree alone can't
 * express scope nesting because a child scope (e.g. a menu opened from inside a
 * modal popover) is rendered in a portal, outside its parent scope's subtree.
 * The tree records that nesting so containment can recognize a portaled
 * descendant scope as "inside".
 */
class FocusScopeTree {
  root: FocusScopeTreeNode;
  private fastMap = new Map<ScopeRef, FocusScopeTreeNode>();

  constructor() {
    this.root = { scopeRef: null, parent: null, children: new Set() };
    this.fastMap.set(null, this.root);
  }

  getTreeNode(scopeRef: ScopeRef): FocusScopeTreeNode | undefined {
    return this.fastMap.get(scopeRef);
  }

  addTreeNode(scopeRef: ScopeRef, parent: ScopeRef): void {
    const parentNode = this.fastMap.get(parent) ?? this.root;
    const node: FocusScopeTreeNode = { scopeRef, parent: parentNode, children: new Set() };
    parentNode.children.add(node);
    this.fastMap.set(scopeRef, node);
  }

  removeTreeNode(scopeRef: ScopeRef): void {
    // never remove the root
    if (scopeRef === null) return;
    const node = this.fastMap.get(scopeRef);
    if (!node) return;
    const parentNode = node.parent;
    if (parentNode) {
      parentNode.children.delete(node);
      // Re-parent any children so a mid-tree unmount doesn't orphan descendants.
      for (const child of node.children) {
        child.parent = parentNode;
        parentNode.children.add(child);
      }
    }
    this.fastMap.delete(scopeRef);
  }

  // Pre-order depth-first; skips the null-scoped root, like upstream.
  *traverse(node: FocusScopeTreeNode = this.root): Generator<FocusScopeTreeNode> {
    if (node.scopeRef != null) {
      yield node;
    }
    for (const child of node.children) {
      yield* this.traverse(child);
    }
  }
}

const focusScopeTree = new FocusScopeTree();

/**
 * Whether the element is inside `scope` or any of its descendant scopes.
 *
 * `isElementInScope`'s `node.contains` already covers descendant scopes that
 * are DOM children, but not those rendered in a portal. Walking the scope
 * subtree closes that gap so focus moving into a portaled child scope still
 * counts as "inside". Mirrors @react-aria/focus's `isElementInChildScope`.
 */
function isElementInChildScope(element: Element, scope: ScopeRef = null): boolean {
  // Always allow focus to move into a top-layer element (e.g. toasts).
  if (element instanceof Element && element.closest("[data-react-aria-top-layer]")) {
    return true;
  }

  for (const node of focusScopeTree.traverse(focusScopeTree.getTreeNode(scope))) {
    if (node.scopeRef && isElementInScope(element, node.scopeRef())) {
      return true;
    }
  }

  return false;
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

  const [startEl, setStartEl] = createSignal<HTMLSpanElement | null>(null);
  const [endEl, setEndEl] = createSignal<HTMLSpanElement | null>(null);
  const [scopeElements, setScopeElements] = createSignal<Element[]>([]);

  const syncScopeElements = () => {
    const next = collectScopeElements(startEl(), endEl());
    if (!sameElements(next, scopeElements())) {
      setScopeElements(next);
    }
  };

  // The nearest enclosing FocusScope (through context, which Solid propagates
  // across portals) is this scope's parent in the focus-scope tree. Read it
  // before we shadow the context with our own provider below.
  const parentScopeRef = useContext(FocusScopeContext)?.scopeRef ?? null;

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

  // Re-collect when sentinels mount and when siblings between them change.
  // A one-shot onMount miss (empty first paint, delayed collection) would leave
  // auto-focus and contain permanently disabled even after the overlay exists.
  createEffect(() => {
    const start = startEl();
    const end = endEl();
    if (!start || !end) {
      return;
    }

    syncScopeElements();
    const parent = start.parentNode;
    if (!parent) {
      return;
    }

    const observer = new MutationObserver(() => {
      syncScopeElements();
    });
    observer.observe(parent, { childList: true });
    onCleanup(() => observer.disconnect());
  });

  // Register this scope in the focus-scope tree so containment can recognize a
  // portaled descendant scope as "inside" it. The scope-elements accessor is a
  // stable identity, so it works as the tree key even before it's populated.
  onMount(() => {
    focusScopeTree.addTreeNode(scopeElements, parentScopeRef);
  });
  onCleanup(() => {
    focusScopeTree.removeTreeNode(scopeElements);
  });

  // Save the currently focused element for restoration (must happen before autoFocus/contain effects run).
  onMount(() => {
    if (!props.restoreFocus) return;

    // Focus can be in the main document, or inside this iframe's document.
    const scopeDoc = startEl() ? getOwnerDocument(startEl() as Element) : document;
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

  // Match @react-aria/focus `useAutoFocus`: one-shot after paint so overlay
  // auto-focus lands after `preventFocus`'s rAF capture window (and after the
  // overlay has been laid out enough to be focusable). Do not start until a
  // real target exists — otherwise a first empty/unfocusable paint would skip
  // forever after children appear.
  let autoFocusStarted = false;
  let cancelAutoFocus: (() => void) | undefined;
  createEffect(() => {
    if (!props.autoFocus || autoFocusStarted) return;

    const scope = scopeElements();
    if (scope.length === 0 || !firstInScope(scope)) return;

    autoFocusStarted = true;
    const doc = getOwnerDocument(scope[0]);
    cancelAutoFocus = runAfterPaint(() => {
      cancelAutoFocus = undefined;
      const currentScope = scopeElements();
      if (currentScope.length === 0) return;
      const activeElement = getActiveElement(doc);
      if (!isElementInScope(activeElement, currentScope)) {
        focusFirstInScope(currentScope);
      }
    }, doc);
  });
  onCleanup(() => {
    cancelAutoFocus?.();
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
      } else if (isElementInChildScope(target, scopeElements)) {
        // Focus moved into a descendant scope — e.g. a menu opened from inside
        // this modal popover, rendered in a portal outside this scope's DOM
        // subtree. Track it but don't pull focus back, which would tear the
        // nested overlay down.
        focusedNode = target;
      } else if (target === doc.body || target === doc.documentElement) {
        // `element.blur()` sends focus to body and may fire focusin there.
        // RAC restores that path from focusout + rAF (`onBlur`), not from
        // this focusin. Pulling back synchronously would beat a following
        // pointermove (certified hover after the focus-visible reset) and
        // keep a stale keyboard ring.
        return;
      } else if (focusedNode) {
        // Focus escaped the scope, bring it back
        focusSafely(focusedNode as HTMLElement);
      } else {
        // No previous focus, focus first element
        focusManager.focusFirst();
      }
    };

    let restoreRaf: number | null = null;

    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as Element;
      if (!isElementInScope(target, scopeElements())) return;

      // Focus left an element inside the scope. Wait a frame (like upstream's
      // onBlur) so a synchronous refocus elsewhere can settle; if focus ended
      // up outside every scope (e.g. blur() to body), pull it back.
      const win = doc.defaultView ?? window;
      if (restoreRaf != null) win.cancelAnimationFrame(restoreRaf);
      restoreRaf = win.requestAnimationFrame(() => {
        restoreRaf = null;
        const scope = scopeElements();
        const activeElement = getActiveElement(doc);
        if (
          activeElement &&
          (isElementInScope(activeElement, scope) ||
            isElementInChildScope(activeElement, scopeElements))
        ) {
          return;
        }

        if (doc.body.contains(target)) {
          focusedNode = target;
          focusSafely(target as HTMLElement);
        } else {
          focusManager.focusFirst();
        }
      });
    };

    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("focusin", onFocusIn, true);
    doc.addEventListener("focusout", onFocusOut, true);

    onCleanup(() => {
      doc.removeEventListener("keydown", onKeyDown, true);
      doc.removeEventListener("focusin", onFocusIn, true);
      doc.removeEventListener("focusout", onFocusOut, true);
      if (restoreRaf != null) {
        (doc.defaultView ?? window).cancelAnimationFrame(restoreRaf);
      }
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
          focusSafely(nodeToRestore as HTMLElement);
        }
      });
    }
  });

  return (
    <FocusScopeContext.Provider value={{ focusManager, scopeRef: scopeElements }}>
      <span data-focus-scope-start hidden ref={(el) => setStartEl(el ?? null)} />
      {props.children}
      <span data-focus-scope-end hidden ref={(el) => setEndEl(el ?? null)} />
    </FocusScopeContext.Provider>
  );
};

export default FocusScope;
