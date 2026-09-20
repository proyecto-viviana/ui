/**
 * Auto-focus management for solidaria
 *
 * Provides priority-based auto-focus with deferred execution
 * and conflict resolution for multiple auto-focus elements.
 *
 * This is a local Solid helper. The pinned React Aria revision has no
 * priority-based auto-focus queue API.
 */

import { onOwnedCleanup } from "../utils/owner";
import { onSettled } from "solid-js";
import { isServer } from "@solidjs/web";
import { focusSafely } from "../utils/focus";

export interface AutoFocusOptions {
  /**
   * Whether auto-focus is enabled.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Priority level (higher = more important).
   * When multiple elements request auto-focus, the highest priority wins.
   * @default 0
   */
  priority?: number;
  /**
   * Delay in milliseconds before focusing.
   * Useful for animations or transitions.
   * @default 0
   */
  delay?: number;
  /**
   * Whether to focus even if another element is already focused.
   * @default false
   */
  force?: boolean;
  /**
   * Whether to prevent scrolling when focusing.
   * @default true
   */
  preventScroll?: boolean;
  /**
   * Callback when focus is applied.
   */
  onFocus?: (element: HTMLElement) => void;
  /**
   * Callback when focus is skipped (due to lower priority or other reasons).
   */
  onSkip?: () => void;
}

export interface AutoFocusResult {
  /**
   * Manually trigger the auto-focus.
   */
  focus: () => void;
  /**
   * Cancel any pending auto-focus.
   */
  cancel: () => void;
}

interface QueuedFocus {
  ref: () => HTMLElement | null | undefined;
  priority: number;
  delay: number;
  force: boolean;
  preventScroll: boolean;
  onFocus?: (element: HTMLElement) => void;
  onSkip?: () => void;
  timeout?: ReturnType<typeof setTimeout>;
}

// Global queue for managing auto-focus requests
let autoFocusQueue: QueuedFocus[] = [];
// Requests remain owned after dequeue until their delayed work finishes.
const pendingAutoFocus = new Set<QueuedFocus>();
let processingTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Process the auto-focus queue and focus the highest priority element.
 */
function processAutoFocusQueue(): void {
  if (processingTimeout !== null) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }

  if (autoFocusQueue.length === 0) return;

  // Sort by priority (highest first)
  autoFocusQueue.sort((a, b) => b.priority - a.priority);

  // Get the highest priority item
  const winner = autoFocusQueue[0];
  const losers = autoFocusQueue.slice(1);

  // Clear the queue
  autoFocusQueue = [];

  try {
    // Callbacks can cancel another request, dispose its owner, or clear all.
    for (const loser of losers) {
      if (!pendingAutoFocus.has(loser)) continue;
      removeRequest(loser);
      loser.onSkip?.();
    }

    if (!pendingAutoFocus.has(winner)) return;
    const element = winner.ref();
    if (!pendingAutoFocus.has(winner)) return;
    if (!element) {
      removeRequest(winner);
      winner.onSkip?.();
      return;
    }

    const activeElement = document.activeElement;
    const shouldFocus =
      winner.force ||
      !activeElement ||
      activeElement === document.body ||
      activeElement === document.documentElement;

    if (!shouldFocus) {
      removeRequest(winner);
      winner.onSkip?.();
      return;
    }

    if (winner.delay > 0) {
      winner.timeout = setTimeout(() => {
        if (!pendingAutoFocus.has(winner)) return;
        try {
          const el = winner.ref();
          if (!pendingAutoFocus.has(winner)) return;
          removeRequest(winner);
          if (el && document.body.contains(el)) {
            if (winner.preventScroll) {
              focusSafely(el);
            } else {
              el.focus();
            }
            winner.onFocus?.(el);
          }
        } finally {
          removeRequest(winner);
        }
      }, winner.delay);
    } else {
      removeRequest(winner);
      if (winner.preventScroll) {
        focusSafely(element);
      } else {
        element.focus();
      }
      winner.onFocus?.(element);
    }
  } catch (error) {
    // Do not retain a detached batch if a consumer callback throws. Requests
    // queued reentrantly belong to their next batch and remain independent.
    for (const item of [winner, ...losers]) removeRequest(item);
    throw error;
  }
}

