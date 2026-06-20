/**
 * createToolbar - Accessibility hook for toolbar elements
 *
 * Provides keyboard navigation between toolbar items using arrow keys.
 * Based on @react-aria/toolbar useToolbar.
 */

import { createSignal, onMount, onCleanup, type Accessor } from "solid-js";
import { type MaybeAccessor, access } from "../utils";
import { useLocale } from "../i18n";
import { getOwnerDocument, isFocusable, isTabbable } from "../utils";
import { focusSafely } from "../utils/focus";

export type Orientation = "horizontal" | "vertical";

export interface AriaToolbarProps {
  /** The orientation of the toolbar. @default 'horizontal' */
  orientation?: MaybeAccessor<Orientation>;
  /** An accessibility label for the toolbar. */
  "aria-label"?: MaybeAccessor<string>;
  /** Identifies the element (or elements) that labels the toolbar. */
  "aria-labelledby"?: MaybeAccessor<string>;
}

export interface ToolbarAria {
  /** Props for the toolbar container element. */
  toolbarProps: {
    role: "toolbar" | "group";
    "aria-orientation"?: Orientation;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    tabIndex?: number;
    ref: (el: HTMLElement) => void;
  };
  /** The orientation of the toolbar. */
  orientation: Accessor<Orientation>;
}

interface FocusManagerOptions {
  from?: Element;
  tabbable?: boolean;
  wrap?: boolean;
  accept?: (node: Element) => boolean;
}

interface FocusManager {
  focusNext(opts?: FocusManagerOptions): HTMLElement | null;
  focusPrevious(opts?: FocusManagerOptions): HTMLElement | null;
  focusFirst(opts?: FocusManagerOptions): HTMLElement | null;
  focusLast(opts?: FocusManagerOptions): HTMLElement | null;
}

function getFocusableElements(root: Element, tabbable = false): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const filter = tabbable ? isTabbable : isFocusable;

  // Check the root element itself
  if (filter(root)) {
    elements.push(root as HTMLElement);
  }

  // Check all descendants
  const descendants = root.querySelectorAll("*");
  for (let i = 0; i < descendants.length; i++) {
    const el = descendants[i];
    if (filter(el)) {
      elements.push(el as HTMLElement);
    }
  }

  return elements;
}

function getActiveElement(doc: Document): Element | null {
  let activeElement = doc.activeElement;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
}

const TEXT_INPUT_TYPES = new Set([
  "",
  "text",
  "search",
  "url",
  "tel",
  "password",
  "email",
  "number",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

function isTextInputLikeElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable || !!target.closest('[contenteditable="true"]')) {
    return true;
  }

  if (target.getAttribute("role") === "textbox") {
    return true;
  }

  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true;
  }

  if (target instanceof HTMLInputElement) {
    const type = target.type.toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
  }

  return false;
}

function createFocusManager(ref: Accessor<HTMLElement | undefined>): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;

      const { from, tabbable = true, wrap = false, accept } = opts;
      const doc = getOwnerDocument(root);
      const current = from || getActiveElement(doc);

      let elements = getFocusableElements(root, tabbable);
      if (accept) {
        elements = elements.filter(accept);
      }

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

    focusPrevious(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;

      const { from, tabbable = true, wrap = false, accept } = opts;
      const doc = getOwnerDocument(root);
      const current = from || getActiveElement(doc);

      let elements = getFocusableElements(root, tabbable);
      if (accept) {
        elements = elements.filter(accept);
      }

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

    focusFirst(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;

      const { tabbable = true, accept } = opts;
      let elements = getFocusableElements(root, tabbable);
      if (accept) {
        elements = elements.filter(accept);
      }

      if (elements.length > 0) {
        focusSafely(elements[0]);
        return elements[0];
      }

      return null;
    },

    focusLast(opts: FocusManagerOptions = {}) {
      const root = ref();
      if (!root) return null;

      const { tabbable = true, accept } = opts;
      let elements = getFocusableElements(root, tabbable);
      if (accept) {
        elements = elements.filter(accept);
      }

      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        focusSafely(lastElement);
        return lastElement;
      }

      return null;
    },
  };
}

/**
 * Provides the behavior and accessibility implementation for a toolbar.
 * A toolbar is a container for a set of interactive controls with arrow key navigation.
 *
 * @example
 * ```tsx
 * let ref;
 * const { toolbarProps } = createToolbar({ orientation: 'horizontal' });
 * return (
 *   <div {...toolbarProps}>
 *     <Button>Cut</Button>
 *     <Button>Copy</Button>
 *     <Button>Paste</Button>
 *   </div>
 * );
 * ```
 */
