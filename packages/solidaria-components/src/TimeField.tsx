/**
 * TimeField component for solidaria-components
 *
 * Pre-wired headless time field component with segment-based editing.
 * Port of react-aria-components/src/TimeField.tsx
 */

import {
  type JSX,
  type Context,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createTimeField,
  createTimeSegment,
  type AriaTimeFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  createTimeFieldState,
  access,
  type TimeFieldState,
  type TimeFieldStateProps,
  type TimeSegment as TimeSegmentType,
  type TimeValue,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  useIsHydrated,
  Provider,
} from "./utils";
import { TextContext } from "./Text";
import { HiddenTimeInput } from "./HiddenTimeInput";
import { FormContext, type FormProps } from "./Form";

export interface TimeFieldRenderProps {
  /** Whether the field is disabled. */
  isDisabled: boolean;
  /** Whether the field is read-only. */
  isReadOnly: boolean;
  /** Whether the field is required. */
  isRequired: boolean;
  /** Whether the field is invalid. */
  isInvalid: boolean;
}

export interface TimeFieldProps<T extends TimeValue = TimeValue>
  extends
    Omit<AriaTimeFieldProps, "id" | "isDisabled" | "isReadOnly" | "isRequired">,
    Omit<TimeFieldStateProps<T>, "locale">,
    SlotProps {
  /** The children of the component. */
  children?: JSX.Element | ((segment: TimeSegmentType) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TimeFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TimeFieldRenderProps>;
  /** The locale to use for formatting. */
  locale?: string;
}

export interface TimeInputRenderProps {
  /** Whether the input is disabled. */
  isDisabled: boolean;
  /** Whether the input is focused. */
  isFocused: boolean;
}

export interface TimeInputProps extends SlotProps {
  /** The children of the component (render function receiving segments). */
  children?: (segment: TimeSegmentType) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TimeInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TimeInputRenderProps>;
}

export interface TimeSegmentRenderProps {
  /** Whether the segment is focused. */
  isFocused: boolean;
  /** Whether the segment is editable. */
  isEditable: boolean;
  /** Whether the segment is a placeholder. */
  isPlaceholder: boolean;
  /** The segment type. */
  type: TimeSegmentType["type"];
  /** The text to display. */
  text: string;
}

export interface TimeSegmentProps extends SlotProps {
  /** The segment data. */
  segment: TimeSegmentType;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<TimeSegmentRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TimeSegmentRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TimeSegmentRenderProps>;
}

export interface TimeFieldContextValue {
  state: TimeFieldState<TimeValue>;
  aria: {
    labelProps: Record<string, unknown>;
    inputProps: Record<string, unknown>;
    descriptionProps: Record<string, unknown>;
    errorMessageProps: Record<string, unknown>;
  };
}

export const TimeFieldContext = createContext<TimeFieldContextValue | null>(null);
export const TimeFieldStateContext = createContext<TimeFieldState<TimeValue> | null>(null);

function withFormValidationBehavior<P extends object>(props: P, formContext: FormProps | null): P {
  if (!formContext?.validationBehavior) {
    return props;
  }

  return new Proxy(props, {
    get(target, property, receiver) {
      const localValue = Reflect.get(target, property, receiver);
      if (property === "validationBehavior" && localValue === undefined) {
        return formContext.validationBehavior;
      }

      return localValue;
    },
    has(target, property) {
      return (
        Reflect.has(target, property) ||
        (property === "validationBehavior" && formContext.validationBehavior !== undefined)
      );
    },
    ownKeys(target) {
      const keys = new Set(Reflect.ownKeys(target));
      if (formContext.validationBehavior !== undefined) {
        keys.add("validationBehavior");
      }

      return Array.from(keys);
    },
    getOwnPropertyDescriptor(target, property) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor) {
        return descriptor;
      }

      if (property === "validationBehavior" && formContext.validationBehavior !== undefined) {
        return {
          enumerable: true,
          configurable: true,
          get: () => formContext.validationBehavior,
        };
      }

      return undefined;
    },
  });
}

function useTimeFieldContextValue(): TimeFieldContextValue {
  const context = useContext(TimeFieldContext);
  if (!context) {
    throw new Error("TimeField components must be used within a TimeField");
  }
  return context;
}

export function useTimeFieldContext(): TimeFieldState<TimeValue> {
  return useTimeFieldContextValue().state;
}

/**
 * A time field allows users to enter and edit time values using a keyboard.
 *
 * @example
 * ```tsx
 * <TimeField label="Time">
 *   <Label>Time</Label>
 *   <TimeInput>
 *     {(segment) => <TimeSegment segment={segment} />}
 *   </TimeInput>
 * </TimeField>
 * ```
 */
export function TimeField<T extends TimeValue = TimeValue>(props: TimeFieldProps<T>): JSX.Element {
  // Use hydration-safe pattern for client-only rendering
  const isHydrated = useIsHydrated();
  const formContext = useContext(FormContext);

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div class="solidaria-TimeField solidaria-TimeField--placeholder" aria-hidden="true" />
      }
    >
      <TimeFieldInner {...props} __formContext={formContext} />
    </Show>
  );
}

