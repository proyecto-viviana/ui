/**
 * CalendarMonthPicker / CalendarYearPicker components for solidaria-components
 *
 * Headless month/year "jump-to" pickers shared by Calendar and RangeCalendar.
 * Each reads whichever calendar state context is present and renders through a
 * child function, mirroring the single context-agnostic components upstream.
 * Port of react-aria-components/src/Calendar.tsx (CalendarMonthPicker /
 * CalendarYearPicker).
 */

import { type JSX, useContext } from "solid-js";

import {
  createCalendarMonthPicker,
  createCalendarYearPicker,
  type CalendarMonthPickerProps as AriaCalendarMonthPickerProps,
  type CalendarMonthPickerAria,
  type CalendarYearPickerProps as AriaCalendarYearPickerProps,
  type CalendarYearPickerAria,
} from "@proyecto-viviana/solidaria";

import { CalendarContext } from "./Calendar";
import { RangeCalendarContext } from "./RangeCalendar";

export type {
  CalendarMonthPickerAria,
  CalendarMonthPickerItem,
  CalendarYearPickerAria,
  CalendarYearPickerItem,
  CalendarYearPickerFormatOptions,
} from "@proyecto-viviana/solidaria";

export interface CalendarMonthPickerProps extends AriaCalendarMonthPickerProps {
  /** A function that renders the month picker from its accessible props. */
  children: (renderProps: CalendarMonthPickerAria) => JSX.Element;
}

/**
 * A CalendarMonthPicker renders the list of months in the focused year so the
 * user can jump the calendar's focus to a different month. It works within both
 * a Calendar and a RangeCalendar.
 */
export function CalendarMonthPicker(props: CalendarMonthPickerProps): JSX.Element {
  const calendarState = useContext(CalendarContext);
  const rangeCalendarState = useContext(RangeCalendarContext);
  const state = calendarState ?? rangeCalendarState;
  if (!state) {
    throw new Error("CalendarMonthPicker must be used within a Calendar or RangeCalendar");
  }
  const aria = createCalendarMonthPicker(props, state);
  return props.children(aria);
}

export interface CalendarYearPickerProps extends AriaCalendarYearPickerProps {
  /** A function that renders the year picker from its accessible props. */
  children: (renderProps: CalendarYearPickerAria) => JSX.Element;
}

/**
 * A CalendarYearPicker renders a sliding window of years so the user can jump
 * the calendar's focus to a different year. It works within both a Calendar and
 * a RangeCalendar.
 */
export function CalendarYearPicker(props: CalendarYearPickerProps): JSX.Element {
  const calendarState = useContext(CalendarContext);
  const rangeCalendarState = useContext(RangeCalendarContext);
  const state = calendarState ?? rangeCalendarState;
  if (!state) {
    throw new Error("CalendarYearPicker must be used within a Calendar or RangeCalendar");
  }
  const aria = createCalendarYearPicker(props, state);
  return props.children(aria);
}
