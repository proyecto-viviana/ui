import {
  type JSX,
  Show,
  createContext,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  Menu as HeadlessMenu,
  MenuItem as HeadlessMenuItem,
  MenuSection as HeadlessMenuSection,
  SubmenuTrigger as HeadlessSubmenuTrigger,
  MenuTrigger as HeadlessMenuTrigger,
  MenuButton as HeadlessMenuButton,
  Popover as HeadlessPopover,
  MenuTriggerContext,
  PopoverTriggerContext,
  type MenuProps as HeadlessMenuProps,
  type MenuItemProps as HeadlessMenuItemProps,
  type MenuSectionProps as HeadlessMenuSectionProps,
  type MenuTriggerProps as HeadlessMenuTriggerProps,
  type MenuButtonProps as HeadlessMenuButtonProps,
  type MenuRenderProps,
  type MenuItemRenderProps,
  type MenuTriggerRenderProps,
  type PopoverRenderProps,
  usePopoverTrigger,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter, useLocale } from "@proyecto-viviana/solidaria";
import type { Key, Selection, SelectionMode } from "@proyecto-viviana/solid-stately";
import { useProviderProps, useTheme } from "../provider";
import type { StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { pressScale } from "../pressScale";
import { centerBaseline } from "../icon/center-baseline";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import S2ChevronIcon from "../icon/ui-icons/Chevron";
import LinkOutIcon from "../icon/ui-icons/LinkOut";
import InfoCircleIcon from "../icon/s2wf-icons/InfoCircleIcon";
import { IconContext } from "../icon/spectrum-icon";
import { s2IntlStrings } from "../intl";
import {
  HeaderContext,
  HeadingContext,
  KeyboardContext,
  StyledKeyboard,
  Text,
  TextContext,
} from "../text";
import {
  menu as s2Menu,
  menuFrame,
  menuItemDescriptor,
  menuItemDescriptorIcon,
  menuItem as s2MenuItem,
  menuItemCheckbox,
  menuItemCheckboxIcon,
  menuItemCheckmark,
  menuItemDescription,
  menuItemIcon,
  menuItemIconCenterWrapper,
  menuItemKeyboard,
  menuItemLabel,
  menuItemValue,
  menuPopover,
  menuSection,
  menuSectionHeader,
  menuSectionHeading,
  type S2MenuItemStyleProps,
  type S2MenuSize,
} from "./s2-menu-styles";
import {
  MenuLinkOutIconContext,
  MenuSizeContext,
  MenuTriggerOptionsContext,
  type MenuAlign,
  type MenuDirection,
} from "./menu-context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type MenuSize = S2MenuSize | "sm" | "md" | "lg";
export type { MenuAlign, MenuDirection };

const UnavailableMenuItemContext = createContext(false);
export const MenuContext = createContext<SpectrumContextValue<MenuProps<any>>>(null);
const linkOutIconSize: Record<S2MenuSize, "M" | "L" | "XL"> = {
  S: "M",
  M: "L",
  L: "XL",
  XL: "XL",
};
const selectionIconSize: Record<S2MenuSize, "XS" | "S" | "M" | "L"> = {
  S: "XS",
  M: "S",
  L: "M",
  XL: "L",
};

export interface MenuTriggerProps extends Omit<HeadlessMenuTriggerProps, "class" | "style"> {
  /** The size of the menu. */
  size?: MenuSize;
  /** Alignment of the menu relative to the trigger. @default 'start' */
  align?: MenuAlign;
  /** Where the Menu opens relative to its trigger. @default 'bottom' */
  direction?: MenuDirection;
  /** Whether the menu should automatically flip direction when space is limited. */
  shouldFlip?: boolean;
  /** Additional CSS class name. */
  class?: string;
}

export interface MenuButtonProps extends Omit<HeadlessMenuButtonProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
  /** Visual variant of the button. */
  variant?: "primary" | "secondary" | "quiet";
}

export interface MenuProps<T> extends Omit<HeadlessMenuProps<T>, "class" | "style" | "ref"> {
  /** Additional CSS class name. */
  class?: string;
  /** Hides the default link out icons on menu items that open links in a new tab. */
  hideLinkOutIcon?: boolean;
  /** The size of the menu. @default 'M' */
  size?: MenuSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Ref for the menu element. */
  ref?: RefLike<HTMLUListElement>;
}

export interface MenuItemProps<T> extends Omit<
  HeadlessMenuItemProps<T>,
  "class" | "style" | "ref"
