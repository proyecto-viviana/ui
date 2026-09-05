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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useFocusable.tsx

/**
 * createFocusable - Makes an element focusable and capable of auto focus.
 *
 * This is a 1-1 port of React-Aria's useFocusable hook adapted for SolidJS.
 */

import { JSX, Accessor, createContext, useContext, onMount, splitProps } from "solid-js";
import { createFocus, type FocusEvents } from "./createFocus";
import { createKeyboard, type KeyboardEvents } from "./createKeyboard";
import { mergeProps, focusSafely } from "../utils";

export interface FocusableDOMProps {
  /** Whether to exclude the element from the sequential tab order. */
  excludeFromTabOrder?: boolean;
}

export interface FocusableProps extends FocusEvents, KeyboardEvents {
  /** Whether the element should receive focus on mount. */
  autoFocus?: boolean;
}

export interface CreateFocusableProps extends FocusableProps, FocusableDOMProps {
  /** Whether focus should be disabled. */
  isDisabled?: Accessor<boolean> | boolean;
}

export interface FocusableResult {
  /** Props to spread on the focusable element. */
  focusableProps: JSX.HTMLAttributes<HTMLElement>;
}

// --- FocusableContext ---

export interface FocusableContextValue {
  ref?: (el: HTMLElement) => void;
  [key: string]: unknown;
}

/**
 * Context for passing focusable props to nested focusable children.
 * Used by FocusableProvider to pass DOM props to the nearest focusable child.
 */
export const FocusableContext = createContext<FocusableContextValue | null>(null);

/**
 * Consume FocusableContext without snapshotting getters (aria-expanded and
 * other live trigger props) and sync the child ref to the provider — RAC
 * `useFocusableContext` + `useSyncRef`.
 */
function useFocusableContext(): {
  props: Omit<FocusableContextValue, "ref">;
  syncRef: (el: HTMLElement) => void;
} {
  const context = useContext(FocusableContext) ?? {};
  const [, otherProps] = splitProps(context, ["ref"]);
  return {
    props: otherProps,
    syncRef: (el: HTMLElement) => {
      const contextRef = context.ref;
      if (typeof contextRef === "function") {
        contextRef(el);
      }
    },
  };
}

export interface FocusableProviderProps {
  /** The child element to provide DOM props to. */
  children?: JSX.Element;
}

function isDisabledValue(isDisabled: Accessor<boolean> | boolean | undefined): boolean {
  if (typeof isDisabled === "function") {
    return isDisabled();
  }
  return isDisabled ?? false;
}

/**
 * Makes an element focusable, handling disabled state and tab order.
 * Provides focus state tracking and autoFocus support.
 *
 * Based on react-aria's useFocusable but adapted for SolidJS.
 *
 * @example
 * ```tsx
 * import { createFocusable } from 'solidaria';
 *
 * function FocusableInput(props) {
 *   let ref;
 *   const { focusableProps } = createFocusable({
 *     autoFocus: props.autoFocus,
 *     onFocusChange: (focused) => console.log('Focus:', focused),
 *   });
 *
 *   return (
 *     <input
 *       {...focusableProps}
 *       ref={(el) => { ref = el; focusableProps.ref?.(el); }}
 *     />
 *   );
 * }
 * ```
 */
export function createFocusable(
  props: CreateFocusableProps = {},
  ref?: (el: HTMLElement) => void,
): FocusableResult {
  let elementRef: HTMLElement | null = null;
  let autoFocusDone = false;

  const context = useFocusableContext();

  // Set up ref handler — include the provider ref so PreviewTrigger / Tooltip
  // can see the real trigger node (RAC useSyncRef).
  const setRef = (el: HTMLElement) => {
    elementRef = el;
    ref?.(el);
    context.syncRef(el);
  };

  // Get focus and keyboard props from the respective hooks
  const { focusProps } = createFocus({
    isDisabled: isDisabledValue(props.isDisabled),
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onFocusChange: props.onFocusChange,
  });

  const { keyboardProps } = createKeyboard({
    isDisabled: isDisabledValue(props.isDisabled),
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
  });

  // Merge focus and keyboard interactions
  const interactions = mergeProps(focusProps, keyboardProps);

  // Get context props (from FocusableProvider if present)
  const interactionProps = isDisabledValue(props.isDisabled) ? {} : context.props;

  // Handle autoFocus
  onMount(() => {
    if (props.autoFocus && elementRef && !autoFocusDone) {
      focusSafely(elementRef);
      autoFocusDone = true;
    }
  });

  // Build final focusable props
  const focusableProps = mergeProps(
    {
      ...interactions,
      get tabIndex() {
        if (isDisabledValue(props.isDisabled)) {
          return undefined;
        }
        return props.excludeFromTabOrder ? -1 : 0;
      },
      ref: setRef,
    },
    interactionProps,
  ) as JSX.HTMLAttributes<HTMLElement>;

  return {
    focusableProps,
  };
}
