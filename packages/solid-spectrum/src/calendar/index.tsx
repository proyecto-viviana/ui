// @ts-nocheck

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Calendar.tsx

// Port of packages/@react-spectrum/s2/src/Calendar.tsx.

import {
  type JSX,
  For,
  Show,
  createContext,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  Calendar as HeadlessCalendar,
  CalendarButton,
  CalendarGrid,
  CalendarCell,
  useCalendarContext,
  type CalendarCellRenderProps,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import { useLocale } from "@proyecto-viviana/solidaria";
import { DateFormatter, type CalendarStateProps } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import {
  baseColor,
  focusRing,
  lightDark,
  setColorScheme,
  style,
} from "../style" with { type: "macro" };
import ChevronLeftIcon from "../icon/s2wf-icons/ChevronLeftIcon";
import ChevronRightIcon from "../icon/s2wf-icons/ChevronRightIcon";
import { pressScale } from "../pressScale";
import { useProviderProps } from "../provider";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type CalendarSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg" | "xl";
type NormalizedCalendarSize = "sm" | "md" | "lg" | "xl";
export type CalendarFirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface CalendarProps<T extends DateValue = DateValue> extends Omit<
  CalendarStateProps<T>,
  "locale" | "firstDayOfWeek" | "validationState"
> {
  /** The size of the calendar. @default 'md' */
  size?: CalendarSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** Whether to show week numbers. */
  showWeekNumbers?: boolean;
  /** The locale to use for formatting. */
  locale?: string;
  /** The day that starts the week. */
  firstDayOfWeek?: CalendarFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Whether the current selection is invalid according to application logic. */
  isInvalid?: boolean;
  /** Validation state for backward-compatible Solid Stately callers. */
  validationState?: CalendarStateProps<T>["validationState"];
  /** The error message to display when the calendar is invalid. */
  errorMessage?: JSX.Element;
  /** Custom aria label. */
  "aria-label"?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export const CalendarContext = createContext<SpectrumContextValue<CalendarProps<any>>>(null);

const sizeStyles: Record<NormalizedCalendarSize, { cellMaxWidth: number; buttonSize: number }> = {
  sm: {
    cellMaxWidth: 32,
    buttonSize: 24,
  },
  md: {
    cellMaxWidth: 32,
    buttonSize: 32,
  },
  lg: {
    cellMaxWidth: 40,
    buttonSize: 40,
  },
  xl: {
    cellMaxWidth: 44,
    buttonSize: 44,
  },
};

function cellBoxStyle(size: NormalizedCalendarSize): JSX.CSSProperties {
  const cellSize = `${sizeStyles[size].cellMaxWidth}px`;
  return {
    width: cellSize,
    height: cellSize,
  };
}

function normalizeCalendarSize(size: CalendarSize | undefined): NormalizedCalendarSize {
  switch (size) {
    case "S":
    case "sm":
      return "sm";
    case "L":
    case "lg":
      return "lg";
    case "XL":
      return "xl";
    case "M":
    case "md":
    default:
      return "md";
  }
}

function normalizeFirstDayOfWeek(
  firstDayOfWeek: CalendarFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined {
  switch (firstDayOfWeek) {
    case "sun":
      return 0;
    case "mon":
      return 1;
    case "tue":
      return 2;
    case "wed":
      return 3;
    case "thu":
      return 4;
    case "fri":
      return 5;
    case "sat":
      return 6;
    default:
      return firstDayOfWeek;
  }
}

function monthTitle(date: CalendarDate, locale: string | undefined, timeZone: string): string {
  const formattableMonth = date.calendar.getFormattableMonth?.(date) ?? date;
  return new DateFormatter(locale ?? "en-US", {
    month: "long",
    year: "numeric",
    calendar: date.calendar.identifier,
  }).format(formattableMonth.toDate(timeZone));
}

const calendarRoot = style<{ isMultiMonth?: boolean }>({
  ...setColorScheme(),
  display: "flex",
  flexDirection: "column",
  gap: 24,
  disableTapHighlight: true,
  "--cell-gap": {
    type: "paddingStart",
    value: 4,
  },
  "--cell-responsive-size": "--s2-calendar-cell-max-width",
  width: "fit",
});

// Mirrors @react-spectrum/s2 Calendar headerStyles.
const calendarHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: 24,
});

// Mirrors @react-spectrum/s2 Calendar headingStyles: one per visible month,
// laying out [prev button?, title, next button?] with the title flex-growing.
const calendarHeading = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: 0,
  flexGrow: 1,
  width: "full",
});

