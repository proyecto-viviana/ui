/**
 * Slider component for solidaria-components
 *
 * A pre-wired headless slider that combines state + aria hooks.
 * Port of react-aria-components/src/Slider.tsx
 */

import { type JSX, createContext, createMemo, splitProps, useContext, Show } from "solid-js";
import {
  createSlider,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaSliderProps,
} from "@proyecto-viviana/solidaria";
import {
  createSliderState,
  type SliderState,
  type SliderOrientation,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { VisuallyHidden } from "./VisuallyHidden";

export interface SliderRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider is being dragged. */
  isDragging: boolean;
  /** Whether the slider is focused. */
  isFocused: boolean;
  /** The current value. */
  value: number;
  /** The value as a percent (0-1). */
  valuePercent: number;
  /** The orientation. */
  orientation: SliderOrientation;
}

export interface SliderProps extends Omit<AriaSliderProps, "label">, SlotProps {
  /** The current value (controlled). */
  value?: number;
  /** The default value (uncontrolled). */
  defaultValue?: number;
  /** Handler called when the value changes. */
  onChange?: (value: number) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (value: number) => void;
  /** The minimum value. */
  minValue?: number;
  /** The maximum value. */
  maxValue?: number;
  /** The step value. */
  step?: number;
  /** The orientation of the slider. */
  orientation?: SliderOrientation;
  /** The locale for number formatting. */
  locale?: string;
  /** Number format options. */
  formatOptions?: Intl.NumberFormatOptions;
  /** A visible label for the slider. */
  label?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<SliderRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderRenderProps>;
  /** Ref for the slider root element. */
  ref?: (el: HTMLDivElement) => void;
}

export interface SliderTrackRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider is being dragged. */
  isDragging: boolean;
  /** The value as a percent (0-1). */
  valuePercent: number;
  /** The orientation. */
  orientation: SliderOrientation;
}

export interface SliderTrackProps
  extends SlotProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
  /** The children of the track. */
  children?: RenderChildren<SliderTrackRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderTrackRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderTrackRenderProps>;
}

export interface SliderThumbRenderProps {
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
  /** The current value. */
  value: number;
  /** The value as a percent (0-1). */
  valuePercent: number;
}

export interface SliderThumbProps
  extends SlotProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
  /** The children of the thumb. */
  children?: RenderChildren<SliderThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderThumbRenderProps>;
}

export interface SliderOutputRenderProps {
  /** The current value. */
  value: number;
  /** The formatted value string. */
  formattedValue: string;
}

export interface SliderOutputProps
  extends SlotProps, Omit<JSX.HTMLAttributes<HTMLElement>, "class" | "style" | "children"> {
  /** The children of the output. */
  children?: RenderChildren<SliderOutputRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderOutputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderOutputRenderProps>;
}

interface SliderContextValue {
  state: SliderState;
  trackProps: JSX.HTMLAttributes<HTMLElement>;
  thumbProps: JSX.HTMLAttributes<HTMLElement>;
  outputProps: JSX.HTMLAttributes<HTMLElement>;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  trackRef: HTMLElement | undefined;
  setTrackRef: (el: HTMLElement) => void;
  inputRef: HTMLInputElement | undefined;
  setInputRef: (el: HTMLInputElement) => void;
}

export const SliderContext = createContext<SliderContextValue | null>(null);
export const SliderStateContext = SliderContext;
export const SliderTrackContext = SliderContext;
export const SliderOutputContext = SliderContext;

/**
 * A slider allows users to select a value from a range.
 */
