/**
 * Color types for color picker components.
 * Ported from packages/react-stately/src/color/types.ts.
 */

/**
 * Supported color formats.
 */
export type ColorFormat = "hex" | "hexa" | "rgb" | "rgba" | "hsl" | "hsla" | "hsb" | "hsba";

/**
 * Color spaces.
 */
export type ColorSpace = "rgb" | "hsl" | "hsb";

/**
 * Color channels.
 */
export type ColorChannel =
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "red"
  | "green"
  | "blue"
  | "alpha";

/**
 * Range for a color channel.
 */
export interface ColorChannelRange {
  /** Minimum value. */
  minValue: number;
  /** Maximum value. */
  maxValue: number;
  /** Step for keyboard increment. */
  step: number;
  /** Page step for larger increments. */
  pageSize: number;
}

/**
 * Color axes for a color space.
 */
export interface ColorAxes {
  /** X-axis channel. */
  xChannel: ColorChannel;
  /** Y-axis channel. */
  yChannel: ColorChannel;
  /** Z-axis channel (the one not on x or y). */
  zChannel: ColorChannel;
}

/**
 * Color interface representing a color value.
 */
export interface Color {
  /** Convert to a different format. */
  toFormat(format: ColorFormat): Color;
  /** Convert to a CSS string. */
  toString(format?: ColorFormat | "css"): string;
  /** Clone this color. */
  clone(): Color;
  /** Get the hex value as an integer. */
  toHexInt(): number;
  /** Get the value of a specific channel. */
  getChannelValue(channel: ColorChannel): number;
  /** Create a new color with a channel value changed. */
  withChannelValue(channel: ColorChannel, value: number): Color;
  /** Get the range for a channel. */
  getChannelRange(channel: ColorChannel): ColorChannelRange;
  /** Get the localized name of a channel. */
  getChannelName(channel: ColorChannel, locale: string): string;
  /** Get the format options for a channel. */
  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
  /** Format the value of a channel. */
  formatChannelValue(channel: ColorChannel, locale: string): string;
  /** Get the color space. */
  getColorSpace(): ColorSpace;
  /** Get the axes for a color space. */
  getColorSpaceAxes(xyChannels?: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes;
  /** Get all channels for this color space. */
  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel];
  /** Get a human-readable color name. */
  getColorName(locale: string): string;
  /** Get the hue name (e.g., "red", "blue"). */
  getHueName(locale: string): string;
}

/**
 * RGB color value.
 */
export interface RGBColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/**
 * HSL color value.
 */
export interface HSLColor {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

/**
 * HSB color value.
 */
export interface HSBColor {
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
}
