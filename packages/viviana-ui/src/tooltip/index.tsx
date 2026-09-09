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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Tooltip.tsx

// Port of packages/@react-spectrum/s2/src/Tooltip.tsx.

import { type JSX, Show, splitProps } from "solid-js";
import {
  Tooltip as HeadlessTooltip,
  TooltipTrigger as HeadlessTooltipTrigger,
  type TooltipPlacement,
  type TooltipProps as HeadlessTooltipProps,
  type TooltipTriggerComponentProps as HeadlessTooltipTriggerProps,
  type TooltipRenderProps,
  type TooltipResolvedPlacement,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { centerPadding, setColorScheme, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useTheme, type ColorScheme } from "../provider";

export type { TooltipPlacement };
export type TooltipVariant = "default" | "neutral" | "info";

export interface TooltipTriggerProps extends HeadlessTooltipTriggerProps {
  /** The children of the tooltip trigger (trigger element and tooltip). */
  children: JSX.Element;
}

export interface TooltipProps extends Omit<HeadlessTooltipProps, "class" | "style" | "children"> {
  /** The content of the tooltip. */
  children: JSX.Element;
  /** The position of the tooltip relative to the trigger. */
  placement?: TooltipPlacement;
  /** Deprecated legacy visual variant. Spectrum 2 tooltips use a single neutral treatment. */
  variant?: TooltipVariant;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible arrow toggle. Spectrum 2 tooltips render an arrow by default. */
  showArrow?: boolean;
}

const tooltip = style<TooltipRenderProps & { colorScheme: ColorScheme | null }>({
  ...setColorScheme(),
  justifyContent: "center",
  alignItems: "center",
  maxWidth: 160,
  minHeight: 24,
  boxSizing: "border-box",
  font: "ui-sm",
  color: {
    /* The float tier's ink. `gray-25` was the near-white that paired with the opaque
     * `neutral` fill below; over a translucent LIGHT-scheme float it is near-white on
     * near-white. `gray-800` is the stop the register pins to its primary ink and the
     * one `heading`/`title` already resolve to (style/spectrum-theme.ts), so it flips
     * with the scheme the way the surface under it does. */
    default: "gray-800",
    forcedColors: "ButtonText",
  },
  borderWidth: {
    default: 1,
    forcedColors: 1,
  },
  borderStyle: {
    default: "solid",
    forcedColors: "solid",
  },
  borderColor: {
    default: "[var(--track)]",
    forcedColors: "transparent",
  },
  /* Terminal Glass tier 2. A tooltip is the smallest float, but it is a float: it lands
   * over a panel, a card or a control, and it is the same family as the popover and the
   * menu that can open from the same trigger. It was the one overlay left opaque
   * (`neutral`, a solid dark ramp stop), which read as a Spectrum tooltip parked on a
   * Terminal Glass page — and in the light scheme it was a black chip.
   *
   * Kept behind `--s2-container-bg` so `arrowStyles` below can paint the arrow with the
   * same fill; without the custom property the arrow would need its own copy of the
   * token and would drift from the body the first time the surface moved. */
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "float",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  backdropFilter: "var(--blur-clear)",
  /* Float elevation: `--shadow-float` plus the `--edge-glass` rim, the pair the handoff
   * puts on every tier-2 overlay. A tooltip needs it more than the others do — it is the
   * smallest surface and the one most often shown over dense content. */
  boxShadow: "[var(--shadow-float), var(--edge-glass)]",
  // The register's control corner: a tooltip is label-sized, so it keeps the 5px
  // button corner rather than the 8px the larger floats take.
  borderRadius: "control",
  fontFamily: "code",
  paddingX: "edge-to-text",
  paddingY: centerPadding(),
  transition: "default",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  translateX: {
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
  translateY: {
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
  opacity: {
    isEntering: 0,
    isExiting: 0,
  },
  overflowWrap: {
    default: "break-word",
  },
});

const arrowStyles = style<TooltipRenderProps>({
  display: "block",
  /* Same fill as the body — `gray-800` was the opaque neutral's near-match and left a
   * solid dark spike hanging off a translucent tooltip. */
  fill: "--s2-container-bg",
  width: 10,
  height: 5,
  rotate: {
    placement: {
      top: 0,
      bottom: "180deg",
      left: "-90deg",
      right: "90deg",
    },
  },
  translateX: {
    placement: {
      left: "-25%",
      right: "25%",
    },
  },
});

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip.
 * It handles opening and closing the Tooltip when the user hovers
 * over or focuses the trigger.
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Hover me</Button>
 *   <Tooltip>This is helpful information</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  return <HeadlessTooltipTrigger {...props} />;
}

/**
 * Styled tooltip component that displays a description on hover or focus.
 *
 * @example
 * ```tsx
 * <TooltipTrigger placement="top">
 *   <Button>Save</Button>
 *   <Tooltip>Save your changes</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const theme = useTheme();
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "showArrow",
    "variant",
  ]);

  const showArrow = () => local.showArrow !== false;

  return (
    <HeadlessTooltip
      {...rest}
      arrowBoundaryOffset={8}
      arrowSize={10}
      offset={9}
      class={(renderProps: TooltipRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          mergeStyles(
            tooltip({
              ...renderProps,
              placement: renderProps.placement ?? "top",
              colorScheme: theme.colorScheme,
            }),
            local.styles,
          ),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={local.UNSAFE_style}
    >
      {(renderProps: TooltipRenderProps) => (
        <>
          <Show when={showArrow()}>
            {/* Faithful to upstream S2 `<OverlayArrow className="">`, which wraps
                the arrow `<svg>` with NO `aria-hidden` — so the svg surfaces as a
                `role="img"` node inside the tooltip's AX subtree (verified against
                `@react-spectrum/s2@1.5.1`). An earlier port hand-hid the arrow
                (`aria-hidden`), a self-inflicted divergence from upstream. */}
            <div
              data-rsp-slot="tooltip-arrow"
              style={arrowFrameStyle(renderProps.placement ?? "top")}
            >
              <svg
                class={arrowStyles({ ...renderProps, placement: renderProps.placement ?? "top" })}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 10 5"
              >
                <path d="M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z" />
              </svg>
            </div>
          </Show>
          {local.children}
        </>
      )}
    </HeadlessTooltip>
  );
}

