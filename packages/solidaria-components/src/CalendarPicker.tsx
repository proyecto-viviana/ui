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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Calendar.tsx

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
