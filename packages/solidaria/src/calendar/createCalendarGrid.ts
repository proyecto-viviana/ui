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
        if (isRTL()) {
          state.focusNextDay();
        } else {
          state.focusPreviousDay();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (isRTL()) {
          state.focusPreviousDay();
        } else {
          state.focusNextDay();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        state.focusPreviousWeek();
        break;
      case "ArrowDown":
        e.preventDefault();
        state.focusNextWeek();
        break;
      case "PageUp":
        e.preventDefault();
        if (e.shiftKey) {
          state.focusPreviousSection(); // Previous year
        } else {
          state.focusPreviousPage(); // Previous month
        }
        break;
      case "PageDown":
        e.preventDefault();
        if (e.shiftKey) {
          state.focusNextSection(); // Next year
        } else {
          state.focusNextPage(); // Next month
        }
        break;
      case "Home":
        e.preventDefault();
        state.focusPageStart();
        break;
      case "End":
        e.preventDefault();
        state.focusPageEnd();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        state.selectFocusedDate();
        break;
      case "Escape":
        if ("setAnchorDate" in state && typeof state.setAnchorDate === "function") {
          e.preventDefault();
          state.setAnchorDate(null);
        }
        break;
    }
  };

  // Grid props
  const gridProps = createMemo(() => ({
    role: "grid",
    "aria-readonly": state.isReadOnly() || undefined,
    "aria-disabled": state.isDisabled() || undefined,
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
