/**
 * Creates state for a slider component.
 * Based on @react-stately/slider useSliderState.
 */

import { type Accessor, createSignal, createMemo } from "solid-js";
import { access, type MaybeAccessor } from "../utils";

export type SliderOrientation = "horizontal" | "vertical";

export interface SliderStateProps {
  /** The current value (controlled). */
  value?: number;
  /** The default value (uncontrolled). */
  defaultValue?: number;
  /** Handler called when the value changes. */
  onChange?: (value: number) => void;
  /** Handler called when the user stops dragging. */
  onChangeEnd?: (value: number) => void;
  /** The minimum value. */
  minValue?: number;
  /** The maximum value. */
  maxValue?: number;
  /** The step value. */
  step?: number;
  /** The orientation of the slider. */
  orientation?: SliderOrientation;
  /** Whether the slider is disabled. */
  isDisabled?: boolean;
  /** The locale for number formatting. */
  locale?: string;
  /** Number format options. */
  formatOptions?: Intl.NumberFormatOptions;
}

export interface SliderState {
  /** The current value. */
  value: Accessor<number>;
  /** Sets the value. */
  setValue: (value: number) => void;
  /** Sets the value by percent (0-1). */
  setValuePercent: (percent: number) => void;
  /** Gets the value as a percent (0-1). */
  getValuePercent: Accessor<number>;
  /** Gets the formatted value string. */
  getFormattedValue: Accessor<string>;
  /** Whether the thumb is being dragged. */
  isDragging: Accessor<boolean>;
  /** Sets the dragging state. */
  setDragging: (dragging: boolean) => void;
  /** Whether the slider is focused. */
  isFocused: Accessor<boolean>;
  /** Sets the focused state. */
  setFocused: (focused: boolean) => void;
  /** Increments the value by step. */
  increment: (stepMultiplier?: number) => void;
  /** Decrements the value by step. */
  decrement: (stepMultiplier?: number) => void;
  /** The minimum value. */
  minValue: number;
  /** The maximum value. */
  maxValue: number;
  /** The step value. */
  step: number;
  /** The page step (larger step for Page Up/Down). */
  pageStep: number;
  /** The orientation. */
  orientation: SliderOrientation;
  /** Whether the slider is disabled. */
  isDisabled: boolean;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

/**
 * Clamps a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Snaps a value to the nearest step.
 */
function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  // Handle floating point precision issues
  const decimalPlaces = (step.toString().split(".")[1] || "").length;
  const rounded = parseFloat(snapped.toFixed(decimalPlaces));
  return clamp(rounded, min, max);
}

/**
 * Provides state management for a slider component.
 */
export function createSliderState(props: MaybeAccessor<SliderStateProps>): SliderState {
  const getProps = () => access(props);

  const initialProps = getProps();
  const initialMinValue = initialProps.minValue ?? DEFAULT_MIN;
  const initialMaxValue = initialProps.maxValue ?? DEFAULT_MAX;
  const initialStep = initialProps.step ?? DEFAULT_STEP;

  const minValue = createMemo(() => getProps().minValue ?? DEFAULT_MIN);
  const maxValue = createMemo(() => getProps().maxValue ?? DEFAULT_MAX);
  const step = createMemo(() => getProps().step ?? DEFAULT_STEP);
  const orientation = createMemo(() => getProps().orientation ?? "horizontal");
  const isDisabled = createMemo(() => getProps().isDisabled ?? false);
  const pageStep = createMemo(() =>
    Math.max(
      step(),
      snapToStep((maxValue() - minValue()) / 10, 0, maxValue() - minValue(), step()),
    ),
  );

  // Controlled vs uncontrolled
  const isControlled = () => getProps().value !== undefined;

  // Internal signal for uncontrolled mode
  const [internalValue, setInternalValue] = createSignal(
    snapToStep(
      initialProps.defaultValue ?? initialMinValue,
      initialMinValue,
      initialMaxValue,
      initialStep,
    ),
  );

  // Dragging and focus state
  const [isDragging, setIsDragging] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);

  // Current value accessor
  const value = createMemo(() => {
    const p = getProps();
    const rawValue = isControlled() ? (p.value ?? minValue()) : internalValue();
    return snapToStep(rawValue, minValue(), maxValue(), step());
  });

  // Value as percent (0-1)
  const getValuePercent = createMemo(() => {
    return (value() - minValue()) / (maxValue() - minValue());
  });

  // Formatted value
  const getFormattedValue = createMemo(() => {
    const p = getProps();
    const formatter = new Intl.NumberFormat(p.locale, p.formatOptions);
    return formatter.format(value());
  });

  // Set value function
  const setValue = (newValue: number) => {
    if (isDisabled()) return;

    const p = getProps();
    const snappedValue = snapToStep(newValue, minValue(), maxValue(), step());

    if (!isControlled()) {
      setInternalValue(snappedValue);
    }

    p.onChange?.(snappedValue);
  };

  // Set value by percent
  const setValuePercent = (percent: number) => {
    const clampedPercent = clamp(percent, 0, 1);
    const newValue = clampedPercent * (maxValue() - minValue()) + minValue();
    setValue(newValue);
  };

  // Dragging state management
  const setDragging = (dragging: boolean) => {
    const wasDragging = isDragging();
    setIsDragging(dragging);

    // Call onChangeEnd when dragging stops
    if (wasDragging && !dragging) {
      getProps().onChangeEnd?.(value());
    }
  };

  // Increment/decrement
  const increment = (stepMultiplier = 1) => {
    if (isDisabled()) return;
    setValue(value() + step() * stepMultiplier);
  };

  const decrement = (stepMultiplier = 1) => {
    if (isDisabled()) return;
    setValue(value() - step() * stepMultiplier);
  };

  // Set focused state
  const setFocused = (focused: boolean) => {
    setIsFocused(focused);
  };

  return {
    value,
    setValue,
    setValuePercent,
    getValuePercent,
    getFormattedValue,
    isDragging,
    setDragging,
    isFocused,
    setFocused,
    increment,
    decrement,
    get minValue() {
      return minValue();
    },
    get maxValue() {
      return maxValue();
    },
    get step() {
      return step();
    },
    get pageStep() {
      return pageStep();
    },
    get orientation() {
      return orientation();
    },
    get isDisabled() {
      return isDisabled();
    },
  };
}
