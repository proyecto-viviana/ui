/**
 * ColorSlider state management.
 * Based on @react-stately/color useColorSliderState.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type { Color, ColorChannel, ColorSpace } from "./types";
import { normalizeColor } from "./Color";

export type ColorSliderOrientation = "horizontal" | "vertical";

export interface ColorSliderStateOptions {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** The color channel this slider controls. */
  channel: ColorChannel;
  /** The color space to use for channel values. */
  colorSpace?: ColorSpace;
  /** The slider orientation. */
  orientation?: ColorSliderOrientation;
  /** Whether the slider is disabled. */
  isDisabled?: boolean;
  /** The locale for formatting. */
  locale?: string;
}

export interface ColorSliderState {
  /** The current color value. */
  readonly value: Color;
  /** Whether the slider is being dragged. */
  readonly isDragging: boolean;
  /** The color channel being controlled. */
  readonly channel: ColorChannel;
  /** The slider orientation. */
  readonly orientation: ColorSliderOrientation;
  /** The step value for the channel. */
  readonly step: number;
  /** The page step value for the channel. */
  readonly pageSize: number;
  /** The minimum value for the channel. */
  readonly minValue: number;
  /** The maximum value for the channel. */
  readonly maxValue: number;
  /** Whether the slider is disabled. */
  readonly isDisabled: boolean;

  /** Get the current channel value. */
  getThumbValue(): number;
  /** Get the minimum percent. */
  getThumbMinValue(): number;
  /** Get the maximum percent. */
  getThumbMaxValue(): number;
  /** Get the thumb value as a percentage. */
  getThumbPercent(): number;
  /** Set the channel value. */
  setThumbValue(value: number): void;
  /** Set the thumb value from a percentage (0-1). */
  setThumbPercent(percent: number): void;
  /** Increment the channel value. */
  incrementThumb(stepSize?: number): void;
  /** Decrement the channel value. */
  decrementThumb(stepSize?: number): void;
  /** Set the dragging state. */
  setDragging(isDragging: boolean): void;
  /** Get the display color (with alpha = 1). */
  getDisplayColor(): Color;
  /** Get the formatted value label. */
  getThumbValueLabel(): string;
}

/**
 * Creates state for a color slider.
 */
export function createColorSliderState(
  options: Accessor<ColorSliderStateOptions>,
): ColorSliderState {
  const getOptions = () => options();

  const normalizeValue = (value: Color | string) => {
    const color = normalizeColor(value);
    const colorSpace = getOptions().colorSpace;
    return colorSpace ? color.toFormat(colorSpace) : color;
  };

  // Internal value state
  const [internalValue, setInternalValue] = createSignal<Color | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  // Initialize internal value
  const initValue = () => {
    const opts = getOptions();
    if (opts.defaultValue) {
      return normalizeValue(opts.defaultValue);
    }
    return null;
  };

  // Set initial value
  if (internalValue() === null) {
    const init = initValue();
    if (init) {
      setInternalValue(init);
    }
  }

  // Controlled vs uncontrolled value
  const value = createMemo(() => {
    const opts = getOptions();
    if (opts.value !== undefined) {
      return normalizeValue(opts.value);
    }
    const fallback = internalValue() ?? normalizeValue("#ff0000");
    return opts.colorSpace ? fallback.toFormat(opts.colorSpace) : fallback;
  });

  const channel = createMemo(() => getOptions().channel);
  const orientation = createMemo<ColorSliderOrientation>(
    () => getOptions().orientation ?? "horizontal",
  );
  const isDisabled = createMemo(() => getOptions().isDisabled ?? false);
  const locale = createMemo(() => getOptions().locale ?? "en-US");

  // Get channel range
  const channelRange = createMemo(() => value().getChannelRange(channel()));

  const step = createMemo(() => channelRange().step);
  const pageSize = createMemo(() => channelRange().pageSize);
  const minValue = createMemo(() => channelRange().minValue);
  const maxValue = createMemo(() => channelRange().maxValue);

  // Update value
  const updateValue = (newColor: Color) => {
    const opts = getOptions();
    const nextColor = opts.colorSpace ? newColor.toFormat(opts.colorSpace) : newColor;

    // Controlled mode
    if (opts.value !== undefined) {
      opts.onChange?.(nextColor);
      return;
    }

    // Uncontrolled mode
    setInternalValue(nextColor);
    opts.onChange?.(nextColor);
  };

  // Get thumb value
  const getThumbValue = () => {
    return value().getChannelValue(channel());
  };

  // Get min/max values
  const getThumbMinValue = () => minValue();
  const getThumbMaxValue = () => maxValue();

  // Get thumb percent
  const getThumbPercent = () => {
    const val = getThumbValue();
    const min = minValue();
    const max = maxValue();
    return (val - min) / (max - min);
  };

  // Set thumb value
  const setThumbValue = (newValue: number) => {
    const min = minValue();
    const max = maxValue();
    const stepValue = step();
    const clamped = Math.max(min, Math.min(max, newValue));
    const precision = `${stepValue}`.split(".")[1]?.length ?? 0;
    const rounded = Number(
      (Math.round((clamped - min) / stepValue) * stepValue + min).toFixed(precision),
    );
    const newColor = value().withChannelValue(channel(), rounded);
    updateValue(newColor);
  };

  // Set thumb from percent
  const setThumbPercent = (percent: number) => {
    const min = minValue();
    const max = maxValue();
    const val = min + (max - min) * percent;
    setThumbValue(val);
  };

  // Increment
  const incrementThumb = (stepSize?: number) => {
    const s = stepSize ?? step();
    setThumbValue(getThumbValue() + s);
  };

  // Decrement
  const decrementThumb = (stepSize?: number) => {
    const s = stepSize ?? step();
    setThumbValue(getThumbValue() - s);
  };

  // Set dragging
  const setDraggingState = (dragging: boolean) => {
    const wasDragging = isDragging();
    setIsDragging(dragging);

    // Call onChangeEnd when dragging ends
    if (wasDragging && !dragging) {
      getOptions().onChangeEnd?.(value());
    }
  };

  // Get display color (alpha = 1)
  const getDisplayColor = () => {
    const v = value();
    if (channel() === "hue") {
      return normalizeColor(`hsl(${v.getChannelValue("hue")}, 100%, 50%)`);
    }
    return v.withChannelValue("alpha", 1);
  };

  // Get formatted value label
  const getThumbValueLabel = () => {
    const v = value();
    const ch = channel();
    const loc = locale();
    return v.formatChannelValue(ch, loc);
  };

  return {
    get value() {
      return value();
    },
    get isDragging() {
      return isDragging();
    },
    get channel() {
      return channel();
    },
    get orientation() {
      return orientation();
    },
    get step() {
      return step();
    },
    get pageSize() {
      return pageSize();
    },
    get minValue() {
      return minValue();
    },
    get maxValue() {
      return maxValue();
    },
    get isDisabled() {
      return isDisabled();
    },
    getThumbValue,
    getThumbMinValue,
    getThumbMaxValue,
    getThumbPercent,
    setThumbValue,
    setThumbPercent,
    incrementThumb,
    decrementThumb,
    setDragging: setDraggingState,
    getDisplayColor,
    getThumbValueLabel,
  };
}