export function Slider(props: SliderProps): JSX.Element {
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["class", "style", "slot", "ref"],
    [
      "value",
      "defaultValue",
      "onChange",
      "onChangeEnd",
      "minValue",
      "maxValue",
      "step",
      "orientation",
      "locale",
      "formatOptions",
    ],
    [
      "label",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "isDisabled",
      "id",
      "name",
      "form",
    ],
  );

  const state = createSliderState({
    get value() {
      return stateProps.value;
    },
    get defaultValue() {
      return stateProps.defaultValue;
    },
    get onChange() {
      return stateProps.onChange;
    },
    get onChangeEnd() {
      return stateProps.onChangeEnd;
    },
    get minValue() {
      return stateProps.minValue;
    },
    get maxValue() {
      return stateProps.maxValue;
    },
    get step() {
      return stateProps.step;
    },
    get orientation() {
      return stateProps.orientation;
    },
    get locale() {
      return stateProps.locale;
    },
    get formatOptions() {
      return stateProps.formatOptions;
    },
    get isDisabled() {
      return ariaProps.isDisabled;
    },
  });

  let trackRef: HTMLElement | undefined;
  const setTrackRef = (el: HTMLElement) => {
    trackRef = el;
  };
  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  const sliderAria = createSlider(
    ariaProps,
    state,
    () => trackRef ?? null,
    () => inputRef ?? null,
  );

  const renderValues = createMemo<SliderRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging(),
    isFocused: state.isFocused(),
    value: state.value(),
    valuePercent: state.getValuePercent(),
    orientation: state.orientation,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Slider",
    },
    renderValues,
  );

  const childRenderValues: SliderRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isDragging() {
      return state.isDragging();
    },
    get isFocused() {
      return state.isFocused();
    },
    get value() {
      return state.value();
    },
    get valuePercent() {
      return state.getValuePercent();
    },
    get orientation() {
      return state.orientation;
    },
  };

  const sliderChildren = () => {
    const children = props.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const cleanGroupProps = () => {
    const { ref: _ref, ...rest } = sliderAria.groupProps as Record<string, unknown>;
    return rest;
  };

  return (
    <SliderContext.Provider
      value={{
        state,
        get trackProps() {
          return sliderAria.trackProps;
        },
        get thumbProps() {
          return sliderAria.thumbProps;
        },
        get outputProps() {
          return sliderAria.outputProps;
        },
        get inputProps() {
          return sliderAria.inputProps;
        },
        get trackRef() {
          return trackRef;
        },
        setTrackRef,
        get inputRef() {
          return inputRef;
        },
        setInputRef,
      }}
    >
      <div
        {...domProps()}
        {...cleanGroupProps()}
        ref={local.ref}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled || undefined}
        data-orientation={state.orientation}
        data-dragging={state.isDragging() || undefined}
      >
        <Show when={ariaProps.label}>
          <span {...sliderAria.labelProps}>{ariaProps.label}</span>
        </Show>

        {sliderChildren()}
      </div>
    </SliderContext.Provider>
  );
}

/**
 * The track element of a slider.
 */
export function SliderTrack(props: SliderTrackProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderTrack must be used within a Slider");
  }

  const { state, setTrackRef } = context;

  const renderValues = createMemo<SliderTrackRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging(),
    valuePercent: state.getValuePercent(),
    orientation: state.orientation,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Slider-track",
    },
    renderValues,
  );

  const cleanTrackProps = () => {
    const { ref: _ref, style: trackStyle, ...rest } = context.trackProps as Record<string, unknown>;
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
      ref={setTrackRef}
      {...cleanTrackProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={state.isDisabled || undefined}
      data-orientation={state.orientation}
      data-dragging={state.isDragging() || undefined}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * The thumb element of a slider.
 */
export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderThumb must be used within a Slider");
  }

  const { state, setInputRef } = context;

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<SliderThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isDragging(),
    isFocused: isFocused() || state.isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    value: state.value(),
    valuePercent: state.getValuePercent(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Slider-thumb",
    },
    renderValues,
  );

  const cleanThumbProps = () => {
    const { ref: _ref, style: thumbStyle, ...rest } = context.thumbProps as Record<string, unknown>;
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

  const mergedStyle = () => {
    const thumbStyle = (context.thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...thumbStyle, ...renderStyle };
  };
  const cleanInputProps = () => {
    const { ref: _ref, ...rest } = context.inputProps as Record<string, unknown>;
    return rest;
  };
  const mergedInputProps = () =>
    mergeProps(
      cleanInputProps() as Record<string, unknown>,
      cleanFocusProps() as Record<string, unknown>,
    ) as JSX.InputHTMLAttributes<HTMLInputElement>;

  return (
    <>
      <VisuallyHidden>
        <input ref={setInputRef} {...mergedInputProps()} />
      </VisuallyHidden>
      <div
        {...domProps}
        {...cleanThumbProps()}
        {...cleanHoverProps()}
        class={renderProps.class()}
        style={mergedStyle()}
        data-disabled={state.isDisabled || undefined}
        data-dragging={state.isDragging() || undefined}
        data-focused={isFocused() || state.isFocused() || undefined}
        data-focus-visible={isFocusVisible() || undefined}
        data-hovered={isHovered() || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </>
  );
}

/**
 * The output element of a slider, displaying the current value.
 */
export function SliderOutput(props: SliderOutputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderOutput must be used within a Slider");
  }

  const { state } = context;

  const renderValues = createMemo<SliderOutputRenderProps>(() => ({
    value: state.value(),
    formattedValue: state.getFormattedValue(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Slider-output",
    },
    renderValues,
  );

  const cleanDomProps = () => {
    const { ref: _ref, ...rest } = domProps as Record<string, unknown>;
    return rest;
  };
  const cleanOutputProps = () => {
    const { ref: _ref, ...rest } = context.outputProps as Record<string, unknown>;
    return rest;
  };

  const renderedChildren = () => {
    // Check if raw children prop exists before calling renderChildren
    if (renderProps.children === undefined || renderProps.children === null) {
      return state.getFormattedValue();
    }
    return renderProps.renderChildren();
  };

  return (
    <output
      {...cleanDomProps()}
      {...cleanOutputProps()}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      {renderedChildren()}
    </output>
  );
}

Slider.Track = SliderTrack;
Slider.Thumb = SliderThumb;
Slider.Output = SliderOutput;
