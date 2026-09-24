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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/link/useLink.ts

/**
 * Link hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 *
 * This is a 1:1 port of @react-aria/link's useLink hook.
 */

import type { Accessor } from "solid-js";
import { createPress } from "../interactions/createPress";
import { createFocusable } from "../interactions/createFocusable";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { type PressEvent } from "../interactions/PressEvent";

export interface AriaLinkProps {
  /** Whether the link is disabled. */
  isDisabled?: boolean;
  /** The HTML element used to render the link, e.g. 'a', or 'span'. @default 'a' */
  elementType?: string;
  /** The URL to link to. */
  href?: string;
  /** Additional options forwarded to client-side router navigation handlers. */
  routerOptions?: Record<string, unknown>;
  /** The target window for the link. */
  target?: string;
  /** The relationship between the linked resource and the current page. */
  rel?: string;
  /** Hints the language of the linked resource. */
  hrefLang?: string;
  /** Instructs the browser to download the URL instead of navigating to it. */
  download?: string | boolean;
  /** Space-separated list of URLs to ping when following the link. */
  ping?: string;
  /** Referrer policy for fetches initiated by this link. */
  referrerPolicy?:
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  /** Handler that is called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction ends. */
  onPressEnd?: (e: PressEvent) => void;
  /** Handler that is called when a press is released over the target. */
  onPressUp?: (e: PressEvent) => void;
  /** Handler that is called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void;
  /** Handler that is called when the element is clicked. */
  onClick?: (e: MouseEvent) => void;
  /** Handler that is called when the element receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the element loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the element's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void;
  /** Whether to autofocus the element. */
  autoFocus?: boolean;
  /** Indicates the current "page" or state within a set of related elements. */
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | boolean;
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed description. */
  "aria-details"?: string;
}

export interface LinkAria {
  /** Props for the link element. */
  linkProps: Record<string, unknown>;
  /** Whether the link is currently pressed. */
  isPressed: Accessor<boolean>;
}

/**
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export function createLink(props: MaybeAccessor<AriaLinkProps> = {}): LinkAria {
  const getProps = () => access(props);

  const isDisabled = () => getProps().isDisabled ?? false;
  const elementType = () => getProps().elementType ?? "a";

  // Create press handling
  const { pressProps, isPressed } = createPress({
    get isDisabled() {
      return isDisabled();
    },
    get onPress() {
      return getProps().onPress;
    },
    get onPressStart() {
      return getProps().onPressStart;
    },
    get onPressEnd() {
      return getProps().onPressEnd;
    },
    get onPressUp() {
      return getProps().onPressUp;
    },
    get onPressChange() {
      return getProps().onPressChange;
    },
  });

  // Create focusable handling
  const { focusableProps } = createFocusable({
    get isDisabled() {
      return isDisabled();
    },
    get autoFocus() {
      return getProps().autoFocus;
    },
    get onFocus() {
      return getProps().onFocus;
    },
    get onBlur() {
      return getProps().onBlur;
    },
    get onFocusChange() {
      return getProps().onFocusChange;
    },
    get onKeyDown() {
      return getProps().onKeyDown;
    },
    get onKeyUp() {
      return getProps().onKeyUp;
    },
  });

  // Build link props
  const getLinkProps = (): Record<string, unknown> => {
    const p = getProps();

    // If not an <a>, add role and tabIndex
    const baseProps: Record<string, unknown> = {
      get role() {
        return elementType() !== "a" ? "link" : undefined;
      },
      get tabIndex() {
        return elementType() !== "a" ? (isDisabled() ? undefined : 0) : undefined;
      },
    };

    // ARIA attributes
    const ariaProps: Record<string, unknown> = {
      get "aria-disabled"() {
        return isDisabled() ? "true" : undefined;
      },
      get "aria-current"() {
        return getProps()["aria-current"];
      },
      get "aria-label"() {
        return getProps()["aria-label"];
      },
      get "aria-labelledby"() {
        return getProps()["aria-labelledby"];
      },
      get "aria-describedby"() {
        return getProps()["aria-describedby"];
      },
      get "aria-details"() {
        return getProps()["aria-details"];
      },
    };

    // Host-native click so stopPropagation runs at the element before document
    // bubble interceptors. Disabled still preventDefaults and skips user onClick.
    // Router preventDefault stays in handleLinkClick when !isNative — not here.
    const onClick = (e: MouseEvent) => {
      if (isDisabled()) {
        e.preventDefault();
        return;
      }

      getProps().onClick?.(e);
    };

    return mergeProps(
      filterDOMProps(p as Record<string, unknown>, {
        labelable: true,
        isLink: elementType() === "a" || getProps().href != null,
      }),
      baseProps,
      ariaProps,
      focusableProps as Record<string, unknown>,
      pressProps as Record<string, unknown>,
      { onClick: onClick },
    );
  };

  return {
    get linkProps() {
      return getLinkProps();
    },
    isPressed,
  };
}
