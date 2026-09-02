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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/style-utils.ts

import type { JSX } from "solid-js";

import { fontRelative as internalFontRelative } from "../style/spectrum-theme";
import { StyleString } from "../style/types";

type CSSProperties = JSX.CSSProperties;

/**
 * Calculates vertical padding to center a single line of text within a container.
 * Uses the CSS `self()` function and `1lh` unit to compute the padding based on
 * the container's minimum height and border widths.
 * This is useful for precise vertical centering without introducing a flex/grid layout to the container.
 *
 * @param minHeight - A CSS expression for the minimum height to center within. Defaults to `'self(minHeight)'`.
 * @returns A CSS `calc()` expression wrapped as an arbitrary style value.
 *
 * @example
 * ```tsx
 * import {centerPadding, style} from '@react-spectrum/s2/style' with {type: 'macro'};
 *
 * const styles = style({
 *   paddingY: centerPadding()
 * });
 * ```
 */
export function centerPadding(minHeight: string = "self(minHeight)"): `[${string}]` {
  return `[calc((${minHeight} - self(borderTopWidth, 0px) - self(borderBottomWidth, 0px) - 1lh) / 2)]`;
}

function fontRelative(base: number, baseFontSize = 14): `[${string}]` {
  return `[${internalFontRelative(base, baseFontSize)}]`;
}

export const field = () =>
  ({
    display: "grid",
    gridColumnStart: {
      isInForm: 1,
    },
    gridColumnEnd: {
      isInForm: {
        labelPosition: {
          side: "span 2",
        },
      },
    },
    gridTemplateColumns: {
      default: {
        labelPosition: {
          top: ["1fr"],
          side: ["auto", "1fr"],
        },
      },
      isInForm: "subgrid",
    },
    gridTemplateRows: {
      labelPosition: {
        top: ["auto", "1fr", "auto"],
        side: ["auto", "1fr"],
      },
    },
    gridTemplateAreas: {
      labelPosition: {
        top: ["label", "input", "helptext"],
        side: ["label input", "label helptext"],
      },
    },
    fontSize: controlFont(),
    alignItems: "baseline",
    lineHeight: "ui",
    "--field-height": {
      type: "height",
      value: controlSize(),
    },
    // Spectrum defines the field label/help text with a (minimum) height, with text centered inside.
    // Calculate what the gap should be based on the height and line height.
    // Use a variable here rather than rowGap since it is applied to the children as padding.
    // This allows the gap to collapse when the label/help text is not present.
    // Eventually this may be possible to do in pure CSS: https://github.com/w3c/csswg-drafts/issues/5813
    "--field-gap": {
      type: "rowGap",
      value: centerPadding("var(--field-height)"),
    },
    columnGap: 12,
    disableTapHighlight: true,
  }) as const;

export const fieldLabel = () =>
  ({
    font: controlFont(),
    /* Glasselated: field labels are mono, like every other piece of chrome the
     * handoff draws. `font` above still owns the size ramp; this only repoints the
     * family, so it must come after. Done here rather than per-component because
     * 19 components spread `fieldLabel()` — the same reason `control()` owns the
     * control register. */
    fontFamily: "code",
    cursor: "default",
    color: {
      /* `--text-secondary` is the register's AA secondary ink. `neutral-subdued`
       * remaps to the same hex through the theme, but the CSS variable follows
       * `data-color-scheme` at runtime (including nested Providers) and cannot
       * drift from viviana-tokens.css. */
      default: "[var(--text-secondary)]",
      isDisabled: "disabled",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "ButtonText",
    },
  }) as const;

