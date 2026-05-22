/**
 * ColorField state management.
 * Based on @react-stately/color useColorFieldState and useColorChannelFieldState.
 */

import { createEffect, createMemo, createSignal, type Accessor } from "solid-js";
import type { Color, ColorChannel, ColorChannelRange, ColorFormat, ColorSpace } from "./types";
import { createRGBColor, normalizeColor, parseColor } from "./Color";

const HEX_COLOR_MAX = 0xffffff;
const PARTIAL_HEX_PATTERN = /^#?[0-9a-f]{0,6}$/i;

export interface ColorFieldStateOptions {
  /** The current color value (controlled). */
  value?: Color | string | null;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string | null;
  /** Handler called when the color changes. */
  onChange?: (color: Color | null) => void;
  /** The color channel to edit (for single channel mode). */
  channel?: ColorChannel;
  /** The color space to use for channel mode. */
  colorSpace?: ColorSpace;
  /** The color format for parsing/displaying in hex mode. */
  colorFormat?: ColorFormat;
  /** Locale used to format channel values. */
  locale?: string;
  /** Whether the field is disabled. */
  isDisabled?: boolean;
  /** Whether the field is read-only. */
  isReadOnly?: boolean;
  /** Whether the field is invalid. */
  isInvalid?: boolean;
  /** Whether the field is required. */
  isRequired?: boolean;
}

export interface ColorFieldState {
  /** The current color value (null if empty). */
  readonly value: Color | null;
  /** The color used for channel calculations. */
  readonly colorValue: Color;
  /** The current input text. */
  readonly inputValue: string;
  /** The numeric value exposed by channel fields. */
  readonly numberValue: number;
  /** The channel minimum value after formatting normalization. */
  readonly minValue: number;
  /** The channel maximum value after formatting normalization. */
  readonly maxValue: number;
  /** The channel keyboard step after formatting normalization. */
  readonly step: number;
  /** The channel page step after formatting normalization. */
  readonly pageSize: number;
  /** Number formatter options for channel fields. */
  readonly formatOptions: Intl.NumberFormatOptions;
  /** Whether the input is invalid. */
  readonly isInvalid: boolean;
  /** Whether the field is disabled. */
  readonly isDisabled: boolean;
  /** Whether the field is read-only. */
  readonly isReadOnly: boolean;
  /** Whether the field is required. */
  readonly isRequired: boolean;
  /** The color channel being edited (if single channel mode). */
  readonly channel: ColorChannel | undefined;

  /** Set the input text value. */
  setInputValue(value: string): void;
  /** Set the color value. */
  setColorValue(value: Color | null): void;
  /** Commit the current input value. */
  commit(): void;
  /** Increment the color value. */
  increment(): void;
  /** Decrement the color value. */
  decrement(): void;
  /** Increment by page size or to the maximum. */
  incrementToMax(): void;
  /** Decrement by page size or to the minimum. */
  decrementToMin(): void;
  /** Validate the current input or a candidate input. */
  validate(value?: string): boolean;
}

function normalizeNullableColor(value: Color | string | null | undefined): Color | null {
  if (value == null) {
    return null;
  }
  return normalizeColor(value);
}

function getDefaultValue(options: ColorFieldStateOptions): Color | null {
  if (options.defaultValue !== undefined) {
    return normalizeNullableColor(options.defaultValue);
  }

  if (options.value !== undefined) {
    return normalizeNullableColor(options.value);
  }

  return null;
}

function convertColor(color: Color, colorSpace: ColorSpace | undefined): Color {
  return colorSpace ? color.toFormat(colorSpace) : color;
}

function getDisplayColor(color: Color | null, colorSpace: ColorSpace | undefined): Color {
  return convertColor(color ?? createRGBColor(0, 0, 0), colorSpace);
}

function getChannelMultiplier(color: Color, channel: ColorChannel): number {
  const range = color.getChannelRange(channel);
  const formatOptions = color.getChannelFormatOptions(channel);
  return formatOptions.style === "percent" && range.maxValue === 100 ? 100 : 1;
}

