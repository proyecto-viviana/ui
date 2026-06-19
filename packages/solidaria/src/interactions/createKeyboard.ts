/**
 * createKeyboard - Handles keyboard interactions for a focusable element.
 *
 * This is a 1-1 port of React-Aria's useKeyboard hook adapted for SolidJS.
 */

import { JSX } from "solid-js";

/**
 * Keyboard event with continuePropagation support.
 * By default, keyboard events stop propagation.
 */
export interface KeyboardEvent extends globalThis.KeyboardEvent {
  /** Call this to allow the event to propagate to parent elements. */
  continuePropagation(): void;
}

export interface KeyboardEvents {
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void;
}

export interface CreateKeyboardProps extends KeyboardEvents {
  /** Whether the keyboard events should be disabled. */
  isDisabled?: boolean;
}

export interface KeyboardResult {
  /** Props to spread onto the target element. */
  keyboardProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Wraps a keyboard event handler to make stopPropagation the default,
 * and support continuePropagation instead.
 */
function createEventHandler<T extends globalThis.KeyboardEvent>(
  handler?: (e: KeyboardEvent) => void,
): ((e: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  return (e: T) => {
    let shouldStopPropagation = true;

    // A nested createEventHandler may already have installed continuePropagation
    // on this event; capture it so continuing here continues on the wrapper too.
    const parentContinuePropagation = (e as { continuePropagation?: () => void })
      .continuePropagation;

    // Create a wrapped event with continuePropagation
    const event = Object.assign(e, {
      continuePropagation() {
        shouldStopPropagation = false;
        // Nested createEventHandler might have set continuePropagation, so we
        // should continue propagation on the wrappers too.
        if (typeof parentContinuePropagation === "function") {
          parentContinuePropagation.call(e);
        }
      },
    }) as KeyboardEvent;

    handler(event);

    if (shouldStopPropagation) {
      e.stopPropagation();
    }
  };
}

/**
 * Handles keyboard interactions for a focusable element.
 *
 * Based on react-aria's useKeyboard but adapted for SolidJS.
 */
export function createKeyboard(props: CreateKeyboardProps = {}): KeyboardResult {
  if (props.isDisabled) {
    return {
      keyboardProps: {},
    };
  }

  return {
    keyboardProps: {
      onKeyDown: createEventHandler(props.onKeyDown),
      onKeyUp: createEventHandler(props.onKeyUp),
    },
  };
}
