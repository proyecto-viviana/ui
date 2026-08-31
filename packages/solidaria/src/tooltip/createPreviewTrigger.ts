/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tooltip/usePreviewTrigger.ts

/**
 * Provides the behavior and accessibility implementation for a preview trigger.
 * A preview trigger displays a popover on hover, focus, or long press.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import {
  type TooltipTriggerProps,
  type TooltipTriggerState,
} from "@proyecto-viviana/solid-stately";
import { createHover } from "../interactions/createHover";
import { createLongPress } from "../interactions/createLongPress";
import {
  createFocusVisibleListener,
  createInteractionModality,
  getInteractionModality,
} from "../interactions/createInteractionModality";
import { createId } from "../ssr";
import {
  focusWithoutScrolling,
  getActiveElement,
  getFocusableTreeWalker,
  getOwnerDocument,
  mergeProps,
  nodeContains,
} from "../utils";
import { createStringFormatter } from "../i18n";
import { createSafeArea } from "./createSafeArea";
import { previewTriggerIntlStrings } from "./intl";

export interface AriaPreviewTriggerProps extends Omit<
  TooltipTriggerProps,
  "trigger" | "shouldCloseOnPress"
> {}

export interface AriaPreviewTriggerOptions extends AriaPreviewTriggerProps {
  /** A ref to the trigger element. */
  triggerRef: () => HTMLElement | null;
  /** A ref to the popover element. */
  popoverRef: () => Element | null;
}

export interface PreviewTriggerAria {
  /** Props for the trigger element. */
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the popover overlay element. */
  popoverProps: JSX.HTMLAttributes<HTMLElement> & { id: string };
}

/**
 * Provides the behavior and accessibility implementation for a preview trigger.
 */
export function createPreviewTrigger(
  props: AriaPreviewTriggerOptions,
  state: TooltipTriggerState,
): PreviewTriggerAria {
  const isDisabled = () => !!props.isDisabled;
  const stringFormatter = createStringFormatter(
    previewTriggerIntlStrings,
    "@react-aria/link-preview",
  );
  const popoverId = createId();

  let ignoreFocus = false;
  let shouldFocusOnOpen = false;
  let pointerInSafeArea = false;
  let isFocusVisible = false;

  const stopFocusVisible = createFocusVisibleListener((visible) => {
    isFocusVisible = visible;
  });
  onCleanup(stopFocusVisible);

  const keepOpen = () => state.open(true);

  const checkClose = () => {
    if (pointerInSafeArea) {
      return;
    }
    const trigger = props.triggerRef();
    const active = trigger ? getActiveElement(getOwnerDocument(trigger)) : null;
    if (
      isFocusVisible &&
      ((trigger && nodeContains(trigger, active)) ||
        (props.popoverRef() && nodeContains(props.popoverRef(), active)))
    ) {
      return;
    }
    state.close();
  };

  createEffect(() => {
    const popover = props.popoverRef();
    if (!state.isOpen() || !popover || !shouldFocusOnOpen) {
      return;
    }
    shouldFocusOnOpen = false;
    focusWithoutScrolling(popover as HTMLElement);
  });

  const onHoverStart = () => {
    if (getInteractionModality() === "pointer") {
      pointerInSafeArea = true;
      state.open();
    }
  };

  const onHoverEnd = () => {
    if (!state.isOpen()) {
      pointerInSafeArea = false;
      state.close();
    }
  };

  const onTriggerFocus: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    if (ignoreFocus) {
      ignoreFocus = false;
      return;
    }

    if (state.isOpen() && e.relatedTarget === props.popoverRef()) {
      const popover = props.popoverRef();
      if (popover) {
        focusWithoutScrolling(popover as HTMLElement);
      }
      return;
    }

    if (isFocusVisible) {
      state.open();
    }
  };

  createEffect(() => {
    const trigger = props.triggerRef();
    if (!trigger) return;
    const onRestore = (event: Event) => {
      event.preventDefault();
      ignoreFocus = true;
      trigger.focus();
    };
    trigger.addEventListener("react-aria-focus-scope-restore", onRestore);
    onCleanup(() => trigger.removeEventListener("react-aria-focus-scope-restore", onRestore));
  });

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab" && !e.shiftKey && state.isOpen() && props.popoverRef()) {
      const walker = getFocusableTreeWalker(props.popoverRef()!, { tabbable: true });
      const first = walker.nextNode() as HTMLElement | null;
      if (first) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      state.close(true);
    }
  };

  const { hoverProps } = createHover({
    get isDisabled() {
      return !!isDisabled();
    },
    onHoverStart,
    onHoverEnd,
  });

  const modality = createInteractionModality();
  const shouldLongPress = () => {
    const current = modality.modality();
    return (
      (current === "pointer" || current === "virtual" || current == null) &&
      typeof window !== "undefined" &&
      "ontouchstart" in window
    );
  };

  const { longPressProps } = createLongPress({
    get isDisabled() {
      return !!isDisabled();
    },
    get accessibilityDescription() {
      return shouldLongPress() ? stringFormatter().format("longPressMessage") : undefined;
    },
    onLongPress() {
      shouldFocusOnOpen = true;
      state.open(true);
    },
  });

  createSafeArea({
    triggerRef: props.triggerRef,
    overlayRef: props.popoverRef,
    isOpen: () => state.isOpen(),
    isDisabled,
    onSafeAreaChange: (isInSafeArea) => {
      if (isInSafeArea === pointerInSafeArea) {
        return;
      }
      pointerInSafeArea = isInSafeArea;
      if (isInSafeArea) {
        keepOpen();
      } else {
        checkClose();
      }
    },
  });

  const triggerProps = mergeProps(
    {
      onFocus: onTriggerFocus,
      onBlur: checkClose,
      onKeyDown: onTriggerKeyDown,
    } as JSX.HTMLAttributes<HTMLElement>,
    hoverProps as object,
    longPressProps as object,
  ) as JSX.HTMLAttributes<HTMLElement>;

  const describedBy = () =>
    [triggerProps["aria-describedby"], state.isOpen() ? popoverId : null].filter(Boolean).join(" ");

  return {
    triggerProps: {
      ...triggerProps,
      "aria-haspopup": "dialog",
      "aria-expanded": state.isOpen(),
      "aria-controls": state.isOpen() ? popoverId : undefined,
      "aria-describedby": describedBy() || undefined,
      style: {
        "-webkit-touch-callout": "none",
        "-webkit-user-drag": "none",
      } as JSX.CSSProperties,
    },
    popoverProps: {
      id: popoverId,
      onFocusIn: keepOpen,
      onFocusOut: checkClose,
    },
  };
}
