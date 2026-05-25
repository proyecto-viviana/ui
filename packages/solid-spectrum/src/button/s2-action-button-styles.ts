// @ts-nocheck
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  baseColor,
  focusRing,
  fontRelative,
  lightDark,
  style,
} from "../style" with { type: "macro" };
import {
  control,
  getAllowedOverrides,
  staticColor,
} from "../s2-internal/style-utils" with { type: "macro" };
import type {
  ActionButtonDensity,
  ActionButtonOrientation,
  ActionButtonSize,
} from "./group-context";
import type { StaticColor } from "./types";

export interface S2ActionButtonRenderState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocused?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
  isSelected?: boolean;
}

export interface S2ActionButtonStyleProps extends S2ActionButtonRenderState {
  size: ActionButtonSize;
  staticColor?: StaticColor;
  isStaticColor: boolean;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  density?: ActionButtonDensity;
  orientation?: ActionButtonOrientation;
  isJustified?: boolean;
  isInGroup: boolean;
}

const iconOnly =
  ":has([slot=icon], [data-slot=icon], [slot=avatar]):not(:has([data-rsp-slot=text]))";
const avatarOnly =
  ":has([slot=avatar]):not(:has([slot=icon], [data-slot=icon], [data-rsp-slot=text]))";
const textOnly =
  ":has([data-rsp-slot=text]):not(:has([slot=icon], [data-slot=icon], [slot=avatar]))";
const controlStyle = control({ shape: "default", icon: true });
const defaultActionButtonBackground = {
  default: {
    default: "gray-100",
    isQuiet: "transparent",
  },
  isHovered: "gray-200",
  isPressed: "gray-200",
  isFocusVisible: "gray-200",
};
const staticActionButtonBackground = {
  default: {
    default: "transparent-overlay-100",
    isQuiet: "transparent",
  },
  isHovered: "transparent-overlay-200",
  isPressed: "transparent-overlay-200",
  isFocusVisible: "transparent-overlay-200",
};

export const s2ActionButton = style<S2ActionButtonStyleProps>(
  {
    ...focusRing(),
    ...staticColor(),
    ...controlStyle,
    display: "grid",
    justifyContent: "center",
    flexShrink: {
      default: 1,
      isInGroup: 0,
    },
    flexGrow: {
      isJustified: 1,
    },
    flexBasis: {
      isJustified: 0,
    },
    fontWeight: "medium",
    width: "fit",
    userSelect: "none",
    transition: "default",
    forcedColorAdjust: "none",
    position: "relative",
    gridTemplateAreas: {
      default: ["icon text"],
      [iconOnly]: ["icon"],
      [textOnly]: ["text"],
    },
    gridTemplateColumns: {
      default: ["auto", "auto"],
      [iconOnly]: ["auto"],
      [textOnly]: ["auto"],
    },
    backgroundColor: {
      default: defaultActionButtonBackground,
      isSelected: {
        default: baseColor("neutral"),
        isEmphasized: {
          default: lightDark("accent-900", "accent-700"),
          isHovered: lightDark("accent-1000", "accent-600"),
          isPressed: lightDark("accent-1000", "accent-600"),
          isFocusVisible: lightDark("accent-1000", "accent-600"),
        },
        isDisabled: {
          default: "gray-100",
          isQuiet: "transparent",
        },
      },
      forcedColors: {
        default: "ButtonFace",
        isSelected: {
          default: "Highlight",
          isDisabled: "ButtonFace",
        },
      },
    },
    color: {
      default: baseColor("neutral"),
      isSelected: {
        default: "gray-25",
        isEmphasized: "white",
      },
      isDisabled: "disabled",
      forcedColors: {
        default: "ButtonText",
        isSelected: "HighlightText",
        isDisabled: {
          default: "GrayText",
        },
      },
    },
    "--iconPrimary": {
      type: "fill",
      value: "currentColor",
    },
    outlineColor: {
      default: "focus-ring",
      forcedColors: "Highlight",
    },
    borderStyle: "none",
    borderTopStartRadius: {
      default: controlStyle.borderRadius,
      density: {
        compact: {
          default: "none",
          ":first-child": controlStyle.borderRadius,
        },
      },
    },
    borderTopEndRadius: {
      default: controlStyle.borderRadius,
      density: {
        compact: {
          default: "none",
          orientation: {
            horizontal: {
              ":last-child": controlStyle.borderRadius,
            },
            vertical: {
              ":first-child": controlStyle.borderRadius,
            },
          },
        },
      },
    },
    borderBottomStartRadius: {
      default: controlStyle.borderRadius,
      density: {
        compact: {
          default: "none",
          orientation: {
            horizontal: {
              ":first-child": controlStyle.borderRadius,
            },
            vertical: {
              ":last-child": controlStyle.borderRadius,
            },
          },
        },
      },
    },
    borderBottomEndRadius: {
      default: controlStyle.borderRadius,
      density: {
        compact: {
          default: "none",
          ":last-child": controlStyle.borderRadius,
        },
      },
    },
    zIndex: {
      isFocusVisible: 2,
    },
    disableTapHighlight: true,
    "--badgeTop": {
      type: "top",
      value: {
        default: "calc(self(height)/2 - var(--iconWidth)/2)",
        [textOnly]: 0,
      },
    },
    "--iconWidth": {
      type: "width",
      value: fontRelative(20),
    },
    "--badgePosition": {
      type: "width",
      value: {
        default: "--iconWidth",
        [textOnly]: "full",
      },
    },
    paddingX: {
      default: controlStyle.paddingX,
      [avatarOnly]: 0,
    },
    "--iconMargin": {
      type: "marginStart",
      value: {
        default: fontRelative(-2),
        [iconOnly]: 0,
        [avatarOnly]: 0,
      },
    },
  },
  getAllowedOverrides(),
);

