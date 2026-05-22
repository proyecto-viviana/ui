/**
 * Color components for solidaria-components
 *
 * Pre-wired headless color picker components that combine state + aria hooks.
 * Port of react-aria-components color components.
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  untrack,
  useContext,
  Show,
} from "solid-js";
import {
  createColorSlider,
  createColorArea,
  createColorWheel,
  createColorField,
  createColorSwatch,
  createListBox,
  createOption,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaColorSliderOptions,
  type AriaColorAreaOptions,
  type AriaColorWheelOptions,
  type AriaColorFieldOptions,
} from "@proyecto-viviana/solidaria";
import {
  createListState,
  createColorSliderState,
  createColorAreaState,
  createColorWheelState,
  createColorFieldState,
  normalizeColor,
  type Color,
  type ColorChannel,
  type ColorFormat,
  type ColorSpace,
  type ColorSliderState,
  type ColorAreaState,
  type ColorWheelState,
  type ColorFieldState,
  type ListState,
  type Key,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

interface ColorPickerChannelContextValue {
  value?: Color | string;
  onChange?: (color: Color) => void;
}

interface ColorPickerStateContextValue {
  color: () => Color;
  setColor: (color: Color) => void;
}

interface ColorSwatchPickerItemData {
  key: string;
  color: Color;
  textValue: string;
  isDisabled?: boolean;
}

interface ColorSwatchPickerContextValue {
  state: ListState<ColorSwatchPickerItemData>;
  registerItem: (item: ColorSwatchPickerItemData) => void;
  unregisterItem: (key: string) => void;
}

const ColorPickerContextInternal = createContext<ColorPickerChannelContextValue | null>(null);
const ColorPickerStateContextInternal = createContext<ColorPickerStateContextValue | null>(null);
const ColorSwatchContextInternal = createContext<{ color?: Color | string } | null>(null);
const ColorSwatchPickerContextInternal = createContext<ColorSwatchPickerContextValue | null>(null);

export interface ColorSliderRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider is being dragged. */
  isDragging: boolean;
  /** The color channel being controlled. */
  channel: ColorChannel;
  /** The current value. */
  value: number;
  /** The current color. */
  color: Color;
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
}

export interface ColorSliderTrackProps extends SlotProps {
  /** The children of the track. */
  children?: RenderChildren<ColorSliderTrackRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSliderTrackRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSliderTrackRenderProps>;
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
}

export interface ColorSliderThumbProps extends SlotProps {
  /** The children of the thumb. */
  children?: RenderChildren<ColorSliderThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSliderThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSliderThumbRenderProps>;
}

interface ColorSliderContextValue {
  state: ColorSliderState;
  trackProps: JSX.HTMLAttributes<HTMLDivElement>;
  thumbProps: JSX.HTMLAttributes<HTMLDivElement>;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  trackRef: HTMLDivElement | undefined;
  setTrackRef: (el: HTMLDivElement) => void;
}

export const ColorSliderContext = createContext<ColorSliderContextValue | null>(null);

/**
 * A color slider allows users to adjust a single color channel.
 */
