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
import type { StyleString } from "../style";
import { style, focusRing } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
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
  Keyboard,
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
import { ActionButtonContext, ToggleButtonContext } from "../button/context";

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
  ref?: RefLike<HTMLDivElement>;
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
  /** Ref for the menu item element (a `<div>`, or an `<a>` for link items). */
  ref?: RefLike<HTMLElement>;
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

// The MenuButton (a Viviana convenience trigger; upstream S2 composes a plain
// Button) is styled through the build-time S2 style() macro so the atomic CSS
// ships in the package bundle for installed consumers. Interactive state
// (hover/press/open/focus/disabled) is driven by the trigger render props.
type MenuButtonVariant = "primary" | "secondary" | "quiet";

const menuButtonStyles = style<
  MenuTriggerRenderProps & { size: S2MenuSize; variant: MenuButtonVariant }
>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "lg",
  borderStyle: "solid",
  borderWidth: 2,
  fontWeight: "medium",
  cursor: "default",
  transition: "default",
  height: { size: { S: 32, M: 40, L: 48, XL: 56 } },
  font: { size: { S: "ui-sm", M: "ui", L: "ui-lg", XL: "ui-xl" } },
  paddingX: { size: { S: 12, M: 16, L: 20, XL: 24 } },
  gap: { size: { S: 8, M: 8, L: 12, XL: 12 } },
  backgroundColor: {
    variant: {
      primary: { default: "accent", isHovered: "accent-800", isPressed: "accent-800" },
      secondary: { default: "layer-2", isHovered: "gray-100", isPressed: "gray-100" },
      quiet: { default: "transparent", isHovered: "gray-100", isPressed: "gray-100" },
    },
    isDisabled: "disabled",
  },
  borderColor: {
    variant: {
      primary: "transparent",
      secondary: { default: "gray-300", isHovered: "gray-400" },
      quiet: "transparent",
    },
    isDisabled: "transparent",
  },
  color: {
    default: "neutral",
    variant: { primary: "white" },
    isDisabled: "disabled",
  },
});

const menuButtonChevronStyles = style<{ size: S2MenuSize; isOpen?: boolean }>({
  flexShrink: 0,
  transition: "default",
  width: { size: { S: 16, M: 20, L: 24, XL: 28 } },
  height: { size: { S: 16, M: 20, L: 24, XL: 28 } },
  rotate: { default: 0, isOpen: 180 },
});

const triggerWrapperStyles = style({
  position: "relative",
  display: "inline-block",
});

const separatorStyles = style({
  marginY: 4,
  borderTopWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

const destructiveTextStyles = style({
  color: "negative",
});

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
  const actionButtonContext = useContext(ActionButtonContext);
  const toggleButtonContext = useContext(ToggleButtonContext);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "align",
    "direction",
    "shouldFlip",
    "class",
  ]);
  const size = () => normalizeMenuSize(local.size);
  const actionButtonContextValue = mergeProps(actionButtonContext ?? {}, {
    get holdAffordance() {
      return headlessProps.trigger === "longPress";
    },
  });
  const toggleButtonContextValue = mergeProps(toggleButtonContext ?? {}, {
    get holdAffordance() {
      return headlessProps.trigger === "longPress";
    },
  });

  return (
    <MenuSizeContext.Provider value={size()}>
      <ActionButtonContext.Provider value={actionButtonContextValue}>
        <ToggleButtonContext.Provider value={toggleButtonContextValue}>
          <div class={[triggerWrapperStyles, local.class].filter(Boolean).join(" ")}>
            <HeadlessMenuTrigger {...headlessProps}>
              <MenuTriggerOverlayContext
                align={() => local.align}
                direction={() => local.direction}
                shouldFlip={() => local.shouldFlip}
                trigger={() => headlessProps.trigger}
              >
                {props.children}
              </MenuTriggerOverlayContext>
            </HeadlessMenuTrigger>
          </div>
        </ToggleButtonContext.Provider>
      </ActionButtonContext.Provider>
    </MenuSizeContext.Provider>
  );
}

