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
  Switch,
  Match,
  createTrackedEffect,
} from "solid-js";
import type { Context } from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import {
  createDialog,
  createOverlayTrigger,
  focusSafely,
  useIsHidden,
  type AriaDialogProps,
} from "@proyecto-viviana/solidaria";
import { createMenuTriggerState, type MenuTriggerState } from "@proyecto-viviana/solid-stately";
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

  const restoreFocusToTrigger = () => {
    const trigger = triggerRef();
    if (!trigger?.isConnected) return;

    const win = trigger.ownerDocument.defaultView ?? window;
    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(() => {
        if (trigger.isConnected && !state.isOpen()) {
          focusSafely(trigger);
        }
      });
    });
  };

  const stateWithFocusRestore: MenuTriggerState = {
    isOpen: state.isOpen,
    focusStrategy: state.focusStrategy,
    setFocusStrategy: state.setFocusStrategy,
    setOpen: (isOpen) => {
      state.setOpen(isOpen);
      if (!isOpen) {
        restoreFocusToTrigger();
      }
    },
    open: (strategy = null) => {
      state.open(strategy);
    },
    close: () => {
      state.close();
      restoreFocusToTrigger();
    },
    toggle: (strategy = null) => {
      const wasOpen = state.isOpen();
      state.toggle(strategy);
      if (wasOpen) {
        restoreFocusToTrigger();
      }
    },
    point: state.point,
    setPoint: state.setPoint,
  };

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
  const contextValue = createMemo(() => ({
    state: stateWithFocusRestore,
    triggerRef,
    setTriggerRef,
    triggerId,
    triggerProps: triggerAria.triggerProps,
    overlayProps: triggerAria.overlayProps,
  }));

  const popoverContextValue = createMemo<PopoverTriggerContextValue>(() => ({
    state: {
      isOpen: () => stateWithFocusRestore.isOpen(),
      open: () => stateWithFocusRestore.open(),
      close: () => stateWithFocusRestore.close(),
      toggle: () => stateWithFocusRestore.toggle(),
      setOpen: (next: boolean) => stateWithFocusRestore.setOpen(next),
      point: () => stateWithFocusRestore.point?.() ?? null,
      setPoint: (next: { x: number; y: number }) => stateWithFocusRestore.setPoint?.(next),
    },
    triggerRef,
    setTriggerRef,
    triggerId,
    triggerProps: triggerAria.triggerProps,
    overlayProps: triggerAria.overlayProps,
    trigger: "DialogTrigger",
  }));

  const overlayStateContextValue: ContextOverlayTriggerState = {
    get isOpen() {
      return stateWithFocusRestore.isOpen();
    },
    open: () => stateWithFocusRestore.open(),
    close: () => stateWithFocusRestore.close(),
    toggle: () => stateWithFocusRestore.toggle(),
    setOpen: (next: boolean) => stateWithFocusRestore.setOpen(next),
    get point() {
      return stateWithFocusRestore.point?.() ?? null;
    },
    setPoint: (next: { x: number; y: number }) => stateWithFocusRestore.setPoint?.(next),
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
      <RootMenuTriggerStateContext value={stateWithFocusRestore}>
        <PopoverTriggerContext value={popoverContextValue()}>
          <DialogTriggerContext value={contextValue()}>{props.children}</DialogTriggerContext>
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
      class: local.class,
      style: local.style,
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
        // and read the memo from the attribute: a later child update re-runs
        // the label. The memo keeps that read live, where a body snapshot would not.
        const rendered = createMemo(() => {
          hasHeading = false;
          return children(() => (
            <Provider
              values={
                [
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
                ] as Array<[Context<unknown>, unknown]>
              }
            >
              {renderProps.renderChildren()}
            </Provider>
          ))();
        });
        const labelledBy = () => {
          rendered();
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

export interface HeadingProps {
  /** The children of the heading. */
  children: JSX.Element;
  /** The CSS className. */
  class?: string;
  /** The heading level (1-6). Defaults to 3, or 2 when this heading titles a dialog. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The slot to render into. */
  slot?: string;
}

/**
 * Heading element for dialog title.
 * When rendered inside a Dialog, automatically gets the titleProps.
 */
export function Heading(props: HeadingProps): JSX.Element {
  const dialogContext = useContext(DialogContext);
  dialogContext?.registerHeading?.();
  // RAC Heading defaults to level 3. A heading rendered in a dialog is the
  // title slot here, and that title is level 2.
  const level = () => props.level ?? (dialogContext ? 2 : 3);
  const id = () => dialogContext?.titleId;
  let headingRef: HTMLHeadingElement | undefined;
  const setHeadingRef = (element: HTMLHeadingElement) => {
    headingRef = element;
  };

  createTrackedEffect(() => {
    const el = headingRef;
    if (!el) return;

    const contextId = id();
    if (contextId) {
      el.id = contextId;
      return;
    }

    if (!el.id) {
      const dialog = el.closest('[role="dialog"],[role="alertdialog"]');
      const labelledBy = dialog?.getAttribute("aria-labelledby");
      if (labelledBy && !el.ownerDocument.getElementById(labelledBy)) {
        el.id = labelledBy;
      }
    }
  });

  return (
    <Switch>
      <Match when={level() === 1}>
        <h1 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h1>
      </Match>
      <Match when={level() === 2}>
        <h2 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h2>
      </Match>
      <Match when={level() === 3}>
        <h3 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h3>
      </Match>
      <Match when={level() === 4}>
        <h4 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h4>
      </Match>
      <Match when={level() === 5}>
        <h5 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h5>
      </Match>
      <Match when={level() === 6}>
        <h6 ref={setHeadingRef} id={id()} class={props.class}>
          {props.children}
        </h6>
      </Match>
    </Switch>
  );
}

// Keep backward compatibility
export { Heading as DialogHeading };