> {
  /** Additional CSS class name. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Ref for the menu item element. */
  ref?: RefLike<HTMLLIElement>;
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

export interface UnavailableMenuItemTriggerProps {
  /** The menu item followed by contextual help popover content. */
  children: JSX.Element | JSX.Element[];
  /** Whether the menu item should expose unavailable contextual help. */
  isUnavailable?: boolean;
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

function menuPlacement(direction: MenuDirection | undefined, align: MenuAlign | undefined): string {
  const resolvedDirection = direction ?? "bottom";
  const resolvedAlign = align ?? "start";

  switch (resolvedDirection) {
    case "left":
    case "right":
    case "start":
    case "end":
      return `${resolvedDirection} ${resolvedAlign === "end" ? "bottom" : "top"}`;
    case "bottom":
    case "top":
    default:
      return `${resolvedDirection} ${resolvedAlign}`;
  }
}

function menuPlacementAxis(
  direction: MenuDirection | undefined,
): NonNullable<PopoverRenderProps["placement"]> {
  if (direction === "start") {
    return "left";
  }
  if (direction === "end") {
    return "right";
  }
  return direction ?? "bottom";
}

/**
 * A menu trigger wraps a button and menu, handling the open/close state.
 */
export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "align",
    "direction",
    "shouldFlip",
    "class",
  ]);
  const size = () => normalizeMenuSize(local.size);

  return (
    <MenuSizeContext.Provider value={size()}>
      <div class={`relative inline-block ${local.class ?? ""}`}>
        <HeadlessMenuTrigger {...headlessProps}>
          <MenuTriggerOverlayContext
            align={() => local.align}
            direction={() => local.direction}
            shouldFlip={() => local.shouldFlip}
          >
            {props.children}
          </MenuTriggerOverlayContext>
        </HeadlessMenuTrigger>
      </div>
    </MenuSizeContext.Provider>
  );
}

interface MenuTriggerOverlayContextProps {
  children: JSX.Element;
  align: () => MenuAlign | undefined;
  direction: () => MenuDirection | undefined;
  shouldFlip: () => boolean | undefined;
}

function MenuTriggerOverlayContext(props: MenuTriggerOverlayContextProps): JSX.Element {
  const triggerContext = useContext(MenuTriggerContext);
  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
  const triggerId = createUniqueId();

  const popoverTriggerContext = {
    state: {
      isOpen: () => triggerContext?.state.isOpen() ?? false,
      open: () => triggerContext?.state.open(),
      close: () => triggerContext?.state.close(),
      toggle: () => triggerContext?.state.toggle(),
    },
    triggerRef: () => triggerElement(),
    setTriggerRef: (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      const current = triggerElement();
      if (!current || !current.isConnected) {
        setTriggerElement(element);
      }
    },
    triggerId,
    trigger: "MenuTrigger",
  };

  return (
    <MenuTriggerOptionsContext.Provider
      value={{
        align: props.align,
        direction: props.direction,
        shouldFlip: props.shouldFlip,
      }}
    >
      <PopoverTriggerContext.Provider value={popoverTriggerContext}>
        {props.children}
      </PopoverTriggerContext.Provider>
    </MenuTriggerOptionsContext.Provider>
  );
}

/**
 * A button that opens a menu.
 * SSR-compatible - renders children and chevron icon directly without render props.
 */