/**
 * The value readout that sits beside a `fieldLabel()` — a meter's percentage, a
 * progress bar's count, a slider's current value.
 *
 * A sibling of `fieldLabel()` rather than a reuse of it, because the register draws
 * these as two distinct roles on purpose: TerminalGlassLab.tsx:749 sets the label to
 * `var(--type-label)` and :753-758 sets the readout beside it to mono 10.5px in
 * `var(--text-secondary)` — smaller and quieter. The readout is the value; the label
 * is the chrome naming it. Four components had the readout either spreading
 * `fieldLabel()` verbatim or declaring no font role at all, so every one of them
 * rendered the pair byte-identical.
 *
 * Only the SIZE step is expressed here. The handoff also separates the two by weight
 * (its label role is 600), but this fork's fontWeight scale is normal/medium/bold/
 * extra-bold/black (spectrum-theme.ts:701-715) with no 600 rung, so a weight step
 * would have to overshoot to `bold` — louder than the drawn label, on a readout that
 * is meant to be quieter. Size carries the distinction alone until that token exists.
 *
 * Lives here rather than in those four files for the same reason `fieldLabel()` does:
 * the next value-readout consumer should inherit the decision, not re-derive it.
 */
export const fieldValue = () =>
  ({
    font: controlFont(),
    /* Same mono chrome family as the label; only size steps down. Both must come
     * after `font`, which owns the whole shorthand. */
    fontFamily: "code",
    fontSize: controlFontStep(1),
    fontWeight: "normal",
    cursor: "default",
    color: {
      default: "[var(--text-secondary)]",
      isDisabled: "disabled",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "ButtonText",
    },
  }) as const;

export const fieldInput = () =>
  ({
    gridArea: "input",
    minWidth: controlSize(),
    contain: {
      // Only apply size containment if contain-intrinsic-width is supported.
      // In older browsers, this will fall back to the default browser intrinsic width.
      "@supports (contain-intrinsic-width: 1px)": "inline-size",
      isQuiet: "none",
    },
    "--defaultWidth": {
      type: "width",
      value: {
        default: 208,
        size: {
          S: 192,
          L: 224,
          XL: 240,
        },
      },
    },
    // contain-intrinsic-width only includes the width of children, not the padding or borders.
    containIntrinsicWidth:
      "calc(var(--defaultWidth) - self(paddingStart, 0px) - self(paddingEnd, 0px) - self(borderStartWidth, 0px) - self(borderEndWidth, 0px))",
  }) as const;

/**
 * Returns style properties that set the CSS `color-scheme` for a component.
 * Defaults to the page's color scheme and supports `'light'`, `'dark'`, and `'light dark'` values
 * via the `colorScheme` render prop condition.
 * Intended for root containers (e.g. providers, modals, and popovers), and not needed for individual components.
 *
 * @example
 * ```tsx
 * import {setColorScheme, style} from '@react-spectrum/s2/style' with {type: 'macro'};
 *
 * const styles = style({
 *   ...setColorScheme(),
 *   backgroundColor: 'layer-1'
 * });
 * ```
 */
export const setColorScheme = () =>
  ({
    "--s2-color-scheme": {
      type: "colorScheme",
      value: {
        colorScheme: {
          "light dark": {
            default: "light",
            "@media (prefers-color-scheme: dark)": "dark",
          },
          light: "light",
          dark: "dark",
        },
      },
    },
    colorScheme: "--s2-color-scheme",
    // For backward compatibility in two cases:
    // 1. When a component compiled with an earlier version of S2 is embedded in a newer provider.
    // 2. When S2 CSS is compiled with lightningcss, setting color-scheme via a variable does not work.
    "--lightningcss-light": {
      type: "transform",
      value: {
        colorScheme: {
          "light dark": {
            default: "initial",
            "@media (prefers-color-scheme: dark)": " ",
          },
          light: "initial",
          dark: " ",
        },
      },
    },
    "--lightningcss-dark": {
      type: "transform",
      value: {
        colorScheme: {
          "light dark": {
            default: " ",
            "@media (prefers-color-scheme: dark)": "initial",
          },
          light: " ",
          dark: "initial",
        },
      },
    },
  }) as const;

export function staticColor(): Record<string, any> {
  return {
    "--s2-container-bg": {
      type: "backgroundColor",
      value: {
        staticColor: {
          black: "white",
          white: "black",
        },
      },
    },
  } as const;
}