/**
 * Queue an element for auto-focus.
 */
function queueAutoFocus(item: QueuedFocus): void {
  pendingAutoFocus.add(item);
  autoFocusQueue.push(item);

  // Schedule processing on next frame to allow all components to register
  if (processingTimeout === null) {
    processingTimeout = setTimeout(processAutoFocusQueue, 0);
  }
}

/**
 * Cancel this request in the queue, processing batch, or delayed phase.
 */
function removeRequest(item: QueuedFocus): void {
  pendingAutoFocus.delete(item);
  autoFocusQueue = autoFocusQueue.filter((queued) => queued !== item);
  if (item.timeout !== undefined) {
    clearTimeout(item.timeout);
    item.timeout = undefined;
  }
}

/**
 * Creates auto-focus behavior for an element.
 *
 * This hook registers the element for auto-focus when mounted. If multiple
 * elements request auto-focus, the one with the highest priority wins.
 *
 * @param ref - Accessor for the element to focus
 * @param options - Auto-focus options
 *
 * @example
 * ```tsx
 * function Dialog(props) {
 *   let contentRef: HTMLDivElement | undefined;
 *
 *   createAutoFocus(() => contentRef, {
 *     priority: 10, // High priority for dialogs
 *     onFocus: () => console.log('Dialog focused'),
 *   });
 *
 *   return (
 *     <div ref={contentRef} tabIndex={-1}>
 *       {props.children}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With delay for animations
 * function AnimatedPanel() {
 *   let panelRef: HTMLDivElement | undefined;
 *
 *   createAutoFocus(() => panelRef, {
 *     delay: 300, // Wait for animation
 *   });
 *
 *   return <div ref={panelRef} class="animated-panel">...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional auto-focus
 * function Input(props) {
 *   let inputRef: HTMLInputElement | undefined;
 *
 *   createAutoFocus(() => inputRef, {
 *     isEnabled: props.autoFocus,
 *   });
 *
 *   return <input ref={inputRef} />;
 * }
 * ```
 */
export function createAutoFocus(
  ref: () => HTMLElement | null | undefined,
  options: AutoFocusOptions = {},
): AutoFocusResult {
  const {
    isEnabled = true,
    priority = 0,
    delay = 0,
    force = false,
    preventScroll = true,
    onFocus,
    onSkip,
  } = options;

  let canceled = false;
  const request: QueuedFocus = { ref, priority, delay, force, preventScroll, onFocus, onSkip };

  // Register on both sides to preserve the following owner IDs. The server
  // reserves this lifecycle slot without executing the browser callback.
  onSettled(() => {
    if (!isEnabled || canceled) return;

    queueAutoFocus(request);
  });

  // During SSR, keep the public methods inert and skip browser cleanup.
  if (isServer) {
    return {
      focus: () => {},
      cancel: () => {},
    };
  }

  // Stop pending automatic work even after the queue has handed it off.
  onOwnedCleanup(() => {
    canceled = true;
    removeRequest(request);
  });

  const focus = (): void => {
    if (canceled) return;

    const element = ref();
    if (!element) return;

    if (preventScroll) {
      focusSafely(element);
    } else {
      element.focus();
    }
    onFocus?.(element);
  };

  const cancel = (): void => {
    canceled = true;
    removeRequest(request);
  };

  return {
    focus,
    cancel,
  };
}

/**
 * Clears all pending auto-focus requests.
 * Useful for testing or when navigating away.
 */
export function clearAutoFocusQueue(): void {
  if (processingTimeout !== null) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
  for (const item of pendingAutoFocus) removeRequest(item);
}

/**
 * Gets the current auto-focus queue length.
 * Useful for debugging.
 */
export function getAutoFocusQueueLength(): number {
  return autoFocusQueue.length;
}
