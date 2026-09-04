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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Badge.tsx

// Port of packages/@react-spectrum/s2/src/Badge.tsx.

import {
  children as resolveChildren,
  type JSX,
  createContext,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { lightDark, style } from "../style" with { type: "macro" };
import { keyframes } from "../style/style-macro" with { type: "macro" };
import { centerBaseline } from "../icon/center-baseline";
import { IconContext } from "../icon/spectrum-icon";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { control, getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import { SkeletonWrapper } from "../skeleton";
import { Text, TextContext } from "../text";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type BadgeSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
export type BadgeVariant =
  | "accent"
  | "informative"
  | "neutral"
  | "positive"
  | "notice"
  | "negative"
  | "live"
  | "metric"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "chartreuse"
  | "celery"
  | "green"
  | "seafoam"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "fuchsia"
  | "magenta"
  | "pink"
  | "turquoise"
  | "brown"
  | "cinnamon"
  | "silver"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type BadgeFillStyle = "bold" | "subtle" | "outline";
export type BadgeOverflowMode = "wrap" | "truncate";

type S2BadgeSize = "S" | "M" | "L" | "XL";
type S2BadgeVariant = Exclude<
  BadgeVariant,
  "primary" | "secondary" | "success" | "warning" | "danger" | "info"
>;

export interface BadgeProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "style" | "children" | "ref" | "slot"
> {
  /** The content to display in the badge. */
  children?: JSX.Element;
  /** Backward-compatible count content. Prefer children for S2 parity. */
  count?: number;
  /** The size of the badge. @default 'S' */
  size?: BadgeSize;
  /** The variant changes the background color of the badge. @default 'neutral' */
  variant?: BadgeVariant;
  /** The fill of the badge. @default 'bold' */
  fillStyle?: BadgeFillStyle;
  /** Sets the text behavior for the contents. @default 'wrap' */
  overflowMode?: BadgeOverflowMode;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  slot?: string | null;
  ref?: RefLike<HTMLSpanElement>;
}

export const BadgeContext = createContext<SpectrumContextValue<BadgeProps>>(null);

/* The register's LIVE breathing (island glxPulse, glasselated.css:316-323): the
 * whole pill dips to 55% opacity and back over 2s. Slow enough (0.25Hz) to sit
 * far under any flash threshold; still gated on prefers-reduced-motion because
 * it is decoration, not information — the label already says LIVE. The gate is
 * the media query itself, NOT a runtime matchMedia check: Solid hydration
 * trusts the server DOM, so an SSR'd inline `animation` never gets removed
 * when the client's check disagrees — CSS is the only layer where the
 * preference applies identically on both sides. (Not css() either: its class
 * wrapper is lost around a nested @media, leaving a selectorless dead block —
 * hence the style()-native media condition key down in badgeStyles.) */
const livePulse = keyframes(`
  0%, 100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
`);

/* `live` and `metric` are the two register channels the ramps don't carry
 * (glasselated-ramps.ts covers gray/blue/red/orange/yellow/green): the LIVE
 * pulse is a one-off orange-red (`--accent-live`, its own channel by design)
 * and metric is the sky-blue that replaced the retired violet. Both live in
 * viviana-tokens.css per scheme, so they enter here as arbitrary `[var(--…)]`
 * values — the same pattern the token file's header prescribes — rather than
 * as new build-time ramps nothing else would use. */
const badgeStyles = style<{
  size: S2BadgeSize;
  variant: S2BadgeVariant;
  fillStyle: BadgeFillStyle;
}>(
  {
    ...control({ shape: "default", wrap: true, icon: true, register: "badge", rim: false }),
    /* The rim belongs to the FILL, not to the 5px shape. control()'s `rim` doc
     * (s2-internal/style-utils.ts) states the rule for this register: its filled
     * badges add the rim back, its outline badges do not — so the rule keys on a
     * fill being present, not on that fill being bold, and `subtle` is rimmed too.
     *
     * control() cannot make this call itself: the fill is a Badge prop it never
     * sees, and it is a build-time helper with no view of the variant axis. Hence
     * `rim: false` above and the conditional here. Shape mirrors the sibling
     * `borderColor` conditional a few keys down.
     *
     * `outline` goes bare in every variant, including the decorative ones that
     * still keep a `layer-2` fill below — an inset highlight is the raised-control
     * affordance, and the outline fill is a fallback container rather than a
     * deliberate raised surface. */
    boxShadow: {
      default: "edge-glass",
      fillStyle: {
        outline: "none",
      },
    },
    justifyContent: "center",
    color: {
      fillStyle: {
        bold: {
          default: "white",
          variant: {
            notice: "black",
            orange: "black",
            yellow: "black",
            chartreuse: "black",
            celery: "black",
            /* Metric's sky-blue and LIVE's orange-red are mid-luminance in both
               schemes; black clears 4.5:1, white does not (LIVE white-on-#ff6b35
               is 2.84:1). Same black-ink family as notice/orange/yellow. */
            live: "black",
            metric: "black",
          },
        },
        /* A subtle badge is the register's tinted-plate chip — same-channel ink
           on a same-channel wash (the spec's streak chip is amber-600 ink on an
           amber-100 plate, TerminalGlassLab.tsx:466-467). The ink mirrors the
           outline map below value-for-value, exactly as outline's ink mirrors
           its border: one channel, two strengths, nothing can drift. Neutral and
           the decorative variants keep the plain ink for the same reasons they
           are absent from the outline map.

           Accent/informative text uses `--text-link`, not accent-900: the brand
           blue is the 3:1 decorative mark (SegmentedControl already made this
           split). Notice/negative/positive step to the AA stop of the same ramp
           Button uses for those channels as fills. */
        subtle: {
          default: "gray-1000",
          variant: {
            accent: "[var(--text-link)]",
            informative: "[var(--text-link)]",
            positive: "positive-1000",
            notice: "notice-1100",
            negative: "negative-1000",
            live: "[var(--accent-live)]",
            metric: "[var(--status-metric)]",
          },
        },
        /* An outline badge is a rule plus ink in ONE channel, so the ink mirrors the
           `borderColor` outline map below value-for-value. No new colour enters the
           system and the two channels cannot drift apart.

           `neutral` is deliberately NOT mirrored, even though it does have a border
           entry below (gray-500/gray-600). Those are rule weights, picked to read as
           a hairline; at badge size they would not carry as text. It keeps the
           neutral ink. The decorative variants (gray, red, orange, …) have no entry
           in that map at all — no channel to mirror — so they keep it too. */
        outline: {
          default: "gray-1000",
          variant: {
            accent: "[var(--text-link)]",
            informative: "[var(--text-link)]",
            positive: "positive-1000",
            notice: "notice-1100",
            negative: "negative-1000",
            live: "[var(--accent-live)]",
            metric: "[var(--status-metric)]",
          },
        },
      },
    },
    backgroundColor: {
      fillStyle: {
        bold: {
          variant: {
            /* Text-bearing fills use the AA pair Button already ships: interactive-fill
               under white for the blue channel, and the 900/700 pair for negative/
               positive. Neutral/gray need a dark-scheme fill deeper than gray-500
               (white on #a0a6ae is 2.45:1). */
            accent: "interactive-fill",
            informative: "interactive-fill",
            neutral: lightDark("gray-600", "gray-300"),
            positive: lightDark("positive-900", "positive-700"),
            notice: "notice",
            negative: lightDark("negative-900", "negative-700"),
            live: "[var(--accent-live)]",
            metric: "[var(--status-metric)]",
            gray: lightDark("gray-600", "gray-300"),
            red: lightDark("negative-900", "negative-700"),
            orange: "orange",
            yellow: "yellow",
            chartreuse: "chartreuse",
            celery: "celery",
            green: "green",
            seafoam: "seafoam",
            cyan: "cyan",
            blue: "interactive-fill",
            indigo: "indigo",
            purple: "purple",
            fuchsia: "fuchsia",
            magenta: "magenta",
            pink: "pink",
            turquoise: "turquoise",
            brown: "brown",
            cinnamon: "cinnamon",
            silver: "silver",
          },
        },
        subtle: {
          variant: {
            accent: "accent-subtle",
            informative: "informative-subtle",
            neutral: "neutral-subtle",
            positive: "positive-subtle",
            notice: "notice-subtle",
            negative: "negative-subtle",
            /* No ramp → no *-subtle token; the island's own tinted-plate recipe
               instead (color-mix over transparent, e.g. glasselated.css:2968). */
            live: "[color-mix(in srgb, var(--accent-live) 15%, transparent)]",
            metric: "[color-mix(in srgb, var(--status-metric) 15%, transparent)]",
            gray: "gray-subtle",
            red: "red-subtle",
            orange: "orange-subtle",
            yellow: "yellow-subtle",
            chartreuse: "chartreuse-subtle",
            celery: "celery-subtle",
            green: "green-subtle",
            seafoam: "seafoam-subtle",
            cyan: "cyan-subtle",
            blue: "blue-subtle",
            indigo: "indigo-subtle",
            purple: "purple-subtle",
            fuchsia: "fuchsia-subtle",
            magenta: "magenta-subtle",
            pink: "pink-subtle",
            turquoise: "turquoise-subtle",
            brown: "brown-subtle",
            cinnamon: "cinnamon-subtle",
            silver: "silver-subtle",
          },
        },
        /* The register's outline badge is a rule plus ink and no fill at all, so
           `layer-2` was painting a card surface behind something drawn as bare text.

           Withdrawn only for the variants that actually own a border channel — the
           same six the `borderColor` outline map below covers. Every other variant
           falls through to `transparent` there, so dropping its fill as well would
           leave a transparent box inside a transparent border: floating text with no
           container. Those keep `layer-2` unless and until the outline borderColor
           map grows entries for them. */
        outline: {
          default: "layer-2",
          variant: {
            accent: "transparent",
            informative: "transparent",
            neutral: "transparent",
            positive: "transparent",
            notice: "transparent",
            negative: "transparent",
            live: "transparent",
            metric: "transparent",
          },
        },
      },
    },
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: {
      default: "transparent",
      fillStyle: {
        outline: {
          variant: {
            accent: "[var(--text-link)]",
            informative: "[var(--text-link)]",
            neutral: lightDark("gray-500", "gray-600"),
            positive: "positive-1000",
            notice: "notice-1100",
            negative: "negative-1000",
            live: "[var(--accent-live)]",
            metric: "[var(--status-metric)]",
          },
        },
      },
    },
    animation: {
      variant: {
        live: {
          default: livePulse,
          "@media (prefers-reduced-motion: reduce)": "none",
        },
      },
    },
    animationDuration: {
      variant: {
        live: 2000,
      },
    },
    animationTimingFunction: {
      variant: {
        live: "[ease-in-out]",
      },
    },
    animationIterationCount: {
      variant: {
        live: "infinite",
      },
    },
    "--iconPrimary": {
      type: "fill",
      value: "currentColor",
    },
  },
  getAllowedOverrides(),
);

const textStyles = style<{ overflowMode: BadgeOverflowMode }>({
  paddingY: "--labelPadding",
  order: 1,
  overflowX: "hidden",
  overflowY: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: {
    overflowMode: {
      truncate: "nowrap",
      wrap: "normal",
    },
  },
});

const iconCenterStyles = style({ order: 0 });
const iconStyles = style({
  size: "1lh",
  marginStart: "--iconMargin",
  flexShrink: 0,
});

function normalizeSize(size: BadgeSize | undefined): S2BadgeSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    default:
      return size ?? "S";
  }
}

