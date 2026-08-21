/**
 * createLongPress - Handles long press interactions across mouse and touch.
 *
 * Port of @react-aria/interactions useLongPress, adapted for SolidJS.
 */

import { JSX, onCleanup } from "solid-js";
import { createPress, type PressEvent } from "./createPress";
import { mergeProps, focusWithoutScrolling, createGlobalListeners } from "../utils";
import { createDescription } from "../utils/createDescription";
import { access, type MaybeAccessor } from "../utils/reactivity";

export interface LongPressEvent {
  /** The type of long press event being fired. */
  type: "longpressstart" | "longpressend" | "longpress";
  /** The pointer type that triggered the long press. */
  pointerType: PressEvent["pointerType"];
  /** The target element of the long press event. */
  target: Element;
  /** Whether the shift keyboard modifier was held during the long press event. */
  shiftKey: boolean;
  /** Whether the ctrl keyboard modifier was held during the long press event. */
  ctrlKey: boolean;
  /** Whether the meta keyboard modifier was held during the long press event. */
  metaKey: boolean;
  /** Whether the alt keyboard modifier was held during the long press event. */
  altKey: boolean;
  /** X position relative to the target. */
  x: number;
  /** Y position relative to the target. */
  y: number;
}

export interface LongPressProps {
  /** Whether long press events should be disabled. */
  isDisabled?: MaybeAccessor<boolean>;
  /** Handler that is called when a long press interaction starts. */
  onLongPressStart?: (e: LongPressEvent) => void;
  /**
   * Handler that is called when a long press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onLongPressEnd?: (e: LongPressEvent) => void;
  /**
   * Handler that is called when the threshold time is met while
   * the press is over the target.
   */
  onLongPress?: (e: LongPressEvent) => void;
  /**
   * The amount of time in milliseconds to wait before triggering a long press.
   * @default 500ms
   */
  threshold?: number;
  /**
   * A description for assistive technology users indicating that a long press
   * action is available, e.g. "Long press to open menu".
   */
  accessibilityDescription?: MaybeAccessor<string | undefined>;
}

export interface LongPressResult {
  /** Props to spread on the target element. */
  longPressProps: JSX.HTMLAttributes<HTMLElement>;
}

const DEFAULT_THRESHOLD = 500;

function isDisabledValue(isDisabled: MaybeAccessor<boolean> | undefined): boolean {
  return typeof isDisabled === "function" ? isDisabled() : !!isDisabled;
}

function createLongPressEvent(type: LongPressEvent["type"], e: PressEvent): LongPressEvent {
  return {
    type,
    pointerType: e.pointerType,
    target: e.target,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
    x: e.x,
    y: e.y,
  };
}

/**
 * Handles long press interactions across mouse and touch devices.
 */
export function createLongPress(props: LongPressProps = {}): LongPressResult {
  const {
    isDisabled,
    onLongPressStart,
    onLongPressEnd,
    onLongPress,
    threshold = DEFAULT_THRESHOLD,
    accessibilityDescription,
  } = props;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const { addGlobalListener } = createGlobalListeners();

  const { pressProps } = createPress({
    isDisabled,
    onPressStart(e) {
      e.continuePropagation();
      if (e.pointerType === "mouse" || e.pointerType === "touch") {
        onLongPressStart?.(createLongPressEvent("longpressstart", e));

        timeoutId = setTimeout(() => {
          // Prevent other press handlers from also handling this event.
          e.target.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));

          // Ensure target is focused. On touch devices, browsers typically focus on pointer up.
          if (document.activeElement !== e.target) {
            focusWithoutScrolling(e.target as HTMLElement);
          }

          onLongPress?.(createLongPressEvent("longpress", e));
          timeoutId = undefined;
        }, threshold);

        if (e.pointerType === "touch") {
          const onContextMenu = (event: Event) => {
            event.preventDefault();
          };
          const target = e.target as HTMLElement;
          target.addEventListener("contextmenu", onContextMenu, { once: true });

          addGlobalListener(
            "pointerup",
            () => {
              setTimeout(() => {
                target.removeEventListener("contextmenu", onContextMenu);
              }, 30);
            },
            { isWindow: true, once: true },
          );
        }
      }
    },
    onPressEnd(e) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      if (onLongPressEnd && (e.pointerType === "mouse" || e.pointerType === "touch")) {
        onLongPressEnd(createLongPressEvent("longpressend", e));
      }
    },
  });

  const descriptionProps = createDescription(() =>
    onLongPress && !isDisabledValue(isDisabled) ? access(accessibilityDescription) : undefined,
  );

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  });

  const longPressProps = mergeProps(pressProps) as JSX.HTMLAttributes<HTMLElement>;
  Object.defineProperty(longPressProps, "aria-describedby", {
    get: () => descriptionProps["aria-describedby"],
    enumerable: true,
    configurable: true,
  });

  return {
    longPressProps,
  };
}