export function ColorSlider(props: ColorSliderProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContextInternal);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "label"],
    ["value", "defaultValue", "onChange", "onChangeEnd", "channel"],
    ["aria-label", "aria-labelledby", "aria-describedby", "isDisabled", "channelName"],
  );

  // Create color slider state
  const state = createColorSliderState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange: stateProps.onChange ?? pickerContext?.onChange,
    onChangeEnd: stateProps.onChangeEnd,
    channel: stateProps.channel,
    isDisabled: ariaProps.isDisabled,
  }));

  let trackRef: HTMLDivElement | undefined;
  const setTrackRef = (el: HTMLDivElement) => {
    trackRef = el;
  };

  // Create color slider aria props
  const { trackProps, thumbProps, inputProps, labelProps } = createColorSlider(
    () => ({
      channel: stateProps.channel,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      isDisabled: ariaProps.isDisabled,
      channelName: ariaProps.channelName,
    }),
    () => state,
    () => trackRef ?? null,
  );

  const renderValues = createMemo<ColorSliderRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    channel: state.channel,
    value: state.getThumbValue(),
    color: state.value,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <ColorSliderContext.Provider
      value={{
        state,
        trackProps,
        thumbProps,
        inputProps,
        trackRef,
        setTrackRef,
      }}
    >
      <div
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled || undefined}
        data-dragging={state.isDragging || undefined}
        data-channel={state.channel}
      >
        <Show when={local.label}>
          <label {...labelProps}>{local.label}</label>
        </Show>

        {renderProps.renderChildren()}
      </div>
    </ColorSliderContext.Provider>
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

  const { state, trackProps, setTrackRef } = context;

  const renderValues = createMemo<ColorSliderTrackRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider-track",
    },
    renderValues,
  );

  const cleanTrackProps = () => {
    const { ref: _ref, style: _trackStyle, ...rest } = trackProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const trackStyle = (trackProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...trackStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      ref={setTrackRef}
      {...cleanTrackProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={state.isDisabled || undefined}
      data-dragging={state.isDragging || undefined}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * The thumb element of a color slider.
 */
export function ColorSliderThumb(props: ColorSliderThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ColorSliderContext);
  if (!context) {
    throw new Error("ColorSliderThumb must be used within a ColorSlider");
  }

  const { state, thumbProps, inputProps } = context;

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
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSlider-thumb",
    },
    renderValues,
  );

  const cleanThumbProps = () => {
    const { ref: _ref, style: _thumbStyle, ...rest } = thumbProps as Record<string, unknown>;
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
      inputProps as Record<string, unknown>,
      cleanFocusProps(),
    ) as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  const mergedStyle = () => {
    const thumbStyle = (thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...thumbStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      {...cleanThumbProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={state.isDisabled || undefined}
      data-dragging={state.isDragging || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
    >
      <input {...mergedInputProps()} />
      {renderProps.renderChildren()}
    </div>
  );
}

ColorSlider.Track = ColorSliderTrack;
ColorSlider.Thumb = ColorSliderThumb;

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

/**
 * A color area allows users to select a color using a 2D gradient.
 */
export function ColorArea(props: ColorAreaProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContextInternal);
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

  const colorAreaChildren = () => {
    const children = props.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  const renderProps = useRenderProps(
    {
      children: props.children,
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
    <ColorAreaContext.Provider
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
        data-disabled={state.isDisabled || undefined}
        data-dragging={state.isDragging || undefined}
      >
        {colorAreaChildren()}
      </div>
    </ColorAreaContext.Provider>
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
      children: props.children,
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
      data-disabled={state.isDisabled || undefined}
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
      children: props.children,
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
    return { ...thumbStyle, ...renderStyle };
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

  createEffect(() => {
    syncInputValue(xInputRef, state.getXValue());
  });

  createEffect(() => {
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
      data-disabled={state.isDisabled || undefined}
      data-dragging={state.isDragging || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
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

export interface ColorWheelRenderProps {
  /** Whether the wheel is disabled. */
  isDisabled: boolean;
  /** Whether the wheel is being dragged. */
  isDragging: boolean;
  /** The current hue value (0-360). */
  hue: number;
  /** The current color. */
  color: Color;
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
  /** Whether the thumb is focused. */
  isFocused: boolean;
  /** Whether the thumb has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the thumb is hovered. */
  isHovered: boolean;
}

export interface ColorWheelThumbProps extends SlotProps {
  /** The children of the thumb. */
  children?: RenderChildren<ColorWheelThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorWheelThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorWheelThumbRenderProps>;
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

/**
 * A color wheel allows users to select a hue using a circular control.
 */
export function ColorWheel(props: ColorWheelProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContextInternal);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    ["value", "defaultValue", "onChange", "onChangeEnd"],
    ["aria-label", "aria-labelledby", "aria-describedby", "isDisabled"],
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
  const { trackProps, thumbProps, inputProps } = createColorWheel(
    () => ({
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      isDisabled: ariaProps.isDisabled,
    }),
    () => state,
    () => wheelRef ?? null,
  );

  const renderValues = createMemo<ColorWheelRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    hue: state.getHue(),
    color: state.value,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
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
    <ColorWheelContext.Provider
      value={{
        state,
        trackProps,
        thumbProps,
        inputProps,
        wheelRef,
        setWheelRef,
      }}
    >
      <div
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled || undefined}
        data-dragging={state.isDragging || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </ColorWheelContext.Provider>
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

  const { state, trackProps, setWheelRef } = context;

  const renderValues = createMemo<ColorWheelTrackRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorWheel-track",
    },
    renderValues,
  );

  const cleanTrackProps = () => {
    const { ref: _ref, style: _trackStyle, ...rest } = trackProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const trackStyle = (trackProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...trackStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      ref={setWheelRef}
      {...cleanTrackProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={state.isDisabled || undefined}
      data-dragging={state.isDragging || undefined}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * The thumb element of a color wheel.
 */
export function ColorWheelThumb(props: ColorWheelThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ColorWheelContext);
  if (!context) {
    throw new Error("ColorWheelThumb must be used within a ColorWheel");
  }

  const { state, thumbProps, inputProps } = context;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorWheelThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorWheel-thumb",
    },
    renderValues,
  );

  const cleanThumbProps = () => {
    const { ref: _ref, style: _thumbStyle, ...rest } = thumbProps as Record<string, unknown>;
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
      inputProps as Record<string, unknown>,
      cleanFocusProps(),
    ) as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  const mergedStyle = () => {
    const thumbStyle = (thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...thumbStyle, ...renderStyle };
  };

  return (
    <div
      {...domProps}
      {...cleanThumbProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={state.isDisabled || undefined}
      data-dragging={state.isDragging || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
    >
      <input {...mergedInputProps()} />
      {renderProps.renderChildren()}
    </div>
  );
}

ColorWheel.Track = ColorWheelTrack;
ColorWheel.Thumb = ColorWheelThumb;

export interface ColorFieldRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the field is required. */
  isRequired: boolean;
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** The current color value (null if invalid). */
  color: Color | null;
  /** The color channel being edited, or "hex" for full color mode. */
  channel: ColorChannel | "hex";
}

export interface ColorFieldProps extends AriaColorFieldOptions, SlotProps {
  /** The current color value (controlled). */
  value?: Color | string | null;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color | null) => void;
  /** The color channel to edit (for single channel mode). */
  channel?: ColorChannel;
  /** The color space to use for channel mode. */
  colorSpace?: ColorSpace;
  /** The color format for parsing/displaying. */
  colorFormat?: ColorFormat;
  /** A visible label for the field. */
  label?: JSX.Element;
  /** Description text for the field. */
  description?: JSX.Element;
  /** Error message for the field. */
  errorMessage?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<ColorFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorFieldRenderProps>;
}

export interface ColorFieldInputRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** Whether the input is focused. */
  isFocused: boolean;
  /** Whether the input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the input is hovered. */
  isHovered: boolean;
}

export interface ColorFieldInputProps extends SlotProps {
  /** The children of the input (usually not used). */
  children?: RenderChildren<ColorFieldInputRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorFieldInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorFieldInputRenderProps>;
  /** Ref callback for the input element. */
  ref?: (element: HTMLInputElement) => void;
}

interface ColorFieldContextValue {
  state: ColorFieldState;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  setInputRef: (el: HTMLInputElement) => void;
  setLabelElement: (isPresent: boolean) => void;
}

export const ColorFieldContext = createContext<ColorFieldContextValue | null>(null);

/**
 * A color field allows users to enter a color value as text.
 */
export function ColorField(props: ColorFieldProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContextInternal);
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "label", "description", "errorMessage"],
    ["value", "defaultValue", "onChange", "channel", "colorSpace", "colorFormat"],
    [
      "id",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "aria-details",
      "aria-errormessage",
      "name",
      "form",
      "isWheelDisabled",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "isInvalid",
      "validationBehavior",
      "autoFocus",
      "excludeFromTabOrder",
      "placeholder",
    ],
  );
  const [hasRegisteredLabelElement, setHasRegisteredLabelElement] = createSignal(false);

  // Create color field state
  const state = createColorFieldState(() => ({
    value: stateProps.value ?? pickerContext?.value,
    defaultValue: stateProps.defaultValue,
    onChange:
      stateProps.onChange ??
      ((color) => {
        if (color) {
          pickerContext?.onChange?.(color);
        }
      }),
    channel: stateProps.channel,
    colorSpace: stateProps.colorSpace,
    colorFormat: stateProps.colorFormat,
    isDisabled: ariaProps.isDisabled,
    isReadOnly: ariaProps.isReadOnly,
    isInvalid: ariaProps.isInvalid,
    isRequired: ariaProps.isRequired,
  }));

  // Input ref
  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  // Create color field aria props
  const colorFieldAria = createColorField(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      "aria-details": ariaProps["aria-details"],
      "aria-errormessage": ariaProps["aria-errormessage"],
      name: ariaProps.name,
      form: ariaProps.form,
      isWheelDisabled: ariaProps.isWheelDisabled,
      isDisabled: ariaProps.isDisabled,
      isReadOnly: ariaProps.isReadOnly,
      isRequired: ariaProps.isRequired,
      isInvalid: ariaProps.isInvalid,
      validationBehavior: ariaProps.validationBehavior,
      autoFocus: ariaProps.autoFocus,
      excludeFromTabOrder: ariaProps.excludeFromTabOrder,
      placeholder: ariaProps.placeholder,
      channel: stateProps.channel,
      colorSpace: stateProps.colorSpace,
    }),
    () => state,
    () => inputRef ?? null,
  );

  const describedBy = () => {
    const invalid = ariaProps.isInvalid || state.isInvalid;
    const ids = [
      ariaProps["aria-describedby"],
      local.description && !invalid ? colorFieldAria.descriptionProps.id : undefined,
      invalid && local.errorMessage ? colorFieldAria.errorMessageProps.id : undefined,
    ];
    return ids.filter(Boolean).join(" ") || undefined;
  };

  const fieldInputProps = () => {
    const labelledBy =
      ariaProps["aria-labelledby"] ??
      (!ariaProps["aria-label"] && (local.label || hasRegisteredLabelElement())
        ? colorFieldAria.labelProps.id
        : undefined);
    return {
      ...colorFieldAria.inputProps,
      "aria-label": labelledBy ? undefined : colorFieldAria.inputProps["aria-label"],
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy(),
      "aria-errormessage":
        (ariaProps.isInvalid || state.isInvalid) && local.errorMessage
          ? colorFieldAria.errorMessageProps.id
          : colorFieldAria.inputProps["aria-errormessage"],
    } as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  const hiddenInputValue = createMemo(() =>
    Number.isNaN(state.numberValue) ? "" : String(state.numberValue),
  );

  const renderValues = createMemo<ColorFieldRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isRequired: state.isRequired,
    isInvalid: state.isInvalid,
    color: state.value,
    channel: state.channel ?? "hex",
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorField",
    },
    renderValues,
  );

  const childRenderValues: ColorFieldRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isReadOnly() {
      return state.isReadOnly;
    },
    get isRequired() {
      return state.isRequired;
    },
    get isInvalid() {
      return state.isInvalid;
    },
    get color() {
      return state.value;
    },
    get channel() {
      return state.channel ?? "hex";
    },
  };

  let hasRenderedChildren = false;
  let renderedChildren: JSX.Element;
  const renderChildren = () => {
    if (!hasRenderedChildren) {
      const children = local.children;
      renderedChildren =
        typeof children === "function" ? untrack(() => children(childRenderValues)) : children;
      hasRenderedChildren = true;
    }
    return renderedChildren;
  };

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <ColorFieldContext.Provider
      value={{
        state,
        get inputProps() {
          return fieldInputProps();
        },
        get labelProps() {
          return colorFieldAria.labelProps;
        },
        get descriptionProps() {
          return colorFieldAria.descriptionProps;
        },
        get errorMessageProps() {
          return colorFieldAria.errorMessageProps;
        },
        setInputRef,
        setLabelElement: setHasRegisteredLabelElement,
      }}
    >
      <>
        <div
          {...domProps()}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot ?? undefined}
          data-disabled={state.isDisabled || undefined}
          data-readonly={state.isReadOnly || undefined}
          data-invalid={state.isInvalid || undefined}
          data-required={state.isRequired || undefined}
          data-channel={state.channel ?? "hex"}
        >
          <Show when={local.label}>
            <label {...colorFieldAria.labelProps}>{local.label}</label>
          </Show>

          {renderChildren()}
        </div>
        <Show when={state.channel && ariaProps.name}>
          <input
            type="hidden"
            name={ariaProps.name}
            form={ariaProps.form}
            value={hiddenInputValue()}
          />
        </Show>
      </>
    </ColorFieldContext.Provider>
  );
}

