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

import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createSignal, createTrackedEffect } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { isDevEnv } from "../utils/env";
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
  focusNext: (opts?: { from?: Element | null }) => boolean | void;
  /** Focus the previous landmark in DOM order. */
  focusPrevious: (opts?: { from?: Element | null }) => boolean | void;
  /** Focus the main landmark. */
  focusMain: () => boolean | void;
  /** Navigate to a specific landmark by role or direction. */
  navigate: (
    roleOrDirection: AriaLandmarkRole | "forward" | "backward",
    opts?: { from?: Element | null },
  ) => boolean | void;
  /** Dispose the controller (if created via createLandmarkController). */
  dispose?: () => void;
}

export interface LandmarkEntry {
  ref: Accessor<HTMLElement | undefined> | { current: HTMLElement | null } | HTMLElement;
  role: AriaLandmarkRole;
  label?: string;
  focus?: (direction?: "forward" | "backward") => void;
  blur?: () => void;
  lastFocused?: HTMLElement;
}

function getLandmarkElement(
  entry: LandmarkEntry | { ref: LandmarkEntry["ref"] } | null | undefined,
): HTMLElement | null {
  if (!entry) return null;
  const r = entry.ref;
  if (typeof r === "function") {
    return r() ?? null;
  }
  if (r && typeof r === "object" && "current" in r) {
    return r.current ?? null;
  }
  if (r instanceof HTMLElement) {
    return r;
  }
  return null;
}

/**
 * Manages all registered landmarks and handles F6 keyboard navigation.
 */
export class LandmarkManager {
  private landmarks: LandmarkEntry[] = [];
  private isListening = false;
  private refCount = 0;
  readonly version = 1;

  constructor() {
    this.f6Handler = this.f6Handler.bind(this);
    this.focusinHandler = this.focusinHandler.bind(this);
    this.focusoutHandler = this.focusoutHandler.bind(this);
  }

  setupIfNeeded(): void {
    if (this.isListening || typeof document === "undefined") return;
    document.addEventListener("keydown", this.f6Handler, { capture: true });
    document.addEventListener("focusin", this.focusinHandler, { capture: true });
    document.addEventListener("focusout", this.focusoutHandler, { capture: true });
    this.isListening = true;
  }

  teardownIfNeeded(): void {
    if (
      !this.isListening ||
      this.landmarks.length > 0 ||
      this.refCount > 0 ||
      typeof document === "undefined"
    ) {
      return;
    }
    document.removeEventListener("keydown", this.f6Handler, { capture: true });
    document.removeEventListener("focusin", this.focusinHandler, { capture: true });
    document.removeEventListener("focusout", this.focusoutHandler, { capture: true });
    this.isListening = false;
  }

  addLandmark(newLandmark: LandmarkEntry): void {
    this.setupIfNeeded();
    const newElement = getLandmarkElement(newLandmark);
    if (!newElement) return;

    if (this.landmarks.some((landmark) => getLandmarkElement(landmark) === newElement)) {
      return;
    }

    if (
      isDevEnv() &&
      newLandmark.role === "main" &&
      this.landmarks.filter((landmark) => landmark.role === "main").length > 0
    ) {
      console.error('Page can contain no more than one landmark with the role "main".');
    }

    if (this.landmarks.length === 0) {
      this.landmarks = [newLandmark];
      this.checkLabels(newLandmark.role);
      return;
    }

    let start = 0;
    let end = this.landmarks.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const midElement = getLandmarkElement(this.landmarks[mid]);
      if (!midElement) break;
      const comparedPosition = newElement.compareDocumentPosition(midElement);
      const isNewAfterExisting = Boolean(
        comparedPosition & Node.DOCUMENT_POSITION_PRECEDING ||
        comparedPosition & Node.DOCUMENT_POSITION_CONTAINS,
      );
      if (isNewAfterExisting) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    this.landmarks.splice(start, 0, newLandmark);
    this.checkLabels(newLandmark.role);
  }

