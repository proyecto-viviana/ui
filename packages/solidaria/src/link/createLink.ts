/**
 * Link hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 *
 * This is a 1:1 port of @react-aria/link's useLink hook.
 */

import { type Accessor } from "solid-js";
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
    const elType = elementType();
    const disabled = isDisabled();

    let baseProps: Record<string, unknown> = {};

    // If not an <a>, add role and tabIndex
    if (elType !== "a") {
      baseProps = {
        role: "link",
        tabIndex: disabled ? undefined : 0,
      };
    }

    // ARIA attributes
    const ariaProps: Record<string, unknown> = {
      "aria-disabled": disabled || undefined,
    };

    if (p["aria-current"] !== undefined) {
      ariaProps["aria-current"] = p["aria-current"];
    }
    if (p["aria-label"]) {
      ariaProps["aria-label"] = p["aria-label"];
    }
    if (p["aria-labelledby"]) {
      ariaProps["aria-labelledby"] = p["aria-labelledby"];
    }
    if (p["aria-describedby"]) {
      ariaProps["aria-describedby"] = p["aria-describedby"];
    }
    if (p["aria-details"]) {
      ariaProps["aria-details"] = p["aria-details"];
    }

    // Handle onClick - prevent default navigation when appropriate
    const onClick = (e: MouseEvent) => {
      // If disabled, prevent navigation and don't call user's onClick
      if (disabled) {
        e.preventDefault();
        return;
      }

      // If onPress is provided, prevent default navigation
      // This allows onPress to handle the action (e.g., client-side routing)
      if (p.onPress) {
        e.preventDefault();
      }

      // Call user's onClick if provided
      p.onClick?.(e);
    };

    return mergeProps(
      filterDOMProps(p as Record<string, unknown>, {
        labelable: true,
        isLink: elType === "a",
      }),
      baseProps,
      ariaProps,
      focusableProps as Record<string, unknown>,
      pressProps as Record<string, unknown>,
      { onClick },
    );
  };

  return {
    get linkProps() {
      return getLinkProps();
    },
    isPressed,
  };
}
