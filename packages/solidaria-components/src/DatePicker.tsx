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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/DatePicker.tsx

/**
 * DatePicker component for solidaria-components
 *
 * Pre-wired headless date picker component that combines a date field with a calendar popup.
 * Port of react-aria-components/src/DatePicker.tsx
 */

import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  Show,
  createTrackedEffect,
} from "solid-js";
import type { Context, Signal } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createDatePicker,
  createDateField,
  createDateRangePicker,
  createFocusRing,
  createFormReset,
  createHover,
  mergeProps,
  type AriaDatePickerProps,
  type AriaDateRangePickerProps,
  type DatePickerState as AriaDatePickerState,
  type PlacementAxis,
} from "@proyecto-viviana/solidaria";
import {
  createDateFieldState,
  createCalendarState,
  createRangeCalendarState,
  createDatePickerState,
  access,
  type DateFieldState,
  type DatePickerState,
  type CalendarStateProps,
  type CalendarState,
  type RangeCalendarState,
  type DateFieldStateProps,
  type DatePickerStateOptions,
  type CalendarDate,
  type DateValue,
  type RangeCalendarStateProps,
  type RangeValue,
  TimeClass,
  toCalendarDateTime,
  toZoned,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  Provider,
  useSlot,
} from "./utils";
import { TextContext } from "./Text";
import { ButtonContext, type ButtonProps } from "./Button";
import { DateFieldContext } from "./DateField";
import { LabelContext, type LabelProps } from "./Label";
import { CalendarContext } from "./Calendar";
import { RangeCalendarContext } from "./RangeCalendar";
import { HiddenDateInput } from "./HiddenDateInput";
import { FormContext, resolveValidationBehavior, type FormProps } from "./Form";
import { Popover, type PopoverRenderProps } from "./Popover";
import { Dialog } from "./Dialog";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import {
  DateRangePickerContext,
  useDateRangePickerContext,
  type DateRangePickerContextValue,
  type DateRangePickerFieldContextValue,
} from "./DateRangePickerContext";

export interface DatePickerRenderProps {
  /** Whether an element within the picker is focused. @selector [data-focus-within] */
  isFocusWithin: boolean;
  /** Whether an element within the picker is keyboard focused. @selector [data-focus-visible] */
  isFocusVisible: boolean;
  /** Whether the picker is disabled. */
  isDisabled: boolean;
  /** Whether the picker is read-only. */
  isReadOnly: boolean;
  /** Whether the picker is required. */
  isRequired: boolean;
  /** Whether the picker is invalid. */
  isInvalid: boolean;
  /** Whether the calendar is open. */
  isOpen: boolean;
}

export interface DateRangePickerRenderProps extends Omit<DatePickerRenderProps, "isInvalid"> {
  isInvalid: boolean;
}

export interface DatePickerContextValue {
  fieldState: DateFieldState<DateValue>;
  datePickerState: DatePickerState<DateValue>;
  calendarState: CalendarState<DateValue>;
  overlayState: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (element: HTMLElement | null) => void;
  /** RAC Popover `triggerRef: groupRef` — the FieldGroup, not the calendar button. */
  groupRef: () => HTMLElement | null;
  setGroupRef: (element: HTMLElement | null) => void;
  pickerAria: ReturnType<typeof createDatePicker>;
}

export type DatePickerProps<T extends DateValue = DateValue> = Omit<
  AriaDatePickerProps,
  "id" | "isDisabled" | "isReadOnly" | "isRequired" | "minValue" | "maxValue"
> &
  Omit<DateFieldStateProps<T>, "locale"> &
  SlotProps & {
    /** The children of the component. */
    children?: JSX.Element;
    /** The CSS className for the element. */
    class?: ClassNameOrFunction<DatePickerRenderProps>;
    /** The inline style for the element. */
    style?: StyleOrFunction<DatePickerRenderProps>;
    /** The locale to use for formatting. */
    locale?: string;
    /** Whether the calendar should close when a date is selected. */
    shouldCloseOnSelect?: boolean;
    /** Whether the overlay is open by default (uncontrolled). */
    defaultOpen?: boolean;
    /** Whether the overlay is open (controlled). */
    isOpen?: boolean;
    /** Callback when the overlay open state changes. */
    onOpenChange?: (isOpen: boolean) => void;
    /** The name for the hidden date input used in HTML form submission. */
    name?: string;
    /** The associated form id for the hidden date input. */
    form?: string;
    /** The number of months to display in the calendar popover. */
    visibleMonths?: number;
    /** Controls whether calendar paging advances by one month or by the visible month range. */
    pageBehavior?: CalendarStateProps<T>["pageBehavior"];
    /** Determines how visible months align around the initial focused date. */
    selectionAlignment?: CalendarStateProps<T>["selectionAlignment"];
    /** A function that determines whether a date is disabled. */
    isDateDisabled?: (date: DateValue) => boolean;
  };

export interface DateRangePickerProps<T extends DateValue = DateValue>
  extends
    Omit<AriaDateRangePickerProps, "id" | "isDisabled" | "isReadOnly">,
    Omit<RangeCalendarStateProps<T>, "locale">,
    SlotProps {
  children?: JSX.Element;
  class?: ClassNameOrFunction<DateRangePickerRenderProps>;
  style?: StyleOrFunction<DateRangePickerRenderProps>;
  locale?: string;
  shouldCloseOnSelect?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Whether the overlay is open (controlled). */
  isOpen?: boolean;
  /** Callback when the overlay open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** The granularity of the date/time fields. */
  granularity?: "day" | "hour" | "minute" | "second";
  /** Whether to show the hour in 12 or 24 hour format. */
  hourCycle?: 12 | 24;
  /** Whether to hide the time zone in date/time fields. */
  hideTimeZone?: boolean;
  /** The placeholder date used to determine segment structure. */
  placeholderValue?: DateValue;
  /** The name for the start date input used in HTML form submission. */
  startName?: string;
  /** The name for the end date input used in HTML form submission. */
  endName?: string;
  /** The associated form id for the hidden start/end date inputs. */
  form?: string;
  /** Controls whether native or ARIA validation should be used. */
  validationBehavior?: "native" | "aria";
}

