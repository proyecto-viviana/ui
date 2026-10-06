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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorArea.tsx

import { createContext, createMemo, useContext, createTrackedEffect } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createColorArea,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaColorAreaOptions,
} from "@proyecto-viviana/solidaria";
import {
  createColorAreaState,
  type Color,
  type ColorChannel,
  type ColorAreaState,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  dataAttr,
  evaluateRenderChildren,
} from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";

export interface ColorAreaRenderProps {
  /** Whether the area is disabled. */
  isDisabled: boolean;
  /** Whether the area is being dragged. */
  isDragging: boolean;
  /** The X channel. */
  xChannel: ColorChannel;
  /** The Y channel. */
  yChannel: ColorChannel;
  /** The current color. */
  color: Color;
  /** The default inline styles applied by the color area hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorAreaProps extends AriaColorAreaOptions, SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** The X channel to control. */
  xChannel?: ColorChannel;
  /** The Y channel to control. */
  yChannel?: ColorChannel;
  /** The children of the component. */
  children?: RenderChildren<ColorAreaRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorAreaRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorAreaRenderProps>;
}

export interface ColorAreaGradientRenderProps {
  /** Whether the area is disabled. */
  isDisabled: boolean;
}

export interface ColorAreaGradientProps extends SlotProps {
  /** The children of the gradient. */
  children?: RenderChildren<ColorAreaGradientRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorAreaGradientRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorAreaGradientRenderProps>;
}

export interface ColorAreaThumbRenderProps {
  /** Whether the area is disabled. */
  isDisabled: boolean;
  /** Whether the thumb is being dragged. */
  isDragging: boolean;
  /** The current display color. */
  color: Color;
  /** Whether the thumb is focused. */
  isFocused: boolean;
  /** Whether the thumb has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the thumb is hovered. */
  isHovered: boolean;
}

export interface ColorAreaThumbProps extends SlotProps {
  /** The children of the thumb. */
  children?: RenderChildren<ColorAreaThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorAreaThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorAreaThumbRenderProps>;
  /** Ref callback for the thumb element. */
  ref?: (element: HTMLDivElement) => void;
}

interface ColorAreaContextValue {
  state: ColorAreaState;
  colorAreaProps: JSX.HTMLAttributes<HTMLDivElement>;
  gradientProps: JSX.HTMLAttributes<HTMLDivElement>;
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  xInputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  yInputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  areaRef: HTMLDivElement | undefined;
  setAreaRef: (el: HTMLDivElement) => void;
}

export const ColorAreaContext = createContext<ColorAreaContextValue | null>(null);
export const ColorAreaStateContext = ColorAreaContext;

/**
 * A color area allows users to select a color using a 2D gradient.
 */
export function ColorArea(props: ColorAreaProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContext);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    ["value", "defaultValue", "onChange", "onChangeEnd", "xChannel", "yChannel", "colorSpace"],
    [
      "id",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-details",
      "isDisabled",
      "xName",
      "yName",
      "form",
    ],
  );

  // Create color area state
  const state = createColorAreaState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange: stateProps.onChange ?? pickerContext?.onChange,
    onChangeEnd: stateProps.onChangeEnd,
    xChannel: stateProps.xChannel,
    yChannel: stateProps.yChannel,
    colorSpace: stateProps.colorSpace,
    isDisabled: ariaProps.isDisabled,
  }));

  // Area ref
  let areaRef: HTMLDivElement | undefined;
  const setAreaRef = (el: HTMLDivElement) => {
    areaRef = el;
  };

  // Create color area aria props
  const colorAreaAria = createColorArea(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      "aria-details": ariaProps["aria-details"],
      isDisabled: ariaProps.isDisabled,
      xName: ariaProps.xName,
      yName: ariaProps.yName,
      form: ariaProps.form,
    }),
    () => state,
    () => areaRef ?? null,
  );

  const renderValues = createMemo<ColorAreaRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    xChannel: state.xChannel,
    yChannel: state.yChannel,
    color: state.value,
    defaultStyle: (colorAreaAria.colorAreaProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const childRenderValues: ColorAreaRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isDragging() {
      return state.isDragging;
    },
    get xChannel() {
      return state.xChannel;
    },
    get yChannel() {
      return state.yChannel;
    },
    get color() {
      return state.value;
    },
    get defaultStyle() {
      return (colorAreaAria.colorAreaProps as { style?: JSX.CSSProperties }).style ?? {};
    },
  };

  const colorAreaChildren = () => evaluateRenderChildren(props.children, childRenderValues);

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorArea",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const cleanColorAreaProps = () => {
    const {
      ref: _ref,
      style: _areaStyle,
      ...rest
    } = colorAreaAria.colorAreaProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const areaStyle =
      (colorAreaAria.colorAreaProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...areaStyle, ...renderStyle };
  };

  return (
    <ColorAreaContext
      value={{
        state,
        get colorAreaProps() {
          return colorAreaAria.colorAreaProps;
        },
        get gradientProps() {
          return colorAreaAria.gradientProps;
        },
        get thumbProps() {
          return colorAreaAria.thumbProps;
        },
        get xInputProps() {
          return colorAreaAria.xInputProps;
        },
        get yInputProps() {
          return colorAreaAria.yInputProps;
        },
        areaRef,
        setAreaRef,
      }}
    >
      <div
        ref={setAreaRef}
        {...domProps()}
        {...cleanColorAreaProps()}
        class={renderProps.class()}
        style={mergedStyle()}
        slot={local.slot ?? undefined}
        data-disabled={dataAttr(state.isDisabled)}
        data-dragging={dataAttr(state.isDragging)}
      >
        {colorAreaChildren()}
      </div>
    </ColorAreaContext>
  );
}

