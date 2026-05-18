/**
 * RangeCalendar component for solidaria-components
 *
 * Pre-wired headless range calendar component that combines aria hooks.
 * Port of react-aria-components/src/RangeCalendar.tsx
 */

import {
  type JSX,
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  For,
  Index,
  Show,
} from "solid-js";
import {
  createRangeCalendar,
  createCalendarGrid,
  createRangeCalendarCell,
  createHover,
  type AriaRangeCalendarProps,
  type AriaCalendarGridProps,
} from "@proyecto-viviana/solidaria";
import {
  createRangeCalendarState,
  type RangeCalendarState,
  type RangeCalendarStateProps,
  type CalendarDate,
  type DateValue,
  type RangeValue,
  endOfMonth,
  isSameMonth,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  useIsHydrated,
} from "./utils";
import { VisuallyHidden } from "./VisuallyHidden";

export interface RangeCalendarRenderProps {
  /** Whether the calendar is disabled. */
  isDisabled: boolean;
  /** Whether the calendar is read-only. */
  isReadOnly: boolean;
  /** Whether the current selection is invalid. */
  isInvalid: boolean;
  /** Whether the user is currently selecting a range. */
  isDragging: boolean;
}

export interface RangeCalendarProps<T extends DateValue = DateValue>
  extends
    Omit<AriaRangeCalendarProps, "id" | "isDisabled" | "isReadOnly">,
    Omit<RangeCalendarStateProps<T>, "locale">,
    SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RangeCalendarRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RangeCalendarRenderProps>;
  /** The locale to use for formatting. */
  locale?: string;
}

export interface RangeCalendarGridRenderProps {
  /** Whether the grid is disabled. */
  isDisabled: boolean;
}

export interface RangeCalendarGridProps
  extends Omit<AriaCalendarGridProps, "startDate" | "endDate">, SlotProps {
  /** The children of the component (render function receiving dates). */
  children?: (date: CalendarDate) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RangeCalendarGridRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RangeCalendarGridRenderProps>;
  /** Class name for weekday header cells. */
  headerCellClass?: string;
  /** Inline style for weekday header cells. */
  headerCellStyle?: JSX.CSSProperties;
  /** Number of months to offset from the start. */
  offset?: { months?: number };
}

export interface RangeCalendarCellRenderProps {
  /** Whether the cell is within the selected range. */
  isSelected: boolean;
  /** Whether the cell is the start of the selection. */
  isSelectionStart: boolean;
  /** Whether the cell is the end of the selection. */
  isSelectionEnd: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
  /** Whether the cell is disabled. */
  isDisabled: boolean;
  /** Whether the cell is unavailable. */
  isUnavailable: boolean;
  /** Whether the cell is part of an invalid selection. */
  isInvalid: boolean;
  /** Whether the cell is outside the visible month. */
  isOutsideMonth: boolean;
  /** Whether the cell represents today. */
  isToday: boolean;
  /** Whether the cell is pressed. */
  isPressed: boolean;
  /** Whether the cell is hovered. */
  isHovered: boolean;
  /** Whether the cell is the first day slot in its row. */
  isFirstChild: boolean;
  /** Whether the cell is the last day slot in its row. */
  isLastChild: boolean;
  /** Whether the cell is in the first rendered week row. */
  isFirstWeek: boolean;
  /** Whether the cell is in the last rendered week row. */
  isLastWeek: boolean;
  /** The formatted date string. */
  formattedDate: string;
}

export interface RangeCalendarCellProps extends SlotProps {
  /** The date for this cell. */
  date: CalendarDate;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<RangeCalendarCellRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<RangeCalendarCellRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<RangeCalendarCellRenderProps>;
  /** Class name for the table cell wrapper. */
  cellClass?: ClassNameOrFunction<RangeCalendarCellRenderProps>;
  /** Inline style for the table cell wrapper. */
  cellStyle?: StyleOrFunction<RangeCalendarCellRenderProps>;
}

export const RangeCalendarContext = createContext<RangeCalendarState<DateValue> | null>(null);
export const RangeCalendarStateContext = createContext<RangeCalendarState<DateValue> | null>(null);
const RangeCalendarGridMonthContext = createContext<Accessor<CalendarDate> | null>(null);
const RangeCalendarGridCellPositionContext = createContext<Accessor<{
  weekIndex: number;
  dayIndex: number;
  lastWeekIndex: number;
}> | null>(null);

export function useRangeCalendarContext(): RangeCalendarState<DateValue> {
  const context = useContext(RangeCalendarContext);
  if (!context) {
    throw new Error("RangeCalendar components must be used within a RangeCalendar");
  }
  return context;
}

