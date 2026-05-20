/**
 * Toast state management for SolidJS
 * Based on @react-stately/toast useToastState
 */
import { type Accessor } from "solid-js";
export interface ToastOptions {
  /** A timeout to automatically close the toast, in milliseconds. */
  timeout?: number;
  /** The priority of the toast relative to other toasts. */
  priority?: number;
  /** Handler called when the toast is closed. */
  onClose?: () => void;
}
export interface QueuedToast<T> {
  /** The content of the toast. */
  content: T;
  /** A unique key for the toast. */
  key: string;
  /** The timer for the toast. */
  timer: Timer | null;
  /** Whether the toast should be animated. */
  animation?: "entering" | "exiting" | "queued";
  /** The priority of the toast. */
  priority: number;
  /** Handler called when the toast is closed. */
  onClose?: () => void;
  /** The timeout for the toast. */
  timeout?: number;
}
export interface ToastQueueOptions {
  /** The maximum number of toasts to display at once. */
  maxVisibleToasts?: number;
  /** Whether toasts should stack (true) or queue (false). */
  hasExitAnimation?: boolean;
}
export interface ToastStateProps<T> {
  /** The toast queue to use. */
  queue: ToastQueue<T>;
}
export interface ToastState<T> {
  /** The currently visible toasts. */
  visibleToasts: Accessor<QueuedToast<T>[]>;
  /** Adds a toast to the queue. */
  add: (content: T, options?: ToastOptions) => string;
  /** Closes a toast by key. Starts exit animation if hasExitAnimation is enabled. */
  close: (key: string) => void;
  /**
   * Removes a toast after exit animation completes.
   * Call this from the component layer when the CSS exit animation finishes.
   */
  remove: (key: string) => void;
  /** Clears all queued and visible toasts. */
  clear: () => void;
  /** Pauses all toast timers. */
  pauseAll: () => void;
  /** Resumes all toast timers. */
  resumeAll: () => void;
}
/**
 * A Timer that supports pause and resume.
 */
export declare class Timer {
  private timerId;
  private startTime;
  private remaining;
  private callback;
  constructor(callback: () => void, delay: number);
  pause(): void;
  resume(): void;
  reset(delay: number): void;
  cancel(): void;
}
type SubscribeCallback<T> = (toasts: QueuedToast<T>[]) => void;
/**
 * A queue that manages toast notifications.
 * Can be created once and shared across the app (singleton pattern).
 */
export declare class ToastQueue<T> {
  private queue;
  private subscriptions;
  private maxVisibleToasts;
  private hasExitAnimation;
  private keyCounter;
  constructor(options?: ToastQueueOptions);
  /**
   * Subscribe to queue changes.
   */
  subscribe(callback: SubscribeCallback<T>): () => void;
  /**
   * Add a toast to the queue.
   */
  add(content: T, options?: ToastOptions): string;
  /**
   * Close a toast by key.
   */
  close(key: string): void;
  /**
   * Remove a toast after exit animation completes.
   */
  remove(key: string): void;
  /**
   * Clear all queued and visible toasts.
   */
  clear(): void;
  /**
   * Pause all toast timers.
   */
  pauseAll(): void;
  /**
   * Resume all toast timers.
   */
  resumeAll(): void;
  private updateVisibility;
  private notify;
}
/**
 * Creates reactive toast state from a ToastQueue.
 * Use this hook to subscribe to toast changes in your component.
 */
export declare function createToastState<T>(props: ToastStateProps<T>): ToastState<T>;
/**
 * Creates a new ToastQueue and returns reactive state.
 * Use this if you don't need a global queue.
 */
export declare function createToastQueue<T>(options?: ToastQueueOptions): ToastState<T> & {
  queue: ToastQueue<T>;
};

//# sourceMappingURL=createToastState.d.ts.map
