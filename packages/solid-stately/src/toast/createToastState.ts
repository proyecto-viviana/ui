/**
 * Toast state management for SolidJS
 * Based on @react-stately/toast useToastState
 */

import { createSignal, onCleanup, type Accessor } from "solid-js";

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
   * If hasExitAnimation is false, close() removes immediately and this is not needed.
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
export class Timer {
  private timerId: number | null = null;
  private startTime: number = 0;
  private remaining: number;
  private callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause() {
    if (this.timerId === null) {
      return;
    }
    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - this.startTime;
  }

  resume() {
    if (this.timerId !== null) {
      return;
    }
    this.startTime = Date.now();
    this.timerId = window.setTimeout(() => {
      this.timerId = null;
      this.callback();
    }, this.remaining);
  }

  reset(delay: number) {
    this.pause();
    this.remaining = delay;
    this.resume();
  }

  cancel() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

type SubscribeCallback<T> = (toasts: QueuedToast<T>[]) => void;

/**
 * A queue that manages toast notifications.
 * Can be created once and shared across the app (singleton pattern).
 */
export class ToastQueue<T> {
  private queue: QueuedToast<T>[] = [];
  private subscriptions = new Set<SubscribeCallback<T>>();
  private maxVisibleToasts: number;
  private hasExitAnimation: boolean;
  private keyCounter = 0;

  constructor(options: ToastQueueOptions = {}) {
    this.maxVisibleToasts = options.maxVisibleToasts ?? 5;
    this.hasExitAnimation = options.hasExitAnimation ?? false;
  }

  /**
   * Subscribe to queue changes.
   */
  subscribe(callback: SubscribeCallback<T>): () => void {
    this.subscriptions.add(callback);
    return () => {
      this.subscriptions.delete(callback);
    };
  }

  /**
   * Add a toast to the queue.
   */
  add(content: T, options: ToastOptions = {}): string {
    const key = String(this.keyCounter++);

    const toast: QueuedToast<T> = {
      content,
      key,
      timer: null,
      priority: options.priority ?? 0,
      onClose: options.onClose,
      timeout: options.timeout,
      animation: "entering",
    };

    // Find insertion point based on priority
    let low = 0;
    let high = this.queue.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (toast.priority >= this.queue[mid].priority) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    // Insert at the correct position
    this.queue = [...this.queue.slice(0, low), toast, ...this.queue.slice(low)];

    // Start timer for visible toasts
    this.updateVisibility();

    return key;
  }

  /**
   * Close a toast by key.
   */
  close(key: string): void {
    const toast = this.queue.find((t) => t.key === key);
    if (!toast) return;

    // Cancel any existing timer
    toast.timer?.cancel();

    if (this.hasExitAnimation && toast.animation !== "queued") {
      // Mark as exiting for animation
      this.queue = this.queue.map((t) =>
        t.key === key ? { ...t, timer: null, animation: "exiting" } : t,
      );
      this.notify();
    } else {
      // Remove immediately
      this.remove(key);
    }
  }

  /**
   * Remove a toast after exit animation completes.
   */
  remove(key: string): void {
    const toast = this.queue.find((t) => t.key === key);
    if (toast) {
      toast.onClose?.();
      toast.timer?.cancel();
    }

    this.queue = this.queue.filter((t) => t.key !== key);
    this.updateVisibility();
  }

  /**
   * Clear all queued and visible toasts.
   */
  clear(): void {
    for (const toast of this.queue) {
      toast.timer?.cancel();
    }

    this.queue = [];
    this.notify();
  }

  /**
   * Pause all toast timers.
   */
  pauseAll(): void {
    for (const toast of this.queue) {
      toast.timer?.pause();
    }
  }

  /**
   * Resume all toast timers.
   */
  resumeAll(): void {
    for (const toast of this.queue) {
      toast.timer?.resume();
    }
  }

  private updateVisibility(): void {
    // Mark toasts as visible or queued based on maxVisibleToasts
    const visibleCount = this.queue.filter(
      (t) => t.animation !== "queued" && t.animation !== "exiting",
    ).length;

    let promoted = 0;
    this.queue = this.queue.map((toast) => {
      let nextToast = toast;

      if (nextToast.animation === "queued" && visibleCount + promoted < this.maxVisibleToasts) {
        nextToast = { ...nextToast, animation: "entering" };
        promoted++;
      }
      if (nextToast.animation === "queued") return nextToast;

      // Start timer for visible toasts
      if (
        nextToast.timeout != null &&
        nextToast.timer === null &&
        nextToast.animation !== "exiting"
      ) {
        nextToast = {
          ...nextToast,
          timer: new Timer(() => {
            this.close(nextToast.key);
          }, nextToast.timeout),
        };
      }

      return nextToast;
    });

    this.notify();
  }

  private notify(): void {
    const toasts = [...this.queue];
    for (const callback of this.subscriptions) {
      callback(toasts);
    }
  }
}

/**
 * Creates reactive toast state from a ToastQueue.
 * Use this hook to subscribe to toast changes in your component.
 */
export function createToastState<T>(props: ToastStateProps<T>): ToastState<T> {
  const [visibleToasts, setVisibleToasts] = createSignal<QueuedToast<T>[]>([]);

  // Subscribe to queue changes
  const unsubscribe = props.queue.subscribe((toasts) => {
    setVisibleToasts(toasts);
  });

  onCleanup(() => {
    unsubscribe();
  });

  return {
    visibleToasts,
    add: (content, options) => props.queue.add(content, options),
    close: (key) => props.queue.close(key),
    remove: (key) => props.queue.remove(key),
    clear: () => props.queue.clear(),
    pauseAll: () => props.queue.pauseAll(),
    resumeAll: () => props.queue.resumeAll(),
  };
}

/**
 * Creates a new ToastQueue and returns reactive state.
 * Use this if you don't need a global queue.
 */
export function createToastQueue<T>(
  options?: ToastQueueOptions,
): ToastState<T> & { queue: ToastQueue<T> } {
  const queue = new ToastQueue<T>(options);
  const state = createToastState({ queue });
  return { ...state, queue };
}
