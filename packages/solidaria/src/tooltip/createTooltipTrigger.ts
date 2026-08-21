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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tooltip/useTooltipTrigger.ts

/**
 * createTooltipTrigger hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tooltip trigger,
 * e.g. a button that shows a description when focused or hovered.
 *
 * Port of @react-aria/tooltip useTooltipTrigger.
 */

import { type JSX, createEffect, onCleanup } from "solid-js";
import { type TooltipTriggerState } from "@proyecto-viviana/solid-stately";
import { createHover } from "../interactions/createHover";
import { createFocusable } from "../interactions/createFocusable";
import { createId } from "../ssr";

export interface TooltipTriggerProps {
  /** Whether the tooltip should be disabled. */
  isDisabled?: boolean;
  /**
   * The trigger mechanism for the tooltip.
   * @default 'hover'
   */
  trigger?: "focus" | "hover";
  /**
   * Whether the tooltip should close when the trigger is pressed.
   * @default true
   */
  shouldCloseOnPress?: boolean;
  /**
   * ID of the tooltip element.
   * @internal Used by component wrappers to merge explicit tooltip ids with trigger aria-describedby.
   */
  tooltipId?: string;
}

export interface TooltipTriggerAria {
  /** Props to spread on the trigger element. */
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props to spread on the tooltip element (id for accessibility). */
  tooltipProps: { readonly id: string };
}

type Modality = "keyboard" | "pointer" | "virtual";
let currentModality: Modality | null = null;

// Track interaction modality (pointer vs keyboard)
if (typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    () => {
      currentModality = "keyboard";
    },
    true,
  );
  document.addEventListener(
    "pointerdown",
    () => {
      currentModality = "pointer";
    },
    true,
  );
  document.addEventListener(
    "pointermove",
    () => {
      currentModality = "pointer";
    },
    true,
  );
}

function isFocusVisible(): boolean {
  return currentModality === "keyboard";
}

/**
 * Provides the behavior and accessibility implementation for a tooltip trigger.
 *
 * @example
 * ```tsx
 * import { createTooltipTrigger } from 'solidaria';
 * import { createTooltipTriggerState } from 'solid-stately';
 *
 * function TooltipButton(props) {
 *   let ref;
 *   const state = createTooltipTriggerState({ delay: 500 });
 *   const { triggerProps, tooltipProps } = createTooltipTrigger(
 *     { isDisabled: props.isDisabled },
 *     state,
 *     () => ref
 *   );
 *
 *   return (
 *     <>
 *       <button ref={ref} {...triggerProps}>
 *         Hover me
 *       </button>
 *       <Show when={state.isOpen()}>
 *         <div {...tooltipProps}>Tooltip content</div>
 *       </Show>
 *     </>
 *   );
 * }
 * ```
 */
export function createTooltipTrigger(
  props: TooltipTriggerProps,
  state: TooltipTriggerState,
  ref: () => HTMLElement | null | undefined,
): TooltipTriggerAria {
  const isDisabled = () => props.isDisabled ?? false;
  const trigger = () => props.trigger ?? "hover";
  const shouldCloseOnPress = () => props.shouldCloseOnPress ?? true;

  const generatedTooltipId = createId();
  const tooltipId = () => props.tooltipId ?? generatedTooltipId;

  // Track hover and focus state
  let isHovered = false;
  let isFocused = false;

  const handleShow = () => {
    if (!isDisabled() && (isHovered || isFocused)) {
      state.open(isFocused);
    }
  };

  const handleHide = (immediate?: boolean) => {
    if (!isHovered && !isFocused) {
      state.close(immediate);
    }
  };

  // Handle Escape key to dismiss tooltip
  createEffect(() => {
    if (!state.isOpen()) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const element = ref();
      if (element) {
        if (e.key === "Escape") {
          e.stopPropagation();
          state.close(true);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown, true);
    });
  });

  const onHoverStart = () => {
    if (isDisabled() || trigger() === "focus") {
      return;
    }
    // Hover events (onPointerEnter) only fire from pointer interactions,
    // so we can always set isHovered to true here
    isHovered = true;
    handleShow();
  };

  const onHoverEnd = () => {
    if (isDisabled() || trigger() === "focus") {
      return;
    }
    isFocused = false;
    isHovered = false;
    handleHide();
  };

  const closeOnPress = () => {
    if (isDisabled() || !shouldCloseOnPress()) {
      return;
    }
    isFocused = false;
    isHovered = false;
    handleHide(true);
  };

  const onKeyDownPress = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }
    closeOnPress();
  };

  const onFocus = () => {
    if (isDisabled()) {
      return;
    }

    const visible = isFocusVisible();
    if (visible) {
      isFocused = true;
      handleShow();
    }
  };

  const onBlur = () => {
    isFocused = false;
    isHovered = false;
    handleHide(true);
  };

  const { hoverProps } = createHover(() => ({
    isDisabled: isDisabled(),
    onHoverStart,
    onHoverEnd,
  }));

  const { focusableProps } = createFocusable({
    isDisabled,
    onFocus,
    onBlur,
  });

  const triggerProps = {
    ...focusableProps,
    ...hoverProps,
    get "aria-describedby"() {
      return !isDisabled() && state.isOpen() ? tooltipId() : undefined;
    },
    onPointerDown: closeOnPress,
    onKeyDown: onKeyDownPress,
    // Remove tabIndex set by focusableProps to avoid overriding
    tabIndex: undefined,
  };

  return {
    triggerProps: triggerProps as JSX.HTMLAttributes<HTMLElement>,
    tooltipProps: {
      get id() {
        return tooltipId();
      },
    },
  };
}