export const controlFont = () =>
  ({
    default: "ui",
    size: {
      XS: "ui-xs",
      S: "ui-sm",
      L: "ui-lg",
      XL: "ui-xl",
    },
  }) as const;

/**
 * `controlFont()`, shifted `steps` rungs down the shared `ui-*` ramp.
 *
 * Some things in the register are deliberately smaller than a control without being
 * a different KIND of thing: a badge is 9.5px and a chip 11px against a 15px button
 * (TerminalGlassLab.tsx:238, :500), and a value readout is 10.5px against its 13.5px
 * label (:753-758 vs :749). Those are steps on one ladder, not separate scales.
 *
 * Returned as a `fontSize` map rather than a fixed px so the S/M/L/XL size prop keeps
 * working — the handoff draws exactly one badge and one chip, so it cannot dictate a
 * ramp, only where on the ramp the band sits. Spread AFTER `font:` (which owns the
 * whole shorthand) so only size moves.
 *
 * CLAMPED AT `ui-xs`, which is the bottom of the ui ramp: spectrum-theme.ts:759-765
 * declares exactly `ui-xs` / `ui-sm` / `ui` / `ui-lg` / `ui-xl` (indices -2…+2), and
 * there is no rung below `ui-xs`. So the small end of each table saturates rather than
 * stepping — at `steps: 2`, sizes XS/S/M all land on `ui-xs` (~11.06px at base 14).
 * That is the nearest expressible value to the badge's drawn 9.5px, not a match for
 * it; reaching ~9.8px would mean adding a new rung to the fontSize map, which is a
 * token-level decision and lives in spectrum-theme.ts, not here.
 */
export const controlFontStep = (steps: 1 | 2) =>
  steps === 1
    ? ({
        default: "ui-sm",
        size: { XS: "ui-xs", S: "ui-xs", L: "ui", XL: "ui-lg" },
      } as const)
    : ({
        default: "ui-xs",
        size: { XS: "ui-xs", S: "ui-xs", L: "ui-sm", XL: "ui" },
      } as const);

export const controlSize = (size: "sm" | "md" = "md"): typeof controlSizeM | typeof controlSizeS =>
  size === "sm" ? controlSizeS : controlSizeM;

const controlSizeM = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48,
  },
} as const;

const controlSizeS = {
  default: 16,
  size: {
    S: 14,
    L: 18,
    XL: 20,
  },
} as const;

/* Flat register radii, not Spectrum's computed corner.
 *
 * This used to emit `round(var(--radius) * var(--size), 1px)` off a Major Second
 * ramp, which failed the handoff twice over. It scaled: an XL control curved more
 * than an XS one, while the handoff draws every button at 5px regardless of size
 * (TerminalGlassLab.tsx:231 btnBase). And its `sm` input resolved to `radius.sm`,
 * 4px — a value the handoff never draws. Its full drawn ladder is
 * 0 / 5 / 6 / 8 / 10 / 12 / 14 / 999; 4px appears nowhere in it.
 *
 * `control()` already made exactly this correction for the components that spread it
 * (see the flat-radii branch below and the comment there). This helper was the
 * parallel path that kept the old formula alive for the seven that spread it instead:
 * combobox, picker, checkbox, numberfield, menu, DatePicker, DateRangePicker. It now
 * agrees with control(), and the `--size` / `--radius` custom properties stop being
 * emitted at all — nothing outside this helper read them.
 *
 * `sm` is the in-field affordance — stepper, disclosure button, calendar button,
 * checkbox box — so it takes the button corner, `control` (5px). `default` is the
 * field-sized corner, 8px, which is what `control({register:"matte"})` already
 * gives the Picker trigger that `pickerInvalidBorder` overlays; flattening it here
 * is what finally lets that ring trace its own box at non-M sizes. */