type TimeFieldInnerProps<T extends TimeValue = TimeValue> = TimeFieldProps<T> & {
  __formContext?: FormProps | null;
};

/**
 * Internal TimeField component that renders after client mount.
 */
function TimeFieldInner<T extends TimeValue = TimeValue>(
  props: TimeFieldInnerProps<T>,
): JSX.Element {
  const formContext = props.__formContext ?? useContext(FormContext);
  const mergedProps = withFormValidationBehavior(props, formContext);
  const [local, stateProps, rest] = splitProps(
    mergedProps,
    ["children", "class", "style", "slot", "__formContext"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isInvalid",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "locale",
      "granularity",
      "hourCycle",
      "shouldForceLeadingZeros",
      "validationState",
      "validationBehavior",
      "validate",
      "description",
      "errorMessage",
      "placeholderValue",
    ],
  );

  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null);

  const state = createTimeFieldState(stateProps);

  const fieldAria = createTimeField(
    () => ({
      ...(rest as Record<string, unknown>),
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
    }),
    state as unknown as TimeFieldState<TimeValue>,
    fieldRef,
  );

  const renderValues = createMemo<TimeFieldRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isReadOnly: state.isReadOnly(),
    isRequired: state.isRequired(),
    isInvalid: state.isInvalid(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TimeField",
    },
    renderValues,
  );

  const validationBehavior = () =>
    (stateProps as { validationBehavior?: "aria" | "native" }).validationBehavior ??
    formContext?.validationBehavior ??
    "native";

  const textSlots = {
    slots: {
      get description() {
        return fieldAria.descriptionProps;
      },
      get errorMessage() {
        return fieldAria.errorMessageProps;
      },
    },
  };

  return (
    <TimeFieldStateContext.Provider value={state as unknown as TimeFieldState<TimeValue>}>
      <TimeFieldContext.Provider
        value={{
          state: state as unknown as TimeFieldState<TimeValue>,
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
          <Provider values={[[TextContext, textSlots]] as Array<[Context<unknown>, unknown]>}>
            {local.children as JSX.Element}
          </Provider>
        </div>
        <Show when={(rest as Record<string, unknown>).name}>
          <HiddenTimeInput
            name={(rest as Record<string, unknown>).name as string | undefined}
            form={(rest as Record<string, unknown>).form as string | undefined}
            value={state.value()}
            autoComplete={(rest as Record<string, unknown>).autoComplete as string | undefined}
            isDisabled={state.isDisabled()}
            isRequired={state.isRequired()}
            validationBehavior={validationBehavior()}
            validationState={state}
            focus={() => {
              fieldRef()?.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
            }}
            minValue={access(stateProps.minValue) as TimeValue | undefined}
            maxValue={access(stateProps.maxValue) as TimeValue | undefined}
            granularity={state.granularity}
          />
        </Show>
      </TimeFieldContext.Provider>
    </TimeFieldStateContext.Provider>
  );
}

/**
 * The input area containing time segments.
 */
export function TimeInput(props: TimeInputProps): JSX.Element {
  const { state, aria } = useTimeFieldContextValue();
  const [isFocused, setIsFocused] = createSignal(false);

  const renderValues = createMemo<TimeInputRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isFocused: isFocused(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-TimeInput",
    },
    renderValues,
  );

  return (
    <div
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
 * A segment of a time field (hour, minute, second, AM/PM).
 */
export function TimeSegment(props: TimeSegmentProps): JSX.Element {
  const state = useTimeFieldContext();
  const [segmentRef, setSegmentRef] = createSignal<HTMLDivElement | null>(null);

  const segmentAria = createTimeSegment(
    { segment: props.segment },
    state as unknown as TimeFieldState,
    segmentRef,
  );

  const renderValues = createMemo<TimeSegmentRenderProps>(() => ({
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
      defaultClassName: "solidaria-TimeSegment",
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
    <div
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
    </div>
  );
}

export interface TimeFieldLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function TimeFieldLabel(props: TimeFieldLabelProps): JSX.Element {
  const { aria } = useTimeFieldContextValue();
  return (
    <span {...aria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface TimeFieldDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function TimeFieldDescription(props: TimeFieldDescriptionProps): JSX.Element {
  const { aria } = useTimeFieldContextValue();
  return (
    <p {...aria.descriptionProps} class={props.class}>
      {props.children}
    </p>
  );
}

export interface TimeFieldErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function TimeFieldErrorMessage(props: TimeFieldErrorMessageProps): JSX.Element {
  const { aria } = useTimeFieldContextValue();
  return (
    <p {...aria.errorMessageProps} class={props.class}>
      {props.children}
    </p>
  );
}

export type { TimeFieldState, TimeSegmentType, TimeValue };