export interface DatePickerButtonRenderProps {
  /** Whether the button is disabled. */
  isDisabled: boolean;
  /** Whether the calendar is open. */
  isOpen: boolean;
  /**
   * Whether the button is currently pressed. Provided by the single
   * DatePicker (fed from `createDatePicker().isButtonPressed()`); the range
   * variant does not yet publish press state, so this is optional.
   */
  isPressed?: boolean;
  /**
   * Whether the button is hovered. Fed from the trigger's own `createHover`;
   * mirrors RAC `Button`'s `isHovered` renderProp so the styled S2
   * `baseColor("gray-100")` hover-step background compiles into the className.
   */
  isHovered?: boolean;
  /**
   * Whether the button is keyboard-focused (focus-visible). Fed from
   * `createFocusRing`; mirrors RAC `Button`'s `isFocusVisible` so the styled
   * S2 `focusRing()` outline (a renderProps-gated class, not a CSS
   * `[data-focus-visible]` selector) compiles into the className.
   */
  isFocusVisible?: boolean;
}

export interface DatePickerButtonProps extends SlotProps {
  /** The children of the component. */
  children?: RenderChildren<DatePickerButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DatePickerButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DatePickerButtonRenderProps>;
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /**
   * Ref callback for the underlying button element. Mirrors S2's CalendarButton,
   * whose `buttonRef` feeds `pressScale(buttonRef)`; the styled layer forwards a
   * setter here so it can size the press transform against the real element.
   */
  ref?: (element: HTMLButtonElement) => void;
}

export interface DateRangePickerButtonProps extends DatePickerButtonProps {}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);
export const DatePickerStateContext = createContext<DateFieldState<DateValue> | null>(null);
export const DateRangePickerStateContext = createContext<RangeCalendarState<DateValue> | null>(
  null,
);
export { DateRangePickerContext, useDateRangePickerContext } from "./DateRangePickerContext";
export type {
  DateRangePickerContextValue,
  DateRangePickerFieldContextValue,
} from "./DateRangePickerContext";

export function useDatePickerContext(): DatePickerContextValue {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error("DatePicker components must be used within a DatePicker");
  }
  return context;
}

/**
 * A date picker combines a DateField and a Calendar popover.
 *
 * @example
 * ```tsx
 * <DatePicker label="Event date">
 *   <Label>Event date</Label>
 *   <Group>
 *     <DateInput>
 *       {(segment) => <DateSegment segment={segment} />}
 *     </DateInput>
 *     <DatePickerButton>📅</DatePickerButton>
 *   </Group>
 *   <Popover>
 *     <Dialog>
 *       <Calendar>
 *         <CalendarGrid>
 *           {(date) => <CalendarCell date={date} />}
 *         </CalendarGrid>
 *       </Calendar>
 *     </Dialog>
 *   </Popover>
 * </DatePicker>
 * ```
 */
function focusWithinDomProps(
  focusProps: JSX.HTMLAttributes<HTMLElement>,
): JSX.HTMLAttributes<HTMLElement> {
  const { ref: _ref, onFocus, onBlur, ...rest } = focusProps as Record<string, unknown>;
  // Solid's onFocus/onBlur do not bubble. RAC's within ring listens via React's
  // bubbling onFocus, so the same handlers attach as onFocusIn/onFocusOut.
  return {
    ...rest,
    onFocusIn: onFocus,
    onFocusOut: onBlur,
  } as JSX.HTMLAttributes<HTMLElement>;
}

export function DatePicker<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  return <DatePickerInner {...props} />;
}

type DatePickerInnerProps<T extends DateValue = DateValue> = DatePickerProps<T> & {
  __formContext?: FormProps | null;
};

/**
 * Internal DatePicker component that renders after client mount.
 */