export const controlBorderRadius = (size: "default" | "sm" = "default") =>
  ({
    borderRadius: size === "sm" ? ("control" as const) : ("default" as const),
  }) as const;

/**
 * Viviana UI v2 (Glasselated): the matte well's scan dither.
 *
 * The handoff never paints a well as a flat rectangle. Its `<Well>` opens with
 * `<ScanOverlay />` on every instance (TerminalGlassLab.tsx:280) — including the
 * two it uses as fields, the search prompt (:419) and the tutor prompt (:461) —
 * and `ScanOverlay` is a 4px `repeating-conic-gradient` in `--well-scan`
 * (primitives.tsx:76-89), commented there as the grid that overlays *every*
 * terminal well. It is the register's signature texture.
 *
 * Expressed as a background layer rather than the handoff's absolutely positioned
 * child because the paint order is identical — `background-image` sits above
 * `background-color` and below all content — while needing no extra DOM node, no
 * `position: relative` on the host and no `overflow: hidden` to stay inside the
 * corner, since `border-radius` already clips the background.
 *
 * Scope: the handoff scans what is filled with `--surface-well` — its wells, and also
 * the three well-filled chips at TerminalGlassLab.tsx:42-61 (`scan: true`, drawn at
 * :512). The one exception is the `[F5] RUN` button (:357), which takes the well fill
 * and stays flat. This lands behind `register: "matte"` because that is where the well
 * fill lives in the library today; tag-group/index.tsx fills its chip with `gray-100`,
 * not `well`, so no chip currently needs it. If a later change re-fills Tag with the
 * well surface, the handoff says the scan should follow it.
 *
 * The color is the existing `--well-scan` token, already declared per scheme
 * (viviana-tokens.css:265 dark, :559 light) and read by nothing until now, so this
 * costs no new custom property. Suppressed under forced colors, where the surface
 * is forced and a dither over it is just noise.
 */
export const wellScan = () =>
  ({
    backgroundImage: {
      default: "[repeating-conic-gradient(var(--well-scan) 0% 25%, transparent 0% 50%)]",
      forcedColors: "none",
    },
    backgroundSize: "[4px 4px]",
  }) as const;

interface ControlOptions {
  shape?: "default" | "pill";
  wrap?: boolean;
  icon?: boolean;
  /**
   * Which half of the Glasselated register this control belongs to.
   *
   * `glass` (the default) is the handoff's standard control: 5px corners plus the
   * `--edge-glass` inset rim — buttons, badges, chips, tags, segmented items.
   *
   * `matte` is the terminal-well family: 8px corners, no rim. The handoff says
   * outright that wells are "never glass" (design-handoff-v2.css:56), and fields
   * belong there — an input that frosts the page behind it fights its own text.
   *
   * `chip` is the tag/keyword pill: 8px corners, and it does keep the rim
   * (TerminalGlassLab.tsx:509). Same corner as a field, opposite treatment — which
   * is why corner and rim are separate decisions here rather than one "size".
   *
   * `row` is a selectable line inside a container — menu items, listbox options.
   * The handoff draws these at 6px with no rim and no border of their own
   * (TerminalGlassLab.tsx:598, :1027); the chrome belongs to the well around them,
   * and giving each row an inset highlight as well produces visible banding.
   *
   * `badge` is the status stamp: same 5px corner as a button and no rim by default,
   * but the register puts it in a band of its own — mono 700 at 9.5px, against a
   * button's mono 400 at 15px (TerminalGlassLab.tsx:237-240 vs design-handoff-v2.css:163).
   * It rode `glass` before, which is why a badge read as a small button rather than a
   * stamp; only the type differs, so it is a register rather than a shape.
   *
   * Neither `matte` nor `row` paints a surface — both only withhold the rim and
   * move the corner, because in these components the background and border
   * usually sit on a wrapper rather than on the element `control()` styles.
   */
  register?: "glass" | "matte" | "chip" | "row" | "badge";
  /**
   * Override whether the `--edge-glass` rim is drawn. Defaults to on for `glass`
   * and off for the other two.
   *
   * Needed because the rim tracks *raised* controls, not the 5px corner: the
   * handoff's badges (TerminalGlassLab.tsx:237) and segmented items (:448) are
   * 5px like a button but outline-only, and an inset highlight on a transparent
   * fill just draws a stray white hairline. Its filled badges — LIVE (:525) and
   * the streak chip (:546) — do add the rim back, which is the tell that the rim
   * belongs to the fill rather than to the shape.
   */
  rim?: boolean;
}

