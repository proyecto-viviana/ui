/**
 * createDatePicker hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a date picker component.
 * Based on @react-aria/datepicker useDatePicker
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { createLabel } from "../label/createLabel";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { useLocale } from "../i18n";
import { createPress } from "../interactions/createPress";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
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
  /** The name attribute for form submission. */
  name?: string;
  /** The form attribute. */
  form?: string;
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
  } & {
    /** @internal Wires the actual focus implementations from the component layer */
    _register?: (first: () => void, last: () => void) => void;
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
): DatePickerAria {
  const locale = useLocale();
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const descriptionId = createId();
  const errorMessageId = createId();
  const dialogId = createId();
  const buttonId = createId();
  const fieldId = createId();

  // Create label handling
  const { labelProps, fieldProps: labelFieldProps } = createLabel({
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (valueDescription()) {
      ids.push(valueDescriptionId);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if ((p.isInvalid || state.isInvalid()) && p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  // Selected date description for screen readers
  const valueDescriptionId = createId();
  const valueDescription = createMemo(() => {
    const v = state.value?.();
    if (!v) return "";
    const formatter = new DateFormatter(locale().locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(v.toDate(getLocalTimeZone()));
  });

  // Group props
  const groupProps = createMemo(() => {
    const p = getProps();
    const isInvalid = p.isInvalid || state.isInvalid();
    const describedBy = getAriaDescribedBy();
    const labelField = labelFieldProps as Record<string, unknown>;

    return {
      id,
      role: "group",
      "aria-label": labelField["aria-label"] || undefined,
      "aria-labelledby": labelField["aria-labelledby"] || undefined,
      "aria-disabled": p.isDisabled || state.isDisabled() || undefined,
      "aria-readonly": p.isReadOnly || state.isReadOnly() || undefined,
      "aria-required": p.isRequired || state.isRequired() || undefined,
      "aria-invalid": isInvalid || undefined,
      "aria-describedby": describedBy,
    };
  });

  // Field props - applied to DateInput container
  const fieldProps = createMemo(() => {
    const p = getProps();
    const describedBy = getAriaDescribedBy();

    return {
      id: fieldId,
      "aria-describedby": describedBy,
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
      autoFocus: p.autoFocus,
      name: p.name,
      form: p.form,
    };
  });

  // Button props with createPress for keyboard/mouse/touch activation
  const buttonPress = createPress({
    get isDisabled() {
      const p = getProps();
      return p.isDisabled || state.isDisabled();
    },
    onPress: () => {
      overlayState.open();
    },
  });

  const buttonProps = createMemo(() => {
    const p = getProps();
    const isDisabled = p.isDisabled || state.isDisabled();
    const defaults = getDatePickerLabelDefaults(locale().locale);
    const labelId = (labelProps as Record<string, unknown>)["id"] as string | undefined;
    const labelledBy = labelId ? `${buttonId} ${labelId}` : buttonId;
    const describedBy = getAriaDescribedBy();

    return mergeProps(buttonPress.pressProps as Record<string, unknown>, {
      id: buttonId,
      type: "button" as const,
      "aria-label": p.buttonAriaLabel ?? defaults.button,
      "aria-labelledby": labelledBy,
      "aria-haspopup": "dialog" as const,
      "aria-expanded": overlayState.isOpen,
      "aria-controls": overlayState.isOpen ? dialogId : undefined,
      "aria-describedby": describedBy,
      "aria-disabled": isDisabled || undefined,
      tabIndex: 0,
    });
  });

  // Dialog props
  const dialogProps = createMemo(() => {
    const p = getProps();
    const defaults = getDatePickerLabelDefaults(locale().locale);
    const labelId = (labelProps as Record<string, unknown>)["id"] as string | undefined;
    const labelledBy = labelId ? `${buttonId} ${labelId}` : buttonId;

    return {
      id: dialogId,
      role: "dialog",
      "aria-modal": true,
      "aria-labelledby": labelledBy,
      "aria-label": p.dialogAriaLabel ?? defaults.dialog,
    };
  });

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

  // Description props for the description element
  const descriptionProps = createMemo(() => ({
    id: descriptionId,
  }));

  // Value description element props
  const valueDescriptionProps = createMemo(() => ({
    id: valueDescriptionId,
    "aria-hidden": true,
  }));

  // Error message props
  const errorMessageProps = createMemo(() => ({
    id: errorMessageId,
    role: "alert",
  }));

  // Label click focuses first segment — component layer wires the actual ref
  let focusFirstSegment: (() => void) | undefined;
  let focusLastSegment: (() => void) | undefined;

  const enhancedLabelProps = createMemo(() => {
    return {
      ...labelProps,
      onClick: () => {
        focusFirstSegment?.();
      },
    };
  });

  const isInvalid = createMemo(() => {
    const p = getProps();
    return p.isInvalid || state.isInvalid();
  });

  const validationErrors = createMemo(() => {
    const p = getProps();
    if (p.isInvalid && typeof p.errorMessage === "string") {
      return [p.errorMessage];
    }
    return [];
  });

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
    get dialogProps() {
      return dialogProps();
    },
    get calendarProps() {
      return calendarProps();
    },
    get descriptionProps() {
      return descriptionProps();
    },
    get errorMessageProps() {
      return errorMessageProps();
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
      focusFirst: () => focusFirstSegment?.(),
      focusLast: () => focusLastSegment?.(),
      /** @internal Wires the actual focus implementations from the component layer */
      _register: (first: () => void, last: () => void) => {
        focusFirstSegment = first;
        focusLastSegment = last;
      },
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