function DatePickerInner<T extends DateValue = CalendarDate>(
  props: DatePickerInnerProps<T>,
): JSX.Element {
  const formContext = props.__formContext ?? useContext(FormContext);
  const [local, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "shouldCloseOnSelect", "__formContext"],
    [
      "value",
      "defaultValue",
      "onChange",
      "isOpen",
      "defaultOpen",
      "onOpenChange",
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
      "createCalendar",
      "validationState",
      "validationBehavior",
      "validate",
      "description",
      "errorMessage",
      "isDateUnavailable",
      "firstDayOfWeek",
      "visibleMonths",
      "pageBehavior",
      "selectionAlignment",
      "isDateDisabled",
    ],
  );

  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | null>(null);
  const [groupRef, setGroupRefState] = createSignal<HTMLElement | null>(null);
  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null);

  // Unified state using createDatePickerState as single source of truth.
  // Use getters here so controlled props keep tracking after splitProps.
  const datePickerStateProps = {
    get value() {
      return stateProps.value;
    },
    get defaultValue() {
      return stateProps.defaultValue;
    },
    get onChange() {
      return stateProps.onChange;
    },
    get minValue() {
      return stateProps.minValue;
    },
    get maxValue() {
      return stateProps.maxValue;
    },
    get isDisabled() {
      return stateProps.isDisabled;
    },
    get isReadOnly() {
      return stateProps.isReadOnly;
    },
    get isRequired() {
      return stateProps.isRequired;
    },
    get granularity() {
      return stateProps.granularity;
    },
    get hourCycle() {
      return stateProps.hourCycle;
    },
    get hideTimeZone() {
      return stateProps.hideTimeZone;
    },
    get placeholderValue() {
      return stateProps.placeholderValue;
    },
    get shouldCloseOnSelect() {
      return local.shouldCloseOnSelect;
    },
    get defaultOpen() {
      return stateProps.defaultOpen;
    },
    get isOpen() {
      return stateProps.isOpen;
    },
    get onOpenChange() {
      return stateProps.onOpenChange;
    },
    get isDateUnavailable() {
      return stateProps.isDateUnavailable;
    },
    get validationState() {
      return stateProps.validationState;
    },
  } satisfies DatePickerStateOptions<T>;
  const datePickerState = createDatePickerState<T>(datePickerStateProps);

  const overlayState = {
    get isOpen() {
      return datePickerState.isOpen();
    },
    open: datePickerState.open,
    close: datePickerState.close,
    toggle: () => datePickerState.setOpen(!datePickerState.isOpen()),
  };

  // Create field state synced through datePickerState.
  // Locale stays a getter: spreading stateProps would snapshot it to en-US
  // when the Provider locale is still an accessor (D10 ar-AE).
  const fieldState = createDateFieldState<T>({
    ...stateProps,
    get locale() {
      return access(stateProps.locale);
    },
    value: () => datePickerState.value(),
    onChange: (value) => {
      datePickerState.setValue(value);
    },
  });

  // Create calendar state synced through datePickerState
  const calendarState = createCalendarState<T>({
    // Popover calendar reads dateValue (in-progress date), matching useDatePicker.
    value: () => datePickerState.dateValue() as T | null,
    onChange: (value) => {
      if (!value) {
        return;
      }
      datePickerState.setDateValue(value);
    },
    minValue: stateProps.minValue,
    maxValue: stateProps.maxValue,
    isDisabled: stateProps.isDisabled,
    isReadOnly: stateProps.isReadOnly,
    get locale() {
      return access(stateProps.locale);
    },
    createCalendar: stateProps.createCalendar as CalendarStateProps<T>["createCalendar"],
    isDateUnavailable: stateProps.isDateUnavailable,
    firstDayOfWeek: stateProps.firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
    visibleMonths: stateProps.visibleMonths,
    pageBehavior: stateProps.pageBehavior,
    selectionAlignment: stateProps.selectionAlignment,
    isDateDisabled: stateProps.isDateDisabled,
  });

  // RAC's useDatePicker re-mounts a FRESH useCalendarState every popover open
  // and passes autoFocus:true, so useCalendarState seeds isFocused=true and the
  // focused cell auto-focuses (useCalendarState.mjs line 80:
  // `useState(props.autoFocus || false)`). The port SHARES one persistent
  // calendarState across opens, so isFocused would stay whatever it last was
  // (false after the first close). Mirror the fresh-mount behavior by flagging
  // the shared state focused on each false->true open transition; the
  // CalendarCell focus effect then pulls DOM focus to the value/today cell.
  let wasOpen = false;
  createTrackedEffect(() => {
    const open = datePickerState.isOpen();
    if (open && !wasOpen) {
      calendarState.setFocused(true);
    }
    wasOpen = open;
  });

  const hasExplicitName = () =>
    Boolean(
      (rest as Record<string, unknown>)["aria-label"] ||
      (rest as Record<string, unknown>)["aria-labelledby"],
    );
  const stringLabel = (): string | undefined => {
    const label = (rest as Record<string, unknown>).label;
    return typeof label === "string" && label !== "" ? label : undefined;
  };
  // A string label names the picker through DatePickerLabel. Slot detection
  // starts only when that string and an explicit aria name are both absent.
  const [labelRef, hasLabel] = useSlot(!hasExplicitName() && stringLabel() === undefined);

  // Create date picker ARIA props
  const pickerAria = createDatePicker(
    () => ({
      ...(rest as Record<string, unknown>),
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
      // Keep a string label for DatePickerLabel. An explicit aria name wins over
      // a child Label. Otherwise the slot flag tells createLabel a label exists.
      label: stringLabel() ?? (hasExplicitName() ? undefined : hasLabel()),
    }),
    fieldState as unknown as DateFieldState<DateValue>,
    overlayState as AriaDatePickerState,
    calendarState as unknown as CalendarState<DateValue>,
    () => fieldRef(),
  );

  // The composed picker's fieldProps (stamped role="presentation") are fed
  // through createDateField — mirroring RAC's DateField consuming
  // useDatePicker().fieldProps. This is what actually names the segments and
  // publishes the value description through the shared hookData WeakMap; without
  // it the segments would be unnamed and carry no selected-date announcement.
  const fieldAria = createDateField(
    () => pickerAria.fieldProps,
    fieldState as unknown as DateFieldState<DateValue>,
    () => fieldRef(),
  );

  // useDateField resets through the field input. Passing that ref into
  // createDateField would also attach native validation, so this unnamed
  // input is a reset target only and is not submitted.
  const [resetInput, setResetInput] = createSignal<HTMLInputElement>();
  createFormReset(resetInput, fieldState.defaultValue, () => {
    fieldState.setValue((fieldState.defaultValue ?? null) as T | null);
  });

  const contextValue: DatePickerContextValue = {
    fieldState: fieldState as unknown as DateFieldState<DateValue>,
    datePickerState: datePickerState as unknown as DatePickerState<DateValue>,
    calendarState: calendarState as unknown as CalendarState<DateValue>,
    overlayState,
    triggerRef,
    setTriggerRef: (element) => {
      if (!element) return;
      const current = triggerRef();
      if (!current || !current.isConnected) {
        setTriggerRef(() => element);
      }
    },
    groupRef,
    setGroupRef: (element) => {
      if (!element) return;
      setGroupRefState(() => element);
    },
    pickerAria,
  };

  const isInvalid = createMemo(
    () =>
      fieldState.isInvalid() ||
      datePickerState.builtinValidation().isInvalid ||
      Boolean(stateProps.isInvalid),
  );

  // RAC DatePicker root: useFocusRing({within: true}). Solid's onFocus does not
  // bubble, so the ring listens on onFocusIn/onFocusOut.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing({ within: true });

  const renderValues = createMemo<DatePickerRenderProps>(() => ({
    isFocusWithin: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: fieldState.isDisabled(),
    isReadOnly: fieldState.isReadOnly(),
    isRequired: fieldState.isRequired(),
    isInvalid: isInvalid(),
    isOpen: overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DatePicker",
    },
    renderValues,
  );

  const validationBehavior = () =>
    resolveValidationBehavior(
      (stateProps as { validationBehavior?: "aria" | "native" }).validationBehavior,
      formContext,
    );

  // RAC composes an unslotted `<Button>` as the calendar trigger. The slot
  // object stays stable so Button's one-time slot read keeps these getters.
  // Press DOM handlers stay on DatePickerButton: merging them here opens twice.
  const calendarButtonSlot: ButtonProps = {
    get id() {
      return pickerAria.buttonProps.id as string;
    },
    type: "button",
    get "aria-label"() {
      return pickerAria.buttonProps["aria-label"] as string;
    },
    get "aria-labelledby"() {
      return pickerAria.buttonProps["aria-labelledby"] as string;
    },
    get "aria-describedby"() {
      return pickerAria.buttonProps["aria-describedby"] as string | undefined;
    },
    get "aria-haspopup"() {
      return pickerAria.buttonProps["aria-haspopup"] as "dialog";
    },
    get "aria-expanded"() {
      return pickerAria.buttonProps["aria-expanded"] as boolean;
    },
    get isDisabled() {
      return pickerAria.isButtonDisabled();
    },
    onPress() {
      overlayState.open();
    },
  };
  const buttonContextValue = {
    slots: {
      default: calendarButtonSlot,
    },
  };

  const labelContextValue: LabelProps = {
    get id() {
      if (hasExplicitName() || stringLabel() !== undefined || !hasLabel()) {
        return undefined;
      }
      return pickerAria.labelProps.id as string | undefined;
    },
    ref: labelRef,
    elementType: "span",
  };

  return (
    <DatePickerStateContext value={fieldState as unknown as DateFieldState<DateValue>}>
      <DatePickerContext value={contextValue}>
        {/* Also provide DateFieldContext so DateInput/DateSegment work inside DatePicker */}
        <DateFieldContext
          value={{
            state: fieldState as unknown as DateFieldState<DateValue>,
            // Read through getters so the DateInput/DateSegment consumers see the
            // LIVE memo values (createDescription appends the value-description id
            // via a deferred effect; froze snapshots would miss it). inputProps are
            // the createDateField group props (role="presentation" here), which name
            // the segments — NOT the raw pickerAria.fieldProps.
            aria: {
              get labelProps() {
                return pickerAria.labelProps;
              },
              get inputProps() {
                return fieldAria.fieldProps;
              },
              get descriptionProps() {
                return pickerAria.descriptionProps;
              },
              get errorMessageProps() {
                return pickerAria.errorMessageProps;
              },
            },
          }}
        >
          <CalendarContext value={calendarState as unknown as CalendarState<DateValue>}>
            {/* BARE ROLELESS root — mirrors RAC `DatePicker`'s outer `<div>`. The
             * presentation FieldGroup shell (rendered as a child via
             * `DatePickerFieldGroup`) is what carries `pickerAria.groupProps`
             * (role="presentation" + label/describedby + arrow-nav/press). A
             * described node here would be a spurious AX entry the S2 oracle lacks. */}
            <div
              {...focusWithinDomProps(focusProps)}
              ref={setFieldRef}
              class={renderProps.class()}
              style={renderProps.style()}
              data-focus-within={dataAttr(isFocused())}
              data-focus-visible={dataAttr(isFocusVisible())}
              data-disabled={dataAttr(fieldState.isDisabled())}
              data-readonly={dataAttr(fieldState.isReadOnly())}
              data-required={dataAttr(fieldState.isRequired())}
              data-invalid={dataAttr(isInvalid())}
              data-open={dataAttr(overlayState.isOpen)}
            >
              <Provider
                values={
                  [
                    [
                      TextContext,
                      {
                        slots: {
                          get description() {
                            return pickerAria.descriptionProps;
                          },
                          get errorMessage() {
                            return pickerAria.errorMessageProps;
                          },
                        },
                      },
                    ],
                    [ButtonContext, buttonContextValue],
                    [LabelContext, labelContextValue],
                  ] as Array<[Context<unknown>, unknown]>
                }
              >
                {props.children}
              </Provider>
            </div>
            <input ref={setResetInput} type="hidden" tabindex={-1} aria-hidden="true" />
            <Show when={(rest as Record<string, unknown>).name}>
              <HiddenDateInput
                name={(rest as Record<string, unknown>).name as string | undefined}
                form={(rest as Record<string, unknown>).form as string | undefined}
                value={() => datePickerState.value()}
                autoComplete={(rest as Record<string, unknown>).autoComplete as string | undefined}
                isDisabled={fieldState.isDisabled()}
                isRequired={fieldState.isRequired()}
                validationBehavior={validationBehavior()}
                validationState={fieldState}
                focus={() => {
                  fieldRef()?.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
                }}
                minValue={() => access(stateProps.minValue) as DateValue | undefined}
                maxValue={() => access(stateProps.maxValue) as DateValue | undefined}
                granularity={datePickerState.granularity}
              />
            </Show>
          </CalendarContext>
        </DateFieldContext>
      </DatePickerContext>
    </DatePickerStateContext>
  );
}