export const s2ActionButtonStaticColor = style<S2ActionButtonStyleProps>(
  {
    backgroundColor: {
      default: staticActionButtonBackground,
      isSelected: {
        default: baseColor("transparent-overlay-800"),
        isDisabled: {
          default: "transparent-overlay-100",
          isQuiet: "transparent",
        },
      },
      forcedColors: {
        default: "ButtonFace",
        isSelected: {
          default: "Highlight",
          isDisabled: "ButtonFace",
        },
      },
    },
    color: {
      default: baseColor("transparent-overlay-800"),
      isSelected: "auto",
      isDisabled: "transparent-overlay-400",
      forcedColors: {
        default: "ButtonText",
        isSelected: "HighlightText",
        isDisabled: {
          default: "GrayText",
        },
      },
    },
    outlineColor: {
      default: "transparent-overlay-1000",
      forcedColors: "Highlight",
    },
  },
  getAllowedOverrides(),
);

export const s2ActionButtonText = style<{ isProgressVisible?: boolean }>({
  gridArea: "text",
  truncate: true,
  visibility: {
    isProgressVisible: "hidden",
  },
});

export const s2ToggleButtonText = style({
  paddingY: "--labelPadding",
  order: 1,
  truncate: true,
});

export const s2ActionButtonPendingIndicator = style<{ isProgressVisible?: boolean }>({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  visibility: {
    default: "hidden",
    isProgressVisible: "visible",
  },
});

export const s2ActionButtonProgressCircle = style<{ size: ActionButtonSize }>({
  size: {
    size: {
      XS: 12,
      S: 14,
      M: 18,
      L: 20,
      XL: 24,
    },
  },
});

export const s2ActionButtonGroup = style(
  {
    display: "flex",
    flexDirection: {
      orientation: {
        horizontal: "row",
        vertical: "column",
      },
    },
    gap: {
      density: {
        compact: 2,
        regular: {
          size: {
            XS: 4,
            S: 4,
            M: 8,
            L: 8,
            XL: 8,
          },
        },
      },
    },
  },
  getAllowedOverrides({ height: true }),
);

export const s2ButtonGroup = style(
  {
    display: "inline-flex",
    position: "relative",
    gap: {
      size: {
        S: 8,
        M: 12,
        L: 12,
        XL: 12,
      },
    },
    flexDirection: {
      default: "row",
      orientation: {
        vertical: "column",
      },
    },
    alignItems: {
      default: "center",
      orientation: {
        vertical: {
          default: "start",
          align: {
            end: "end",
            center: "center",
          },
        },
      },
    },
    justifyContent: {
      orientation: {
        vertical: {
          default: "start",
          align: {
            end: "end",
            center: "center",
          },
        },
      },
    },
  },
  getAllowedOverrides(),
);