/**
 * The input element of a color field.
 */
export function ColorFieldInput(props: ColorFieldInputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(ColorFieldContext);
  if (!context) {
    throw new Error("ColorFieldInput must be used within a ColorField");
  }

  const state = context.state;
  const inputValue = createMemo(() => state.inputValue);

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ColorFieldInputRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isInvalid,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorField-input",
    },
    renderValues,
  );

  const cleanInputProps = () => {
    const {
      ref: _ref,
      style: _inputStyle,
      value: _value,
      ...rest
    } = context.inputProps as Record<string, unknown>;
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

  return (
    <input
      {...domProps}
      {...cleanInputProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      ref={(el) => {
        context.setInputRef(el);
        local.ref?.(el);
      }}
      class={renderProps.class()}
      style={renderProps.style()}
      value={inputValue()}
      data-disabled={state.isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-invalid={state.isInvalid || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
    />
  );
}

ColorField.Input = ColorFieldInput;

export interface ColorSwatchRenderProps {
  /** The color being displayed. */
  color: Color;
  /** The color as a CSS string. */
  colorValue: string;
}

export interface ColorSwatchProps extends SlotProps {
  /** The color to display. */
  color?: Color | string;
  /** Accessible label for the swatch. */
  "aria-label"?: string;
  /** The children of the component. */
  children?: RenderChildren<ColorSwatchRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchRenderProps>;
}

/**
 * A color swatch displays a preview of a color.
 */
export function ColorSwatch(props: ColorSwatchProps): JSX.Element {
  const swatchContext = useContext(ColorSwatchContextInternal);
  const pickerContext = useContext(ColorPickerContextInternal);
  const [local, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "color"],
    ["aria-label"],
  );

  const resolvedColor = createMemo<Color | string>(() => {
    return local.color ?? swatchContext?.color ?? pickerContext?.value ?? "#0000";
  });

  // Create color swatch aria props
  const { swatchProps } = createColorSwatch(() => ({
    color: resolvedColor(),
    "aria-label": ariaProps["aria-label"],
  }));

  // Normalize color
  const color = createMemo(() => normalizeColor(resolvedColor()));

  const renderValues = createMemo<ColorSwatchRenderProps>(() => ({
    color: color(),
    colorValue: color().toString("css"),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatch",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const cleanSwatchProps = () => {
    const { ref: _ref, style: _swatchStyle, ...rest } = swatchProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = () => {
    const swatchStyle = (swatchProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...swatchStyle, ...renderStyle };
  };

  return (
    <div {...domProps()} {...cleanSwatchProps()} class={renderProps.class()} style={mergedStyle()}>
      {renderProps.renderChildren()}
    </div>
  );
}

export const ColorSliderStateContext = ColorSliderContext;
export const ColorAreaStateContext = ColorAreaContext;
export const ColorWheelStateContext = ColorWheelContext;
export const ColorWheelTrackContext = ColorWheelContext;
export const ColorFieldStateContext = ColorFieldContext;
export const ColorSwatchContext = ColorSwatchContextInternal;
export const ColorPickerContext = ColorPickerContextInternal;
export const ColorPickerStateContext = ColorPickerStateContextInternal;
export const ColorSwatchPickerContext = ColorSwatchPickerContextInternal;
export const ColorThumb = ColorSliderThumb;

export interface ColorPickerRenderProps {
  /** The currently selected color. */
  color: Color;
}

export interface ColorPickerProps extends SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** The children of the color picker. */
  children?: RenderChildren<ColorPickerRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorPickerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorPickerRenderProps>;
}

export interface ColorSwatchPickerRenderProps {
  /** Whether the swatch picker has focus. */
  isFocused: boolean;
  /** Whether the swatch picker has keyboard focus. */
  isFocusVisible: boolean;
  /** The currently selected color. */
  selectedColor: Color;
  /** Item arrangement mode. */
  layout: "grid" | "stack";
}

export interface ColorSwatchPickerProps extends SlotProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the selected color changes. */
  onChange?: (color: Color) => void;
  /** Accessible label for the swatch picker. */
  "aria-label"?: string;
  /** ID of element that labels the swatch picker. */
  "aria-labelledby"?: string;
  /** ID of element that describes the swatch picker. */
  "aria-describedby"?: string;
  /** Whether swatches are arranged as a grid or stack. */
  layout?: "grid" | "stack";
  /** The children (ColorSwatchPickerItem elements). */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchPickerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchPickerRenderProps>;
}

export interface ColorSwatchPickerItemRenderProps {
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is focused. */
  isFocused: boolean;
  /** Whether the item has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** The color represented by the item. */
  color: Color;
}

export interface ColorSwatchPickerItemProps extends SlotProps {
  /** The color represented by this swatch item. */
  color: Color | string;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** Accessible label for this item. */
  "aria-label"?: string;
  /** The children of the swatch item. */
  children?: RenderChildren<ColorSwatchPickerItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchPickerItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchPickerItemRenderProps>;
}

export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const [local] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "children",
    "class",
    "style",
    "slot",
  ]);

  const [internalColor, setInternalColor] = createSignal<Color>(
    normalizeColor(local.defaultValue ?? "#ff0000"),
  );

  const color = createMemo<Color>(() => {
    if (local.value !== undefined) {
      return normalizeColor(local.value);
    }
    return internalColor();
  });

  const setColor = (nextColor: Color) => {
    if (local.value === undefined) {
      setInternalColor(nextColor);
    }
    local.onChange?.(nextColor);
  };

  const renderValues = createMemo<ColorPickerRenderProps>(() => ({
    color: color(),
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorPicker",
    },
    renderValues,
  );

  return (
    <ColorPickerStateContextInternal.Provider
      value={{
        color: () => color(),
        setColor,
      }}
    >
      <ColorPickerContextInternal.Provider
        value={{
          get value() {
            return color();
          },
          onChange: setColor,
        }}
      >
        <div class={renderProps.class()} style={renderProps.style()}>
          {renderProps.renderChildren()}
        </div>
      </ColorPickerContextInternal.Provider>
    </ColorPickerStateContextInternal.Provider>
  );
}

export function ColorSwatchPicker(props: ColorSwatchPickerProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContextInternal);
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "layout",
    "children",
    "class",
    "style",
    "slot",
  ]);

  const [itemMap, setItemMap] = createSignal<Map<string, ColorSwatchPickerItemData>>(new Map());
  const [itemOrder, setItemOrder] = createSignal<string[]>([]);
  const [internalColor, setInternalColor] = createSignal<Color>(
    normalizeColor(local.defaultValue ?? pickerContext?.value ?? "#ff0000"),
  );

  const selectedColor = createMemo<Color>(() => {
    if (local.value !== undefined) {
      return normalizeColor(local.value);
    }
    if (pickerContext?.value !== undefined) {
      return normalizeColor(pickerContext.value);
    }
    return internalColor();
  });

  const selectedKey = createMemo(() => selectedColor().toString("hexa"));
  const isControlled = createMemo(
    () => local.value !== undefined || pickerContext?.value !== undefined,
  );

  const registerItem = (item: ColorSwatchPickerItemData) => {
    setItemMap((prev) => {
      const next = new Map(prev);
      next.set(item.key, item);
      return next;
    });
    setItemOrder((prev) => (prev.includes(item.key) ? prev : [...prev, item.key]));
  };

  const unregisterItem = (key: string) => {
    setItemMap((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    setItemOrder((prev) => prev.filter((itemKey) => itemKey !== key));
  };

  const items = createMemo(() => {
    const map = itemMap();
    return itemOrder()
      .map((key) => map.get(key))
      .filter((item): item is ColorSwatchPickerItemData => item != null);
  });

  const state = createListState<ColorSwatchPickerItemData>({
    get items() {
      return items();
    },
    get getKey() {
      return (item: ColorSwatchPickerItemData) => item.key;
    },
    get getTextValue() {
      return (item: ColorSwatchPickerItemData) => item.textValue;
    },
    get getDisabled() {
      return (item: ColorSwatchPickerItemData) => !!item.isDisabled;
    },
    selectionMode: "single",
    disallowEmptySelection: true,
    get selectedKeys() {
      return [selectedKey()];
    },
    onSelectionChange(keys) {
      if (keys === "all") return;
      const key = keys.values().next().value as string | undefined;
      if (!key) return;
      const item = itemMap().get(key);
      if (!item) return;
      if (!isControlled()) {
        setInternalColor(item.color);
      }
      (local.onChange ?? pickerContext?.onChange)?.(item.color);
    },
  });

  const listBoxAria = createListBox(
    () => ({
      "aria-label":
        local["aria-label"] ?? (!local["aria-labelledby"] ? "Color swatch picker" : undefined),
      "aria-labelledby": local["aria-labelledby"],
      "aria-describedby": local["aria-describedby"],
      shouldFocusWrap: true,
    }),
    state,
  );

  const resolveDirection = (): "ltr" | "rtl" => {
    if (typeof document === "undefined") return "ltr";
    const rootDir = document.dir;
    return rootDir === "rtl" ? "rtl" : "ltr";
  };

  const findNextEnabledKey = (from: Key | null, direction: "next" | "prev") => {
    const collection = state.collection();
    const getAdjacent =
      direction === "next"
        ? (key: Key) => collection.getKeyAfter(key)
        : (key: Key) => collection.getKeyBefore(key);
    const getBoundary =
      direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

    let key = from != null ? getAdjacent(from) : getBoundary();
    while (key != null && state.isDisabled(key)) {
      key = getAdjacent(key);
    }

    return key;
  };

  const getBoundaryEnabledKey = (direction: "next" | "prev") => {
    const collection = state.collection();
    const getAdjacent =
      direction === "next"
        ? (key: Key) => collection.getKeyAfter(key)
        : (key: Key) => collection.getKeyBefore(key);
    const getBoundary =
      direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

    let key = getBoundary();
    while (key != null && state.isDisabled(key)) {
      key = getAdjacent(key);
    }

    return key;
  };

  const getOptionElementForKey = (
    listbox: HTMLElement | null,
    key: Key | null,
  ): HTMLElement | null => {
    if (!listbox || key == null) return null;
    const keyString = String(key);
    for (const optionElement of listbox.querySelectorAll<HTMLElement>('[role="option"]')) {
      if (optionElement.id === keyString) {
        return optionElement;
      }
    }
    return null;
  };

  const findGridKey = (
    listbox: HTMLElement | null,
    key: Key,
    nextKey: (current: Key) => Key | null,
    shouldSkip: (prevRect: DOMRect, itemRect: DOMRect) => boolean,
  ): Key | null => {
    let candidate: Key | null = key;
    const previousRect = getOptionElementForKey(listbox, candidate)?.getBoundingClientRect();
    if (!previousRect) {
      return null;
    }

    while (candidate != null) {
      candidate = nextKey(candidate);
      if (candidate == null) {
        return null;
      }

      const itemRect = getOptionElementForKey(listbox, candidate)?.getBoundingClientRect();
      if (!itemRect) {
        return null;
      }

      if (!shouldSkip(previousRect, itemRect)) {
        return candidate;
      }
    }

    return null;
  };

  const isSameRow = (prevRect: DOMRect, itemRect: DOMRect) =>
    prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  const getGridKeyBelow = (listbox: HTMLElement | null, key: Key) =>
    findGridKey(listbox, key, (current) => findNextEnabledKey(current, "next"), isSameRow);
  const getGridKeyAbove = (listbox: HTMLElement | null, key: Key) =>
    findGridKey(listbox, key, (current) => findNextEnabledKey(current, "prev"), isSameRow);
  const getGridKeyRightOf = (key: Key) =>
    resolveDirection() === "rtl"
      ? findNextEnabledKey(key, "prev")
      : findNextEnabledKey(key, "next");
  const getGridKeyLeftOf = (key: Key) =>
    resolveDirection() === "rtl"
      ? findNextEnabledKey(key, "next")
      : findNextEnabledKey(key, "prev");

  const handleGridKeyDown = (e: KeyboardEvent): boolean => {
    if ((local.layout ?? "grid") !== "grid") return false;
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowDown" &&
      e.key !== "ArrowUp"
    ) {
      return false;
    }

    const listbox = e.currentTarget as HTMLElement | null;
    const focusedKey = state.focusedKey();
    const initialKey =
      focusedKey ??
      (e.key === "ArrowUp" || e.key === "ArrowLeft"
        ? getBoundaryEnabledKey("prev")
        : getBoundaryEnabledKey("next"));
    if (initialKey == null) return false;

    let nextKey: Key | null = null;
    switch (e.key) {
      case "ArrowDown":
        nextKey = getGridKeyBelow(listbox, initialKey) ?? getBoundaryEnabledKey("next");
        break;
      case "ArrowUp":
        nextKey = getGridKeyAbove(listbox, initialKey) ?? getBoundaryEnabledKey("prev");
        break;
      case "ArrowRight":
        nextKey =
          getGridKeyRightOf(initialKey) ??
          (resolveDirection() === "rtl"
            ? getBoundaryEnabledKey("prev")
            : getBoundaryEnabledKey("next"));
        break;
      case "ArrowLeft":
        nextKey =
          getGridKeyLeftOf(initialKey) ??
          (resolveDirection() === "rtl"
            ? getBoundaryEnabledKey("next")
            : getBoundaryEnabledKey("prev"));
        break;
    }

    if (nextKey == null) return false;

    state.setFocusedKey(nextKey);
    if (state.selectionMode() === "single") {
      state.replaceSelection(nextKey);
    }

    e.preventDefault();
    e.stopPropagation();
    return true;
  };

  const getListBoxKeyDown = () => {
    const props = listBoxAria.listBoxProps as Record<string, unknown>;
    return props.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined;
  };

  const onColorSwatchPickerKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (handleGridKeyDown(e)) {
      return;
    }
    getListBoxKeyDown()?.(e);
  };

  createEffect(() => {
    const key = selectedKey();
    if (key) {
      state.setFocusedKey(key);
    }
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing({ within: true });
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const renderValues = createMemo<ColorSwatchPickerRenderProps>(() => ({
    isFocused: state.isFocused() || isFocused(),
    isFocusVisible: isFocusVisible(),
    selectedColor: selectedColor(),
    layout: local.layout ?? "grid",
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatchPicker",
    },
    renderValues,
  );

  const cleanListBoxProps = () => {
    const {
      ref: _ref,
      onKeyDown: _onKeyDown,
      ...restListBoxProps
    } = listBoxAria.listBoxProps as Record<string, unknown>;
    return restListBoxProps;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...restFocusProps } = focusProps as Record<string, unknown>;
    return restFocusProps;
  };

  return (
    <ColorSwatchPickerContextInternal.Provider
      value={{
        state,
        registerItem,
        unregisterItem,
      }}
    >
      <div
        {...mergeProps(domProps(), cleanListBoxProps(), cleanFocusProps(), {
          onKeyDown: onColorSwatchPickerKeyDown,
        })}
        class={renderProps.class()}
        style={renderProps.style()}
        data-focused={state.isFocused() || undefined}
        data-focus-visible={isFocusVisible() || undefined}
        data-layout={local.layout ?? "grid"}
      >
        {local.children}
      </div>
    </ColorSwatchPickerContextInternal.Provider>
  );
}

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps): JSX.Element {
  const context = useContext(ColorSwatchPickerContextInternal);
  if (!context) {
    throw new Error("ColorSwatchPickerItem must be used within a ColorSwatchPicker");
  }

  const [local, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "color"],
    ["isDisabled", "aria-label"],
  );

  const color = createMemo(() => normalizeColor(local.color));
  const key = createMemo(() => color().toString("hexa"));
  const textValue = createMemo(() => {
    const locale = globalThis.navigator?.language ?? "en-US";
    return color().getColorName(locale);
  });

  createEffect(() => {
    const itemKey = key();
    context.registerItem({
      key: itemKey,
      color: color(),
      textValue: textValue(),
      isDisabled: ariaProps.isDisabled,
    });
    onCleanup(() => context.unregisterItem(itemKey));
  });

  const optionAria = createOption(
    () => ({
      key: key(),
      isDisabled: ariaProps.isDisabled,
      "aria-label": ariaProps["aria-label"] ?? textValue(),
    }),
    context.state,
  );

  const renderValues = createMemo<ColorSwatchPickerItemRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: optionAria.isFocusVisible(),
    isPressed: optionAria.isPressed(),
    isDisabled: optionAria.isDisabled(),
    color: color(),
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatchPickerItem",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const cleanOptionProps = () => {
    const { ref: _ref, ...restOptionProps } = optionAria.optionProps as Record<string, unknown>;
    return restOptionProps;
  };

  return (
    <div
      {...mergeProps(domProps(), cleanOptionProps())}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      <ColorSwatchContextInternal.Provider value={{ color: color() }}>
        {renderProps.children ? renderProps.renderChildren() : <ColorSwatch />}
      </ColorSwatchContextInternal.Provider>
    </div>
  );
}