function rangePlaceholderTime(placeholder: DateValue | null | undefined) {
  if (placeholder && "hour" in placeholder) {
    return placeholder;
  }
  return new TimeClass();
}

function applyRangeEndpointTime(
  date: DateValue,
  existing: DateValue | null | undefined,
  placeholder: DateValue | null | undefined,
): DateValue {
  if ("hour" in date) {
    return date;
  }
  const time = existing && "hour" in existing ? existing : rangePlaceholderTime(placeholder);
  const combined = toCalendarDateTime(date, time);
  if ("timeZone" in time) {
    return toZoned(combined, time.timeZone);
  }
  return combined;
}

function applyRangeTime<T extends DateValue>(
  range: RangeValue<T>,
  committed: RangeValue<DateValue> | null,
  placeholder: DateValue | null | undefined,
): RangeValue<T> {
  return {
    start: applyRangeEndpointTime(range.start, committed?.start, placeholder) as T,
    end: applyRangeEndpointTime(range.end, committed?.end, placeholder) as T,
  };
}

export function DateRangePicker<T extends DateValue = CalendarDate>(
  props: DateRangePickerProps<T>,
): JSX.Element {
  return <DateRangePickerInner {...props} />;
}

function DateRangePickerInner<T extends DateValue = CalendarDate>(
  props: DateRangePickerProps<T>,
): JSX.Element {
  const [local, overlayProps, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "shouldCloseOnSelect"],
    ["defaultOpen", "isOpen", "onOpenChange"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "locale",
      "granularity",
      "hourCycle",
      "hideTimeZone",
      "placeholderValue",
      "createCalendar",
      "isDateUnavailable",
      "visibleMonths",
      "isDateDisabled",
      "validationState",
      "allowsNonContiguousRanges",
      "firstDayOfWeek",
      "pageBehavior",
      "selectionAlignment",
    ],
  );

  const [internalOpen, setInternalOpen] = createSignal(overlayProps.defaultOpen ?? false);
  const isOpen = () => access(overlayProps.isOpen) ?? internalOpen();
  // Assigned once the range granularity memo exists. Closing commits a calendar
  // range that was held because selection does not close the popover.
  let commitPendingRange = () => {};
  const setOpen = (open: boolean) => {
    if (!open) {
      commitPendingRange();
    }
    if (access(overlayProps.isOpen) === undefined) {
      setInternalOpen(open);
    }
    overlayProps.onOpenChange?.(open);
  };

  let triggerRef: HTMLElement | null = null;
  let groupRef: HTMLElement | null = null;
  // The roleless root element — scopes the shared segment focus manager and the
  // outer arrow-navigation across BOTH fields, mirroring the single DatePicker's
  // `fieldRef`.
  const [fieldRef, setFieldRef] = createSignal<HTMLDivElement | null>(null);
  const overlayState = {
    get isOpen() {
      return isOpen();
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen()),
  };

  const [internalRangeValue, setInternalRangeValue] = createSignal<RangeValue<T> | null>(
    stateProps.defaultValue ?? null,
  );
  const currentRangeValue = createMemo<RangeValue<T> | null>(() => {
    const controlled = access(stateProps.value);
    return controlled !== undefined ? controlled : internalRangeValue();
  });
  // A complete calendar range with time, kept on the calendar until close when
  // no clock is committed yet and selection does not close the popover.
  const [pendingDateRange, setPendingDateRange] = createSignal<RangeValue<T> | null>(null);
  const setCommittedRangeValue = (value: RangeValue<T> | null) => {
    setPendingDateRange(null);
    if (access(stateProps.value) === undefined) {
      setInternalRangeValue(() => value);
    }
    stateProps.onChange?.(value);
  };
  const rangeGranularity = createMemo<"day" | "hour" | "minute" | "second">(() => {
    if (stateProps.granularity) {
      return stateProps.granularity;
    }
    const value = currentRangeValue()?.start ?? currentRangeValue()?.end;
    if (value && "hour" in value) {
      return "second" in value ? "second" : "minute";
    }
    const placeholder = stateProps.placeholderValue;
    if (!value && placeholder && "minute" in placeholder) {
      return "minute";
    }
    return "day";
  });
  const hasRangeTime = () => {
    const granularity = rangeGranularity();
    return granularity === "hour" || granularity === "minute" || granularity === "second";
  };
  const committedEndsHaveTime = () => {
    const committed = currentRangeValue();
    return Boolean(
      committed?.start && committed.end && "hour" in committed.start && "hour" in committed.end,
    );
  };

  const calendarState = createRangeCalendarState({
    ...stateProps,
    get locale() {
      return access(stateProps.locale);
    },
    value: () => {
      const pending = pendingDateRange();
      if (pending?.start && pending.end) {
        return pending;
      }
      return currentRangeValue();
    },
    // Pin useDateRangePickerState.setDateRange: a time field commits placeholder
    // time (midnight when none is set). Until a clock is committed, a range
    // chosen while the popover stays open is held and committed on close.
    onChange: (value) => {
      const shouldClose = local.shouldCloseOnSelect !== false;
      if (!value?.start || !value.end || !hasRangeTime()) {
        setCommittedRangeValue(value);
        if (value?.start && value.end && shouldClose) {
          setOpen(false);
        }
        return;
      }
      if (shouldClose || committedEndsHaveTime()) {
        setCommittedRangeValue(
          applyRangeTime(value, currentRangeValue(), stateProps.placeholderValue),
        );
        if (shouldClose) {
          setOpen(false);
        }
        return;
      }
      setPendingDateRange(value);
    },
  });

  // Mirror the single DatePicker: RAC re-mounts a FRESH useRangeCalendarState
  // per popover open with autoFocus:true, so isFocused seeds true and the focused
  // cell auto-focuses AND publishes its range-selection prompt describedby
  // ("Click to start selecting date range"). The port shares one persistent
  // range state across opens, so flag it focused on each false->true open
  // transition to reproduce that behavior.
  let wasRangeOpen = false;
  createTrackedEffect(() => {
    const open = overlayState.isOpen;
    if (open && !wasRangeOpen) {
      calendarState.setFocused(true);
    }
    wasRangeOpen = open;
  });

  const isInvalid = createMemo(
    () =>
      Boolean((rest as { isInvalid?: boolean }).isInvalid) ||
      calendarState.validationState() === "invalid",
  );
  const isRequired = createMemo(() => Boolean((rest as { isRequired?: boolean }).isRequired));
  const [startFieldValue, setStartFieldValue] = createSignal(
    (currentRangeValue()?.start ?? null) as never,
  ) as unknown as Signal<T | null>;
  const [endFieldValue, setEndFieldValue] = createSignal(
    (currentRangeValue()?.end ?? null) as never,
  ) as unknown as Signal<T | null>;
  commitPendingRange = () => {
    const pending = pendingDateRange();
    if (!pending?.start || !pending.end || !hasRangeTime()) {
      return;
    }
    const committed = currentRangeValue();
    if (committed?.start && committed.end) {
      return;
    }
    setCommittedRangeValue(applyRangeTime(pending, committed, stateProps.placeholderValue));
  };

  createTrackedEffect(() => {
    const value = currentRangeValue();
    setStartFieldValue(() => value?.start ?? null);
    setEndFieldValue(() => value?.end ?? null);
  });

  const setRangeFieldValue = (part: "start" | "end", nextValue: T | null) => {
    if (part === "start") {
      setStartFieldValue(() => nextValue);
    } else {
      setEndFieldValue(() => nextValue);
    }

    const nextStart = part === "start" ? nextValue : startFieldValue();
    const nextEnd = part === "end" ? nextValue : endFieldValue();

    setCommittedRangeValue(
      nextStart && nextEnd ? ({ start: nextStart, end: nextEnd } as RangeValue<T>) : null,
    );
  };

  const rangeFieldStateProps = {
    minValue: stateProps.minValue,
    maxValue: stateProps.maxValue,
    isDisabled: stateProps.isDisabled,
    isReadOnly: stateProps.isReadOnly,
    isRequired,
    get locale() {
      return access(stateProps.locale);
    },
    granularity: rangeGranularity(),
    hourCycle: stateProps.hourCycle,
    hideTimeZone: stateProps.hideTimeZone,
    placeholderValue: stateProps.placeholderValue,
    validationState: () => (isInvalid() ? "invalid" : access(stateProps.validationState)),
    // The range picker's isDateUnavailable is anchor-aware (date, anchorDate),
    // but a text field has no range anchor, so adapt it to the field's 1-arg form
    // by always passing a null anchor (checks raw per-date availability).
    isDateUnavailable: stateProps.isDateUnavailable
      ? (date: DateValue) => stateProps.isDateUnavailable!(date, null)
      : undefined,
  } satisfies Partial<DateFieldStateProps<T>>;

  const startFieldState = createDateFieldState<T>({
    ...rangeFieldStateProps,
    get locale() {
      return access(stateProps.locale);
    },
    value: startFieldValue,
    onChange: (value) => setRangeFieldValue("start", value),
    // Pin useDateRangePickerState: defaultValue ?? the initial controlled range.
    // An omitted default falls through inside createDateFieldState.
    defaultValue: stateProps.defaultValue?.start,
  });

  const endFieldState = createDateFieldState<T>({
    ...rangeFieldStateProps,
    get locale() {
      return access(stateProps.locale);
    },
    value: endFieldValue,
    onChange: (value) => setRangeFieldValue("end", value),
    defaultValue: stateProps.defaultValue?.end,
  });

  // useFormReset listens on each date field's input. createDateField would also
  // attach native validation to that ref, so these unnamed inputs are reset
  // targets only and are not submitted.
  // Each field's setValue publishes through setRangeFieldValue, which reads the
  // other part's signal. Those writes are not visible to the second listener in
  // the same reset event, so the committed range kept the edited start. Apply
  // both captured defaults, then commit that pair once.
  const [startResetInput, setStartResetInput] = createSignal<HTMLInputElement>();
  const [endResetInput, setEndResetInput] = createSignal<HTMLInputElement>();
  const resetRangeToDefault = () => {
    const start = (startFieldState.defaultValue ?? null) as T | null;
    const end = (endFieldState.defaultValue ?? null) as T | null;
    setStartFieldValue(() => start);
    setEndFieldValue(() => end);
    startFieldState.setValue(start);
    endFieldState.setValue(end);
    setCommittedRangeValue(start && end ? ({ start, end } as RangeValue<T>) : null);
  };
  createFormReset(startResetInput, startFieldState.defaultValue, resetRangeToDefault);
  createFormReset(endResetInput, endFieldState.defaultValue, resetRangeToDefault);

  const hasExplicitName = () =>
    Boolean(
      (rest as Record<string, unknown>)["aria-label"] ||
      (rest as Record<string, unknown>)["aria-labelledby"],
    );
  const stringLabel = (): string | undefined => {
    const label = (rest as Record<string, unknown>).label;
    return typeof label === "string" && label !== "" ? label : undefined;
  };
  // A string label names the picker through DateRangePickerLabel. Slot detection
  // starts only when that string and an explicit aria name are both absent.
  const [labelRef, hasLabel] = useSlot(!hasExplicitName() && stringLabel() === undefined);

  const pickerAria = createDateRangePicker(
    () => ({
      ...(rest as Record<string, unknown>),
      description: (props as { description?: string }).description,
      errorMessage: (props as { errorMessage?: string }).errorMessage,
      // Keep a string label for DateRangePickerLabel. An explicit aria name wins
      // over a child Label. Otherwise the slot flag tells createLabel a label exists.
      label: stringLabel() ?? (hasExplicitName() ? undefined : hasLabel()),
    }),
    calendarState as unknown as RangeCalendarState<DateValue>,
    overlayState as AriaDatePickerState,
    () => fieldRef(),
  );

  // Each range field's presentation field props (stamped role="presentation" +
  // the SHARED focus manager) are fed through createDateField — mirroring RAC's
  // two `<DateInput>`s consuming useDateRangePicker().start/endFieldProps. This
  // names the segments ("month, Start Date" / "month, End Date") and publishes
  // them through the shared hookData WeakMap; the shared focus manager makes arrow
  // keys and auto-advance walk across the start/end boundary.
  const startFieldAria = createDateField(
    () => pickerAria.startFieldProps,
    startFieldState as unknown as DateFieldState<DateValue>,
    () => fieldRef(),
  );
  const endFieldAria = createDateField(
    () => pickerAria.endFieldProps,
    endFieldState as unknown as DateFieldState<DateValue>,
    () => fieldRef(),
  );

  const startFieldContext: DateRangePickerFieldContextValue = {
    state: startFieldState as unknown as DateFieldState<DateValue>,
    aria: {
      labelProps: {},
      // The DateInput group carries createDateField's fieldProps (role="presentation"
      // + arrow-nav bubbling + unicode-bidi isolate), mirroring the standalone
      // DateField's `inputProps ← fieldProps` mapping. NO hiddenInputProps — the
      // range owner renders its HiddenDateInput siblings below.
      get inputProps() {
        return startFieldAria.fieldProps;
      },
      get descriptionProps() {
        return pickerAria.descriptionProps;
      },
      get errorMessageProps() {
        return pickerAria.errorMessageProps;
      },
    },
  };

  const endFieldContext: DateRangePickerFieldContextValue = {
    state: endFieldState as unknown as DateFieldState<DateValue>,
    aria: {
      labelProps: {},
      get inputProps() {
        return endFieldAria.fieldProps;
      },
      get descriptionProps() {
        return pickerAria.descriptionProps;
      },
      get errorMessageProps() {
        return pickerAria.errorMessageProps;
      },
    },
  };

  const contextValue: DateRangePickerContextValue = {
    calendarState: calendarState as unknown as RangeCalendarState<DateValue>,
    startFieldState: startFieldState as unknown as DateFieldState<DateValue>,
    endFieldState: endFieldState as unknown as DateFieldState<DateValue>,
    startFieldContext,
    endFieldContext,
    overlayState,
    triggerRef: () => triggerRef,
    setTriggerRef: (element) => {
      if (!element) return;
      if (!triggerRef || !triggerRef.isConnected) triggerRef = element;
    },
    groupRef: () => groupRef,
    setGroupRef: (element) => {
      if (!element) return;
      groupRef = element;
    },
    pickerAria,
  };

  // RAC DateRangePicker root: useFocusRing({within: true}). Solid's onFocus
  // does not bubble, so the ring listens on onFocusIn/onFocusOut.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing({ within: true });

  const renderValues = createMemo<DateRangePickerRenderProps>(() => ({
    isFocusWithin: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: calendarState.isDisabled(),
    isReadOnly: calendarState.isReadOnly(),
    isRequired: isRequired(),
    isInvalid: isInvalid(),
    isOpen: overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DateRangePicker",
    },
    renderValues,
  );

  // Same calendar trigger as DatePicker: a stable default Button slot, with
  // press DOM handlers left on DateRangePickerButton so the dialog opens once.
  const calendarButtonSlot: ButtonProps = {
    get id() {
      return pickerAria.buttonProps.id as string;
    },
    type: "button",
    get "aria-label"() {
      return pickerAria.buttonProps["aria-label"] as string;
    },
    get "aria-labelledby"() {
      return pickerAria.buttonProps["aria-labelledby"] as string;
    },
    get "aria-describedby"() {
      return pickerAria.buttonProps["aria-describedby"] as string | undefined;
    },
    get "aria-haspopup"() {
      return pickerAria.buttonProps["aria-haspopup"] as "dialog";
    },
    get "aria-expanded"() {
      return pickerAria.buttonProps["aria-expanded"] as boolean;
    },
    get isDisabled() {
      return pickerAria.isButtonDisabled();
    },
    onPress() {
      overlayState.open();
    },
  };
  const buttonContextValue = {
    slots: {
      default: calendarButtonSlot,
    },
  };

  const labelContextValue: LabelProps = {
    get id() {
      if (hasExplicitName() || stringLabel() !== undefined || !hasLabel()) {
        return undefined;
      }
      return pickerAria.labelProps.id as string | undefined;
    },
    ref: labelRef,
    elementType: "span",
  };

  return (
    <DateRangePickerStateContext value={calendarState as unknown as RangeCalendarState<DateValue>}>
      <DateRangePickerContext value={contextValue}>
        <RangeCalendarContext value={calendarState as unknown as RangeCalendarState<DateValue>}>
          {/* BARE ROLELESS root — mirrors RAC `DateRangePicker`'s outer `<div>`.
           * The presentation FieldGroup shell (rendered as a child via the styled
           * DateRangeDisplay) is what carries `pickerAria.groupProps` (role=
           * "presentation" + label/describedby + outer arrow-nav/press). A described
           * or role="group" node here would be a spurious AX entry the S2 oracle
           * lacks. The ref scopes the shared segment focus manager across both
           * fields (see createDateRangePicker). */}
          <div
            {...focusWithinDomProps(focusProps)}
            ref={setFieldRef}
            class={renderProps.class()}
            style={renderProps.style()}
            data-focus-within={dataAttr(isFocused())}
            data-focus-visible={dataAttr(isFocusVisible())}
            data-disabled={dataAttr(calendarState.isDisabled())}
            data-readonly={dataAttr(calendarState.isReadOnly())}
            data-required={dataAttr(isRequired())}
            data-invalid={dataAttr(isInvalid())}
            data-open={dataAttr(overlayState.isOpen)}
          >
            <Provider
              values={
                [
                  [
                    TextContext,
                    {
                      slots: {
                        get description() {
                          return pickerAria.descriptionProps;
                        },
                        get errorMessage() {
                          return pickerAria.errorMessageProps;
                        },
                      },
                    },
                  ],
                  [ButtonContext, buttonContextValue],
                  [LabelContext, labelContextValue],
                ] as Array<[Context<unknown>, unknown]>
              }
            >
              {props.children}
            </Provider>
          </div>
          <input ref={setStartResetInput} type="hidden" tabindex={-1} aria-hidden="true" />
          <input ref={setEndResetInput} type="hidden" tabindex={-1} aria-hidden="true" />
          <Show when={(rest as Record<string, unknown>).startName}>
            <HiddenDateInput
              name={(rest as Record<string, unknown>).startName as string | undefined}
              form={(rest as Record<string, unknown>).form as string | undefined}
              value={() => currentRangeValue()?.start ?? null}
              isDisabled={access(stateProps.isDisabled) ?? false}
              minValue={() => access(stateProps.minValue) as DateValue | undefined}
              maxValue={() => access(stateProps.maxValue) as DateValue | undefined}
              granularity={rangeGranularity()}
            />
          </Show>
          <Show when={(rest as Record<string, unknown>).endName}>
            <HiddenDateInput
              name={(rest as Record<string, unknown>).endName as string | undefined}
              form={(rest as Record<string, unknown>).form as string | undefined}
              value={() => currentRangeValue()?.end ?? null}
              isDisabled={access(stateProps.isDisabled) ?? false}
              minValue={() => access(stateProps.minValue) as DateValue | undefined}
              maxValue={() => access(stateProps.maxValue) as DateValue | undefined}
              granularity={rangeGranularity()}
            />
          </Show>
        </RangeCalendarContext>
      </DateRangePickerContext>
    </DateRangePickerStateContext>
  );
}

