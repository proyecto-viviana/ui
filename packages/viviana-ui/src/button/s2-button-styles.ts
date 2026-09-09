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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Button.tsx

import { baseColor, focusRing, lightDark, style } from "../style" with { type: "macro" };

import {
  control,
  getAllowedOverrides,
  staticColor,
} from "../s2-internal/style-utils" with { type: "macro" };
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
    ...control({ shape: "default", wrap: true, icon: true }),
    position: "relative",
    justifyContent: "center",
    textAlign: "start",
    /* The Glasselated register — 5px corner, `--edge-glass` rim, mono 400 — now
     * arrives with `control()` above, which reads it off the handoff's own button
     * (TerminalGlassLab.tsx:230 `btnBase` over design-handoff-v2.css:283
     * `--type-button`). It used to be spelled out here, which is exactly why Button
     * was the only control that converted.
     *
     * No blur: the handoff's buttons are opaque. Glass is a surface treatment. */
    userSelect: "none",
    /* ...and the SIZE of that face, which `control()` cannot own. `controlFont()`
     * is the whole library's S/M/L/XL band and resolves M to the `ui` rung (14px);
     * the register's button is `--type-button`, mono 400 **13px** (viviana-tokens.css
     * :456, re-valued from the handoff's own `--type-button`). Only the M rung is
     * re-valued, because M is the only rung the handoff draws — the other three keep
     * the shared ui ramp rather than acquiring three invented px values. Set as
     * `fontSize` so it overrides only the size the `font:` shorthand established. */
    fontSize: {
      default: "[13px]",
      size: {
        XS: "ui-xs",
        S: "ui-sm",
        L: "ui-lg",
        XL: "ui-xl",
      },
    },
    /* Same argument for the horizontal padding. `control()` derives it from the height
     * (`edge-to-text` = height * 3/8, so 12px at M), and the handoff draws its button
     * at a flat `7px 14px` (TerminalGlassLab.tsx:231 `btnBase`). The M rung takes the
     * drawn 14px; the rest stay on the derived ramp.
     *
     * The vertical half of that pair is NOT restated: `control({wrap: true})` centers
     * the label in the 32px M control box, which puts ~6.5px above and below a 13px
     * line — the drawn 7px, arrived at from the height ramp instead of pinned against
     * it. Pinning paddingY here would fight `minHeight` and change nothing visible.
     *
     * The icon-only branch has to be restated because this key REPLACES `control()`'s
     * whole `paddingX` map, and an icon-only button collapses its padding to 0. The
     * selector is spelled out for the same reason s2-action-button-styles.ts:57 spells
     * out its own copy: `iconOnly` is private to style-utils. */
    paddingX: {
      default: {
        default: "[14px]",
        size: {
          XS: "edge-to-text",
          S: "edge-to-text",
          L: "edge-to-text",
          XL: "edge-to-text",
        },
      },
      ":has([slot=icon], [data-slot=icon]):not(:has([data-rsp-slot=text]))": 0,
    },
    /* The RUN button is the one the register tracks out — `letter-spacing: .06em` on
     * the terminal-well button (TerminalGlassLab.tsx:365). Every other variant sits at
     * the mono default. */
    letterSpacing: {
      variant: {
        terminal: "[0.06em]",
      },
    },
    width: "fit",
    textDecoration: "none",
    transition: {
      default: "default",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    borderStyle: "solid",
    borderWidth: {
      fillStyle: {
        /* Filled buttons carry the edge too. Every button the handoff draws has one,
         * with no exception: accent `1px solid var(--interactive-fill)` over the same
         * fill (TerminalGlassLab.tsx:303-304), secondary `1px solid var(--border-subtle)`
         * (:315), create (:326), ghost over a transparent fill (:352), the well-filled
         * RUN (:365). `btnBase` (:230-235) declares only radius/padding/cursor/shadow,
         * so each variant spells its own edge — and every one of them does.
         *
         * This was 0, which is why `variant.create: 1` below was the only edge in the
         * component that ever drew. `control()` sets `boxSizing: "border-box"`, so the
         * S/M/L/XL height ramp is unchanged; only the content box narrows by 2px. */
        fill: 1,
        /* 1px, not Spectrum's 2px: the handoff's secondary and ghost buttons are
         * hairline-edged like everything else it draws (TerminalGlassLab.tsx:231),
         * and a 2px edge beside a 1px field reads as a different weight class. */
        outline: 1,
      },
      variant: {
        /* The handoff draws create with an explicit 1px rim in its own border token,
         * not the fill colour — the pale wash needs the edge to hold its shape against
         * a light surface. `variant` is applied after `fillStyle`, so this is 1px in
         * both fill and outline, which is what the handoff shows. */
        create: 1,
        /* Same argument for the terminal well: the handoff draws RUN as
         * `1px solid var(--well-border)` over the well fill
         * (TerminalGlassLab.tsx:365), an edge the fill alone cannot hold. */
        terminal: 1,
      },
    },
    borderColor: {
      variant: {
        /* `primary` deliberately stays on the neutral ramp. The handoff's filled CTA
         * draws its border in its own FILL colour — `1px solid var(--interactive-fill)`
         * over `background-color: var(--interactive-fill)` (TerminalGlassLab.tsx:303-304)
         * — so gray-800 tracking the `baseColor("neutral")` fill below is already the
         * right idiom. A hairline here would break that fill/edge pairing. */
        primary: baseColor("gray-800"),
        /* `var(--border-subtle)` — the handoff's secondary (TerminalGlassLab.tsx:315)
         * and ghost (:352) buttons are both hairlines in it. gray-300 is a solid mid-gray
         * (#c5d0de light, #67717d dark), a full rule weight rather than an edge.
         *
         * Plain string, not `baseColor()`: --border-subtle has no ramp to step along, so
         * this intentionally drops the hover/press border steps `baseColor()` was emitting
         * — the handoff declares no hover border change on any button. The sibling
         * `isStaticColor` branch below stays on `baseColor("transparent-overlay-300")`
         * on purpose; that is the over-imagery case and keeps its overlay ramp. */
        secondary: "border-subtle",
        create: "create-border",
        terminal: "well-border",
      },
      /* Every FILLED variant needs its border colour spelled out HERE, under
       * `fillStyle.fill.variant`. The earlier note claimed variants with no entry
       * "fall through to `variant` above" the way `borderWidth` does — that is
       * WRONG for a colour value, and it shipped Today (secondary-fill) and Create
       * (create-fill) with a black rim. The reason `borderWidth` falls through is
       * that BOTH its keys (`fillStyle.fill` and `variant.create`) name a width, so
       * a fill button always has one to land on. `borderColor` does not: once the
       * higher-priority `fillStyle` key matches (fillStyle === "fill"), it OWNS the
       * result, and a fill variant with no leaf in this sub-map resolves to nothing
       * from the winning branch — it does NOT consult the sibling `variant` map
       * below. The only value left is the `forcedColors` fallback, `ButtonBorder`,
       * which paints black in a normal viewport. So each fill variant is listed
       * explicitly, mirroring the proven accent path stop for stop.
       *
       * The `variant` map below is kept for the OUTLINE variants (Ghost), which do
       * not match `fillStyle.fill` and so still read secondary/create from it.
       *
       * accent/negative border the button in the same token as their fill
       * (handoff :303-304), so they mirror the `backgroundColor` map stop for stop,
       * hover included. secondary and create carry no hover-border step (the
       * handoff declares none), so each is a flat token: `border-subtle` for the
       * secondary hairline, `create-border` for the create rim (the pale wash needs
       * the edge to hold its shape). primary tracks its neutral fill in gray-800,
       * matching the `variant.primary` idiom. Placed before
       * `isDisabled`/`isStaticColor`/`forcedColors` so those still win. */
      fillStyle: {
        fill: {
          variant: {
            primary: baseColor("gray-800"),
            secondary: "border-subtle",
            create: "create-border",
            /* RUN's edge is the well's own rim, and it is the ONE border in this
             * component with a hover step: the handoff lifts the terminal button's
             * edge toward the prompt blue on hover while the matte fill stays put
             * (TerminalGlassLab.tsx:365-368). Stepping the border rather than the
             * fill is what keeps a console button from looking like a CTA. */
            terminal: {
              default: "well-border",
              isHovered: "blue-1100",
              isPressed: "blue-1100",
              isFocusVisible: "blue-1100",
            },
            accent: {
              default: "interactive-fill",
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
            /* warning/success are negative's status counterparts: the same saturated-fill
             * idiom on the signal (notice -> yellow) and success (positive -> green) channels.
             * Border mirrors the fill stop for stop, exactly as accent/negative do. */
            warning: {
              default: lightDark("notice-900", "notice-700"),
              isHovered: lightDark("notice-1000", "notice-600"),
              isPressed: lightDark("notice-1000", "notice-600"),
              isFocusVisible: lightDark("notice-1000", "notice-600"),
            },
            success: {
              default: lightDark("positive-900", "positive-700"),
              isHovered: lightDark("positive-1000", "positive-600"),
              isPressed: lightDark("positive-1000", "positive-600"),
              isFocusVisible: lightDark("positive-1000", "positive-600"),
            },
          },
        },
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
              /* `var(--btn-secondary-bg)` (TerminalGlassLab.tsx:314) — #e9eff6 in light,
               * `var(--surface-raised)` = rgb(51,58,68) in dark (design-handoff-v2.css:73,
               * :196, :179). No pre-existing token covered both schemes: `raised` is
               * #ffffff in light and `well` is #0a0f14 in dark, so each matches only one.
               * The backgroundColor map therefore gained a `btn-secondary` entry pointing
               * at the variable the island already ships. gray-100 (#e5eaf1 / #43474d) was
               * a step off in both schemes and lost the slate cast in dark.
               *
               * The hover/press/focus stops stay on gray-200 (#dbe3ed / #555c64). Against
               * the new resting fill that darkens in light and lightens in dark, which is
               * the correct direction in each scheme — hover moves toward contrast with
               * the page, so it necessarily reverses between schemes. --surface-hover is
               * NOT usable here: it is an alpha wash (rgba(255,255,255,.75) light,
               * rgba(58,62,70,.48) dark) meant to composite over a surface, and the macro
               * bakes fills with no knowledge of the backdrop — see the gray-100/200 note
               * in style/glasselated-ramps.ts. As a replacement fill it would turn an
               * opaque button translucent on hover and, composited over the panel, invert
               * the step in both schemes. */
              default: "btn-secondary",
              isHovered: "gray-200",
              isPressed: "gray-200",
              isFocusVisible: "gray-200",
            },
            accent: {
              default: "interactive-fill",
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
            /* warning/success fills mirror negative on the signal (notice -> yellow) and
             * success (positive -> green) channels. The green ramp is L-solved to carry the
             * same white-ink contrast as red, so both dark fills clear AA identically
             * (see style/glasselated-ramps.ts). */
            warning: {
              default: lightDark("notice-900", "notice-700"),
              isHovered: lightDark("notice-1000", "notice-600"),
              isPressed: lightDark("notice-1000", "notice-600"),
              isFocusVisible: lightDark("notice-1000", "notice-600"),
            },
            success: {
              default: lightDark("positive-900", "positive-700"),
              isHovered: lightDark("positive-1000", "positive-600"),
              isPressed: lightDark("positive-1000", "positive-600"),
              isFocusVisible: lightDark("positive-1000", "positive-600"),
            },
            /* The create CTA does not follow the semantic-fill pattern above. Those step
             * along a ramp for hover; create-bg has no ramp, so the deeper wash is a named
             * token. Both schemes are declared in the token itself, hence no lightDark(). */
            create: {
              default: "create-bg",
              isHovered: "create-bg-deep",
              isPressed: "create-bg-deep",
              isFocusVisible: "create-bg-deep",
            },
            /* The terminal button is a piece of the well it sits in, not a fill on top
             * of it: `background: var(--surface-well)` (TerminalGlassLab.tsx:365). Flat
             * across every state — the hover signal lives on the border above, so a RUN
             * button never brightens the way an accent or create button does. */
            terminal: "well",
          },
          isDisabled: "disabled",
        },
        outline: {
          default: "transparent",
          isHovered: "gray-100",
          isPressed: "gray-100",
          isFocusVisible: "gray-100",
          isDisabled: "transparent",
        },
      },
      isStaticColor: {
        fillStyle: {
          fill: {
            variant: {
              primary: baseColor("transparent-overlay-800"),
              secondary: baseColor("transparent-overlay-100"),
            },
            isDisabled: "transparent-overlay-100",
          },
          outline: {
            default: "transparent",
            isHovered: "transparent-overlay-100",
            isPressed: "transparent-overlay-100",
            isFocusVisible: "transparent-overlay-100",
            isDisabled: "transparent",
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
            /* Success carries white ink on its saturated fill, like accent/negative: the
             * positive fill stops (-900/-700) are pinned >= 4.5:1 on white. Warning cannot —
             * the notice ramp is the register's yellow, bright in BOTH columns, so white on
             * it is 2.3-2.5:1 and black is 7.7:1. Same ink Badge and InlineAlert spend on
             * this channel. */
            warning: "black",
            success: "white",
            /* Create is the CTA fuchsia, and its ink flips with the ground rather than
             * staying white: near-black #1a0512 on the night fill is 6.66:1, white on the
             * daylight fill 4.74:1, so both schemes clear AA. */
            create: "create-ink",
            /* Blue ink on the matte well — the register's console voice. The handoff inks
             * it in `--terminal-prompt` (= `--blue-400`), which is only ~2.4:1 on the LIGHT
             * well (#3d9be8 on #e9eff6) and fails AA outright. blue-1100 is the same ramp's
             * end stop and is IDENTICAL to `--terminal-prompt` in the dark scheme (#99d8ff),
             * so the night rendering is the handoff's exactly and only the daylight column
             * darkens to #094aa2 (~9:1) to become readable. */
            terminal: "blue-1100",
          },
          isDisabled: "disabled",
        },
        outline: {
          default: baseColor("neutral"),
          variant: {
            /* Ghost is the register's outlined SECONDARY, and the handoff inks it in the
             * MUTED slate, not the strong neutral its filled twin (Today) wears: the
             * `Ghost` button is drawn `color: var(--text-secondary)` on a transparent fill
             * inside `--border-subtle` (TerminalGlassLab.tsx:273-277), whereas the filled
             * secondary is `--text-primary`. `--text-secondary` is pinned to `gray-500` in
             * both schemes (glasselated-ramps.ts:114,855 — #64748b light / #9aa0a8 dark),
             * so a secondary+outline button de-emphasises its label exactly the way the
             * register draws it. Every other outline variant keeps `outline.default`'s
             * neutral ink; only secondary steps down. */
            secondary: baseColor("gray-500"),
            /* create-ink is near-black in the dark scheme — legible ON the pale fill, not
             * against a dark page. Outline drops the fill, so the dark scheme takes the
             * fill colour as its ink instead. */
            create: lightDark("create-ink", "create-bg"),
            /* Outline drops the well fill but keeps the console voice. */
            terminal: "blue-1100",
          },
          isDisabled: "disabled",
        },
      },
      isStaticColor: {
        fillStyle: {
          fill: {
            variant: {
              primary: "auto",
              secondary: {
                default: "transparent-overlay-1000",
                isHovered: "transparent-overlay-1000",
                isFocusVisible: "transparent-overlay-1000",
                isPressed: "transparent-overlay-1000",
              },
            },
          },
          outline: {
            default: {
              default: "transparent-overlay-1000",
              isHovered: "transparent-overlay-1000",
              isFocusVisible: "transparent-overlay-1000",
              isPressed: "transparent-overlay-1000",
            },
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
