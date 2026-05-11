/**
 * Datepicker compatibility surface.
 *
 * This is a module-compat shim that maps React Stately datepicker hook names
 * to existing Solid stately primitives.
 */

export {
  createDateFieldState,
  createTimeFieldState,
  createRangeCalendarState,
  createDatePickerState,
  type DateFieldStateProps as DateFieldStateOptions,
  type DateFieldState,
  type DateSegment,
  type DateSegmentType as SegmentType,
  type TimeFieldStateProps as TimeFieldStateOptions,
  type TimeFieldState,
  type TimeSegment,
  type TimeSegmentType,
  type RangeCalendarStateProps as DateRangePickerStateOptions,
  type RangeCalendarState as DateRangePickerState,
  type DatePickerState,
  type DatePickerStateOptions,
} from "../calendar";

export {
  createDateFieldState as useDateFieldState,
  createTimeFieldState as useTimeFieldState,
  createRangeCalendarState as useDateRangePickerState,
  createDatePickerState as useDatePickerState,
} from "../calendar";
