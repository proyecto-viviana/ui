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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ProgressBar.tsx

// Port of packages/@react-spectrum/s2/src/ProgressBar.tsx.

import {
  type JSX,
  createContext,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { createProgressBar, useLocale } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { keyframes } from "../style/style-macro" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  centerPadding,
  controlSize,
  fieldInput,
  fieldLabel,
  fieldValue,
  getAllowedOverrides,
  staticColor as staticColorStyles,
} from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type ProgressBarSize = "S" | "M" | "L" | "XL";
export type ProgressBarStaticColor = "white" | "black" | "auto";
export type ProgressBarLabelPosition = "top" | "side";

export interface ProgressBarProps {
  /** The current value. @default 0 */
  value?: number;
  /**
   * A second value beyond `value` rendered as a dithered extension of the fill —
   * the register's "in flight" segment (the XP bar's 6% checker after the 84%
   * solid, TerminalGlassLab.tsx:773-780). Purely visual; the accessible value
   * stays `value`. Ignored while indeterminate.
   */
  pendingValue?: number;
  /** The smallest value allowed. @default 0 */
  minValue?: number;
  /** The largest value allowed. @default 100 */
  maxValue?: number;
  /** The content to display as the value's label, e.g. "1 of 4". */
  valueLabel?: JSX.Element;
  /** Whether presentation is indeterminate when progress isn't known. */
  isIndeterminate?: boolean;
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions;
  /** The size of the progress bar. @default 'M' */
  size?: ProgressBarSize;
  /** The label to display above or beside the progress bar. */
  label?: JSX.Element;
  /** The static color style to apply over a color background. */
  staticColor?: ProgressBarStaticColor;
  /** The label's overall position relative to the progress bar. @default 'top' */
  labelPosition?: ProgressBarLabelPosition;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: `data-${string}`]: string | undefined;
}

export const ProgressBarContext = createContext<SpectrumContextValue<ProgressBarProps>>(null);

type ProgressBarStyleState = {
  size: ProgressBarSize;
  staticColor?: ProgressBarStaticColor;
  labelPosition: ProgressBarLabelPosition;
  labelAlign?: "start" | "end";
  isStaticColor: boolean;
  isIndeterminate: boolean;
};

const progressBarIndeterminateLtr = keyframes(`
  0% {
    transform: translateX(-70%) scaleX(0.7);
  }

  100% {
    transform: translateX(100%) scaleX(0.7);
  }
`);

const progressBarIndeterminateRtl = keyframes(`
  0% {
    transform: translateX(100%) scaleX(0.7);
  }

  100% {
    transform: translateX(-70%) scaleX(0.7);
  }
`);

const wrapperStyles = style<ProgressBarStyleState>(
  {
    ...staticColorStyles(),
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: {
        labelPosition: {
          top: ["1fr", "auto"],
          side: ["auto", "1fr", "auto"],
        },
      },
      isIndeterminate: {
        labelPosition: {
          top: ["1fr"],
          side: ["auto", "1fr"],
        },
      },
    },
    gridTemplateAreas: {
      default: {
        labelPosition: {
          top: ["label value", "bar bar"],
          side: ["label bar value"],
        },
      },
      isIndeterminate: {
        labelPosition: {
          top: ["label", "bar"],
          side: ["label bar"],
        },
      },
    },
    alignItems: "baseline",
    isolation: "isolate",
    minWidth: 48,
    maxWidth: 768,
    "--field-height": {
      type: "height",
      value: controlSize(),
    },
    "--track-to-label": {
      type: "height",
      value: 4,
    },
    "--field-gap": {
      type: "rowGap",
      value: centerPadding("calc(var(--field-height) + var(--track-to-label))"),
    },
    columnGap: 12,
  },
  getAllowedOverrides(),
);

const labelWrapperStyles = style<ProgressBarStyleState>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
  },
});

const labelStyles = style<ProgressBarStyleState>({
  ...fieldLabel(),
});

/* The readout is the quieter sibling of the label, not a copy of it: the handoff
 * sets the label to `var(--type-label)` (TerminalGlassLab.tsx:749) and the readout
 * beside it to mono 10.5px in --text-secondary (:753-758). Spreading `fieldLabel()`
 * here made the pair byte-identical. */
const valueStyles = style<ProgressBarStyleState>({
  ...fieldValue(),
  gridArea: "value",
});