/**
 * A range calendar displays a grid of days and allows users to select a contiguous range of dates.
 *
 * @example
 * ```tsx
 * <RangeCalendar aria-label="Date range">
 *   <header>
 *     <RangeCalendarButton slot="previous">◀</RangeCalendarButton>
 *     <RangeCalendarHeading />
 *     <RangeCalendarButton slot="next">▶</RangeCalendarButton>
 *   </header>
 *   <RangeCalendarGrid>
 *     {(date) => <RangeCalendarCell date={date} />}
 *   </RangeCalendarGrid>
 * </RangeCalendar>
 * ```
 */
export function RangeCalendar<T extends DateValue = CalendarDate>(
  props: RangeCalendarProps<T>,
): JSX.Element {
  // Use hydration-safe pattern for client-only rendering
  const isHydrated = useIsHydrated();

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div
          class="solidaria-RangeCalendar solidaria-RangeCalendar--placeholder"
          aria-hidden="true"
        />
      }
    >
      <RangeCalendarInner {...props} />
    </Show>
  );
}

/**
 * Internal RangeCalendar component that renders after client mount.
 */
function RangeCalendarInner<T extends DateValue = CalendarDate>(
  props: RangeCalendarProps<T>,
): JSX.Element {
  const [local, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "locale",
      "createCalendar",
      "isDateUnavailable",
      "visibleMonths",
      "isDateDisabled",
      "validationState",
      "allowsNonContiguousRanges",
      "firstDayOfWeek",
    ],
  );

  const state = createRangeCalendarState(stateProps);

  const calendarAria = createRangeCalendar(rest, state as unknown as RangeCalendarState<DateValue>);

  const renderValues = createMemo<RangeCalendarRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isReadOnly: state.isReadOnly(),
    isInvalid: state.isValueInvalid(),
    isDragging: state.isDragging(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-RangeCalendar",
    },
    renderValues,
  );

  return (
    <RangeCalendarStateContext.Provider value={state as unknown as RangeCalendarState<DateValue>}>
      <RangeCalendarContext.Provider value={state as unknown as RangeCalendarState<DateValue>}>
        <div
          {...calendarAria.calendarProps}
          class={renderProps.class()}
          style={renderProps.style()}
          data-disabled={dataAttr(state.isDisabled())}
          data-readonly={dataAttr(state.isReadOnly())}
          data-invalid={dataAttr(state.isValueInvalid())}
          data-dragging={dataAttr(state.isDragging())}
        >
          <VisuallyHidden>
            <h2>{String(calendarAria.calendarProps["aria-label"] ?? "")}</h2>
          </VisuallyHidden>
          {props.children}
        </div>
      </RangeCalendarContext.Provider>
    </RangeCalendarStateContext.Provider>
  );
}

