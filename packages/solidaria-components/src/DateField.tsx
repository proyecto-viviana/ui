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

/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/DateField.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/HiddenDateInput.tsx

/**
 * DateField component for solidaria-components
 *
 * Pre-wired headless date field component with segment-based editing.
 * Port of react-aria-components/src/DateField.tsx
 */

import {
  type JSX,
  type Context,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  Index,
  Show,
} from "solid-js";
import {
  createDateField,
  createDateSegment,
  createFocusRing,
  createHover,
  createVisuallyHidden,
  mergeProps,
  type AriaDateFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  parseDate,
  parseDateTime,
  toCalendarDate,
  toCalendarDateTime,
  toLocalTimeZone,
} from "@internationalized/date";
import {
  createDateFieldState,
  access,
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
  Provider,
} from "./utils";
import { TextContext } from "./Text";
import { FormContext, type FormProps } from "./Form";
import {
  DateRangePickerContext,
  type DateRangePickerFieldContextValue,
} from "./DateRangePickerContext";

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
  /** Whether the segment is hovered. */
  isHovered: boolean;
  /** Whether the segment is focused. */
  isFocused: boolean;
  /** Whether the segment is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the segment is a placeholder. */
  isPlaceholder: boolean;
  /** Whether the segment is read only. */
  isReadOnly: boolean;
  /** Whether the segment is disabled. */
  isDisabled: boolean;
  /** Whether the segment is invalid. */
  isInvalid: boolean;
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
    // The hidden validation <input> props (native type/required/onChange). Only
    // the standalone DateField provides these; DatePicker/DateRangePicker manage
    // their own hidden inputs, so this stays optional and its <input> is gated.
    hiddenInputProps?: Record<string, unknown>;
    descriptionProps: Record<string, unknown>;
    errorMessageProps: Record<string, unknown>;
  };
}

export const DateFieldContext = createContext<DateFieldContextValue | null>(null);
export const DateFieldStateContext = createContext<DateFieldState<DateValue> | null>(null);

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

export function useDateFieldContext(): DateFieldContextValue {
  const context = useContext(DateFieldContext);
  if (!context) {
    throw new Error("DateField components must be used within a DateField");
  }
  return context;
}

function useDateInputContext(
  slot?: string,
): DateFieldContextValue | DateRangePickerFieldContextValue {
  const dateFieldContext = useContext(DateFieldContext);
  if (dateFieldContext) {
    return dateFieldContext;
  }

  const dateRangePickerContext = useContext(DateRangePickerContext);
  if (dateRangePickerContext && slot === "start") {
    return dateRangePickerContext.startFieldContext;
  }
  if (dateRangePickerContext && slot === "end") {
    return dateRangePickerContext.endFieldContext;
  }

  throw new Error("DateInput components must be used within a DateField or DateRangePicker slot");
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
  const formContext = useContext(FormContext);

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div class="solidaria-DateField solidaria-DateField--placeholder" aria-hidden="true" />
      }
    >
      <DateFieldInner {...props} __formContext={formContext} />
    </Show>
  );
}

type DateFieldInnerProps<T extends DateValue = DateValue> = DateFieldProps<T> & {
  __formContext?: FormProps | null;
};

/**
 * Internal DateField component that renders after client mount.
 */
