/**
 * ProgressBar component for solidaria-components
 *
 * Pre-wired headless progress bar component that combines aria hooks.
 * Port of react-aria-components/src/ProgressBar.tsx
 */

import { type JSX, createContext, createMemo, mergeProps, splitProps, useContext } from "solid-js";
import { createProgressBar, type AriaProgressBarProps } from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface ProgressBarRenderProps {
  /** The value as a percentage between the minimum and maximum (0-100). */
  percentage: number | undefined;
  /** A formatted version of the value. */
  valueText: string | undefined;
  /** Whether the progress bar is indeterminate. */
  isIndeterminate: boolean;
}

export interface ProgressBarProps extends AriaProgressBarProps, SlotProps {
  /** The element id. */
  id?: string;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<ProgressBarRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ProgressBarRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ProgressBarRenderProps>;
}

export const ProgressBarContext = createContext<ProgressBarProps | null>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSafeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

/**
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 *
 * @example
 * ```tsx
 * <ProgressBar value={50}>
 *   {({ percentage, valueText }) => (
 *     <>
 *       <Label>Loading...</Label>
 *       <span>{valueText}</span>
 *       <div class="bar" style={{ width: `${percentage}%` }} />
 *     </>
 *   )}
 * </ProgressBar>
 * ```
 */
export function ProgressBar(props: ProgressBarProps): JSX.Element {
  const contextProps = useContext(ProgressBarContext);
  const mergedProps = contextProps ? mergeProps(contextProps, props) : props;
  const [local, ariaProps] = splitProps(mergedProps, ["children", "class", "style", "slot"]);

  const value = () => ariaProps.value ?? 0;
  const minValue = () => ariaProps.minValue ?? 0;
  const maxValue = () => ariaProps.maxValue ?? 100;
  const isIndeterminate = () => ariaProps.isIndeterminate ?? false;

  const progressAria = createProgressBar({
    get id() {
      return ariaProps.id;
    },
    get value() {
      return ariaProps.value;
    },
    get minValue() {
      return ariaProps.minValue;
    },
    get maxValue() {
      return ariaProps.maxValue;
    },
    get valueLabel() {
      return ariaProps.valueLabel;
    },
    get isIndeterminate() {
      return ariaProps.isIndeterminate;
    },
    get formatOptions() {
      return ariaProps.formatOptions;
    },
    get label() {
      return ariaProps.label;
    },
    get "aria-label"() {
      return ariaProps["aria-label"];
    },
    get "aria-labelledby"() {
      return ariaProps["aria-labelledby"];
    },
    get "aria-describedby"() {
      return ariaProps["aria-describedby"];
    },
    get "aria-details"() {
      return ariaProps["aria-details"];
    },
  });

  const percentage = createMemo(() => {
    if (isIndeterminate()) {
      return undefined;
    }
    const clampedValue = clamp(value(), minValue(), maxValue());
    return ((clampedValue - minValue()) / getSafeRange(minValue(), maxValue())) * 100;
  });

  const valueText = createMemo(() => {
    return progressAria.progressBarProps["aria-valuetext"] as string | undefined;
  });

  const renderValues = createMemo<ProgressBarRenderProps>(() => ({
    percentage: percentage(),
    valueText: valueText(),
    isIndeterminate: isIndeterminate(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ProgressBar",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  return (
    <div
      {...domProps()}
      {...progressAria.progressBarProps}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
    >
      {renderProps.renderChildren()}
    </div>
  );
}
