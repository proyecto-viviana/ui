/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/landmark/useLandmark.ts

/**
 * createLandmark - SolidJS implementation of React Aria's useLandmark
 *
 * Provides landmark navigation in an application. Call this with a role and label
 * to register a landmark navigable with the F6 key.
 *
 * ARIA landmarks help screen reader users navigate between major sections of a page.
 * The F6 key (or Shift+F6) cycles through all registered landmarks.
 *
 * Ported from packages/react-aria/src/landmark/useLandmark.ts.
 */

import type { JSX, Accessor } from "solid-js";
import { createEffect, onCleanup } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { filterDOMProps } from "../utils";

/** ARIA landmark roles */
export type AriaLandmarkRole =
  | "main"
  | "region"
  | "search"
  | "navigation"
  | "form"
  | "banner"
  | "contentinfo"
  | "complementary";

export interface AriaLandmarkProps {
  /** The ARIA landmark role. */
  role: AriaLandmarkRole;
  /**
   * A human-readable label for the landmark.
   * Required when multiple landmarks with the same role exist on a page.
   */
  "aria-label"?: string;
  /** Identifies the element(s) that labels the landmark. */
  "aria-labelledby"?: string;
  /** The element's unique identifier. */
  id?: string;
  /**
   * A custom focus handler called when this landmark receives focus via F6 navigation.
   * Use this to focus a specific element within the landmark instead of the container.
   */
  focus?: () => void;
}

export interface LandmarkAria<T extends HTMLElement = HTMLElement> {
  /** Props to spread on the landmark element. */
  landmarkProps: JSX.HTMLAttributes<T>;
}

export interface LandmarkController {
  /** Focus the next landmark in DOM order. */
  focusNext: () => void;
  /** Focus the previous landmark in DOM order. */
  focusPrevious: () => void;
  /** Focus the main landmark. */
  focusMain: () => void;
  /** Navigate to a specific landmark by role. If multiple exist, the first one is focused. */
  navigate: (role: AriaLandmarkRole) => void;
}

interface LandmarkEntry {
  ref: HTMLElement;
  role: AriaLandmarkRole;
  label?: string;
  focus?: () => void;
  lastFocused?: HTMLElement;
}

/**
 * Manages all registered landmarks and handles F6 keyboard navigation.
 */