export interface RangeCalendarHeadingProps extends SlotProps {
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

/**
 * Displays the current month and year in the range calendar.
 */
export function RangeCalendarHeading(props: RangeCalendarHeadingProps): JSX.Element {
  const state = useRangeCalendarContext();

  return (
    <h2
      class={props.class ?? "solidaria-RangeCalendarHeading"}
      style={props.style}
      aria-live="polite"
    >
      {state.title()}
    </h2>
  );
}

export interface RangeCalendarButtonProps extends SlotProps {
  /** The slot for this button (previous or next). */
  slot?: "previous" | "next";
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
  /** Whether the button is disabled. */
  isDisabled?: boolean;
}

/**
 * A button for navigating the range calendar.
 */
export function RangeCalendarButton(props: RangeCalendarButtonProps): JSX.Element {
  const state = useRangeCalendarContext();
  const calendarAria = createRangeCalendar({}, state);

  const buttonProps = createMemo(() => {
    if (props.slot === "previous") {
      return calendarAria.prevButtonProps;
    }
    return calendarAria.nextButtonProps;
  });

  return (
    <button
      {...buttonProps()}
      class={props.class ?? "solidaria-RangeCalendarButton"}
      style={props.style}
      disabled={props.isDisabled || state.isDisabled()}
    >
      {props.children}
    </button>
  );
}

/**
 * Displays a grid of range calendar cells.
 */
export function RangeCalendarGrid(props: RangeCalendarGridProps): JSX.Element {
  const state = useRangeCalendarContext();
  const [gridRef, setGridRef] = createSignal<HTMLTableElement | null>(null);
  const startDate = createMemo(() => {
    const offsetMonths = props.offset?.months ?? 0;
    const baseStart = state.visibleRange().start;
    return offsetMonths ? baseStart.add({ months: offsetMonths }) : baseStart;
  });

  const gridAria = createCalendarGrid(
    {
      startDate: startDate(),
      endDate: endOfMonth(startDate()),
      weekdayStyle: props.weekdayStyle,
    },
    state as unknown as Parameters<typeof createCalendarGrid>[1],
    gridRef,
  );

  const renderValues = createMemo<RangeCalendarGridRenderProps>(() => ({
    isDisabled: state.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-RangeCalendarGrid",
    },
    renderValues,
  );

  // Memoize all dates for the grid to avoid reactive loops in render paths.
  const allDates = createMemo(() => {
    const monthStart = startDate();
    const numWeeks = state.getWeeksInMonth(monthStart);
    const weekDates: (CalendarDate | null)[][] = [];

    for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
      weekDates.push(state.getDatesInWeek(weekIndex, monthStart));
    }

    return weekDates;
  });

  return (
    <RangeCalendarGridMonthContext.Provider value={startDate}>
      <table
        ref={setGridRef}
        {...gridAria.gridProps}
        class={renderProps.class()}
        style={renderProps.style()}
      >
        <thead {...gridAria.headerProps}>
          <tr>
            <For each={gridAria.weekDays}>
              {(day) => (
                <th
                  scope="col"
                  class={props.headerCellClass ?? "solidaria-RangeCalendarHeaderCell"}
                  style={props.headerCellStyle}
                >
                  {day}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <Index each={allDates()}>
            {(weekDates, weekIndex) => (
              <tr>
                <Index each={weekDates()}>
                  {(date, dayIndex) => (
                    <Show when={date()} fallback={<td />}>
                      <RangeCalendarGridCellPositionContext.Provider
                        value={() => ({
                          weekIndex,
                          dayIndex,
                          lastWeekIndex: allDates().length - 1,
                        })}
                      >
                        {props.children?.(date()!)}
                      </RangeCalendarGridCellPositionContext.Provider>
                    </Show>
                  )}
                </Index>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    </RangeCalendarGridMonthContext.Provider>
  );
}

/**
 * A cell in the range calendar grid representing a single day.
 */
export function RangeCalendarCell(props: RangeCalendarCellProps): JSX.Element {
  const state = useRangeCalendarContext();
  const currentMonthStart = useContext(RangeCalendarGridMonthContext);
  const cellPosition = useContext(RangeCalendarGridCellPositionContext);
  const [cellRef, setCellRef] = createSignal<HTMLDivElement | null>(null);
  const isOutsideMonth = createMemo(
    () => currentMonthStart != null && !isSameMonth(currentMonthStart(), props.date),
  );
  const position = createMemo(
    () =>
      cellPosition?.() ?? {
        weekIndex: 0,
        dayIndex: 0,
        lastWeekIndex: 0,
      },
  );

  const cellAria = createRangeCalendarCell(
    () => ({
      date: props.date,
      isOutsideMonth: isOutsideMonth(),
    }),
    state,
    cellRef,
  );
  const { hoverProps, isHovered } = createHover(() => ({
    isDisabled: cellAria.isDisabled || cellAria.isUnavailable,
  }));

  const renderValues = createMemo<RangeCalendarCellRenderProps>(() => ({
    isSelected: cellAria.isSelected,
    isSelectionStart: cellAria.isSelectionStart,
    isSelectionEnd: cellAria.isSelectionEnd,
    isFocused: cellAria.isFocused,
    isDisabled: cellAria.isDisabled,
    isUnavailable: cellAria.isUnavailable,
    isInvalid: cellAria.isInvalid,
    isOutsideMonth: cellAria.isOutsideMonth,
    isToday: cellAria.isToday,
    isPressed: cellAria.isPressed,
    isHovered: isHovered(),
    isFirstChild: position().dayIndex === 0,
    isLastChild: position().dayIndex === 6,
    isFirstWeek: position().weekIndex === 0,
    isLastWeek: position().weekIndex === position().lastWeekIndex,
    formattedDate: cellAria.formattedDate,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-RangeCalendarCell",
    },
    renderValues,
  );
  const cellRenderProps = useRenderProps(
    {
      class: props.cellClass,
      style: props.cellStyle,
      defaultClassName: "solidaria-RangeCalendarCellWrapper",
    },
    renderValues,
  );

  // Determine children content - avoid Show for SSR hydration compatibility
  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return cellAria.formattedDate;
  };

  return (
    <td {...cellAria.cellProps} class={cellRenderProps.class()} style={cellRenderProps.style()}>
      <div
        ref={setCellRef}
        {...cellAria.buttonProps}
        {...hoverProps}
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={dataAttr(cellAria.isSelected)}
        data-selection-start={dataAttr(cellAria.isSelectionStart)}
        data-selection-end={dataAttr(cellAria.isSelectionEnd)}
        data-focused={dataAttr(cellAria.isFocused)}
        data-disabled={dataAttr(cellAria.isDisabled)}
        data-unavailable={dataAttr(cellAria.isUnavailable)}
        data-invalid={dataAttr(cellAria.isInvalid)}
        data-outside-month={dataAttr(cellAria.isOutsideMonth)}
        data-today={dataAttr(cellAria.isToday)}
        data-pressed={dataAttr(cellAria.isPressed)}
        data-hovered={dataAttr(isHovered())}
      >
        {getChildren()}
      </div>
    </td>
  );
}

export type { RangeCalendarState, RangeValue };
