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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/live-announcer/LiveAnnouncer.tsx

/**
 * Live announcer for solidaria
 *
 * Provides functions to make announcements to screen readers using
 * ARIA live regions. Useful for announcing dynamic content changes.
 *
 * Ported from packages/react-aria/src/live-announcer/LiveAnnouncer.tsx.
 * useAnnouncer is a local Solid lifecycle wrapper around that port.
 *
 * SSR Safety: All functions are safe to call during SSR. The announcer
 * will only be created when running in the browser.
 */

import { onCleanup, createEffect } from "solid-js";
import { isServer } from "solid-js/web";

export type Assertiveness = "assertive" | "polite";

export type Message = string | { "aria-labelledby": string };

const LIVEREGION_TIMEOUT_DELAY = 7000;

/**
 * Singleton class that manages live region announcements.
 * Implemented using vanilla DOM for simplicity and framework independence.
 */
class LiveAnnouncer {
  node: HTMLElement | null = null;
  assertiveLog: HTMLElement | null = null;
  politeLog: HTMLElement | null = null;

  constructor() {
    if (typeof document !== "undefined") {
      this.node = document.createElement("div");
      this.node.dataset.liveAnnouncer = "true";
      // Visually hidden styles
      Object.assign(this.node.style, {
        border: "0",
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: "0",
        position: "absolute",
        width: "1px",
        whiteSpace: "nowrap",
      });

      this.assertiveLog = this.createLog("assertive");
      this.node.appendChild(this.assertiveLog);

      this.politeLog = this.createLog("polite");
      this.node.appendChild(this.politeLog);

      document.body.prepend(this.node);
    }
  }

  isAttached(): boolean {
    return this.node?.isConnected ?? false;
  }

  createLog(ariaLive: string): HTMLElement {
    const node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", ariaLive);
    node.setAttribute("aria-relevant", "additions");
    return node;
  }

  destroy(): void {
    if (!this.node) {
      return;
    }

    document.body.removeChild(this.node);
    this.node = null;
  }

