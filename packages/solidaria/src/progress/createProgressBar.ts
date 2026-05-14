/**
 * ProgressBar hook for Solidaria
 *
 * Provides the accessibility implementation for a progress bar component.
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 *
 * This is a 1:1 port of @react-aria/progress's useProgressBar hook.
 */

import { createLabel } from "../label/createLabel";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaProgressBarProps {
  /** The element id. */
  id?: string;
  /** The current value (controlled). */
  value?: number;
  /** The smallest value allowed for the input. @default 0 */
  minValue?: number;
  /** The largest value allowed for the input. @default 100 */
  maxValue?: number;
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: string;
  /** Whether presentation is indeterminate when progress isn't known. */
  isIndeterminate?: boolean;
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions;
  /** The content to display as the label. */
  label?: string;
  /** An accessibility label for this item. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
  "aria-details"?: string;
}

export interface ProgressBarAria {
  /** Props for the progress bar container element. */
  progressBarProps: Record<string, unknown>;
  /** Props for the progress bar's visual label element (if any). */
  labelProps: Record<string, unknown>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSafeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

/**
 * Provides the accessibility implementation for a progress bar component.
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
export function createProgressBar(
  props: MaybeAccessor<AriaProgressBarProps> = {},
): ProgressBarAria {
  const getProps = () => access(props);

  // Create label handling
  const { labelProps, fieldProps } = createLabel({
    get id() {
      return getProps().id;
    },
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    // Progress bar is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: "span",
  });

  // Build progress bar props
  const getProgressBarProps = (): Record<string, unknown> => {
    const p = getProps();
    const value = p.value ?? 0;
    const minValue = p.minValue ?? 0;
    const maxValue = p.maxValue ?? 100;
    const isIndeterminate = p.isIndeterminate ?? false;
    const formatOptions = p.formatOptions ?? { style: "percent" as const };

    const clampedValue = clamp(value, minValue, maxValue);
    const percentage = (clampedValue - minValue) / getSafeRange(minValue, maxValue);

    // Format value label
    let valueLabel = p.valueLabel;
    if (!isIndeterminate && !valueLabel) {
      const valueToFormat = formatOptions.style === "percent" ? percentage : clampedValue;
      try {
        const formatter = new Intl.NumberFormat(undefined, formatOptions);
        valueLabel = formatter.format(valueToFormat);
      } catch {
        // Fallback if formatting fails
        valueLabel = `${Math.round(percentage * 100)}%`;
      }
    }

    const domProps = filterDOMProps(p as Record<string, unknown>, { labelable: true });

    return mergeProps(domProps, fieldProps as Record<string, unknown>, {
      "aria-valuenow": isIndeterminate ? undefined : clampedValue,
      "aria-valuemin": minValue,
      "aria-valuemax": maxValue,
      "aria-valuetext": isIndeterminate ? undefined : valueLabel,
      role: "progressbar",
    });
  };

  return {
    get progressBarProps() {
      return getProgressBarProps();
    },
    get labelProps() {
      return labelProps as Record<string, unknown>;
    },
  };
}
