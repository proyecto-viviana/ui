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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Dialog.tsx

/**
 * Dialog component for solidaria-components
 *
 * A headless dialog component that combines ARIA hooks.
 * Port of react-aria-components Dialog.
 */

import {
  children,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  useContext,
  createTrackedEffect,
} from "solid-js";
import type { Context } from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import {
  createDialog,
  createOverlayTrigger,
  useIsHidden,
  type AriaDialogProps,
} from "@proyecto-viviana/solidaria";
import { createMenuTriggerState } from "@proyecto-viviana/solid-stately";
import {
  DialogTriggerContext,
  OverlayTriggerStateContext,
  PopoverTriggerContext,
  RootMenuTriggerStateContext,
  useOverlayTriggerState,
  type OverlayTriggerState as ContextOverlayTriggerState,
  type PopoverTriggerContextValue,
} from "./contexts";
import { OverlayContext } from "./Popover";
import { ButtonContext } from "./Button";
import { TextContext } from "./Text";
import { HeadingContext } from "./Heading";
import { isDevEnv, splitProps } from "@proyecto-viviana/solidaria/utils";
import {
  DEFAULT_SLOT,
  Provider,
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface DialogRenderProps {
  /** Function to close the dialog */
  close: () => void;
}

export interface DialogProps extends Omit<AriaDialogProps, "class" | "style">, SlotProps {
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<DialogRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DialogRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DialogRenderProps>;
  /** Callback when dialog should close */
  onClose?: () => void;
}

export interface DialogTriggerProps {
  /** The children - should include a trigger and modal/popover content. */
  children: JSX.Element;
  /** Whether the dialog is open (controlled). */
  isOpen?: boolean;
  /** Whether the dialog is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

interface DialogContextValue {
  close: () => void;
  titleId?: string;
  registerHeading?: () => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export { DialogTriggerContext, useDialogTrigger } from "./contexts";

/**
 * A DialogTrigger opens a dialog when a trigger element is pressed.
 * Children should include a trigger element (e.g. Button) and the dialog content.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element | null {
  const [local] = splitProps(props, ["isOpen", "defaultOpen", "onOpenChange"]);

  // A menu inside the dialog reads this state from RootMenuTriggerStateContext
  // and closes the dialog with the menu.
  const state = createMenuTriggerState({
    get isOpen() {
      return local.isOpen;
    },
    get defaultOpen() {
      return local.defaultOpen;
    },
    onOpenChange: local.onOpenChange,
  });

  // A signal, so a consumer reading `triggerRef()` (e.g. the dialog's
  // trigger-label fallback) re-reads once the trigger mounts.
  const [triggerRef, setTriggerElement] = createSignal<HTMLElement | null>(null);
  const triggerId = createUniqueId();

  // Create overlay trigger props so registered trigger components can expose
  // the same expanded/controls relationship as React Aria DialogTrigger.
  const triggerAria = createOverlayTrigger({ type: "dialog" }, state, triggerRef);
  (triggerAria.triggerProps as Record<string, unknown>).id = triggerId;
  (triggerAria.overlayProps as Record<string, unknown>)["aria-labelledby"] = triggerId;

  const setTriggerRef = (el: HTMLElement | null) => {
    if (!el) return;
    // First registrant wins. Replacing a not-yet-connected trigger lets a later
    // CloseButton steal ownership during defaultOpen (both refs fire before
    // either node is in the document), then close+toggle reopens the dialog.
    if (!triggerRef()) {
      setTriggerElement(el);
    }
  };

  // Context value - memoized to avoid unnecessary re-renders
  // A context value is read once by its provider, so it is a stable object
  // whose changing fields are getters.
  const contextValue = {
    state: state,
    triggerRef,
    setTriggerRef,
    triggerId,
    get triggerProps() {
      return triggerAria.triggerProps;
    },
    get overlayProps() {
      return triggerAria.overlayProps;
    },
  };

  const popoverContextValue: PopoverTriggerContextValue = {
    state: {
      isOpen: () => state.isOpen(),
      open: () => state.open(),
      close: () => state.close(),
      toggle: () => state.toggle(),
      setOpen: (next: boolean) => state.setOpen(next),
      point: () => state.point?.() ?? null,
      setPoint: (next: { x: number; y: number }) => state.setPoint?.(next),
    },
    triggerRef,
    setTriggerRef,
    triggerId,
    get triggerProps() {
      return triggerAria.triggerProps;
    },
    get overlayProps() {
      return triggerAria.overlayProps;
    },
    trigger: "DialogTrigger",
  };

  const overlayStateContextValue: ContextOverlayTriggerState = {
    get isOpen() {
      return state.isOpen();
    },
    open: () => state.open(),
    close: () => state.close(),
    toggle: () => state.toggle(),
    setOpen: (next: boolean) => state.setOpen(next),
    get point() {
      return state.point?.() ?? null;
    },
    setPoint: (next: { x: number; y: number }) => state.setPoint?.(next),
  };

  // If within a collection (e.g. Tabs), render nothing. Matches RAC DialogTrigger
  // (`useIsHidden()` early return) so a hidden collection pass does not leak a
  // duplicate trigger. Not using createHideableComponent: that also wraps a ref.
  const isHidden = useIsHidden();
  if (isHidden()) {
    return null;
  }

  // Provide the menu-trigger state alongside the overlay contexts so a menu
  // inside the dialog shares this trigger. RAC DialogTrigger does the same.
  return (
    <OverlayTriggerStateContext value={overlayStateContextValue}>
      <RootMenuTriggerStateContext value={state}>
        <PopoverTriggerContext value={popoverContextValue}>
          <DialogTriggerContext value={contextValue}>{props.children}</DialogTriggerContext>
        </PopoverTriggerContext>
      </RootMenuTriggerStateContext>
    </OverlayTriggerStateContext>
  );
}

/**
 * A dialog is an overlay shown above other content in an application.
 */
export function Dialog(props: DialogProps): JSX.Element {
  const [local, ariaProps, rest] = splitProps(
    props,
    ["class", "style", "slot", "onClose"],
    ["role", "aria-label", "aria-labelledby", "aria-describedby"],
  );

  let dialogRef: HTMLElement | undefined;
  const setDialogRef = (element: HTMLElement) => {
    dialogRef = element;
  };

  // Get trigger context for aria-labelledby fallback
  const triggerContext = useContext(DialogTriggerContext);

  // createDialog returns the props that wire the dialog to its title and, for
  // alertdialogs, its description content.
  const { dialogProps, titleProps, contentProps } = createDialog(
    {
      get role() {
        return ariaProps.role;
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
      get "aria-describedby"() {
        return ariaProps["aria-describedby"];
      },
    },
    () => dialogRef,
  );

  // Get titleId from titleProps - this links Dialog's aria-labelledby to Heading's id
  const titleId = () => titleProps()?.id as string | undefined;

  // Get close function from OverlayTriggerState context or onClose prop
  const overlayState = useOverlayTriggerState();
  const overlayFocus = useContext(OverlayContext);

  const close = () => {
    local.onClose?.();
    if (overlayState) {
      overlayState.close();
      return;
    }
    triggerContext?.state.close();
  };

  let hasHeading = false;
  const registerHeading = () => {
    hasHeading = true;
  };

  // Label the dialog by its trigger when no title slot resolved. Mirrors RAC
  // `Dialog`: the trigger id arrives by context, so it is a fallback only and a
  // rendered title still wins. `createDialog`'s slot id clears itself when no
  // element takes it, which is what makes the fallback reachable.
  // Note: the `?? triggerContext?.triggerId` fallback arm mirrors RAC 1.21.0
  // (`Dialog.mjs:59`, `overlayProps['aria-labelledby'] = triggerProps.id`).
  let hasWarned = false;
  const ariaLabelledBy = () => {
    if (ariaProps["aria-labelledby"]) {
      return ariaProps["aria-labelledby"] as string;
    }
    if (ariaProps["aria-label"]) {
      return undefined;
    }
    const p = dialogProps();
    if (!isServer && p["aria-labelledby"]) {
      return p["aria-labelledby"] as string;
    }
    if (hasHeading) {
      return titleId();
    }
    const fallbackId = triggerContext?.triggerRef()?.id ?? triggerContext?.triggerId;
    if (!fallbackId && !hasWarned && isDevEnv()) {
      hasWarned = true;
      console.warn(
        'If a Dialog does not contain a <Heading slot="title">, it must have an aria-label or aria-labelledby attribute for accessibility.',
      );
    }
    return fallbackId;
  };

  // RAC useDialog → useOverlayFocusContain: a nested Dialog still contains
  // focus when the parent Popover is not itself the dialog.
  createTrackedEffect(() => {
    overlayFocus?.setContain(true);
  });

  const renderValues = createMemo<DialogRenderProps>(() => ({
    close,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
      defaultClassName: "solidaria-Dialog",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <DialogContext value={{ close, titleId: titleId(), registerHeading }}>
      {(() => {
        // Heading registers while it is created. SSR writes aria-labelledby
        // before it inserts children, so resolve this tree before the section
        // and resolve the descendants from the attribute to keep labeling live.
        // Keep the Provider owner separate from descendant resolution: updating
        // nested accessors must not recreate it or its nested trigger state.
        const rendered = createMemo(() => {
          hasHeading = false;
          return (
            <Provider
              values={
                [
                  [
                    HeadingContext,
                    {
                      slots: {
                        [DEFAULT_SLOT]: {},
                        get title() {
                          hasHeading = true;
                          return {
                            ...titleProps(),
                            level: 2,
                          };
                        },
                      },
                    },
                  ],
                  [
                    TextContext,
                    {
                      slots: {
                        [DEFAULT_SLOT]: {},
                        get description() {
                          return contentProps();
                        },
                      },
                    },
                  ],
                  [
                    ButtonContext,
                    { slots: { [DEFAULT_SLOT]: {}, close: { onPress: () => close() } } },
                  ],
                  // Overlay actions must not register as the surrounding trigger.
                  // Mirrors react-aria Overlay's ClearPressResponder boundary;
                  // a nested trigger supplies its own contexts below this boundary.
                  [DialogTriggerContext, null],
                  [PopoverTriggerContext, null],
                ] as Array<[Context<unknown>, unknown]>
              }
            >
              {renderProps.renderChildren()}
            </Provider>
          );
        });
        const resolved = children(rendered);
        const labelledBy = () => {
          resolved();
          return ariaLabelledBy();
        };
        return (
          <section
            {...triggerContext?.overlayProps}
            {...dialogProps()}
            {...domProps()}
            aria-labelledby={labelledBy()}
            ref={setDialogRef}
            class={renderProps.class()}
            style={renderProps.style()}
            slot={local.slot}
          >
            {rendered()}
          </section>
        );
      })()}
    </DialogContext>
  );
}

export { Heading, type HeadingProps } from "./Heading";
