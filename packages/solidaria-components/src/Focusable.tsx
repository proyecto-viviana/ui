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
 * Focusable component for solidaria-components
 *
 * A render-prop component that wraps createFocusable to make an element
 * focusable and capable of auto focus.
 */

import {
  type JSX,
  children as resolveChildren,
  createEffect,
  onCleanup,
  splitProps,
} from "solid-js";
import { createFocusable, type CreateFocusableProps } from "@proyecto-viviana/solidaria";

export interface FocusableProps extends CreateFocusableProps {
  /** A single child element to make focusable. */
  children: JSX.Element;
  /** Ref callback. */
  ref?: HTMLElement | ((el: HTMLElement) => void);
}

/**
 * Makes its child element focusable and capable of auto focus.
 * Applies focus and keyboard event handlers from createFocusable.
 *
 * @example
 * ```tsx
 * <Focusable onFocus={() => console.log('focused')}>
 *   <div tabIndex={0}>Focusable content</div>
 * </Focusable>
 * ```
 */
export function Focusable(props: FocusableProps): JSX.Element {
  const [local, focusableProps] = splitProps(props, ["children", "ref"]);

  let ref!: HTMLElement;
  const { focusableProps: domProps } = createFocusable(focusableProps, () => ref);

  const resolved = resolveChildren(() => local.children);

  createEffect(() => {
    const child = resolved() as HTMLElement;
    if (child instanceof HTMLElement) {
      ref = child;
      if (typeof local.ref === "function") {
        local.ref(child);
      }

      // Apply focusable props to the child element
      const props = domProps;
      const listeners: Array<[string, EventListener]> = [];
      const addListener = (eventName: string, handler: unknown) => {
        if (typeof handler === "function") {
          const listener = handler as EventListener;
          child.addEventListener(eventName, listener);
          listeners.push([eventName, listener]);
        }
      };

      addListener("focus", props.onFocus);
      addListener("blur", props.onBlur);
      addListener("keydown", props.onKeyDown);
      addListener("keyup", props.onKeyUp);

      // Apply non-event focusable props (e.g. tabIndex/aria/data attrs).
      // Keep explicit child tabIndex to mirror mergeProps(child.props precedence).
      for (const [key, value] of Object.entries(props)) {
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
