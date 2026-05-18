// @ts-nocheck
import {
  type JSX,
  For,
  Show,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  RangeCalendar as HeadlessRangeCalendar,
  RangeCalendarButton,
  RangeCalendarCell,
  RangeCalendarGrid,
  useRangeCalendarContext,
  type CalendarDate,
  type DateValue,
  type RangeCalendarCellRenderProps,
  type RangeValue,
} from "@proyecto-viviana/solidaria-components";
import { useLocale } from "@proyecto-viviana/solidaria";
import { DateFormatter, type RangeCalendarStateProps } from "@proyecto-viviana/solid-stately";
import {
  baseColor,
  focusRing,
  lightDark,
  setColorScheme,
  style,
  type StyleString,
} from "../s2-style";
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

export type RangeCalendarSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg" | "xl";
type NormalizedRangeCalendarSize = "sm" | "md" | "lg" | "xl";
export type RangeCalendarFirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface RangeCalendarProps<T extends DateValue = DateValue> extends Omit<
  RangeCalendarStateProps<T>,
  "locale" | "firstDayOfWeek" | "validationState"
> {
  /** The size of the calendar. @default 'md' */
  size?: RangeCalendarSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** The locale to use for formatting. */
  locale?: string;
  /** The day that starts the week. */
  firstDayOfWeek?: RangeCalendarFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Whether the current selection is invalid according to application logic. */
  isInvalid?: boolean;
  /** Validation state for backward-compatible Solid Stately callers. */
  validationState?: RangeCalendarStateProps<T>["validationState"];
  /** The error message to display when the range calendar is invalid. */
  errorMessage?: JSX.Element;
  /** Custom aria label. */
  "aria-label"?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export const RangeCalendarContext =
  createContext<SpectrumContextValue<RangeCalendarProps<any>>>(null);

const sizeStyles: Record<
  NormalizedRangeCalendarSize,
  { cellMaxWidth: number; buttonSize: number }
> = {
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

function cellBoxStyle(size: NormalizedRangeCalendarSize): JSX.CSSProperties {
  const cellSize = `${sizeStyles[size].cellMaxWidth}px`;
  return {
    width: cellSize,
    height: cellSize,
  };
}

function normalizeRangeCalendarSize(
  size: RangeCalendarSize | undefined,
): NormalizedRangeCalendarSize {
  switch (size) {
    case "S":
    case "sm":
      return "sm";
    case "L":
    case "lg":
      return "lg";
    case "XL":
    case "xl":
      return "xl";
    case "M":
    case "md":
    default:
      return "md";
  }
}

function normalizeFirstDayOfWeek(
  firstDayOfWeek: RangeCalendarFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
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

const rangeCalendarRoot = style<{ isMultiMonth?: boolean }>({
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

const rangeCalendarHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const rangeCalendarHeading = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: 0,
  flexGrow: 1,
  minWidth: 0,
});

const rangeCalendarTitle = style({
  font: "title-lg",
  textAlign: "center",
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: "0%",
  minWidth: 0,
});

const rangeCalendarTitleSpacer32 = style({
  visibility: "hidden",
  flexShrink: 0,
  width: 32,
});

const rangeCalendarTitleSpacer24 = style({
  visibility: "hidden",
  flexShrink: 0,
  width: 24,
});

const rangeCalendarMonths = style<{ isMultiMonth?: boolean }>({
  display: "flex",
  flexDirection: "row",
  gap: {
    default: 0,
    isMultiMonth: 24,
  },
  alignItems: "start",
  width: "[max-content]",
});

const rangeCalendarNavButton = style<{ buttonSize: number }>({
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

const rangeCalendarGrid = style({
  borderCollapse: "collapse",
  borderSpacing: 0,
  isolation: "isolate",
  tableLayout: "fixed",
});

const rangeCalendarHeaderCell = style({
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

const rangeCalendarCellWrapper = style({
  outlineStyle: "none",
  boxSizing: "content-box",
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
  disableTapHighlight: true,
  width: "--cell-responsive-size",
  height: "--cell-responsive-size",
});

const rangeCalendarCellOuter = style<{
  isOutsideMonth?: boolean;
}>({
  outlineStyle: "none",
  boxSizing: "border-box",
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

const rangeCalendarCellInnerFrame = style({
  position: "relative",
  width: "full",
  height: "full",
});

const rangeCalendarCellInner = style<{
  selectionMode: "range";
  isSelected?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isDisabled?: boolean;
  isPressed?: boolean;
  isHovered?: boolean;
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
    isSelected: -2,
    isSelectionStart: 2,
    isSelectionEnd: 2,
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
      isHovered: {
        default: "blue-500",
        isInvalid: {
          default: "negative-300",
          isUnavailable: "transparent",
        },
      },
    },
    isSelectionStart: {
      default: lightDark("accent-900", "accent-700"),
      isHovered: lightDark("accent-1000", "accent-600"),
      isPressed: lightDark("accent-1000", "accent-600"),
      isDisabled: "transparent",
      isInvalid: {
        default: lightDark("negative-900", "negative-700"),
        isHovered: {
          default: lightDark("negative-1000", "negative-600"),
          isUnavailable: lightDark("negative-900", "negative-700"),
        },
        isPressed: lightDark("negative-1000", "negative-600"),
      },
    },
    isSelectionEnd: {
      default: lightDark("accent-900", "accent-700"),
      isHovered: lightDark("accent-1000", "accent-600"),
      isPressed: lightDark("accent-1000", "accent-600"),
      isDisabled: "transparent",
      isInvalid: {
        default: lightDark("negative-900", "negative-700"),
        isHovered: {
          default: lightDark("negative-1000", "negative-600"),
          isUnavailable: lightDark("negative-900", "negative-700"),
        },
        isPressed: lightDark("negative-1000", "negative-600"),
      },
    },
    forcedColors: {
      default: "transparent",
      isHovered: "Highlight",
      isSelected: {
        isHovered: "Highlight",
      },
      isSelectionStart: "Highlight",
      isSelectionEnd: "Highlight",
      isUnavailable: "transparent",
    },
  },
  color: {
    default: "neutral",
    isSelected: "neutral",
    isSelectionStart: "white",
    isSelectionEnd: "white",
    isDisabled: "disabled",
    isUnavailable: "disabled",
    forcedColors: {
      default: "ButtonText",
      isSelected: "HighlightText",
      isSelectionStart: "HighlightText",
      isSelectionEnd: "HighlightText",
      isDisabled: "GrayText",
    },
  },
});

const rangeCalendarTodayDot = style<{ isToday?: boolean }>({
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

const rangeCalendarUnavailable = style({
  position: "absolute",
  top: "[calc(50% - 1px)]",
  left: "[calc(25% - 1px)]",
  right: "[calc(25% - 1px)]",
  height: 2,
  transform: "rotate(-16deg)",
  borderRadius: "full",
  backgroundColor: "[currentColor]",
});

const rangeSelectionBackground = style<{
  isInvalid?: boolean;
  isFirstDayInWeek?: boolean;
  isLastDayInWeek?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isPreviousDayNotSelected?: boolean;
  isNextDayNotSelected?: boolean;
}>({
  position: "absolute",
  zIndex: -1,
  top: 0,
  insetStart: {
    default: -4,
    isFirstDayInWeek: 0,
    isSelectionStart: 0,
    isPreviousDayNotSelected: 0,
  },
  insetEnd: {
    default: -4,
    isLastDayInWeek: 0,
    isSelectionEnd: 0,
    isNextDayNotSelected: 0,
  },
  bottom: 0,
  borderStartRadius: {
    default: "none",
    isFirstDayInWeek: "full",
    isSelectionStart: "full",
    isPreviousDayNotSelected: "full",
  },
  borderEndRadius: {
    default: "none",
    isLastDayInWeek: "full",
    isSelectionEnd: "full",
    isNextDayNotSelected: "full",
  },
  backgroundColor: {
    default: "blue-subtle",
    isInvalid: "negative-100",
    forcedColors: {
      default: "Highlight",
    },
  },
  forcedColorAdjust: "none",
});

const rangeSelectionBorder = style<{
  isInvalid?: boolean;
  isFirstDayInWeek?: boolean;
  isLastDayInWeek?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isPreviousDayNotSelected?: boolean;
  isNextDayNotSelected?: boolean;
}>({
  position: "absolute",
  zIndex: 1,
  top: 0,
  insetStart: {
    default: -4,
    isFirstDayInWeek: 0,
    isSelectionStart: 0,
    isPreviousDayNotSelected: 0,
  },
  insetEnd: {
    default: -4,
    isLastDayInWeek: 0,
    isSelectionEnd: 0,
    isNextDayNotSelected: 0,
  },
  bottom: 0,
  borderStartWidth: {
    default: 0,
    isFirstDayInWeek: 1,
    isSelectionStart: 1,
    isPreviousDayNotSelected: 1,
  },
  borderTopWidth: 1,
  borderEndWidth: {
    default: 0,
    isLastDayInWeek: 1,
    isSelectionEnd: 1,
    isNextDayNotSelected: 1,
  },
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: {
    default: "blue-800",
    isInvalid: "negative-900",
    forcedColors: {
      default: "ButtonText",
    },
  },
  borderStartRadius: {
    default: "none",
    isFirstDayInWeek: "full",
    isSelectionStart: "full",
    isPreviousDayNotSelected: "full",
  },
  borderEndRadius: {
    default: "none",
    isLastDayInWeek: "full",
    isSelectionEnd: "full",
    isNextDayNotSelected: "full",
  },
});

const rangeCalendarNavIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  width: "[1.4285714285714286em]",
  height: "[1.4285714285714286em]",
  forcedColorAdjust: "none",
});

const rangeCalendarHelpText = style<{ isInvalid?: boolean; isDisabled?: boolean }>({
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  font: "body-sm",
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
});

function RangeCalendarHeading(props: { visibleMonths: number; locale?: string }): JSX.Element {
  const state = useRangeCalendarContext();
  const months = () =>
    Array.from({ length: props.visibleMonths }, (_, index) =>
      monthTitle(state.visibleRange().start.add({ months: index }), props.locale, state.timeZone),
    );

  return (
    <h2 aria-live="polite" class={rangeCalendarHeading}>
      <For each={months()}>
        {(title, index) =>
          index() === 0 ? (
            <div class={rangeCalendarTitle}>{title}</div>
          ) : (
            <>
              <div class={rangeCalendarTitleSpacer32} />
              <div class={rangeCalendarTitleSpacer24} />
              <div class={rangeCalendarTitleSpacer32} />
              <div class={rangeCalendarTitle}>{title}</div>
            </>
          )
        }
      </For>
    </h2>
  );
}

function RangeCalendarCellContent(props: {
  cell: RangeCalendarCellRenderProps;
  date: CalendarDate;
}): JSX.Element {
  const state = useRangeCalendarContext();
  const [innerElement, setInnerElement] = createSignal<HTMLDivElement | null>(null);
  const isSelectionStart = () =>
    props.cell.isSelectionStart && (!props.cell.isUnavailable || props.cell.isInvalid);
  const isSelectionEnd = () =>
    props.cell.isSelectionEnd && (!props.cell.isUnavailable || props.cell.isInvalid);
  const isDateInRange = (date: CalendarDate) => {
    const highlightedRange = state.highlightedRange?.();

    if (!highlightedRange) {
      return state.isSelected(date);
    }

    if (props.cell.isInvalid) {
      return date.compare(highlightedRange.start) >= 0 && date.compare(highlightedRange.end) <= 0;
    }

    return state.isSelected(date);
  };
  const previousDay = () => props.date.subtract({ days: 1 });
  const nextDay = () => props.date.add({ days: 1 });
  const isPreviousDayNotSelected = () =>
    !isDateInRange(previousDay()) || previousDay().month !== props.date.month;
  const isNextDayNotSelected = () =>
    !isDateInRange(nextDay()) || nextDay().month !== props.date.month;
  const selectionStyleState = () => ({
    isInvalid: props.cell.isInvalid,
    isFirstDayInWeek: props.cell.isFirstChild,
    isLastDayInWeek: props.cell.isLastChild,
    isSelectionStart: isSelectionStart(),
    isSelectionEnd: isSelectionEnd(),
    isPreviousDayNotSelected: isPreviousDayNotSelected(),
    isNextDayNotSelected: isNextDayNotSelected(),
  });
  const isBackgroundStyleApplied = () =>
    props.cell.isSelected &&
    (props.cell.isInvalid || !props.cell.isUnavailable) &&
    (isDateInRange(previousDay()) ||
      (nextDay().month === props.date.month && isDateInRange(nextDay())));

  return (
    <div class={rangeCalendarCellInnerFrame}>
      <div
        ref={setInnerElement}
        style={pressScale(innerElement, {})(props.cell)}
        class={rangeCalendarCellInner({
          ...props.cell,
          isSelectionStart: isSelectionStart(),
          isSelectionEnd: isSelectionEnd(),
          selectionMode: "range",
        })}
      >
        <div class={rangeCalendarTodayDot({ isToday: props.cell.isToday })} role="presentation" />
        <div>{props.cell.formattedDate}</div>
        <Show when={props.cell.isUnavailable}>
          <div class={rangeCalendarUnavailable} role="presentation" />
        </Show>
      </div>
      <Show when={isBackgroundStyleApplied()}>
        <div class={rangeSelectionBackground(selectionStyleState())} role="presentation" />
      </Show>
      <Show when={isBackgroundStyleApplied()}>
        <div class={rangeSelectionBorder(selectionStyleState())} role="presentation" />
      </Show>
    </div>
  );
}

/**
 * A range calendar displays a grid of days and allows users to select a date range.
 */
export function RangeCalendar<T extends DateValue = CalendarDate>(
  props: RangeCalendarProps<T>,
): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(RangeCalendarContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const providerLocale = useLocale();
  const [local, rest] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
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

  const size = () => normalizeRangeCalendarSize(local.size);
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
    "--num-calendars": visibleMonths(),
    width: "fit-content",
    "max-width": "100%",
    ...(mergedUnsafeStyle() ?? {}),
  });
  const monthOffsets = () => Array.from({ length: visibleMonths() }, (_, index) => index);

  return (
    <HeadlessRangeCalendar
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
        rangeCalendarRoot({ isMultiMonth: visibleMonths() > 1 }, mergedStyles()),
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle()}
    >
      <header class={rangeCalendarHeader}>
        <RangeCalendarButton
          slot="previous"
          class={rangeCalendarNavButton({ buttonSize: sizeConfig().buttonSize })}
          style={{
            width: `${sizeConfig().buttonSize}px`,
            height: `${sizeConfig().buttonSize}px`,
          }}
        >
          <ChevronLeftIcon styles={rangeCalendarNavIcon} />
        </RangeCalendarButton>

        <RangeCalendarHeading visibleMonths={visibleMonths()} locale={locale()} />

        <RangeCalendarButton
          slot="next"
          class={rangeCalendarNavButton({ buttonSize: sizeConfig().buttonSize })}
          style={{
            width: `${sizeConfig().buttonSize}px`,
            height: `${sizeConfig().buttonSize}px`,
          }}
        >
          <ChevronRightIcon styles={rangeCalendarNavIcon} />
        </RangeCalendarButton>
      </header>

      <div class={rangeCalendarMonths({ isMultiMonth: visibleMonths() > 1 })}>
        <For each={monthOffsets()}>
          {(offset) => (
            <RangeCalendarGrid
              class={rangeCalendarGrid}
              style={{
                width: `${sizeConfig().cellMaxWidth * 7}px`,
                "table-layout": "fixed",
              }}
              weekdayStyle="narrow"
              headerCellClass={rangeCalendarHeaderCell}
              offset={offset === 0 ? undefined : { months: offset }}
            >
              {(date) => (
                <RangeCalendarCell
                  date={date}
                  cellClass={rangeCalendarCellWrapper}
                  cellStyle={() => cellBoxStyle(size())}
                  style={() => cellBoxStyle(size())}
                  class={({ isOutsideMonth }) =>
                    rangeCalendarCellOuter({
                      isOutsideMonth,
                    })
                  }
                >
                  {(cell) => <RangeCalendarCellContent cell={cell} date={date} />}
                </RangeCalendarCell>
              )}
            </RangeCalendarGrid>
          )}
        </For>
      </div>

      <Show when={isInvalid() && local.errorMessage}>
        <p
          id={errorMessageId}
          class={rangeCalendarHelpText({ isInvalid: true, isDisabled: Boolean(rest.isDisabled) })}
        >
          {local.errorMessage}
        </p>
      </Show>
    </HeadlessRangeCalendar>
  );
}

export type { RangeValue };
