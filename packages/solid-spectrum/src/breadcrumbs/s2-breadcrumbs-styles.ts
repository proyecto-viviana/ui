import { baseColor, focusRing, size as s2Size, style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };

export type S2BreadcrumbsSize = "M" | "L";

export const wrapperStyles = style<{ size: S2BreadcrumbsSize; isDisabled?: boolean }>(
  {
    position: "relative",
    display: "flex",
    justifyContent: "start",
    listStyleType: "none",
    flexWrap: "nowrap",
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    height: controlSize(),
    gap: {
      size: {
        M: s2Size(6),
        L: s2Size(9),
      },
    },
    padding: 0,
    transition: "default",
    marginTop: 0,
    marginBottom: 0,
    marginStart: {
      size: {
        M: s2Size(6),
        L: s2Size(9),
      },
    },
  },
  getAllowedOverrides(),
);

export const breadcrumbStyles = style<{
  size?: S2BreadcrumbsSize;
  isDisabled?: boolean;
  isCurrent?: boolean;
  isMenu?: boolean;
  isHovered?: boolean;
  isFocusVisible?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
}>({
  ...focusRing(),
  display: {
    default: "block",
    isMenu: "flex",
  },
  alignItems: {
    isMenu: "center",
  },
  justifyContent: {
    isMenu: "start",
  },
  height: {
    isMenu: controlSize(),
  },
  transition: "default",
  position: "relative",
  flexShrink: 0,
  borderStyle: "none",
  borderRadius: "sm",
  font: controlFont(),
  color: {
    default: baseColor("neutral-subdued"),
    isDisabled: baseColor("neutral-subdued"),
    isCurrent: baseColor("neutral"),
    forcedColors: {
      default: "LinkText",
      isDisabled: "GrayText",
      isCurrent: "GrayText",
    },
  },
  marginStart: {
    isMenu: s2Size(-6),
  },
  textDecoration: {
    default: "none",
    isHovered: "underline",
    isFocusVisible: "underline",
    isDisabled: "none",
  },
  cursor: {
    default: "pointer",
    isDisabled: "default",
    isCurrent: "default",
  },
  outlineColor: {
    default: "focus-ring",
    forcedColors: "Highlight",
  },
  disableTapHighlight: true,
});

export const currentStyles = style<{ size: S2BreadcrumbsSize }>({
  font: controlFont(),
  fontWeight: "bold",
  color: {
    default: "neutral",
    forcedColors: "ButtonText",
  },
});

export const chevronStyles = style<{ direction?: "ltr" | "rtl"; isMenu?: boolean }>({
  scale: {
    direction: {
      rtl: -1,
    },
  },
  marginStart: {
    default: "text-to-visual",
    isMenu: 0,
  },
  color: {
    default: "neutral",
    forcedColors: {
      default: "LinkText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});
