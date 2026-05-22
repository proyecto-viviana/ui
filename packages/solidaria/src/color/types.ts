/**
 * Color ARIA types.
 */

import type { JSX } from "solid-js";
import type { ColorChannel, Color, ColorSpace } from "@proyecto-viviana/solid-stately";

export interface AriaColorSliderOptions {
  /** Element id for the slider track group. */
  id?: string;
  /** The channel this slider controls. */
  channel: ColorChannel;
  /** Visible label content, used to connect custom labels with the slider. */
  label?: JSX.Element;
  /** Accessible label for the slider. */
  "aria-label"?: string;
  /** ID of element that labels the slider. */
  "aria-labelledby"?: string;
  /** ID of element that describes the slider. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the slider. */
  "aria-details"?: string;
  /** Name for the hidden range input. */
  name?: string;
  /** Associated form owner for the hidden range input. */
  form?: string;
  /** The slider orientation. */
  orientation?: "horizontal" | "vertical";
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
  /** Element id for the hidden hue range input. */
  id?: string;
  /** Accessible label for the wheel. */
  "aria-label"?: string;
  /** ID of element that labels the wheel. */
  "aria-labelledby"?: string;
  /** ID of element that describes the wheel. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the wheel. */
  "aria-details"?: string;
  /** ID of element that provides the error message. */
  "aria-errormessage"?: string;
  /** Name for the hidden hue range input. */
  name?: string;
  /** Associated form owner for the hidden hue range input. */
  form?: string;
  /** Outer radius of the circular track in pixels. */
  outerRadius?: number;
  /** Inner radius of the circular track in pixels. */
  innerRadius?: number;
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
  /** Element id for the input. */
  id?: string;
  /** Accessible label for the field. */
  "aria-label"?: string;
  /** ID of element that labels the field. */
  "aria-labelledby"?: string;
  /** ID of element that describes the field. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the field. */
  "aria-details"?: string;
  /** ID of element that provides the error message. */
  "aria-errormessage"?: string;
  /** Form field name. */
  name?: string;
  /** Associated form owner. */
  form?: string;
  /** Whether browser wheel events should be ignored. */
  isWheelDisabled?: boolean;
  /** Whether the field is disabled. */
  isDisabled?: boolean;
  /** Whether the field is read-only. */
  isReadOnly?: boolean;
  /** Whether the field is required. */
  isRequired?: boolean;
  /** Whether the field is invalid. */
  isInvalid?: boolean;
  /** Whether to use native or ARIA validation semantics. */
  validationBehavior?: "aria" | "native";
  /** Whether the input should receive focus on mount. */
  autoFocus?: boolean;
  /** Whether the input should be excluded from tab order. */
  excludeFromTabOrder?: boolean;
  /** Placeholder text. */
  placeholder?: string;
  /** The color channel being edited (for single channel mode). */
  channel?: ColorChannel;
  /** Color space used for channel mode. */
  colorSpace?: ColorSpace;
}

export interface ColorFieldAria {
  /** Props for the label element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the description element. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
}

export interface AriaColorSwatchOptions {
  /** Element id for the swatch. */
  id?: string;
  /** A named slot for the swatch element. */
  slot?: string;
  /** The color to display. */
  color?: Color | string;
  /** Localized color name override. */
  colorName?: string;
  /** Accessible label for the swatch. */
  "aria-label"?: string;
  /** ID of element that labels the swatch. */
  "aria-labelledby"?: string;
  /** ID of element that describes the swatch. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the swatch. */
  "aria-details"?: string;
}

export interface ColorSwatchAria {
  /** Props for the swatch element. */
  swatchProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** The normalized color displayed by the swatch. */
  color: Color;
}
