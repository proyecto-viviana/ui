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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Menu.tsx

// Port of packages/@react-spectrum/s2/src/Menu.tsx.

import type {
  MenuItemRenderProps,
  MenuRenderProps,
  PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";
import {
  baseColor,
  focusRing,
  fontRelative,
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
      /* Viviana UI v2 (Glasselated): a floating overlay wears the PANEL surface whole.
       * `layer-1` resolves to `var(--surface-panel)` in the theme's backgroundColor map
       * and pairs with `--blur-panel` and the 14px `panel` radius below. This was
       * `layer-2` (= `var(--surface-card)`) sitting on the `panel` radius — the card's
       * fill and blur on the panel's corner, which is not a surface the register draws. */
      default: "layer-1",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  /* The panel register is open-coded here rather than spread from
   * `glassSurface("panel")` (s2-internal/style-utils.ts), for two reasons specific to
   * this surface. (1) The fill has to stay behind the `--s2-container-bg` custom
   * property: the theme's auto/overlay colors are computed against it
   * (`autoStaticColor`/`generateOverlayColorScale` both default to
   * `var(--s2-container-bg)`, style/tokens.ts), so descendants lose their contrast
   * reference if it is replaced by a direct `backgroundColor`. (2) This surface paints
   * its edge with `outline` (see the bottom of this object) where the helper paints a
   * `border`, so spreading it would draw a second 1px edge and shift the box metrics.
   * The blur is the load-bearing half: translucent fill plus blur is what reads as glass. */
  backdropFilter: "var(--blur-panel)",
  /* Not a cast shadow: the theme points `elevated`, `emphasized` and `edge-glass` at
   * one shared inset-rim value, so this already resolves to the register's rim. Left
   * spelled `elevated` deliberately — it is the same value, and the token map is where
   * that decision lives. */
  boxShadow: "elevated",
  borderRadius: "panel",
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
  /* 1px `--border-subtle` — the register's glass-surface edge, reached through the
   * `border-subtle` key the theme's outlineColor map exposes alongside borderColor's.
   * The previous value was `lightDark("transparent-white-25", "gray-200")`, and
   * `transparent-white-25` is the 25th STOP of Spectrum's transparent-white ramp
   * (`rgba(255, 255, 255, 0)` in @adobe/spectrum-tokens color-palette.json), not 25%
   * white — so light drew no edge at all while dark drew a solid gray. An edge that is
   * present in one scheme and absent in the other is wrong under any register. */
  outlineColor: {
    default: "border-subtle",
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
  // Upstream `menu` uses a single `overflow: {isPopover: 'auto'}` (both axes auto
  // in the popover case). The port always renders the menu inside its popover, so
  // `overflow: "auto"` matches byte-for-byte (`overflow-x`/`overflow-y` both
  // resolve to `auto`); the previous `overflowX: "hidden"` was a self-inflicted
  // divergence D1 caught. `maxWidth`/`padding` stay unconditional here (the
  // isPopover gating is a tracked deferred divergence, D1-safe while in popover).
  overflow: "auto",
  maxWidth: 320,
  padding: 8,
  fontFamily: "sans",
  fontSize: controlFont(),
  gridAutoRows: "min-content",
  // The menu root is a `<div role="menu">` (faithful to upstream RAC), so no
  // list-element compensation is needed; `margin: 0` matches upstream's div.
  margin: 0,
});

export const menuItem = style<S2MenuItemStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", wrap: true, icon: true, register: "row" }),
  columnGap: 0,
  paddingX: 0,
  paddingBottom: "--labelPadding",
  /* Viviana UI v2 (Glasselated): a register row is never painted. The handoff's nav and
   * list rows are transparent at rest, on hover and when selected — state is carried by
   * ink (the label shifting toward the accent) and by the leading mark fading in, not by
   * a fill. `baseColor("gray-100").isFocusVisible` baked an opaque ramp stop here, a
   * solid bar the register does not draw at any time.
   * Keyboard focus is not weakened: `focusRing()` above still draws a 2px ring on
   * isFocusVisible, and it cannot be clipped here — the `menu` container that scrolls
   * (`overflow: "auto"`) carries `padding: 8`, so the ring's 2px offset plus 2px width
   * stays 4px inside the clip edge. That leaves isFocused free to mean the register's
   * hover/highlight.
   * The forced-colors fill is the one that stays: `forcedColorAdjust: "none"` at the
   * bottom of this object opts the item out of the OS override, so high-contrast mode
   * needs us to paint Highlight ourselves, paired with HighlightText in `color` below. */
  backgroundColor: {
    default: "transparent",
    forcedColors: {
      default: "transparent",
      isFocused: "Highlight",
    },
  },
  color: {
    /* Highlight is expressed as ink. `accent` is full-strength in the register — the
     * strength the handoff gives a SELECTED row's label — and it is used here for
     * hover/highlight rather than for selection because a menu item has no persistent
     * selected-label state: selection is the checkmark that occupies its own grid area
     * (see `menuItemCheckmark`). Ordered after `default` and before `isDisabled` so a
     * disabled row still reads disabled when hovered. */
    default: baseColor("neutral"),
    isFocused: "accent",
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
  // Upstream `menuitem` uses `transition: 'transform'` (pressScale only), not the
  // broad `'default'` property set — matched here so the item's
  // `transition-property` computed value is identical (a D1 finding).
  transition: "transform",
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
  // Upstream `description` has NO `transition` — the port's `transition: "default"`
  // was self-inflicted (D1 caught the differing `transition-property`).
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
