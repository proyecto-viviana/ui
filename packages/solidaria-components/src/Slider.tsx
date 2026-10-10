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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Slider.tsx

/**
 * Slider component for solidaria-components
 *
 * A pre-wired headless slider that combines state + aria hooks.
 * Solid adaptation of the pinned Slider component.
 */

import {
  createContext,
  createMemo,
  createSignal,
  createEffect,
  onCleanup,
  useContext,
  untrack,
  Show,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createSlider,
  createSliderThumb,
  createId,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaSliderProps,
  type HoverEvents,
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
  dataAttr,
  coerceDomRecord,
  useSlot,
  evaluateRenderChildren,
} from "./utils";
import { LabelContext, type LabelProps } from "./Label";
import { VisuallyHidden } from "./VisuallyHidden";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

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

export interface SliderProps<T extends number | number[] = number>
  extends Omit<AriaSliderProps, "label">, SlotProps {
  /** The current value (controlled). */
  value?: T;
  /** The default value (uncontrolled). */
  defaultValue?: T;
  /** Handler called when the value changes. */
  onChange?: (value: T) => void;
  /** Handler called when dragging ends. */
  onChangeEnd?: (value: T) => void;
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
  index?: number;
  name?: string;
  form?: string;
  /** The children of the thumb. */
  children?: RenderChildren<SliderThumbRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderThumbRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderThumbRenderProps>;
}

export interface SliderFillRenderProps {
  /** Whether the slider is disabled. */
  isDisabled: boolean;
  /** Whether the slider fill is currently hovered with a mouse. */
  isHovered: boolean;
  /** The value as a percent (0-1). */
  valuePercent: number;
  /** The orientation. */
  orientation: SliderOrientation;
}

export interface SliderFillProps
  extends
    SlotProps,
    HoverEvents,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
  /** The offset from which to start the fill. Defaults to the slider's minValue. */
  offset?: number;
  /** The children of the fill. */
  children?: RenderChildren<SliderFillRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SliderFillRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SliderFillRenderProps>;
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

// Clearing is an internal root-owner operation. Keep the public context setter
// narrow so existing custom providers remain assignable under strictFunctionTypes.
const sliderInputRefOwners = new WeakMap<
  SliderState,
  { clear: (element: HTMLInputElement) => void }
>();

export const SliderContext = createContext<SliderContextValue | null>(null);
export const SliderStateContext = SliderContext;
export const SliderTrackContext = SliderContext;
export const SliderFillContext = SliderContext;
export const SliderOutputContext = SliderContext;

/**
 * A slider allows users to select a value from a range.
 */