interface ControlResult {
  font: ReturnType<typeof controlFont>;
  fontFamily?: "code";
  fontWeight?: "normal" | "bold";
  fontSize?: ReturnType<typeof controlFontStep>;
  boxShadow?: "edge-glass";
  boxSizing?: "border-box";
  /* `matte` sets all four; `chip` sets the three border ones and paints no surface
   * — see `control()`. */
  borderWidth?: 1;
  borderStyle?: "solid";
  borderColor?: "well-border";
  backgroundColor?: "well";
  /* Only `matte` sets these two, alongside its fill — see `wellScan()`. */
  backgroundImage?: ReturnType<typeof wellScan>["backgroundImage"];
  backgroundSize?: ReturnType<typeof wellScan>["backgroundSize"];
  borderRadius?: "pill" | "control" | "row" | "default" | `[${string}]`;
  minWidth?: ReturnType<typeof controlSize>;
  minHeight?: ReturnType<typeof controlSize>;
  height?: ReturnType<typeof controlSize>;
  display?: "flex";
  alignItems?: "center" | { default: "baseline"; [iconOnly]: "center" };
  columnGap?: "text-to-visual";
  paddingX?: "pill" | "edge-to-text" | { default: "pill" | "edge-to-text"; [iconOnly]: 0 };
  paddingY?: 0 | `[${string}]`;
}

const iconOnly = ":has([slot=icon], [data-slot=icon]):not(:has([data-rsp-slot=text]))";

/**
 * Common styles for a pill or round rect shaped container with text and icon slots.
 * The text can optionally wrap, aligning the icon with the first line of text.
 */
