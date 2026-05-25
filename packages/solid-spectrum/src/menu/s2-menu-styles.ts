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
} from "../style" with { type: "macro" };
import {
  control,
  controlBorderRadius,
  controlFont,
  controlSize,
} from "../s2-internal/style-utils" with { type: "macro" };
import { edgeToText } from "../style/spectrum-theme" with { type: "macro" };

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
  opacity: {
    default: 1,
    isEntering: 0,
    isExiting: 0,
  },
  translateY: {
    default: 0,
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4,
      },
      bottom: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  translateX: {
    default: 0,
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4,
      },
      right: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  pointerEvents: {
    default: "auto",
    isExiting: "none",
  },
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

export const menuItemCheckmark = style<Pick<S2MenuItemStyleProps, "isSelected" | "isDisabled">>({
  gridArea: "checkmark",
  display: "block",
  alignSelf: "center",
  justifySelf: "center",
  size: fontRelative(12),
  marginEnd: "text-to-control",
  visibility: {
    default: "hidden",
    isSelected: "visible",
  },
  "--iconPrimary": {
    type: "fill",
    value: {
      default: baseColor("accent"),
      isDisabled: "gray-400",
      forcedColors: "Highlight",
    },
  },
});

export const menuItemCheckbox = style<
  Pick<S2MenuItemStyleProps, "isSelected" | "isFocused" | "isDisabled">
>({
  ...controlBorderRadius("sm"),
  gridArea: "checkmark",
  alignSelf: "center",
  justifySelf: "center",
  size: controlSize("sm"),
  marginEnd: "text-to-control",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: space(2),
  boxSizing: "border-box",
  borderStyle: "solid",
  transition: "default",
  forcedColorAdjust: "none",
  backgroundColor: {
    default: "gray-25",
    forcedColors: "Background",
    isSelected: {
      default: baseColor("accent-900"),
      forcedColors: "Highlight",
      isDisabled: {
        default: "gray-400",
        forcedColors: "GrayText",
      },
    },
  },
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "transparent",
  },
});

export const menuItemCheckboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
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

export const menuItemDescriptor = style({
  gridArea: "descriptor",
  placeSelf: "end",
  marginStart: 8,
  marginBottom: fontRelative(-1),
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

export const menuItemDescriptorIcon = style<S2MenuStyleProps>({
  marginEnd: 0,
  display: "block",
  size: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 26,
    },
  },
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