// Mirrors @react-spectrum/s2 Calendar titleStyles.
const calendarTitle = style({
  font: "title-lg",
  textAlign: "center",
  flexGrow: 1,
  flexShrink: 0,
  marginY: 0,
});

const calendarMonths = style<{ isMultiMonth?: boolean }>({
  display: "flex",
  flexDirection: "row",
  gap: {
    default: 0,
    isMultiMonth: 24,
  },
  alignItems: "start",
  width: "[max-content]",
});

const calendarNavButton = style<{ buttonSize: number }>({
  ...focusRing(),
  font: "ui",
  fontWeight: "medium",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[var(--s2-calendar-button-size)]",
  height: "[var(--s2-calendar-button-size)]",
  borderStyle: "none",
  borderRadius: "full",
  backgroundColor: {
    default: "transparent",
    isHovered: baseColor("gray-100"),
    isPressed: baseColor("gray-200"),
  },
  // Gray the chevron when disabled, mirroring S2's disabled ActionButton. This
  // is a bare native <button>, so the disabled color keys off the `:disabled`
  // pseudo (the button carries the `disabled` attribute for both whole-calendar
  // and range-boundary disable) rather than a runtime render prop. The chevron
  // icon inherits it via `--iconPrimary: currentColor`.
  color: {
    default: baseColor("neutral"),
    ":disabled": "disabled",
  },
  cursor: "default",
  transition: "default",
});

const calendarGrid = style({
  borderCollapse: "collapse",
  borderSpacing: 0,
  isolation: "isolate",
});

const calendarHeaderCell = style({
  boxSizing: "border-box",
  font: "title-sm",
  cursor: "default",
  textAlign: "center",
  width: "--cell-responsive-size",
  paddingStart: {
    default: 4,
    ":first-child": 0,
  },
  paddingEnd: {
    default: 4,
    ":last-child": 0,
  },
  paddingTop: 0,
  paddingBottom: 12,
});

const calendarCellWrapper = style({
  outlineStyle: "none",
  boxSizing: "border-box",
  padding: 0,
  position: "relative",
  disableTapHighlight: true,
  width: "--cell-responsive-size",
  height: "--cell-responsive-size",
});

const calendarCellOuter = style<{
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  isFirstWeek?: boolean;
  isLastWeek?: boolean;
}>({
  outlineStyle: "none",
  boxSizing: "border-box",
  paddingStart: {
    default: 4,
    isFirstChild: 0,
  },
  paddingEnd: {
    default: 4,
    isLastChild: 0,
  },
  paddingTop: {
    default: 2,
    isFirstWeek: 0,
  },
  paddingBottom: {
    default: 2,
    isLastWeek: 0,
  },
  position: "relative",
  width: "full",
  height: "full",
  display: {
    default: "flex",
    isOutsideMonth: "none",
  },
  alignItems: "center",
  justifyContent: "center",
  disableTapHighlight: true,
});

const calendarCellInnerFrame = style({
  position: "relative",
  width: "full",
  height: "full",
});

const calendarCellInner = style<{
  isSelected?: boolean;
  isDisabled?: boolean;
  isPressed?: boolean;
  isHovered?: boolean;
  isFocusVisible?: boolean;
  isUnavailable?: boolean;
  isInvalid?: boolean;
}>({
  ...focusRing(),
  transition: {
    default: "default",
    forcedColors: "none",
  },
  outlineOffset: {
    default: -2,
    isSelected: 2,
  },
  position: "relative",
  font: "body-sm",
  cursor: "default",
  width: "full",
  height: "full",
  borderRadius: "full",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  forcedColorAdjust: "none",
  backgroundColor: {
    default: "transparent",
    isHovered: {
      default: "gray-100",
      isUnavailable: "transparent",
    },
    isPressed: "gray-100",
    isDisabled: "transparent",
    isSelected: {
      default: lightDark("accent-900", "accent-700"),
      isHovered: lightDark("accent-1000", "accent-600"),
      isPressed: lightDark("accent-1000", "accent-600"),
      isFocusVisible: lightDark("accent-1000", "accent-600"),
      isDisabled: "transparent",
      isInvalid: {
        default: lightDark("negative-900", "negative-700"),
        isHovered: lightDark("negative-1000", "negative-600"),
        isPressed: lightDark("negative-1000", "negative-600"),
        isFocusVisible: lightDark("negative-1000", "negative-600"),
      },
    },
    forcedColors: {
      default: "transparent",
      isHovered: "Highlight",
      isSelected: "Highlight",
    },
  },
  // Mirrors @react-spectrum/s2 Calendar cellInnerStyles color: unavailable dates
  // stay `neutral` (only the strikethrough slash marks them), so there is NO
  // isUnavailable branch here. The port previously invented `isUnavailable:
  // "disabled"`, graying the text and its currentColor slash.
  color: {
    default: "neutral",
    isSelected: "white",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isSelected: "HighlightText",
      isDisabled: "GrayText",
    },
  },
});

