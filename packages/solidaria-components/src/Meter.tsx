/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Meter.tsx

/**
 * Meter component for solidaria-components
 *
 * Pre-wired headless meter component that combines aria hooks.
 * Port of react-aria-components/src/Meter.tsx
 *
 * Meters represent a quantity within a known range, or a fractional value.
 * Unlike progress bars, meters represent a current value rather than progress toward a goal.
 */

import { type JSX, createContext, createMemo, splitProps } from "solid-js";
import { createMeter, type AriaMeterProps } from "@proyecto-viviana/solidaria";
import { LabelContext, type LabelProps } from "./Label";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type ContextValue,
  type RefLike,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  useContextProps,
  useSlot,
} from "./utils";

export interface MeterRenderProps {
  /** The value as a percentage between the minimum and maximum (0-100). */
  percentage: number;
  /** A formatted version of the value. */
  valueText: string | undefined;
}

export interface MeterProps extends Omit<AriaMeterProps, "label">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<MeterRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<MeterRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<MeterRenderProps>;
  /** A ref for the meter element. */
  ref?: RefLike<HTMLDivElement>;
}

export const MeterContext = createContext<ContextValue<MeterProps, HTMLDivElement>>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSafeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

/**
 * A meter represents a quantity within a known range, or a fractional value.
 * Unlike progress bars, meters represent a current value rather than progress toward a goal.
 *
 * @example
 * ```tsx
 * <Meter value={75}>
 *   {({ percentage, valueText }) => (
 *     <>
 *       <Label>Storage space</Label>
 *       <span>{valueText}</span>
 *       <div class="bar" style={{ width: `${percentage}%` }} />
 *     </>
 *   )}
 * </Meter>
 * ```
 */
export function Meter(props: MeterProps): JSX.Element {
  const [mergedProps, ref] = useContextProps(props, props.ref, MeterContext);
  const [local, ariaProps] = splitProps(mergedProps, ["children", "class", "style", "slot", "ref"]);

  const value = () => ariaProps.value ?? 0;
  const minValue = () => ariaProps.minValue ?? 0;
  const maxValue = () => ariaProps.maxValue ?? 100;
  const [labelRef, hasLabel] = useSlot(!ariaProps["aria-label"] && !ariaProps["aria-labelledby"]);

  const meterAria = createMeter({
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
    get formatOptions() {
      return ariaProps.formatOptions;
    },
    get label() {
      return hasLabel();
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
    const clampedValue = clamp(value(), minValue(), maxValue());
    return ((clampedValue - minValue()) / getSafeRange(minValue(), maxValue())) * 100;
  });

  const valueText = createMemo(() => {
    return meterAria.meterProps["aria-valuetext"] as string | undefined;
  });

  const renderValues = createMemo<MeterRenderProps>(() => ({
    percentage: percentage(),
    valueText: valueText(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return mergedProps.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Meter",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));
  const labelContextValue: LabelProps = {
    get id() {
      return meterAria.labelProps.id as string | undefined;
    },
    ref: labelRef,
    elementType: "span",
  };

  return (
    <div
      {...domProps()}
      {...meterAria.meterProps}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot ?? undefined}
      ref={ref}
    >
      <LabelContext.Provider value={labelContextValue}>
        {renderProps.renderChildren()}
      </LabelContext.Provider>
    </div>
  );
}