interface MenuTriggerOverlayContextProps {
  children: JSX.Element;
  align: () => MenuAlign | undefined;
  direction: () => MenuDirection | undefined;
  shouldFlip: () => boolean | undefined;
  trigger: () => HeadlessMenuTriggerProps["trigger"];
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
      point: () => triggerContext?.state.point() ?? null,
    },
    triggerRef: () => triggerElement(),
    setTriggerRef: (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      const current = triggerElement();
      if (!current || !current.isConnected) {
        setTriggerElement(element);
        triggerContext?.setTriggerRef?.(element);
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
        trigger: props.trigger,
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
  const variant = local.variant ?? "secondary";
  const customClass = local.class ?? "";

  const getClassName = (renderProps: MenuTriggerRenderProps): string =>
    [menuButtonStyles({ ...renderProps, size, variant }), customClass].filter(Boolean).join(" ");

  return (
    <HeadlessMenuButton
      {...headlessProps}
      ref={(element) => {
        popoverTrigger?.setTriggerRef(element);
        mergeContextRefs(local.ref)(element);
      }}
      class={getClassName}
    >
      {(renderProps) => (
        <>
          {props.children as JSX.Element}
          <ChevronIcon class={menuButtonChevronStyles({ size, isOpen: renderProps.isOpen })} />
        </>
      )}
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
          offset={triggerOptions?.trigger() === "contextMenu" ? 0 : 8}
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
  const [itemElement, setItemElement] = createSignal<HTMLElement | null>(null);
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
      local.isDestructive ? destructiveTextStyles : "",
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
        // Carry the headless description-slot id so the item's
        // `aria-describedby` resolves to this element (upstream two-context
        // `Text` delegation).
        id: renderProps.descriptionProps?.id,
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
    // Carry the headless keyboard-slot id so it too is referenced by the item's
    // `aria-describedby`.
    id: renderProps.keyboardShortcutProps?.id,
    styles: () => menuItemKeyboard(itemStyleProps(renderProps)),
  });
  const MenuItemContents = (contentProps: { renderProps: MenuItemRenderProps }) => {
    const children =
      typeof local.children === "function"
        ? (local.children as (props: MenuItemRenderProps) => JSX.Element)(contentProps.renderProps)
        : local.children;

    return (
      <>
        <Show
          when={
            contentProps.renderProps.selectionMode === "single" &&
            !contentProps.renderProps.hasSubmenu
          }
        >
          <CheckmarkIcon
            aria-hidden="true"
            data-rsp-slot="selection-indicator"
            size={selectionIconSize[size]}
            class={menuItemCheckmark(itemStyleProps(contentProps.renderProps))}
          />
        </Show>
        <Show
          when={
            contentProps.renderProps.selectionMode === "multiple" &&
            !contentProps.renderProps.hasSubmenu
          }
        >
          <span
            aria-hidden="true"
            data-rsp-slot="selection-indicator"
            class={menuItemCheckbox(itemStyleProps(contentProps.renderProps))}
          >
            <Show when={contentProps.renderProps.isSelected}>
              <CheckmarkIcon
                size={selectionIconSize[size]}
                class={menuItemCheckboxIcon as unknown as string}
              />
            </Show>
          </span>
        </Show>
        {local.icon?.()}
        {isTextOnlyChildren(children) ? <Text slot="label">{children}</Text> : children}
        {local.shortcut ? <Keyboard>{local.shortcut}</Keyboard> : null}
        <Show when={isLinkOut() && !hideLinkOutIcon}>
          <span slot="descriptor" class={menuItemDescriptor} data-rsp-slot="descriptor">
            <LinkOutIcon size={linkOutIconSize[size]} class={menuItemDescriptorIcon({ size })} />
          </span>
        </Show>
        <Show when={contentProps.renderProps.hasSubmenu && !isUnavailable}>
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
      </>
    );
  };

  const renderChildren = (renderProps: MenuItemRenderProps) => {
    return (
      <IconContext.Provider value={iconContextValue}>
        <TextContext.Provider value={textContextValue(renderProps)}>
          <KeyboardContext.Provider value={keyboardContextValue(renderProps)}>
            <MenuItemContents renderProps={renderProps} />
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
  return <div role="separator" class={[separatorStyles, props.class].filter(Boolean).join(" ")} />;
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
export { Content, Header, Heading, Keyboard, Text } from "../text";