const calendarUnavailableSlash = style({
  position: "absolute",
  top: "[calc(50% - 1px)]",
  left: "[calc(25% - 1px)]",
  right: "[calc(25% - 1px)]",
  height: 2,
  transform: "rotate(-16deg)",
  borderRadius: "full",
  backgroundColor: "[currentColor]",
});

const calendarTodayDot = style<{ isToday?: boolean }>({
  position: "absolute",
  bottom: "12.5%",
  left: "50%",
  transform: "translateX(-50%)",
  width: 4,
  height: 4,
  borderRadius: "full",
  backgroundColor: "[currentColor]",
  display: {
    default: "none",
    isToday: "block",
  },
});

const calendarNavIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  width: "[1.4285714285714286em]",
  height: "[1.4285714285714286em]",
  forcedColorAdjust: "none",
});

// Mirrors @react-spectrum/s2 Field helpTextStyles at size M (controlFont() → the
// base `ui` font). The port previously invented `font: "body-sm"`, giving the
// error text a taller line box than S2. `--field-gap` is undefined outside a
// Field, so paddingTop resolves to 0 here — matching S2's standalone Calendar.
const calendarHelpText = style<{ isInvalid?: boolean; isDisabled?: boolean }>({
  display: "flex",
  alignItems: "baseline",
  gap: "text-to-visual",
  font: "ui",
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

function CalendarHeading(props: {
  visibleMonths: number;
  locale?: string;
  prevButton: JSX.Element;
  nextButton: JSX.Element;
}): JSX.Element {
  const state = useCalendarContext();
  const months = () =>
    Array.from({ length: props.visibleMonths }, (_, index) =>
      monthTitle(state.visibleRange().start.add({ months: index }), props.locale, state.timeZone),
    );

  return (
    // Mirror @react-spectrum/s2 CalendarHeader: one flex row per visible month,
    // laying out [prev button (first month only), title, next button (last month
    // only)]. When a single month is visible both buttons share its row. The
    // per-month title mirrors react-aria-components CalendarHeading, whose
    // HeadingContext marks it aria-hidden (the visible range is already named on
    // the application root + each grid) — so it stays out of the AX tree.
    <For each={months()}>
      {(title, index) => (
        <div class={calendarHeading}>
          <Show when={index() === 0}>{props.prevButton}</Show>
          <h2 aria-hidden="true" class={calendarTitle}>
            {title}
          </h2>
          <Show when={index() === props.visibleMonths - 1}>{props.nextButton}</Show>
        </div>
      )}
    </For>
  );
}

function CalendarCellContent(props: { cell: CalendarCellRenderProps }): JSX.Element {
  const [innerElement, setInnerElement] = createSignal<HTMLDivElement | null>(null);

  return (
    <div class={calendarCellInnerFrame}>
      <div
        ref={setInnerElement}
        style={pressScale(innerElement, {})(props.cell)}
        class={calendarCellInner({
          isSelected: props.cell.isSelected,
          isDisabled: props.cell.isDisabled,
          isUnavailable: props.cell.isUnavailable,
          isPressed: props.cell.isPressed,
          isHovered: props.cell.isHovered,
          isFocusVisible: props.cell.isFocusVisible,
          isInvalid: props.cell.isInvalid,
        })}
      >
        <div class={calendarTodayDot({ isToday: props.cell.isToday })} role="presentation" />
        <div>{props.cell.formattedDate}</div>
        <Show when={props.cell.isUnavailable}>
          <div class={calendarUnavailableSlash} role="presentation" />
        </Show>
      </div>
    </div>
  );
}

/**
 * A calendar displays a grid of days and allows users to select a date.
 */
export function Calendar<T extends DateValue = CalendarDate>(props: CalendarProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(CalendarContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const providerLocale = useLocale();
  const [local, rest] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "showWeekNumbers",
    "aria-label",
    "firstDayOfWeek",
    "isInvalid",
    "validationState",
    "errorMessage",
    "visibleMonths",
    "locale",
    "slot",
    "ref",
  ]);

  const size = () => normalizeCalendarSize(local.size);
  const sizeConfig = () => sizeStyles[size()];
  const visibleMonths = () => Math.max(1, Number(local.visibleMonths ?? 1));
  const locale = () => local.locale ?? providerLocale().locale;
  const validationState = () =>
    typeof local.validationState === "function" ? local.validationState() : local.validationState;
  const isInvalid = () => local.isInvalid || validationState() === "invalid";
  const errorMessageId = createUniqueId();
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const rootStyle = () => ({
    "--cell-gap": "4px",
    "--cell-max-width": `${sizeConfig().cellMaxWidth}px`,
    "--cell-responsive-size": "var(--cell-max-width)",
    "--s2-calendar-cell-max-width": `${sizeConfig().cellMaxWidth}px`,
    "--s2-calendar-button-size": `${sizeConfig().buttonSize}px`,
    "--s2-calendar-visible-months": visibleMonths(),
    width: "fit-content",
    "max-width": "100%",
    ...(mergedUnsafeStyle() ?? {}),
  });
  const monthOffsets = () => Array.from({ length: visibleMonths() }, (_, index) => index);
  return (
    <HeadlessCalendar
      {...rest}
      ref={(element: HTMLDivElement) => assignRef(element)}
      aria-label={local["aria-label"]}
      aria-describedby={rest["aria-describedby"]}
      errorMessage={local.errorMessage}
      errorMessageId={errorMessageId}
      firstDayOfWeek={normalizeFirstDayOfWeek(local.firstDayOfWeek)}
      validationState={isInvalid() ? "invalid" : validationState()}
      visibleMonths={visibleMonths()}
      locale={locale()}
      class={[
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        local.class,
        calendarRoot({ isMultiMonth: visibleMonths() > 1 }, mergedStyles()),
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle()}
    >
      <header class={calendarHeader}>
        <CalendarHeading
          visibleMonths={visibleMonths()}
          locale={locale()}
          prevButton={
            <CalendarButton
              slot="previous"
              class={calendarNavButton({ buttonSize: sizeConfig().buttonSize })}
              style={{
                width: `${sizeConfig().buttonSize}px`,
                height: `${sizeConfig().buttonSize}px`,
              }}
            >
              <ChevronLeftIcon styles={calendarNavIcon} />
            </CalendarButton>
          }
          nextButton={
            <CalendarButton
              slot="next"
              class={calendarNavButton({ buttonSize: sizeConfig().buttonSize })}
              style={{
                width: `${sizeConfig().buttonSize}px`,
                height: `${sizeConfig().buttonSize}px`,
              }}
            >
              <ChevronRightIcon styles={calendarNavIcon} />
            </CalendarButton>
          }
        />
      </header>

      <div class={calendarMonths({ isMultiMonth: visibleMonths() > 1 })}>
        <For each={monthOffsets()}>
          {(offset) => (
            <CalendarGrid
              class={calendarGrid}
              style={{
                width: `${sizeConfig().cellMaxWidth * 7}px`,
              }}
              weekdayStyle="narrow"
              headerCellClass={calendarHeaderCell}
              offset={offset === 0 ? undefined : { months: offset }}
            >
              {(date) => (
                <CalendarCell
                  date={date}
                  cellClass={calendarCellWrapper}
                  cellStyle={() => cellBoxStyle(size())}
                  style={() => cellBoxStyle(size())}
                  class={({
                    isDisabled,
                    isOutsideMonth,
                    isFirstChild,
                    isLastChild,
                    isFirstWeek,
                    isLastWeek,
                  }) =>
                    calendarCellOuter({
                      isDisabled,
                      isOutsideMonth,
                      isFirstChild,
                      isLastChild,
                      isFirstWeek,
                      isLastWeek,
                    })
                  }
                >
                  {(cell) => <CalendarCellContent cell={cell} />}
                </CalendarCell>
              )}
            </CalendarGrid>
          )}
        </For>
      </div>

      <Show when={isInvalid() && local.errorMessage}>
        <span
          id={errorMessageId}
          class={calendarHelpText({ isInvalid: true, isDisabled: Boolean(rest.isDisabled) })}
        >
          {local.errorMessage}
        </span>
      </Show>
    </HeadlessCalendar>
  );
}

export { RangeCalendar, RangeCalendarContext } from "./RangeCalendar";
export type {
  RangeCalendarFirstDayOfWeek,
  RangeCalendarProps,
  RangeCalendarSize,
  RangeValue,
} from "./RangeCalendar";

export type { CalendarDate, DateValue };