export function MenuButton(props: MenuButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class", "variant", "ref"]);
  const size = useContext(MenuSizeContext);
  const popoverTrigger = usePopoverTrigger();
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
    <HeadlessMenuButton
      {...headlessProps}
      ref={(element) => {
        popoverTrigger?.setTriggerRef(element);
        mergeContextRefs(local.ref)(element);
      }}
      class={getClassName}
    >
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
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(MenuContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "class",
    "hideLinkOutIcon",
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
    "slot",
    "children",
  ]);
  const triggerSize = useContext(MenuSizeContext);
  const size = () => normalizeMenuSize(local.size ?? triggerSize);
  const theme = useTheme();
  const popoverTrigger = usePopoverTrigger();
  const triggerOptions = useContext(MenuTriggerOptionsContext);
  const isSubmenu = () => popoverTrigger?.trigger === "SubmenuTrigger";
  const isMenuTriggerPopover = () => popoverTrigger?.trigger === "MenuTrigger";
  const isPopoverMenu = () => isSubmenu() || isMenuTriggerPopover();
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const mergedRef = mergeContextRefs(contextProps?.ref, props.ref);
  const mergedUnsafeClassName = () =>
    [contextProps?.UNSAFE_className, props.UNSAFE_className].filter(Boolean).join(" ");

  const getClassName = (renderProps: MenuRenderProps): string => {
    const baseClassName = s2Menu({ ...renderProps, size: size() });
    if (isPopoverMenu()) {
      return baseClassName;
    }

    return [mergedUnsafeClassName(), mergeStyles(baseClassName, mergedStyles()), local.class]
      .filter(Boolean)
      .join(" ");
  };
  const getStandaloneStyle = () => (isPopoverMenu() ? {} : (mergedUnsafeStyle() ?? {}));
  const getFrameClassName = () =>
    [
      menuFrame,
      mergedUnsafeClassName(),
      mergeContextStyles(contextProps?.styles, props.styles),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");
  const getFrameStyle = () => mergedUnsafeStyle();
  const popoverPlacement = () =>
    menuPlacement(triggerOptions?.direction(), triggerOptions?.align());
  const popoverPlacementAxis = () => menuPlacementAxis(triggerOptions?.direction());
  const popoverShouldFlip = () => triggerOptions?.shouldFlip();
  const getPopoverClassName = (renderProps: PopoverRenderProps): string => {
    return menuPopover({
      ...renderProps,
      placement: renderProps.placement ?? popoverPlacementAxis(),
      colorScheme: theme.colorScheme,
    });
  };
  const menuContent = () => (
    <MenuSizeContext.Provider value={size()}>
      <HeaderContext.Provider value={{ styles: () => menuSectionHeader({ size: size() }) }}>
        <HeadingContext.Provider
          value={{
            role: "presentation",
            styles: menuSectionHeading,
          }}
        >
          <TextContext.Provider
            value={{
              slots: {
                default: {
                  styles: () => menuItemLabel({ size: size() }),
                  "data-rsp-slot": "text",
                },
                label: {
                  styles: () => menuItemLabel({ size: size() }),
                  "data-rsp-slot": "text",
                },
                description: {
                  styles: () =>
                    menuItemDescription({
                      size: size(),
                      isFocused: false,
                      isDisabled: false,
                    }),
                  "data-rsp-slot": "text",
                },
              },
            }}
          >
            <HeadlessMenu
              {...headlessProps}
              ref={mergedRef}
              class={getClassName}
              style={getStandaloneStyle}
              children={local.children}
            />
          </TextContext.Provider>
        </HeadingContext.Provider>
      </HeaderContext.Provider>
    </MenuSizeContext.Provider>
  );

  if (isSubmenu()) {
    return (
      <MenuLinkOutIconContext.Provider value={local.hideLinkOutIcon ?? false}>
        <HeadlessPopover
          trigger="SubmenuTrigger"
          placement="end top"
          offset={-2}
          crossOffset={-8}
          isNonModal
          autoFocus={false}
          class={getPopoverClassName}
        >
          <div class={getFrameClassName()} style={getFrameStyle()}>
            {menuContent()}
          </div>
        </HeadlessPopover>
      </MenuLinkOutIconContext.Provider>
    );
  }

  if (isMenuTriggerPopover()) {
    return (
      <MenuLinkOutIconContext.Provider value={local.hideLinkOutIcon ?? false}>
        <HeadlessPopover
          trigger="MenuTrigger"
          triggerRef={() => popoverTrigger?.triggerRef() ?? null}
          placement={popoverPlacement() as never}
          offset={8}
          shouldFlip={popoverShouldFlip()}
          autoFocus={false}
          class={getPopoverClassName}
        >
          <div class={getFrameClassName()} style={getFrameStyle()}>
            {menuContent()}
          </div>
        </HeadlessPopover>
      </MenuLinkOutIconContext.Provider>
    );
  }

  return (
    <MenuLinkOutIconContext.Provider value={local.hideLinkOutIcon ?? false}>
      {menuContent()}
    </MenuLinkOutIconContext.Provider>
  );
}

/**
 * An item in a menu.
 * SSR-compatible - renders icon, content, and shortcut directly without render props.
 */
