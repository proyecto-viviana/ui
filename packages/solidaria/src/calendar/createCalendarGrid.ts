/**
 * createCalendarGrid hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a calendar grid.
 * Based on @react-aria/calendar useCalendarGrid
 */

import { createMemo } from "solid-js";
import { DateFormatter, startOfWeek, today } from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { CalendarState, CalendarDate } from "@proyecto-viviana/solid-stately";

export interface AriaCalendarGridProps {
  /** The start date of the grid (defaults to start of focused month). */
  startDate?: CalendarDate;
  /** The end date of the grid (defaults to end of focused month). */
  endDate?: CalendarDate;
  /** The number of weeks to display. */
  weekdayStyle?: "narrow" | "short" | "long";
}

export interface CalendarGridAria {
  /** Props for the grid element (table or grid role). */
  gridProps: Record<string, unknown>;
  /** Props for the header row. */
  headerProps: Record<string, unknown>;
  /** Week day labels for the header. */
  weekDays: string[];
}

/**
 * Provides the behavior and accessibility implementation for a calendar grid.
 */
export function createCalendarGrid<T extends CalendarState>(
  props: MaybeAccessor<AriaCalendarGridProps>,
  state: T,
  ref?: () => HTMLElement | null,
): CalendarGridAria {
  // Week days for headers
  const weekDays = createMemo(() => {
    const gridProps = access(props);
    const formatter = new DateFormatter(state.locale(), {
      weekday: gridProps.weekdayStyle ?? "narrow",
      timeZone: state.timeZone,
    });
    const weekStart = startOfWeek(today(state.timeZone), state.locale(), state.firstDayOfWeek());

    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(weekStart.add({ days: index }).toDate(state.timeZone)),
    );
  });

  // Handle keyboard navigation
  const isRTL = (): boolean => {
    const element = ref?.();
    const scopedDirection = element?.closest("[dir]")?.getAttribute("dir");
    const documentDirection = typeof document !== "undefined" ? document.dir : "";
    return (scopedDirection ?? documentDirection) === "rtl";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (state.isDisabled()) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        if (isRTL()) {
          state.focusNextDay();
        } else {
          state.focusPreviousDay();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        if (isRTL()) {
          state.focusPreviousDay();
        } else {
          state.focusNextDay();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        state.focusPreviousWeek();
        break;
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        state.focusNextWeek();
        break;
      case "PageUp":
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          state.focusPreviousSection(); // Previous year
        } else {
          state.setFocusedDate(state.focusedDate().subtract({ months: 1 }));
        }
        break;
      case "PageDown":
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          state.focusNextSection(); // Next year
        } else {
          state.setFocusedDate(state.focusedDate().add({ months: 1 }));
        }
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        state.focusPageStart();
        break;
      case "End":
        e.preventDefault();
        e.stopPropagation();
        state.focusPageEnd();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        state.selectFocusedDate();
        break;
      case "Escape":
        if (
          "anchorDate" in state &&
          typeof state.anchorDate === "function" &&
          state.anchorDate() &&
          "setAnchorDate" in state &&
          typeof state.setAnchorDate === "function"
        ) {
          e.preventDefault();
          e.stopPropagation();
          state.setAnchorDate(null);
          if ("setDragging" in state && typeof state.setDragging === "function") {
            state.setDragging(false);
          }
        }
        break;
    }
  };

  // Whether more than one date can be selected at once. Mirrors
  // @react-aria/calendar useCalendarGrid: true for a RangeCalendar (highlightable
  // range) or a Calendar in multiple-selection mode.
  const isMultiSelectable = (): boolean => {
    if ("highlightedRange" in state) {
      return true;
    }
    return (
      "selectionMode" in state &&
      typeof state.selectionMode === "function" &&
      state.selectionMode() === "multiple"
    );
  };

  // Grid props
  const gridProps = createMemo(() => ({
    role: "grid",
    "aria-readonly": state.isReadOnly() || undefined,
    "aria-disabled": state.isDisabled() || undefined,
    "aria-multiselectable": isMultiSelectable() || undefined,
    tabIndex: state.isFocused() ? 0 : -1,
    onFocus: () => state.setFocused(true),
    onBlur: () => state.setFocused(false),
    onKeyDown: handleKeyDown,
  }));

  // Header props are intentionally empty. Consumers render this on <thead>,
  // which already has correct table semantics.
  const headerProps = createMemo(() => ({}));

  return {
    get gridProps() {
      return gridProps();
    },
    get headerProps() {
      return headerProps();
    },
    get weekDays() {
      return weekDays();
    },
  };
}
