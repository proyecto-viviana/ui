/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/datepicker/useDatePicker.ts

/**
 * createDatePicker hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a date picker
 * component. Faithful port of @react-aria/datepicker `useDatePicker`.
 *
 * The composed picker does NOT re-implement the segmented field; it hands its
 * `fieldProps` (stamped `[roleSymbol]="presentation"`) to `createDateField`,
 * which is what actually names the segments and publishes the value description
 * through the shared `hookData` WeakMap. Here we only provide:
 *  - `groupProps`: a ROLELESS wrapper carrying the outer arrow-navigation
 *    (`createDatePickerGroup` with arrow-nav ENABLED — the inner presentation
 *    field disables its own and lets the key event bubble up to this handler).
 *  - `fieldProps`: the presentation marker + labelledby/describedby + value model.
 *  - `buttonProps` / `dialogProps` / `calendarProps` for the trigger + popover.
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { createField } from "../label/createField";
import { createDescription } from "../utils/createDescription";
import { createFocusManager } from "../focus/FocusScope";
import { createStringFormatter } from "../i18n";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { useLocale } from "../i18n";
import { createPress } from "../interactions/createPress";
import { datePickerStrings } from "./intl";
import { createDatePickerGroup } from "./createDatePickerGroup";
import { roleSymbol } from "./createDateField";
import type { DateFieldState, CalendarState } from "@proyecto-viviana/solid-stately";

export interface AriaDatePickerProps {
  /** An ID for the date picker. */
  id?: string;
  /** A visible label for the date picker. */
  label?: string;
  /** An accessible label for the date picker. */
  "aria-label"?: string;
  /** The ID of an element that labels the date picker. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the date picker. */
  "aria-describedby"?: string;
  /** Whether the date picker is disabled. */
  isDisabled?: boolean;
  /** Whether the date picker is read-only. */
  isReadOnly?: boolean;
  /** Whether the date picker is required. */
  isRequired?: boolean;
  /** Whether the date picker is invalid. */
  isInvalid?: boolean;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** Accessible label for the calendar trigger button. */
  buttonAriaLabel?: string;
  /** Accessible label for the calendar dialog. */
  dialogAriaLabel?: string;
  /** Accessible label for the calendar grid region. */
  calendarAriaLabel?: string;
  /** The minimum allowed date. */
  minValue?: Date;
  /** The maximum allowed date. */
  maxValue?: Date;
  /** Whether a date is unavailable. */
  isDateUnavailable?: (date: unknown) => boolean;
  /** The first day of the week. */
  firstDayOfWeek?: number;
  /** Page behavior for calendar. */
  pageBehavior?: "single" | "visible";
  /** Whether to force leading zeros. */
  shouldForceLeadingZeros?: boolean;
  /** Callback when focus changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Callback when focused. */
  onFocus?: (e: FocusEvent) => void;
  /** Callback when blurred. */
  onBlur?: (e: FocusEvent) => void;
  /** Callback for key down (forwarded to the field when the popover is closed). */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Callback for key up (forwarded to the field when the popover is closed). */
  onKeyUp?: (e: KeyboardEvent) => void;
  /** The name attribute for form submission. */
  name?: string;
  /** The form attribute. */
  form?: string;
  /** Whether HTML form validation is used. */
  validationBehavior?: "aria" | "native";
  /** Auto focus the field. */
  autoFocus?: boolean;
  /** The placeholder value. */
  placeholderValue?: unknown;
  /** Whether to hide the time zone. */
  hideTimeZone?: boolean;
  /** The hour cycle. */
  hourCycle?: 12 | 24;
  /** The granularity. */
  granularity?: "day" | "hour" | "minute" | "second";
}

export interface DatePickerState {
  /** Whether the calendar is open. */
  isOpen: boolean;
  /** Open the calendar. */
  open: () => void;
  /** Close the calendar. */
  close: () => void;
  /** Toggle the calendar. */
  toggle: () => void;
}

export interface DatePickerAria {
  /** Props for the group container. */
  groupProps: Record<string, unknown>;
  /** Props for the label element. */
  labelProps: Record<string, unknown>;
  /** Props for the date field container. */
  fieldProps: Record<string, unknown>;
  /** Props for the button that opens the calendar. */
  buttonProps: Record<string, unknown>;
  /**
   * Whether the trigger button is currently pressed. Upstream RAC renders the
   * trigger as a `<Button>` whose own `usePress` drives its `data-pressed`
   * paint state; the port owns the press here (see `buttonPress`), so it
   * surfaces the same signal for the button element to emit `data-pressed`.
   */
  isButtonPressed: () => boolean;
  /**
   * Whether the trigger button is disabled. Upstream RAC's `buttonProps`
   * carries `isDisabled: props.isDisabled || props.isReadOnly` (a read-only
   * picker can't open its calendar), which drives the `<Button>`'s disabled
   * paint. The port's `buttonProps` only reflects `aria-disabled`, so it
   * surfaces the same signal here for the button's render `isDisabled`.
   */
  isButtonDisabled: () => boolean;
  /** Props for the calendar dialog. */
  dialogProps: Record<string, unknown>;
  /** Props for the calendar. */
  calendarProps: Record<string, unknown>;
  /** Props for the description element. */
  descriptionProps: Record<string, unknown>;
  /** Props for the error message element. */
  errorMessageProps: Record<string, unknown>;
  /** Whether the picker is invalid. */
  isInvalid: boolean;
  /** Validation errors. */
  validationErrors: string[];
  /** Validation details. */
  validationDetails: Record<string, unknown>;
  /** Focus manager for programmatic segment focus. */
  focusManager: {
    focusFirst: () => void;
    focusLast: () => void;
  };
}

