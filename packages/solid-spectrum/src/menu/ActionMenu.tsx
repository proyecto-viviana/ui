import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  MenuTrigger as HeadlessMenuTrigger,
  MenuButton as HeadlessMenuButton,
  Menu as HeadlessMenu,
  MenuItem as HeadlessMenuItem,
  type MenuProps as HeadlessMenuProps,
  type MenuTriggerRenderProps,
  type MenuItemRenderProps,
  type MenuTriggerProps as HeadlessMenuTriggerProps,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import { centerBaseline } from "../icon/center-baseline";
import { createIcon, IconContext } from "../icon/spectrum-icon";
import { fontRelative, style, type StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { s2IntlStrings } from "../intl";
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

const menuSizeClasses: Record<ActionMenuMenuSize, { menu: string; item: string }> = {
  S: {
    menu: "py-1",
    item: "text-sm py-1.5 px-3 gap-2",
  },
  M: {
    menu: "py-1.5",
    item: "text-base py-2 px-4 gap-3",
  },
  L: {
    menu: "py-2",
    item: "text-lg py-2.5 px-5 gap-3",
  },
  XL: {
    menu: "py-2.5",
    item: "text-xl py-3 px-6 gap-3",
  },
};

const MoreIcon = createIcon((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const { class: className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={className}
    >
      <circle
        cx="4"
        cy="10"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="10"
        cy="10"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="16"
        cy="10"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
});

function fallbackItemLabel(item: unknown): string {
  const menuItem = item as { id?: string | number; label?: string; textValue?: string };
  return menuItem.label ?? menuItem.textValue ?? String(menuItem.id ?? "");
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
  const items = () => (local.items ?? []) as T[];
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
  const getButtonStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style) ?? {};
  const renderMenuItem = (item: T): JSX.Element => {
    if (typeof local.children === "function") {
      return local.children(item);
    }

    const label = fallbackItemLabel(item);
    const itemKey = (item as { id?: Key }).id ?? label;

    return (
      <HeadlessMenuItem
        id={itemKey}
        textValue={label}
        class={(renderProps: MenuItemRenderProps) => {
          const base =
            "flex items-center cursor-pointer transition-colors duration-150 outline-none";
          const sizeClass = menuSizeClasses[menuSize()].item;
          let colorClass: string;
          if (renderProps.isDisabled) {
            colorClass = "text-primary-500 cursor-not-allowed";
          } else if (renderProps.isFocused || renderProps.isHovered) {
            colorClass = "bg-bg-300 text-primary-100";
          } else {
            colorClass = "text-primary-200";
          }
          const pressedClass = renderProps.isPressed ? "bg-bg-200" : "";
          const focusClass = renderProps.isFocusVisible ? "ring-2 ring-inset ring-accent-300" : "";
          return [base, sizeClass, colorClass, pressedClass, focusClass].filter(Boolean).join(" ");
        }}
      >
        {label}
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
        ref={mergeContextRefs(contextProps?.ref, props.ref)}
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
      <HeadlessMenu
        {...menuProps}
        items={items()}
        class={(_renderProps) => {
          const base =
            "absolute z-50 mt-1 min-w-[12rem] rounded-lg border-2 border-primary-600 bg-bg-400 shadow-lg overflow-hidden";
          const customClass = local.class ?? "";
          return [base, menuSizeClasses[menuSize()].menu, customClass].filter(Boolean).join(" ");
        }}
      >
        {renderMenuItem}
      </HeadlessMenu>
    </HeadlessMenuTrigger>
  );
}
