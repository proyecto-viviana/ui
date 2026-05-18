/**
 * Breadcrumbs hooks for Solidaria
 *
 * Provides accessibility implementation for breadcrumb navigation.
 * Port of @react-aria/breadcrumbs.
 */

import { createLink, type AriaLinkProps, type LinkAria } from "../link";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaBreadcrumbsProps {
  /** Provides a label for the breadcrumbs navigation. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the breadcrumbs. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the breadcrumbs. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed description. */
  "aria-details"?: string;
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean;
}

export interface BreadcrumbsAria {
  /** Props for the breadcrumbs nav element. */
  navProps: Record<string, unknown>;
}

export interface AriaBreadcrumbItemProps extends Omit<AriaLinkProps, "aria-current"> {
  /** The DOM id for the breadcrumb item. */
  id?: string;
  /** Whether this is the current/last item in the breadcrumb trail. */
  isCurrent?: boolean;
  /** The type of current location for aria-current. @default 'page' */
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
  /** The HTML element type. @default 'a' */
  elementType?: string;
}

export interface BreadcrumbItemAria extends LinkAria {
  /** Props for the breadcrumb item element. */
  itemProps: Record<string, unknown>;
}

/**
 * Provides accessibility implementation for the breadcrumbs navigation container.
 */
export function createBreadcrumbs(
  props: MaybeAccessor<AriaBreadcrumbsProps> = {},
): BreadcrumbsAria {
  const getProps = () => access(props);

  const getNavProps = (): Record<string, unknown> => {
    const p = getProps();

    // Only apply a default label when no other label source exists.
    const ariaLabel = p["aria-label"] ?? (p["aria-labelledby"] ? undefined : "Breadcrumbs");

    return mergeProps(filterDOMProps(p as Record<string, unknown>, { labelable: true }), {
      "aria-label": ariaLabel,
      "aria-details": p["aria-details"],
    });
  };

  return {
    get navProps() {
      return getNavProps();
    },
  };
}

/**
 * Provides accessibility implementation for an individual breadcrumb item.
 */
export function createBreadcrumbItem(
  props: MaybeAccessor<AriaBreadcrumbItemProps> = {},
): BreadcrumbItemAria {
  const getProps = () => access(props);

  const isCurrent = () => getProps().isCurrent ?? false;
  const isDisabled = () => getProps().isDisabled ?? false;
  const elementType = () => getProps().elementType ?? "a";

  // Use createLink for base link behavior
  // Current items are treated as disabled (can't navigate to current page)
  const { linkProps, isPressed } = createLink({
    get isDisabled() {
      return isDisabled() || isCurrent();
    },
    get elementType() {
      return elementType();
    },
    get href() {
      return isCurrent() ? undefined : getProps().href;
    },
    get target() {
      return getProps().target;
    },
    get rel() {
      return getProps().rel;
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
    get onClick() {
      return getProps().onClick;
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
    get autoFocus() {
      return getProps().autoFocus;
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
  });

  const getItemProps = (): Record<string, unknown> => {
    const p = getProps();
    const current = isCurrent();

    // Start with link props, forwarding id if provided
    let baseProps: Record<string, unknown> = p.id ? mergeProps(linkProps, { id: p.id }) : linkProps;

    // Add aria-current for current page
    if (current) {
      const ariaCurrent = p["aria-current"] ?? "page";
      baseProps = mergeProps(baseProps, {
        "aria-current": ariaCurrent,
      });
    }

    // Add aria-disabled for disabled items
    if (isDisabled()) {
      baseProps = mergeProps(baseProps, {
        "aria-disabled": true,
      });
    }

    return baseProps;
  };

  return {
    get itemProps() {
      return getItemProps();
    },
    get linkProps() {
      return linkProps;
    },
    isPressed,
  };
}
