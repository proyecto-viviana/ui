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

import { baseColor, focusRing, lightDark, style } from "../style";
import { linearGradient } from "../style/spectrum-theme";
import { control, getAllowedOverrides, staticColor } from "../s2-internal/style-utils";
import type { ButtonFillStyle, ButtonSize, ButtonVariant, StaticColor } from "./types";

export interface S2ButtonRenderState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocused?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
  isPending?: boolean;
}

export interface S2ButtonStyleProps extends S2ButtonRenderState {
  variant: ButtonVariant;
  fillStyle: ButtonFillStyle;
  size: ButtonSize;
  staticColor?: StaticColor;
  isStaticColor: boolean;
}

export const s2Button = style<S2ButtonStyleProps>(
  {
    ...focusRing(),
    ...staticColor(),
    ...control({ shape: "pill", wrap: true, icon: true }),
    position: "relative",
    justifyContent: "center",
    textAlign: "start",
    fontWeight: "bold",
    userSelect: "none",
    width: "fit",
    textDecoration: "none",
    transition: "default",
    borderStyle: "solid",
    borderWidth: {
      fillStyle: {
        fill: 0,
        outline: 2,
      },
      variant: {
        premium: 0,
        genai: 0,
      },
    },
    borderColor: {
      variant: {
        primary: baseColor("gray-800"),
        secondary: baseColor("gray-300"),
      },
      isDisabled: "disabled",
      isStaticColor: {
        variant: {
          primary: baseColor("transparent-overlay-800"),
          secondary: baseColor("transparent-overlay-300"),
        },
        isDisabled: "transparent-overlay-300",
      },
      forcedColors: {
        default: "ButtonBorder",
        isHovered: "Highlight",
        isDisabled: "GrayText",
      },
    },
    backgroundColor: {
      fillStyle: {
        fill: {
          variant: {
            primary: baseColor("neutral"),
            secondary: {
              default: "gray-100",
              isHovered: "gray-200",
              isPressed: "gray-200",
              isFocusVisible: "gray-200",
            },
            accent: {
              default: lightDark("accent-900", "accent-700"),
              isHovered: lightDark("accent-1000", "accent-600"),
              isPressed: lightDark("accent-1000", "accent-600"),
              isFocusVisible: lightDark("accent-1000", "accent-600"),
            },
            negative: {
              default: lightDark("negative-900", "negative-700"),
              isHovered: lightDark("negative-1000", "negative-600"),
              isPressed: lightDark("negative-1000", "negative-600"),
              isFocusVisible: lightDark("negative-1000", "negative-600"),
            },
            premium: "gray-100",
            genai: "gray-100",
          },
          isDisabled: "disabled",
        },
        outline: {
          variant: {
            premium: "gray-100",
            genai: "gray-100",
          },
          default: "transparent",
          isHovered: "gray-100",
          isPressed: "gray-100",
          isFocusVisible: "gray-100",
          isDisabled: {
            default: "transparent",
            variant: {
              premium: "gray-100",
              genai: "gray-100",
            },
          },
        },
      },
      isStaticColor: {
        fillStyle: {
          fill: {
            variant: {
              primary: baseColor("transparent-overlay-800"),
              secondary: baseColor("transparent-overlay-100"),
              premium: "transparent-overlay-100",
              genai: "transparent-overlay-100",
            },
            isDisabled: "transparent-overlay-100",
          },
          outline: {
            variant: {
              premium: "transparent-overlay-100",
              genai: "transparent-overlay-100",
            },
            default: "transparent",
            isHovered: "transparent-overlay-100",
            isPressed: "transparent-overlay-100",
            isFocusVisible: "transparent-overlay-100",
            isDisabled: {
              default: "transparent",
              variant: {
                premium: "transparent-overlay-100",
                genai: "transparent-overlay-100",
              },
            },
          },
        },
      },
      forcedColors: {
        fillStyle: {
          fill: {
            default: "ButtonText",
            isHovered: "Highlight",
            isDisabled: "GrayText",
          },
          outline: "ButtonFace",
        },
      },
    },
    color: {
      fillStyle: {
        fill: {
          variant: {
            primary: "gray-25",
            secondary: baseColor("neutral"),
            accent: "white",
            negative: "white",
            premium: "white",
            genai: "white",
          },
          isDisabled: "disabled",
        },
        outline: {
          default: baseColor("neutral"),
          variant: {
            premium: "white",
            genai: "white",
          },
          isDisabled: "disabled",
        },
      },
      isStaticColor: {
        fillStyle: {
          fill: {
            variant: {
              primary: "auto",
              secondary: baseColor("transparent-overlay-800"),
              premium: "white",
              genai: "white",
            },
          },
          outline: {
            variant: {
              premium: "white",
              genai: "white",
            },
            default: baseColor("transparent-overlay-800"),
          },
        },
        isDisabled: "transparent-overlay-400",
      },
      forcedColors: {
        fillStyle: {
          fill: {
            default: "ButtonFace",
            isDisabled: "HighlightText",
          },
          outline: {
            default: "ButtonText",
            isDisabled: "GrayText",
          },
        },
      },
    },
    "--iconPrimary": {
      type: "fill",
      value: "currentColor",
    },
    outlineColor: {
      default: "focus-ring",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "Highlight",
    },
    forcedColorAdjust: "none",
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

export const s2ButtonGradient = style<
  S2ButtonRenderState & { variant: Extract<ButtonVariant, "premium" | "genai"> }
>({
  position: "absolute",
  inset: 0,
  zIndex: -1,
  transition: "default",
  borderRadius: "inherit",
  backgroundImage: {
    variant: {
      premium: {
        default: linearGradient(
          "to bottom right",
          ["fuchsia-900", 0],
          ["indigo-900", 66],
          ["blue-900", 100],
        ),
        isHovered: linearGradient(
          "to bottom right",
          ["fuchsia-1000", 0],
          ["indigo-1000", 66],
          ["blue-1000", 100],
        ),
        isPressed: linearGradient(
          "to bottom right",
          ["fuchsia-1000", 0],
          ["indigo-1000", 66],
          ["blue-1000", 100],
        ),
        isFocusVisible: linearGradient(
          "to bottom right",
          ["fuchsia-1000", 0],
          ["indigo-1000", 66],
          ["blue-1000", 100],
        ),
      },
      genai: {
        default: linearGradient(
          "to bottom right",
          ["red-900", 0],
          ["magenta-900", 33],
          ["indigo-900", 100],
        ),
        isHovered: linearGradient(
          "to bottom right",
          ["red-1000", 0],
          ["magenta-1000", 33],
          ["indigo-1000", 100],
        ),
        isPressed: linearGradient(
          "to bottom right",
          ["red-1000", 0],
          ["magenta-1000", 33],
          ["indigo-1000", 100],
        ),
        isFocusVisible: linearGradient(
          "to bottom right",
          ["red-1000", 0],
          ["magenta-1000", 33],
          ["indigo-1000", 100],
        ),
      },
    },
    isDisabled: "none",
    forcedColors: "none",
  },
  colorScheme: {
    variant: {
      premium: "light",
      genai: "light",
    },
  },
});

export const s2ButtonText = style<{ isProgressVisible?: boolean }>({
  paddingY: "--labelPadding",
  order: 1,
  visibility: {
    isProgressVisible: "hidden",
  },
});

export const s2ButtonPendingIndicator = style<{
  isPending?: boolean;
  isProgressVisible?: boolean;
}>({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  visibility: {
    default: "hidden",
    isProgressVisible: "visible",
  },
});
