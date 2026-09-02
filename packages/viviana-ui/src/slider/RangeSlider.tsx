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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/RangeSlider.tsx

// Port of packages/@react-spectrum/s2/src/RangeSlider.tsx.

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { createStringFormatter, useLocale } from "@proyecto-viviana/solidaria";
import { s2IntlStrings } from "../intl";
import type { StyleString } from "../style";
import { focusRing, style } from "../style" with { type: "macro" };
import {
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  fieldValue,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type RangeSliderSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2RangeSliderSize = "S" | "M" | "L" | "XL";
export type RangeSliderVariant = "default" | "accent";
export type RangeSliderTrackStyle = "thin" | "thick";
export type RangeSliderThumbStyle = "default" | "precise";
export type RangeSliderLabelPosition = "top" | "side";
export type RangeSliderLabelAlign = "start" | "end";

export interface RangeValue {
  start: number;
  end: number;
}

export interface RangeSliderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "onChange" | "onChangeEnd" | "ref"
> {
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  onChangeEnd?: (value: RangeValue) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  size?: RangeSliderSize;
  /** Legacy alias. Prefer S2 `isEmphasized`. */
  variant?: RangeSliderVariant;
  isEmphasized?: boolean;
  trackStyle?: RangeSliderTrackStyle;
  thumbStyle?: RangeSliderThumbStyle;
  class?: string;
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  showOutput?: boolean;
  labelPosition?: RangeSliderLabelPosition;
  labelAlign?: RangeSliderLabelAlign;
  startName?: string;
  endName?: string;
  form?: string;
  isDisabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}

type RangeSliderStyleState = {
  size?: S2RangeSliderSize;
  labelPosition?: RangeSliderLabelPosition;
  labelAlign?: RangeSliderLabelAlign;
  isInForm?: boolean;
  direction?: "ltr" | "rtl";
  isDisabled?: boolean;
  isDragging?: boolean;
  isHovered?: boolean;
  isFocusVisible?: boolean;
};

export const RangeSliderContext = createContext<SpectrumContextValue<RangeSliderProps>>(null);

const sliderRoot = style<RangeSliderStyleState>(
  {
    ...field(),
    font: controlFont(),
    alignItems: {
      // Upstream applies field() (align-items: baseline) + slider() as two
      // separate classes; slider() only overrides for side layout. We merge
      // both into one style(), so the baseline default must be restored here.
      default: "baseline",
      labelPosition: {
        side: "center",
      },
    },
    color: {
      default: "[var(--text-secondary)]",
      forcedColors: "ButtonText",
      isDisabled: "disabled",
    },
    columnGap: {
      size: {
        S: 16,
        M: 16,
        L: 20,
        XL: 24,
      },
      isInForm: 12,
    },
  },
  getAllowedOverrides(),
);

const labelContainer = style<RangeSliderStyleState>({
  display: {
    labelPosition: {
      top: "grid",
    },
  },
  gridArea: "label",
  width: "full",
  gridTemplateAreas: {
    labelPosition: {
      top: ["label output"],
    },
  },
  gridTemplateColumns: {
    labelPosition: {
      top: ["1fr auto"],
    },
  },
  textAlign: {
    labelPosition: {
      side: {
        labelAlign: {
          start: "start",
          end: "end",
        },
      },
    },
  },
  "--field-gap": {
    type: "paddingBottom",
    value: 0,
  },
});

const sliderLabel = style<RangeSliderStyleState>({
  ...fieldLabel(),
});

// The FieldLabel outer wrapper `<div>` (upstream `Field.tsx` FieldLabel): an inline
// box in the `label` grid cell that owns the label-align text-align + the top
// paddingBottom(--field-gap) + contain(inline-size). RangeSlider never sets `isQuiet`,
// so upstream's `contain.isQuiet:'none'` branch is a dead condition here and is omitted.
const fieldLabelWrapper = style<RangeSliderStyleState>({
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

const outputStyle = style<RangeSliderStyleState>({
  // The readout is a distinct role from its label: the register never pairs the
  // two at the same size. Without this the output declared no font at all and
  // inherited field()'s, landing byte-identical to the label beside it.
  ...fieldValue(),
  gridArea: "output",
  textAlign: {
    labelPosition: {
      top: {
        direction: {
          ltr: "end",
          rtl: "start",
        },
      },
      side: {
        direction: {
          ltr: "start",
          rtl: "end",
        },
        isInForm: "end",
      },
    },
  },
});

const inputRow = style<RangeSliderStyleState>({
  ...fieldInput(),
  display: "inline-flex",
  alignItems: "center",
  gap: {
    default: 16,
    size: {
      L: 20,
      XL: 24,
    },
  },
});

const track = style<RangeSliderStyleState>({
  gridArea: "track",
  position: "relative",
  width: "full",
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48,
    },
  },
});

const thumbContainer = style<RangeSliderStyleState>({
  size: {
    size: {
      S: 18,
      M: 20,
      L: 22,
      XL: 24,
    },
  },
  display: "inline-block",
  position: "absolute",
  top: "50%",
});

const thumbHitArea = style<{ size?: S2RangeSliderSize; thumbStyle?: RangeSliderThumbStyle }>({
  size: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26,
        },
      },
    },
  },
});

