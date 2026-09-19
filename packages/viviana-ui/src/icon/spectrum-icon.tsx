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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Icon.tsx

// Port of packages/@react-spectrum/s2/src/Icon.tsx.
import { createContext, useContext } from "solid-js";
import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { mergeContextRefs, type RefLike } from "../button/spectrum-context";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import {
  createIsSkeleton,
  loadingStyle,
  useInertAttribute,
  useLoadingAnimation,
  useSkeletonIcon,
} from "../skeleton";

export interface IconContextValue {
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  render?: (icon: JSX.Element) => JSX.Element;
  size?: "S" | "M" | "L";
}

export const IconContext = createContext<IconContextValue>({});
export const IllustrationContext = createContext<IconContextValue>({});

export interface SpectrumIconProps
  extends Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "aria-hidden"> {
  styles?: StyleString;
  "aria-hidden"?: boolean | "false" | "true" | JSX.RemoveAttribute;
  UNSAFE_suppressDataSlot?: boolean;
}

export interface SpectrumIllustrationProps extends SpectrumIconProps {
  size?: "S" | "M" | "L";
}

type SpectrumSvgComponentProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  focusable?: boolean | "false" | "true";
  size?: "S" | "M" | "L";
};

const illustrationSizes = {
  S: 48,
  M: 96,
  L: 160,
} as const;

const iconAllowedOverrides = [
  "margin",
  "marginStart",
  "marginEnd",
  "marginTop",
  "marginBottom",
  "marginX",
  "marginY",
  "justifySelf",
  "alignSelf",
  "order",
  "gridArea",
  "gridRowStart",
  "gridRowEnd",
  "gridColumnStart",
  "gridColumnEnd",
  "position",
  "zIndex",
  "top",
  "bottom",
  "inset",
  "insetX",
  "insetY",
  "insetStart",
  "insetEnd",
  "rotate",
  "--iconPrimary",
  "size",
] as const;

const iconBaseStyles = style(
  {
    size: 20,
    flexShrink: 0,
  },
  iconAllowedOverrides,
);

// UI icons (chevrons, checkmarks, crosses, …) are raw SVGs upstream
// (`@react-spectrum/s2/ui-icons/*` never pass through Icon.tsx). Size maps
// live on each generated ui-icon (Checkmark.tsx `styles({size})`), not here.
// Do not invent flexShrink: S2 Checkmark computes flex-shrink: 1.

const illustrationBaseStyles = style(
  {
    size: {
      size: illustrationSizes,
    },
    flexShrink: 0,
  },
  iconAllowedOverrides,
);

export function createIcon(Component: Component<SpectrumSvgComponentProps>, context = IconContext) {
  return createIconForBase(Component, context, iconBaseStyles);
}

export function createUIIcon(
  Component: Component<SpectrumSvgComponentProps>,
  context = IconContext,
) {
  // UI icons (Cross, Chevron, Checkmark, …) are rendered as the RAW svg upstream
  // (`@react-spectrum/s2` imports `../ui-icons/*` directly — the generated
  // components spread `{...otherProps}` onto the imported asset and never pass
  // through the `Icon` wrapper). Those assets carry NO `role` and NO `aria-hidden`,
  // so upstream ui-icons are bare `<svg>`: Chrome still exposes them as unnamed
  // `img` nodes (matching the CloseButton cross React shows in the AX tree), but
  // axe's `svg-img-alt` rule only flags an *explicit* `svg[role="img"]`, so
  // upstream stays clean. Mirror that exactly — `bare` mode drops the forced
  // `role="img"` and the auto `aria-hidden`; only pass what a call site asks for.
  // Bare mode also skips IconContext `render`/`styles`/`slot`: S2 Checkmark sits
  // inside ComboBoxItem's IconContext Provider and still paints as a raw svg in
  // `gridArea: checkmark`. Workflow `createIcon` keeps consuming IconContext.
  // (parity rule #1/#2)
  return createIconForBase(Component, context, iconBaseStyles, true);
}

