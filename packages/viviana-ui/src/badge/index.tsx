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
  splitProps,
  useContext,
} from "solid-js";
import { mergeProps, filterDOMProps } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { lightDark, style } from "../style" with { type: "macro" };
import { tglPulse } from "../style/motion" with { type: "macro" };
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
/* The register's 2s breath, shared with every other on-air surface (style/motion.ts). */
const livePulse = tglPulse();

/* `live` and `metric` are the two register channels the ramps don't carry
 * (glasselated-ramps.ts covers gray/blue/red/yellow/green): the LIVE
 * pulse rides the CTA fuchsia (`--accent-live` aliases `--accent-cta`)
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
    /* The stamp's own geometry, which `control()` cannot carry: it is a build-time
     * helper shared with buttons and chips, and only the badge is drawn `4px 9px`
     * with mono tracking (TerminalGlassLab.tsx:237-240).
     *
     * 9px is off the spacing ramp (0/2/4/8/12/…) so it enters as an arbitrary value;
     * 4px is `spacing-75` and enters by name. Flat across the size axis, for the same
     * reason `control()` flattened the corner: the register draws ONE badge, and its
     * padding is a property of the stamp rather than of a size step. Size still moves
     * the type (`controlFontStep(2)` above).
     *
     * `control()` leaves paddingY unset, so before this a badge had ZERO vertical
     * padding and its height came from the line box alone — the pill collapsed onto
     * its own text. */
    paddingX: "[9px]",
    paddingY: 4,
    /* The register's micro-mono track. 0.12em is drawn; the theme's tracking scale
     * (style/spectrum-theme.ts) stops at 0.1em, which is the rung it declares FOR this
     * mono micro role — so the badge takes it rather than minting a sixth rung for a
     * 0.02em difference. */
    letterSpacing: "0.1em",
    color: {
      fillStyle: {
        bold: {
          default: "white",
          variant: {
            notice: "black",
            yellow: "black",
            chartreuse: "black",
            celery: "black",
            /* LIVE's fuchsia is mid-luminance in both schemes; black clears
               4.5:1, white does not (white-on-#ff4fc3 is 2.93:1, black 7.16:1).
               Same black-ink family as notice/yellow. */
            live: "black",
            /* Metric is the one channel whose token crosses the ink threshold
               between schemes: light `--cyan-500` is #0a7a9f (black 4.30:1 —
               BELOW AA, white 4.89:1) while dark #48daff takes black at 12.75:1.
               One ink per scheme rather than one ink for both; measured against
               the token, not eyeballed. */
            metric: lightDark("white", "black"),
          },
        },
        /* A subtle badge is the register's tinted-plate chip — same-channel ink
           on a same-channel wash (the spec's streak chip is signal ink on a
           signal-tinted plate). The ink mirrors the
           outline map below value-for-value, exactly as outline's ink mirrors
           its border: one channel, two strengths, nothing can drift. Neutral and
           the decorative variants keep the plain ink for the same reasons they
           are absent from the outline map.

           Accent/informative text is the one place the mirror breaks, and the
           wash is why: `--text-link` (light #0f6adb) on the light accent-subtle
           plate (#dae9fb) measures 4.14:1 — the ink is sized for a panel, not for
           a tinted plate of its own hue. One stop deeper, blue-1000, clears it in
           both columns (light 5.07:1, dark 6dc3ff-on-020e1b 10.08:1) without
           leaving the channel. Outline keeps `--text-link`, which mirrors its own
           border and sits on the page, not on a wash. Notice/negative/positive
           step to the AA stop of the same ramp Button uses for those channels as
           fills. */
        subtle: {
          default: "gray-1000",
          variant: {
            accent: "blue-1000",
            informative: "blue-1000",
            positive: "positive-1000",
            /* DUE and DEGRADED are register CHANNELS, not ramp stops: the signal
               yellow ink (`--status-signal` = `--yellow-text`) and the fault red, the
               same two tokens a well's log line and a StatusLight dot use for the same
               states. Ramp stops drifted from them scheme by scheme — one channel, one
               token, in every component that reports it. */
            notice: "[var(--status-signal)]",
            negative: "[var(--status-fault)]",
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
           neutral ink. The decorative variants (gray, red, yellow, …) have no entry
           in that map at all — no channel to mirror — so they keep it too. */
        outline: {
          default: "gray-1000",
          variant: {
            accent: "[var(--text-link)]",
            informative: "[var(--text-link)]",
            positive: "positive-1000",
            notice: "[var(--status-signal)]",
            negative: "[var(--status-fault)]",
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
               (white on #a0a6ae is 2.45:1) — deeper than gray-300 too: white on
               its dark #737d8b is 4.17:1, so the pair lands on gray-200 (6.48:1). */
            accent: "interactive-fill",
            informative: "interactive-fill",
            neutral: lightDark("gray-600", "gray-200"),
            positive: lightDark("positive-900", "positive-700"),
            notice: "notice",
            negative: lightDark("negative-900", "negative-700"),
            live: "[var(--accent-live)]",
            metric: "[var(--status-metric)]",
            gray: lightDark("gray-600", "gray-200"),
            red: lightDark("negative-900", "negative-700"),
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
            /* The streak chip: signal ink on a signal-tinted plate, mixed from the
               channel's own fill rather than taken from the ramp's *-subtle stop —
               the same color-mix recipe live/metric already use below, so the four
               register channels share one tinted-plate rule. */
            notice: "[color-mix(in srgb, var(--yellow-500) 16%, transparent)]",
            negative: "[color-mix(in srgb, var(--red-500) 15%, transparent)]",
            /* No ramp → no *-subtle token; the island's own tinted-plate recipe
               instead (color-mix over transparent, e.g. glasselated.css:2968). */
            live: "[color-mix(in srgb, var(--accent-live) 15%, transparent)]",
            metric: "[color-mix(in srgb, var(--status-metric) 15%, transparent)]",
            gray: "gray-subtle",
            red: "red-subtle",
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
            notice: "[var(--status-signal)]",
            negative: "[var(--status-fault)]",
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
  const merged = mergeProps<BadgeProps>(contextProps ?? {}, props);
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
