/**
 * DateField component for solidaria-components
 *
 * Pre-wired headless date field component with segment-based editing.
 * Port of react-aria-components/src/DateField.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createDateField,
  createDateSegment,
  type AriaDateFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  createDateFieldState,
  type DateFieldState,
  type DateFieldStateProps,
  type DateSegment as DateSegmentType,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  useIsHydrated,
} from "./utils";

export interface DateFieldRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the field is required. */
  isRequired: boolean;
  /** Whether the field is invalid. */
  isInvalid: boolean;
}

export interface DateFieldProps<T extends DateValue = DateValue>
  extends
    Omit<AriaDateFieldProps, "id" | "isDisabled" | "isReadOnly" | "isRequired">,
    Omit<DateFieldStateProps<T>, "locale">,
    SlotProps {
  /** The children of the component. */
  children?: JSX.Element | ((segment: DateSegmentType) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DateFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DateFieldRenderProps>;
  /** The locale to use for formatting. */
  locale?: string;
}

export interface DateInputRenderProps {
  /** Whether the input is disabled. */
  isDisabled: boolean;
  /** Whether the input is focused. */
  isFocused: boolean;
}

export interface DateInputProps extends SlotProps {
  /** The children of the component (render function receiving segments). */
  children?: (segment: DateSegmentType) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DateInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DateInputRenderProps>;
  /** Handler called during the pointer down capture phase. */
  onPointerDownCapture?: JSX.EventHandler<HTMLDivElement, PointerEvent>;
}

export interface DateSegmentRenderProps {
  /** Whether the segment is focused. */
  isFocused: boolean;
  /** Whether the segment is editable. */
  isEditable: boolean;
  /** Whether the segment is a placeholder. */
  isPlaceholder: boolean;
  /** The segment type. */
  type: DateSegmentType["type"];
  /** The text to display. */
  text: string;
}

export interface DateSegmentProps extends SlotProps {
  /** The segment data. */
  segment: DateSegmentType;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<DateSegmentRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DateSegmentRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DateSegmentRenderProps>;
}

export interface DateFieldContextValue {
  state: DateFieldState<DateValue>;
  aria: {
    labelProps: Record<string, unknown>;
    inputProps: Record<string, unknown>;
    descriptionProps: Record<string, unknown>;
    errorMessageProps: Record<string, unknown>;
  };
}

export const DateFieldContext = createContext<DateFieldContextValue | null>(null);
export const DateFieldStateContext = createContext<DateFieldState<DateValue> | null>(null);

export function useDateFieldContext(): DateFieldContextValue {
  const context = useContext(DateFieldContext);
  if (!context) {
    throw new Error("DateField components must be used within a DateField");
  }
  return context;
}

/**
 * A date field allows users to enter and edit date values using a keyboard.
 *
 * @example
 * ```tsx
 * <DateField label="Date">
 *   <Label>Date</Label>
 *   <DateInput>
 *     {(segment) => <DateSegment segment={segment} />}
 *   </DateInput>
 * </DateField>
 * ```
 */
export function DateField<T extends DateValue = CalendarDate>(
  props: DateFieldProps<T>,
): JSX.Element {
  // Use hydration-safe pattern for client-only rendering
  const isHydrated = useIsHydrated();

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div class="solidaria-DateField solidaria-DateField--placeholder" aria-hidden="true" />
      }
    >
      <DateFieldInner {...props} />
    </Show>
  );
}

/**
 * Internal DateField component that renders after client mount.
 */
