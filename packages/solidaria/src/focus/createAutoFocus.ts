/**
 * Auto-focus management for solidaria
 *
 * Provides priority-based auto-focus with deferred execution
 * and conflict resolution for multiple auto-focus elements.
 *
 * This is a local Solid helper. The pinned React Aria revision has no
 * priority-based auto-focus queue API.
 */

import { createEffect, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
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
}

// Global queue for managing auto-focus requests
let autoFocusQueue: QueuedFocus[] = [];
let processingTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Process the auto-focus queue and focus the highest priority element.
 */
function processAutoFocusQueue(): void {
  if (processingTimeout) {
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

  // Notify losers
  for (const loser of losers) {
    loser.onSkip?.();
  }

  // Focus the winner
  const element = winner.ref();
  if (!element) {
    winner.onSkip?.();
    return;
  }

  // Check if we should focus
  const activeElement = document.activeElement;
  const shouldFocus =
    winner.force ||
    !activeElement ||
    activeElement === document.body ||
    activeElement === document.documentElement;

  if (!shouldFocus) {
    winner.onSkip?.();
    return;
  }

  // Apply focus with optional delay
  if (winner.delay > 0) {
    setTimeout(() => {
      const el = winner.ref();
      if (el && document.body.contains(el)) {
        if (winner.preventScroll) {
          focusSafely(el);
        } else {
          el.focus();
        }
        winner.onFocus?.(el);
      }
    }, winner.delay);
  } else {
    if (winner.preventScroll) {
      focusSafely(element);
    } else {
      element.focus();
    }
    winner.onFocus?.(element);
  }
}

/**
 * Queue an element for auto-focus.
 */
function queueAutoFocus(item: QueuedFocus): void {
  autoFocusQueue.push(item);

  // Schedule processing on next frame to allow all components to register
  if (processingTimeout === null) {
    processingTimeout = setTimeout(processAutoFocusQueue, 0);
  }
}

/**
 * Remove an item from the auto-focus queue.
 */
function removeFromQueue(ref: () => HTMLElement | null | undefined): void {
  autoFocusQueue = autoFocusQueue.filter((item) => item.ref !== ref);
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

  // During SSR, return no-op functions
  if (isServer) {
    return {
      focus: () => {},
      cancel: () => {},
    };
  }

  let canceled = false;

  // Queue auto-focus on mount
  onMount(() => {
    if (!isEnabled || canceled) return;

    queueAutoFocus({
      ref,
      priority,
      delay,
      force,
      preventScroll,
      onFocus,
      onSkip,
    });
  });

  // Remove from queue on cleanup
  onCleanup(() => {
    removeFromQueue(ref);
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
    removeFromQueue(ref);
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
  if (processingTimeout) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
  autoFocusQueue = [];
}

/**
 * Gets the current auto-focus queue length.
 * Useful for debugging.
 */
export function getAutoFocusQueueLength(): number {
  return autoFocusQueue.length;
}