  announce(
    message: Message,
    assertiveness: Assertiveness = "assertive",
    timeout: number = LIVEREGION_TIMEOUT_DELAY,
  ): void {
    if (!this.node) {
      return;
    }

    const node = document.createElement("div");
    if (typeof message === "object") {
      // To read an aria-labelledby, the element must have an appropriate role, such as img.
      node.setAttribute("role", "img");
      node.setAttribute("aria-labelledby", message["aria-labelledby"]);
    } else {
      node.textContent = message;
    }

    if (assertiveness === "assertive") {
      this.assertiveLog?.appendChild(node);
    } else {
      this.politeLog?.appendChild(node);
    }

    if (message !== "") {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness?: Assertiveness): void {
    if (!this.node) {
      return;
    }

    if ((!assertiveness || assertiveness === "assertive") && this.assertiveLog) {
      this.assertiveLog.innerHTML = "";
    }

    if ((!assertiveness || assertiveness === "polite") && this.politeLog) {
      this.politeLog.innerHTML = "";
    }
  }
}

let liveAnnouncer: LiveAnnouncer | null = null;

/**
 * Announces a message to screen readers using ARIA live regions.
 *
 * @param message - The message to announce, or an object with aria-labelledby
 * @param assertiveness - 'assertive' interrupts, 'polite' waits for a pause
 * @param timeout - How long to keep the message in the DOM (default 7000ms)
 *
 * @example
 * ```tsx
 * // Simple announcement
 * announce('Item added to cart');
 *
 * // Polite announcement (won't interrupt)
 * announce('3 results found', 'polite');
 *
 * // Using aria-labelledby for complex content
 * announce({ 'aria-labelledby': 'my-element-id' });
 * ```
 */
export function announce(
  message: Message,
  assertiveness: Assertiveness = "assertive",
  timeout: number = LIVEREGION_TIMEOUT_DELAY,
): void {
  if (!liveAnnouncer) {
    liveAnnouncer = new LiveAnnouncer();
    // Wait for the live announcer regions to be added to the DOM, then announce.
    // Otherwise Safari won't announce the message if it's added too quickly.
    // Found most times less than 100ms were not consistent when announcing with Safari.

    // Check for test environment
    const isTestEnv =
      typeof (globalThis as Record<string, unknown>).IS_SOLIDARIA_TEST === "boolean"
        ? (globalThis as Record<string, unknown>).IS_SOLIDARIA_TEST
        : typeof (globalThis as Record<string, unknown>).vitest !== "undefined";

    if (!isTestEnv) {
      setTimeout(() => {
        if (liveAnnouncer?.isAttached()) {
          liveAnnouncer?.announce(message, assertiveness, timeout);
        }
      }, 100);
    } else {
      liveAnnouncer.announce(message, assertiveness, timeout);
    }
  } else {
    liveAnnouncer.announce(message, assertiveness, timeout);
  }
}

/**
 * Clears all queued announcements for the given assertiveness level.
 *
 * @param assertiveness - Which log to clear ('assertive' or 'polite')
 *
 * @example
 * ```tsx
 * // Clear assertive announcements
 * clearAnnouncer('assertive');
 *
 * // Clear polite announcements
 * clearAnnouncer('polite');
 * ```
 */
export function clearAnnouncer(assertiveness?: Assertiveness): void {
  if (liveAnnouncer) {
    liveAnnouncer.clear(assertiveness);
  }
}

/**
 * Removes the live announcer from the DOM entirely.
 * Call this when unmounting your app or when announcements are no longer needed.
 *
 * @example
 * ```tsx
 * // Clean up on app unmount
 * onCleanup(() => {
 *   destroyAnnouncer();
 * });
 * ```
 */
export function destroyAnnouncer(): void {
  if (liveAnnouncer) {
    liveAnnouncer.destroy();
    liveAnnouncer = null;
  }
}

export interface UseAnnouncerResult {
  /** Announce a message to screen readers. */
  announce: (message: Message, assertiveness?: Assertiveness, timeout?: number) => void;
  /** Clear announcements for the given assertiveness level. */
  clear: (assertiveness?: Assertiveness) => void;
}

/**
 * Hook that provides access to the live announcer with automatic cleanup.
 *
 * This is the recommended way to use the announcer in SolidJS components.
 * It ensures the announcer is created only on the client and provides
 * type-safe methods for announcing and clearing messages.
 *
 * SSR Safety: Returns no-op functions during SSR. The announcer is only
 * created when the component mounts on the client.
 *
 * @example
 * ```tsx
 * function SearchResults(props) {
 *   const announcer = useAnnouncer();
 *
 *   createEffect(() => {
 *     const count = props.results.length;
 *     announcer.announce(`${count} results found`, 'polite');
 *   });
 *
 *   return <ul>...</ul>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Form() {
 *   const announcer = useAnnouncer();
 *
 *   const onSubmit = async () => {
 *     try {
 *       await submitForm();
 *       announcer.announce('Form submitted successfully');
 *     } catch (error) {
 *       announcer.announce('Error submitting form', 'assertive');
 *     }
 *   };
 *
 *   return <form onSubmit={onSubmit}>...</form>;
 * }
 * ```
 */
export function useAnnouncer(): UseAnnouncerResult {
  // During SSR, return no-op functions
  if (isServer) {
    return {
      announce: () => {},
      clear: () => {},
    };
  }

  // Ensure the announcer is initialized
  createEffect(() => {
    // Initialize on first use
    if (!liveAnnouncer) {
      liveAnnouncer = new LiveAnnouncer();
    }
  });

  return {
    announce: (
      message: Message,
      assertiveness: Assertiveness = "assertive",
      timeout: number = LIVEREGION_TIMEOUT_DELAY,
    ) => {
      announce(message, assertiveness, timeout);
    },
    clear: (assertiveness?: Assertiveness) => {
      clearAnnouncer(assertiveness);
    },
  };
}
