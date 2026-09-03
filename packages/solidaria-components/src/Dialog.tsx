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
  type Context,
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  splitProps,
  useContext,
  Switch,
  Match,
} from "solid-js";
import {
  createDialog,
  createOverlayTrigger,
  focusSafely,
  useIsHidden,
  type AriaDialogProps,
} from "@proyecto-viviana/solidaria";
import {
  createOverlayTriggerState,
  type OverlayTriggerState,
} from "@proyecto-viviana/solid-stately";
import { DialogTriggerContext, useOverlayTriggerState } from "./contexts";
import { OverlayContext } from "./Popover";
import { ButtonContext } from "./Button";
import { TextContext } from "./Text";
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
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export { DialogTriggerContext, useDialogTrigger } from "./contexts";

/**
 * A DialogTrigger opens a dialog when a trigger element is pressed.
 * Children should include a trigger element (e.g. Button) and the dialog content.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element | null {
  const [local] = splitProps(props, ["isOpen", "defaultOpen", "onOpenChange"]);

  const state = createOverlayTriggerState({
    get isOpen() {
      return local.isOpen;
    },
    get defaultOpen() {
      return local.defaultOpen;
    },
    onOpenChange: local.onOpenChange,
  });

  let triggerRef: HTMLElement | null = null;
  const triggerId = createUniqueId();

  // Create overlay trigger props so registered trigger components can expose
  // the same expanded/controls relationship as React Aria DialogTrigger.
  const triggerAria = createOverlayTrigger({ type: "dialog" }, state, () => triggerRef);

  const restoreFocusToTrigger = () => {
    const trigger = triggerRef;
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

  const stateWithFocusRestore: OverlayTriggerState = {
    isOpen: state.isOpen,
    setOpen: (isOpen) => {
      state.setOpen(isOpen);
      if (!isOpen) {
        restoreFocusToTrigger();
      }
    },
    open: state.open,
    close: () => {
      state.close();
      restoreFocusToTrigger();
    },
    toggle: () => {
      const wasOpen = state.isOpen();
      state.toggle();
      if (wasOpen) {
        restoreFocusToTrigger();
      }
    },
    point: state.point,
    setPoint: state.setPoint,
  };

  const setTriggerRef = (el: HTMLElement | null) => {
    if (!el) return;
    if (!triggerRef || !triggerRef.isConnected) {
      triggerRef = el;
    }
  };

  // Context value - memoized to avoid unnecessary re-renders
  const contextValue = createMemo(() => ({
    state: stateWithFocusRestore,
    triggerRef: () => triggerRef,
    setTriggerRef,
    triggerId,
    triggerProps: triggerAria.triggerProps,
    overlayProps: triggerAria.overlayProps,
  }));

  // If within a collection (e.g. Tabs), render nothing. Matches RAC DialogTrigger
  // (`useIsHidden()` early return) so a hidden collection pass does not leak a
  // duplicate trigger. Not using createHideableComponent: that also wraps a ref.
  const isHidden = useIsHidden();
  if (isHidden()) {
    return null;
  }

  // In SolidJS, we simply render children directly within the provider
  return (
    <DialogTriggerContext.Provider value={contextValue()}>
      {props.children}
    </DialogTriggerContext.Provider>
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

  createEffect(() => {
    if (!dialogRef || ariaProps["aria-label"] || ariaProps["aria-labelledby"]) return;
    const labelledBy = dialogRef.getAttribute("aria-labelledby");
    if (labelledBy && dialogRef.ownerDocument.getElementById(labelledBy)) return;

    const trigger = triggerContext?.triggerRef();
    if (trigger?.id) {
      dialogRef.setAttribute("aria-labelledby", trigger.id);
    }
  });

  // RAC useDialog → useOverlayFocusContain: a nested Dialog still contains
  // focus when the parent Popover is not itself the dialog.
  createEffect(() => {
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
    <DialogContext.Provider value={{ close, titleId: titleId() }}>
      <section
        {...triggerContext?.overlayProps}
        {...dialogProps()}
        {...domProps()}
        ref={setDialogRef}
        class={renderProps.class()}
        style={renderProps.style()}
        slot={local.slot}
      >
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
              [ButtonContext, { slots: { [DEFAULT_SLOT]: {}, close: { onPress: () => close() } } }],
            ] as Array<[Context<unknown>, unknown]>
          }
        >
          {renderProps.renderChildren()}
        </Provider>
      </section>
    </DialogContext.Provider>
  );
}

export interface HeadingProps {
  /** The children of the heading. */
  children: JSX.Element;
  /** The CSS className. */
  class?: string;
  /** The heading level (1-6). Defaults to 2. */
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
  const level = () => props.level ?? 2;
  const id = () => dialogContext?.titleId;
  let headingRef: HTMLHeadingElement | undefined;
  const setHeadingRef = (element: HTMLHeadingElement) => {
    headingRef = element;
  };

  createEffect(() => {
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
