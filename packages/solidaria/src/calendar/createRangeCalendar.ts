/**
 * createRangeCalendar hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a range calendar component.
 * Based on @react-aria/calendar useRangeCalendar
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import type { RangeCalendarState } from "@proyecto-viviana/solid-stately";
import {
  formatSelectedDateDescription,
  formatVisibleRangeDescription,
  getCalendarHookData,
  setCalendarHookData,
} from "./utils";

export interface AriaRangeCalendarProps {
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
}

export interface RangeCalendarAria {
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
 * Provides the behavior and accessibility implementation for a range calendar component.
 */
export function createRangeCalendar<T extends RangeCalendarState>(
  props: MaybeAccessor<AriaRangeCalendarProps>,
  state: T,
): RangeCalendarAria {
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
  const selectedDateDescription = createMemo(() => formatSelectedDateDescription(state));

  const initialProps = getProps();
  const existingHookData = getCalendarHookData(state);
  setCalendarHookData(state, {
    errorMessageId:
      initialProps.errorMessage || initialProps.errorMessageId
        ? errorMessageId
        : existingHookData?.errorMessageId,
    get selectedDateDescription() {
      return selectedDateDescription();
    },
  });

  // Previous button props
  const prevButtonProps = createMemo(() => {
    const p = getProps();
    const isDisabled = p.isDisabled || state.isDisabled() || state.isPreviousVisibleRangeInvalid();

    return {
      "aria-label": "Previous month",
      onClick: () => {
        if (!isDisabled) {
          state.focusPreviousPage();
        }
      },
      disabled: isDisabled,
      tabIndex: -1,
    };
  });

  // Next button props
  const nextButtonProps = createMemo(() => {
    const p = getProps();
    const isDisabled = p.isDisabled || state.isDisabled() || state.isNextVisibleRangeInvalid();

    return {
      "aria-label": "Next month",
      onClick: () => {
        if (!isDisabled) {
          state.focusNextPage();
        }
      },
      disabled: isDisabled,
      tabIndex: -1,
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
