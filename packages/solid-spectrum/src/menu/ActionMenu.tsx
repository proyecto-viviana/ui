import {
  type JSX,
  createContext,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  MenuTrigger as HeadlessMenuTrigger,
  MenuButton as HeadlessMenuButton,
  Menu as HeadlessMenu,
  MenuItem as HeadlessMenuItem,
  Popover as HeadlessPopover,
  MenuTriggerContext,
  type MenuProps as HeadlessMenuProps,
  type MenuTriggerRenderProps,
  type MenuItemRenderProps,
  type MenuTriggerProps as HeadlessMenuTriggerProps,
  type MenuRenderProps,
  type PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import { centerBaseline } from "../icon/center-baseline";
import MoreIcon from "../icon/s2wf-icons/MoreIcon";
import { IconContext } from "../icon/spectrum-icon";
import { fontRelative, style, type StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { s2IntlStrings } from "../intl";
import { Text } from "../text";
import { useTheme } from "../provider";
import { pressScale } from "../pressScale";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { s2ActionButton, type S2ActionButtonRenderState } from "../button/s2-action-button-styles";
import type { ActionButtonSize } from "../button/group-context";
import {
  menu as s2Menu,
  menuFrame,
  menuItem as s2MenuItem,
  menuItemLabel,
  menuPopover,
  type S2MenuItemStyleProps,
} from "./s2-menu-styles";

export type ActionMenuMenuSize = "S" | "M" | "L" | "XL";
export type ActionMenuAlign = "start" | "end";
export type ActionMenuDirection = "top" | "bottom" | "start" | "end" | "left" | "right";

export interface ActionMenuProps<T> extends Omit<
  HeadlessMenuProps<T>,
  "class" | "style" | "children" | "items" | "ref" | "slot"
> {
  /** Item objects in the collection. */
  items?: HeadlessMenuProps<T>["items"];
  /** The contents of the collection. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Additional CSS class name for the menu. Legacy alias. */
  class?: string;
  /** Accessible label for the trigger button. Legacy alias. */
  label?: string;
  /** Whether the button should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the trigger is disabled. */
  isDisabled?: boolean;
  /** The size of the ActionButton. @default 'M' */
  size?: ActionButtonSize;
  /** The size of the Menu. @default 'M' */
  menuSize?: ActionMenuMenuSize;
  /** Alignment of the menu relative to the trigger. @default 'start' */
  align?: ActionMenuAlign;
  /** Where the Menu opens relative to its trigger. @default 'bottom' */
  direction?: ActionMenuDirection;
  /** Whether the menu should automatically flip direction when space is limited. */
  shouldFlip?: boolean;
  /** Whether the overlay is open by default. */
  defaultOpen?: boolean;
  /** Whether the overlay is open, controlled. */
  isOpen?: boolean;
  /** Handler called when the overlay open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether the trigger should receive focus on render. */
  autoFocus?: boolean;
  /** Spectrum-defined generated classes for the trigger button. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name for the trigger button. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles for the trigger button. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Identifies the trigger element. */
  id?: string;
  /** Accessible label for the trigger button. */
  "aria-label"?: string;
  /** Identifies the element that labels the trigger button. */
  "aria-labelledby"?: string;
  /** Identifies the element that describes the trigger button. */
  "aria-describedby"?: string;
  /** Identifies the element that provides details for the trigger button. */
  "aria-details"?: string;
  slot?: string | null;
  ref?: RefLike<HTMLButtonElement>;
  [key: `data-${string}`]: string | undefined;
}

export const ActionMenuContext = createContext<SpectrumContextValue<ActionMenuProps<any>>>(null);

function fallbackItemLabel(item: unknown): string {
  const menuItem = item as { id?: string | number; label?: string; textValue?: string };
  return menuItem.label ?? menuItem.textValue ?? String(menuItem.id ?? "");
}

function actionMenuPlacement(
  direction: ActionMenuDirection | undefined,
  align: ActionMenuAlign | undefined,
): string {
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

/**
 * ActionMenu combines an ActionButton with a Menu for simple "more actions" use cases.
 */
export function ActionMenu<T extends object = object>(props: ActionMenuProps<T>): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ActionMenuContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, menuProps] = splitProps(merged, [
    "label",
    "isQuiet",
    "isDisabled",
    "align",
    "direction",
    "shouldFlip",
    "class",
    "size",
    "menuSize",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "ref",
    "slot",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "autoFocus",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "items",
  ] as const);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const triggerLabel = () =>
    local["aria-label"] ?? local.label ?? stringFormatter().format("menu.moreActions");
  const size = (): ActionButtonSize => local.size ?? "M";
  const menuSize = (): ActionMenuMenuSize => local.menuSize ?? "M";
  const items = () => local.items as HeadlessMenuProps<T>["items"] | undefined;
  const [triggerElement, setTriggerElement] = createSignal<HTMLButtonElement | null>(null);
  const iconContextValue = {
    slot: "icon",
    render: centerBaseline({
      slot: "icon",
      styles: () =>
        style({
          gridArea: "icon",
        }),
    }),
    styles: style({
      size: fontRelative(20),
      marginStart: "--iconMargin",
      flexShrink: 0,
    }),
  };
  const getButtonState = (renderProps: MenuTriggerRenderProps): S2ActionButtonRenderState => ({
    isHovered: renderProps.isHovered || renderProps.isOpen,
    isPressed: renderProps.isPressed,
    isFocused: renderProps.isFocused,
    isFocusVisible: renderProps.isFocusVisible,
    isDisabled: renderProps.isDisabled,
  });
  const getButtonClassName = (renderProps: MenuTriggerRenderProps) =>
    [
      local.UNSAFE_className,
      mergeStyles(
        s2ActionButton({
          ...getButtonState(renderProps),
          size: size(),
          isQuiet: local.isQuiet,
          isStaticColor: false,
          density: "regular",
          orientation: "horizontal",
          isInGroup: false,
        }),
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const getButtonStyle = (renderProps: MenuTriggerRenderProps) =>
    pressScale(triggerElement, () => {
      return mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style) ?? {};
    })(renderProps);
  const renderMenuItem = (item: T): JSX.Element => {
    if (typeof local.children === "function") {
      return local.children(item);
    }

    const label = fallbackItemLabel(item);
    const itemKey = (item as { id?: Key }).id ?? label;
    const itemStyleProps = (renderProps: MenuItemRenderProps): S2MenuItemStyleProps => ({
      ...renderProps,
      isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused,
      size: menuSize(),
      isLink: false,
    });

    return (
      <HeadlessMenuItem
        id={itemKey}
        textValue={label}
        class={(renderProps: MenuItemRenderProps) => s2MenuItem(itemStyleProps(renderProps))}
      >
        <Text slot="label" styles={() => menuItemLabel({ size: menuSize() })} data-rsp-slot="text">
          {label}
        </Text>
      </HeadlessMenuItem>
    );
  };

  const triggerProps: Partial<HeadlessMenuTriggerProps> = {
    get isOpen() {
      return local.isOpen;
    },
    get defaultOpen() {
      return local.defaultOpen;
    },
    get onOpenChange() {
      return local.onOpenChange;
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };

  return (
    <HeadlessMenuTrigger {...triggerProps}>
      <HeadlessMenuButton
        id={local.id}
        aria-label={triggerLabel()}
        aria-labelledby={local["aria-labelledby"]}
        aria-describedby={local["aria-describedby"]}
        aria-details={local["aria-details"]}
        autofocus={local.autoFocus}
        isDisabled={local.isDisabled}
        ref={(element) => {
          setTriggerElement(element);
          mergeContextRefs(contextProps?.ref, props.ref)(element);
        }}
        class={getButtonClassName}
        style={getButtonStyle}
        data-size={size()}
        data-quiet={local.isQuiet ? "true" : undefined}
        data-action-menu-align={local.align ?? "start"}
        data-action-menu-direction={local.direction ?? "bottom"}
        data-action-menu-should-flip={local.shouldFlip === false ? "false" : undefined}
      >
        <IconContext.Provider value={iconContextValue}>
          <MoreIcon />
        </IconContext.Provider>
      </HeadlessMenuButton>
      <ActionMenuPopover
        menuProps={menuProps}
        items={items}
        staticChildren={() => local.children as JSX.Element | undefined}
        renderMenuItem={renderMenuItem}
        menuSize={menuSize}
        triggerLabel={triggerLabel}
        triggerRef={triggerElement}
        class={local.class}
        align={() => local.align}
        direction={() => local.direction}
        shouldFlip={() => local.shouldFlip}
      />
    </HeadlessMenuTrigger>
  );
}

interface ActionMenuPopoverProps<T extends object> {
  menuProps: Omit<HeadlessMenuProps<T>, "children" | "items">;
  items: () => HeadlessMenuProps<T>["items"] | undefined;
  staticChildren: () => JSX.Element | undefined;
  renderMenuItem: (item: T) => JSX.Element;
  menuSize: () => ActionMenuMenuSize;
  triggerLabel: () => string;
  triggerRef: () => HTMLButtonElement | null;
  class?: string;
  align: () => ActionMenuAlign | undefined;
  direction: () => ActionMenuDirection | undefined;
  shouldFlip: () => boolean | undefined;
}

function ActionMenuPopover<T extends object>(props: ActionMenuPopoverProps<T>): JSX.Element {
  const theme = useTheme();
  const triggerContext = useContext(MenuTriggerContext);
  const isOpen = () => triggerContext?.state.isOpen() ?? false;
  const close = () => triggerContext?.state.close();
  const open = () => triggerContext?.state.open();
  const usesStaticChildren = () => props.items() == null;
  const menuClass = (renderProps: MenuRenderProps) =>
    [s2Menu({ ...renderProps, size: props.menuSize() }), props.class].filter(Boolean).join(" ");

  return (
    <HeadlessPopover
      trigger="MenuTrigger"
      triggerRef={props.triggerRef}
      isOpen={isOpen()}
      onOpenChange={(openState) => {
        if (openState) {
          open();
        } else {
          close();
        }
      }}
      placement={actionMenuPlacement(props.direction(), props.align()) as never}
      offset={8}
      shouldFlip={props.shouldFlip()}
      autoFocus={false}
      class={(renderProps: PopoverRenderProps) =>
        menuPopover({ ...renderProps, colorScheme: theme.colorScheme })
      }
    >
      <div class={menuFrame}>
        <HeadlessMenu
          {...props.menuProps}
          items={props.items()}
          staticChildren={usesStaticChildren() ? props.staticChildren : undefined}
          aria-label={props.triggerLabel()}
          class={menuClass}
        >
          {usesStaticChildren() ? undefined : props.renderMenuItem}
        </HeadlessMenu>
      </div>
    </HeadlessPopover>
  );
}
