/**
 * Pointer event utilities for testing
 *
 * Provides helpers for creating and simulating pointer events
 * in tests, compatible with userEvent's pointerMap.
 */

import { fireEvent } from "@solidjs/testing-library";
import { flush } from "solid-js";

/**
 * Pointer map entry for userEvent configuration
 */
export interface PointerMapEntry {
  name: string;
  pointerType: "mouse" | "touch" | "pen";
  button?: "primary" | "secondary" | "auxiliary";
  height?: number;
  width?: number;
  pressure?: number;
}

/**
 * Standard pointer map for userEvent setup.
 * Includes mouse, touch, and pen pointer types.
 */
export const pointerMap: PointerMapEntry[] = [
  {
    name: "MouseLeft",
    pointerType: "mouse",
    button: "primary",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
  {
    name: "MouseRight",
    pointerType: "mouse",
    button: "secondary",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
  {
    name: "MouseMiddle",
    pointerType: "mouse",
    button: "auxiliary",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
  {
    name: "TouchA",
    pointerType: "touch",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
  {
    name: "TouchB",
    pointerType: "touch",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
  {
    name: "PenA",
    pointerType: "pen",
    height: 1,
    width: 1,
    pressure: 0.5,
  },
];

/**
 * Options for creating pointer events
 */
export interface PointerEventOptions extends Partial<PointerEventInit> {
  /** Pointer type (mouse, touch, pen) */
  pointerType?: "mouse" | "touch" | "pen";
  /** Unique pointer ID */
  pointerId?: number;
  /** Whether this is the primary pointer */
  isPrimary?: boolean;
  /** Client X coordinate */
  clientX?: number;
  /** Client Y coordinate */
  clientY?: number;
  /** Button number (0=left, 1=middle, 2=right) */
  button?: number;
  /** Bitmask of currently pressed buttons */
  buttons?: number;
  /** Contact width */
  width?: number;
  /** Contact height */
  height?: number;
  /** Pressure (0-1) */
  pressure?: number;
  /** Tilt X angle (-90 to 90) */
  tiltX?: number;
  /** Tilt Y angle (-90 to 90) */
  tiltY?: number;
  /** Twist angle (0-359) */
  twist?: number;
}

/**
 * Create a PointerEvent with sensible defaults for testing.
 *
 * @example
 * ```ts
 * const event = createPointerEvent('pointerdown', {
 *   pointerType: 'mouse',
 *   pointerId: 1,
 *   clientX: 100,
 *   clientY: 100,
 * });
 * fireEvent(element, event);
 * ```
 */
export function createPointerEvent(type: string, options: PointerEventOptions = {}): PointerEvent {
  const {
    pointerType = "mouse",
    pointerId = 1,
    isPrimary = true,
    clientX = 0,
    clientY = 0,
    button = 0,
    buttons = type.includes("down") ? 1 : 0,
    width = 1,
    height = 1,
    pressure = type.includes("down") || type.includes("move") ? 0.5 : 0,
    tiltX = 0,
    tiltY = 0,
    twist = 0,
    ...rest
  } = options;

  // Note: pageX/pageY are read-only computed properties based on clientX/clientY + scroll
  // They cannot be set via PointerEventInit, but will be correctly computed by the browser
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    pointerType,
    pointerId,
    isPrimary,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    button,
    buttons,
    width,
    height,
    pressure,
    tiltX,
    tiltY,
    twist,
    ...rest,
  });
}

/**
 * Shorthand for creating pointer events.
 * Alias for createPointerEvent for backwards compatibility.
 */
export const pointerEvent = createPointerEvent;

/**
 * Create a sequence of pointer events for a complete press action.
 *
 * @example
 * ```ts
 * const events = createPressSequence(element, { pointerType: 'mouse' });
 * events.forEach(evt => fireEvent(element, evt));
 * ```
 */
export function createPressSequence(
  target: Element,
  options: PointerEventOptions = {},
): PointerEvent[] {
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const baseOptions = {
    clientX: centerX,
    clientY: centerY,
    ...options,
  };

  return [
    createPointerEvent("pointerdown", { ...baseOptions, buttons: 1 }),
    createPointerEvent("pointerup", { ...baseOptions, buttons: 0 }),
  ];
}

/**
 * Fire a pointerdown event on a target with defaults.
 */
export function firePointerDown(target: Element, options: PointerEventOptions = {}): void {
  fireEvent(target, createPointerEvent("pointerdown", options));
  flush();
}

/**
 * Fire a pointerup event on a target with defaults.
 */
export function firePointerUp(target: Element, options: PointerEventOptions = {}): void {
  fireEvent(target, createPointerEvent("pointerup", { buttons: 0, ...options }));
  flush();
}

/**
 * Fire a full pointer click sequence (down, up, click).
 */
export function firePointerClick(target: Element, options: PointerEventOptions = {}): void {
  firePointerDown(target, options);
  firePointerUp(target, options);
  fireEvent.click(target, { detail: 1 });
  flush();
}

/**
 * Create a sequence of pointer events for a hover action.
 */
export function createHoverSequence(
  target: Element,
  options: PointerEventOptions = {},
): PointerEvent[] {
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const baseOptions = {
    pointerType: "mouse" as const,
    clientX: centerX,
    clientY: centerY,
    ...options,
  };

  return [
    createPointerEvent("pointerenter", baseOptions),
    createPointerEvent("pointerover", baseOptions),
    createPointerEvent("pointermove", baseOptions),
  ];
}

/**
 * Create pointer events for leaving an element.
 */
export function createLeaveSequence(
  target: Element,
  options: PointerEventOptions = {},
): PointerEvent[] {
  const baseOptions = {
    pointerType: "mouse" as const,
    ...options,
  };

  return [
    createPointerEvent("pointerout", baseOptions),
    createPointerEvent("pointerleave", baseOptions),
  ];
}

/**
 * Properties required to create a mock Touch object for testing.
 * This mirrors the Touch interface but allows construction.
 */
interface MockTouchInit {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;
}

/**
 * Create a mock Touch object for testing.
 * Touch objects are normally only created by the browser, so we need
 * to create a mock that satisfies the interface for testing purposes.
 */
function createMockTouch(init: MockTouchInit): Touch {
  // Create a frozen object that implements all Touch properties as readonly
  const mockTouch: Touch = Object.freeze({
    identifier: init.identifier,
    target: init.target,
    clientX: init.clientX,
    clientY: init.clientY,
    screenX: init.screenX,
    screenY: init.screenY,
    pageX: init.pageX,
    pageY: init.pageY,
    radiusX: init.radiusX,
    radiusY: init.radiusY,
    rotationAngle: init.rotationAngle,
    force: init.force,
  });
  return mockTouch;
}

/**
 * Create touch events for testing touch interactions.
 */
export function createTouchEvent(
  type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
  options: {
    identifier?: number;
    clientX?: number;
    clientY?: number;
    target?: EventTarget;
  } = {},
): TouchEvent {
  const { identifier = 0, clientX = 0, clientY = 0, target } = options;

  const touch = createMockTouch({
    identifier,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    pageX: clientX,
    pageY: clientY,
    target: target || document.body,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 0.5,
  });

  const isEnd = type === "touchend" || type === "touchcancel";

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    touches: isEnd ? [] : [touch],
    targetTouches: isEnd ? [] : [touch],
    changedTouches: [touch],
  });
}
