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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/overlays/useOverlayTrigger.ts

/**
 * Handles the behavior and accessibility for an overlay trigger.
 * Based on @react-aria/overlays useOverlayTrigger.
 */

import { createEffect } from "solid-js";
import type { OverlayTriggerState } from "@proyecto-viviana/solid-stately";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils";

export interface OverlayTriggerProps {
  /** Type of overlay that is opened by the trigger. */
  type: "dialog" | "menu" | "listbox" | "tree" | "grid";
}

export interface OverlayTriggerAria {
  /** Props for the trigger element. */
  triggerProps: {
    "aria-haspopup"?: boolean | "listbox";
    "aria-expanded": boolean;
    "aria-controls"?: string;
    onPress: () => void;
  };
  /** Props for the overlay container element. */
  overlayProps: {
    id: string;
  };
}

// Map for storing close functions, used by useCloseOnScroll
export const onCloseMap = new WeakMap<Element, () => void>();

/**
 * Handles the behavior and accessibility for an overlay trigger, e.g. a button
 * that opens a popover, menu, or other overlay that is positioned relative to the trigger.
 */
export function createOverlayTrigger(
  props: MaybeAccessor<OverlayTriggerProps>,
  state: OverlayTriggerState,
  ref?: () => Element | null,
): OverlayTriggerAria {
  const propsAccessor = () => access(props);
  const overlayId = createId();

  // Backward compatibility. Share state close function with useOverlayPosition so it can close on scroll
  // without forcing users to pass onClose.
  createEffect(() => {
    const element = ref?.();
    if (element) {
      onCloseMap.set(element, state.close);
    }
  });

  // Aria 1.1 supports multiple values for aria-haspopup other than just menus.
  // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
  // However, we only add it for menus for now because screen readers often
  // announce it as a menu even for other values.
  const getAriaHasPopup = (): boolean | "listbox" | undefined => {
    const type = propsAccessor().type;
    if (type === "menu") {
      return true;
    } else if (type === "listbox") {
      return "listbox";
    }
    return undefined;
  };

  return {
    triggerProps: {
      get "aria-haspopup"() {
        return getAriaHasPopup();
      },
      get "aria-expanded"() {
        return state.isOpen();
      },
      get "aria-controls"() {
        return state.isOpen() ? overlayId : undefined;
      },
      onPress: state.toggle,
    },
    overlayProps: {
      id: overlayId,
    },
  };
}