  updateLandmark(landmark: Partial<LandmarkEntry> & { ref: LandmarkEntry["ref"] }): void {
    const targetElement = getLandmarkElement(landmark as LandmarkEntry);
    const index = this.landmarks.findIndex((l) => {
      if (l.ref === landmark.ref) return true;
      const el = getLandmarkElement(l);
      return el && targetElement && el === targetElement;
    });
    if (index >= 0) {
      this.landmarks[index] = {
        ...this.landmarks[index],
        ...landmark,
      };
      this.checkLabels(this.landmarks[index].role);
    }
  }

  removeLandmark(ref: LandmarkEntry["ref"]): void {
    const targetElement =
      typeof ref === "function" || (typeof ref === "object" && ref !== null)
        ? getLandmarkElement({ ref } as LandmarkEntry)
        : null;

    this.landmarks = this.landmarks.filter((landmark) => {
      if (landmark.ref === ref) return false;
      if (targetElement) {
        const el = getLandmarkElement(landmark);
        if (el === targetElement) return false;
      }
      return true;
    });

    this.teardownIfNeeded();
  }

  registerLandmark(landmark: LandmarkEntry): () => void {
    const targetElement = getLandmarkElement(landmark);
    const existing = this.landmarks.find((l) => {
      if (l.ref === landmark.ref) return true;
      const el = getLandmarkElement(l);
      return el && targetElement && el === targetElement;
    });

    if (existing) {
      this.updateLandmark(landmark);
    } else {
      this.addLandmark(landmark);
    }

    return () => this.removeLandmark(landmark.ref);
  }

  register(entry: LandmarkEntry): void {
    this.addLandmark(entry);
  }

  unregister(ref: HTMLElement | LandmarkEntry["ref"]): void {
    this.removeLandmark(ref as any);
  }

