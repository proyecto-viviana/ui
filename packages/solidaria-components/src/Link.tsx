/**
 * Link component for solidaria-components
 *
 * Pre-wired headless link component that combines aria hooks.
 * Port of react-aria-components/src/Link.tsx
 */

import { type JSX, type ParentProps, createContext, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  createLink,
  createFocusRing,
  createHover,
  type AriaLinkProps,
  type HoverEvents,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { handleLinkClick, useRouter } from "./RouterProvider";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface LinkRenderProps {
  /** Whether the link is the current item within a list. */
  isCurrent: boolean;
  /** Whether the link is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the link is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the link is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the link is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the link is disabled. */
  isDisabled: boolean;
}

export interface LinkProps extends Omit<AriaLinkProps, "elementType">, HoverEvents, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<LinkRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<LinkRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<LinkRenderProps>;
  /** Ref for the underlying link element. */
  ref?: RefLike<HTMLElement>;
}

export const LinkContext = createContext<LinkProps | null>(null);

/**
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 *
 * @example
 * ```tsx
 * <Link href="https://example.com">Visit Example</Link>
 *
 * // With render props
 * <Link href="/about">
 *   {({ isHovered, isFocusVisible }) => (
 *     <span class={isHovered ? 'underline' : ''}>
 *       About Us
 *     </span>
 *   )}
 * </Link>
 * ```
 */
export function Link(props: ParentProps<LinkProps>): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "children",
    "class",
    "style",
    "ref",
    "slot",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
  ]);
  const router = useRouter();
  const resolvedHref = createMemo(() =>
    ariaProps.href ? router.useHref(ariaProps.href) : undefined,
  );

  const elementType = () => {
    if (ariaProps.href && !ariaProps.isDisabled) {
      return "a";
    }
    return "span";
  };

  const linkAria = createLink({
    get elementType() {
      return elementType();
    },
    get isDisabled() {
      return ariaProps.isDisabled;
    },
    get href() {
      return resolvedHref();
    },
    get hrefLang() {
      return ariaProps.hrefLang;
    },
    get target() {
      return ariaProps.target;
    },
    get rel() {
      return ariaProps.rel;
    },
    get download() {
      return ariaProps.download;
    },
    get ping() {
      return ariaProps.ping;
    },
    get referrerPolicy() {
      return ariaProps.referrerPolicy;
    },
    get onPress() {
      return ariaProps.onPress;
    },
    get onPressStart() {
      return ariaProps.onPressStart;
    },
    get onPressEnd() {
      return ariaProps.onPressEnd;
    },
    get onClick() {
      return ariaProps.onClick;
    },
    get onFocus() {
      return ariaProps.onFocus;
    },
    get onBlur() {
      return ariaProps.onBlur;
    },
    get onFocusChange() {
      return ariaProps.onFocusChange;
    },
    get onKeyDown() {
      return ariaProps.onKeyDown;
    },
    get onKeyUp() {
      return ariaProps.onKeyUp;
    },
    get autoFocus() {
      return ariaProps.autoFocus;
    },
    get "aria-current"() {
      return ariaProps["aria-current"];
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
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ariaProps.isDisabled ?? false;
    },
    get onHoverStart() {
      return local.onHoverStart;
    },
    get onHoverEnd() {
      return local.onHoverEnd;
    },
    get onHoverChange() {
      return local.onHoverChange;
    },
  });

  const renderValues = createMemo<LinkRenderProps>(() => ({
    isCurrent: !!ariaProps["aria-current"],
    isHovered: isHovered(),
    isPressed: linkAria.isPressed(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: ariaProps.isDisabled ?? false,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Link",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  const cleanLinkProps = () => {
    const { ref: _ref1, ...rest } = linkAria.linkProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const onLinkClick = (event: MouseEvent) => {
    const onClick = cleanLinkProps().onClick as ((event: MouseEvent) => void) | undefined;
    onClick?.(event);
    handleLinkClick(event, router, ariaProps.href, ariaProps.routerOptions);
  };

  return (
    <Dynamic
      component={elementType()}
      {...domProps()}
      {...cleanLinkProps()}
      {...cleanHoverProps()}
      {...cleanFocusProps()}
      ref={(element: HTMLElement) => {
        assignRef(local.ref, element);
      }}
      onClick={onLinkClick}
      class={renderProps.class()}
      style={renderProps.style()}
      data-hovered={isHovered() || undefined}
      data-pressed={linkAria.isPressed() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-current={!!ariaProps["aria-current"] || undefined}
      data-disabled={ariaProps.isDisabled || undefined}
    >
      {renderProps.renderChildren()}
    </Dynamic>
  );
}