function normalizeVariant(variant: BadgeVariant | undefined): S2BadgeVariant {
  switch (variant) {
    case "primary":
      return "accent";
    case "secondary":
      return "neutral";
    case "success":
      return "positive";
    case "warning":
      return "notice";
    case "danger":
      return "negative";
    case "info":
      return "informative";
    default:
      return variant ?? "neutral";
  }
}

function isTextOnly(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(
      (item) =>
        item == null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );
  }

  return value == null || typeof value === "boolean";
}

export function Badge(props: BadgeProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(BadgeContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "count",
    "size",
    "variant",
    "fillStyle",
    "overflowMode",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
  ]);
  const size = () => normalizeSize(local.size);
  const variant = () => normalizeVariant(local.variant);
  const fillStyle = () => local.fillStyle ?? "bold";
  const overflowMode = () => local.overflowMode ?? "wrap";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLSpanElement> } | null)?.ref,
    props.ref,
  );

  function BadgeContent() {
    const resolvedChildren = resolveChildren(() =>
      local.count !== undefined ? local.count : local.children,
    );
    const content = () => resolvedChildren();
    return isTextOnly(content()) ? <Text>{content()}</Text> : content();
  }

  return (
    <TextContext.Provider
      value={{
        styles: () => textStyles({ overflowMode: overflowMode() }),
      }}
    >
      <IconContext.Provider
        value={{
          slot: "icon",
          render: centerBaseline({ slot: "icon", styles: iconCenterStyles }),
          styles: iconStyles,
        }}
      >
        <SkeletonWrapper>
          <span
            {...filterDOMProps(domProps)}
            ref={(element) => assignRef(element)}
            role="presentation"
            class={[
              contextProps?.UNSAFE_className,
              local.UNSAFE_className,
              local.class,
              badgeStyles(
                {
                  size: size(),
                  variant: variant(),
                  fillStyle: fillStyle(),
                },
                mergedStyles(),
              ),
            ]
              .filter(Boolean)
              .join(" ")}
            style={mergedUnsafeStyle()}
          >
            <BadgeContent />
          </span>
        </SkeletonWrapper>
      </IconContext.Provider>
    </TextContext.Provider>
  );
}
