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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Popover.tsx

// Port of packages/@react-spectrum/s2/src/Popover.tsx.

import { type JSX, Show, splitProps } from "solid-js";
import {
  Popover as HeadlessPopover,
  PopoverTrigger as HeadlessPopoverTrigger,
  OverlayArrow as HeadlessOverlayArrow,
  type PopoverProps as HeadlessPopoverProps,
  type PopoverTriggerProps as HeadlessPopoverTriggerProps,
  type PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { setColorScheme, style } from "../style" with { type: "macro" };
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import { useTheme, type ColorScheme } from "../provider";

export type PopoverPlacement = NonNullable<HeadlessPopoverProps["placement"]>;
export type Placement = PopoverPlacement;
export type PlacementAxis = NonNullable<PopoverRenderProps["placement"]>;
export type PopoverSize = "S" | "M" | "L";
/** Mirrors upstream S2: padding is applied to the popover's inner content div. */
export type PopoverPadding = "default" | "none";

export interface PopoverTriggerProps extends HeadlessPopoverTriggerProps {
  /** The children of the popover trigger (trigger element and popover). */
  children: JSX.Element;
}

export interface PopoverProps extends Omit<HeadlessPopoverProps, "class" | "style" | "children"> {
  /** The content of the popover. */
  children: JSX.Element;
  /** DOM id for the popover element. */
  id?: string;
  /** Accessible label for the popover. */
  "aria-label"?: string;
  /** Id of the element that labels the popover. */
  "aria-labelledby"?: string;
  /** Id of the element that describes the popover. */
  "aria-describedby"?: string;
  /** The position of the popover relative to the trigger. */
  placement?: PopoverPlacement;
  /** Size variant of the popover. */
  size?: PopoverSize;
  /** Additional CSS class name. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Whether to hide the arrow pointing to the trigger. */
  hideArrow?: boolean;
  /** Custom padding inside the popover. */
  padding?: PopoverPadding;
}

const popoverStyles = style<
  PopoverRenderProps & {
    colorScheme: ColorScheme | null;
    isArrowShown: boolean;
    isSubmenu: boolean;
    size?: PopoverSize;
  }
>({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      /* Terminal Glass: a popover is TIER 2 — it lands OVER a panel or a card, so it
       * takes the float surface (`var(--surface-float)`, alpha .9) rather than the
       * panel's .62. This was `layer-1` (= `--surface-panel`) paired with
       * `--blur-panel`: a panel-weight translucency stacked on a panel has no visible
       * boundary against the surface underneath it, and its text sits on whatever that
       * surface was showing. Same tier as the menu, toast and tooltip; the shared value
       * is `glassSurface("float")` (s2-internal/style-utils.ts). */
      default: "float",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  /* The float register is open-coded here rather than spread from
   * `glassSurface("float")` (s2-internal/style-utils.ts), for two reasons specific to
   * this surface. (1) The fill has to stay behind the `--s2-container-bg` custom
   * property: `arrowStyles` below paints the arrow with `fill: "--s2-container-bg"`,
   * and the theme's auto/overlay color helpers compute against it as well
   * (`autoStaticColor`/`generateOverlayColorScale`, style/tokens.ts) — replacing it
   * with a direct `backgroundColor` would leave the arrow unfilled. (2) This surface
   * paints its edge with `outline` (below) where the helper paints a `border`, so
   * spreading it would draw a second 1px edge and shift the box metrics the arrow is
   * positioned against. Blur is the load-bearing half: translucent fill plus blur is
   * what reads as glass, and blur cannot ride on a background-color. */
  backdropFilter: "var(--blur-clear)",
  borderRadius: "default",
  /* The float is the ONE tier in this register that casts. Panels and cards carry the
   * inset rim alone, but a float lands on a surface of the same family, where a rim
   * cannot separate the two edges — so it takes `--shadow-float` (the handoff's `sh2`)
   * AND the rim, exactly as the handoff's own tier-2 overlays do
   * (`box-shadow: var(--sh2), var(--edge-glass)`, Lesson Player toast / App popover).
   * Both stay unconditional, arrow shown or not: the rim is an INSET shadow, clipped to
   * the padding box, so it cannot spill onto the arrow, and the arrow carries its own
   * edge via `stroke` in `arrowStyles` below. The `filter` map is deliberately not used
   * — it is the one shadow map still resolving to a Spectrum cast drop-shadow, an
   * elevation vocabulary this register does not speak. */
  boxShadow: "[var(--shadow-float), var(--edge-glass)]",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    /* Terminal Glass draws the tier-2 edge in `--track`, not in the glass hairline the
     * panel/card tiers use: a float sits on a lit surface rather than on the page, and
     * `--border-subtle` disappears against it (App speed menu and popover, both
     * `border:1px solid var(--track)`). */
    default: "[var(--track)]",
    forcedColors: "ButtonBorder",
  },
  width: {
    size: {
      S: 336,
      M: 416,
      L: 576,
    },
  },
  maxWidth: "calc(100vw - 24px)",
  boxSizing: "border-box",
  display: "flex",
  opacity: {
    isEntering: 0,
    isExiting: 0,
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
    isSubmenu: 0,
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
    isSubmenu: 0,
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  isolation: "isolate",
  pointerEvents: {
    isExiting: "none",
  },
});

// Byte-copied from upstream S2 `Popover.tsx` `innerDivStyle`. In upstream the
// exported `Popover` paints TWO nested divs: the `AriaPopover` surface (the
// `popover()`/`popoverStyles` box — bg, outline, radius, shadow, size width)
// and an inner content div carrying the padding + scroll. `padding` defaults to
// `'default'` (8px), `'none'` is 0 — the whole `none|sm|md|lg` scale (and its
// `md`=16 default merged onto the surface) was a self-inflicted divergence.
const innerDivStyle = style<{ padding: PopoverPadding }>(
  {
    padding: {
      padding: {
        default: 8,
        none: 0,
      },
    },
    boxSizing: "border-box",
    outlineStyle: "none",
    borderRadius: "inherit",
    overflow: "auto",
    position: "relative",
    width: "full",
    maxSize: "inherit",
  },
  getAllowedOverrides({ height: true }),
);

const arrowStyles = style<PopoverRenderProps>({
  display: "block",
  fill: "--s2-container-bg",
  width: 18,
  height: 9,
  rotate: {
    default: 180,
    placement: {
      top: 0,
      bottom: 180,
      left: -90,
      right: 90,
    },
  },
  translateX: {
    placement: {
      left: "-25%",
      right: "25%",
    },
  },
  strokeWidth: 1,
  /* The arrow continues the surface's silhouette, so it wears the surface's edge:
   * 1px `--track`, the same value `popoverStyles` puts on its `outline`.
   * Was the same alpha-0-in-light `lightDark` pair as the outline — see the note
   * there. This stroke is now the only thing drawing the arrow's edge, the
   * `filter` drop-shadow having been removed from `popoverStyles`. */
  stroke: {
    default: "[var(--track)]",
    forcedColors: "ButtonBorder",
  },
});

/**
 * PopoverTrigger wraps around a trigger element and a Popover.
 * It handles opening and closing the Popover when the user interacts
 * with the trigger.
 *
 * @example
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Open Popover</Button>
 *   <Popover>
 *     <p>Popover content here!</p>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  return <HeadlessPopoverTrigger {...props} />;
}

/**
 * Styled popover component that displays content in an overlay.
 *
 * @example
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Settings</Button>
 *   <Popover placement="bottom" size="M">
 *     <h3>Settings</h3>
 *     <p>Configure your preferences here.</p>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
export function Popover(props: PopoverProps): JSX.Element {
  const theme = useTheme();
  let arrowElement: SVGSVGElement | null = null;
  const [local, rest] = splitProps(props, [
    "placement",
    "size",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "hideArrow",
    "padding",
    "offset",
    "arrowRef",
  ]);

  const placement = () => local.placement ?? "bottom";
  const padding = () => local.padding ?? "default";
  const offset = () => (local.offset ?? 8) + (local.hideArrow ? 0 : 8);
  const setArrowElement = (element: SVGSVGElement | null) => {
    arrowElement = element;
  };
  const arrowRef = () => (local.hideArrow ? (local.arrowRef?.() ?? null) : arrowElement);

  return (
    <HeadlessPopover
      {...rest}
      placement={placement()}
      offset={offset()}
      arrowRef={arrowRef}
      // Mirror upstream `PopoverBase`: the surface class is PURELY `popoverStyles`
      // (bg/outline/radius/shadow/size). `UNSAFE_className`/`class`/`styles` are
      // NOT merged here — upstream routes them to the inner content div below.
      class={(renderProps: PopoverRenderProps) =>
        popoverStyles({
          ...renderProps,
          colorScheme: theme.colorScheme,
          isArrowShown: !local.hideArrow,
          isSubmenu: renderProps.trigger === "SubmenuTrigger",
          size: local.size,
          trigger: renderProps.trigger,
        })
      }
      // Upstream sets `style={{...UNSAFE_style, zIndex: undefined}}` on the
      // surface to strip the positioning z-index (our createOverlayPosition
      // injects z-index:100000) and rely on `isolation: isolate` instead;
      // `UNSAFE_style` itself moves to the inner div.
      style={{ "z-index": undefined }}
    >
      {(renderProps: PopoverRenderProps) => (
        <>
          <Show when={!local.hideArrow}>
            <PopoverArrow placement={renderProps.placement} setArrowElement={setArrowElement} />
          </Show>
          {/* Upstream's exported `Popover` inner content div: padding + scroll,
              and the sink for UNSAFE/class/styles escape hatches. */}
          <div
            style={local.UNSAFE_style}
            class={[
              local.UNSAFE_className,
              local.class,
              innerDivStyle({ padding: padding() }, local.styles),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {props.children}
          </div>
        </>
      )}
    </HeadlessPopover>
  );
}

