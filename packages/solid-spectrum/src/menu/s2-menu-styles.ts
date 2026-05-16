// @ts-nocheck
import type {
  MenuItemRenderProps,
  MenuRenderProps,
  PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";
import {
  baseColor,
  focusRing,
  fontRelative,
  lightDark,
  setColorScheme,
  space,
  style,
} from "../s2-style";
import { control, controlFont, controlSize } from "../s2-internal/style-utils";
import { edgeToText } from "../s2-style/spectrum-theme";

export type S2MenuSize = "S" | "M" | "L" | "XL";

export interface S2MenuStyleProps {
  size: S2MenuSize;
}

export interface S2MenuItemStyleProps
  extends Omit<MenuItemRenderProps, "isFocused">, S2MenuStyleProps {
  isFocused: boolean;
  isLink?: boolean;
}

const menuItemGrid = {
  size: {
    S: [edgeToText(24), "auto", "auto", "minmax(0, 1fr)", "auto", "auto", "auto", edgeToText(24)],
    M: [edgeToText(32), "auto", "auto", "minmax(0, 1fr)", "auto", "auto", "auto", edgeToText(32)],
    L: [edgeToText(40), "auto", "auto", "minmax(0, 1fr)", "auto", "auto", "auto", edgeToText(40)],
    XL: [edgeToText(48), "auto", "auto", "minmax(0, 1fr)", "auto", "auto", "auto", edgeToText(48)],
  },
} as const;

export const menuPopover = style<
  PopoverRenderProps & { colorScheme?: "light" | "dark" | "light dark" }
>({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "layer-2",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  boxShadow: "elevated",
  borderRadius: "lg",
  display: "flex",
  padding: 0,
  minHeight: 0,
  overflow: "visible",
  boxSizing: "border-box",
  isolation: "isolate",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
});

export const menuFrame = style({
  display: "flex",
  width: "full",
  height: "full",
});

export const menu = style<MenuRenderProps & S2MenuStyleProps>({
  outlineStyle: "none",
  display: "grid",
  gridTemplateColumns: menuItemGrid,
  boxSizing: "border-box",
  maxHeight: "[inherit]",
  width: "full",
  overflowY: "auto",
  overflowX: "hidden",
  maxWidth: 320,
  padding: 8,
  fontFamily: "sans",
  fontSize: controlFont(),
  gridAutoRows: "min-content",
  margin: 0,
  listStyleType: "none",
});

export const menuItem = style<S2MenuItemStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", wrap: true, icon: true }),
  columnGap: 0,
  paddingX: 0,
  paddingBottom: "--labelPadding",
  backgroundColor: {
    default: {
      default: "transparent",
      isFocused: {
        default: baseColor("gray-100").isFocusVisible,
        forcedColors: "Highlight",
      },
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isFocused: "HighlightText",
      isDisabled: "GrayText",
    },
  },
  position: "relative",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "grid",
  gridTemplateAreas: [
    ". checkmark icon label       value keyboard descriptor .",
    ". .         .    description .     .        .          .",
  ],
  gridTemplateColumns: "subgrid",
  gridTemplateRows: {
    default: "auto minmax(0, min-content)",
    ":has([slot=description])": "auto auto",
  },
  rowGap: {
    ":has([slot=description])": space(1),
  },
  height: "min",
  textDecoration: "none",
  cursor: {
    default: "default",
    isLink: "pointer",
  },
  transition: "default",
  forcedColorAdjust: "none",
});

export const menuItemIcon = style({
  display: "block",
  size: fontRelative(20),
  marginEnd: "text-to-visual",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

export const menuItemIconCenterWrapper = style({
  display: "flex",
  gridArea: "icon",
});

export const menuItemLabel = style<S2MenuStyleProps>({
  gridArea: "label",
  font: controlFont(),
  color: "inherit",
  fontWeight: "medium",
  marginTop: "--labelPadding",
});

export const menuItemDescription = style<
  Pick<S2MenuItemStyleProps, "size" | "isFocused" | "isDisabled">
>({
  gridArea: "description",
  font: {
    default: "ui-sm",
    size: {
      S: "ui-xs",
      M: "ui-sm",
      L: "ui",
      XL: "ui-lg",
    },
  },
  color: {
    default: baseColor("neutral-subdued"),
    isFocused: "gray-800",
    isDisabled: "disabled",
    forcedColors: {
      default: "inherit",
    },
  },
  transition: "default",
});

export const menuItemValue = style({
  gridArea: "value",
  marginStart: 8,
});

export const menuItemKeyboard = style<
  Pick<S2MenuItemStyleProps, "size" | "isFocused" | "isDisabled">
>({
  gridArea: "keyboard",
  marginStart: 8,
  font: "ui",
  textAlign: "end",
  color: {
    default: "gray-600",
    isDisabled: "disabled",
    forcedColors: {
      default: "inherit",
    },
  },
  unicodeBidi: "plaintext",
});

export const menuSection = style<S2MenuStyleProps>({
  gridColumnStart: 1,
  gridColumnEnd: -1,
  alignItems: "center",
  display: "grid",
  gridTemplateAreas: [
    ". checkmark icon label       value keyboard descriptor .",
    ". .         .    description .     .        .          .",
  ],
  gridTemplateColumns: menuItemGrid,
});

export const menuSectionHeader = style<S2MenuStyleProps>({
  color: "neutral",
  gridColumnStart: 2,
  gridColumnEnd: -2,
  boxSizing: "border-box",
  minHeight: controlSize(),
  paddingY:
    "[calc((self(minHeight) - self(borderTopWidth, 0px) - self(borderBottomWidth, 0px) - 1lh) / 2)]",
});

export const menuSectionHeading = style({
  font: "ui",
  fontWeight: "bold",
  margin: 0,
});
