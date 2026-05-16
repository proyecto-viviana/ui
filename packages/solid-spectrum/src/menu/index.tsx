import { type JSX, splitProps, createContext, useContext } from "solid-js";
import {
  Menu as HeadlessMenu,
  MenuItem as HeadlessMenuItem,
  MenuSection as HeadlessMenuSection,
  MenuTrigger as HeadlessMenuTrigger,
  MenuButton as HeadlessMenuButton,
  type MenuProps as HeadlessMenuProps,
  type MenuItemProps as HeadlessMenuItemProps,
  type MenuSectionProps as HeadlessMenuSectionProps,
  type MenuTriggerProps as HeadlessMenuTriggerProps,
  type MenuButtonProps as HeadlessMenuButtonProps,
  type MenuRenderProps,
  type MenuItemRenderProps,
  type MenuTriggerRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";
import { centerBaseline } from "../icon/center-baseline";
import { IconContext } from "../icon/spectrum-icon";
import { KeyboardContext, StyledKeyboard, Text, TextContext } from "../text";
import {
  menu as s2Menu,
  menuItem as s2MenuItem,
  menuItemDescription,
  menuItemIcon,
  menuItemIconCenterWrapper,
  menuItemKeyboard,
  menuItemLabel,
  menuItemValue,
  type S2MenuItemStyleProps,
  type S2MenuSize,
} from "./s2-menu-styles";

export type MenuSize = S2MenuSize | "sm" | "md" | "lg";

const MenuSizeContext = createContext<S2MenuSize>("M");

export interface MenuTriggerProps extends Omit<HeadlessMenuTriggerProps, "class" | "style"> {
  /** The size of the menu. */
  size?: MenuSize;
  /** Additional CSS class name. */
  class?: string;
}

export interface MenuButtonProps extends Omit<HeadlessMenuButtonProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
  /** Visual variant of the button. */
  variant?: "primary" | "secondary" | "quiet";
}

export interface MenuProps<T> extends Omit<HeadlessMenuProps<T>, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

export interface MenuItemProps<T> extends Omit<HeadlessMenuItemProps<T>, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
  /**
   * Optional icon to display before the label.
   * Use a function returning JSX for SSR compatibility: `icon={() => <MyIcon />}`
   */
  icon?: () => JSX.Element;
  /** Optional keyboard shortcut to display. */
  shortcut?: string;
  /** Whether this is a destructive action. */
  isDestructive?: boolean;
}

export interface MenuSectionProps extends Omit<HeadlessMenuSectionProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

const buttonSizeStyles: Record<
  S2MenuSize,
  {
    button: string;
    icon: string;
  }
> = {
  S: {
    button: "h-8 text-sm px-3 gap-2",
    icon: "h-4 w-4",
  },
  M: {
    button: "h-10 text-base px-4 gap-2",
    icon: "h-5 w-5",
  },
  L: {
    button: "h-12 text-lg px-5 gap-3",
    icon: "h-6 w-6",
  },
  XL: {
    button: "h-14 text-xl px-6 gap-3",
    icon: "h-7 w-7",
  },
};

const buttonVariants = {
  primary: "bg-accent text-bg-400 border-accent hover:bg-accent-300 hover:border-accent-300",
  secondary:
    "bg-bg-400 text-primary-200 border-primary-600 hover:bg-bg-300 hover:border-accent-300",
  quiet: "bg-transparent text-primary-200 border-transparent hover:bg-bg-300",
};

function normalizeMenuSize(size?: MenuSize): S2MenuSize {
  switch (size) {
    case "sm":
    case "S":
      return "S";
    case "lg":
    case "L":
      return "L";
    case "XL":
      return "XL";
    case "md":
    case "M":
    default:
      return "M";
  }
}

function isTextOnlyChildren(children: unknown): children is string | number {
  return typeof children === "string" || typeof children === "number";
}

/**
 * A menu trigger wraps a button and menu, handling the open/close state.
 */
export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["size", "class"]);
  const size = () => normalizeMenuSize(local.size);

  return (
    <MenuSizeContext.Provider value={size()}>
      <div class={`relative inline-block ${local.class ?? ""}`}>
        <HeadlessMenuTrigger {...headlessProps}>{props.children}</HeadlessMenuTrigger>
      </div>
    </MenuSizeContext.Provider>
  );
}

/**
 * A button that opens a menu.
 * SSR-compatible - renders children and chevron icon directly without render props.
 */