const trackStyles = style<ProgressBarStyleState>({
  ...fieldInput(),
  gridArea: "bar",
  /* Containing block for the rim overlay below. `fieldInput()` spreads only SIZE
   * containment (`contain: "inline-size"`, s2-internal/style-utils.ts:160-165), and
   * size containment does not make an element a containing block for absolutely
   * positioned descendants — only layout/paint containment does. Without this the
   * overlay's `inset: 0` would resolve against wrapperStyles (`position: "relative"`,
   * :107) and rim the label and value rows along with the bar.
   * Stacking is unchanged: `zIndex: 1` below already applied to this grid item and
   * already established a stacking context. */
  position: "relative",
  overflow: "hidden",
  /* Row layout so the pending segment sits flush after the fill — the handoff's
   * track is itself `display: flex` (TerminalGlassLab.tsx:763-770) for exactly
   * this: solid fill then dithered lead, left to right. The rim overlay is
   * absolutely positioned and thus not a flex item. */
  display: "flex",
  /* Square, not a pill. The register's one drawn progress bar is the XP bar at
   * TerminalGlassLab.tsx:763-770 — an 8px-tall div in --surface-inset with
   * `overflow: hidden` and no border-radius declaration on the track, on the 84%
   * fill (:772), or on the dithered lead (:773-780). 9999px was Spectrum's. */
  borderRadius: "none",
  backgroundColor: {
    /* The register's bar track is the inset surface (TerminalGlassLab.tsx:767) — a
     * recess. gray-300 is a mid-slate slab that read LIGHTER than its host panel in
     * dark, inverting the recess. */
    default: "pasteboard",
    isStaticColor: "transparent-overlay-300",
    forcedColors: "ButtonFace",
  },
  outlineWidth: {
    default: 0,
    forcedColors: 1,
  },
  outlineStyle: {
    default: "none",
    forcedColors: "solid",
  },
  outlineColor: {
    default: "transparent",
    forcedColors: "ButtonText",
  },
  zIndex: 1,
  height: {
    default: 6,
    size: {
      S: 4,
      M: 6,
      L: 8,
      XL: 10,
    },
  },
});

/* The handoff rims the bar with --edge-glass, but paints the rim on a separate
 * absolutely-positioned overlay rather than on the track itself
 * (TerminalGlassLab.tsx:781-788). That is not incidental: an inset box-shadow is
 * painted with the element's own background, i.e. UNDER every in-flow child, and
 * `overflow: hidden` clips children without lifting the shadow above them. A rim
 * declared on trackStyles would therefore be occluded across the filled fraction of
 * the bar and survive only on the empty remainder — a half-rim that reads as a bug.
 * Since this register casts no drop shadows, the rim is the only thing seating the
 * bar in its surface, so it has to be drawn where it can be seen.
 * `borderRadius: "inherit"` so it keeps tracking the track's corner if that moves.
 * Static (no conditions), so the macro yields a string used directly as a class —
 * same pattern as color/ColorSwatchPicker.tsx:119-133, applied at :233. */
const trackRimStyles = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  borderRadius: "inherit",
  boxShadow: "edge-glass",
});

