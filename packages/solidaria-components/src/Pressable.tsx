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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/Pressable.tsx

/**
 * Pressable component for solidaria-components
 *
 * A render-prop component that wraps createPress + createFocusable
 * to make an element pressable.
 */

import {
  type JSX,
  children as resolveChildren,
  createEffect,
  onCleanup,
  splitProps,
} from "solid-js";
import {
  createPress,
  createFocusable,
  type CreatePressProps,
  type CreateFocusableProps,
} from "@proyecto-viviana/solidaria";

export interface PressableProps extends CreatePressProps {
  /** A single child element to make pressable. */
  children: JSX.Element;
  /** Ref callback. */
  ref?: HTMLElement | ((el: HTMLElement) => void);
}

/**
 * Makes its child element pressable and focusable.
 * Combines createPress and createFocusable for full interaction support.
 *
 * @example
 * ```tsx
 * <Pressable onPress={() => console.log('pressed')}>
 *   <div role="button" tabIndex={0}>Click me</div>
 * </Pressable>
 * ```
 */
export function Pressable(props: PressableProps): JSX.Element {
  const [local, pressProps] = splitProps(props, ["children", "ref"]);

  let ref!: HTMLElement;
  const { pressProps: domPressProps } = createPress(pressProps);
  const { focusableProps: domFocusableProps } = createFocusable(
    pressProps as CreateFocusableProps,
    () => ref,
  );

  const resolved = resolveChildren(() => local.children);

  createEffect(() => {
    const child = resolved() as HTMLElement;
    if (child instanceof HTMLElement) {
      ref = child;
      if (typeof local.ref === "function") {
        local.ref(child);
      }

      // Apply press props
      const allProps = { ...domFocusableProps, ...domPressProps };
      const listeners: Array<[string, EventListener]> = [];
      for (const [key, handler] of Object.entries(allProps)) {
        if (key.startsWith("on") && typeof handler === "function") {
          const eventName = key.slice(2).toLowerCase();
          const listener = handler as EventListener;
          child.addEventListener(eventName, listener);
          listeners.push([eventName, listener]);
        }
      }

      // Apply non-event press/focusable props (e.g. tabIndex/data attrs).
      // Keep explicit child tabIndex to mirror mergeProps(child.props precedence).
      for (const [key, value] of Object.entries(allProps)) {
        if (key === "ref" || (key.startsWith("on") && typeof value === "function")) continue;

        if (key === "tabIndex") {
          if (child.hasAttribute("tabindex")) continue;
          if (value == null || value === false) {
            child.removeAttribute("tabindex");
          } else {
            child.tabIndex = Number(value);
          }
          continue;
        }

        if (key.startsWith("aria-") || key.startsWith("data-") || key === "id" || key === "role") {
          if (child.hasAttribute(key)) continue;
          if (value == null || value === false) {
            child.removeAttribute(key);
          } else if (value === true) {
            child.setAttribute(key, "");
          } else {
            child.setAttribute(key, String(value));
          }
        }
      }

      onCleanup(() => {
        for (const [eventName, listener] of listeners) {
          child.removeEventListener(eventName, listener);
        }
      });
    }
  });

  return <>{resolved()}</>;
}
