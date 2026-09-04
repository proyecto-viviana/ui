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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/calendar/useRangeCalendar.ts

/**
 * createRangeCalendar hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a range calendar component.
 * Based on @react-aria/calendar useRangeCalendar
 */

import { createMemo, createEffect, onCleanup, type Accessor } from "solid-js";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { getEventTarget, isFocusWithin, nodeContains } from "../utils/dom";
import type { RangeCalendarState } from "@proyecto-viviana/solid-stately";
import {
  formatSelectedDateDescription,
  formatVisibleRangeDescription,
  setCalendarHookData,
} from "./utils";
import { formatCalendarLabel } from "./intl";

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
  /**
   * Controls the behavior when a pointer is released outside the calendar or a blur occurs mid
   * selection:
   *
   * - `clear`: clear the currently selected range of dates.
   * - `reset`: reset the selection to the previously selected range of dates.
   * - `select`: select the currently hovered range of dates.
   *
   * @default "select"
   */
  commitBehavior?: "clear" | "reset" | "select";
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
  ref?: Accessor<Element | null>,
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
  // Gate the hook-data write on an identifying prop, mirroring createCalendar.
  // The headless RangeCalendarButton re-invokes createRangeCalendar({}, state)
  // to read prev/next button props from context; without this gate that bare
  // call would clobber the ariaLabel / selectedDateDescription the owning
  // RangeCalendar published, dropping the calendar label from every grid name.
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
      get selectedDateDescription() {
        return selectedDateDescription();
      },
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

  // Execute method corresponding to `commitBehavior` when pressing or releasing a pointer
  // outside the calendar body, except when pressing the next or previous buttons to switch months.
  // Also commit on blur (e.g. tabbing away). Reads `getEventTarget` so shadow-DOM retargeting
  // still sees the inner node (`e.target` would be the shadow host).
  createEffect(() => {
    const element = ref?.();
    if (!element) {
      return;
    }

    const commitBehavior = getProps().commitBehavior ?? "select";
    const commitBehaviorMapping = {
      clear: () => {
        state.setAnchorDate(null);
        state.setValue(null);
      },
      reset: () => state.setAnchorDate(null),
      select: () => state.selectDate(state.focusedDate()),
    };

    let isVirtualClick = false;
    const onPointerDown = (e: PointerEvent) => {
      isVirtualClick = e.width === 0 && e.height === 0;
    };

    const endDragging = (e: PointerEvent) => {
      if (isVirtualClick) {
        isVirtualClick = false;
        return;
      }

      state.setDragging(false);
      if (!state.anchorDate()) {
        return;
      }

      const target = getEventTarget(e) as Element;
      if (
        isFocusWithin(element) &&
        (!nodeContains(element, target) || !target.closest("button, [role='button']"))
      ) {
        commitBehaviorMapping[commitBehavior]();
      }
    };

    const onBlur = (e: Event) => {
      const focusEvent = e as FocusEvent;
      if (
        (!focusEvent.relatedTarget || !nodeContains(element, focusEvent.relatedTarget as Node)) &&
        state.anchorDate()
      ) {
        commitBehaviorMapping[commitBehavior]();
      }
    };

    const onTouchMove = (e: Event) => {
      if (state.isDragging()) {
        e.preventDefault();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", endDragging);
    element.addEventListener("blur", onBlur, true);
    element.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    onCleanup(() => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", endDragging);
      element.removeEventListener("blur", onBlur, true);
      element.removeEventListener("touchmove", onTouchMove, true);
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
