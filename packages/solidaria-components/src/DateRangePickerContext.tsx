/**
 * Local Solid context shared by the date-range picker fields.
 * The owning DatePicker module records the upstream component source.
 */

import { createContext, useContext } from "solid-js";
import { type createDateRangePicker } from "@proyecto-viviana/solidaria";
import {
  type DateFieldState,
  type DateValue,
  type RangeCalendarState,
} from "@proyecto-viviana/solid-stately";

export interface DateRangePickerFieldContextValue {
  state: DateFieldState<DateValue>;
  aria: {
    labelProps: Record<string, unknown>;
    inputProps: Record<string, unknown>;
    /** Optional hidden validation <input> props (unused by the range fields). */
    hiddenInputProps?: Record<string, unknown>;
    descriptionProps: Record<string, unknown>;
    errorMessageProps: Record<string, unknown>;
  };
}

export interface DateRangePickerContextValue {
  calendarState: RangeCalendarState<DateValue>;
  startFieldState: DateFieldState<DateValue>;
  endFieldState: DateFieldState<DateValue>;
  startFieldContext: DateRangePickerFieldContextValue;
  endFieldContext: DateRangePickerFieldContextValue;
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
  pickerAria: ReturnType<typeof createDateRangePicker>;
}

export const DateRangePickerContext = createContext<DateRangePickerContextValue | null>(null);

export function useDateRangePickerContext(): DateRangePickerContextValue {
  const context = useContext(DateRangePickerContext);
  if (!context) {
    throw new Error("DateRangePicker components must be used within a DateRangePicker");
  }
  return context;
}
