// @ts-nocheck
import { style } from "../style";
import { centerPadding, controlSize } from "../s2-internal/style-utils";

export const textAreaFieldGroupStyles = style({
  alignItems: "baseline",
  height: "auto",
});

export const textAreaInputStyles = style({
  paddingX: 0,
  paddingY: centerPadding(),
  minHeight: controlSize(),
  boxSizing: "border-box",
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    "::placeholder": {
      default: "gray-600",
      forcedColors: "GrayText",
    },
  },
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  flexGrow: 1,
  minWidth: 0,
  outlineStyle: "none",
  borderStyle: "none",
  resize: "none",
  overflowX: "hidden",
});