/**
 * The gradient background of a color area.
 */
export function ColorAreaGradient(props: ColorAreaGradientProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ColorAreaContext);
  if (!context) {
    throw new Error("ColorAreaGradient must be used within a ColorArea");
  }

  const { state } = context;

  const renderValues = createMemo<ColorAreaGradientRenderProps>(() => ({
    isDisabled: state.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorArea-gradient",
    },
    renderValues,
  );

  const cleanGradientProps = () => {
    const {
      ref: _ref,
      style: _gradStyle,
      ...rest
    } = context.gradientProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const gradStyle = (context.gradientProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...gradStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      {...cleanGradientProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * The thumb element of a color area.
 */
export function ColorAreaThumb(props: ColorAreaThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(ColorAreaContext);
  if (!context) {
    throw new Error("ColorAreaThumb must be used within a ColorArea");
  }

  const { state } = context;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  let xInputRef: HTMLInputElement | undefined;
  let yInputRef: HTMLInputElement | undefined;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorAreaThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    color: state.getDisplayColor(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorArea-thumb",
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
  const mergedXInputProps = () => {
    const { value: _value, ...inputProps } = context.xInputProps as Record<string, unknown>;
    return mergeProps(inputProps, cleanFocusProps()) as JSX.InputHTMLAttributes<HTMLInputElement>;
  };
  const mergedYInputProps = () => {
    const { value: _value, ...inputProps } = context.yInputProps as Record<string, unknown>;
    return mergeProps(inputProps, cleanFocusProps()) as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  const mergedStyle = () => {
    const thumbStyle = (context.thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return {
      ...thumbStyle,
      "background-color": state.getDisplayColor().toString(),
      ...renderStyle,
    };
  };

  const syncInputValue = (input: HTMLInputElement | undefined, value: number) => {
    const nextValue = String(value);
    const update = () => {
      if (input && input.value !== nextValue) {
        input.value = nextValue;
      }
    };

    update();
    queueMicrotask(update);
  };

  createTrackedEffect(() => {
    syncInputValue(xInputRef, state.getXValue());
  });

  createTrackedEffect(() => {
    syncInputValue(yInputRef, state.getYValue());
  });

  return (
    <div
      {...domProps}
      ref={local.ref}
      {...cleanThumbProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
      data-dragging={dataAttr(state.isDragging)}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-hovered={dataAttr(isHovered())}
    >
      <input
        {...mergedXInputProps()}
        ref={(el) => {
          xInputRef = el;
          syncInputValue(el, state.getXValue());
        }}
      />
      <input
        {...mergedYInputProps()}
        ref={(el) => {
          yInputRef = el;
          syncInputValue(el, state.getYValue());
        }}
      />
      {renderProps.renderChildren()}
    </div>
  );
}

ColorArea.Gradient = ColorAreaGradient;
ColorArea.Thumb = ColorAreaThumb;
