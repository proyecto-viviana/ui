/**
 * Meter hook for Solidaria
 *
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 * Unlike progress bars, meters represent a current value rather than progress toward a goal.
 *
 * This is a port of @react-aria/meter's useMeter hook.
 */

import { createProgressBar, type AriaProgressBarProps } from "../progress/createProgressBar";
import type { JSX } from "solid-js";

export interface AriaMeterProps extends Omit<AriaProgressBarProps, "isIndeterminate"> {
  /** The current value (controlled). */
  value?: number;
  /** The smallest value allowed for the input. @default 0 */
  minValue?: number;
  /** The largest value allowed for the input. @default 100 */
  maxValue?: number;
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: string;
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions;
  /** The content to display as the label. */
  label?: JSX.Element;
  /** An accessibility label for this item. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
  "aria-details"?: string;
}

export interface MeterAria {
  /** Props for the meter container element. */
  meterProps: Record<string, unknown>;
  /** Props for the meter's visual label element (if any). */
  labelProps: Record<string, unknown>;
}

/**
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 */
export function createMeter(props: AriaMeterProps = {}): MeterAria {
  // Reuse progress bar implementation
  const { progressBarProps, labelProps } = createProgressBar(props);

  return {
    get meterProps() {
      return {
        ...progressBarProps,
        role: "meter",
      };
    },
    get labelProps() {
      return labelProps;
    },
  };
}