export function control(options: ControlOptions): ControlResult {
  let paddingX = options.shape === "pill" ? ("pill" as const) : ("edge-to-text" as const);
  let register = options.register ?? "glass";
  let result: ControlResult = {
    font: controlFont(),
    /* The Glasselated register is mono across every control the handoff draws —
     * buttons, badges, chips, nav rows, segmented items and the text inside wells
     * are all `var(--font-mono)`. Sans is for body copy and the pixel face is for
     * headings, so neither belongs on a control. `font` above still owns SIZE (the
     * S/M/L/XL ramp); these two only repoint family and weight, which is why they
     * come after it. Applying them here rather than per-component is the whole
     * point: 17 components import `control()`, and editing 17 files to say the
     * same thing is how the register drifts. */
    fontFamily: "code",
    /* Weight is per-register, unlike family. The handoff sets exactly one thing in
     * mono 400 — the button (--type-button, design-handoff-v2.css:163) — and sets the
     * stamp-like ones heavier: chips and badges at 700 (TerminalGlassLab.tsx:501, :239).
     * Emitting `normal` for every register put button weight on every chip and badge.
     *
     * Rows are NOT included, though the handoff draws them at 600: this fork's
     * fontWeight scale is normal/medium/bold/extra-bold/black (spectrum-theme.ts:701-715)
     * with no 600 rung, so the only reachable step is `bold` = 700, which overshoots
     * the drawn weight. Rows also set `medium` on their child labels in ~10 component
     * files, so moving the container alone would fix nothing and split the row family.
     * Left at `normal` deliberately until a 600 token exists. */
    fontWeight: register === "chip" || register === "badge" ? "bold" : "normal",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    paddingX: paddingX,
    minWidth: controlSize(),
  };

  /* ...and so is size, for the stamp band. `control()` took ownership of radius, rim
   * and now weight per register but left size wholly to `controlFont()`, which is the
   * button/field band — so a badge came out at 12px and a chip at 14px against the
   * handoff's 9.5px and 11px (TerminalGlassLab.tsx:238, :500). Two rungs down lands a
   * size-M chip on ~11px exactly; the badge band saturates at the bottom of the ui ramp
   * (see `controlFontStep`), landing near 11px rather than the drawn 9.5px. Set as
   * `fontSize`, not `font`, so it overrides ONLY the size the shorthand above
   * established and leaves family, weight, line-height and color intact — and it must
   * come after that shorthand to win. */
  if (register === "badge" || register === "chip") {
    result.fontSize = controlFontStep(2);
  }

  if (options.shape === "pill") {
    result.borderRadius = "pill";
  } else {
    /* Spectrum sized the corner off the control's height via a Major Second scale
     * (`controlBorderRadius`), so an XL button curved more than an XS one. The
     * handoff doesn't do that — every button it draws is 5px regardless of size,
     * its fields and chips are all 8px, and its rows all 6px. Flat radii replace the computed
     * one here; the `--size`/`--radius` custom properties stop being emitted. */
    result.borderRadius =
      register === "matte" || register === "chip"
        ? "default"
        : register === "row"
          ? "row"
          : "control";
  }

  /* Only the glass register wears the rim by default — see the docs above. */
  if (options.rim ?? (register === "glass" || register === "chip")) {
    result.boxShadow = "edge-glass";
  }

  if (register === "chip") {
    /* The handoff's chip is a three-part treatment — 8px corner, `--edge-glass` rim,
     * and a 1px edge — and the register was shipping only the first two. It draws the
     * chip as `border: 1px solid ${cp.border}` over its fill (TerminalGlassLab.tsx:505),
     * where `cp.border` is `--well-border` on a muted chip (:45) and `--interactive-fill`
     * on the selected one (:38, the same token as that chip's fill).
     *
     * The resting (muted) value lives here for the same reason it does for matte: the
     * edge belongs to the register, not to any one component. The selected colour is
     * per-component state, so TagGroup declares its own `borderColor` after this spread
     * and wins. */
    result.borderWidth = 1;
    result.borderStyle = "solid";
    result.borderColor = "well-border";
  }

  if (register === "matte") {
    /* The matte register paints its own surface, which the other three don't.
     *
     * It can, because unlike a button or a menu row, a field's `control()` spread
     * lands on the element that actually draws the box: nine of the ten matte call
     * sites followed this spread with a byte-identical `borderWidth: 2; borderStyle:
     * solid` pair and a `gray-25` fill. That block was the widest piece of copy-paste
     * left in the library, and it is exactly the thing the handoff disagrees with —
     * it draws every field at 1px in `--well-border` over `--surface-well`.
     *
     * Only the resting values live here. Components still declare their own
     * `borderColor` for focus/invalid/disabled, which lands after this spread and
     * wins — those states are per-component semantics, not register-level. */
    result.borderWidth = 1;
    result.borderStyle = "solid";
    result.borderColor = "well-border";
    result.backgroundColor = "well";

    /* ...and the well's texture, by the same argument as its fill. The handoff draws
     * no flat well: `<Well>` always opens with `<ScanOverlay />`
     * (TerminalGlassLab.tsx:280), and the two wells it uses as fields — the search
     * prompt (:419) and the tutor prompt (:461) — are no exception. Eleven matte
     * call sites, one texture; hand-rolling an overlay element in each is how the
     * register drifts.
     *
     * A component that overrides `backgroundColor` after this spread replaces only the
     * fill; the dither is a separate property and survives, painting over whatever
     * fill wins. */
    let scan = wellScan();
    result.backgroundImage = scan.backgroundImage;
    result.backgroundSize = scan.backgroundSize;
  }

  if (options.icon) {
    result.columnGap = "text-to-visual";
    result.paddingX = {
      default: paddingX,
      [iconOnly]: 0,
    };
    result["--iconMargin"] = {
      type: "marginStart",
      value: {
        default: fontRelative(-2),
        [iconOnly]: 0,
      },
    };
  }

  if (options.wrap) {
    result.minHeight = controlSize();

    if (options.icon) {
      result.paddingY = 0;
      result["--labelPadding"] = {
        type: "paddingTop",
        value: centerPadding(),
      };
      result.alignItems = {
        default: "baseline",
        [iconOnly]: "center",
      };
    } else {
      result.paddingY = centerPadding();
    }
  } else {
    result.height = controlSize();
  }

  return result;
}