const thumb = style<RangeSliderStyleState & { thumbStyle?: RangeSliderThumbStyle }>({
  ...focusRing(),
  display: "inline-block",
  boxSizing: "border-box",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translateY(-50%) translateX(-50%)",
  width: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: 6,
    },
  },
  height: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26,
        },
      },
    },
  },
  borderRadius: "full",
  borderStyle: "solid",
  // Chrome edges in this register are 1px. (Its one 2px edge is the avatar
  // stack's knockout ring, drawn in a *surface* colour — a stacking device, not
  // a control edge. This border is chrome-coloured, so it takes the hairline.)
  borderWidth: 1,
  // The rim the register puts on raised, filled chrome. The thumb is a filled,
  // draggable control, so it takes it. Note this reads only in the dark scheme:
  // --edge-glass is white-on-white and the thumb fill is gray-25.
  boxShadow: "edge-glass",
  borderColor: {
    default: "gray-800",
    isHovered: "gray-900",
    isDragging: "gray-900",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonBorder",
      isDisabled: "GrayText",
    },
  },
  backgroundColor: {
    default: "gray-25",
    forcedColors: "ButtonFace",
  },
});

const upperTrack = style<{ isDisabled?: boolean; trackStyle?: RangeSliderTrackStyle }>({
  height: {
    trackStyle: {
      thin: 4,
      thick: 16,
    },
  },
  top: "50%",
  // Square trough. The register's drawn radius ladder is 5 / 6 / 8 / 10 / 50% /
  // 999px — `sm` (4px) is off it entirely — and the one value-carrying bar it
  // draws (the XP bar) declares no border-radius on either the track or the fill.
  borderRadius: "none",
  position: "absolute",
  /* Inset trough, not a grey plate — see slider/index.tsx:375 for the reasoning and the
   * drawn source (the XP bar, `--surface-inset` under an `--accent-primary` fill). */
  backgroundColor: {
    default: "pasteboard",
    forcedColors: "ButtonFace",
    isDisabled: "disabled",
  },
  translateY: "-50%",
  width: "full",
  boxSizing: "border-box",
  outlineStyle: "solid",
  outlineWidth: "[.5px]",
  outlineOffset: -0.5,
  outlineColor: {
    default: "transparent",
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
});

const filledTrack = style<{
  isDisabled?: boolean;
  isEmphasized?: boolean;
  trackStyle?: RangeSliderTrackStyle;
}>({
  height: {
    trackStyle: {
      thin: 4,
      thick: 16,
    },
  },
  top: "50%",
  // Square, matching the trough above.
  borderRadius: "none",
  position: "absolute",
  backgroundColor: {
    // The register draws no neutral filled segment — the fill on its one
    // value-carrying bar is the accent. Consequence, deliberate: `isEmphasized`
    // (and its legacy `variant="accent"` alias) no longer changes this fill. The
    // key is kept so the prop stays plumbed rather than silently dropped.
    default: "accent-900",
    isEmphasized: "accent-900",
    isDisabled: "disabled",
    forcedColors: {
      default: "Highlight",
      isDisabled: "GrayText",
    },
  },
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: "[.5px]",
  borderColor: {
    default: "transparent",
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
  translateY: "-50%",
});

function normalizeRangeSliderSize(size: RangeSliderSize | undefined): S2RangeSliderSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    case "S":
    case "M":
    case "L":
    case "XL":
      return size;
    default:
      return "M";
  }
}