function getNormalizedRange(color: Color, channel: ColorChannel): ColorChannelRange {
  const multiplier = getChannelMultiplier(color, channel);
  const range = color.getChannelRange(channel);

  return {
    minValue: range.minValue / multiplier,
    maxValue: range.maxValue / multiplier,
    step: range.step / multiplier,
    pageSize: range.pageSize / multiplier,
  };
}

function formatColorValue(
  color: Color | null,
  channel: ColorChannel | undefined,
  colorSpace: ColorSpace | undefined,
  format: ColorFormat | undefined,
  locale: string,
): string {
  if (!color) {
    return "";
  }

  const displayColor = getDisplayColor(color, colorSpace);

  if (channel) {
    return displayColor.formatChannelValue(channel, locale);
  }

  return displayColor.toString(format ?? "hex");
}

function normalizeHexInput(value: string): string {
  return value.startsWith("#") ? value : `#${value}`;
}

function parseHexValue(value: string, format: ColorFormat | undefined): Color {
  const color = parseColor(normalizeHexInput(value));
  return format ? color.toFormat(format) : color;
}

function parseChannelValue(text: string, color: Color, channel: ColorChannel): number | null {
  const trimmed = text.trim();
  const hasPercent = trimmed.endsWith("%");
  const parsed = Number.parseFloat(hasPercent ? trimmed.slice(0, -1) : trimmed);

  if (Number.isNaN(parsed)) {
    return null;
  }

  const range = color.getChannelRange(channel);
  const formatOptions = color.getChannelFormatOptions(channel);
  const multiplier = getChannelMultiplier(color, channel);
  const rawValue = hasPercent && formatOptions.style === "percent" ? parsed : parsed * multiplier;

  return Math.min(range.maxValue, Math.max(range.minValue, rawValue));
}

function hexIntToColor(value: number): Color {
  const clamped = Math.min(HEX_COLOR_MAX, Math.max(0, Math.round(value)));
  const red = (clamped >> 16) & 0xff;
  const green = (clamped >> 8) & 0xff;
  const blue = clamped & 0xff;
  return createRGBColor(red, green, blue);
}

/**
 * Creates state for a color field (text input for color values).
 */