export function MenuButton(props: MenuButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class", "variant"]);
  const size = useContext(MenuSizeContext);
  const sizeStyle = buttonSizeStyles[size];
  const variant = local.variant ?? "secondary";
  const customClass = local.class ?? "";

  const getClassName = (renderProps: MenuTriggerRenderProps): string => {
    const base =
      "inline-flex items-center justify-center rounded-lg border-2 font-medium transition-all duration-200";
    const sizeClass = sizeStyle.button;
    const variantClass = buttonVariants[variant];

    let stateClass: string;
    if (renderProps.isDisabled) {
      stateClass = "opacity-50 cursor-not-allowed";
    } else if (renderProps.isPressed) {
      stateClass = "scale-95";
    } else {
      stateClass = "cursor-pointer";
    }

    const focusClass = renderProps.isFocusVisible
      ? "ring-2 ring-accent-300 ring-offset-2 ring-offset-bg-400"
      : "";

    return [base, sizeClass, variantClass, stateClass, focusClass, customClass]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <HeadlessMenuButton {...headlessProps} class={getClassName}>
      {props.children as JSX.Element}
      {/* Chevron rotates via CSS based on data-open attribute */}
      <ChevronIcon
        class={`${sizeStyle.icon} transition-transform duration-200 data-open:rotate-180`}
      />
    </HeadlessMenuButton>
  );
}

/**
 * A menu displays a list of actions or options for the user to choose from.
 */
export function Menu<T>(props: MenuProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class"]);
  const size = useContext(MenuSizeContext);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: MenuRenderProps): string => {
    return [s2Menu({ ...renderProps, size }), customClass].filter(Boolean).join(" ");
  };

  return <HeadlessMenu {...headlessProps} class={getClassName} children={props.children} />;
}

/**
 * An item in a menu.
 * SSR-compatible - renders icon, content, and shortcut directly without render props.
 */
export function MenuItem<T>(props: MenuItemProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "class",
    "icon",
    "shortcut",
    "isDestructive",
  ]);
  const size = useContext(MenuSizeContext);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: MenuItemRenderProps): string => {
    const isFocused = (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused;
    return [
      s2MenuItem({
        ...renderProps,
        isFocused,
        size,
        isLink: headlessProps.href != null,
      }),
      local.isDestructive ? "text-danger-400" : "",
      customClass,
    ]
      .filter(Boolean)
      .join(" ");
  };
  const itemStyleProps = (renderProps: MenuItemRenderProps): S2MenuItemStyleProps => ({
    ...renderProps,
    isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused,
    size,
    isLink: headlessProps.href != null,
  });
  const iconContextValue = {
    slot: "icon",
    render: centerBaseline({
      slot: "icon",
      styles: menuItemIconCenterWrapper,
    }),
    styles: menuItemIcon,
  };
  const textContextValue = (renderProps: MenuItemRenderProps) => ({
    slots: {
      default: {
        styles: () => menuItemLabel({ size }),
        "data-rsp-slot": "text",
      },
      label: {
        styles: () => menuItemLabel({ size }),
        "data-rsp-slot": "text",
      },
      description: {
        styles: () => menuItemDescription(itemStyleProps(renderProps)),
        "data-rsp-slot": "text",
      },
      value: {
        styles: menuItemValue,
        "data-rsp-slot": "value",
      },
    },
  });
  const keyboardContextValue = (renderProps: MenuItemRenderProps) => ({
    styles: () => menuItemKeyboard(itemStyleProps(renderProps)),
  });
  const renderChildren = (renderProps: MenuItemRenderProps) => {
    const children =
      typeof local.children === "function"
        ? (local.children as (props: MenuItemRenderProps) => JSX.Element)(renderProps)
        : local.children;

    return (
      <IconContext.Provider value={iconContextValue}>
        <TextContext.Provider value={textContextValue(renderProps)}>
          <KeyboardContext.Provider value={keyboardContextValue(renderProps)}>
            {local.icon?.()}
            {isTextOnlyChildren(children) ? <Text slot="label">{children}</Text> : children}
            {local.shortcut ? <StyledKeyboard>{local.shortcut}</StyledKeyboard> : null}
          </KeyboardContext.Provider>
        </TextContext.Provider>
      </IconContext.Provider>
    );
  };

  return <HeadlessMenuItem {...headlessProps} class={getClassName} children={renderChildren} />;
}

export function MenuSection(props: MenuSectionProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);

  return (
    <HeadlessMenuSection
      {...headlessProps}
      class={["px-1 py-1", local.class ?? ""].filter(Boolean).join(" ")}
    >
      {props.children}
    </HeadlessMenuSection>
  );
}

export interface MenuSeparatorProps {
  /** Additional CSS class name. */
  class?: string;
}

/**
 * A visual separator between menu items.
 */
export function MenuSeparator(props: MenuSeparatorProps): JSX.Element {
  return <li role="separator" class={`my-1 border-t border-primary-600 ${props.class ?? ""}`} />;
}

function ChevronIcon(props: { class?: string }): JSX.Element {
  return (
    <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

Menu.Item = MenuItem;
Menu.Section = MenuSection;
Menu.Separator = MenuSeparator;
MenuTrigger.Button = MenuButton;

export const Item = MenuItem;
export const Section = MenuSection;

export type { Key };

export { ActionMenu, ActionMenuContext } from "./ActionMenu";
export type { ActionMenuProps } from "./ActionMenu";
export { SubmenuTrigger } from "./SubmenuTrigger";
export type { SubmenuTriggerProps } from "./SubmenuTrigger";
export { ContextualHelpTrigger } from "./ContextualHelpTrigger";
export type { ContextualHelpTriggerProps } from "./ContextualHelpTrigger";