class LandmarkManager {
  private landmarks: LandmarkEntry[] = [];
  private currentIndex = -1;
  private listening = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.startListening();
    }
  }

  private startListening() {
    if (this.listening) return;
    this.listening = true;

    window.addEventListener("keydown", this.handleKeyDown.bind(this), true);
  }

  private handleKeyDown(event: KeyboardEvent) {
    // F6 to navigate landmarks
    if (event.key === "F6") {
      event.preventDefault();
      if (event.shiftKey) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
    }
  }

  register(entry: LandmarkEntry): void {
    // Insert in DOM order using compareDocumentPosition
    const index = this.findInsertionIndex(entry.ref);
    this.landmarks.splice(index, 0, entry);

    // Validate: if multiple landmarks have the same role, they should have different labels
    this.validateLabels();
  }

  unregister(ref: HTMLElement): void {
    const index = this.landmarks.findIndex((l) => l.ref === ref);
    if (index !== -1) {
      this.landmarks.splice(index, 1);
      // Adjust currentIndex if needed
      if (this.currentIndex >= this.landmarks.length) {
        this.currentIndex = this.landmarks.length - 1;
      }
    }
  }

  private findInsertionIndex(ref: HTMLElement): number {
    // Binary search for insertion point based on DOM order
    let low = 0;
    let high = this.landmarks.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.landmarks[mid].ref.compareDocumentPosition(ref);

      // Node.DOCUMENT_POSITION_FOLLOWING = 4
      if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  }

  private validateLabels(): void {
    // Group landmarks by role
    const roleGroups = new Map<AriaLandmarkRole, LandmarkEntry[]>();
    for (const landmark of this.landmarks) {
      const group = roleGroups.get(landmark.role) || [];
      group.push(landmark);
      roleGroups.set(landmark.role, group);
    }

    // Warn if multiple landmarks with the same role lack unique labels
    for (const [role, group] of roleGroups) {
      if (group.length > 1) {
        const labels = group.map((l) => l.label);
        const uniqueLabels = new Set(labels.filter(Boolean));
        if (uniqueLabels.size < group.length) {
          console.warn(
            `Multiple landmarks with role "${role}" exist. Each should have a unique aria-label or aria-labelledby.`,
          );
        }
      }
    }
  }

  focusNext(): void {
    if (this.landmarks.length === 0) return;

    // Find the currently focused landmark
    const activeElement = document.activeElement;
    this.currentIndex = this.findCurrentLandmarkIndex(activeElement);

    // Move to next
    this.currentIndex = (this.currentIndex + 1) % this.landmarks.length;
    this.focusLandmark(this.landmarks[this.currentIndex]);
  }

  focusPrevious(): void {
    if (this.landmarks.length === 0) return;

    // Find the currently focused landmark
    const activeElement = document.activeElement;
    this.currentIndex = this.findCurrentLandmarkIndex(activeElement);

    // Move to previous
    this.currentIndex = (this.currentIndex - 1 + this.landmarks.length) % this.landmarks.length;
    this.focusLandmark(this.landmarks[this.currentIndex]);
  }

  focusMain(): void {
    const main = this.landmarks.find((l) => l.role === "main");
    if (main) {
      this.focusLandmark(main);
    }
  }

  navigate(role: AriaLandmarkRole): void {
    const landmark = this.landmarks.find((l) => l.role === role);
    if (landmark) {
      this.focusLandmark(landmark);
    }
  }

  private findCurrentLandmarkIndex(activeElement: Element | null): number {
    if (!activeElement) return -1;

    // Check if active element is within any landmark
    for (let i = 0; i < this.landmarks.length; i++) {
      if (this.landmarks[i].ref.contains(activeElement)) {
        // Store the last focused element for this landmark
        if (activeElement instanceof HTMLElement) {
          this.landmarks[i].lastFocused = activeElement;
        }
        return i;
      }
    }

    return -1;
  }

  private focusLandmark(landmark: LandmarkEntry): void {
    // If a custom focus handler is provided, use it
    if (landmark.focus) {
      landmark.focus();
      return;
    }

    // If we previously focused an element in this landmark, try to restore it
    if (landmark.lastFocused && landmark.ref.contains(landmark.lastFocused)) {
      landmark.lastFocused.focus();
      return;
    }

    // Try to find the first focusable element
    const focusable = this.findFirstFocusable(landmark.ref);
    if (focusable) {
      focusable.focus();
      return;
    }

    // Fallback: make the landmark itself focusable and focus it
    if (!landmark.ref.hasAttribute("tabindex")) {
      landmark.ref.setAttribute("tabindex", "-1");
    }
    landmark.ref.focus();
  }

  private findFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    return container.querySelector<HTMLElement>(focusableSelectors);
  }

  getController(): LandmarkController {
    return {
      focusNext: () => this.focusNext(),
      focusPrevious: () => this.focusPrevious(),
      focusMain: () => this.focusMain(),
      navigate: (role) => this.navigate(role),
    };
  }
}

// Global singleton instance
let landmarkManager: LandmarkManager | null = null;

function getLandmarkManager(): LandmarkManager {
  if (!landmarkManager) {
    landmarkManager = new LandmarkManager();
  }
  return landmarkManager;
}

/**
 * Provides landmark navigation in an application.
 * Call this with a role and label to register a landmark navigable with F6.
 *
 * @example
 * ```tsx
 * function Navigation(props) {
 *   let ref: HTMLElement;
 *   const { landmarkProps } = createLandmark({
 *     role: 'navigation',
 *     'aria-label': 'Main navigation'
 *   });
 *
 *   return (
 *     <nav {...landmarkProps} ref={ref}>
 *       {props.children}
 *     </nav>
 *   );
 * }
 * ```
 */
export function createLandmark<T extends HTMLElement = HTMLElement>(
  props: MaybeAccessor<AriaLandmarkProps>,
  ref: Accessor<T | undefined>,
): LandmarkAria<T> {
  // Register with the landmark manager
  createEffect(() => {
    const element = ref();
    if (!element) return;

    const p = access(props);
    const entry: LandmarkEntry = {
      ref: element,
      role: p.role,
      label: p["aria-label"],
      focus: p.focus,
    };

    const manager = getLandmarkManager();
    manager.register(entry);

    onCleanup(() => {
      manager.unregister(element);
    });
  });

  const getLandmarkProps = (): JSX.HTMLAttributes<T> => {
    const p = access(props);
    const domProps = filterDOMProps(p as unknown as Record<string, unknown>, { labelable: true });

    return {
      ...domProps,
      role: p.role,
    };
  };

  return {
    get landmarkProps() {
      return getLandmarkProps();
    },
  };
}

/**
 * Returns a controller for programmatic landmark navigation.
 *
 * @example
 * ```tsx
 * const controller = getLandmarkController();
 * controller.focusMain(); // Focus the main landmark
 * controller.focusNext(); // Focus the next landmark
 * ```
 */
export function getLandmarkController(): LandmarkController {
  return getLandmarkManager().getController();
}
