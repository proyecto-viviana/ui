/**
 * ColorArea state management.
 * Based on @react-stately/color useColorAreaState.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import type { Color, ColorChannel, ColorAxes, ColorSpace } from "./types";
import { normalizeColor } from "./Color";

export interface ColorAreaStateOptions {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** The color channel for the X axis. */
  xChannel?: ColorChannel;
  /** The color channel for the Y axis. */
  yChannel?: ColorChannel;
  /** The color space to use for the color area. */
  colorSpace?: ColorSpace;
  /** Whether the area is disabled. */
  isDisabled?: boolean;
}

export interface ColorAreaState {
  /** The current color value. */
  readonly value: Color;
  /** The X axis channel. */
  readonly xChannel: ColorChannel;
  /** The Y axis channel. */
  readonly yChannel: ColorChannel;
  /** The Z axis channel (the third channel). */
  readonly zChannel: ColorChannel;
  /** Whether the area is being dragged. */
  readonly isDragging: boolean;
  /** Whether the area is disabled. */
  readonly isDisabled: boolean;
  /** Step for X channel. */
  readonly xChannelStep: number;
  /** Step for Y channel. */
  readonly yChannelStep: number;
  /** Page step for X channel. */
  readonly xChannelPageStep: number;
  /** Page step for Y channel. */
  readonly yChannelPageStep: number;

  /** Get the X channel value. */
  getXValue(): number;
  /** Get the Y channel value. */
  getYValue(): number;
  /** Set the X channel value. */
  setXValue(value: number): void;
  /** Set the Y channel value. */
  setYValue(value: number): void;
  /** Set color from a point (0-1, 0-1). */
  setColorFromPoint(x: number, y: number): void;
  /** Get the thumb position as percentages. */
  getThumbPosition(): { x: number; y: number };
  /** Increment X value. */
  incrementX(stepSize?: number): void;
  /** Decrement X value. */
  decrementX(stepSize?: number): void;
  /** Increment Y value. */
  incrementY(stepSize?: number): void;
  /** Decrement Y value. */
  decrementY(stepSize?: number): void;
  /** Set the dragging state. */
  setDragging(isDragging: boolean): void;
  /** Get the display color (with alpha = 1). */
  getDisplayColor(): Color;
}

/**
 * Creates state for a color area (2D color picker).
 */
export function createColorAreaState(options: Accessor<ColorAreaStateOptions>): ColorAreaState {
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

  const isDisabled = createMemo(() => getOptions().isDisabled ?? false);

  // Get color axes
  const axes = createMemo<ColorAxes>(() => {
    const opts = getOptions();
    return value().getColorSpaceAxes({
      xChannel: opts.xChannel,
      yChannel: opts.yChannel,
    });
  });

  const xChannel = createMemo(() => axes().xChannel);
  const yChannel = createMemo(() => axes().yChannel);
  const zChannel = createMemo(() => axes().zChannel);

  // Get channel ranges
  const xRange = createMemo(() => value().getChannelRange(xChannel()));
  const yRange = createMemo(() => value().getChannelRange(yChannel()));

  const xChannelStep = createMemo(() => xRange().step);
  const yChannelStep = createMemo(() => yRange().step);
  const xChannelPageStep = createMemo(() => xRange().pageSize);
  const yChannelPageStep = createMemo(() => yRange().pageSize);

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

  // Get X value
  const getXValue = () => value().getChannelValue(xChannel());

  // Get Y value
  const getYValue = () => value().getChannelValue(yChannel());

  // Set X value
  const setXValue = (newValue: number) => {
    const range = xRange();
    const clamped = Math.max(range.minValue, Math.min(range.maxValue, newValue));
    const rounded = Math.round(clamped / range.step) * range.step;
    const newColor = value().withChannelValue(xChannel(), rounded);
    updateValue(newColor);
  };

  // Set Y value
  const setYValue = (newValue: number) => {
    const range = yRange();
    const clamped = Math.max(range.minValue, Math.min(range.maxValue, newValue));
    const rounded = Math.round(clamped / range.step) * range.step;
    const newColor = value().withChannelValue(yChannel(), rounded);
    updateValue(newColor);
  };

  // Set color from point (x: 0-1, y: 0-1)
  const setColorFromPoint = (x: number, y: number) => {
    const xR = xRange();
    const yR = yRange();

    const xVal = xR.minValue + (xR.maxValue - xR.minValue) * x;
    const yVal = yR.minValue + (yR.maxValue - yR.minValue) * (1 - y); // Y is inverted

    const xClamped = Math.max(xR.minValue, Math.min(xR.maxValue, xVal));
    const yClamped = Math.max(yR.minValue, Math.min(yR.maxValue, yVal));

    const xRounded = Math.round(xClamped / xR.step) * xR.step;
    const yRounded = Math.round(yClamped / yR.step) * yR.step;

    const newColor = value()
      .withChannelValue(xChannel(), xRounded)
      .withChannelValue(yChannel(), yRounded);
    updateValue(newColor);
  };

  // Get thumb position as percentages
  const getThumbPosition = () => {
    const xR = xRange();
    const yR = yRange();
    const xVal = getXValue();
    const yVal = getYValue();

    return {
      x: (xVal - xR.minValue) / (xR.maxValue - xR.minValue),
      y: 1 - (yVal - yR.minValue) / (yR.maxValue - yR.minValue), // Y is inverted
    };
  };

  // Increment X
  const incrementX = (stepSize?: number) => {
    const s = stepSize ?? xChannelStep();
    setXValue(getXValue() + s);
  };

  // Decrement X
  const decrementX = (stepSize?: number) => {
    const s = stepSize ?? xChannelStep();
    setXValue(getXValue() - s);
  };

  // Increment Y
  const incrementY = (stepSize?: number) => {
    const s = stepSize ?? yChannelStep();
    setYValue(getYValue() + s);
  };

  // Decrement Y
  const decrementY = (stepSize?: number) => {
    const s = stepSize ?? yChannelStep();
    setYValue(getYValue() - s);
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
    return value().withChannelValue("alpha", 1);
  };

  return {
    get value() {
      return value();
    },
    get xChannel() {
      return xChannel();
    },
    get yChannel() {
      return yChannel();
    },
    get zChannel() {
      return zChannel();
    },
    get isDragging() {
      return isDragging();
    },
    get isDisabled() {
      return isDisabled();
    },
    get xChannelStep() {
      return xChannelStep();
    },
    get yChannelStep() {
      return yChannelStep();
    },
    get xChannelPageStep() {
      return xChannelPageStep();
    },
    get yChannelPageStep() {
      return yChannelPageStep();
    },
    getXValue,
    getYValue,
    setXValue,
    setYValue,
    setColorFromPoint,
    getThumbPosition,
    incrementX,
    decrementX,
    incrementY,
    decrementY,
    setDragging: setDraggingState,
    getDisplayColor,
  };
}