function DateFieldInner<T extends DateValue = CalendarDate>(props: DateFieldProps<T>): JSX.Element {
  const [local, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "locale",
      "granularity",
      "hourCycle",
      "hideTimeZone",
      "placeholderValue",
      "validationState",
      "description",
      "errorMessage",
    ],
  );

  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null);

  const state = createDateFieldState(stateProps);

  const fieldAria = createDateField(
    () => ({
      ...(rest as Record<string, unknown>),
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
    }),
    state as unknown as DateFieldState<DateValue>,
    fieldRef,
  );

  const renderValues = createMemo<DateFieldRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isReadOnly: state.isReadOnly(),
    isRequired: state.isRequired(),
    isInvalid: state.isInvalid(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DateField",
    },
    renderValues,
  );

  return (
    <DateFieldStateContext.Provider value={state as unknown as DateFieldState<DateValue>}>
      <DateFieldContext.Provider
        value={{
          state: state as unknown as DateFieldState<DateValue>,
          aria: {
            labelProps: fieldAria.labelProps,
            inputProps: fieldAria.inputProps,
            descriptionProps: fieldAria.descriptionProps,
            errorMessageProps: fieldAria.errorMessageProps,
          },
        }}
      >
        <div
          ref={setFieldRef}
          {...fieldAria.fieldProps}
          class={renderProps.class()}
          style={renderProps.style()}
          data-disabled={dataAttr(state.isDisabled())}
          data-readonly={dataAttr(state.isReadOnly())}
          data-required={dataAttr(state.isRequired())}
          data-invalid={dataAttr(state.isInvalid())}
        >
          {props.children as JSX.Element}
        </div>
      </DateFieldContext.Provider>
    </DateFieldStateContext.Provider>
  );
}

/**
 * The input area containing date segments.
 */
export function DateInput(props: DateInputProps): JSX.Element {
  const context = useDateFieldContext();
  const { state, aria } = context;
  const [isFocused, setIsFocused] = createSignal(false);
  const [inputRef, setInputRef] = createSignal<HTMLDivElement | null>(null);

  const renderValues = createMemo<DateInputRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isFocused: isFocused(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DateInput",
    },
    renderValues,
  );

  createEffect(() => {
    const element = inputRef();
    const handler = props.onPointerDownCapture;
    if (!element || !handler) return;

    const listener = (event: PointerEvent) =>
      (handler as unknown as (event: PointerEvent) => void)(event);
    element.addEventListener("pointerdown", listener, { capture: true });
    onCleanup(() => element.removeEventListener("pointerdown", listener, { capture: true }));
  });

  return (
    <div
      ref={setInputRef}
      {...aria.inputProps}
      class={renderProps.class()}
      style={renderProps.style()}
      data-disabled={dataAttr(state.isDisabled())}
      data-focused={dataAttr(isFocused())}
      onFocusIn={() => setIsFocused(true)}
      onFocusOut={() => setIsFocused(false)}
    >
      <For each={state.segments()}>{(segment) => props.children?.(segment)}</For>
    </div>
  );
}

/**
 * A segment of a date field (year, month, day, etc.).
 */
export function DateSegment(props: DateSegmentProps): JSX.Element {
  const { state } = useDateFieldContext();
  const [segmentRef, setSegmentRef] = createSignal<HTMLElement | null>(null);

  const segmentAria = createDateSegment({ segment: props.segment }, state, segmentRef);

  const renderValues = createMemo<DateSegmentRenderProps>(() => ({
    isFocused: segmentAria.isFocused,
    isEditable: segmentAria.isEditable,
    isPlaceholder: segmentAria.isPlaceholder,
    type: props.segment.type,
    text: segmentAria.text,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DateSegment",
    },
    renderValues,
  );

  // Determine children content - avoid Show for SSR hydration compatibility
  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return segmentAria.text;
  };

  return (
    <span
      ref={setSegmentRef}
      {...segmentAria.segmentProps}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={dataAttr(segmentAria.isFocused)}
      data-editable={dataAttr(segmentAria.isEditable)}
      data-placeholder={dataAttr(segmentAria.isPlaceholder)}
      data-type={props.segment.type}
    >
      {getChildren()}
    </span>
  );
}

export interface DateFieldLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function DateFieldLabel(props: DateFieldLabelProps): JSX.Element {
  const { aria } = useDateFieldContext();
  return (
    <span {...aria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateFieldDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function DateFieldDescription(props: DateFieldDescriptionProps): JSX.Element {
  const { aria } = useDateFieldContext();
  return (
    <p {...aria.descriptionProps} class={props.class}>
      {props.children}
    </p>
  );
}

export interface DateFieldErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DateFieldErrorMessage(props: DateFieldErrorMessageProps): JSX.Element {
  const { aria } = useDateFieldContext();
  return (
    <p {...aria.errorMessageProps} class={props.class}>
      {props.children}
    </p>
  );
}

export type { DateFieldState, DateSegmentType };
