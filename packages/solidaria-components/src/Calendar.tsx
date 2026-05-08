/**
 * Calendar component for solidaria-components
 *
 * Pre-wired headless calendar component that combines aria hooks.
 * Port of react-aria-components/src/Calendar.tsx
 */

import {
  type JSX,
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
  createCalendar,
  createCalendarGrid,
  createCalendarCell,
  createHover,
  type AriaCalendarProps,
  type AriaCalendarGridProps,
} from "@proyecto-viviana/solidaria";
import {
  createCalendarState,
  type CalendarState,
  type CalendarStateProps,
  type CalendarDate,
  type DateValue,
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

export interface CalendarRenderProps {
  /** Whether the calendar is disabled. */
  isDisabled: boolean;
  /** Whether the calendar is read-only. */
  isReadOnly: boolean;
}

export interface CalendarProps<T extends DateValue = DateValue>
  extends
    Omit<AriaCalendarProps, "id" | "isDisabled" | "isReadOnly">,
    Omit<CalendarStateProps<T>, "locale">,
    SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CalendarRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CalendarRenderProps>;
  /** The locale to use for formatting. */
  locale?: string;
}

export interface CalendarGridRenderProps {
  /** Whether the grid is disabled. */
  isDisabled: boolean;
}

export interface CalendarGridProps
  extends Omit<AriaCalendarGridProps, "startDate" | "endDate">, SlotProps {
  /** The children of the component (render function receiving weeks). */
  children?: (date: CalendarDate) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CalendarGridRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CalendarGridRenderProps>;
  /** Class name for weekday header cells. */
  headerCellClass?: string;
  /** Number of weeks to offset from the start. */
  offset?: { months?: number };
}

export interface CalendarCellRenderProps {
  /** Whether the cell is selected. */
  isSelected: boolean;
  /** Whether the cell is focused. */
  isFocused: boolean;
  /** Whether the cell is disabled. */
  isDisabled: boolean;
  /** Whether the cell is unavailable. */
  isUnavailable: boolean;
  /** Whether the cell is outside the visible month. */
  isOutsideMonth: boolean;
  /** Whether the cell represents today. */
  isToday: boolean;
  /** Whether the cell is pressed. */
  isPressed: boolean;
  /** Whether the cell is hovered. */
  isHovered: boolean;
  /** The formatted date string. */
  formattedDate: string;
}

export interface CalendarCellProps extends SlotProps {
  /** The date for this cell. */
  date: CalendarDate;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<CalendarCellRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CalendarCellRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CalendarCellRenderProps>;
  /** Class name for the table cell wrapper. */
  cellClass?: ClassNameOrFunction<CalendarCellRenderProps>;
  /** Inline style for the table cell wrapper. */
  cellStyle?: StyleOrFunction<CalendarCellRenderProps>;
}

export interface CalendarHeaderCellProps extends SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface CalendarGridHeaderProps extends SlotProps {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

export interface CalendarGridBodyProps extends SlotProps {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

export const CalendarContext = createContext<CalendarState<DateValue> | null>(null);
const CalendarGridMonthContext = createContext<CalendarDate | null>(null);

export function useCalendarContext(): CalendarState<DateValue> {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("Calendar components must be used within a Calendar");
  }
  return context;
}

/**
 * A calendar displays a grid of days in a month and allows users to select a single date.
 *
 * @example
 * ```tsx
 * <Calendar aria-label="Event date">
 *   <header>
 *     <CalendarButton slot="previous">◀</CalendarButton>
 *     <CalendarHeading />
 *     <CalendarButton slot="next">▶</CalendarButton>
 *   </header>
 *   <CalendarGrid>
 *     {(date) => <CalendarCell date={date} />}
 *   </CalendarGrid>
 * </Calendar>
 * ```
 */
export function Calendar<T extends DateValue = CalendarDate>(props: CalendarProps<T>): JSX.Element {
  const inheritedState = useContext(CalendarContext);

  // Use hydration-safe pattern for client-only rendering
  const isHydrated = useIsHydrated();

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div class="solidaria-Calendar solidaria-Calendar--placeholder" aria-hidden="true" />
      }
    >
      <Show when={inheritedState} fallback={<CalendarInner {...props} />}>
        <CalendarWithState state={inheritedState as CalendarState<DateValue>} {...props} />
      </Show>
    </Show>
  );
}