/**
 * A button that opens the date picker calendar.
 */
export function DatePickerButton(props: DatePickerButtonProps): JSX.Element {
  const context = useDatePickerContext();

  // Mirror RAC's `buttonProps.isDisabled = props.isDisabled || props.isReadOnly`
  // (a read-only picker can't open its calendar) — `createDatePicker` computes
  // this as `isButtonDisabled()`. Reading `fieldState.isDisabled()` alone would
  // miss the read-only case (read-only ≠ disabled on the field), so the trigger
  // would paint enabled while the S2 oracle dims it.
  const isDisabled = () => context.pickerAria.isButtonDisabled() || (props.isDisabled ?? false);

  // Mirror RAC: the trigger is a `<Button>` whose own `useFocusRing`/`useHover`/
  // `usePress` drive its interaction paint state. The press signal is owned by
  // `createDatePicker` (`isButtonPressed`); focus-visible and hover are wired
  // here so the S2 `focusRing()`/`baseColor()` selectors (`data-focus-visible`,
  // `data-hovered`, `data-pressed`) resolve exactly as they do upstream.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const renderValues = createMemo<DatePickerButtonRenderProps>(() => ({
    isDisabled: isDisabled(),
    isOpen: context.overlayState.isOpen,
    isPressed: context.pickerAria.isButtonPressed(),
    isHovered: isHovered(),
    isFocusVisible: isFocusVisible(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DatePickerButton",
    },
    renderValues,
  );

  // Determine children content - avoid Show for SSR hydration compatibility
  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return props.children ?? "📅";
  };

  const buttonProps = createMemo(() =>
    mergeProps(
      context.pickerAria.buttonProps as Record<string, unknown>,
      focusProps as Record<string, unknown>,
      hoverProps as Record<string, unknown>,
    ),
  );

  return (
    <button
      ref={(el) => {
        context.setTriggerRef(el);
        props.ref?.(el);
      }}
      {...buttonProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      disabled={isDisabled()}
      data-disabled={dataAttr(isDisabled())}
      data-open={dataAttr(context.overlayState.isOpen)}
      data-hovered={dataAttr(isHovered())}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-pressed={dataAttr(context.pickerAria.isButtonPressed())}
    >
      {getChildren()}
    </button>
  );
}