export function createToolbar(props: AriaToolbarProps = {}): ToolbarAria {
  let toolbarRef: HTMLElement | undefined;
  const [isInToolbar, setIsInToolbar] = createSignal(false);
  let lastFocusedElement: Element | null = null;

  const locale = useLocale();
  const orientation = () => access(props.orientation) ?? "horizontal";
  const ariaLabel = () => access(props["aria-label"]);
  const ariaLabelledby = () => access(props["aria-labelledby"]);

  const focusManager = createFocusManager(() => toolbarRef);

  // Check if this toolbar is nested inside another toolbar
  onMount(() => {
    if (toolbarRef) {
      const parentToolbar = toolbarRef.parentElement?.closest('[role="toolbar"]');
      setIsInToolbar(!!parentToolbar);
    }
  });

  // Keyboard event handler
  const onKeyDown = (e: KeyboardEvent) => {
    const root = toolbarRef;
    if (!root) return;

    // Don't handle if nested toolbar (parent handles navigation)
    if (isInToolbar()) return;

    const target = e.target;
    if (!(target instanceof Element) || !root.contains(target)) {
      return;
    }

    // Let modified shortcuts pass through.
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    // Text entry controls should keep arrow/home/end for caret/value navigation.
    if (isTextInputLikeElement(target)) {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
        case "ArrowDown":
        case "ArrowUp":
        case "Home":
        case "End":
          return;
      }
    }

    const dir = locale().direction;
    const isRTL = dir === "rtl";
    const isHorizontal = orientation() === "horizontal";

    let handled = false;

    switch (e.key) {
      case "ArrowRight":
        if (isHorizontal) {
          if (isRTL) {
            focusManager.focusPrevious({ tabbable: true });
          } else {
            focusManager.focusNext({ tabbable: true });
          }
          handled = true;
        }
        break;
      case "ArrowLeft":
        if (isHorizontal) {
          if (isRTL) {
            focusManager.focusNext({ tabbable: true });
          } else {
            focusManager.focusPrevious({ tabbable: true });
          }
          handled = true;
        }
        break;
      case "ArrowDown":
        if (!isHorizontal) {
          focusManager.focusNext({ tabbable: true });
          handled = true;
        }
        break;
      case "ArrowUp":
        if (!isHorizontal) {
          focusManager.focusPrevious({ tabbable: true });
          handled = true;
        }
        break;
      case "Home":
        focusManager.focusFirst({ tabbable: true });
        handled = true;
        break;
      case "End":
        focusManager.focusLast({ tabbable: true });
        handled = true;
        break;
      case "Tab":
        // Store the last focused element for re-entry
        lastFocusedElement = e.target as Element;
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Focus handler - restore last focused element when re-entering
  const onFocus = (e: FocusEvent) => {
    if (isInToolbar()) return;

    // Only restore if focus is coming from outside the toolbar
    const root = toolbarRef;
    if (!root) return;

    const relatedTarget = e.relatedTarget as Element | null;

    // If focus came from outside and we have a last focused element
    if (
      lastFocusedElement &&
      root.contains(lastFocusedElement) &&
      (!relatedTarget || !root.contains(relatedTarget))
    ) {
      // Restore focus to the last focused element
      focusSafely(lastFocusedElement as HTMLElement);
    }
  };

  // Set up capture event listeners
  const setRef = (el: HTMLElement) => {
    toolbarRef = el;

    // Use capture phase for keyboard events
    el.addEventListener("keydown", onKeyDown, true);
    el.addEventListener("focus", onFocus, true);

    onCleanup(() => {
      el.removeEventListener("keydown", onKeyDown, true);
      el.removeEventListener("focus", onFocus, true);
    });
  };

  return {
    toolbarProps: {
      get role() {
        return isInToolbar() ? "group" : "toolbar";
      },
      get "aria-orientation"() {
        return isInToolbar() ? undefined : orientation();
      },
      get "aria-label"() {
        return ariaLabel();
      },
      get "aria-labelledby"() {
        // Only use aria-labelledby if no aria-label is provided
        return ariaLabel() ? undefined : ariaLabelledby();
      },
      ref: setRef,
    },
    orientation,
  };
}