function DateFieldInner<T extends DateValue = CalendarDate>(
  props: DateFieldInnerProps<T>,
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
      "placeholderValue",
      "shouldForceLeadingZeros",
      "validationState",
      "validationBehavior",
      "validate",
      "description",
      "errorMessage",
      "isDateUnavailable",
    ],
  );

  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null);
  // Ref to the hidden validation <input> (the DateInput's `<Input>` sibling).
  // RAC's DateField creates this ref, passes it to useDateField, and threads it
  // onto the <Input> via InputContext so useFormReset/useFormValidation target
  // that element. We mirror that: create it here, hand it to createDateField
  // below, and attach it to the same input through the context getter.
  const [validationInputRef, setValidationInputRef] = createSignal<HTMLInputElement | null>(null);

  const state = createDateFieldState(stateProps);

  const fieldAria = createDateField(
    () => ({
      ...(rest as Record<string, unknown>),
      // RAC threads the same props into both useDateFieldState and useDateField;
      // these live in `stateProps` here, so forward them so the field hook can
      // build aria-disabled and the native validation <input> (type/required).
      // access() unwraps the MaybeAccessor state-prop declarations.
      isDisabled: access(stateProps.isDisabled),
      isReadOnly: access(stateProps.isReadOnly),
      isRequired: access(stateProps.isRequired),
      // Mirror RAC DateField: validationBehavior ?? formValidationBehavior ??
      // 'native'. withFormValidationBehavior already folds the form default into
      // stateProps.validationBehavior; the last `?? 'native'` is the standalone
      // default that flips the hidden input to type="text".
      validationBehavior: stateProps.validationBehavior ?? "native",
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
      // Form-reset + native constraint validation are wired onto this input by
      // createDateField (see its createFormReset/createFormValidation calls),
      // exactly as RAC's useDateField wires them onto props.inputRef.
      inputRef: () => validationInputRef() ?? undefined,
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
    <DateFieldStateContext.Provider value={state as unknown as DateFieldState<DateValue>}>
      <DateFieldContext.Provider
        value={{
          state: state as unknown as DateFieldState<DateValue>,
          // Read through getters so consumers see the LIVE memo values, not a
          // snapshot frozen at first render. `createDescription` appends the
          // value-description id via a deferred effect; the group's
          // aria-describedby only picks it up if the props stay reactive here.
          aria: {
            get labelProps() {
              return fieldAria.labelProps;
            },
            // The segment group props (role="group", aria-labelledby, unicode-bidi
            // isolate style, arrow-key nav, focus-within handlers) are routed to the
            // DateInput element — mirroring RAC, where useDateField.fieldProps is
            // published through GroupContext and consumed by the DateInput <Group>.
            // The outer wrapper stays roleless.
            get inputProps() {
              return fieldAria.fieldProps;
            },
            // The REAL hidden validation input props (type/hidden/required/onChange
            // under native validation). Rendered as the DateInput's <input> sibling.
            // Thread the validation-input ref through here — mirroring RAC's
            // `[InputContext, {...inputProps, ref: inputRef}]` — so createDateField's
            // form-reset/validation wiring resolves to the mounted element.
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
          RAC renders <HiddenDateInput> UNCONDITIONALLY at the DateField root
          (react-aria-components DateField.mjs). It is NOT a validation input — it
          is a clipped, aria-hidden, tabIndex={-1} native date input that mirrors
          the value for browser autofill. Its `form=""` detaches it from form
          submission (the DateInput's <Input> above is what submits), so it never
          double-counts in FormData. It renders regardless of `name` — hence no
          <Show> gate — which is why it appears in the focus trail as the trailing
          tabindex="-1" element.
        */}
        <RootHiddenDateInput
          autoComplete={(rest as Record<string, unknown>).autoComplete as string | undefined}
          name={(rest as Record<string, unknown>).name as string | undefined}
          isDisabled={state.isDisabled()}
          state={state as unknown as DateFieldState<DateValue>}
        />
      </DateFieldContext.Provider>
    </DateFieldStateContext.Provider>
  );
}

const HIDDEN_DATE_SEGMENTS: readonly string[] = ["day", "month", "year"];
const HIDDEN_TIME_SEGMENTS: readonly string[] = ["hour", "minute", "second"];
const HIDDEN_GRANULARITY_MAP: Record<string, number> = { hour: 1, minute: 2, second: 3 };

interface RootHiddenDateInputProps {
  autoComplete?: string;
  name?: string;
  isDisabled?: boolean;
  state: DateFieldState<DateValue>;
}

/**
 * The always-rendered hidden date input at the DateField root — a faithful port
 * of react-aria-components/src/HiddenDateInput.tsx. It is NOT a validation
 * input: it is a clipped, aria-hidden, tabIndex={-1} native
 * date input that mirrors the current value for browser autofill. `form=""`
 * detaches it from form submission (the DateInput's <Input> submits), so it
 * never double-counts in FormData. RAC renders it unconditionally, which is why
 * it appears as the trailing tabindex="-1" element in the focus trail.
 */
function RootHiddenDateInput(props: RootHiddenDateInputProps): JSX.Element {
  // RAC uses useVisuallyHidden with position:fixed/top:0/left:0 to keep the
  // clipped input from scrolling the page.
  const { visuallyHiddenProps } = createVisuallyHidden(() => ({
    style: { position: "fixed", top: "0", left: "0" },
  }));

  const granularity = () => props.state.granularity ?? "day";
  const inputStep = () => {
    const g = granularity();
    if (g === "second") return 1;
    if (g === "hour") return 3600;
    return 60;
  };
  const inputType = () => (granularity() === "day" ? "date" : "datetime-local");
  const dateValue = () => {
    const value = props.state.value();
    if (!value) return "";
    if (granularity() === "day") return toCalendarDate(value).toString();
    return toCalendarDateTime("timeZone" in value ? toLocalTimeZone(value) : value).toString();
  };

  const onChange: JSX.EventHandler<HTMLInputElement, Event> = (event) => {
    const targetString = (event.currentTarget.value ?? "").toString();
    if (!targetString) return;
    try {
      const g = granularity();
      const targetValue = (g === "day"
        ? parseDate(targetString)
        : parseDateTime(targetString)) as unknown as Record<string, number>;
      let timeSegments = HIDDEN_TIME_SEGMENTS;
      if (HIDDEN_TIME_SEGMENTS.includes(g)) {
        timeSegments = HIDDEN_TIME_SEGMENTS.slice(0, HIDDEN_GRANULARITY_MAP[g]);
      }
      const state = props.state as unknown as {
        setSegment?: (type: string, value: number) => void;
        setValue: (value: unknown) => void;
      };
      // Only DateFieldState (not DatePickerState) exposes setSegment; validate
      // each parsed segment before committing the new value, mirroring RAC.
      if (typeof state.setSegment === "function") {
        for (const type in targetValue) {
          if (HIDDEN_DATE_SEGMENTS.includes(type)) state.setSegment(type, targetValue[type]);
          if (timeSegments.includes(type)) state.setSegment(type, targetValue[type]);
        }
      }
      state.setValue(targetValue);
    } catch {
      // ignore unparseable autofill values
    }
  };

  return (
    <div
      {...(visuallyHiddenProps() as unknown as Record<string, unknown>)}
      aria-hidden="true"
      data-testid="hidden-dateinput-container"
    >
      <input
        tabIndex={-1}
        autocomplete={props.autoComplete}
        disabled={props.isDisabled}
        type={inputType()}
        form=""
        name={props.name}
        step={inputStep()}
        value={dateValue()}
        onChange={onChange}
      />
    </div>
  );
}

/**
 * The input area containing date segments.
 */
export function DateInput(props: DateInputProps): JSX.Element {
  const context = useDateInputContext(props.slot);
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

  // The group props (role="group", aria-labelledby, unicode-bidi:isolate,
  // arrow-key nav, focus-within handlers) carry the field's own `style` and
  // focus handlers. Merge — not clobber — so the group keeps its unicode-bidi
  // isolation and the local isFocused signal chains onto the field's
  // focusWithin handlers. Solid onFocus/onBlur do not bubble, so track focus
  // via onFocusIn/onFocusOut.
  const inputDivProps = createMemo(() =>
    mergeProps(aria.inputProps, {
      onFocusIn: () => setIsFocused(true),
      onFocusOut: () => setIsFocused(false),
      style: renderProps.style(),
    }),
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
    <DateFieldContext.Provider value={context as DateFieldContextValue}>
      <div
        ref={setInputRef}
        {...inputDivProps()}
        class={renderProps.class()}
        data-disabled={dataAttr(state.isDisabled())}
        data-focused={dataAttr(isFocused())}
      >
        {/*
          <Index> keys by position, not identity, so each DateSegment instance
          stays alive across keystrokes (state.segments() re-mints segment
          objects every edit). A stable Proxy forwards property reads to the
          live per-index accessor so the child stays reactive.
        */}
        <Index each={state.segments()}>
          {(segment) => {
            const liveSegment = new Proxy({} as DateSegmentType, {
              get: (_t, key) => (segment() as unknown as Record<PropertyKey, unknown>)[key],
              has: (_t, key) => key in (segment() as object),
            });
            return props.children?.(liveSegment);
          }}
        </Index>
      </div>
      {/*
        The hidden validation input, sibling of the group — mirrors RAC's
        DateInputInner `<><Group/><Input/></>`. Under native validation
        (default) `useDateField` publishes it as `type="text" hidden required`
        so browser constraint validation fires; under aria validation it stays
        `type="hidden"`. Both carry the ISO value string. Only the standalone
        DateField supplies these props; inside a DatePicker/DateRangePicker the
        field is presentation and its owner renders the hidden input instead.
      */}
      <Show when={aria.hiddenInputProps}>
        {(hiddenInputProps) => (
          <input {...(hiddenInputProps() as JSX.InputHTMLAttributes<HTMLInputElement>)} />
        )}
      </Show>
    </DateFieldContext.Provider>
  );
}

/**
 * A segment of a date field (year, month, day, etc.).
 */
export function DateSegment(props: DateSegmentProps): JSX.Element {
  const { state } = useDateFieldContext();
  const [segmentRef, setSegmentRef] = createSignal<HTMLElement | null>(null);

  const segmentAria = createDateSegment(
    {
      get segment() {
        return props.segment;
      },
    },
    state,
    segmentRef,
  );

  // Mirror upstream DateSegment: focus/focus-visible come from useFocusRing()
  // and hover from useHover({isDisabled: field disabled || literal segment}).
  // Literals never hover; the field being disabled suppresses hover entirely.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover(() => ({
    isDisabled: state.isDisabled() || props.segment.type === "literal",
  }));

  const renderValues = createMemo<DateSegmentRenderProps>(() => ({
    isHovered: isHovered(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isPlaceholder: props.segment.isPlaceholder,
    isReadOnly: state.isReadOnly(),
    isDisabled: state.isDisabled(),
    isInvalid: state.isInvalid(),
    type: props.segment.type,
    text: props.segment.text,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
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
    return props.segment.text;
  };

  // Mirror upstream's `mergeProps(filterDOMProps(otherProps), segmentProps,
  // focusProps, hoverProps)`: the segment's behavior/style props (caretColor +
  // RTL direction) chain with the focus-ring and hover handlers so neither
  // clobbers the other.
  const segmentElementProps = createMemo(() =>
    mergeProps(
      segmentAria.segmentProps,
      focusProps as Record<string, unknown>,
      hoverProps as Record<string, unknown>,
      {
        style: renderProps.style(),
      },
    ),
  );

  return (
    <span
      ref={setSegmentRef}
      {...segmentElementProps()}
      class={renderProps.class()}
      data-placeholder={props.segment.isPlaceholder || undefined}
      data-invalid={state.isInvalid() || undefined}
      data-readonly={state.isReadOnly() || undefined}
      data-disabled={state.isDisabled() || undefined}
      data-type={props.segment.type}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
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
    <span {...aria.descriptionProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateFieldErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DateFieldErrorMessage(props: DateFieldErrorMessageProps): JSX.Element {
  const { aria } = useDateFieldContext();
  return (
    <span {...aria.errorMessageProps} class={props.class}>
      {props.children}
    </span>
  );
}

export type { DateFieldState, DateSegmentType };
