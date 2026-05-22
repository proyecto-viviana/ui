/**
 * ColorWheel state management.
 * Based on @react-stately/color useColorWheelState.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type { Color } from "./types";
import { createHSLColor, normalizeColor } from "./Color";

export interface ColorWheelStateOptions {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** Whether the wheel is disabled. */
  isDisabled?: boolean;
}

export interface ColorWheelState {
  /** The current color value. */
  readonly value: Color;
  /** The initial color value. */
  readonly defaultValue: Color;
  /** Whether the wheel is being dragged. */
  readonly isDragging: boolean;
  /** Whether the wheel is disabled. */
  readonly isDisabled: boolean;
  /** Step value for hue changes. */
  readonly step: number;
  /** Page step value for hue changes. */
  readonly pageStep: number;

  /** Get the current hue value (0-360). */
  getHue(): number;
  /** Set the full color value. */
  setValue(value: Color | string): void;
  /** Set the hue value. */
  setHue(value: number): void;
  /** Set hue from an angle in radians. */
  setHueFromAngle(angle: number): void;
  /** Set hue from a point relative to the wheel center. */
  setHueFromPoint(x: number, y: number, radius: number): void;
  /** Get the thumb angle in radians (0 = right, increases counterclockwise). */
  getThumbAngle(): number;
  /** Get the thumb position relative to the wheel center. */
  getThumbPosition(radius: number): { x: number; y: number };
  /** Increment hue value. */
  increment(stepSize?: number): void;
  /** Decrement hue value. */
  decrement(stepSize?: number): void;
  /** Set the dragging state. */
  setDragging(isDragging: boolean): void;
  /** Get the display color (with full saturation/brightness for wheel). */
  getDisplayColor(): Color;
}

/**
 * Creates state for a color wheel (circular hue picker).
 */
export function createColorWheelState(options: Accessor<ColorWheelStateOptions>): ColorWheelState {
  const getOptions = () => options();
  const defaultColor = createHSLColor(0, 100, 50);

  const normalizeWheelValue = (color: Color | string) => {
    const value = normalizeColor(color);
    return value.toFormat(value.getColorSpace() === "hsb" ? "hsb" : "hsl");
  };

  const initialValue = normalizeWheelValue(getOptions().defaultValue ?? defaultColor);
  const [internalValue, setInternalValue] = createSignal<Color>(initialValue);
  const [isDragging, setIsDragging] = createSignal(false);
  let valueRef = initialValue;

  // Controlled vs uncontrolled value
  const value = createMemo(() => {
    const opts = getOptions();
    const nextValue = opts.value !== undefined ? normalizeWheelValue(opts.value) : internalValue();
    valueRef = nextValue;
    return nextValue;
  });

  const isDisabled = createMemo(() => getOptions().isDisabled ?? false);

  // Hue step and page step
  const hueRange = createMemo(() => value().getChannelRange("hue"));
  const step = createMemo(() => hueRange().step);
  const pageStep = createMemo(() => hueRange().pageSize);

  // Update value
  const updateValue = (newColor: Color) => {
    const opts = getOptions();
    const nextColor = normalizeWheelValue(newColor);
    valueRef = nextColor;

    // Controlled mode
    if (opts.value !== undefined) {
      opts.onChange?.(nextColor);
      return;
    }

    // Uncontrolled mode
    setInternalValue(nextColor);
    opts.onChange?.(nextColor);
  };

  // Get hue value (0-360)
  const getHue = () => value().getChannelValue("hue");

  const setValue = (newValue: Color | string) => {
    updateValue(normalizeWheelValue(newValue));
  };

  const roundToStep = (num: number, stepValue: number) => {
    const rounded = Math.round(num / stepValue) * stepValue;
    const precision = `${stepValue}`.split(".")[1]?.length ?? 0;
    return Number(rounded.toFixed(precision));
  };

  const roundDown = (num: number) => {
    const rounded = Math.floor(num);
    return rounded === num ? num - 1 : rounded;
  };

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const radToDeg = (rad: number) => (rad * 180) / Math.PI;
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  const cartesianToAngle = (x: number, y: number, radius: number) => {
    const clampedX = Math.max(-radius, Math.min(radius, x));
    const clampedY = Math.max(-radius, Math.min(radius, y));
    return mod(radToDeg(Math.atan2(clampedY, clampedX)), 360);
  };

  const angleToCartesian = (angle: number, radius: number) => ({
    x: radius * Math.cos(degToRad(angle)),
    y: radius * Math.sin(degToRad(angle)),
  });

  // Set hue value
  const setHue = (newValue: number) => {
    const currentHue = getHue();
    const range = hueRange();
    const hue = newValue > range.maxValue ? range.minValue : newValue;
    const rounded = roundToStep(mod(hue, range.maxValue), range.step);
    if (rounded === currentHue) return;

    const newColor = value().withChannelValue("hue", rounded);
    updateValue(newColor);
  };

  // Set hue from angle (radians, 0 = right, counterclockwise)
  const setHueFromAngle = (angle: number) => {
    setHue(mod(360 - radToDeg(angle), 360));
  };

  const setHueFromPoint = (x: number, y: number, radius: number) => {
    setHue(cartesianToAngle(x, y, radius));
  };

  // Get thumb angle in radians
  const getThumbAngle = () => {
    return degToRad(360 - getHue());
  };

  const getThumbPosition = (radius: number) => {
    return angleToCartesian(getHue(), radius);
  };

  // Increment hue
  const increment = (stepSize?: number) => {
    const range = hueRange();
    const s = Math.max(stepSize ?? range.step, range.step);
    const nextValue = getHue() + s;
    if (nextValue >= range.maxValue) {
      setHue(range.minValue);
      return;
    }
    setHue(roundToStep(mod(nextValue, range.maxValue), s));
  };

  // Decrement hue
  const decrement = (stepSize?: number) => {
    const range = hueRange();
    const s = Math.max(stepSize ?? range.step, range.step);
    if (getHue() === range.minValue) {
      setHue(roundDown(range.maxValue / s) * s);
      return;
    }
    setHue(roundToStep(mod(getHue() - s, range.maxValue), s));
  };

  // Set dragging state
  const setDraggingState = (dragging: boolean) => {
    const wasDragging = isDragging();
    setIsDragging(dragging);

    // Call onChangeEnd when dragging ends
    if (wasDragging && !dragging) {
      getOptions().onChangeEnd?.(valueRef);
    }
  };

  // Get display color (full saturation and brightness for wheel preview)
  const getDisplayColor = () => {
    return value()
      .toFormat("hsl")
      .withChannelValue("saturation", 100)
      .withChannelValue("lightness", 50)
      .withChannelValue("alpha", 1);
  };

  return {
    get value() {
      return value();
    },
    get defaultValue() {
      return initialValue;
    },
    get isDragging() {
      return isDragging();
    },
    get isDisabled() {
      return isDisabled();
    },
    get step() {
      return step();
    },
    get pageStep() {
      return pageStep();
    },
    getHue,
    setValue,
    setHue,
    setHueFromAngle,
    setHueFromPoint,
    getThumbAngle,
    getThumbPosition,
    increment,
    decrement,
    setDragging: setDraggingState,
    getDisplayColor,
  };
}
