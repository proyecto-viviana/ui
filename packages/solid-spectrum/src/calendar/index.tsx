import { type JSX, splitProps } from "solid-js";
import {
  Calendar as HeadlessCalendar,
  CalendarHeading,
  CalendarButton,
  CalendarGrid,
  CalendarCell,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import type { CalendarStateProps } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";

export type CalendarSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg" | "xl";
type NormalizedCalendarSize = "sm" | "md" | "lg" | "xl";

export interface CalendarProps<T extends DateValue = DateValue> extends Omit<
  CalendarStateProps<T>,
  "locale"
> {
  /** The size of the calendar. @default 'md' */
  size?: CalendarSize;
  /** Additional CSS class name. */
  class?: string;
  /** Whether to show week numbers. */
  showWeekNumbers?: boolean;
  /** The locale to use for formatting. */
  locale?: string;
  /** Custom aria label. */
  "aria-label"?: string;
}

const sizeStyles: Record<
  NormalizedCalendarSize,
  { container: string; header: string; cell: string; button: string }
> = {
  sm: {
    container: "w-64",
    header: "text-sm",
    cell: "w-8 h-8 text-xs",
    button: "w-6 h-6",
  },
  md: {
    container: "w-80",
    header: "text-base",
    cell: "w-10 h-10 text-sm",
    button: "w-8 h-8",
  },
  lg: {
    container: "w-96",
    header: "text-lg",
    cell: "w-12 h-12 text-base",
    button: "w-10 h-10",
  },
  xl: {
    container: "w-[28rem]",
    header: "text-xl",
    cell: "w-14 h-14 text-lg",
    button: "w-11 h-11",
  },
};

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

/**
 * A calendar displays a grid of days and allows users to select a date.
 */
export function Calendar<T extends DateValue = CalendarDate>(props: CalendarProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, rest] = splitProps(mergedProps, ["size", "class", "showWeekNumbers", "aria-label"]);

  const size = () => normalizeCalendarSize(local.size);
  const sizeConfig = () => sizeStyles[size()];

  return (
    <HeadlessCalendar
      {...rest}
      aria-label={local["aria-label"]}
      class={`
        ${sizeConfig().container}
        bg-bg-500 rounded-lg border border-primary-700 p-4
        ${local.class ?? ""}
      `}
    >
      <header class="flex items-center justify-between mb-4">
        <CalendarButton
          slot="previous"
          class={`
            ${sizeConfig().button}
            flex items-center justify-center
            rounded-md text-primary-200
            hover:bg-bg-400 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-accent/50
          `}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </CalendarButton>

        <CalendarHeading
          class={`
            font-semibold text-primary-100
            ${sizeConfig().header}
          `}
        />

        <CalendarButton
          slot="next"
          class={`
            ${sizeConfig().button}
            flex items-center justify-center
            rounded-md text-primary-200
            hover:bg-bg-400 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-accent/50
          `}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </CalendarButton>
      </header>

      <CalendarGrid class="w-full border-collapse">
        {(date) => (
          <CalendarCell
            date={date}
            class={({ isSelected, isFocused, isDisabled, isOutsideMonth, isToday, isPressed }) => {
              const base = `
                ${sizeConfig().cell}
                flex items-center justify-center
                rounded-md cursor-pointer
                transition-colors duration-150
                focus:outline-none
              `;

              let stateClass = "";

              if (isDisabled) {
                stateClass = "text-primary-600 cursor-not-allowed";
              } else if (isSelected) {
                stateClass = "bg-accent text-bg-400 font-medium";
              } else if (isOutsideMonth) {
                stateClass = "text-primary-600";
              } else if (isToday) {
                stateClass = "ring-1 ring-accent text-primary-100";
              } else {
                stateClass = "text-primary-200 hover:bg-bg-400";
              }

              const focusClass = isFocused && !isSelected ? "ring-2 ring-accent/50" : "";

              const pressedClass = isPressed && !isDisabled ? "scale-95" : "";

              return `${base} ${stateClass} ${focusClass} ${pressedClass}`.trim();
            }}
          />
        )}
      </CalendarGrid>
    </HeadlessCalendar>
  );
}

export { RangeCalendar } from "./RangeCalendar";
export type { RangeCalendarProps, RangeCalendarSize, RangeValue } from "./RangeCalendar";

export type { CalendarDate, DateValue };