/**
 * Arrow component for the popover.
 * Automatically positions itself based on the popover placement.
 */
interface PopoverArrowProps {
  /** The current placement axis. */
  placement: PlacementAxis | null;
  /** Sets the arrow element for positioning measurements. */
  setArrowElement: (element: SVGSVGElement | null) => void;
}

function PopoverArrow(props: PopoverArrowProps): JSX.Element {
  const placement = () => props.placement ?? "bottom";

  // Mirror upstream `<OverlayArrow className=""><svg viewBox="0 0 18 10"
  // className={arrow(renderProps)}>`. The headless `OverlayArrow` self-positions
  // (position:absolute + `[placement]:100%` + arrowProps cross-offset), so no
  // positioning class is passed here — upstream passes an empty string.
  return (
    <HeadlessOverlayArrow
      class=""
      render={() => (
        <svg
          ref={props.setArrowElement}
          viewBox="0 0 18 10"
          class={arrowStyles({
            trigger: null,
            placement: placement(),
            isEntering: false,
            isExiting: false,
          })}
        >
          <path
            transform="translate(0 -1)"
            d="M1 1L7.93799 8.52588C8.07224 8.67448 8.23607 8.79362 8.41895 8.87524C8.60182 8.95687 8.79973 8.9993 9 9C9.19984 8.99882 9.39724 8.95606 9.57959 8.87427C9.76193 8.79248 9.9253 8.67336 10.0591 8.5249L17 1"
          />
        </svg>
      )}
    />
  );
}

