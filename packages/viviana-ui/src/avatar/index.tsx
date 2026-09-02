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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Avatar.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/AvatarGroup.tsx

// Port of packages/@react-spectrum/s2/src/Avatar.tsx.
// Port of packages/@react-spectrum/s2/src/AvatarGroup.tsx.

import { createContext, mergeProps, splitProps, type JSX, useContext } from "solid-js";
import { createLabel, filterDOMProps } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { centerBaselineBefore } from "../icon/center-baseline";
import { Image, ImageContext } from "../image";

export type AvatarSize =
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 44
  | 48
  | 56
  | 64
  | 80
  | 96
  | 112
  | number
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | `${number}lh`;

/* 30 is the register's stack size — Panel05's roster is 30×30 avatars
 * (TerminalGlassLab.tsx:688-704); the S2 enum would round it to 32. */
export type AvatarGroupSize = 16 | 20 | 24 | 28 | 30 | 32 | 36 | 40;

export interface AvatarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "slot" | "ref"
> {
  src?: string;
  alt?: string;
  /** The size of the avatar. @default 24 */
  size?: AvatarSize;
  /** Whether the avatar is over a color background. */
  isOverBackground?: boolean;
  /** @deprecated Not part of the S2 Avatar API. Kept as a no-op compatibility prop. */
  online?: boolean;
  /** @deprecated Not part of the S2 Avatar API. Kept as a no-op compatibility prop. */
  fallback?: string;
  class?: string;
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

export const AvatarContext = createContext<SpectrumContextValue<AvatarProps>>(null);
export const AvatarGroupContext = createContext<SpectrumContextValue<AvatarGroupProps>>(null);

const legacySizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
} as const;

const avatarRoot = style(
  {
    /* The plate an avatar shows before (or instead of) its image. `raised` rather than a
     * ramp step so it agrees with the knockout ring an AvatarGroup punches between stacked
     * avatars, which is already `--surface-raised` (spectrum-theme.ts, outlineColor.raised)
     * — ring and plate are the same surface seen from two sides, and drawing them from two
     * different families is what made the stack read as grey discs on a glass card. */
    backgroundColor: "raised",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    borderRadius: "full",
    size: 20,
    flexShrink: 0,
    flexGrow: 0,
    disableTapHighlight: true,
    outlineStyle: {
      default: "none",
      isOverBackground: "solid",
    },
    /* The register's knockout ring: one weight at every size, painted in the
     * OPAQUE raised-surface token rather than whatever the container happens to
     * be filled with. `--surface-raised` (#ffffff light / rgb(51,58,68) dark,
     * viviana-tokens.css:500/:199) is deliberately distinct from the translucent
     * `--surface-card` behind it, so stacked avatars punch through each other
     * instead of tinting through to the fill — which is why the container
     * variable is the wrong source here. See the `raised` entry in the
     * outlineColor map (style/spectrum-theme.ts) for the token rationale.
     *
     * Stays conditional on `isOverBackground` (outlineStyle above): the ring is
     * a stack-separation device — AvatarGroup sets isOverBackground on its
     * children — and a standalone avatar draws no ring. It also stays an
     * `outline`, not a `border`: the box is set by width/height on the Image
     * below, so a border would shrink the image rather than ring it. */
    outlineColor: "raised",
    outlineWidth: 2,
  },
  getAllowedOverrides({ width: false }),
);

const avatarGroupAvatar = style({
  /* The register overlaps stacked avatars by 30% of their diameter — Panel05's
   * roster is 30px avatars at margin-left -9px (TerminalGlassLab.tsx:697) —
   * where S2 tucked them a shallower 25%. One ratio for every size. */
  marginStart: {
    default: "calc(var(--size) * -0.3)",
    ":first-child": 0,
  },
});

