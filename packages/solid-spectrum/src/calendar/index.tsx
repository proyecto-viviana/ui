// @ts-nocheck
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
import { baseColor, focusRing, lightDark, setColorScheme, style } from "../s2-style";
import ChevronLeftIcon from "../icon/s2wf-icons/ChevronLeftIcon";
import ChevronRightIcon from "../icon/s2wf-icons/ChevronRightIcon";
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

const calendarRoot = style<{ cellMaxWidth: number }>({
  ...setColorScheme(),
  display: "flex",
  containerType: "inline-size",
  flexDirection: "column",
  gap: 24,
  disableTapHighlight: true,
  "--cell-gap": {
    type: "paddingStart",
    value: 4,
  },
  "--cell-responsive-size": {
    type: "width",
    value: "[min(var(--s2-calendar-cell-max-width), (100cqw - (var(--cell-gap) * 12)) / 7)]",
  },
  width: "[calc(7 * var(--s2-calendar-cell-max-width) + var(--cell-gap) * 12)]",
});

const calendarHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const calendarHeading = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: 0,
  flexGrow: 1,
});

const calendarTitleStyle: JSX.CSSProperties = {
  "font-family":
    "adobe-clean-spectrum-vf, adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif",
  "font-size": "18px",
  "font-weight": 700,
  "line-height": "22px",
  "text-align": "center",
  "flex-grow": 1,
  "flex-shrink": 0,
};

const calendarNavButton = style<{ buttonSize: number }>({
  ...focusRing(),
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
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
  cursor: {
    default: "default",
    isDisabled: "default",
  },
  transition: "default",
});

const calendarGrid = style({
  borderCollapse: "collapse",
  borderSpacing: 0,
  isolation: "isolate",
  tableLayout: "fixed",
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
  color: baseColor("neutral"),
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

const calendarCell = style<{
  isSelected?: boolean;
  isFocused?: boolean;
  isDisabled?: boolean;
  isOutsideMonth?: boolean;
  isPressed?: boolean;
  isHovered?: boolean;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  isFirstWeek?: boolean;
  isLastWeek?: boolean;
}>({
  ...focusRing(),
  transition: {
    default: "default",
    forcedColors: "none",
  },
  outlineOffset: 2,
  position: "relative",
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
  font: "body-sm",
  cursor: "default",
  width: "full",
  height: "full",
  borderRadius: "full",
  display: {
    default: "flex",
    isOutsideMonth: "none",
  },
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
      isFocused: lightDark("accent-1000", "accent-600"),
      isDisabled: "transparent",
    },
    forcedColors: {
      default: "transparent",
      isHovered: "Highlight",
      isSelected: "Highlight",
    },
  },
  color: {
    default: baseColor("neutral"),
    isSelected: "white",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isSelected: "HighlightText",
      isDisabled: "GrayText",
    },
  },
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
});

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
      class={`${calendarRoot({ cellMaxWidth: sizeConfig().cellMaxWidth })} ${local.class ?? ""}`}
      style={{
        "--s2-calendar-cell-max-width": `${sizeConfig().cellMaxWidth}px`,
        "--s2-calendar-button-size": `${sizeConfig().buttonSize}px`,
      }}
    >
      <header class={calendarHeader}>
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

        <CalendarHeading class={calendarHeading}>
          {({ title }) => <div style={calendarTitleStyle}>{title}</div>}
        </CalendarHeading>

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
      </header>

      <CalendarGrid
        class={calendarGrid}
        style={{
          width: `${sizeConfig().cellMaxWidth * 7}px`,
          "table-layout": "fixed",
        }}
        weekdayStyle="narrow"
        headerCellClass={calendarHeaderCell({})}
      >
        {(date) => (
          <CalendarCell
            date={date}
            cellClass={calendarCellWrapper}
            cellStyle={() => cellBoxStyle(size())}
            style={() => cellBoxStyle(size())}
            class={({
              isSelected,
              isFocused,
              isDisabled,
              isOutsideMonth,
              isPressed,
              isHovered,
              isFirstChild,
              isLastChild,
              isFirstWeek,
              isLastWeek,
            }) =>
              calendarCell({
                isSelected,
                isFocused,
                isDisabled,
                isOutsideMonth,
                isPressed,
                isHovered,
                isFirstChild,
                isLastChild,
                isFirstWeek,
                isLastWeek,
              })
            }
          >
            {({ formattedDate, isToday }) => (
              <>
                <div class={calendarTodayDot({ isToday })} role="presentation" />
                <span>{formattedDate}</span>
              </>
            )}
          </CalendarCell>
        )}
      </CalendarGrid>
    </HeadlessCalendar>
  );
}

export { RangeCalendar } from "./RangeCalendar";
export type { RangeCalendarProps, RangeCalendarSize, RangeValue } from "./RangeCalendar";

export type { CalendarDate, DateValue };