export interface PopoverHeaderProps {
  /** The title of the popover. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Additional CSS class. */
  class?: string;
}

const popoverHeaderStyles = style({ marginBottom: 12 });
const popoverTitleStyles = style({ font: "heading-xs", color: "neutral" });
const popoverDescriptionStyles = style({ font: "ui-sm", color: "neutral-subdued", marginTop: 4 });

/**
 * Header section for popover with title and optional description.
 */
export function PopoverHeader(props: PopoverHeaderProps): JSX.Element {
  return (
    <div class={[popoverHeaderStyles, props.class].filter(Boolean).join(" ")}>
      <h3 class={popoverTitleStyles}>{props.title}</h3>
      <Show when={props.description}>
        <p class={popoverDescriptionStyles}>{props.description}</p>
      </Show>
    </div>
  );
}

export interface PopoverFooterProps {
  /** Footer content, typically buttons. */
  children: JSX.Element;
  /** Additional CSS class. */
  class?: string;
}

const popoverFooterStyles = style({
  display: "flex",
  gap: 8,
  justifyContent: "end",
  marginTop: 16,
  paddingTop: 12,
  borderWidth: 0,
  borderTopWidth: 1,
  borderStyle: "solid",
  /* The register's own hairline, not a ramp stop: `gray-300` is markedly too light
   * against the float fill in dark and reads as a second border in light. */
  borderColor: "[var(--border-hair)]",
});

/**
 * Footer section for popover actions.
 */
export function PopoverFooter(props: PopoverFooterProps): JSX.Element {
  return (
    <div class={[popoverFooterStyles, props.class].filter(Boolean).join(" ")}>{props.children}</div>
  );
}

export type { PopoverRenderProps };
