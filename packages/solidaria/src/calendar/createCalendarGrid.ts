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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/calendar/useCalendarGrid.ts

/**
 * createCalendarGrid hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a calendar grid.
 * Based on @react-aria/calendar useCalendarGrid
 */

import { createMemo } from "solid-js";
import { DateFormatter, startOfWeek, today } from "@internationalized/date";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { useLocale } from "../i18n";
import type { CalendarState, CalendarDate } from "@proyecto-viviana/solid-stately";
import { formatVisibleRangeDescription, getCalendarHookData } from "./utils";

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
  _ref?: () => HTMLElement | null,
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

  // Handle keyboard navigation. Direction comes from I18nProvider via
  // useLocale — not document.dir or a [dir] ancestor (RAC useCalendarGrid).
  const locale = useLocale();
  const isRTL = (): boolean => locale().direction === "rtl";

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
      case " ": {
        e.preventDefault();
        const rangeState = state as CalendarState & {
          anchorDate?: () => CalendarDate | null;
          focusNearestAvailableDate?: (date: CalendarDate) => void;
        };
        const hadAnchor = rangeState.anchorDate?.() != null;
        state.selectFocusedDate();
        // RAC `useCalendarCell` keyboard press auto-advances after range start.
        // Cells here are `role="button"` divs, so grid Enter is the keyboard
        // path (usePress stopPropagation is not on the cell).
        if (!hadAnchor) {
          rangeState.focusNearestAvailableDate?.(state.focusedDate());
        }
        break;
      }
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

  // The grid's accessible name combines the calendar's label with a description
  // of this grid's visible month/range, mirroring @react-aria/calendar
  // useCalendarGrid (useVisibleRangeDescription over the grid's own start/end so
  // multi-month calendars name each grid by its own month).
  const visibleRangeDescription = createMemo(() => {
    const gridProps = access(props);
    const start = gridProps.startDate ?? state.visibleRange().start;
    const end = gridProps.endDate ?? state.visibleRange().end;
    return formatVisibleRangeDescription(start, end, state.timeZone, state.locale());
  });

  // Grid props
  const gridProps = createMemo(() => {
    const data = getCalendarHookData(state);
    const gridLabel = [data?.ariaLabel, visibleRangeDescription()].filter(Boolean).join(", ");

    return {
      role: "grid",
      "aria-label": gridLabel || undefined,
      "aria-labelledby": data?.ariaLabelledBy,
      "aria-readonly": state.isReadOnly() || undefined,
      "aria-disabled": state.isDisabled() || undefined,
      "aria-multiselectable": isMultiSelectable() || undefined,
      onFocus: () => state.setFocused(true),
      onBlur: () => state.setFocused(false),
      onKeyDown: handleKeyDown,
    };
  });

  // Column headers are hidden to screen readers to make navigating with a touch
  // screen reader easier — the day names are already included in each cell's
  // label, so there's no need to announce them twice. Consumers render this on
  // <thead>. Mirrors @react-aria/calendar useCalendarGrid headerProps.
  const headerProps = createMemo(() => ({ "aria-hidden": true }));

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
