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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/overlays/usePopover.ts

/**
 * Provides the behavior and accessibility implementation for a popover component.
 * A popover is an overlay element positioned relative to a trigger.
 *
 * Ported from @react-aria/overlays usePopover.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import { createOverlay } from "../overlays/createOverlay";
import {
  createOverlayPosition,
  type AriaPositionProps,
  type PlacementAxis,
} from "./createOverlayPosition";
import { createPreventScroll } from "../overlays/createPreventScroll";
import { ariaHideOutside, keepVisible } from "../overlays/ariaHideOutside";
import { mergeProps } from "../utils/mergeProps";

export interface OverlayTriggerState {
  /** Whether the overlay is currently open. */
  isOpen: () => boolean;
  /** Opens the overlay. */
  open: () => void;
  /** Closes the overlay. */
  close: () => void;
  /** Toggles the overlay's open state. */
  toggle: () => void;
  /** Cursor position relative to the window viewport. */
  point?: () => { x: number; y: number } | null;
}

export interface AriaPopoverProps extends Omit<
  AriaPositionProps,
  "isOpen" | "onClose" | "targetRef" | "overlayRef"
> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   */
  triggerRef: () => Element | null;
  /**
   * The ref for the popover element.
   */
  popoverRef: () => Element | null;
  /** A ref for the popover arrow element. */
  arrowRef?: () => Element | null;
  /**
   * An optional ref for a group of popovers, e.g. submenus.
   * When provided, this element is used to detect outside interactions
   * and hiding elements from assistive technologies instead of the popoverRef.
   */
  groupRef?: () => Element | null;
  /**
   * Whether the popover is non-modal, i.e. elements outside the popover may be
   * interacted with by assistive technologies.
   *
   * Most popovers should not use this option as it may negatively impact the screen
   * reader experience. Only use with components such as combobox, which are designed
   * to handle this situation carefully.
   */
  isNonModal?: boolean;
  /**
   * Whether pressing the escape key to close the popover should be disabled.
   *
   * Most popovers should not use this option. When set to true, an alternative
   * way to close the popover with a keyboard must be provided.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * When user interacts with the argument element outside of the popover ref,
   * return true if onClose should be called. This gives you a chance to filter
   * out interaction with elements that should not dismiss the popover.
   * By default, onClose will always be called on interaction outside the popover ref.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  /**
   * The type of trigger that opened the popover.
   * Used for submenu detection.
   */
  trigger?: string;
}

export interface PopoverAria {
  /** Props for the popover element. */
  popoverProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the popover tip arrow if any. */
  arrowProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props to apply to the underlay element, if any. */
  underlayProps: JSX.HTMLAttributes<HTMLElement>;
  /** Placement of the popover with respect to the trigger. */
  placement: () => PlacementAxis | null;
  /** The origin of the target in the overlay's coordinate system. Useful for animations. */
  triggerAnchorPoint: () => { x: number; y: number } | null;
}

/**
 * Provides the behavior and accessibility implementation for a popover component.
 * A popover is an overlay element positioned relative to a trigger.
 */
export function createPopover(props: AriaPopoverProps, state: OverlayTriggerState): PopoverAria {
  const triggerRef = () => props.triggerRef();
  const popoverRef = () => props.popoverRef();
  const groupRef = () => props.groupRef?.() ?? null;
  const isNonModal = () => props.isNonModal ?? false;
  const isKeyboardDismissDisabled = () => props.isKeyboardDismissDisabled ?? false;
  const shouldCloseOnInteractOutside = props.shouldCloseOnInteractOutside;
  const isSubmenu = () => props.trigger === "SubmenuTrigger";

  // Overlay behavior (dismiss handling)
  const { overlayProps, underlayProps } = createOverlay(
    {
      get isOpen() {
        return state.isOpen();
      },
      onClose: state.close,
      get shouldCloseOnBlur() {
        return !isSubmenu();
      },
      get isDismissable() {
        return !isNonModal() || isSubmenu();
      },
      get isKeyboardDismissDisabled() {
        return isKeyboardDismissDisabled();
      },
      get shouldCloseOnInteractOutside() {
        return shouldCloseOnInteractOutside;
      },
    },
    () => groupRef() ?? popoverRef(),
  );

  // Overlay positioning
  const {
    overlayProps: positionProps,
    arrowProps,
    placement,
    triggerAnchorPoint,
  } = createOverlayPosition({
    get placement() {
      return props.placement;
    },
    get containerPadding() {
      return props.containerPadding;
    },
    get offset() {
      return props.offset;
    },
    get crossOffset() {
      return props.crossOffset;
    },
    get shouldFlip() {
      return props.shouldFlip;
    },
    get maxHeight() {
      return props.maxHeight;
    },
    get boundaryElement() {
      return props.boundaryElement;
    },
    get arrowSize() {
      return props.arrowSize;
    },
    get arrowBoundaryOffset() {
      return props.arrowBoundaryOffset;
    },
    get shouldUpdatePosition() {
      return props.shouldUpdatePosition;
    },
    get arrowRef() {
      return props.arrowRef;
    },
    get scrollRef() {
      return props.scrollRef;
    },
    targetRef: triggerRef,
    overlayRef: popoverRef,
    get isOpen() {
      return state.isOpen();
    },
    get onClose() {
      return isNonModal() && !isSubmenu() ? state.close : null;
    },
    get getTargetRect() {
      if (props.getTargetRect) {
        return props.getTargetRect;
      }

      const point = state.point?.();
      return point
        ? () => {
            const currentPoint = state.point?.();
            return currentPoint ? new DOMRect(currentPoint.x, currentPoint.y, 0, 0) : null;
          }
        : undefined;
    },
  });

  // Prevent scroll when modal popover is open
  createPreventScroll({
    get isDisabled() {
      return isNonModal() || !state.isOpen();
    },
  });

  // Aria-hide outside elements
  createEffect(() => {
    if (state.isOpen() && popoverRef()) {
      const element = groupRef() ?? popoverRef();
      if (!element) return;

      let cleanup: (() => void) | undefined;

      if (isNonModal()) {
        cleanup = keepVisible(element);
      } else {
        cleanup = ariaHideOutside([element], { shouldUseInert: true });
      }

      onCleanup(() => {
        cleanup?.();
      });
    }
  });

  const merged = mergeProps(overlayProps, positionProps) as Record<string, unknown>;
  const popoverProps = new Proxy(merged, {
    get(target, key: string) {
      if (key === "style") return positionProps.style;
      return target[key];
    },
    has(target, key) {
      return key in target;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, key) {
      if (key === "style") {
        return {
          configurable: true,
          enumerable: true,
          get: () => positionProps.style,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });

  return {
    popoverProps,
    arrowProps,
    underlayProps,
    placement,
    triggerAnchorPoint,
  };
}

export { type PlacementAxis } from "./createOverlayPosition";
