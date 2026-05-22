/**
 * Color ARIA types.
 */

import type { JSX } from "solid-js";
import type { ColorChannel, Color, ColorSpace } from "@proyecto-viviana/solid-stately";

export interface AriaColorSliderOptions {
  /** The channel this slider controls. */
  channel: ColorChannel;
  /** Accessible label for the slider. */
  "aria-label"?: string;
  /** ID of element that labels the slider. */
  "aria-labelledby"?: string;
  /** ID of element that describes the slider. */
  "aria-describedby"?: string;
  /** Whether the slider is disabled. */
  isDisabled?: boolean;
  /** Localized channel name. */
  channelName?: string;
}

export interface ColorSliderAria {
  /** Props for the slider track element. */
  trackProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the thumb/handle element. */
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the hidden input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the output element showing the value. */
  outputProps: JSX.HTMLAttributes<HTMLOutputElement>;
  /** Props for the label element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
}

export interface AriaColorAreaOptions {
  /** Element id for the color area. */
  id?: string;
  /** The X channel. */
  xChannel?: ColorChannel;
  /** The Y channel. */
  yChannel?: ColorChannel;
  /** Accessible label for the area. */
  "aria-label"?: string;
  /** ID of element that labels the area. */
  "aria-labelledby"?: string;
  /** ID of element that describes the area. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the area. */
  "aria-details"?: string;
  /** Color space to use for channel axes. */
  colorSpace?: ColorSpace;
  /** Name for the hidden X-axis range input. */
  xName?: string;
  /** Name for the hidden Y-axis range input. */
  yName?: string;
  /** Associated form owner for the hidden range inputs. */
  form?: string;
  /** Whether the area is disabled. */
  isDisabled?: boolean;
}

export interface ColorAreaAria {
  /** Props for the color area container. */
  colorAreaProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the gradient element. */
  gradientProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the thumb element. */
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the hidden X input element. */
  xInputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the hidden Y input element. */
  yInputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

export interface AriaColorWheelOptions {
  /** Accessible label for the wheel. */
  "aria-label"?: string;
  /** ID of element that labels the wheel. */
  "aria-labelledby"?: string;
  /** ID of element that describes the wheel. */
  "aria-describedby"?: string;
  /** Whether the wheel is disabled. */
  isDisabled?: boolean;
}

export interface ColorWheelAria {
  /** Props for the wheel track element. */
  trackProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the thumb element. */
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the hidden input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

export interface AriaColorFieldOptions {
  /** Accessible label for the field. */
  "aria-label"?: string;
  /** ID of element that labels the field. */
  "aria-labelledby"?: string;
  /** ID of element that describes the field. */
  "aria-describedby"?: string;
  /** Whether the field is disabled. */
  isDisabled?: boolean;
  /** Whether the field is read-only. */
  isReadOnly?: boolean;
  /** The color channel being edited (for single channel mode). */
  channel?: ColorChannel;
}

export interface ColorFieldAria {
  /** Props for the label element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

export interface AriaColorSwatchOptions {
  /** The color to display. */
  color: Color | string;
  /** Accessible label for the swatch. */
  "aria-label"?: string;
}

export interface ColorSwatchAria {
  /** Props for the swatch element. */
  swatchProps: JSX.HTMLAttributes<HTMLDivElement>;
}