function createIconForBase(
  Component: Component<SpectrumSvgComponentProps>,
  context: typeof IconContext,
  baseStyles: typeof iconBaseStyles,
  bare = false,
) {
  return (props: SpectrumIconProps): JSX.Element => {
    const ctx = useContext(context);
    const [local, rest] = splitProps(props, [
      "slot",
      "styles",
      "class",
      "style",
      "aria-label",
      "aria-hidden",
      "UNSAFE_suppressDataSlot",
      "size" as keyof SpectrumIconProps,
    ]);
    const slot = () => {
      if (local.UNSAFE_suppressDataSlot) {
        return undefined;
      }

      // S2 ui-icons never pass through Icon.tsx, so they never inherit
      // IconContext.slot. Explicit `slot` on the call site still wins.
      if (bare) {
        return local.slot ?? undefined;
      }

      return local.slot ?? ctx.slot ?? undefined;
    };
    const contextStyles = () => {
      if (bare) {
        return undefined;
      }
      return typeof ctx.styles === "function" ? ctx.styles() : ctx.styles;
    };
    const isSkeleton = createIsSkeleton();
    const skeletonAnimationRef = useLoadingAnimation(isSkeleton);
    const inertRef = useInertAttribute(isSkeleton);
    const skeletonStyles = useSkeletonIcon(() =>
      mergeStyles(
        // Bare ui-icons skip Icon.tsx wrapper styles (S2 spreads className onto
        // the asset). Workflow icons keep `iconBaseStyles` (`size: 20`).
        bare ? local.styles : baseStyles(null, local.styles),
        contextStyles(),
      ),
    );
    const skeletonRef = (element: SVGSVGElement) => {
      skeletonAnimationRef(element);
      inertRef(element);
    };

    const mergedClass = () =>
      [local.class, skeletonStyles(), isSkeleton() ? loadingStyle : undefined]
        .filter(Boolean)
        .join(" ");

    const ariaHidden = () => {
      if (local["aria-label"] || bare) {
        const value = local["aria-hidden"];
        if (value === true || value === "true") return "true" as const;
        if (value === false || value === "false") return "false" as const;
        return undefined;
      }

      return "true" as const;
    };

    const svg = (
      <Component
        {...rest}
        ref={mergeContextRefs((rest as { ref?: RefLike<SVGSVGElement> }).ref, skeletonRef)}
        {...(bare ? {} : { focusable: "false" as const, role: "img" as const })}
        aria-label={local["aria-label"]}
        aria-hidden={ariaHidden()}
        data-slot={slot()}
        class={mergedClass()}
        style={local.style}
      />
    );

    // S2 ui-icons never call IconContext.render (centerBaseline / gridArea: icon).
    return !bare && ctx.render ? ctx.render(svg) : svg;
  };
}

export function createIllustration(Component: Component<SpectrumSvgComponentProps>) {
  return (props: SpectrumIllustrationProps): JSX.Element => {
    const ctx = useContext(IllustrationContext);
    const [local, rest] = splitProps(props, [
      "slot",
      "styles",
      "class",
      "style",
      "aria-label",
      "aria-hidden",
      "size",
      "UNSAFE_suppressDataSlot",
    ]);
    const slot = () => {
      if (local.UNSAFE_suppressDataSlot) {
        return undefined;
      }

      return local.slot ?? ctx.slot ?? undefined;
    };
    const size = () => local.size ?? ctx.size ?? "M";
    const contextStyles = () => (typeof ctx.styles === "function" ? ctx.styles() : ctx.styles);

    const mergedClass = () =>
      [
        local.class,
        mergeStyles(illustrationBaseStyles({ size: size() }, local.styles), contextStyles()),
      ]
        .filter(Boolean)
        .join(" ");

    const ariaHidden = () => {
      if (local["aria-label"]) {
        const value = local["aria-hidden"];
        if (value === true || value === "true") return "true" as const;
        if (value === false || value === "false") return "false" as const;
        return undefined;
      }

      return "true" as const;
    };

    const svg = (
      <Component
        {...rest}
        size={size()}
        focusable="false"
        role="img"
        aria-label={local["aria-label"]}
        aria-hidden={ariaHidden()}
        data-slot={slot()}
        class={mergedClass()}
        style={local.style}
      />
    );

    return ctx.render ? ctx.render(svg) : svg;
  };
}
