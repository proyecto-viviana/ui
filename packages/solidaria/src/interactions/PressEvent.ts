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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/usePress.ts

/**
 * PressEvent class that matches React-Aria's PressEvent interface.
 * Wraps native events with press-specific data.
 */

export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";
export type PressEventType = "pressstart" | "pressend" | "pressup" | "press";

/**
 * Minimal event data needed to create a PressEvent.
 * Allows both native Event objects and synthetic event-like objects.
 */
export interface PressEventSource {
  currentTarget?: EventTarget | null;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  clientX?: number;
  clientY?: number;
  /**
   * The key that triggered the event, present on keyboard interactions
   * (the native `KeyboardEvent` is passed through unchanged).
   */
  key?: string;
}

export interface IPressEvent {
  /** The type of press event being fired. */
  type: PressEventType;
  /** The pointer type that triggered the press event. */
  pointerType: PointerType;
  /** The target element of the press event. */
  target: Element;
  /** Whether the shift keyboard modifier was held during the press event. */
  shiftKey: boolean;
  /** Whether the ctrl keyboard modifier was held during the press event. */
  ctrlKey: boolean;
  /** Whether the meta keyboard modifier was held during the press event. */
  metaKey: boolean;
  /** Whether the alt keyboard modifier was held during the press event. */
  altKey: boolean;
  /** X position of the press relative to the target element. */
  x: number;
  /** Y position of the press relative to the target element. */
  y: number;
  /**
   * The key that triggered the press event, if it was triggered by a keyboard
   * interaction. Useful for differentiating between Space and Enter key presses.
   */
  key?: string;
  /**
   * By default, press events stop propagation to parent elements.
   * Call continuePropagation() to allow the event to bubble up.
   */
  continuePropagation(): void;
}

/**
 * PressEvent class that provides all press event data.
 * Ported from packages/react-aria/src/interactions/usePress.ts.
 * createPressEvent is a local adapter around the ported PressEvent class.
 */
export class PressEvent implements IPressEvent {
  type: PressEventType;
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  x: number;
  y: number;
  key?: string;

  #shouldStopPropagation = true;

  constructor(
    type: PressEventType,
    pointerType: PointerType,
    originalEvent: PressEventSource | null,
    target: Element | null,
  ) {
    this.type = type;
    this.pointerType = pointerType;
    const eventTarget = target ?? (originalEvent?.currentTarget as Element | undefined);
    this.target = eventTarget as Element;

    // Extract modifier keys from the original event
    this.shiftKey = originalEvent?.shiftKey ?? false;
    this.ctrlKey = originalEvent?.ctrlKey ?? false;
    this.metaKey = originalEvent?.metaKey ?? false;
    this.altKey = originalEvent?.altKey ?? false;
    // Present only for keyboard interactions (the native KeyboardEvent carries
    // `key`); pointer events leave this undefined, matching upstream.
    this.key = originalEvent?.key;

    // Calculate position relative to target
    this.x = 0;
    this.y = 0;

    if (originalEvent && originalEvent.clientX !== undefined && eventTarget) {
      const rect = eventTarget.getBoundingClientRect();
      this.x = originalEvent.clientX - rect.left;
      this.y = (originalEvent.clientY ?? 0) - rect.top;
    } else if (eventTarget) {
      // For keyboard events, use center of element
      const rect = eventTarget.getBoundingClientRect();
      this.x = rect.width / 2;
      this.y = rect.height / 2;
    }
  }

  /**
   * Call this to allow the press event to propagate to parent elements.
   * By default, press events stop propagation.
   */
  continuePropagation(): void {
    this.#shouldStopPropagation = false;
  }

  /**
   * Whether the event should stop propagation.
   * Used internally by the press handler.
   */
  get shouldStopPropagation(): boolean {
    return this.#shouldStopPropagation;
  }
}

/**
 * Creates a PressEvent from a native event or event-like source.
 */
export function createPressEvent(
  type: PressEventType,
  pointerType: PointerType,
  originalEvent: PressEventSource | null,
  target: Element | null,
): PressEvent {
  return new PressEvent(type, pointerType, originalEvent, target);
}
