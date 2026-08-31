/**
 * Focus restoration utilities for solidaria
 *
 * Provides enhanced focus restoration with retry logic, cross-scope tracking,
 * and safe restoration patterns.
 *
 * This is a local Solid helper. The pinned React Aria revision has no
 * standalone retrying focus-restore stack API.
 */

import { createEffect, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { getOwnerDocument } from "../utils";
import { focusSafely } from "../utils/focus";

export interface FocusRestoreOptions {
  /**
   * Whether to restore focus when the component unmounts.
   * @default true
   */
  restoreOnUnmount?: boolean;
  /**
   * Maximum number of retries if the element is not in the DOM.
   * @default 3
   */
  maxRetries?: number;
  /**
   * Delay between retries in milliseconds.
   * @default 50
   */
  retryDelay?: number;
  /**
   * Callback when focus is successfully restored.
   */
  onRestore?: (element: HTMLElement) => void;
  /**
   * Callback when focus restoration fails.
   */
  onRestoreFailed?: () => void;
  /**
   * Whether to prevent scrolling when restoring focus.
   * @default true
   */
  preventScroll?: boolean;
}

export interface FocusRestoreResult {
  /**
   * Manually restore focus to the saved element.
   */
  restore: () => boolean;
  /**
   * Get the saved element (if any).
   */
  getSavedElement: () => HTMLElement | null;
  /**
   * Save the currently focused element.
   */
  saveCurrentFocus: () => void;
  /**
   * Clear the saved element without restoring.
   */
  clear: () => void;
}

// Stack to track focus history across scopes
const focusStack: HTMLElement[] = [];

/**
 * Push an element onto the focus stack.
 */
export function pushFocusStack(element: HTMLElement): void {
  focusStack.push(element);
}

/**
 * Pop the last element from the focus stack.
 */
export function popFocusStack(): HTMLElement | undefined {
  return focusStack.pop();
}

/**
 * Get the current focus stack length.
 */
export function getFocusStackLength(): number {
  return focusStack.length;
}

/**
 * Clear the entire focus stack.
 */
export function clearFocusStack(): void {
  focusStack.length = 0;
}

/**
 * Gets the active element, accounting for shadow DOM.
 */
function getActiveElement(doc: Document): HTMLElement | null {
  let activeElement = doc.activeElement as HTMLElement | null;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement as HTMLElement;
  }
  return activeElement;
}

/**
 * Checks if an element is still valid for focus restoration.
 */
function isValidForRestore(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (!document.body.contains(element)) return false;
  if (element.hasAttribute("disabled")) return false;
  if (element.getAttribute("aria-disabled") === "true") return false;
  if (element.getAttribute("aria-hidden") === "true") return false;
  return true;
}

/**
 * Attempts to restore focus with retries.
 */
function tryRestoreFocus(
  element: HTMLElement | null,
  options: Required<
    Pick<
      FocusRestoreOptions,
      "maxRetries" | "retryDelay" | "preventScroll" | "onRestore" | "onRestoreFailed"
    >
  >,
): void {
  const { maxRetries, retryDelay, preventScroll, onRestore, onRestoreFailed } = options;
  let attempts = 0;

  const attempt = () => {
    if (!element) {
      onRestoreFailed?.();
      return;
    }

    if (isValidForRestore(element)) {
      if (preventScroll) {
        focusSafely(element);
      } else {
        element.focus();
      }
      onRestore?.(element);
      return;
    }

    attempts++;
    if (attempts < maxRetries) {
      setTimeout(attempt, retryDelay);
    } else {
      onRestoreFailed?.();
    }
  };

  // Use requestAnimationFrame for the first attempt to ensure DOM is ready
  requestAnimationFrame(attempt);
}

/**
 * Creates a focus restoration manager.
 *
 * This hook saves the currently focused element when mounted and provides
 * methods to restore focus later, with retry logic for reliability.
 *
 * @example
 * ```tsx
 * function Modal(props) {
 *   const focusRestore = createFocusRestore({
 *     restoreOnUnmount: true,
 *     onRestore: () => console.log('Focus restored'),
 *   });
 *
 *   return (
 *     <div role="dialog">
 *       {props.children}
 *       <button onClick={() => focusRestore.restore()}>
 *         Close
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Manual focus management
 * function Dropdown() {
 *   const focusRestore = createFocusRestore({ restoreOnUnmount: false });
 *
 *   const onOpen = () => {
 *     focusRestore.saveCurrentFocus();
 *     // Focus dropdown content
 *   };
 *
 *   const onClose = () => {
 *     focusRestore.restore();
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function createFocusRestore(options: FocusRestoreOptions = {}): FocusRestoreResult {
  const {
    restoreOnUnmount = true,
    maxRetries = 3,
    retryDelay = 50,
    onRestore,
    onRestoreFailed,
    preventScroll = true,
  } = options;

  // During SSR, return no-op functions
  if (isServer) {
    return {
      restore: () => false,
      getSavedElement: () => null,
      saveCurrentFocus: () => {},
      clear: () => {},
    };
  }

  let savedElement: HTMLElement | null = null;

  // Save focus on mount
  onMount(() => {
    saveCurrentFocus();
  });

  // Restore focus on cleanup
  onCleanup(() => {
    if (restoreOnUnmount && savedElement) {
      tryRestoreFocus(savedElement, {
        maxRetries,
        retryDelay,
        preventScroll,
        onRestore: onRestore ?? (() => {}),
        onRestoreFailed: onRestoreFailed ?? (() => {}),
      });
    }
  });

  function saveCurrentFocus(): void {
    const doc = typeof document !== "undefined" ? document : null;
    if (!doc) return;

    const active = getActiveElement(doc);
    if (active && active !== doc.body) {
      savedElement = active;
      pushFocusStack(active);
    }
  }

  function restore(): boolean {
    if (!savedElement) return false;

    if (isValidForRestore(savedElement)) {
      if (preventScroll) {
        focusSafely(savedElement);
      } else {
        savedElement.focus();
      }
      onRestore?.(savedElement);
      return true;
    }

    // Try the focus stack
    while (focusStack.length > 0) {
      const stackElement = popFocusStack();
      if (stackElement && isValidForRestore(stackElement)) {
        if (preventScroll) {
          focusSafely(stackElement);
        } else {
          stackElement.focus();
        }
        onRestore?.(stackElement);
        return true;
      }
    }

    onRestoreFailed?.();
    return false;
  }

  function getSavedElement(): HTMLElement | null {
    return savedElement;
  }

  function clear(): void {
    savedElement = null;
  }

  return {
    restore,
    getSavedElement,
    saveCurrentFocus,
    clear,
  };
}
