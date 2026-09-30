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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/numberfield/useNumberFieldState.ts

/**
 * State management for NumberField.
 * Based on @react-stately/numberfield useNumberFieldState.
 */

import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import { NumberFormatter, NumberParser } from "@internationalized/number";
import { access, createInternalSignal, readNow, type MaybeAccessor } from "../utils";
import {
  createFormValidationState,
  type FormValidationState,
  type ValidationFunction,
} from "../form";

export interface NumberFieldStateProps {
  /** The current value (controlled). */
  value?: number;
  /** The default value (uncontrolled). */
  defaultValue?: number;
  /** Handler called when the value changes. */
  onChange?: (value: number) => void;
  /** The minimum value. */
  minValue?: number;
  /** The maximum value. */
  maxValue?: number;
  /** The step value for increment/decrement. */
  step?: number;
  /** Whether the field is disabled. */
  isDisabled?: boolean;
  /** Whether the field is read-only. */
  isReadOnly?: boolean;
  /** The locale for number formatting. */
  locale?: string;
  /** Number format options. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Whether the number field is invalid (controlled). */
  isInvalid?: boolean;
  /** @deprecated Use isInvalid instead. */
  validationState?: "valid" | "invalid";
  /** Custom validation function. */
  validate?: ValidationFunction<number>;
  /**
   * Whether to use native HTML form validation or ARIA validation semantics.
   * @default "native"
   */
  validationBehavior?: "aria" | "native";
  /** Field name(s) for server error lookup. */
  name?: string | string[];
  /**
   * Controls the behavior of the number field when the user blurs the field after
   * editing. `'snap'` clamps to min/max and snaps to step. `'validate'` leaves the
   * value and reports native range/step validity.
   *
   * @default "snap"
   */
  commitBehavior?: "snap" | "validate";
}

export interface NumberFieldState extends FormValidationState {
  /** The current input value as a string. */
  inputValue: Accessor<string>;
  /** The current numeric value. */
  numberValue: Accessor<number>;
  /** Whether the value can be incremented. */
  canIncrement: Accessor<boolean>;
  /** Whether the value can be decremented. */
  canDecrement: Accessor<boolean>;
  /** Whether the field is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the field is read-only. */
  isReadOnly: Accessor<boolean>;
  /** The minimum value. */
  minValue: Accessor<number | undefined>;
  /** The maximum value. */
  maxValue: Accessor<number | undefined>;
  /** The configured step, or undefined when the field uses the default step. */
  step: Accessor<number | undefined>;
  /** The default numeric value, used on native form reset. */
  defaultNumberValue: number;
  /** Sets the number value and reformats the input. */
  setNumberValue: (value: number) => void;
  /** Set the input value. */
  setInputValue: (value: string) => void;
  /** Validate a partial input value. */
  validate: (value: string) => boolean;
  /** Commit the current input value, or an override when a paste replaces it. */
  commit: (value?: string) => void;
  /** Increment the value by step. */
  increment: () => void;
  /** Decrement the value by step. */
  decrement: () => void;
  /** Set to maximum value. */
  incrementToMax: () => void;
  /** Set to minimum value. */
  decrementToMin: () => void;
}

/**
 * Handles decimal operations to avoid floating point errors.
 */
function handleDecimalOperation(operator: "+" | "-", value1: number, value2: number): number {
  // Find the number of decimal places
  const getDecimals = (n: number) => {
    const str = String(n);
    const idx = str.indexOf(".");
    return idx === -1 ? 0 : str.length - idx - 1;
  };

  const decimals = Math.max(getDecimals(value1), getDecimals(value2));
  const multiplier = Math.pow(10, decimals);

  const int1 = Math.round(value1 * multiplier);
  const int2 = Math.round(value2 * multiplier);

  const result = operator === "+" ? int1 + int2 : int1 - int2;
  return result / multiplier;
}

/**
 * Clamps a value between min and max.
 */
function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min != null && result < min) result = min;
  if (max != null && result > max) result = max;
  return result;
}

/**
 * Rounds to the decimal precision implied by a step, including exponential steps.
 */
function roundToStepPrecision(value: number, step: number): number {
  let roundedValue = value;
  let precision = 0;
  const stepString = step.toString();
  const eIndex = stepString.toLowerCase().indexOf("e-");
  if (eIndex > 0) {
    precision = Math.abs(Math.floor(Math.log10(Math.abs(step)))) + eIndex;
  } else {
    const pointIndex = stepString.indexOf(".");
    if (pointIndex >= 0) {
      precision = stepString.length - pointIndex;
    }
  }
  if (precision > 0) {
    const pow = Math.pow(10, precision);
    roundedValue = Math.round(roundedValue * pow) / pow;
  }
  return roundedValue;
}

/**
 * Snaps to the nearest step, then to the last in-range step when that exceeds max.
 * A negative halfway rounds away from the step base.
 */
