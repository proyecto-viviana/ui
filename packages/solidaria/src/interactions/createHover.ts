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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useHover.ts

/**
 * createHover hook for Solidaria
 *
 * Handles pointer hover interactions for an element. Normalizes behavior
 * across browsers and platforms, and ignores emulated mouse events on touch devices.
 *
 * Port of @react-aria/interactions useHover.
 */

import { createSignal, createEffect, onCleanup, createTrackedEffect } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { isTestEnv } from "../utils/env";
import { createGlobalListeners, nodeContains } from "../utils";

export interface HoverEvent {
  /** The type of hover event being fired. */
  type: "hoverstart" | "hoverend";
  /** The pointer type that triggered the hover event. */
  pointerType: "mouse" | "pen";
  /** The target element of the hover event. */
  target: Element;
}

export interface HoverEvents {
  /** Handler called when the hover starts. */
  onHoverStart?: (e: HoverEvent) => void;
  /** Handler called when the hover ends. */
  onHoverEnd?: (e: HoverEvent) => void;
  /** Handler called when the hover state changes. */
  onHoverChange?: (isHovering: boolean) => void;
}

export interface CreateHoverProps extends HoverEvents {
  /** Whether the hover events should be disabled. */
  isDisabled?: boolean;
}

/** Event handler props returned by createHover - safe to spread on any element */
export type HoverProps = Pick<
  JSX.HTMLAttributes<HTMLElement>,
  | "onPointerEnter"
  | "onPointerLeave"
  | "onPointerOver"
  | "onPointerOut"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onTouchStart"
>;

export interface HoverResult {
  /** Props to spread on the target element. */
  hoverProps: HoverProps;
  /** Whether the element is currently hovered. */
  isHovered: Accessor<boolean>;
}

// iOS fires onPointerEnter twice: once with pointerType="touch" and again with pointerType="mouse".
// We want to ignore these emulated events so they do not trigger hover behavior.
let globalIgnoreEmulatedMouseEvents = false;
let hoverCount = 0;

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}

function handleGlobalPointerEvent(e: PointerEvent) {
  if (e.pointerType === "touch") {
    setGlobalIgnoreEmulatedMouseEvents();
  }
}

function setupGlobalTouchEvents() {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (hoverCount === 0) {
    if (typeof PointerEvent !== "undefined") {
      document.addEventListener("pointerup", handleGlobalPointerEvent);
    } else if (isTestEnv()) {
      document.addEventListener("touchend", setGlobalIgnoreEmulatedMouseEvents);
    }
  }

  hoverCount++;
  return () => {
    hoverCount--;
    if (hoverCount > 0) {
      return;
    }

    if (typeof PointerEvent !== "undefined") {
      document.removeEventListener("pointerup", handleGlobalPointerEvent);
    } else if (isTestEnv()) {
      document.removeEventListener("touchend", setGlobalIgnoreEmulatedMouseEvents);
    }
  };
}

/**
 * Handles pointer hover interactions for an element.
 */
export function createHover(props: MaybeAccessor<CreateHoverProps> = {}): HoverResult {
  const getProps = () => access(props);
  const [isHovered, setIsHovered] = createSignal(false);
  const { addGlobalListener, removeAllGlobalListeners } = createGlobalListeners();

  // Track internal hover state
  let state = {
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: "" as "mouse" | "pen" | "",
    target: null as Element | null,
  };

  // Setup global touch events
  createTrackedEffect(() => {
const _s2Cleanups: Array<() => void> = [];

    const cleanup = setupGlobalTouchEvents();
    _s2Cleanups.push(cleanup);
  
return () => { for (const c of _s2Cleanups) c(); };
});

  // Reset hover when disabled
  createEffect(
    () => !!getProps().isDisabled,
    (isDisabled) => {
      if (isDisabled && state.isHovered) {
        triggerHoverEnd(state.target as Element, state.pointerType as "mouse" | "pen");
      }
    },
  );

  function triggerHoverStart(
    target: Element,
    pointerType: "mouse" | "pen",
    eventTarget: Element | null,
  ) {
    const p = getProps();
    state.pointerType = pointerType;

    const isOverTarget = eventTarget instanceof Element ? target.contains(eventTarget) : true;
    if (p.isDisabled || state.isHovered || !isOverTarget) {
      return;
    }

    state.isHovered = true;
    state.target = target;

    addGlobalListener(
      "pointerover",
      (event: PointerEvent) => {
        if (
          state.isHovered &&
          state.target &&
          !nodeContains(state.target, event.target as Element)
        ) {
          triggerHoverEnd(event.target as Element, event.pointerType as "mouse" | "pen");
        }
      },
      { capture: true },
    );

    p.onHoverStart?.({
      type: "hoverstart",
      target,
      pointerType,
    });

    p.onHoverChange?.(true);
    setIsHovered(true);
  }

  function triggerHoverEnd(target: Element | null, pointerType: "mouse" | "pen") {
    const p = getProps();
    state.pointerType = "";
    state.target = null;

    if (!state.isHovered || !target) {
      return;
    }

    state.isHovered = false;
    removeAllGlobalListeners();

    p.onHoverEnd?.({
      type: "hoverend",
      target,
      pointerType,
    });

    p.onHoverChange?.(false);
    setIsHovered(false);
  }

  // Handlers read getProps() live; do not wrap this object in a memo/getter.
  // A getter that reads the memo on destructure (`const { hoverProps } = createHover()`)
  // is STRICT_READ_UNTRACKED inside HMR's untrack(component, "<Name>").
  const hoverProps: HoverProps =
    typeof PointerEvent !== "undefined"
      ? {
          onPointerEnter: (e: PointerEvent) => {
            if (globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse") {
              return;
            }
            if (e.pointerType === "touch") {
              return;
            }
            triggerHoverStart(
              e.currentTarget as Element,
              e.pointerType as "mouse" | "pen",
              e.target as Element,
            );
          },
          onPointerLeave: (e: PointerEvent) => {
            const p = getProps();
            if (!p.isDisabled && (e.currentTarget as Element).contains(e.target as Element)) {
              triggerHoverEnd(e.currentTarget as Element, e.pointerType as "mouse" | "pen");
            }
          },
          onPointerOver: (e: PointerEvent) => {
            if (globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse") {
              return;
            }
            if (e.pointerType === "touch") {
              return;
            }
            triggerHoverStart(
              e.currentTarget as Element,
              e.pointerType as "mouse" | "pen",
              e.target as Element,
            );
          },
          onPointerOut: (e: PointerEvent) => {
            const p = getProps();
            if (!p.isDisabled && (e.currentTarget as Element).contains(e.target as Element)) {
              triggerHoverEnd(e.currentTarget as Element, e.pointerType as "mouse" | "pen");
            }
          },
        }
      : {
          onTouchStart: () => {
            state.ignoreEmulatedMouseEvents = true;
          },
          onMouseEnter: (e: MouseEvent) => {
            if (!state.ignoreEmulatedMouseEvents && !globalIgnoreEmulatedMouseEvents) {
              triggerHoverStart(e.currentTarget as Element, "mouse", e.target as Element);
            }
            state.ignoreEmulatedMouseEvents = false;
          },
          onMouseLeave: (e: MouseEvent) => {
            const p = getProps();
            if (!p.isDisabled && (e.currentTarget as Element).contains(e.target as Element)) {
              triggerHoverEnd(e.currentTarget as Element, "mouse");
            }
          },
        };

  return {
    hoverProps,
    isHovered,
  };
}
