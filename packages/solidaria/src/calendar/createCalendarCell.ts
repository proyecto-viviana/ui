/**
 * createCalendarCell hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a calendar cell.
 * Based on @react-aria/calendar useCalendarCell
 */

import { createSignal, createMemo, createEffect, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { focusSafely } from "../utils/focus";
import { scrollIntoViewport, getScrollParent } from "../utils";
import { createFocusRing } from "../interactions/createFocusRing";
import { getInteractionModality } from "../interactions/createInteractionModality";
import { useLocale } from "../i18n";
import { mergeProps } from "../utils/mergeProps";
import type { CalendarState, CalendarDate, DateValue } from "@proyecto-viviana/solid-stately";
import { isToday as isTodayUtil, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { getCalendarHookData } from "./utils";

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
  const isFocused = createMemo(() => state.isCellFocused(date()));
  const isInvalid = createMemo(() => state.isValueInvalid() && isSelected());
  const isDisabled = createMemo(() => {
    return getProps().isDisabled || state.isCellDisabled(date());
  });
  const isUnavailable = createMemo(() => state.isCellUnavailable(date()));
  const isOutsideMonth = createMemo(
    () => getProps().isOutsideMonth ?? state.isOutsideVisibleRange(date()),
  );
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
  // Use focusSafely (preventScroll) to match @react-aria/calendar — bare focus()
  // causes the browser to auto-scroll the page when bringing the cell into view,
  // which is wrong inside a popover. Scroll-into-view should be opt-in based on
  // interaction modality (handled at a higher layer when needed).
  createEffect(() => {
    const element = ref?.();
    if (element && isFocused()) {
      focusSafely(element);

      // Scroll into view if navigating with a keyboard, otherwise try not to
      // shift the view under the user's mouse/finger. If in an overlay,
      // scrollIntoViewport only scrolls up to the overlay scroll body. Only
      // scroll if the cell actually got focused.
      if (getInteractionModality() !== "pointer" && document.activeElement === element) {
        scrollIntoViewport(element, { containingElement: getScrollParent(element) });
      }
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
    const formatter = new DateFormatter(locale(), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: d.calendar.identifier,
    } as Intl.DateTimeFormatOptions);
    let label = formatter.format(d.toDate(timeZone));
    if (isSelected()) {
      label += " selected";
    }
    const errorMessageId = getCalendarHookData(state)?.errorMessageId;

    return mergeProps(
      focusProps as Record<string, unknown>,
      {
        role: "button",
        tabIndex: isFocused() ? 0 : -1,
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
