/**
 * TimeField component for solidaria-components
 *
 * Pre-wired headless time field. Faithful port of react-aria-components'
 * TimeField, which does NOT define its own segment primitives — it reuses
 * `DateInput`/`DateSegment` (there is no `TimeInput`/`TimeSegment` upstream).
 * `TimeFieldState` IS a `DateFieldState` (plus `timeValue`), so this component
 * drives the certified DateField segment/group stack directly: it provides the
 * shared `DateFieldContext`/`DateFieldStateContext` that `DateInput`/`DateSegment`
 * read, plus a `TimeFieldContext` for the time-field label/description/error
 * chrome. Unlike DateField, TimeField renders NO root hidden autofill input (RAC
 * TimeField renders none); its native-validation `<input>` is still emitted by
 * the inner DateInput sibling.
 */

import {
  type JSX,
  type Context,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { createTimeField, mergeProps, type AriaTimeFieldProps } from "@proyecto-viviana/solidaria";
import {
  createTimeFieldState,
  access,
  type TimeFieldState,
  type TimeFieldStateProps,
  type TimeSegment as TimeSegmentType,
  type TimeValue,
} from "@proyecto-viviana/solid-stately";
import {
  DateFieldContext,
  DateFieldStateContext,
  type DateFieldContextValue,
} from "./DateField";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  useIsHydrated,
  Provider,
} from "./utils";
import { TextContext } from "./Text";
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
 *   <DateInput>
 *     {(segment) => <DateSegment segment={segment} />}
 *   </DateInput>
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
      "hideTimeZone",
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
  // Ref to the hidden validation <input> (the DateInput's `<Input>` sibling).
  // Mirrors DateField: create it here, hand it to createTimeField below, and
  // attach it to the same input through the DateFieldContext getter.
  const [validationInputRef, setValidationInputRef] =
    createSignal<HTMLInputElement | null>(null);

  const state = createTimeFieldState(stateProps);

  const fieldAria = createTimeField(
    () => ({
      ...(rest as Record<string, unknown>),
      // RAC threads these props into both useTimeFieldState and useTimeField;
      // they live in `stateProps` here, so forward them for the field hook's
      // aria-disabled and the native validation <input> (type/required).
      isDisabled: access(stateProps.isDisabled),
      isReadOnly: access(stateProps.isReadOnly),
      isRequired: access(stateProps.isRequired),
      // Standalone default flips the hidden input to type="text" so an empty
      // required value blocks HTML form submission (mirrors DateField).
      validationBehavior: stateProps.validationBehavior ?? "native",
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
      inputRef: () => validationInputRef() ?? undefined,
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

  // The shared context read by the reused DateInput/DateSegment. Read through
  // getters so consumers see the LIVE memo values (createDescription appends the
  // value-description id via a deferred effect; a frozen snapshot would miss it).
  const dateFieldContextValue: DateFieldContextValue = {
    get state() {
      return state as unknown as DateFieldContextValue["state"];
    },
    aria: {
      get labelProps() {
        return fieldAria.labelProps;
      },
      // The segment group props (role="group", aria-labelledby, unicode-bidi
      // isolate, arrow-key nav, focus-within handlers) are routed to the
      // DateInput element; the outer wrapper stays roleless.
      get inputProps() {
        return fieldAria.fieldProps;
      },
      // The native validation <input> props (type/hidden/required/onChange under
      // native validation), rendered as the DateInput's sibling. Thread the
      // validation-input ref so createTimeField's form-reset/validation wiring
      // resolves to the mounted element.
      get hiddenInputProps() {
        return mergeProps(fieldAria.inputProps, { ref: setValidationInputRef });
      },
      get descriptionProps() {
        return fieldAria.descriptionProps;
      },
      get errorMessageProps() {
        return fieldAria.errorMessageProps;
      },
    },
  };

  return (
    <TimeFieldStateContext.Provider value={state as unknown as TimeFieldState<TimeValue>}>
      <DateFieldStateContext.Provider
        value={state as unknown as DateFieldContextValue["state"]}
      >
        <DateFieldContext.Provider value={dateFieldContextValue}>
          <TimeFieldContext.Provider
            value={{
              state: state as unknown as TimeFieldState<TimeValue>,
              aria: {
                get labelProps() {
                  return fieldAria.labelProps;
                },
                get inputProps() {
                  return fieldAria.fieldProps;
                },
                get descriptionProps() {
                  return fieldAria.descriptionProps;
                },
                get errorMessageProps() {
                  return fieldAria.errorMessageProps;
                },
              },
            }}
          >
            <div
              ref={setFieldRef}
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
            {/*
              Unlike DateField, TimeField renders NO root hidden autofill input —
              RAC TimeField renders none (react-aria-components TimeField.mjs). The
              native-validation <input> is emitted by the inner DateInput sibling.
            */}
          </TimeFieldContext.Provider>
        </DateFieldContext.Provider>
      </DateFieldStateContext.Provider>
    </TimeFieldStateContext.Provider>
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
    <span {...aria.descriptionProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface TimeFieldErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function TimeFieldErrorMessage(props: TimeFieldErrorMessageProps): JSX.Element {
  const { aria } = useTimeFieldContextValue();
  return (
    <span {...aria.errorMessageProps} class={props.class}>
      {props.children}
    </span>
  );
}

export type { TimeFieldState, TimeSegmentType, TimeValue };
