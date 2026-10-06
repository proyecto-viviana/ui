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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorWheel.tsx

import { createContext, createMemo, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createColorWheel,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaColorWheelOptions,
} from "@proyecto-viviana/solidaria";
import {
  createColorWheelState,
  type Color,
  type ColorWheelState,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  dataAttr,
} from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";

export interface ColorWheelRenderProps {
  /** Whether the wheel is disabled. */
  isDisabled: boolean;
  /** Whether the wheel is being dragged. */
  isDragging: boolean;
  /** The current hue value (0-360). */
  hue: number;
  /** The current color. */
  color: Color;
  /** The default inline styles applied by the color wheel hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorWheelProps extends AriaColorWheelOptions, SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (color: Color) => void;
  /** The children of the component. */
  children?: RenderChildren<ColorWheelRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorWheelRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorWheelRenderProps>;
}

export interface ColorWheelTrackRenderProps {
  /** Whether the wheel is disabled. */
  isDisabled: boolean;
  /** Whether the wheel is being dragged. */
  isDragging: boolean;
  /** The default inline styles applied by the color wheel hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorWheelTrackProps extends SlotProps {
  /** The children of the track. */
  children?: RenderChildren<ColorWheelTrackRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorWheelTrackRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorWheelTrackRenderProps>;
}

export interface ColorWheelThumbRenderProps {
  /** Whether the wheel is disabled. */
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
  /** The default inline styles applied by the color wheel hook. */
  defaultStyle: JSX.CSSProperties;
}

export interface ColorWheelThumbProps extends SlotProps {
  /** The children of the thumb. */
  children?: RenderChildren<ColorWheelThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorWheelThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorWheelThumbRenderProps>;
  /** Ref callback for the thumb element. */
  ref?: (element: HTMLDivElement) => void;
}

interface ColorWheelContextValue {
  state: ColorWheelState;
  trackProps: JSX.HTMLAttributes<HTMLDivElement>;
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  wheelRef: HTMLDivElement | undefined;
  setWheelRef: (el: HTMLDivElement) => void;
}

export const ColorWheelContext = createContext<ColorWheelContextValue | null>(null);
export const ColorWheelStateContext = ColorWheelContext;
export const ColorWheelTrackContext = ColorWheelContext;

/**
 * A color wheel allows users to select a hue using a circular control.
 */
export function ColorWheel(props: ColorWheelProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContext);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    ["value", "defaultValue", "onChange", "onChangeEnd"],
    [
      "id",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-details",
      "aria-errormessage",
      "isDisabled",
      "name",
      "form",
      "outerRadius",
      "innerRadius",
    ],
  );

  // Create color wheel state
  const state = createColorWheelState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange: stateProps.onChange ?? pickerContext?.onChange,
    onChangeEnd: stateProps.onChangeEnd,
    isDisabled: ariaProps.isDisabled,
  }));

  let wheelRef: HTMLDivElement | undefined;
  const setWheelRef = (el: HTMLDivElement) => {
    wheelRef = el;
  };

  // Create color wheel aria props
  const colorWheelAria = createColorWheel(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      "aria-details": ariaProps["aria-details"],
      "aria-errormessage": ariaProps["aria-errormessage"],
      isDisabled: ariaProps.isDisabled,
      name: ariaProps.name,
      form: ariaProps.form,
      outerRadius: ariaProps.outerRadius,
      innerRadius: ariaProps.innerRadius,
    }),
    () => state,
    () => wheelRef ?? null,
  );

  const renderValues = createMemo<ColorWheelRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    hue: state.getHue(),
    color: state.value,
    defaultStyle: { position: "relative" },
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorWheel",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <ColorWheelContext
      value={{
        state,
        get trackProps() {
          return colorWheelAria.trackProps;
        },
        get thumbProps() {
          return colorWheelAria.thumbProps;
        },
        get inputProps() {
          return colorWheelAria.inputProps;
        },
        get wheelRef() {
          return wheelRef;
        },
        setWheelRef,
      }}
    >
      <div
        ref={setWheelRef}
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        slot={local.slot || undefined}
        data-disabled={dataAttr(state.isDisabled)}
        data-dragging={dataAttr(state.isDragging)}
      >
        {renderProps.renderChildrenStable()}
      </div>
    </ColorWheelContext>
  );
}

/**
 * The track element of a color wheel.
 */
export function ColorWheelTrack(props: ColorWheelTrackProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ColorWheelContext);
  if (!context) {
    throw new Error("ColorWheelTrack must be used within a ColorWheel");
  }

  const state = context.state;

  const renderValues = createMemo<ColorWheelTrackRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    defaultStyle: (context.trackProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorWheel-track",
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
      {...cleanTrackProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
      data-dragging={dataAttr(state.isDragging)}
    >
      {renderProps.renderChildrenStable()}
    </div>
  );
}

/**
 * The thumb element of a color wheel.
 */
export function ColorWheelThumb(props: ColorWheelThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(ColorWheelContext);
  if (!context) {
    throw new Error("ColorWheelThumb must be used within a ColorWheel");
  }

  const state = context.state;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorWheelThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    color: state.getDisplayColor(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    defaultStyle: (context.thumbProps as { style?: JSX.CSSProperties }).style ?? {},
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorWheel-thumb",
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
      <input {...mergedInputProps()} />
      {renderProps.renderChildrenStable()}
    </div>
  );
}

ColorWheel.Track = ColorWheelTrack;
ColorWheel.Thumb = ColorWheelThumb;
