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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/calendar/useCalendarCell.ts

/**
 * createCalendarCell hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a calendar cell.
 * Based on @react-aria/calendar useCalendarCell
 */

import { createSignal, createMemo, createEffect, onCleanup, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { focusSafely } from "../utils/focus";
import { scrollIntoViewport, getScrollParent } from "../utils";
import { createFocusRing } from "../interactions/createFocusRing";
import { getInteractionModality } from "../interactions/createInteractionModality";
import { useLocale } from "../i18n";
import { mergeProps } from "../utils/mergeProps";
import type { CalendarState, CalendarDate, DateValue } from "@proyecto-viviana/solid-stately";
import {
  isToday as isTodayUtil,
  DateFormatter,
  getLocalTimeZone,
  isSameDay,
} from "@internationalized/date";
import { getCalendarHookData } from "./utils";
import { formatCalendarLabel } from "./intl";

export interface AriaCalendarCellProps {
  /** The date represented by the cell. */
  date: DateValue;
  /** Whether the cell is disabled. */
  isDisabled?: boolean;
  /** Whether the date is outside the current month grid. */
  isOutsideMonth?: boolean;
}

export interface CalendarCellAria {
  /** Props for the cell element (td or gridcell). */
  cellProps: Record<string, unknown>;
  /** Props for the button inside the cell. */
  buttonProps: Record<string, unknown>;
  /** Whether the cell is selected. */
  isSelected: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
  /** Whether the cell should display a keyboard focus ring. */
  isFocusVisible: boolean;
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
 * Provides the behavior and accessibility implementation for a calendar cell.
 */
export function createCalendarCell<T extends CalendarState>(
  props: MaybeAccessor<AriaCalendarCellProps>,
  state: T,
  ref?: () => HTMLElement | null,
): CalendarCellAria {
  const getProps = () => access(props);
  const [isPressed, setIsPressed] = createSignal(false);
  const { focusProps, isFocusVisible: isRingFocusVisible } = createFocusRing();
  const timeZone = getLocalTimeZone();
  const inheritedLocale = useLocale();
  const stateWithLocale = state as T & { locale?: Accessor<string> };
  const locale = () => stateWithLocale.locale?.() ?? inheritedLocale().locale;
  let ignoreNextClick = false;

  // Get the date from props
  const date = createMemo(() => getProps().date as CalendarDate);

  // Check states
  const isSelected = createMemo(() => state.isSelected(date()));
  const isInvalid = createMemo(() => state.isValueInvalid() && isSelected());
  const isDisabled = createMemo(() => {
    return getProps().isDisabled || state.isCellDisabled(date());
  });
  const isUnavailable = createMemo(() => state.isCellUnavailable(date()));
  const isOutsideMonth = createMemo(
    () => getProps().isOutsideMonth ?? state.isOutsideVisibleRange(date()),
  );
  // Mirror @react-aria/calendar useCalendarCell: `isCellFocused(date) &&
  // !isOutsideMonth`. isCellFocused is gated on the calendar-level focus flag,
  // so this drives the focusSafely effect (never on mount) — NOT the roving
  // tabIndex, which tracks focusedDate directly below.
  const isFocused = createMemo(() => state.isCellFocused(date()) && !isOutsideMonth());
  const isToday = createMemo(() => isTodayUtil(date(), timeZone));
  const isCellFocusVisible = createMemo(
    () => isFocused() && isRingFocusVisible() && getInteractionModality() !== null,
  );

  // Format the date for display
  const formattedDate = createMemo(() => {
    const d = date();
    const formatter = new DateFormatter(locale(), {
      day: "numeric",
      timeZone,
      calendar: d.calendar.identifier,
    } as Intl.DateTimeFormatOptions);

    return (
      formatter.formatToParts(d.toDate(timeZone)).find((part) => part.type === "day")?.value ??
      d.day.toString()
    );
  });

  // Handle pointer down - this is where selection happens
  // Using pointerdown instead of click ensures selection happens immediately
  // before focus changes can interfere with the event
  const handlePointerDown = (e: PointerEvent) => {
    if (!isDisabled() && !isUnavailable()) {
      setIsPressed(true);
      // Select the date on pointer down for immediate response
      // This matches React Aria's behavior of using onPressStart
      state.selectDate(date());
      ignoreNextClick = true;
      // Prevent default to avoid double-triggering with onClick
      e.preventDefault();
    }
  };

  // Handle click - kept for accessibility (keyboard Enter/Space)
  const handleClick = () => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }

    // Only select on click if not already selected via pointerdown
    // This handles keyboard activation (Enter/Space)
    if (!isDisabled() && !isUnavailable()) {
      state.selectDate(date());
    }
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  // Keep DOM focus synchronized with focused date updates.
  // RAC uses useEffect (after paint). Solid createEffect is sync, so a
  // Next/Previous click would steal focus onto the new cell before the
  // nav button receives click-focus (#279). Defer to a frame so a focused
  // nav button can clear calendar-level isFocused first.
  createEffect(() => {
    const element = ref?.();
    if (!element || !isFocused()) return;
    const frame = requestAnimationFrame(() => {
      if (!isFocused() || ref?.() !== element) return;
      const navLabel = document.activeElement?.getAttribute("aria-label");
      if (navLabel === "Next" || navLabel === "Previous") return;
      focusSafely(element);

      // Scroll into view if navigating with a keyboard, otherwise try not to
      // shift the view under the user's mouse/finger. If in an overlay,
      // scrollIntoViewport only scrolls up to the overlay scroll body. Only
      // scroll if the cell actually got focused.
      if (getInteractionModality() !== "pointer" && document.activeElement === element) {
        scrollIntoViewport(element, { containingElement: getScrollParent(element) });
      }
    });
    onCleanup(() => cancelAnimationFrame(frame));
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
    const formatter = new DateFormatter(locale(), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: d.calendar.identifier,
    } as Intl.DateTimeFormatOptions);
    // Mirror @react-aria/calendar useCalendarCell: route the selected/today
    // suffix through the localized string formatter instead of hardcoding
    // " selected" (which dropped "Today" and never localized).
    let label = formatter.format(d.toDate(timeZone));
    if (isToday()) {
      label = formatCalendarLabel(locale(), isSelected() ? "todayDateSelected" : "todayDate", {
        date: label,
      });
    } else if (isSelected()) {
      label = formatCalendarLabel(locale(), "dateSelected", { date: label });
    }
    const errorMessageId = getCalendarHookData(state)?.errorMessageId;

    return mergeProps(
      focusProps as Record<string, unknown>,
      {
        role: "button",
        // Roving tabbable cell = the focusedDate cell, ungated by calendar
        // focus, mirroring @react-aria/calendar useCalendarCell
        // (`tabIndex = isSameDay(date, state.focusedDate) ? 0 : -1`, undefined
        // when disabled). Keeps one cell tabbable on mount without stealing
        // focus, and prunes tabindex from disabled cells like upstream.
        tabIndex: isDisabled() ? undefined : isSameDay(date(), state.focusedDate()) ? 0 : -1,
        "aria-label": label,
        "aria-disabled": isDisabled() || isUnavailable() || undefined,
        "aria-invalid": isInvalid() || undefined,
        "aria-describedby": isInvalid() ? errorMessageId : undefined,
        "aria-pressed": isPressed() || undefined,
        "data-focus-visible": isCellFocusVisible() || undefined,
        disabled: isDisabled() || isUnavailable(),
        onClick: handleClick,
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onFocus: () => {
          // Only update if this cell isn't already the focused date.
          // This prevents infinite loops when focus is programmatically set.
          if (!state.isCellFocused(d)) {
            state.setFocusedDate(d);
          }
          state.setFocused(true);
        },
      } as Record<string, unknown>,
    );
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
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isCellFocusVisible();
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
