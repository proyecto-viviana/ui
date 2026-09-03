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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/calendar/useCalendar.ts

/**
 * createCalendar hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a calendar component.
 * Based on @react-aria/calendar useCalendar
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import type { CalendarState } from "@proyecto-viviana/solid-stately";
import { formatVisibleRangeDescription, setCalendarHookData } from "./utils";
import { formatCalendarLabel } from "./intl";

export interface AriaCalendarProps {
  /** An ID for the calendar. */
  id?: string;
  /** Whether the calendar is disabled. */
  isDisabled?: boolean;
  /** Whether the calendar is read-only. */
  isReadOnly?: boolean;
  /** An accessible label for the calendar. */
  "aria-label"?: string;
  /** The ID of an element that labels the calendar. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the calendar. */
  "aria-describedby"?: string;
  /** The ID of an element that provides additional details about the calendar. */
  "aria-details"?: string;
  /** Whether the current selection is invalid. */
  isInvalid?: boolean;
  /** Error message rendered for invalid selections. */
  errorMessage?: string;
  /** ID of the rendered error message element. */
  errorMessageId?: string;
  /** Minimum number of visible months. */
  visibleMonths?: number;
}

export interface CalendarAria {
  /** Props for the calendar container element. */
  calendarProps: Record<string, unknown>;
  /** Props for the previous button. */
  prevButtonProps: Record<string, unknown>;
  /** Props for the next button. */
  nextButtonProps: Record<string, unknown>;
  /** Props for the title/heading element. */
  titleProps: Record<string, unknown>;
  /** Props for the error message element, if any. */
  errorMessageProps: Record<string, unknown>;
  /** An accessible label for the title. */
  title: string;
}

/**
 * Provides the behavior and accessibility implementation for a calendar component.
 */
export function createCalendar<T extends CalendarState>(
  props: MaybeAccessor<AriaCalendarProps>,
  state: T,
): CalendarAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const titleId = createId();
  const errorMessageId = createId(getProps().errorMessageId);

  // Title (e.g., "December 2024")
  const title = createMemo(() => state.title());
  const visibleRangeDescription = createMemo(() => {
    const range = state.visibleRange();
    return formatVisibleRangeDescription(range.start, range.end, state.timeZone, state.locale());
  });
  const calendarLabel = createMemo(() => {
    const p = getProps();
    return [p["aria-label"], visibleRangeDescription()].filter(Boolean).join(", ");
  });

  const initialProps = getProps();
  if (
    initialProps.id ||
    initialProps["aria-label"] ||
    initialProps["aria-labelledby"] ||
    initialProps["aria-describedby"] ||
    initialProps["aria-details"] ||
    initialProps.errorMessage ||
    initialProps.errorMessageId
  ) {
    setCalendarHookData(state, {
      errorMessageId:
        initialProps.errorMessage || initialProps.errorMessageId ? errorMessageId : undefined,
      ariaLabel: initialProps["aria-label"],
      ariaLabelledBy: initialProps["aria-labelledby"],
    });
  }

  // Previous button props
  const prevButtonProps = createMemo(() => {
    const p = getProps();
    const isDisabled = p.isDisabled || state.isDisabled() || state.isPreviousVisibleRangeInvalid();

    return {
      "aria-label": formatCalendarLabel(state.locale(), "previous"),
      onClick: () => {
        if (!isDisabled) {
          // RAC Button preventFocusOnPress keeps the nav button as the focused
          // element; Solid's native click races a sync cell-focus effect. Clear
          // calendar-level focus so cells do not steal (#279).
          state.setFocused(false);
          state.focusPreviousPage();
        }
      },
      disabled: isDisabled,
    };
  });

  // Next button props
  const nextButtonProps = createMemo(() => {
    const p = getProps();
    const isDisabled = p.isDisabled || state.isDisabled() || state.isNextVisibleRangeInvalid();

    return {
      "aria-label": formatCalendarLabel(state.locale(), "next"),
      onClick: () => {
        if (!isDisabled) {
          state.setFocused(false);
          state.focusNextPage();
        }
      },
      disabled: isDisabled,
    };
  });

  // Title props
  const titleProps = createMemo(() => ({
    id: titleId,
    "aria-live": "polite" as const,
  }));
  const errorMessageProps = createMemo(() => ({
    id: errorMessageId,
  }));

  // Calendar container props
  const calendarProps = createMemo(() => {
    const p = getProps();

    return mergeProps({
      id,
      role: "application",
      "aria-labelledby": p["aria-labelledby"],
      "aria-label": calendarLabel(),
      "aria-describedby": p["aria-describedby"],
      "aria-details": p["aria-details"],
    });
  });

  return {
    get calendarProps() {
      return calendarProps();
    },
    get prevButtonProps() {
      return prevButtonProps();
    },
    get nextButtonProps() {
      return nextButtonProps();
    },
    get titleProps() {
      return titleProps();
    },
    get errorMessageProps() {
      return errorMessageProps();
    },
    get title() {
      return title();
    },
  };
}
