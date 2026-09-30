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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useLongPress.ts

/**
 * createLongPress - Handles long press interactions across mouse and touch.
 *
 * Port of @react-aria/interactions useLongPress, adapted for SolidJS.
 */

import { mergeProps, focusWithoutScrolling, createGlobalListeners, onOwnedCleanup } from "../utils";
import type { JSX } from "@solidjs/web";
import { createPress, type PressEvent } from "./createPress";
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
  /** Which pointer type to listen for. By default, both mouse and touch are listened for. */
  pointerType?: "mouse" | "touch";
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
    pointerType,
    onLongPressStart,
    onLongPressEnd,
    onLongPress,
    threshold = DEFAULT_THRESHOLD,
  } = props;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let followupTimer: ReturnType<typeof setTimeout> | undefined;
  let clickListener: ((event: Event) => void) | undefined;
  let contextMenuListener: ((event: Event) => void) | undefined;
  let followupTarget: EventTarget | undefined;
  const { addGlobalListener } = createGlobalListeners();

  const removeFollowupListeners = () => {
    if (followupTarget && clickListener) {
      followupTarget.removeEventListener("click", clickListener);
    }
    if (followupTarget && contextMenuListener) {
      followupTarget.removeEventListener("contextmenu", contextMenuListener);
    }
    clickListener = undefined;
    contextMenuListener = undefined;
    followupTarget = undefined;
  };
  const isAcceptedPointerType = (e: PressEvent) =>
    pointerType
      ? e.pointerType === pointerType
      : e.pointerType === "mouse" || e.pointerType === "touch";

  const { pressProps } = createPress({
    isDisabled,
    onPressStart(e) {
      e.continuePropagation();
      if (isAcceptedPointerType(e)) {
        onLongPressStart?.(createLongPressEvent("longpressstart", e));

        followupTarget = e.target;
        timeoutId = setTimeout(() => {
          // Prevent other press handlers from also handling this event.
          e.target.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }));

          // The click that follows a long press must not activate a link or button.
          clickListener = (event: Event) => {
            event.preventDefault();
          };
          e.target.addEventListener("click", clickListener, { once: true });

          // Ensure target is focused. On touch devices, browsers typically focus on pointer up.
          if (document.activeElement !== e.target) {
            focusWithoutScrolling(e.target as HTMLElement);
          }

          onLongPress?.(createLongPressEvent("longpress", e));
          timeoutId = undefined;
        }, threshold);

        // A long press on touch can open the context menu.
        if (e.pointerType === "touch") {
          contextMenuListener = (event: Event) => {
            event.preventDefault();
          };
          e.target.addEventListener("contextmenu", contextMenuListener, { once: true });
        }

        addGlobalListener(
          "pointerup",
          () => {
            // Drop the guards if the click or context menu never arrives.
            followupTimer = setTimeout(() => {
              removeFollowupListeners();
              followupTimer = undefined;
            }, 100);
          },
          { isWindow: true, once: true },
        );
      }
    },
    onPressEnd(e) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      if (onLongPressEnd && isAcceptedPointerType(e)) {
        onLongPressEnd(createLongPressEvent("longpressend", e));
      }
    },
  });

  const descriptionProps = createDescription(() =>
    onLongPress && !isDisabledValue(props.isDisabled)
      ? access(props.accessibilityDescription)
      : undefined,
  );

  onOwnedCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (followupTimer) {
      clearTimeout(followupTimer);
      followupTimer = undefined;
    }
    removeFollowupListeners();
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