function arraySlider(
  props: SliderProps | (SliderProps<number[]> & ({ value: number[] } | { defaultValue: number[] })),
): props is SliderProps<number[]> & ({ value: number[] } | { defaultValue: number[] }) {
  return Array.isArray(props.value) || Array.isArray(props.defaultValue);
}
interface SliderComponent {
  (props: SliderProps<number[]> & ({ value: number[] } | { defaultValue: number[] })): JSX.Element;
  (props: SliderProps): JSX.Element;
  Track: typeof SliderTrack;
  Thumb: typeof SliderThumb;
  Fill: typeof SliderFill;
  Output: typeof SliderOutput;
}
export const Slider: SliderComponent = ((
  props: SliderProps | (SliderProps<number[]> & ({ value: number[] } | { defaultValue: number[] })),
): JSX.Element => {
  const [local, , ariaProps, rest] = splitProps(
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
      "aria-details",
      "isDisabled",
      "id",
      "name",
      "form",
    ],
  );

  const state = arraySlider(props) ? createSliderState(props) : createSliderState(props);

  const [trackRef, setTrackRef] = createSignal<HTMLElement>();
  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();
  const inputRefOwner = {
    clear: (element: HTMLInputElement) => {
      setInputRef((current) => (current === element ? undefined : current));
    },
  };
  sliderInputRefOwners.set(state, inputRefOwner);
  onCleanup(() => {
    if (sliderInputRefOwners.get(state) === inputRefOwner) sliderInputRefOwners.delete(state);
  });

  const hasExplicitLabel = () => Boolean(ariaProps["aria-label"] || ariaProps["aria-labelledby"]);
  // A string `label` names the slider through the built-in span. Slot detection
  // starts only when that string and an explicit aria name are both absent.
  const [labelRef, hasLabel] = useSlot(!hasExplicitLabel() && !ariaProps.label);

  const sliderAria = createSlider(
    {
      get label() {
        return hasExplicitLabel() ? undefined : (ariaProps.label ?? hasLabel());
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
      get isDisabled() {
        return ariaProps.isDisabled;
      },
      get id() {
        return ariaProps.id;
      },
      get name() {
        return ariaProps.name;
      },
      get form() {
        return ariaProps.form;
      },
    },
    state,
    () => trackRef() ?? null,
    () => inputRef() ?? null,
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
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
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

  const sliderChildren = () =>
    untrack(() => evaluateRenderChildren(props.children, childRenderValues));

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const labelContextValue: LabelProps = {
    get id() {
      return hasExplicitLabel() || ariaProps.label
        ? undefined
        : (sliderAria.labelProps.id as string | undefined);
    },
    ref: labelRef,
    onClick: (event) => {
      const handler = sliderAria.labelProps.onClick;
      if (typeof handler === "function") handler(event);
    },
  };

  const cleanGroupProps = () => {
    const { ref: _ref, ...rest } = sliderAria.groupProps as Record<string, unknown>;
    return rest;
  };

  return (
    <SliderContext
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
          return trackRef();
        },
        setTrackRef,
        get inputRef() {
          return inputRef();
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
        data-disabled={dataAttr(state.isDisabled)}
        data-orientation={state.orientation}
        data-dragging={dataAttr(state.isDragging())}
      >
        <Show when={ariaProps.label}>
          <span {...sliderAria.labelProps}>{ariaProps.label}</span>
        </Show>
        <LabelContext value={labelContextValue}>{sliderChildren()}</LabelContext>
      </div>
    </SliderContext>
  );
}) as SliderComponent;

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
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
      defaultClassName: "solidaria-Slider-track",
    },
    renderValues,
  );

  const childRenderValues: SliderTrackRenderProps = {
    get isDisabled() {
      return state.isDisabled;
    },
    get isDragging() {
      return state.isDragging();
    },
    get valuePercent() {
      return state.getValuePercent();
    },
    get orientation() {
      return state.orientation;
    },
  };
  // Invoke the child thunk here so insertion cannot track descendant setup reads.
  const trackChildren = () =>
    untrack(() => evaluateRenderChildren(props.children, childRenderValues));

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
      data-disabled={dataAttr(state.isDisabled)}
      data-orientation={state.orientation}
      data-dragging={dataAttr(state.isDragging())}
    >
      {trackChildren()}
    </div>
  );
}

/**
 * The thumb element of a slider.
 */
export function SliderThumb(props: SliderThumbProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "children",
    "index",
    "name",
    "form",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "role",
    "tabindex",
    "onKeyDown",
    "onFocus",
    "onBlur",
  ]);

  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderThumb must be used within a Slider");
  }

  const { state } = context;
  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();
  const index = () => local.index ?? 0;
  const thumbLabelId = createId();
  const [thumbLabelRef, hasThumbLabel] = useSlot(!local["aria-label"] && !local["aria-labelledby"]);
  const thumbAria = createSliderThumb(
    () => ({
      index: index(),
      id: typeof local.id === "string" ? local.id : undefined,
      name: local.name,
      form: local.form,
      "aria-label": typeof local["aria-label"] === "string" ? local["aria-label"] : undefined,
      "aria-labelledby":
        typeof local["aria-labelledby"] === "string"
          ? local["aria-labelledby"]
          : local["aria-labelledby"] == null && hasThumbLabel()
            ? thumbLabelId
            : undefined,
      "aria-describedby":
        typeof local["aria-describedby"] === "string" ? local["aria-describedby"] : undefined,
      "aria-details": typeof local["aria-details"] === "string" ? local["aria-details"] : undefined,
    }),
    state,
    () => context.trackRef ?? null,
    () => inputRef() ?? null,
  );
  const registerInput = (el: HTMLInputElement) => {
    setInputRef(el);
  };

  createEffect(
    () => ({ index: index(), element: inputRef() }),
    ({ index: currentIndex, element }) => {
      if (currentIndex !== 0 || !element) return;
      context.setInputRef(element);
      return () => {
        sliderInputRefOwners.get(state)?.clear(element);
      };
    },
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<SliderThumbRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isDragging: state.isThumbDragging(index()),
    isFocused: isFocused() || state.focusedThumb() === index(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    value: state.getThumbValue(index()),
    valuePercent: state.getThumbPercent(index()),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
      defaultClassName: "solidaria-Slider-thumb",
    },
    renderValues,
  );

  const cleanThumbProps = () => {
    const {
      ref: _ref,
      style: thumbStyle,
      ...rest
    } = thumbAria.thumbProps as Record<string, unknown>;
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
    const thumbStyle = (thumbAria.thumbProps as { style?: Record<string, string> }).style || {};
    const renderStyle = renderProps.style() || {};
    return { ...thumbStyle, ...renderStyle };
  };
  const cleanInputProps = () => {
    const { ref: _ref, ...rest } = thumbAria.inputProps as Record<string, unknown>;
    return rest;
  };
  const mergedInputProps = () =>
    mergeProps(
      cleanInputProps() as Record<string, unknown>,
      cleanFocusProps() as Record<string, unknown>,
      { onKeyDown: local.onKeyDown, onFocus: local.onFocus, onBlur: local.onBlur },
    ) as JSX.InputHTMLAttributes<HTMLInputElement>;

  return (
    <div
      {...domProps}
      {...coerceDomRecord(cleanThumbProps() as Record<string, unknown>)}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={mergedStyle()}
      data-disabled={dataAttr(state.isDisabled)}
      data-dragging={dataAttr(state.isThumbDragging(index()))}
      data-focused={dataAttr(isFocused() || state.focusedThumb() === index())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-hovered={dataAttr(isHovered())}
    >
      <VisuallyHidden>
        <input ref={registerInput} {...mergedInputProps()} />
      </VisuallyHidden>
      <LabelContext
        value={{
          get id() {
            return hasThumbLabel() ? thumbLabelId : undefined;
          },
          ref: thumbLabelRef,
        }}
      >
        {renderProps.renderChildren()}
      </LabelContext>
    </div>
  );
}

