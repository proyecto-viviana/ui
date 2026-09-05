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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/PreviewTrigger.tsx

/**
 * PreviewTrigger displays a non-modal popover on hover, focus, or long press.
 */

import { type JSX, createSignal, createUniqueId, splitProps } from "solid-js";
import {
  FocusableProvider,
  createPreviewTrigger,
  type AriaPreviewTriggerProps,
} from "@proyecto-viviana/solidaria";
import { createTooltipTriggerState } from "@proyecto-viviana/solid-stately";
import {
  OverlayTriggerStateContext,
  PopoverTriggerContext,
  type OverlayTriggerState,
} from "./contexts";
import { Provider } from "./utils";

export interface PreviewTriggerProps extends AriaPreviewTriggerProps {
  /** The trigger and Popover that make up the preview trigger. */
  children: JSX.Element;
  /**
   * The delay time in milliseconds before the preview opens.
   *
   * @default 600
   */
  delay?: number;
  /**
   * The delay time in milliseconds before the preview closes.
   *
   * @default 200
   */
  closeDelay?: number;
}

/**
 * A PreviewTrigger displays a non-modal popover on hover, focus, or long press. Unlike a tooltip,
 * the popover may contain interactive content.
 */
export function PreviewTrigger(props: PreviewTriggerProps): JSX.Element {
  const [local] = splitProps(props, ["children", "delay", "closeDelay"]);

  const state = createTooltipTriggerState({
    get isOpen() {
      return props.isOpen;
    },
    get defaultOpen() {
      return props.defaultOpen;
    },
    onOpenChange: props.onOpenChange,
    get delay() {
      return local.delay ?? 600;
    },
    get closeDelay() {
      return local.closeDelay ?? 200;
    },
    get isDisabled() {
      return props.isDisabled;
    },
  });

  const [triggerEl, setTriggerRef] = createSignal<HTMLElement | null>(null);
  const [popoverEl, setPopoverRef] = createSignal<HTMLElement | null>(null);
  const triggerId = createUniqueId();

  const aria = createPreviewTrigger(
    {
      ...props,
      triggerRef: () => triggerEl(),
      popoverRef: () => popoverEl(),
    },
    state,
  );

  // RAC PreviewTrigger adapts TooltipTriggerState to OverlayTriggerState
  // (`PreviewTrigger.tsx:56-67`): setOpen, point, setPoint. Solid-local
  // PopoverTriggerContext is the trigger-wiring counterpart of RAC's
  // PopoverContext (our PopoverContext is placement/arrow, a different type).
  const overlayState: OverlayTriggerState = {
    get isOpen() {
      return state.isOpen();
    },
    open: () => state.open(),
    close: () => state.close(),
    toggle: () => (state.isOpen() ? state.close() : state.open()),
    setOpen: (isOpen) => {
      if (isOpen) state.open();
      else state.close();
    },
    get point() {
      return null;
    },
    setPoint: () => {},
  };

  return (
    <Provider
      values={[
        [OverlayTriggerStateContext, overlayState],
        [
          PopoverTriggerContext,
          {
            state: {
              isOpen: () => state.isOpen(),
              open: () => state.open(),
              close: () => state.close(),
              toggle: () => (state.isOpen() ? state.close() : state.open()),
              setOpen: overlayState.setOpen,
              point: () => overlayState.point,
              setPoint: overlayState.setPoint,
            },
            triggerRef: () => triggerEl(),
            setTriggerRef: (el: HTMLElement | null) => {
              if (!el) return;
              setTriggerRef(el);
            },
            triggerId,
            triggerProps: aria.triggerProps as unknown as Record<string, unknown>,
            overlayProps: aria.popoverProps as unknown as Record<string, unknown>,
            trigger: "PreviewTrigger",
            setOverlayRef: (el: HTMLElement | null) => setPopoverRef(el),
            shouldSkipAnimation: () => state.shouldSkipAnimation(),
          },
        ],
      ]}
    >
      <FocusableProvider {...aria.triggerProps} ref={setTriggerRef}>
        {local.children}
      </FocusableProvider>
    </Provider>
  );
}
