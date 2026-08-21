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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useGlobalListeners.ts

/**
 * Global listener management utility.
 * Based on @react-aria/utils useGlobalListeners hook, adapted for SolidJS.
 *
 * In SolidJS, we use onCleanup for automatic cleanup instead of useEffect return.
 */

import { onCleanup } from "solid-js";

export interface GlobalListenerOptions extends AddEventListenerOptions {
  /** Whether to add the listener to the window instead of document */
  isWindow?: boolean;
}

/**
 * Creates a manager for global event listeners that automatically cleans up.
 * Use this in a component to register document/window level listeners
 * that will be removed when the component unmounts.
 */
export function createGlobalListeners() {
  const listeners: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
  }> = [];

  /**
   * Adds a global event listener.
   */
  function addGlobalListener<K extends keyof DocumentEventMap>(
    type: K,
    handler: (ev: DocumentEventMap[K]) => void,
    options?: GlobalListenerOptions,
  ): void;
  function addGlobalListener<K extends keyof WindowEventMap>(
    type: K,
    handler: (ev: WindowEventMap[K]) => void,
    options?: GlobalListenerOptions & { isWindow: true },
  ): void;
  function addGlobalListener(
    type: string,
    handler: EventListener,
    options?: GlobalListenerOptions,
  ): void {
    const target = options?.isWindow ? window : document;
    const listenerOptions = options
      ? {
          capture: options.capture,
          passive: options.passive,
          once: options.once,
        }
      : undefined;

    target.addEventListener(type, handler, listenerOptions);
    listeners.push({ target, type, handler, options: listenerOptions });
  }

  /**
   * Removes a specific global event listener.
   */
  function removeGlobalListener<K extends keyof DocumentEventMap>(
    type: K,
    handler: (ev: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  function removeGlobalListener<K extends keyof WindowEventMap>(
    type: K,
    handler: (ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions & { isWindow: true },
  ): void;
  function removeGlobalListener(
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions & { isWindow?: boolean },
  ): void {
    const target = options?.isWindow ? window : document;
    const listenerOptions = options
      ? {
          capture: options.capture,
        }
      : undefined;

    target.removeEventListener(type, handler, listenerOptions);

    // Remove from tracked listeners
    const index = listeners.findIndex(
      (l) =>
        l.target === target &&
        l.type === type &&
        l.handler === handler &&
        l.options?.capture === listenerOptions?.capture,
    );
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Removes all registered global listeners.
   */
  function removeAllGlobalListeners(): void {
    for (const { target, type, handler, options } of listeners) {
      target.removeEventListener(type, handler, options);
    }
    listeners.length = 0;
  }

  // Automatically clean up when the component/scope is disposed
  onCleanup(removeAllGlobalListeners);

  return {
    addGlobalListener,
    removeGlobalListener,
    removeAllGlobalListeners,
  };
}

/**
 * Simple utility to add a single global listener with automatic cleanup.
 * For one-off listeners where the full manager isn't needed.
 */
export function addGlobalListenerOnce<K extends keyof DocumentEventMap>(
  type: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: GlobalListenerOptions,
): () => void {
  const target = options?.isWindow ? window : document;
  const listenerOptions = options
    ? {
        capture: options.capture,
        passive: options.passive,
        once: options.once,
      }
    : undefined;

  target.addEventListener(type, handler as EventListener, listenerOptions);

  return () => {
    target.removeEventListener(type, handler as EventListener, listenerOptions);
  };
}