export function createColorFieldState(options: Accessor<ColorFieldStateOptions>): ColorFieldState {
  const getOptions = () => options();
  const initialOptions = getOptions();
  const initialValue = getDefaultValue(initialOptions);

  const [internalValue, setInternalValue] = createSignal<Color | null>(initialValue);
  const [inputValue, setInputValueInternal] = createSignal(
    formatColorValue(
      initialValue,
      initialOptions.channel,
      initialOptions.colorSpace,
      initialOptions.colorFormat,
      initialOptions.locale ?? "en-US",
    ),
  );
  const [invalidInput, setInvalidInput] = createSignal(false);

  const channel = createMemo(() => getOptions().channel);
  const colorSpace = createMemo(() => getOptions().colorSpace);
  const locale = createMemo(() => getOptions().locale ?? "en-US");

  const value = createMemo(() => {
    const opts = getOptions();
    if (opts.value !== undefined) {
      return normalizeNullableColor(opts.value);
    }
    return internalValue();
  });

  const colorValue = createMemo(() => getDisplayColor(value(), colorSpace()));
  const isDisabled = createMemo(() => getOptions().isDisabled ?? false);
  const isReadOnly = createMemo(() => getOptions().isReadOnly ?? false);
  const isRequired = createMemo(() => getOptions().isRequired ?? false);
  const isInvalid = createMemo(() => (getOptions().isInvalid ?? false) || invalidInput());

  const formatCurrentValue = (color: Color | null = value()) =>
    formatColorValue(color, channel(), colorSpace(), getOptions().colorFormat, locale());

  createEffect(() => {
    setInputValueInternal(formatCurrentValue());
    setInvalidInput(false);
  });

  const updateValue = (newColor: Color | null) => {
    const opts = getOptions();

    if (opts.value === undefined) {
      setInternalValue(newColor);
    }

    opts.onChange?.(newColor);
    setInputValueInternal(formatCurrentValue(newColor));
    setInvalidInput(false);
  };

  const setInputValue = (text: string) => {
    setInputValueInternal(text);
    setInvalidInput(false);
  };

  const setColorValue = (newColor: Color | null) => {
    updateValue(newColor);
  };

  const commit = () => {
    const text = inputValue().trim();
    const opts = getOptions();
    const chan = channel();

    if (!text) {
      updateValue(null);
      return;
    }

    if (chan) {
      const displayColor = colorValue();
      const rawValue = parseChannelValue(text, displayColor, chan);
      if (rawValue == null) {
        setInputValueInternal(formatCurrentValue());
        setInvalidInput(false);
        return;
      }

      updateValue(displayColor.withChannelValue(chan, rawValue));
      return;
    }

    try {
      updateValue(parseHexValue(text, opts.colorFormat));
    } catch {
      setInputValueInternal(formatCurrentValue());
      setInvalidInput(false);
    }
  };

  const incrementHex = (amount: number) => {
    const currentColor = value();
    if (!currentColor) {
      return;
    }

    const newColor = hexIntToColor(currentColor.toFormat("rgb").toHexInt() + amount);
    updateValue(getOptions().colorFormat ? newColor.toFormat(getOptions().colorFormat!) : newColor);
  };

  const updateChannel = (amount: number | "min" | "max") => {
    const chan = channel();
    if (!chan) {
      return;
    }

    const displayColor = colorValue();
    const range = displayColor.getChannelRange(chan);
    const currentValue = displayColor.getChannelValue(chan);
    const nextValue =
      amount === "min"
        ? range.minValue
        : amount === "max"
          ? range.maxValue
          : Math.min(range.maxValue, Math.max(range.minValue, currentValue + amount));

    updateValue(displayColor.withChannelValue(chan, nextValue));
  };

  const increment = () => {
    const chan = channel();
    if (!chan) {
      incrementHex(1);
      return;
    }

    updateChannel(colorValue().getChannelRange(chan).step);
  };

  const decrement = () => {
    const chan = channel();
    if (!chan) {
      incrementHex(-1);
      return;
    }

    updateChannel(-colorValue().getChannelRange(chan).step);
  };

  const incrementToMax = () => {
    const chan = channel();
    if (!chan) {
      incrementHex(HEX_COLOR_MAX);
      return;
    }

    updateChannel("max");
  };

  const decrementToMin = () => {
    const chan = channel();
    if (!chan) {
      incrementHex(-HEX_COLOR_MAX);
      return;
    }

    updateChannel("min");
  };

  const validate = (candidate?: string) => {
    const text = (candidate ?? inputValue()).trim();
    const chan = channel();

    if (!text) {
      return true;
    }

    if (chan) {
      return parseChannelValue(text, colorValue(), chan) != null;
    }

    return PARTIAL_HEX_PATTERN.test(text);
  };

  return {
    get value() {
      return value();
    },
    get colorValue() {
      return colorValue();
    },
    get inputValue() {
      return inputValue();
    },
    get numberValue() {
      const chan = channel();
      if (!chan || value() === null) {
        return Number.NaN;
      }
      return colorValue().getChannelValue(chan) / getChannelMultiplier(colorValue(), chan);
    },
    get minValue() {
      const chan = channel();
      return chan ? getNormalizedRange(colorValue(), chan).minValue : 0;
    },
    get maxValue() {
      const chan = channel();
      return chan ? getNormalizedRange(colorValue(), chan).maxValue : HEX_COLOR_MAX;
    },
    get step() {
      const chan = channel();
      return chan ? getNormalizedRange(colorValue(), chan).step : 1;
    },
    get pageSize() {
      const chan = channel();
      return chan ? getNormalizedRange(colorValue(), chan).pageSize : 0x100000;
    },
    get formatOptions() {
      const chan = channel();
      return chan ? colorValue().getChannelFormatOptions(chan) : {};
    },
    get isInvalid() {
      return isInvalid();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isReadOnly() {
      return isReadOnly();
    },
    get isRequired() {
      return isRequired();
    },
    get channel() {
      return channel();
    },
    setInputValue,
    setColorValue,
    commit,
    increment,
    decrement,
    incrementToMax,
    decrementToMin,
    validate,
  };
}