/** Clamp a value between min and max (mirror of upstream's number/clamp). */
function clampFill(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The fill element of a slider, displaying the selected range.
 *
 * Solid adaptation of the pinned `SliderFill`. Upstream reads the
 * array-based state. Two thumbs fill between their selected values; a scalar
 * fills from the clamped offset to index 0. Numeric render props remain the
 * index 0 compatibility view.
 */
export function SliderFill(props: SliderFillProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "offset",
    "children",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
  ]);

  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("SliderFill must be used within a Slider");
  }

  const { state } = context;

  const { isHovered, hoverProps } = createHover(() => ({
    onHoverStart: local.onHoverStart,
    onHoverEnd: local.onHoverEnd,
    onHoverChange: local.onHoverChange,
  }));

  // Percent (0-100) of an arbitrary value within the track — mirrors
  // SliderState.getValuePercent's formula for a value other than the current one.
  const percentOf = (value: number) => {
    const range = state.maxValue - state.minValue;
    return range === 0 ? 0 : ((value - state.minValue) / range) * 100;
  };

  const offset = () =>
    local.offset != null
      ? clampFill(local.offset, state.minValue, state.maxValue)
      : state.values().length > 1
        ? state.getThumbValue(0)
        : state.minValue;
  const start = () =>
    state.values().length > 1 ? state.getThumbPercent(0) * 100 : percentOf(offset());
  const end = () => state.getThumbPercent(state.values().length - 1) * 100;
  const startPercent = () => Math.min(start(), end());
  const sizePercent = () => Math.max(0, Math.max(start(), end()) - startPercent());

  const renderValues = createMemo<SliderFillRenderProps>(() => ({
    isDisabled: state.isDisabled,
    isHovered: isHovered(),
    valuePercent: state.getValuePercent(),
    orientation: state.orientation,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
      defaultClassName: "solidaria-Slider-fill",
    },
    renderValues,
  );

  // useRenderProps has no defaultStyle; merge the positioning style with the
  // user's, mirroring upstream SliderFill's defaultStyle (and SliderTrack here).
  const mergedStyle = (): JSX.CSSProperties => {
    const fillStyle: JSX.CSSProperties =
      state.orientation === "vertical"
        ? {
            position: "absolute",
            bottom: `${startPercent()}%`,
            height: `${sizePercent()}%`,
            width: "100%",
          }
        : {
            position: "absolute",
            "inset-inline-start": `${startPercent()}%`,
            width: `${sizePercent()}%`,
            height: "100%",
          };
    return { ...fillStyle, ...(renderProps.style() || {}) };
  };

  return (
    <div
      {...domProps}
      {...hoverProps}
      class={renderProps.class()}
      style={mergedStyle()}
      data-hovered={dataAttr(isHovered())}
      data-disabled={dataAttr(state.isDisabled)}
      data-orientation={state.orientation}
    >
      {renderProps.renderChildren()}
    </div>
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
      get children() {
        return props.children;
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
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

  const renderedChildren = () => renderProps.renderChildren() ?? state.getFormattedValue();

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
Slider.Fill = SliderFill;
Slider.Output = SliderOutput;