  checkLabels(role: AriaLandmarkRole): void {
    const landmarksWithRole = this.getLandmarksByRole(role);
    if (landmarksWithRole.size > 1) {
      const duplicatesWithoutLabel = [...landmarksWithRole].filter((l) => !l.label);
      if (duplicatesWithoutLabel.length > 0 && isDevEnv()) {
        console.warn(
          `Multiple landmarks with role "${role}" exist. Each should have a unique aria-label or aria-labelledby.`,
        );
      } else if (isDevEnv()) {
        const labels = [...landmarksWithRole].map((l) => l.label);
        const duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);
        if (duplicateLabels.length > 0) {
          duplicateLabels.forEach((label) => {
            console.warn(
              `Multiple landmarks with role "${role}" and label "${label}" exist. Each should have a unique aria-label or aria-labelledby.`,
            );
          });
        }
      }
    }
  }

  closestLandmark(element: Element | null): LandmarkEntry | undefined {
    if (!element || typeof document === "undefined") return undefined;
    const landmarkMap = new Map<HTMLElement, LandmarkEntry>();
    for (const l of this.landmarks) {
      const el = getLandmarkElement(l);
      if (el) landmarkMap.set(el, l);
    }

    let currentElement: Element | null = element;
    while (
      currentElement &&
      !landmarkMap.has(currentElement as HTMLElement) &&
      currentElement !== document.body &&
      currentElement.parentElement
    ) {
      currentElement = currentElement.parentElement;
    }

    return currentElement ? landmarkMap.get(currentElement as HTMLElement) : undefined;
  }

  getNextLandmark(
    element: Element | null,
    { backward }: { backward?: boolean } = {},
  ): LandmarkEntry | undefined {
    if (this.landmarks.length === 0) return undefined;
    const currentLandmark = this.closestLandmark(element);
    let nextLandmarkIndex = backward ? this.landmarks.length - 1 : 0;
    if (currentLandmark) {
      nextLandmarkIndex = this.landmarks.indexOf(currentLandmark) + (backward ? -1 : 1);
    }

    const wrapIfNeeded = () => {
      if (nextLandmarkIndex < 0) {
        if (
          element &&
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              detail: { direction: "backward" },
              bubbles: true,
              cancelable: true,
            }),
          )
        ) {
          return true;
        }
        nextLandmarkIndex = this.landmarks.length - 1;
      } else if (nextLandmarkIndex >= this.landmarks.length) {
        if (
          element &&
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              detail: { direction: "forward" },
              bubbles: true,
              cancelable: true,
            }),
          )
        ) {
          return true;
        }
        nextLandmarkIndex = 0;
      }
      return nextLandmarkIndex < 0 || nextLandmarkIndex >= this.landmarks.length;
    };

    if (wrapIfNeeded()) return undefined;

    const startIndex = nextLandmarkIndex;
    while (getLandmarkElement(this.landmarks[nextLandmarkIndex])?.closest('[aria-hidden="true"]')) {
      nextLandmarkIndex += backward ? -1 : 1;
      if (wrapIfNeeded()) return undefined;
      if (nextLandmarkIndex === startIndex) break;
    }

    return this.landmarks[nextLandmarkIndex];
  }

  f6Handler(e: KeyboardEvent): void {
    if (e.key === "F6") {
      let target: Element | null = e.target instanceof Element ? e.target : null;
      if (
        !target ||
        (typeof document !== "undefined" &&
          (target === document.body || (e.target as unknown) === document))
      ) {
        if (
          typeof document !== "undefined" &&
          document.activeElement &&
          document.activeElement !== document.body
        ) {
          target = document.activeElement;
        }
      }
      const handled = e.altKey ? this.focusMain() : this.navigate(target, e.shiftKey);
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  focusMain(): boolean {
    const main = this.getLandmarkByRole("main");
    if (main) {
      const el = getLandmarkElement(main);
      if (el && el.isConnected) {
        this.focusLandmark(el, "forward");
        return true;
      }
    }
    return false;
  }

  navigate(from: Element | null, backward: boolean): boolean {
    const nextLandmark = this.getNextLandmark(from, { backward });
    if (!nextLandmark) return false;

    if (nextLandmark.lastFocused) {
      const lastFocused = nextLandmark.lastFocused;
      if (typeof document !== "undefined" && document.body.contains(lastFocused)) {
        lastFocused.focus();
        return true;
      }
    }

    const el = getLandmarkElement(nextLandmark);
    if (el && el.isConnected) {
      this.focusLandmark(el, backward ? "backward" : "forward");
      return true;
    }

    return false;
  }

  focusinHandler(e: FocusEvent): void {
    const target =
      (e.target as Element | null) ??
      (typeof document !== "undefined" ? document.activeElement : null);
    const currentLandmark = this.closestLandmark(target);
    const currentElement = currentLandmark ? getLandmarkElement(currentLandmark) : null;
    if (currentLandmark && currentElement !== target && target instanceof HTMLElement) {
      this.updateLandmark({
        ref: currentLandmark.ref,
        lastFocused: target,
      });
    }

    const previousFocusedElement = e.relatedTarget as Element | null;
    if (previousFocusedElement) {
      const closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (
        closestPreviousLandmark &&
        getLandmarkElement(closestPreviousLandmark) === previousFocusedElement
      ) {
        closestPreviousLandmark.blur?.();
      }
    }
  }

  focusoutHandler(e: FocusEvent): void {
    const previousFocusedElement =
      (e.target instanceof Element ? e.target : null) ??
      (typeof document !== "undefined" ? document.activeElement : null);
    const nextFocusedElement = e.relatedTarget as EventTarget | null;
    if (
      !nextFocusedElement ||
      (typeof document !== "undefined" && (nextFocusedElement as unknown) === document)
    ) {
      const closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (
        closestPreviousLandmark &&
        getLandmarkElement(closestPreviousLandmark) === previousFocusedElement
      ) {
        closestPreviousLandmark.blur?.();
      }
    }
  }

  focusLandmark(landmark: HTMLElement, direction: "forward" | "backward"): void {
    const entry = this.landmarks.find((l) => getLandmarkElement(l) === landmark);
    entry?.focus?.(direction);
  }

  getLandmarksByRole(role: AriaLandmarkRole): Set<LandmarkEntry> {
    return new Set(this.landmarks.filter((l) => l.role === role));
  }

  getLandmarkByRole(role: AriaLandmarkRole): LandmarkEntry | undefined {
    return this.landmarks.find((l) => l.role === role);
  }

  createLandmarkController(): LandmarkController {
    this.refCount++;
    this.setupIfNeeded();
    let disposed = false;
    return {
      focusNext: (opts?: { from?: Element | null }) => {
        if (disposed) return false;
        const element =
          opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
        return this.navigate(element, false);
      },
      focusPrevious: (opts?: { from?: Element | null }) => {
        if (disposed) return false;
        const element =
          opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
        return this.navigate(element, true);
      },
      focusMain: () => {
        if (disposed) return false;
        return this.focusMain();
      },
      navigate: (
        roleOrDirection: AriaLandmarkRole | "forward" | "backward",
        opts?: { from?: Element | null },
      ) => {
        if (disposed) return false;
        if (roleOrDirection === "backward" || roleOrDirection === "forward") {
          const element =
            opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
          return this.navigate(element, roleOrDirection === "backward");
        }
        const landmark = this.getLandmarkByRole(roleOrDirection);
        if (landmark) {
          const el = getLandmarkElement(landmark);
          if (el && el.isConnected) {
            this.focusLandmark(el, "forward");
            return true;
          }
        }
        return false;
      },
      dispose: () => {
        if (!disposed) {
          disposed = true;
          this.refCount--;
          this.teardownIfNeeded();
        }
      },
    };
  }

  getController(): LandmarkController {
    return {
      focusNext: (opts?: { from?: Element | null }) => {
        const element =
          opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
        return this.navigate(element, false);
      },
      focusPrevious: (opts?: { from?: Element | null }) => {
        const element =
          opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
        return this.navigate(element, true);
      },
      focusMain: () => {
        return this.focusMain();
      },
      navigate: (
        roleOrDirection: AriaLandmarkRole | "forward" | "backward",
        opts?: { from?: Element | null },
      ) => {
        if (roleOrDirection === "backward" || roleOrDirection === "forward") {
          const element =
            opts?.from ?? (typeof document !== "undefined" ? document.activeElement : null);
          return this.navigate(element, roleOrDirection === "backward");
        }
        const landmark = this.getLandmarkByRole(roleOrDirection);
        if (landmark) {
          const el = getLandmarkElement(landmark);
          if (el && el.isConnected) {
            this.focusLandmark(el, "forward");
            return true;
          }
        }
        return false;
      },
    };
  }
}

// Global singleton instance
const LANDMARK_MANAGER_SYMBOL = Symbol.for("solidaria-landmark-manager");

export function getLandmarkManager(): LandmarkManager {
  if (typeof document === "undefined") {
    return new LandmarkManager();
  }
  let instance = (document as any)[LANDMARK_MANAGER_SYMBOL] as LandmarkManager | undefined;
  if (!instance) {
    instance = new LandmarkManager();
    (document as any)[LANDMARK_MANAGER_SYMBOL] = instance;
  }
  return instance;
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
  const [isLandmarkFocused, setIsLandmarkFocused] = createSignal(false);

  const defaultFocus = () => {
    setIsLandmarkFocused(true);
    const element = ref();
    if (element) {
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
      }
      element.focus();
    }
  };

  const blur = () => {
    setIsLandmarkFocused(false);
  };

  createTrackedEffect(() => {
    const element = ref();
    if (!element) return;

    const p = access(props);
    const entry: LandmarkEntry = {
      ref: () => element,
      role: p.role,
      label: p["aria-label"] || p["aria-labelledby"],
      focus: p.focus || defaultFocus,
      blur,
    };

    const manager = getLandmarkManager();
    const unregister = manager.registerLandmark(entry);

    return () => {
      unregister();
    };
  });

  createTrackedEffect(() => {
    if (isLandmarkFocused()) {
      const element = ref();
      if (element && document.activeElement !== element) {
        if (!element.hasAttribute("tabindex")) {
          element.setAttribute("tabindex", "-1");
        }
        element.focus();
      }
    }
  });

  const landmarkProps = {
    get role() {
      return access(props).role;
    },
    get tabIndex() {
      return isLandmarkFocused() ? -1 : undefined;
    },
    get "aria-label"() {
      return access(props)["aria-label"];
    },
    get "aria-labelledby"() {
      return access(props)["aria-labelledby"];
    },
    get id() {
      return access(props).id;
    },
  };

  return {
    landmarkProps: landmarkProps as JSX.HTMLAttributes<T>,
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