function CalendarWithState<T extends DateValue = CalendarDate>(
  props: CalendarProps<T> & { state: CalendarState<DateValue> },
): JSX.Element {
  const [local, _stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "state"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "autoFocus",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "locale",
      "isDateUnavailable",
      "visibleMonths",
      "isDateDisabled",
      "validationState",
      "errorMessage",
      "firstDayOfWeek",
    ],
  );

  const state = () => props.state;
  const calendarAria = createCalendar(rest, state());

  const renderValues = createMemo<CalendarRenderProps>(() => ({
    isDisabled: state().isDisabled(),
    isReadOnly: state().isReadOnly(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Calendar",
    },
    renderValues,
  );

  return (
    <div
      {...calendarAria.calendarProps}
      class={renderProps.class()}
      style={renderProps.style()}
      data-disabled={dataAttr(state().isDisabled())}
      data-readonly={dataAttr(state().isReadOnly())}
    >
      {props.children}
    </div>
  );
}

/**
 * Internal Calendar component that renders after client mount.
 */
function CalendarInner<T extends DateValue = CalendarDate>(props: CalendarProps<T>): JSX.Element {
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
      "autoFocus",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "locale",
      "isDateUnavailable",
      "visibleMonths",
      "isDateDisabled",
      "validationState",
      "errorMessage",
      "firstDayOfWeek",
    ],
  );

  // Create calendar state
  const state = createCalendarState(stateProps);

  // Create calendar ARIA props
  const calendarAria = createCalendar(rest, state as unknown as CalendarState<DateValue>);

  const renderValues = createMemo<CalendarRenderProps>(() => ({
    isDisabled: state.isDisabled(),
    isReadOnly: state.isReadOnly(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Calendar",
    },
    renderValues,
  );

  return (
    <CalendarContext.Provider value={state as unknown as CalendarState<DateValue>}>
      <div
        {...calendarAria.calendarProps}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={dataAttr(state.isDisabled())}
        data-readonly={dataAttr(state.isReadOnly())}
      >
        {props.children}
      </div>
    </CalendarContext.Provider>
  );
}

export interface CalendarHeadingProps extends SlotProps {
  /** The children of the component. */
  children?: RenderChildren<{ title: string }>;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

/**
 * Displays the current month and year in the calendar.
 */
export function CalendarHeading(props: CalendarHeadingProps): JSX.Element {
  const state = useCalendarContext();
  const renderValues = createMemo(() => ({
    title: state.title(),
  }));
  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-CalendarHeading",
    },
    renderValues,
  );

  return (
    <h2 class={renderProps.class()} style={renderProps.style()} aria-live="polite">
      {typeof props.children === "function" ? renderProps.renderChildren() : state.title()}
    </h2>
  );
}

export interface CalendarButtonProps extends SlotProps {
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
 * A button for navigating the calendar.
 */
export function CalendarButton(props: CalendarButtonProps): JSX.Element {
  const state = useCalendarContext();
  const calendarAria = createCalendar({}, state);

  const buttonProps = createMemo(() => {
    if (props.slot === "previous") {
      return calendarAria.prevButtonProps;
    }
    return calendarAria.nextButtonProps;
  });

  return (
    <button
      {...buttonProps()}
      class={props.class ?? "solidaria-CalendarButton"}
      style={props.style}
      disabled={props.isDisabled || state.isDisabled()}
    >
      {props.children}
    </button>
  );
}

/**
 * Displays a grid of calendar cells.
 */
export function CalendarGrid(props: CalendarGridProps): JSX.Element {
  const state = useCalendarContext();
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
    state,
    gridRef,
  );

  const renderValues = createMemo<CalendarGridRenderProps>(() => ({
    isDisabled: state.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-CalendarGrid",
    },
    renderValues,
  );

  // Memoize ALL dates for the grid at once to avoid reactive loops.
  // This breaks the cycle where accessing visibleRange() inside For loop
  // would cause infinite re-renders.
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
    <CalendarGridMonthContext.Provider value={startDate()}>
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
                <th scope="col" class={props.headerCellClass ?? "solidaria-CalendarHeaderCell"}>
                  {props.weekdayStyle === "narrow" ? day.slice(0, 1) : day}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <Index each={allDates()}>
            {(weekDates) => (
              <tr>
                <Index each={weekDates()}>
                  {(date) => (
                    <Show when={date()} fallback={<td />}>
                      {props.children?.(date()!)}
                    </Show>
                  )}
                </Index>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    </CalendarGridMonthContext.Provider>
  );
}

export function CalendarGridHeader(props: CalendarGridHeaderProps): JSX.Element {
  return (
    <thead class={props.class ?? "solidaria-CalendarGridHeader"} style={props.style}>
      {props.children}
    </thead>
  );
}

export function CalendarGridBody(props: CalendarGridBodyProps): JSX.Element {
  return (
    <tbody class={props.class ?? "solidaria-CalendarGridBody"} style={props.style}>
      {props.children}
    </tbody>
  );
}

export function CalendarHeaderCell(props: CalendarHeaderCellProps): JSX.Element {
  return (
    <th scope="col" class={props.class ?? "solidaria-CalendarHeaderCell"} style={props.style}>
      {props.children}
    </th>
  );
}

/**
 * A cell in the calendar grid representing a single day.
 */
export function CalendarCell(props: CalendarCellProps): JSX.Element {
  const state = useCalendarContext();
  const currentMonthStart = useContext(CalendarGridMonthContext);
  const [cellRef, setCellRef] = createSignal<HTMLDivElement | null>(null);
  const isOutsideMonth = createMemo(
    () => currentMonthStart != null && !isSameMonth(currentMonthStart, props.date),
  );

  const cellAria = createCalendarCell(
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

  const renderValues = createMemo<CalendarCellRenderProps>(() => ({
    isSelected: cellAria.isSelected,
    isFocused: cellAria.isFocused,
    isDisabled: cellAria.isDisabled,
    isUnavailable: cellAria.isUnavailable,
    isOutsideMonth: cellAria.isOutsideMonth,
    isToday: cellAria.isToday,
    isPressed: cellAria.isPressed,
    isHovered: isHovered(),
    formattedDate: cellAria.formattedDate,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-CalendarCell",
    },
    renderValues,
  );
  const cellRenderProps = useRenderProps(
    {
      class: props.cellClass,
      style: props.cellStyle,
      defaultClassName: "solidaria-CalendarCellWrapper",
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
        data-focused={dataAttr(cellAria.isFocused)}
        data-disabled={dataAttr(cellAria.isDisabled)}
        data-unavailable={dataAttr(cellAria.isUnavailable)}
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

export type { CalendarState, CalendarDate, DateValue };