export function MenuItem<T>(props: MenuItemProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
    "icon",
    "shortcut",
    "isDestructive",
  ]);
  const size = useContext(MenuSizeContext);
  const hideLinkOutIcon = useContext(MenuLinkOutIconContext);
  const isUnavailable = useContext(UnavailableMenuItemContext);
  const locale = useLocale();
  const customClass = local.class ?? "";
  const unavailableDescriptionId = createUniqueId();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const isLinkOut = () => headlessProps.href != null && headlessProps.target === "_blank";
  const chevronStyle = () =>
    locale().direction === "rtl" ? ({ transform: "scaleX(-1)" } as JSX.CSSProperties) : undefined;
  const [itemElement, setItemElement] = createSignal<HTMLLIElement | null>(null);
  const mergedStyles = () => (typeof local.styles === "function" ? local.styles() : local.styles);

  const getClassName = (renderProps: MenuItemRenderProps): string => {
    const isFocused = (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused;
    return [
      local.UNSAFE_className,
      mergeStyles(
        s2MenuItem({
          ...renderProps,
          isFocused,
          size,
          isLink: headlessProps.href != null,
        }),
        mergedStyles(),
      ),
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
  const getStyle = (renderProps: MenuItemRenderProps) =>
    pressScale(() => itemElement(), local.UNSAFE_style)(renderProps);
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
            <Show when={renderProps.selectionMode === "single" && !renderProps.hasSubmenu}>
              <CheckmarkIcon
                aria-hidden="true"
                data-rsp-slot="selection-indicator"
                size={selectionIconSize[size]}
                class={menuItemCheckmark(itemStyleProps(renderProps))}
              />
            </Show>
            <Show when={renderProps.selectionMode === "multiple" && !renderProps.hasSubmenu}>
              <span
                aria-hidden="true"
                data-rsp-slot="selection-indicator"
                class={menuItemCheckbox(itemStyleProps(renderProps))}
              >
                <Show when={renderProps.isSelected}>
                  <CheckmarkIcon
                    size={selectionIconSize[size]}
                    class={menuItemCheckboxIcon as unknown as string}
                  />
                </Show>
              </span>
            </Show>
            {local.icon?.()}
            {isTextOnlyChildren(children) ? <Text slot="label">{children}</Text> : children}
            {local.shortcut ? <StyledKeyboard>{local.shortcut}</StyledKeyboard> : null}
            <Show when={isLinkOut() && !hideLinkOutIcon}>
              <span slot="descriptor" class={menuItemDescriptor} data-rsp-slot="descriptor">
                <LinkOutIcon
                  size={linkOutIconSize[size]}
                  class={menuItemDescriptorIcon({ size })}
                />
              </span>
            </Show>
            <Show when={renderProps.hasSubmenu && !isUnavailable}>
              <span slot="descriptor" class={menuItemDescriptor} data-rsp-slot="descriptor">
                <S2ChevronIcon
                  size={size}
                  class={menuItemDescriptorIcon({ size })}
                  style={chevronStyle()}
                />
              </span>
            </Show>
            <Show when={isUnavailable}>
              <span
                id={unavailableDescriptionId}
                slot="descriptor"
                class={menuItemDescriptor}
                data-rsp-slot="descriptor"
              >
                <InfoCircleIcon
                  aria-label={stringFormatter().format("menu.unavailable")}
                  class={menuItemDescriptorIcon({ size })}
                />
              </span>
            </Show>
          </KeyboardContext.Provider>
        </TextContext.Provider>
      </IconContext.Provider>
    );
  };

  const ariaDescribedBy = () =>
    [
      (headlessProps as { "aria-describedby"?: string })["aria-describedby"],
      isUnavailable ? unavailableDescriptionId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <HeadlessMenuItem
      {...headlessProps}
      aria-describedby={ariaDescribedBy()}
      ref={(element) => {
        setItemElement(element);
        mergeContextRefs(local.ref)(element);
      }}
      class={getClassName}
      style={getStyle}
      children={renderChildren}
    />
  );
}

export function UnavailableMenuItemTrigger(props: UnavailableMenuItemTriggerProps): JSX.Element {
  const children = () =>
    (Array.isArray(props.children) ? props.children : [props.children]) as JSX.Element[];

  return (
    <Show when={props.isUnavailable} fallback={children()[0]}>
      <UnavailableMenuItemContext.Provider value>
        <HeadlessSubmenuTrigger>{children()}</HeadlessSubmenuTrigger>
      </UnavailableMenuItemContext.Provider>
    </Show>
  );
}

export function MenuSection(props: MenuSectionProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  const size = useContext(MenuSizeContext);

  return (
    <HeadlessMenuSection
      {...headlessProps}
      class={[menuSection({ size }), local.class ?? ""].filter(Boolean).join(" ")}
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

export type { Key, Selection, SelectionMode };

export { SubmenuTrigger } from "./SubmenuTrigger";
export type { SubmenuTriggerProps } from "./SubmenuTrigger";
export { ContextualHelpTrigger } from "./ContextualHelpTrigger";
export type { ContextualHelpTriggerProps } from "./ContextualHelpTrigger";
export { Collection } from "@proyecto-viviana/solidaria-components";
export { ContextualHelpPopover } from "../contextualhelp";
export type { ContextualHelpPopoverProps } from "../contextualhelp";
export { Header, Heading, Keyboard, Text } from "../text";
