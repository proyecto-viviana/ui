/**
 * Color state management exports.
 */

export type {
  Color,
  ColorFormat,
  ColorSpace,
  ColorChannel,
  ColorChannelRange,
  ColorAxes,
} from "./types";

export {
  parseColor,
  normalizeColor,
  normalizeHue,
  createRGBColor,
  createHSLColor,
  createHSBColor,
} from "./Color";

export {
  createColorSliderState,
  type ColorSliderStateOptions,
  type ColorSliderState,
} from "./createColorSliderState";

export {
  createColorAreaState,
  type ColorAreaStateOptions,
  type ColorAreaState,
} from "./createColorAreaState";

export {
  createColorWheelState,
  type ColorWheelStateOptions,
  type ColorWheelState,
} from "./createColorWheelState";

export {
  createColorFieldState,
  type ColorFieldStateOptions,
  type ColorFieldState,
} from "./createColorFieldState";