const avatarGroupText = style({
  marginStart: 8,
  truncate: true,
  font: {
    size: {
      16: "ui-xs",
      20: "ui-sm",
      24: "ui",
      28: "ui-lg",
      30: "ui-xl",
      32: "ui-xl",
      36: "ui-2xl",
      40: "ui-3xl",
    },
  },
});

const avatarGroupContainer = style(
  {
    display: "flex",
    alignItems: "center",
  },
  getAllowedOverrides({ width: false }),
);

export function Avatar(props: AvatarProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local] = splitProps(merged, [
    "src",
    "alt",
    "size",
    "isOverBackground",
    "online",
    "fallback",
    "class",
    "slot",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);

  const sizeValue = () => local.size ?? 24;
  const isLHSize = (value: AvatarSize) => typeof value === "string" && value.endsWith("lh");
  const numericSize = (value: AvatarSize): number => {
    if (typeof value === "string") {
      return legacySizeMap[value as keyof typeof legacySizeMap] ?? Number(value);
    }
    return Number(value);
  };
  const remSize = () => {
    const value = sizeValue();
    if (isLHSize(value)) {
      return value as string;
    }
    return `${numericSize(value) / 16}rem`;
  };
  const slot = () =>
    local.slot === null ? undefined : (local.slot ?? contextProps?.slot ?? "avatar");
  const mergedStyle = (): JSX.CSSProperties | undefined => {
    const unsafeStyle = mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
    return {
      ...(unsafeStyle ?? {}),
      width: remSize(),
      height: remSize(),
    };
  };
  const rootClass = () =>
    [contextProps?.UNSAFE_className, local.UNSAFE_className, local.class, centerBaselineBefore]
      .filter(Boolean)
      .join(" ");

  return (
    <ImageContext.Provider value={{}}>
      <Image
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        slot={slot() ?? undefined}
        alt={local.alt ?? ""}
        src={local.src || undefined}
        UNSAFE_className={rootClass()}
        UNSAFE_style={mergedStyle()}
        styles={avatarRoot(
          {
            isOverBackground: local.isOverBackground,
          },
          mergeContextStyles(contextProps?.styles, props.styles),
        )}
      />
    </ImageContext.Provider>
  );
}

export interface AvatarGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "slot" | "ref"
> {
  /** Avatar children of the avatar group. */
  children?: JSX.Element;
  /** The label for the avatar group. */
  label?: string;
  /** The size of the avatar group. @default 24 */
  size?: AvatarGroupSize;
  class?: string;
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

export function AvatarGroup(props: AvatarGroupProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarGroupContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "label",
    "size",
    "class",
    "slot",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);
  const size = () => local.size ?? 24;
  const labelAria = createLabel(() => ({
    id: domProps.id,
    label: local.label,
    "aria-label": domProps["aria-label"],
    "aria-labelledby": domProps["aria-labelledby"],
    labelElementType: "span",
  }));
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedStyle = (): JSX.CSSProperties =>
    ({
      ...(mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style) ?? {}),
      "--size": `${size() / 16}rem`,
    }) as JSX.CSSProperties;
  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      avatarGroupContainer(null, mergedStyles()),
    ]
      .filter(Boolean)
      .join(" ");
  const avatarContextValue = {
    styles: avatarGroupAvatar,
    get size() {
      return size();
    },
    isOverBackground: true,
  } satisfies Partial<AvatarProps>;

  return (
    <AvatarContext.Provider value={avatarContextValue}>
      <div
        {...filterDOMProps(domProps)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        id={labelAria.fieldProps.id}
        aria-label={labelAria.fieldProps["aria-label"]}
        aria-labelledby={labelAria.fieldProps["aria-labelledby"]}
        role="group"
        class={className()}
        style={mergedStyle()}
      >
        {local.children}
        {local.label && (
          <span
            id={(labelAria.labelProps as JSX.HTMLAttributes<HTMLSpanElement>).id}
            class={avatarGroupText({ size: String(size()) })}
          >
            {local.label}
          </span>
        )}
      </div>
    </AvatarContext.Provider>
  );
}