export function DateRangePickerButton(props: DateRangePickerButtonProps): JSX.Element {
  const context = useDateRangePickerContext();

  // Mirror RAC's `buttonProps.isDisabled = props.isDisabled || props.isReadOnly`
  // (a read-only picker can't open its calendar) — `createDateRangePicker` computes
  // this as `isButtonDisabled()`. Reading `calendarState.isDisabled()` alone would
  // miss the read-only case, so the trigger would paint enabled while S2 dims it.
  const isDisabled = () => context.pickerAria.isButtonDisabled() || (props.isDisabled ?? false);

  // Mirror RAC: the trigger is a `<Button>` whose own `useFocusRing`/`useHover`/
  // `usePress` drive its interaction paint state. The press signal is owned by
  // `createDateRangePicker` (`isButtonPressed`); focus-visible and hover are wired
  // here so the S2 `focusRing()`/`baseColor()` selectors (`data-focus-visible`,
  // `data-hovered`, `data-pressed`) resolve exactly as they do upstream.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const renderValues = createMemo<DatePickerButtonRenderProps>(() => ({
    isDisabled: isDisabled(),
    isOpen: context.overlayState.isOpen,
    isPressed: context.pickerAria.isButtonPressed(),
    isHovered: isHovered(),
    isFocusVisible: isFocusVisible(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DateRangePickerButton",
    },
    renderValues,
  );

  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return props.children ?? "📅";
  };

  const buttonProps = createMemo(() =>
    mergeProps(
      context.pickerAria.buttonProps as Record<string, unknown>,
      focusProps as Record<string, unknown>,
      hoverProps as Record<string, unknown>,
    ),
  );

  return (
    <button
      ref={(el) => {
        context.setTriggerRef(el);
        props.ref?.(el);
      }}
      {...buttonProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      disabled={isDisabled()}
      data-disabled={dataAttr(isDisabled())}
      data-open={dataAttr(context.overlayState.isOpen)}
      data-hovered={dataAttr(isHovered())}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-pressed={dataAttr(context.pickerAria.isButtonPressed())}
    >
      {getChildren()}
    </button>
  );
}