/**
 * Provides the behavior and accessibility implementation for a date picker component.
 */
export function createDatePicker<T extends DateFieldState, C extends CalendarState>(
  props: MaybeAccessor<AriaDatePickerProps>,
  state: T,
  overlayState: DatePickerState,
  _calendarState?: C,
  ref: () => HTMLElement | null = () => null,
): DatePickerAria {
  const locale = useLocale();
  const getProps = () => access(props);
  const dialogId = createId();
  const buttonId = createId();
  const fieldId = createId();

  // Label + description/error-message ids, mirroring upstream `useField`.
  const field = createField(() => {
    const p = getProps();
    const dv = state.displayValidation();
    return {
      id: p.id,
      label: p.label,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      description: p.description,
      labelElementType: "span",
      isInvalid: p.isInvalid || dv.isInvalid,
      errorMessage: p.errorMessage || dv.validationErrors,
    };
  });

  // labelledBy = the field label id (or the field id when there is no label),
  // reused by the button and dialog. Mirrors useDatePicker.
  const labelledBy = (): string | undefined => {
    const fp = field.fieldProps as Record<string, string | undefined>;
    return fp["aria-labelledby"] || fp.id;
  };

  // Selected-date description for screen readers: "Selected Date: February 14, 2025".
  const stringFormatter = createStringFormatter(datePickerStrings, "@react-aria/datepicker");
  const valueDescription = createMemo(() => {
    if (!state.value?.()) {
      return "";
    }
    const date = state.formatValue({ month: "long" });
    return date ? stringFormatter().format("selectedDateDescription", { date }) : "";
  });
  const descProps = createDescription(valueDescription);

  // The picker's own describedby = value description + the field's describedby
  // (which already folds in the visible description / error message ids).
  const ariaDescribedBy = (): string | undefined => {
    const fp = field.fieldProps as Record<string, string | undefined>;
    return (
      [descProps["aria-describedby"], fp["aria-describedby"]].filter(Boolean).join(" ") || undefined
    );
  };

  // FieldGroup props. Mirrors RAC `useDatePicker`, whose `groupProps.role` is
  // 'group' (useDatePicker.mjs) — the field label (`aria-labelledby`), describedby
  // (value description + help/error), `aria-disabled`, and the arrow-navigation /
  // press layer all live on this shell. The styled S2 layer OVERRIDES this to
  // role="presentation" at `DatePickerFieldGroup` (S2 seeds its FieldGroup's Group
  // with role="presentation"); keeping the hook faithful to 'group' means a bare
  // RAC-style consumer gets the correct group semantics. The OUTER root stays
  // bare/roleless — putting the describedby on the roleless root would surface a
  // spurious described node in the AX tree that the oracle (bare root) does not
  // have, so it lands on this shell instead. The nested DateInput group is
  // role="presentation" and carries NO aria (createDateField's presentation branch
  // drops it) and lets ArrowLeft/Right bubble up here.
  const outerGroup = createDatePickerGroup(
    {
      setOpen: (isOpen: boolean) => (isOpen ? overlayState.open() : overlayState.close()),
    },
    ref,
    false,
  );

  const groupProps = createMemo(() =>
    mergeProps(outerGroup(), {
      role: "group" as const,
      "aria-disabled": getProps().isDisabled || undefined,
      "aria-labelledby": labelledBy(),
      "aria-describedby": ariaDescribedBy(),
      onKeyDown(e: KeyboardEvent) {
        if (!overlayState.isOpen) {
          getProps().onKeyDown?.(e);
        }
      },
      onKeyUp(e: KeyboardEvent) {
        if (!overlayState.isOpen) {
          getProps().onKeyUp?.(e);
        }
      },
    }),
  );

  // Field props — handed to createDateField, which turns them into the segmented
  // spinbutton group (role="presentation" here) and names the segments.
  const fieldProps = createMemo(() => {
    const p = getProps();
    return mergeProps(field.fieldProps as Record<string, unknown>, {
      id: fieldId,
      [roleSymbol]: "presentation",
      "aria-labelledby": labelledBy(),
      "aria-describedby": ariaDescribedBy(),
      value: state.value?.(),
      defaultValue: state.defaultValue,
      onChange: (value: unknown) => {
        state.setValue?.(value as T extends DateFieldState<infer V> ? V | null : null);
      },
      placeholderValue: p.placeholderValue,
      hideTimeZone: p.hideTimeZone,
      hourCycle: p.hourCycle,
      shouldForceLeadingZeros: p.shouldForceLeadingZeros,
      granularity: p.granularity,
      isDisabled: p.isDisabled || state.isDisabled(),
      isReadOnly: p.isReadOnly || state.isReadOnly(),
      isRequired: p.isRequired || state.isRequired(),
      validationBehavior: p.validationBehavior,
      autoFocus: p.autoFocus,
      name: p.name,
      form: p.form,
    });
  });

  // Trigger button. Disabled when the picker is disabled OR read-only (upstream:
  // `isDisabled: props.isDisabled || props.isReadOnly`).
  const isButtonDisabled = () => {
    const p = getProps();
    return p.isDisabled || state.isDisabled() || p.isReadOnly || state.isReadOnly();
  };

  const buttonPress = createPress({
    get isDisabled() {
      return isButtonDisabled();
    },
    onPress: () => {
      overlayState.open();
    },
  });

  const buttonProps = createMemo(() => {
    const p = getProps();
    return mergeProps(buttonPress.pressProps as Record<string, unknown>, {
      id: buttonId,
      type: "button" as const,
      "aria-haspopup": "dialog" as const,
      "aria-label": p.buttonAriaLabel ?? stringFormatter().format("calendar"),
      "aria-labelledby": `${buttonId} ${labelledBy()}`,
      "aria-describedby": ariaDescribedBy(),
      "aria-expanded": overlayState.isOpen,
      "aria-disabled": isButtonDisabled() || undefined,
      tabIndex: 0,
    });
  });

  // Dialog props. Upstream is only `{id, 'aria-labelledby'}`; the port keeps
  // `role="dialog"` because DatePickerContent spreads these props onto the popover
  // container and this is the only role source there (RAC's Dialog would add it).
  const dialogProps = createMemo(() => ({
    id: dialogId,
    role: "dialog" as const,
    "aria-labelledby": `${buttonId} ${labelledBy()}`,
  }));

  // Calendar props
  const calendarProps = createMemo(() => {
    const p = getProps();
    const defaults = getDatePickerLabelDefaults(locale().locale);
    const currentValue = state.value?.();

    return {
      autoFocus: true,
      value: currentValue,
      onChange: (value: unknown) => {
        if (state.setValue) {
          state.setValue(value as Parameters<typeof state.setValue>[0]);
        }
      },
      minValue: p.minValue,
      maxValue: p.maxValue,
      isDisabled: p.isDisabled || state.isDisabled(),
      isReadOnly: p.isReadOnly || state.isReadOnly(),
      isDateUnavailable: p.isDateUnavailable,
      defaultFocusedValue: currentValue ? undefined : p.placeholderValue,
      isInvalid: p.isInvalid || state.isInvalid(),
      errorMessage:
        typeof p.errorMessage === "string"
          ? p.errorMessage
          : state.isInvalid()
            ? "Invalid date"
            : undefined,
      firstDayOfWeek: p.firstDayOfWeek,
      pageBehavior: p.pageBehavior,
      "aria-label": p.calendarAriaLabel ?? p.dialogAriaLabel ?? defaults.calendar,
    };
  });

  // Label click focuses the first segment.
  const labelFocusManager = createFocusManager(ref);
  const enhancedLabelProps = createMemo(() => ({
    ...(field.labelProps as Record<string, unknown>),
    onClick: () => {
      labelFocusManager.focusFirst();
    },
  }));

  const isInvalid = createMemo(() => {
    const p = getProps();
    return p.isInvalid || state.isInvalid();
  });

  const validationErrors = createMemo(() => state.displayValidation().validationErrors);

  const validationDetails = createMemo(() => {
    const p = getProps();
    return {
      minValue: p.minValue,
      maxValue: p.maxValue,
      isDateUnavailable: p.isDateUnavailable,
      isInvalid: isInvalid(),
    };
  });

  return {
    get groupProps() {
      return groupProps();
    },
    get labelProps() {
      return enhancedLabelProps() as Record<string, unknown>;
    },
    get fieldProps() {
      return fieldProps();
    },
    get buttonProps() {
      return buttonProps();
    },
    isButtonPressed: () => buttonPress.isPressed(),
    isButtonDisabled: () => isButtonDisabled(),
    get dialogProps() {
      return dialogProps();
    },
    get calendarProps() {
      return calendarProps();
    },
    get descriptionProps() {
      return field.descriptionProps as Record<string, unknown>;
    },
    get errorMessageProps() {
      return field.errorMessageProps as Record<string, unknown>;
    },
    get isInvalid() {
      return isInvalid();
    },
    get validationErrors() {
      return validationErrors();
    },
    get validationDetails() {
      return validationDetails();
    },
    focusManager: {
      focusFirst: () => labelFocusManager.focusFirst(),
      focusLast: () => labelFocusManager.focusLast(),
    },
  };
}

function getDatePickerLabelDefaults(locale: string): {
  button: string;
  dialog: string;
  calendar: string;
} {
  const language = locale.toLowerCase().split("-")[0] ?? "en";

  if (language === "es") {
    return {
      button: "Abrir calendario",
      dialog: "Calendario",
      calendar: "Calendario",
    };
  }

  return {
    button: "Open calendar",
    dialog: "Calendar",
    calendar: "Calendar",
  };
}