/**
 * Viviana UI v2 (Glasselated): the glass half of the register — a translucent,
 * blurred, rim-lit container. This is the `MeshCard` from the handoff's own
 * primitives (`primitives.tsx:28-37`) expressed as style properties.
 *
 * The two surfaces differ by more than radius, which is why they are one helper
 * with a parameter rather than two radius tokens:
 *
 * | | radius | background | blur | rim | border |
 * |---|---|---|---|---|---|
 * | `panel` | 14px | `--surface-panel` | 18px | yes | 1px subtle |
 * | `card` | 12px | `--surface-card` | 14px | yes | 1px subtle |
 *
 * `backdrop-filter` is the load-bearing part. The surface tokens are already
 * translucent (`rgba(23,25,30,0.78)` and friends), so without the blur these
 * containers just look washed out — translucency plus blur is what reads as
 * glass, and blur cannot ride on a background-color, only on the element.
 *
 * The rim is `edge-glass-surface`, the softened sibling of the control rim: these
 * containers are translucent over the page, and the control's full-strength white
 * ring outlines them on a dark backdrop instead of catching their edge.
 *
 * Deliberately NOT applied to: terminal wells and fields, which the handoff calls
 * matte and "never glass" (design-handoff-v2.css:56); and controls, whose rim
 * comes from `control()` without any blur.
 */
export const glassSurface = (surface: "panel" | "card" = "panel") =>
  ({
    borderRadius: surface,
    backgroundColor: surface === "panel" ? "layer-1" : "layer-2",
    backdropFilter: surface === "panel" ? "var(--blur-panel)" : "var(--blur-card)",
    boxShadow: "edge-glass-surface",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "border-subtle",
  }) as const;

const allowedOverrides = [
  "margin",
  "marginStart",
  "marginEnd",
  "marginTop",
  "marginBottom",
  "marginX",
  "marginY",
  "flexGrow",
  "flexShrink",
  "flexBasis",
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
  "visibility",
] as const;

export const widthProperties = ["width", "minWidth", "maxWidth"] as const;

export const heightProperties = ["size", "height", "minHeight", "maxHeight"] as const;

export const fontProperties = [
  "font",
  "fontFamily",
  "fontWeight",
  "lineHeight",
  "fontSize",
] as const;

export type StylesProp = StyleString<
  (typeof allowedOverrides)[number] | (typeof widthProperties)[number]
>;
export type StylesPropWithHeight = StyleString<
  | (typeof allowedOverrides)[number]
  | (typeof widthProperties)[number]
  | (typeof heightProperties)[number]
>;
export type StylesPropWithoutWidth = StyleString<(typeof allowedOverrides)[number]>;
export type StylesPropWithFont = StyleString<(typeof fontProperties)[number]>;
export type UnsafeClassName = string & { properties?: never };
export interface UnsafeStyles {
  /** Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_className?: UnsafeClassName;
  /** Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_style?: CSSProperties;
}

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp;
}

export function getAllowedOverrides({ width = true, height = false, font = false } = {}): string[] {
  return (allowedOverrides as unknown as string[])
    .concat(width ? widthProperties : [])
    .concat(height ? heightProperties : [])
    .concat(font ? ["fontFamily", "fontWeight", "lineHeight", "fontSize"] : []);
}
