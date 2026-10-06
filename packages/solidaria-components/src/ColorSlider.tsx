/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorSlider.tsx

import { createContext, createEffect, createMemo, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createColorSlider,
  createFocusRing,
  createHover,
  mergeProps,
  useLocale,
  type AriaColorSliderOptions,
} from "@proyecto-viviana/solidaria";
import {
  createColorSliderState,
  type Color,
  type ColorChannel,
  type ColorSpace,
  type ColorSliderState,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  useSlot,
  filterDOMProps,
  dataAttr,
  evaluateRenderChildren,
} from "./utils";
import { LabelContext, type LabelProps } from "./Label";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";

export interface ColorSliderRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider is being dragged. */
  isDragging: boolean;
  /** The color channel being controlled. */
  channel: ColorChannel;
  /** The slider orientation. */
  orientation: "horizontal" | "vertical";
  /** The current value. */
  value: number;
  /** The formatted current value. */
  valueLabel: string;
  /** The current color. */
  color: Color;
  /** The default inline styles applied by the color slider hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorSliderProps extends Omit<AriaColorSliderOptions, "channel">, SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** Color space used for channel values. */
  colorSpace?: ColorSpace;
  /** The color channel to control. */
  channel: ColorChannel;
  /** A visible label for the slider. */
  label?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<ColorSliderRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSliderRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSliderRenderProps>;
}

export interface ColorSliderTrackRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider is being dragged. */
  isDragging: boolean;
  /** The slider orientation. */
  orientation: "horizontal" | "vertical";
  /** The default inline styles applied by the color slider hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorSliderTrackProps extends SlotProps {
  /** The children of the track. */
  children?: RenderChildren<ColorSliderTrackRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSliderTrackRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSliderTrackRenderProps>;
}

export interface ColorSliderLabelProps extends SlotProps {
  /** The label contents. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface ColorSliderOutputProps extends SlotProps {
  /** The output contents. Defaults to the formatted slider value. */
  children?: JSX.Element | ((renderProps: ColorSliderRenderProps) => JSX.Element);
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface ColorSliderThumbRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the thumb is being dragged. */
  isDragging: boolean;
  /** Whether the thumb is focused. */
  isFocused: boolean;
  /** Whether the thumb has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the thumb is hovered. */
  isHovered: boolean;
  /** The current display color. */
  color: Color;
  /** The default inline styles applied by the color slider hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorSliderThumbProps extends SlotProps {
  /** The children of the thumb. */
  children?: RenderChildren<ColorSliderThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSliderThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSliderThumbRenderProps>;
  /** Ref callback for the thumb element. */
  ref?: (element: HTMLDivElement) => void;
}

interface ColorSliderContextValue {
  state: ColorSliderState;
  trackProps: JSX.HTMLAttributes<HTMLDivElement>;
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  outputProps: JSX.HTMLAttributes<HTMLOutputElement>;
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  trackRef: HTMLDivElement | undefined;
  setTrackRef: (el: HTMLDivElement) => void;
  setInputRef: (el: HTMLInputElement) => void;
}

export const ColorSliderContext = createContext<ColorSliderContextValue | null>(null);
export const ColorSliderStateContext = ColorSliderContext;

/**
 * A color slider allows users to adjust a single color channel.
 */
export function ColorSlider(props: ColorSliderProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContext);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "label"],
    ["value", "defaultValue", "onChange", "onChangeEnd", "channel", "colorSpace"],
    [
      "id",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-details",
      "isDisabled",
      "name",
      "form",
      "orientation",
      "channelName",
    ],
  );

  const locale = useLocale();

  // Create color slider state. The locale drives the thumb value label's
  // channel-value formatting (e.g. hue "50°" vs ar-AE "50 درجة"), mirroring
  // RAC ColorSlider passing `useLocale().locale` into useColorSliderState.
  const state = createColorSliderState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange: stateProps.onChange ?? pickerContext?.onChange,
    onChangeEnd: stateProps.onChangeEnd,
    channel: stateProps.channel,
    colorSpace: stateProps.colorSpace,
    orientation: ariaProps.orientation,
    isDisabled: ariaProps.isDisabled,
    locale: locale().locale,
  }));

  let trackRef: HTMLDivElement | undefined;
  const setTrackRef = (el: HTMLDivElement) => {
    trackRef = el;
  };
  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  const hasExplicitName = () => Boolean(ariaProps["aria-label"] || ariaProps["aria-labelledby"]);
  // A prop label already names the slider through ColorSliderLabel. Slot
  // detection starts only when that prop and an explicit aria name are absent.
  // `false` still counts as a label because the hook treats any non-null label
  // as visible (`label != null`).
  const [labelRef, hasLabel] = useSlot(!hasExplicitName() && local.label == null);

  // Create color slider aria props
  const colorSliderAria = createColorSlider(
    () => ({
      id: ariaProps.id,
      channel: stateProps.channel,
      label:
        local.label != null ? local.label : hasExplicitName() || !hasLabel() ? undefined : true,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      "aria-details": ariaProps["aria-details"],
      isDisabled: ariaProps.isDisabled,
      name: ariaProps.name,
      form: ariaProps.form,
      orientation: ariaProps.orientation,
      channelName: ariaProps.channelName,
    }),
    () => state,
    () => trackRef ?? null,
    () => inputRef ?? null,
  );

  const renderValues = createMemo<ColorSliderRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    channel: state.channel,
    orientation: state.orientation,
    value: state.getThumbValue(),
    valueLabel: state.getThumbValueLabel(),
    color: state.value,
    defaultStyle: (colorSliderAria.trackProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const labelContextValue: LabelProps = {
    get id() {
      if (hasExplicitName() || local.label != null || !hasLabel()) return undefined;
      return colorSliderAria.labelProps.id as string | undefined;
    },
    ref: labelRef,
    get onClick() {
      return colorSliderAria.labelProps.onClick;
    },
    get children() {
      return state.value.getChannelName(state.channel, locale().locale);
    },
  };

  return (
    <ColorSliderContext
      value={{
        state,
        get trackProps() {
          return colorSliderAria.trackProps;
        },
        get thumbProps() {
          return colorSliderAria.thumbProps;
        },
        get inputProps() {
          return colorSliderAria.inputProps;
        },
        get outputProps() {
          return colorSliderAria.outputProps;
        },
        get labelProps() {
          return colorSliderAria.labelProps;
        },
        get trackRef() {
          return trackRef;
        },
        setTrackRef,
        setInputRef,
      }}
    >
      <div
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={dataAttr(state.isDisabled)}
        data-dragging={dataAttr(state.isDragging)}
        data-orientation={state.orientation}
        slot={local.slot || undefined}
      >
        <LabelContext value={labelContextValue}>{renderProps.renderChildrenStable()}</LabelContext>
      </div>
    </ColorSliderContext>
  );
}