function arrowFrameStyle(placement: TooltipResolvedPlacement): JSX.CSSProperties {
  const base: JSX.CSSProperties = {
    position: "absolute",
  };

  switch (placement) {
    case "bottom":
      return { ...base, bottom: "100%", left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { ...base, left: "100%", top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { ...base, right: "100%", top: "50%", transform: "translateY(-50%)" };
    case "top":
    default:
      return { ...base, top: "100%", left: "50%", transform: "translateX(-50%)" };
  }
}

export interface SimpleTooltipProps {
  /** The content to show in the tooltip */
  label: string;
  /** The trigger element */
  children: JSX.Element;
  /** Position of the tooltip */
  position?: "top" | "bottom";
  /** Additional CSS class */
  class?: string;
}

/**
 * Simple CSS-only tooltip component.
 * Uses CSS hover effect for performance. No JS state management.
 *
 * @deprecated Use the accessible Tooltip + TooltipTrigger components instead.
 *
 * @example
 * ```tsx
 * <SimpleTooltip label="Save your changes">
 *   <button>Save</button>
 * </SimpleTooltip>
 * ```
 */
export function SimpleTooltip(props: SimpleTooltipProps): JSX.Element {
  const position = () => props.position ?? "bottom";

  return (
    <div class={`vui-tooltip ${props.class ?? ""}`}>
      <div class="vui-tooltip__trigger">{props.children}</div>
      <div class={`vui-tooltip__content vui-tooltip__content--${position()}`}>
        <span>{props.label}</span>
      </div>
    </div>
  );
}

export type { TooltipRenderProps };