function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number,
): number {
  const minNumber = Number(min);
  const maxNumber = Number(max);
  const remainder = (value - (isNaN(minNumber) ? 0 : minNumber)) % step;
  let snappedValue = roundToStepPrecision(
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder,
    step,
  );

  if (!isNaN(minNumber)) {
    if (snappedValue < minNumber) {
      snappedValue = minNumber;
    } else if (!isNaN(maxNumber) && snappedValue > maxNumber) {
      snappedValue =
        minNumber + Math.floor(roundToStepPrecision((maxNumber - minNumber) / step, step)) * step;
    }
  } else if (!isNaN(maxNumber) && snappedValue > maxNumber) {
    snappedValue = Math.floor(roundToStepPrecision(maxNumber / step, step)) * step;
  }

  return roundToStepPrecision(snappedValue, step);
}

function isValidStep(step: number | undefined): step is number {
  return step != null && !isNaN(step) && step > 0;
}

/**
 * Creates state for a number field.
 */
export function createNumberFieldState(
  props: MaybeAccessor<NumberFieldStateProps>,
): NumberFieldState {
  const getProps = () => access(props);

  // Internal signals
  const [inputValue, setInputValueInternal] = createInternalSignal<string>("");
  const [numberValue, setNumberValue] = createInternalSignal<number>(NaN);

  // Get locale and formatter
  const locale = () => getProps().locale ?? "en-US";
  const formatOptions = () => getProps().formatOptions ?? {};

  const numberParser = createMemo(() => {
    return new NumberParser(locale(), formatOptions());
  });

  const numberingSystem = createMemo(() => {
    return numberParser().getNumberingSystem(inputValue());
  });

  const formatter = createMemo(() => {
    return new NumberFormatter(locale(), {
      ...formatOptions(),
      numberingSystem: numberingSystem(),
    });
  });

  const parseNumber = (value: string): number => {
    return numberParser().parse(value);
  };

  // Format a number to string
  const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null) return "";
    return formatter().format(value);
  };

  // Determine step value
  const hasCustomStep = createMemo(() => isValidStep(getProps().step));
  const shouldSnap = () => (getProps().commitBehavior ?? "snap") === "snap";

  const step = createMemo(() => {
    const p = getProps();
    if (hasCustomStep()) return p.step as number;
    const resolved = formatter().resolvedOptions();
    if (resolved.style === "percent") return 0.01;
    return 1;
  });

  const applyConstraints = (value: number): number => {
    const p = getProps();
    if (isNaN(value)) return NaN;

    if (hasCustomStep()) {
      return snapValueToStep(value, p.minValue, p.maxValue, step());
    }

    return clamp(value, p.minValue, p.maxValue);
  };

  let initialNumberValue = NaN;
  let capturedDefaultNumberValue = NaN;

  const constrainForCommit = (value: number): number => {
    if (!shouldSnap()) return value;
    return applyConstraints(value);
  };

  // Initialize from props
  const initValue = () => {
    const p = getProps();
    const initial = p.value ?? p.defaultValue;
    if (initial != null && !isNaN(initial)) {
      const next = constrainForCommit(initial);
      setNumberValue(next);
      setInputValueInternal(formatNumber(next));
      initialNumberValue = next;
    } else {
      initialNumberValue = NaN;
    }
    const defaultValue = p.defaultValue ?? NaN;
    capturedDefaultNumberValue = isNaN(defaultValue)
      ? initialNumberValue
      : constrainForCommit(defaultValue);
  };

  // Call init on first access
  let initialized = false;
  const ensureInitialized = () => {
    if (!initialized) {
      initialized = true;
      initValue();
    }
  };

  // Controlled mode: sync with props.value
  const actualNumberValue = createMemo(() => {
    ensureInitialized();
    const p = getProps();
    if (p.value !== undefined) {
      return constrainForCommit(p.value);
    }
    return numberValue();
  });

  let lastControlledValue: number | undefined = undefined;
  const syncControlledValue = () => {
    const p = getProps();
    if (p.value === undefined) {
      lastControlledValue = undefined;
      return;
    }

    const next = constrainForCommit(p.value);
    if (lastControlledValue === undefined || !Object.is(lastControlledValue, next)) {
      lastControlledValue = next;
      setNumberValue(next);
      setInputValueInternal(formatNumber(next));
    }
  };

  const parsedInputValue = () => {
    ensureInitialized();
    syncControlledValue();
    return parseNumber(readNow(inputValue));
  };

  const validation = createFormValidationState({
    get value() {
      ensureInitialized();
      return actualNumberValue();
    },
    get isInvalid() {
      return getProps().isInvalid;
    },
    get validationState() {
      return getProps().validationState;
    },
    get validate() {
      return getProps().validate;
    },
    get name() {
      return getProps().name;
    },
    get validationBehavior() {
      return getProps().validationBehavior ?? "native";
    },
  });

  // Validate partial input
  const validate = (value: string): boolean => {
    return numberParser().isValidPartialNumber(value, getProps().minValue, getProps().maxValue);
  };

  // Set input value with validation
  const setInputValue = (value: string) => {
    ensureInitialized();
    syncControlledValue();
    setInputValueInternal(value);
  };

  // Commit the current input value, or an override when a paste replaces it.
  const commit = (override?: string) => {
    ensureInitialized();
    const p = getProps();
    const input = override === undefined ? readNow(inputValue) : override;

    if (input === "" || input === "-") {
      // Clear value
      setNumberValue(NaN);
      setInputValueInternal(p.value === undefined ? "" : formatNumber(readNow(actualNumberValue)));
      p.onChange?.(NaN);
      validation.commitValidation();
      return;
    }

    let parsed = parseNumber(input);

    if (isNaN(parsed)) {
      // Invalid input - revert to current value
      setInputValueInternal(formatNumber(readNow(actualNumberValue)));
      return;
    }

    const previous = readNow(actualNumberValue);
    parsed = constrainForCommit(parsed);
    parsed = numberParser().parse(formatNumber(parsed));

    setNumberValue(parsed);
    // A controlled field keeps the current number until its value prop updates.
    setInputValueInternal(formatNumber(p.value === undefined ? parsed : previous));

    p.onChange?.(parsed);
    if (parsed !== previous) {
      validation.commitValidation();
    }
  };

  // Check if can increment
  const canIncrement = createMemo(() => {
    ensureInitialized();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return false;

    const current = parsedInputValue();
    if (isNaN(current)) return true; // Can start from min

    if (p.maxValue == null) return true;
    return (
      snapValueToStep(current, p.minValue, p.maxValue, step()) > current ||
      handleDecimalOperation("+", current, step()) <= p.maxValue
    );
  });

  // Check if can decrement
  const canDecrement = createMemo(() => {
    ensureInitialized();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return false;

    const current = parsedInputValue();
    if (isNaN(current)) return true; // Can start from max

    if (p.minValue == null) return true;
    return (
      snapValueToStep(current, p.minValue, p.maxValue, step()) < current ||
      handleDecimalOperation("-", current, step()) >= p.minValue
    );
  });

  const safeNextStep = (operation: "+" | "-", minOrMaxValue: number = 0): number => {
    const p = getProps();
    const parsed = parsedInputValue();

    if (isNaN(parsed)) {
      const base = isNaN(minOrMaxValue) ? 0 : minOrMaxValue;
      return snapValueToStep(base, p.minValue, p.maxValue, step());
    }

    const snapped = snapValueToStep(parsed, p.minValue, p.maxValue, step());
    if ((operation === "+" && snapped > parsed) || (operation === "-" && snapped < parsed)) {
      return snapped;
    }

    return snapValueToStep(
      handleDecimalOperation(operation, parsed, step()),
      p.minValue,
      p.maxValue,
      step(),
    );
  };

  // Increment by step
  const increment = () => {
    ensureInitialized();
    syncControlledValue();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;

    const current = safeNextStep("+", p.minValue);
    setNumberValue(current);
    setInputValueInternal(formatNumber(current));
    p.onChange?.(current);
    validation.commitValidation();
  };

  // Decrement by step
  const decrement = () => {
    ensureInitialized();
    syncControlledValue();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;

    const current = safeNextStep("-", p.maxValue);
    setNumberValue(current);
    setInputValueInternal(formatNumber(current));
    p.onChange?.(current);
    validation.commitValidation();
  };

  // Set to max
  const incrementToMax = () => {
    ensureInitialized();
    syncControlledValue();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;

    if (p.maxValue == null) return;

    const snapped = snapValueToStep(p.maxValue, p.minValue, p.maxValue, step());
    setNumberValue(snapped);
    setInputValueInternal(formatNumber(snapped));
    p.onChange?.(snapped);
    validation.commitValidation();
  };

  // Set to min
  const decrementToMin = () => {
    ensureInitialized();
    syncControlledValue();
    const p = getProps();
    if (p.isDisabled || p.isReadOnly) return;

    if (p.minValue == null) return;

    setNumberValue(p.minValue);
    setInputValueInternal(formatNumber(p.minValue));
    p.onChange?.(p.minValue);
    validation.commitValidation();
  };

  const setNumberValuePublic = (value: number) => {
    ensureInitialized();
    setNumberValue(value);
    setInputValueInternal(formatNumber(value));
    getProps().onChange?.(value);
  };

  return {
    realtimeValidation: validation.realtimeValidation,
    displayValidation: validation.displayValidation,
    updateValidation: validation.updateValidation,
    resetValidation: validation.resetValidation,
    commitValidation: validation.commitValidation,
    get inputValue() {
      ensureInitialized();
      syncControlledValue();
      return inputValue;
    },
    get numberValue() {
      return actualNumberValue;
    },
    canIncrement,
    canDecrement,
    isDisabled: () => getProps().isDisabled ?? false,
    isReadOnly: () => getProps().isReadOnly ?? false,
    minValue: () => getProps().minValue,
    maxValue: () => getProps().maxValue,
    step: () => getProps().step,
    get defaultNumberValue() {
      ensureInitialized();
      return capturedDefaultNumberValue;
    },
    setNumberValue: setNumberValuePublic,
    setInputValue,
    validate,
    commit,
    increment,
    decrement,
    incrementToMax,
    decrementToMin,
  };
}