/**
 * Render props for the popover surface, mirroring RAC `Popover`'s
 * enter/exit/placement renderProps. The styled layer keys the S2
 * opacity/translate enter transition on these (a renderProps-gated class, not a
 * CSS `[data-entering]` selector).
 */
export interface DatePickerContentRenderProps {
  /** Whether the popover is playing its enter transition (`data-entering`). */
  isEntering: boolean;
  /** Whether the popover is playing its exit transition (`data-exiting`). */
  isExiting: boolean;
  /** The resolved placement axis, for the direction-dependent translate. */
  placement: PlacementAxis | null;
}

export interface DatePickerContentProps extends SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element, or a function of the render props. */
  class?: string | ((renderProps: DatePickerContentRenderProps) => string);
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface DateRangePickerContentProps extends DatePickerContentProps {}

export interface DatePickerLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerLabel(props: DatePickerLabelProps): JSX.Element {
  const context = useDatePickerContext();
  return (
    <span {...context.pickerAria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DatePickerDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerDescription(props: DatePickerDescriptionProps): JSX.Element {
  const context = useDatePickerContext();
  // Rendered as <span> (→ AX role "text"), mirroring S2's <Text slot="description">
  // and the standalone DateFieldDescription — NOT a <p> (paragraph).
  return (
    <span {...context.pickerAria.descriptionProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DatePickerErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerErrorMessage(props: DatePickerErrorMessageProps): JSX.Element {
  const context = useDatePickerContext();
  // Rendered as <span> (→ AX role "text"), mirroring S2's <FieldError> and the
  // standalone DateFieldErrorMessage — NOT a <p> and NOT role="alert".
  return (
    <span {...context.pickerAria.errorMessageProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateRangePickerLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerLabel(props: DateRangePickerLabelProps): JSX.Element {
  const context = useDateRangePickerContext();
  return (
    <span {...context.pickerAria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateRangePickerDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerDescription(props: DateRangePickerDescriptionProps): JSX.Element {
  const context = useDateRangePickerContext();
  // Rendered as <span> (→ AX role "text"), mirroring S2's <Text slot="description">
  // and the single DatePickerDescription — NOT a <p> (paragraph).
  return (
    <span {...context.pickerAria.descriptionProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateRangePickerErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerErrorMessage(props: DateRangePickerErrorMessageProps): JSX.Element {
  const context = useDateRangePickerContext();
  // Rendered as <span> (→ AX role "text"), mirroring S2's <FieldError> and the
  // single DatePickerErrorMessage — NOT a <p> and NOT role="alert".
  return (
    <span {...context.pickerAria.errorMessageProps} class={props.class}>
      {props.children}
    </span>
  );
}

function datePickerContentClass(
  className: DatePickerContentProps["class"],
  defaultClassName: string,
): string | ((renderProps: PopoverRenderProps) => string) {
  if (typeof className === "function") {
    return (renderProps) =>
      className({
        isEntering: renderProps.isEntering,
        isExiting: renderProps.isExiting,
        placement: renderProps.placement,
      });
  }
  return className ?? defaultClassName;
}

/**
 * The content area of the date picker (typically contains a Calendar).
 * Overlay enter/exit is owned by Popover, matching RAC DatePicker which renders
 * a Popover + Dialog and has no private animation machine.
 */
export function DatePickerContent(props: DatePickerContentProps): JSX.Element {
  const context = useDatePickerContext();

  return (
    <Popover
      trigger="DatePicker"
      triggerRef={() => context.groupRef() ?? context.triggerRef()}
      placement="bottom start"
      offset={8}
      isOpen={context.overlayState.isOpen}
      onOpenChange={(open) => {
        if (open) {
          context.overlayState.open();
        } else {
          context.overlayState.close();
        }
      }}
      class={datePickerContentClass(props.class, "solidaria-DatePickerContent")}
      style={props.style}
    >
      <Dialog {...context.pickerAria.dialogProps}>{props.children}</Dialog>
    </Popover>
  );
}

export function DateRangePickerContent(props: DateRangePickerContentProps): JSX.Element {
  const context = useDateRangePickerContext();

  return (
    <Popover
      trigger="DateRangePicker"
      triggerRef={() => context.groupRef() ?? context.triggerRef()}
      placement="bottom start"
      offset={8}
      isOpen={context.overlayState.isOpen}
      onOpenChange={(open) => {
        if (open) {
          context.overlayState.open();
        } else {
          context.overlayState.close();
        }
      }}
      class={datePickerContentClass(props.class, "solidaria-DateRangePickerContent")}
      style={props.style}
    >
      <Dialog {...context.pickerAria.dialogProps}>{props.children}</Dialog>
    </Popover>
  );
}

export { HiddenDateInput } from "./HiddenDateInput";
export type { HiddenDateInputProps } from "./HiddenDateInput";

// DatePickerContextValue is already exported at declaration