const fillStyles = style<ProgressBarStyleState>({
  width: "full",
  height: "full",
  borderStyle: "none",
  /* Square, to match the track. Redundant against the track's `overflow: hidden`,
   * but kept explicit so the two agree on the page — the handoff's fill segment
   * (TerminalGlassLab.tsx:772) is a bare `width: "84%"` div with no radius. */
  borderRadius: "none",
  backgroundColor: {
    default: "accent",
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
  // Mirror upstream `fill`: the origin only matters for the indeterminate sweep
  // (translateX/scaleX). Applying it unconditionally shifts the determinate
  // bar's computed `transform-origin` off centre with no visual effect — a
  // self-inflicted divergence D1 flags on the `fill` part.
  transformOrigin: {
    isIndeterminate: "left",
  },
});

/* The "in flight" segment: the register's ordered-dither checker
 * (repeating-conic at a 4px tile, TerminalGlassLab.tsx:773-780) continuing the
 * fill at half visual density. The accent has to reach the gradient through a
 * custom property because the macro's color vocabulary stops at backgroundColor —
 * same trick as Badge's `--iconPrimary` and ProgressCircle's `--pv-ring-fill`. */
const pendingStyles = style<ProgressBarStyleState>({
  height: "full",
  flexShrink: 0,
  borderStyle: "none",
  borderRadius: "none",
  backgroundImage: "[repeating-conic-gradient(var(--pv-pending-fill) 0% 25%, transparent 0% 50%)]",
  backgroundSize: "[4px 4px]",
  "--pv-pending-fill": {
    type: "backgroundColor",
    value: {
      default: "accent",
      isStaticColor: "transparent-overlay-900",
      forcedColors: "ButtonText",
    },
  },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

function stringValueLabel(value: JSX.Element | undefined): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function getDataAttributes(source: object): JSX.HTMLAttributes<HTMLDivElement> {
  const record = source as Record<string, unknown>;
  const attributes: Record<string, string | undefined> = {};

  for (const key in record) {
    if (key.startsWith("data-")) {
      const value = record[key];
      attributes[key] = value == null ? undefined : String(value);
    }
  }

  return attributes as JSX.HTMLAttributes<HTMLDivElement>;
}

function indeterminateAnimation(direction: "ltr" | "rtl" | string): string {
  const keyframe = direction === "rtl" ? progressBarIndeterminateRtl : progressBarIndeterminateLtr;
  return `${keyframe} 1000ms cubic-bezier(.37, 0, .63, 1) infinite`;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ProgressBarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as ProgressBarProps;
  const [local] = splitProps(merged, [
    "value",
    "pendingValue",
    "minValue",
    "maxValue",
    "valueLabel",
    "isIndeterminate",
    "formatOptions",
    "size",
    "label",
    "staticColor",
    "labelPosition",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
  ]);
  const locale = useLocale();
  const labelId = createUniqueId();
  const size = () => local.size ?? "M";
  const labelPosition = () => local.labelPosition ?? "top";
  const isIndeterminate = () => local.isIndeterminate ?? false;
  const isStaticColor = () => !!local.staticColor;
  const state = (labelAlign?: "start" | "end"): ProgressBarStyleState => ({
    size: size(),
    staticColor: local.staticColor,
    labelPosition: labelPosition(),
    labelAlign,
    isStaticColor: isStaticColor(),
    isIndeterminate: isIndeterminate(),
  });
  const accessibleLabelledBy = () =>
    local["aria-labelledby"] ?? (!local["aria-label"] && local.label ? labelId : undefined);

  const progressAria = createProgressBar({
    get id() {
      return local.id;
    },
    get value() {
      return local.value;
    },
    get minValue() {
      return local.minValue;
    },
    get maxValue() {
      return local.maxValue;
    },
    get valueLabel() {
      return stringValueLabel(local.valueLabel);
    },
    get isIndeterminate() {
      return isIndeterminate();
    },
    get formatOptions() {
      return local.formatOptions;
    },
    get "aria-label"() {
      return local["aria-label"];
    },
    get "aria-labelledby"() {
      return accessibleLabelledBy();
    },
    get "aria-describedby"() {
      return local["aria-describedby"];
    },
    get "aria-details"() {
      return local["aria-details"];
    },
  });

  const percentage = createMemo(() => {
    const minValue = local.minValue ?? 0;
    const maxValue = local.maxValue ?? 100;
    const value = clamp(local.value ?? 0, minValue, maxValue);
    return ((value - minValue) / safeRange(minValue, maxValue)) * 100;
  });
  const pendingWidth = createMemo(() => {
    if (local.pendingValue == null) {
      return null;
    }
    const minValue = local.minValue ?? 0;
    const maxValue = local.maxValue ?? 100;
    const pending = clamp(local.pendingValue, minValue, maxValue);
    const pendingPercentage = ((pending - minValue) / safeRange(minValue, maxValue)) * 100;
    return Math.max(0, pendingPercentage - percentage());
  });
  const valueText = () =>
    local.valueLabel ?? (progressAria.progressBarProps["aria-valuetext"] as string | undefined);
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <div
      {...getDataAttributes(merged)}
      {...progressAria.progressBarProps}
      data-rac=""
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      class={[local.UNSAFE_className, wrapperStyles(state(), mergedStyles())]
        .filter(Boolean)
        .join(" ")}
      style={mergedUnsafeStyle()}
      slot={local.slot ?? undefined}
    >
      {local.label && (
        <div class={labelWrapperStyles(state("start"))}>
          <span id={labelId} class={labelStyles(state("start"))}>
            {local.label}
          </span>
        </div>
      )}
      {local.label && !isIndeterminate() && (
        <span class={valueStyles(state("end"))}>{valueText()}</span>
      )}
      <div class={trackStyles(state())}>
        <div
          class={fillStyles(state())}
          style={{
            width: isIndeterminate() ? undefined : `${percentage()}%`,
            animation: isIndeterminate() ? indeterminateAnimation(locale().direction) : undefined,
          }}
        />
        {!isIndeterminate() && pendingWidth() != null && (
          <div
            aria-hidden="true"
            class={pendingStyles(state())}
            style={{ width: `${pendingWidth()}%` }}
          />
        )}
        <div aria-hidden="true" class={trackRimStyles} />
      </div>
    </div>
  );
}