function numberOr(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const decimalPlaces = (step.toString().split(".")[1] || "").length;
  const rounded = Number(snapped.toFixed(decimalPlaces));
  return clamp(rounded, min, max);
}

function rangesEqual(a: RangeValue, b: RangeValue): boolean {
  return a.start === b.start && a.end === b.end;
}

/**
 * A range slider allows users to select a numeric subset from a range.
 */
export function RangeSlider(props: RangeSliderProps): JSX.Element {
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(RangeSliderContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, domProps] = splitProps(mergedProps, [
    "id",
    "value",
    "defaultValue",
    "onChange",
    "onChangeEnd",
    "minValue",
    "maxValue",
    "step",
    "size",
    "variant",
    "isEmphasized",
    "trackStyle",
    "thumbStyle",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "contextualHelp",
    "showOutput",
    "labelPosition",
    "labelAlign",
    "startName",
    "endName",
    "form",
    "isDisabled",
    "formatOptions",
    "slot",
    "ref",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
  ]);

  const locale = useLocale();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const fallbackRootId = createUniqueId();
  const labelId = createUniqueId();
  const size = () => normalizeRangeSliderSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const trackStyle = () => local.trackStyle ?? "thin";
  const thumbStyle = () => local.thumbStyle ?? "default";
  const isEmphasized = () => local.isEmphasized ?? local.variant === "accent";
  const showOutput = () => local.showOutput ?? true;
  const isDisabled = () => local.isDisabled ?? false;
  const minValue = () => numberOr(local.minValue, 0);
  const step = () => {
    const resolvedStep = numberOr(local.step, 1);
    return resolvedStep > 0 ? resolvedStep : 1;
  };
  const maxValue = () => {
    const min = minValue();
    const rawMax = numberOr(local.maxValue, 100);
    return rawMax > min ? rawMax : min + step();
  };
  const cssDirection = () => (locale().direction === "rtl" ? "right" : "left");
  const rootId = () => local.id ?? fallbackRootId;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );

  const formatter = createMemo(() => new Intl.NumberFormat(locale().locale, local.formatOptions));
  const normalizeRange = (value: RangeValue | undefined): RangeValue => {
    const min = minValue();
    const max = maxValue();
    const fallback = value ?? { start: min, end: max };
    const start = snapToStep(numberOr(fallback.start, min), min, max, step());
    const end = snapToStep(numberOr(fallback.end, max), min, max, step());

    return {
      start: Math.min(start, end),
      end: Math.max(start, end),
    };
  };

  const [internalRange, setInternalRange] = createSignal(
    normalizeRange(local.defaultValue ?? { start: minValue(), end: maxValue() }),
  );
  createEffect(() => {
    if (local.value === undefined) {
      setInternalRange(
        normalizeRange(local.defaultValue ?? { start: minValue(), end: maxValue() }),
      );
    }
  });

  const range = createMemo(() => normalizeRange(local.value ?? internalRange()));
  const startValue = () => range().start;
  const endValue = () => range().end;
  const valuePercent = (value: number) => (value - minValue()) / (maxValue() - minValue());
  const startPercent = createMemo(() => clamp(valuePercent(startValue()), 0, 1));
  const endPercent = createMemo(() => clamp(valuePercent(endValue()), 0, 1));
  // Mirror react-stately `useSliderState.getFormattedValue` (dist switch on value
  // arity): a lone number formats plainly, a [start, end] pair uses
  // `Intl.NumberFormat.formatRange` — which yields an en-dash with NO surrounding
  // spaces (e.g. "30–60"), not the manual "30 – 60" the port previously emitted.
  // Both the visible output text and the reserve-width measurement route through
  // this so the port matches RAC's `SliderOutput` default child + upstream
  // `SliderBase` maxLabelLength byte-for-byte.
  const getFormattedValue = (value: number | readonly [number, number]) => {
    const fmt = formatter();
    return typeof value === "number" ? fmt.format(value) : fmt.formatRange(value[0], value[1]);
  };
  const outputText = createMemo(() => getFormattedValue([startValue(), endValue()]));
  // Upstream `SliderBase` (Slider.tsx) two-handle branch: reserve width =
  // `max(len(getFormattedValue([min, min+step])), len(getFormattedValue([max-step,
  // max])))`. Each argument is a 2-element array, so `getFormattedValue` routes it
  // through `formatRange` (NOT `format([array])→NaN`). The prior hand-rolled
  // `3 + max*2` over-reserved (9ch), forcing a wide output column that also narrowed
  // the track and shifted the thumbs.
  const maxLabelLength = createMemo(() => {
    const min = minValue();
    const max = maxValue();
    const stepValue = step();
    return Math.max(
      [...getFormattedValue([min, min + stepValue])].length,
      [...getFormattedValue([max - stepValue, max])].length,
    );
  });

  const [draggingThumb, setDraggingThumb] = createSignal<"start" | "end" | null>(null);
  const [focusedThumb, setFocusedThumb] = createSignal<"start" | "end" | null>(null);
  const [hoveredThumb, setHoveredThumb] = createSignal<"start" | "end" | null>(null);
  const [interactionRange, setInteractionRange] = createSignal<RangeValue | null>(null);
  let trackRef: HTMLDivElement | undefined;
  let startThumbRef: HTMLDivElement | undefined;
  let endThumbRef: HTMLDivElement | undefined;

  const labelStyleState = () => ({
    size: size(),
    labelPosition: labelPosition(),
    labelAlign: labelAlign(),
    isInForm,
    direction: locale().direction,
    isDisabled: isDisabled(),
  });

  const rootClass = () =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      sliderRoot(labelStyleState(), mergedStyles()),
    ]
      .filter(Boolean)
      .join(" ");

  const hiddenInputProps = (name: string | undefined, value: number) => ({
    type: "hidden",
    name,
    form: local.form,
    value,
    disabled: isDisabled() || undefined,
  });

  const constrainToStep = (value: number, min: number, max: number) =>
    clamp(snapToStep(value, minValue(), maxValue(), step()), min, max);

  const applyRange = (nextRange: RangeValue, shouldEnd = false): RangeValue => {
    const normalized = normalizeRange(nextRange);
    setInteractionRange(normalized);

    if (!rangesEqual(normalized, range())) {
      if (local.value === undefined) {
        setInternalRange(normalized);
      }
      local.onChange?.(normalized);
    }

    if (shouldEnd) {
      local.onChangeEnd?.(normalized);
      setInteractionRange(null);
    }

    return normalized;
  };

  const updateThumbValue = (thumbName: "start" | "end", value: number, shouldEnd = false) => {
    const current = range();
    if (thumbName === "start") {
      return applyRange(
        { start: constrainToStep(value, minValue(), current.end), end: current.end },
        shouldEnd,
      );
    }

    return applyRange(
      { start: current.start, end: constrainToStep(value, current.start, maxValue()) },
      shouldEnd,
    );
  };

  const getValueFromPointer = (clientX: number): number => {
    if (!trackRef) {
      return minValue();
    }

    const rect = trackRef.getBoundingClientRect();
    const rawPercent =
      locale().direction === "rtl"
        ? (rect.right - clientX) / rect.width
        : (clientX - rect.left) / rect.width;
    const percent = clamp(rawPercent, 0, 1);
    return snapToStep(
      percent * (maxValue() - minValue()) + minValue(),
      minValue(),
      maxValue(),
      step(),
    );
  };

  const closerThumb = (value: number): "start" | "end" => {
    const startDistance = Math.abs(value - startValue());
    const endDistance = Math.abs(value - endValue());

    if (startDistance < endDistance) {
      return "start";
    }
    if (endDistance < startDistance) {
      return "end";
    }

    return value <= startValue() ? "start" : "end";
  };

  const focusThumb = (thumbName: "start" | "end") => {
    (thumbName === "start" ? startThumbRef : endThumbRef)?.focus();
  };

  const onTrackPointerDown = (event: PointerEvent) => {
    if (isDisabled()) {
      return;
    }

    event.preventDefault();
    const value = getValueFromPointer(event.clientX);
    const thumbName = closerThumb(value);
    setDraggingThumb(thumbName);
    updateThumbValue(thumbName, value);
    focusThumb(thumbName);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onThumbPointerDown = (thumbName: "start" | "end", event: PointerEvent) => {
    if (isDisabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setDraggingThumb(thumbName);
    (event.currentTarget as HTMLElement).focus();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    const thumbName = draggingThumb();
    if (!thumbName) {
      return;
    }

    updateThumbValue(thumbName, getValueFromPointer(event.clientX));
  };

  const onPointerUp = (event: PointerEvent) => {
    const thumbName = draggingThumb();
    if (!thumbName) {
      return;
    }

    const finalRange = interactionRange() ?? range();
    setDraggingThumb(null);
    setInteractionRange(null);
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
    local.onChangeEnd?.(finalRange);
  };

  const pageStep = () =>
    Math.max(
      step(),
      snapToStep((maxValue() - minValue()) / 10, 0, maxValue() - minValue(), step()),
    );

  const onKeyDown = (thumbName: "start" | "end", event: KeyboardEvent) => {
    if (isDisabled()) {
      return;
    }

    const current = thumbName === "start" ? startValue() : endValue();
    let nextValue = current;
    let handled = true;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        nextValue = current + step();
        break;
      case "ArrowLeft":
      case "ArrowDown":
        nextValue = current - step();
        break;
      case "PageUp":
        nextValue = current + pageStep();
        break;
      case "PageDown":
        nextValue = current - pageStep();
        break;
      case "Home":
        nextValue = thumbName === "start" ? minValue() : startValue();
        break;
      case "End":
        nextValue = thumbName === "start" ? endValue() : maxValue();
        break;
      default:
        handled = false;
    }

    if (!handled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    updateThumbValue(thumbName, nextValue, true);
  };

  const pressScaleStyle = (
    element: HTMLDivElement | undefined,
    isDragging: boolean,
  ): JSX.CSSProperties => {
    const transform = cssDirection() === "right" ? "translate(50%, -50%)" : "translate(-50%, -50%)";

    if (!isDragging || !element) {
      return { transform };
    }

    const { width, height } = element.getBoundingClientRect();
    return {
      transform: `perspective(${Math.max(height, width / 3, 24)}px) ${transform} translate3d(0, 0, -2px)`,
    };
  };

  const thumbStyleState = (thumbName: "start" | "end") => ({
    ...labelStyleState(),
    isDragging: draggingThumb() === thumbName,
    isHovered: hoveredThumb() === thumbName,
    isFocusVisible: focusedThumb() === thumbName,
    thumbStyle: thumbStyle(),
  });

  const thumbWrapperStyle = (
    percent: number,
    thumbName: "start" | "end",
    element: HTMLDivElement | undefined,
  ): JSX.CSSProperties => ({
    [cssDirection()]: `${percent * 100}%`,
    ...pressScaleStyle(element, draggingThumb() === thumbName),
    "touch-action": "none",
  });

  const renderThumb = (thumbName: "start" | "end") => {
    const isStart = thumbName === "start";
    const value = () => (isStart ? startValue() : endValue());
    const percent = () => (isStart ? startPercent() : endPercent());
    const refSetter = (element: HTMLDivElement) => {
      if (isStart) {
        startThumbRef = element;
      } else {
        endThumbRef = element;
      }
    };
    const element = () => (isStart ? startThumbRef : endThumbRef);

    return (
      <div
        ref={refSetter}
        class={thumbContainer(thumbStyleState(thumbName))}
        style={thumbWrapperStyle(percent(), thumbName, element())}
        role="slider"
        tabIndex={isDisabled() ? undefined : 0}
        aria-label={
          isStart
            ? stringFormatter().format("slider.minimum")
            : stringFormatter().format("slider.maximum")
        }
        aria-valuemin={isStart ? minValue() : startValue()}
        aria-valuemax={isStart ? endValue() : maxValue()}
        aria-valuenow={value()}
        aria-valuetext={formatter().format(value())}
        aria-disabled={isDisabled() || undefined}
        onPointerDown={(event) => onThumbPointerDown(thumbName, event)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => onKeyDown(thumbName, event)}
        onFocus={() => setFocusedThumb(thumbName)}
        onBlur={() => setFocusedThumb(null)}
        onPointerEnter={() => setHoveredThumb(thumbName)}
        onPointerLeave={() => setHoveredThumb(null)}
      >
        <div class={thumbHitArea({ size: size(), thumbStyle: thumbStyle() })}>
          <div class={thumb(thumbStyleState(thumbName))} />
        </div>
      </div>
    );
  };

  return (
    <div
      {...domProps}
      id={rootId()}
      role="group"
      data-orientation="horizontal"
      data-disabled={isDisabled() ? "true" : undefined}
      aria-labelledby={
        local["aria-labelledby"] ?? (!local["aria-label"] && local.label ? labelId : undefined)
      }
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-details={local["aria-details"]}
      slot={local.slot ?? undefined}
      ref={(element) => assignRootRef(element)}
      class={rootClass()}
      style={mergedUnsafeStyle()}
    >
      <div class={labelContainer(labelStyleState())}>
        <Show when={local.label}>
          <div class={fieldLabelWrapper(labelStyleState())}>
            <label id={labelId} class={sliderLabel(labelStyleState())}>
              {local.label}
            </label>
            <Show when={local.contextualHelp}>
              <span data-slot="contextualHelp">{local.contextualHelp}</span>
            </Show>
          </div>
        </Show>
        <Show when={labelPosition() === "top" && showOutput()}>
          <output
            id={`${rootId()}-output`}
            for={rootId()}
            aria-live="off"
            class={outputStyle(labelStyleState())}
            style={{
              width: `${maxLabelLength()}ch`,
              "min-width": `${maxLabelLength()}ch`,
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {outputText()}
          </output>
        </Show>
      </div>

      <div class={inputRow(labelStyleState())}>
        <div
          ref={(element) => {
            trackRef = element;
          }}
          data-orientation="horizontal"
          class={track(labelStyleState())}
          style={{ position: "relative", "touch-action": "none" }}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div class={upperTrack({ isDisabled: isDisabled(), trackStyle: trackStyle() })}>
            <div
              class={filledTrack({
                isDisabled: isDisabled(),
                isEmphasized: isEmphasized(),
                trackStyle: trackStyle(),
              })}
              style={{
                width: `${Math.abs(endPercent() - startPercent()) * 100}%`,
                [cssDirection()]: `${Math.min(startPercent(), endPercent()) * 100}%`,
              }}
            />
          </div>
          {renderThumb("start")}
          {renderThumb("end")}
        </div>

        <Show when={labelPosition() === "side" && showOutput()}>
          <output
            id={`${rootId()}-output`}
            for={rootId()}
            aria-live="off"
            class={outputStyle(labelStyleState())}
            style={{
              width: `${maxLabelLength()}ch`,
              "min-width": `${maxLabelLength()}ch`,
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {outputText()}
          </output>
        </Show>
      </div>

      <Show when={local.startName}>
        <input {...hiddenInputProps(local.startName, startValue())} />
      </Show>
      <Show when={local.endName}>
        <input {...hiddenInputProps(local.endName, endValue())} />
      </Show>
    </div>
  );
}
