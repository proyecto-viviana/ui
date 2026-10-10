/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/slider/useSliderState.ts

/**
 * Creates state for a slider component.
 * Based on @react-stately/slider useSliderState.
 */

import { createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";
import { createInternalSignal, access, type MaybeAccessor } from "../utils";

export type SliderOrientation = "horizontal" | "vertical";

export interface SliderStateProps<T extends number | number[] = number> {
  /** The current value (controlled). */
  value?: T;
  /** The default value (uncontrolled). */
  defaultValue?: T;
  /** Handler called when the value changes. */
  onChange?: (value: T) => void;
  /** Handler called when the user stops dragging. */
  onChangeEnd?: (value: T) => void;
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
  getFormattedValue: {
    (): string;
    (value: number | readonly number[]): string;
  };
  /** Canonical values; legacy numeric members address thumb zero. */
  values: Accessor<readonly number[]>;
  /** Current reset defaults, normalized to the domain. */
  defaultValues: Accessor<readonly number[]>;
  getThumbValue: (index: number) => number;
  setThumbValue: (index: number, value: number) => void;
  setThumbPercent: (index: number, percent: number) => void;
  getThumbPercent: (index: number) => number;
  getThumbMinValue: (index: number) => number;
  getThumbMaxValue: (index: number) => number;
  getThumbValueLabel: (index: number) => string;
  isThumbDragging: (index: number) => boolean;
  setThumbDragging: (index: number, dragging: boolean) => void;
  focusedThumb: Accessor<number | undefined>;
  setFocusedThumb: (index: number | undefined) => void;
  /** Absolute value distance, at least state.step. */
  incrementThumb: (index: number, stepSize?: number) => void;
  decrementThumb: (index: number, stepSize?: number) => void;
  /** Whether any thumb is being dragged. */
  isDragging: Accessor<boolean>;
  /** Sets thumb zero dragging state. */
  setDragging: (dragging: boolean) => void;
  /** Whether the slider is focused. */
  isFocused: Accessor<boolean>;
  /** Focuses thumb zero; false clears only thumb zero. */
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
export function createSliderState(
  props: MaybeAccessor<
    SliderStateProps<number[]> & ({ value: number[] } | { defaultValue: number[] })
  >,
): SliderState;
export function createSliderState(props: MaybeAccessor<SliderStateProps>): SliderState;
export function createSliderState(
  props: MaybeAccessor<SliderStateProps | SliderStateProps<number[]>>,
): SliderState {
  const getProps = () => access(props);
  const initialProps = getProps();
  // Mode is established by explicit input shape, never by callback arity.
  const arrayMode = Array.isArray(initialProps.value) || Array.isArray(initialProps.defaultValue);
  const initialArray = Array.isArray(initialProps.value)
    ? initialProps.value
    : initialProps.defaultValue;
  const initialCount = Array.isArray(initialArray) ? initialArray.length : 1;
  const finite = (value: number | undefined, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  const minValue = createMemo(() =>
    arrayMode ? finite(getProps().minValue, DEFAULT_MIN) : (getProps().minValue ?? DEFAULT_MIN),
  );
  const step = createMemo(() => {
    const next = arrayMode
      ? finite(getProps().step, DEFAULT_STEP)
      : (getProps().step ?? DEFAULT_STEP);
    return arrayMode && next <= 0 ? DEFAULT_STEP : next;
  });
  const maxValue = createMemo(() => {
    const next = arrayMode
      ? finite(getProps().maxValue, DEFAULT_MAX)
      : (getProps().maxValue ?? DEFAULT_MAX);
    return arrayMode && next <= minValue() ? minValue() + step() : next;
  });
  const orientation = createMemo(() => getProps().orientation ?? "horizontal");
  const isDisabled = createMemo(() => getProps().isDisabled ?? false);
  const pageStep = createMemo(() =>
    Math.max(
      step(),
      snapToStep((maxValue() - minValue()) / 10, 0, maxValue() - minValue(), step()),
    ),
  );
  const isControlled = () => getProps().value !== undefined;
  const fallbackValues = () =>
    Array.from({ length: initialCount }, (_, index) => (index === 0 ? minValue() : maxValue()));
  const normalize = (raw: number | readonly number[] | undefined): number[] => {
    const items = raw === undefined ? fallbackValues() : typeof raw === "number" ? [raw] : raw;
    const snapped = items.map((item, index) =>
      snapToStep(
        arrayMode ? finite(item, index === 0 ? minValue() : maxValue()) : item,
        minValue(),
        maxValue(),
        step(),
      ),
    );
    return arrayMode ? snapped.sort((a, b) => a - b) : snapped;
  };
  const [internalValues, setInternalValues] = createInternalSignal(
    normalize(initialProps.defaultValue),
  );
  const values: Accessor<readonly number[]> = () =>
    normalize(isControlled() ? getProps().value : internalValues());
  const initialValues = [...values()];
  const initialDefaultValues = normalize(initialProps.defaultValue ?? initialValues);
  const defaultValues: Accessor<readonly number[]> = () =>
    // Scalar defaults are captured at mount; RangeSlider resets to current domain defaults.
    normalize(arrayMode ? getProps().defaultValue : initialDefaultValues);
  if (arrayMode) {
    // Preserve RangeSlider's reactive uncontrolled default/domain reset policy.
    // The compute phase reads only props/bounds, never the mutable current values.
    const resetSnapshot = () =>
      isControlled()
        ? undefined
        : {
            defaults: normalize(getProps().defaultValue),
            min: minValue(),
            max: maxValue(),
            step: step(),
          };
    // Seed before effects drain: an initial equal default must not erase setters
    // called during setup. Only a changed default/domain/control mode resets.
    let previousReset = resetSnapshot();
    createEffect(resetSnapshot, (next) => {
      const previous = previousReset;
      previousReset = next;
      if (
        next &&
        (!previous ||
          next.min !== previous.min ||
          next.max !== previous.max ||
          next.step !== previous.step ||
          next.defaults.length !== previous.defaults.length ||
          next.defaults.some((value, index) => value !== previous.defaults[index]))
      ) {
        setInternalValues(next.defaults);
      }
    });
  }
  const [draggings, setDraggings] = createInternalSignal<boolean[]>(initialValues.map(() => false));
  const [focusedThumb, setFocusedThumbValue] = createInternalSignal<number | undefined>(undefined);
  const isDragging = () => draggings().some(Boolean);
  let pendingValues = [...initialValues];
  let hasPendingUpdate = false;
  // Upstream retains each setter proposal outside drag too. Rebase when rendered values change.
  let nonDraggingRenderedSnapshot: readonly number[] | undefined;
  const validIndex = (index: number) =>
    Number.isInteger(index) && index >= 0 && index < values().length;
  const getThumbValue = (index: number) => values()[index];
  const getThumbMinValue = (index: number) => (index === 0 ? minValue() : values()[index - 1]);
  const getThumbMaxValue = (index: number) =>
    index === values().length - 1 ? maxValue() : values()[index + 1];
  const emit = (kind: "onChange" | "onChangeEnd", next: readonly number[]) => {
    const p = getProps();
    // The public overloads guarantee this callback shape for the established mode.
    if (arrayMode) (p as SliderStateProps<number[]>)[kind]?.([...next]);
    else (p as SliderStateProps)[kind]?.(next[0]);
  };
  const setThumbValue = (index: number, nextValue: number) => {
    if (isDisabled() || !validIndex(index)) return;
    const rendered = values();
    const retainNonDraggingProposal =
      arrayMode &&
      isControlled() &&
      nonDraggingRenderedSnapshot !== undefined &&
      rendered.length === nonDraggingRenderedSnapshot.length &&
      rendered.every((item, i) => item === nonDraggingRenderedSnapshot![i]);
    const base = normalize(isDragging() || retainNonDraggingProposal ? pendingValues : rendered);
    const lower = index === 0 ? minValue() : base[index - 1];
    const upper = index === base.length - 1 ? maxValue() : base[index + 1];
    // Current RangeSlider anchors snapping to the whole domain, then clamps to neighbors.
    const snapped = clamp(snapToStep(nextValue, minValue(), maxValue(), step()), lower, upper);
    const next = [...base];
    next[index] = snapped;
    pendingValues = next;
    hasPendingUpdate = true;
    nonDraggingRenderedSnapshot =
      !isDragging() && arrayMode && isControlled() ? [...rendered] : undefined;
    const changed = next.some((item, i) => item !== rendered[i]);
    if (!isControlled() && (!arrayMode || changed)) setInternalValues(next);
    // Scalar's duplicate callbacks and RangeSlider's equal-pair suppression are intentional.
    if (!arrayMode || changed) emit("onChange", next);
  };
  const setThumbPercent = (index: number, percent: number) =>
    setThumbValue(index, clamp(percent, 0, 1) * (maxValue() - minValue()) + minValue());
  const getThumbPercent = (index: number) =>
    (getThumbValue(index) - minValue()) / (maxValue() - minValue());
  const isThumbDragging = (index: number) => draggings()[index] ?? false;
  const setThumbDragging = (index: number, dragging: boolean) => {
    if (dragging && (!validIndex(index) || (arrayMode && isDisabled()))) return;
    const wasDragging = isThumbDragging(index);
    if (wasDragging === dragging) return;
    // One snapshot per drag session: a second handle cannot discard unechoed updates.
    if (dragging && !isDragging()) {
      pendingValues = [...values()];
      hasPendingUpdate = false;
      nonDraggingRenderedSnapshot = undefined;
    }
    const next = [...draggings()];
    next[index] = dragging;
    setDraggings(next);
    // Allow disabled endings to release ownership; completion occurs only at the final end.
    if (wasDragging && !isDragging()) {
      emit("onChangeEnd", normalize(hasPendingUpdate ? pendingValues : values()));
    }
  };
  const setFocusedThumb = (index: number | undefined) => {
    if (index === undefined || validIndex(index)) setFocusedThumbValue(index);
  };
  const incrementThumb = (index: number, stepSize = 1) =>
    setThumbValue(index, getThumbValue(index) + Math.max(stepSize, step()));
  const decrementThumb = (index: number, stepSize = 1) =>
    setThumbValue(index, getThumbValue(index) - Math.max(stepSize, step()));
  const formatter = createMemo(
    () => new Intl.NumberFormat(getProps().locale, getProps().formatOptions),
  );
  function getFormattedValue(): string;
  function getFormattedValue(value: number | readonly number[]): string;
  function getFormattedValue(value: number | readonly number[] = values()): string {
    const items = typeof value === "number" ? [value] : value;
    if (items.length === 0) return "";
    if (items.length === 1) return formatter().format(items[0]);
    if (items.length === 2) return formatter().formatRange(items[0], items[1]);
    return new Intl.ListFormat(formatter().resolvedOptions().locale, { type: "unit" }).format(
      items.map((item) => formatter().format(item)),
    );
  }
  const value = () => getThumbValue(0) ?? minValue();
  const setValue = (next: number) => setThumbValue(0, next);
  return {
    values,
    defaultValues,
    getThumbValue,
    setThumbValue,
    setThumbPercent,
    getThumbPercent,
    getThumbMinValue,
    getThumbMaxValue,
    getThumbValueLabel: (index) => getFormattedValue(getThumbValue(index)),
    isThumbDragging,
    setThumbDragging,
    focusedThumb,
    setFocusedThumb,
    incrementThumb,
    decrementThumb,
    value,
    setValue,
    setValuePercent: (percent) => setThumbPercent(0, percent),
    getValuePercent: () => getThumbPercent(0),
    getFormattedValue,
    isDragging,
    setDragging: (dragging) => setThumbDragging(0, dragging),
    isFocused: () => focusedThumb() !== undefined,
    setFocused: (focused) => {
      if (focused) setFocusedThumb(0);
      else if (focusedThumb() === 0) setFocusedThumb(undefined);
    },
    // Preserve even zero/negative scalar multiplier semantics, rather than using indexed delta.
    increment: (multiplier = 1) => setValue(value() + step() * multiplier),
    decrement: (multiplier = 1) => setValue(value() - step() * multiplier),
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