/**
 * The label element of a color slider.
 */
export function ColorSliderLabel(props: ColorSliderLabelProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "slot", "children"]);

  const context = useContext(ColorSliderContext);
  if (!context) {
    throw new Error("ColorSliderLabel must be used within a ColorSlider");
  }

  const labelProps = () => {
    const { ref: _ref, ...rest } = context.labelProps as Record<string, unknown>;
    return rest;
  };

  return (
    <label {...domProps} {...labelProps()} class={local.class}>
      {local.children}
    </label>
  );
}

/**
 * The output element of a color slider.
 */
export function ColorSliderOutput(props: ColorSliderOutputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "slot", "children"]);

  const context = useContext(ColorSliderContext);
  if (!context) {
    throw new Error("ColorSliderOutput must be used within a ColorSlider");
  }

  const state = context.state;

  const renderValues = createMemo<ColorSliderRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    channel: state.channel,
    orientation: state.orientation,
    value: state.getThumbValue(),
    valueLabel: state.getThumbValueLabel(),
    color: state.value,
    defaultStyle: (context.trackProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const children = () =>
    evaluateRenderChildren(local.children, renderValues()) ?? renderValues().valueLabel;

  return (
    <output {...domProps} {...context.outputProps} class={local.class}>
      {children()}
    </output>
  );
}

/**
 * The track element of a color slider.
 */
export function ColorSliderTrack(props: ColorSliderTrackProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ColorSliderContext);
  if (!context) {
    throw new Error("ColorSliderTrack must be used within a ColorSlider");
  }

  const state = context.state;

  const renderValues = createMemo<ColorSliderTrackRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    orientation: state.orientation,
    defaultStyle: (context.trackProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider-track",
    },
    renderValues,
  );

  const cleanTrackProps = () => {
    const {
      ref: _ref,
      style: _trackStyle,
      ...rest
    } = context.trackProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const trackStyle = (context.trackProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...trackStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      ref={context.setTrackRef}
      {...cleanTrackProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
      data-dragging={dataAttr(state.isDragging)}
      data-orientation={state.orientation}
    >
      {renderProps.renderChildrenStable()}
    </div>
  );
}

/**
 * The thumb element of a color slider.
 */
export function ColorSliderThumb(props: ColorSliderThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(ColorSliderContext);
  if (!context) {
    throw new Error("ColorSliderThumb must be used within a ColorSlider");
  }

  const state = context.state;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorSliderThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    color: state.getDisplayColor(),
    defaultStyle: (context.thumbProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider-thumb",
    },
    renderValues,
  );

  const cleanThumbProps = () => {
    const {
      ref: _ref,
      style: _thumbStyle,
      ...rest
    } = context.thumbProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const mergedInputProps = () => {
    return mergeProps(
      context.inputProps as Record<string, unknown>,
      cleanFocusProps(),
    ) as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  let sliderInput: HTMLInputElement | undefined;
  createEffect(
    () => state.getThumbValue(),
    (value) => {
      if (sliderInput && sliderInput.value !== String(value)) {
        sliderInput.value = String(value);
      }
    },
  );

  const mergedStyle = () => {
    const thumbStyle = (context.thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return {
      ...thumbStyle,
      "background-color": state.getDisplayColor().toString(),
      ...renderStyle,
    };
  };

  return (
    <div
      {...domProps}
      {...cleanThumbProps()}
      {...cleanHoverProps()}
      ref={local.ref}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
      data-dragging={dataAttr(state.isDragging)}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-hovered={dataAttr(isHovered())}
    >
      <input
        ref={(el) => {
          sliderInput = el;
          context.setInputRef(el);
          if (el) el.value = String(state.getThumbValue());
        }}
        {...mergedInputProps()}
      />
      {renderProps.renderChildrenStable()}
    </div>
  );
}

ColorSlider.Track = ColorSliderTrack;
ColorSlider.Thumb = ColorSliderThumb;
ColorSlider.Label = ColorSliderLabel;
ColorSlider.Output = ColorSliderOutput;
