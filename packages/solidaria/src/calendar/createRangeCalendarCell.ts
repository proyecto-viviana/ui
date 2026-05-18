/**
 * createRangeCalendarCell hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a range calendar cell.
 * Based on @react-aria/calendar useCalendarCell (with range support)
 */

import { createSignal, createMemo, createEffect } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { focusSafely } from "../utils/focus";
import type { RangeCalendarState, CalendarDate, DateValue } from "@proyecto-viviana/solid-stately";
import { isToday as isTodayUtil, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { getCalendarHookData } from "./utils";

export interface AriaRangeCalendarCellProps {
  /** The date represented by the cell. */
  date: DateValue;
  /** Whether the cell is disabled. */
  isDisabled?: boolean;
  /** Whether the date is outside the current month grid. */
  isOutsideMonth?: boolean;
}

export interface RangeCalendarCellAria {
  /** Props for the cell element (td or gridcell). */
  cellProps: Record<string, unknown>;
  /** Props for the button inside the cell. */
  buttonProps: Record<string, unknown>;
  /** Whether the cell is within the selected range. */
  isSelected: boolean;
  /** Whether the cell is the start of the selection. */
  isSelectionStart: boolean;
  /** Whether the cell is the end of the selection. */
  isSelectionEnd: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
  /** Whether the cell is disabled. */
  isDisabled: boolean;
  /** Whether the cell is unavailable (e.g., booked date). */
  isUnavailable: boolean;
  /** Whether the cell is part of an invalid selection. */
  isInvalid: boolean;
  /** Whether the cell is outside the visible month. */
  isOutsideMonth: boolean;
  /** Whether the cell represents today. */
  isToday: boolean;
  /** Whether the cell is pressed. */
  isPressed: boolean;
  /** The formatted date string. */
  formattedDate: string;
}

/**
 * Provides the behavior and accessibility implementation for a range calendar cell.
 */
export function createRangeCalendarCell<T extends RangeCalendarState>(
  props: MaybeAccessor<AriaRangeCalendarCellProps>,
  state: T,
  ref?: () => HTMLElement | null,
): RangeCalendarCellAria {
  const getProps = () => access(props);
  const [isPressed, setIsPressed] = createSignal(false);
  const timeZone = getLocalTimeZone();

  // Get the date from props
  const date = createMemo(() => getProps().date as CalendarDate);

  // Check states
  const isSelected = createMemo(() => state.isSelected(date()));
  const isSelectionStart = createMemo(() => state.isSelectionStart(date()));
  const isSelectionEnd = createMemo(() => state.isSelectionEnd(date()));
  const isFocused = createMemo(() => state.isCellFocused(date()));
  const isInvalid = createMemo(() => {
    const range = state.highlightedRange();
    const d = date();
    return (
      state.isValueInvalid() &&
      !state.anchorDate() &&
      !!range &&
      d.compare(range.start) >= 0 &&
      d.compare(range.end) <= 0
    );
  });
  const isDisabled = createMemo(() => {
    return getProps().isDisabled || state.isCellDisabled(date());
  });
  const isUnavailable = createMemo(() => state.isCellUnavailable(date()));
  const isOutsideMonth = createMemo(() => {
    return getProps().isOutsideMonth ?? state.isOutsideVisibleRange(date());
  });
  const isToday = createMemo(() => isTodayUtil(date(), timeZone));

  // Format the date for display
  const formattedDate = createMemo(() => {
    return date().day.toString();
  });

  // Handle pointer down - selection on pointerdown avoids losing selection when
  // hover/focus updates re-render cells before click fires.
  const handlePointerDown = (e: PointerEvent) => {
    if (!isDisabled() && !isUnavailable()) {
      setIsPressed(true);
      state.selectDate(date());
      e.preventDefault();
    }
  };

  // Handle click for keyboard activation (Enter/Space).
  const handleClick = () => {
    if (!isDisabled() && !isUnavailable()) {
      state.selectDate(date());
    }
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  // Handle hover during range selection
  const handlePointerEnter = () => {
    if (state.isDragging() && !isDisabled() && !isUnavailable()) {
      state.setFocusedDate(date());
    }
  };

  // Keep DOM focus synchronized with focused date updates.
  // Use focusSafely (preventScroll) to match @react-aria/calendar — bare focus()
  // causes the browser to auto-scroll the page when bringing the cell into view,
  // which is wrong inside a popover.
  createEffect(() => {
    const element = ref?.();
    if (element && isFocused()) {
      focusSafely(element);
    }
  });

  // Cell props (for the td element)
  const cellProps = createMemo(() => ({
    role: "gridcell",
    "aria-disabled": isDisabled() || isUnavailable() || undefined,
    "aria-selected": isSelected() || undefined,
    "aria-invalid": isInvalid() || undefined,
  }));

  // Button props (for the interactive element inside)
  const buttonProps = createMemo(() => {
    const d = date();
    const formatter = new DateFormatter(state.locale(), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: d.calendar.identifier,
    });
    const errorMessageId = getCalendarHookData(state)?.errorMessageId;

    return {
      role: "button",
      tabIndex: isFocused() ? 0 : -1,
      "aria-label": formatter.format(d.toDate(timeZone)),
      "aria-disabled": isDisabled() || isUnavailable() || undefined,
      "aria-invalid": isInvalid() || undefined,
      "aria-describedby": isInvalid() ? errorMessageId : undefined,
      "aria-pressed": isPressed() || undefined,
      disabled: isDisabled() || isUnavailable(),
      onClick: handleClick,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onPointerEnter: handlePointerEnter,
      onFocus: () => {
        if (!state.isCellFocused(d)) {
          state.setFocusedDate(d);
        }
        state.setFocused(true);
      },
    };
  });

  return {
    get cellProps() {
      return cellProps();
    },
    get buttonProps() {
      return buttonProps();
    },
    get isSelected() {
      return isSelected();
    },
    get isSelectionStart() {
      return isSelectionStart();
    },
    get isSelectionEnd() {
      return isSelectionEnd();
    },
    get isFocused() {
      return isFocused();
    },
    get isDisabled() {
      return isDisabled();
    },
    get isUnavailable() {
      return isUnavailable();
    },
    get isInvalid() {
      return isInvalid();
    },
    get isOutsideMonth() {
      return isOutsideMonth();
    },
    get isToday() {
      return isToday();
    },
    get isPressed() {
      return isPressed();
    },
    get formattedDate() {
      return formattedDate();
    },
  };
}
