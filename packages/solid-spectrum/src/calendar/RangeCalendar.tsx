import { type JSX, For, splitProps } from "solid-js";
import {
  RangeCalendar as HeadlessRangeCalendar,
  RangeCalendarHeading,
  RangeCalendarButton,
  RangeCalendarGrid,
  RangeCalendarCell,
  type CalendarDate,
  type DateValue,
  type RangeValue,
} from "@proyecto-viviana/solidaria-components";
import type { RangeCalendarStateProps } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";

export type RangeCalendarSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type NormalizedRangeCalendarSize = "sm" | "md" | "lg";

export interface RangeCalendarProps<T extends DateValue = DateValue> extends Omit<
  RangeCalendarStateProps<T>,
  "locale"
> {
  /** The size of the calendar. @default 'md' */
  size?: RangeCalendarSize;
  /** Additional CSS class name. */
  class?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** The locale to use for formatting. */
  locale?: string;
  /** Custom aria label. */
  "aria-label"?: string;
}

const sizeStyles = {
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
};

function normalizeRangeCalendarSize(
  size: RangeCalendarSize | undefined,
): NormalizedRangeCalendarSize {
  switch (size) {
    case "S":
    case "sm":
      return "sm";
    case "L":
    case "XL":
    case "lg":
      return "lg";
    case "M":
    case "md":
    default:
      return "md";
  }
}

/**
 * A range calendar displays a grid of days and allows users to select a date range.
 */
export function RangeCalendar<T extends DateValue = CalendarDate>(
  props: RangeCalendarProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, rest] = splitProps(mergedProps, ["size", "class", "UNSAFE_style", "aria-label"]);

  const size = () => normalizeRangeCalendarSize(local.size);
  const sizeConfig = () => sizeStyles[size()];
  const visibleMonths = () =>
    Math.max(1, Number((rest as { visibleMonths?: number }).visibleMonths ?? 1));
  const monthOffsets = () => Array.from({ length: visibleMonths() }, (_, index) => index);

  return (
    <HeadlessRangeCalendar
      {...rest}
      aria-label={local["aria-label"]}
      class={`
        ${sizeConfig().container}
        bg-bg-500 rounded-lg border border-primary-700 p-4
        ${local.class ?? ""}
      `}
      style={local.UNSAFE_style}
    >
      <header class="flex items-center justify-between mb-4">
        <RangeCalendarButton
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
        </RangeCalendarButton>

        <RangeCalendarHeading
          class={`
            font-semibold text-primary-100
            ${sizeConfig().header}
          `}
        />

        <RangeCalendarButton
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
        </RangeCalendarButton>
      </header>

      <div style={{ display: "flex", gap: "24px", "align-items": "start" }}>
        <For each={monthOffsets()}>
          {(offset) => (
            <RangeCalendarGrid
              offset={offset === 0 ? undefined : { months: offset }}
              class="w-full border-collapse [&_.solidaria-RangeCalendarHeaderCell]:text-primary-200"
            >
              {(date) => (
                <RangeCalendarCell
                  date={date}
                  class={({
                    isSelected,
                    isSelectionStart,
                    isSelectionEnd,
                    isFocused,
                    isDisabled,
                    isOutsideMonth,
                    isToday,
                    isPressed,
                  }) => {
                    const base = `
                ${sizeConfig().cell}
                flex items-center justify-center
                cursor-pointer
                transition-colors duration-150
                focus:outline-none
              `;

                    let stateClass = "";
                    let roundedClass = "rounded-md";

                    if (isDisabled) {
                      stateClass = "text-primary-600 cursor-not-allowed";
                    } else if (isSelectionStart && isSelectionEnd) {
                      stateClass = "bg-accent text-bg-400 font-medium";
                      roundedClass = "rounded-md";
                    } else if (isSelectionStart) {
                      stateClass = "bg-accent text-bg-400 font-medium";
                      roundedClass = "rounded-l-md rounded-r-none";
                    } else if (isSelectionEnd) {
                      stateClass = "bg-accent text-bg-400 font-medium";
                      roundedClass = "rounded-r-md rounded-l-none";
                    } else if (isSelected) {
                      stateClass = "bg-accent/20 text-primary-100";
                      roundedClass = "rounded-none";
                    } else if (isOutsideMonth) {
                      stateClass = "text-primary-600";
                    } else if (isToday) {
                      stateClass = "ring-1 ring-accent text-primary-100";
                    } else {
                      stateClass = "text-primary-200 hover:bg-bg-400";
                    }

                    const focusClass = isFocused && !isSelected ? "ring-2 ring-accent/50" : "";

                    const pressedClass = isPressed && !isDisabled ? "scale-95" : "";

                    return `${base} ${stateClass} ${roundedClass} ${focusClass} ${pressedClass}`.trim();
                  }}
                />
              )}
            </RangeCalendarGrid>
          )}
        </For>
      </div>
    </HeadlessRangeCalendar>
  );
}

export type { RangeValue };
