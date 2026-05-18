import {
  CalendarDateClass as CalendarDate,
  GregorianCalendar,
  parseDate,
  startOfWeek,
  type AnyCalendarDate,
  type Calendar,
  type CalendarDate as CalendarDateValue,
  type DateValue,
} from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const calendarFirstDayOfWeekOptions = [
  "",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
export const calendarVisibleMonthsOptions = ["", "1", "2", "3"] as const;
export const calendarPageBehaviorOptions = ["", "single", "visible"] as const;
export const calendarSelectionAlignmentOptions = ["", "start", "center", "end"] as const;
export const calendarLocaleOptions = ["", "fr-FR", "ar-AE", "hi-IN-u-ca-indian"] as const;
export const calendarSystemOptions = ["", "custom454"] as const;

export type CalendarDemoFirstDayOfWeek = (typeof calendarFirstDayOfWeekOptions)[number];
export type CalendarDemoVisibleMonths = (typeof calendarVisibleMonthsOptions)[number];
export type CalendarDemoPageBehavior = (typeof calendarPageBehaviorOptions)[number];
export type CalendarDemoSelectionAlignment = (typeof calendarSelectionAlignmentOptions)[number];
export type CalendarDemoLocale = (typeof calendarLocaleOptions)[number];
export type CalendarDemoCalendarSystem = (typeof calendarSystemOptions)[number];

export interface CalendarDemoProps {
  value: string;
  focusedValue: string;
  locale: CalendarDemoLocale;
  firstDayOfWeek: CalendarDemoFirstDayOfWeek;
  visibleMonths: CalendarDemoVisibleMonths;
  pageBehavior: CalendarDemoPageBehavior;
  selectionAlignment: CalendarDemoSelectionAlignment;
  calendarSystem: CalendarDemoCalendarSystem;
  constrainRange: boolean;
  unavailableDates: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  errorMessage: string;
}

export const calendarDemoDefaults: CalendarDemoProps = {
  value: "",
  focusedValue: "",
  locale: "",
  firstDayOfWeek: "",
  visibleMonths: "",
  pageBehavior: "",
  selectionAlignment: "",
  calendarSystem: "",
  constrainRange: false,
  unavailableDates: false,
  isDisabled: false,
  isReadOnly: false,
  isInvalid: false,
  errorMessage: "Choose an available date.",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function calendarDateFromString(value: string): DateValue | null {
  if (!value) {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

export function calendarVisibleMonthsFromString(
  value: CalendarDemoVisibleMonths,
): number | undefined {
  return value ? Number(value) : undefined;
}

export const calendarMinValue = parseDate("2025-02-03");
export const calendarMaxValue = parseDate("2025-02-20");

export function isCalendarDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export class CalendarDemoCustom454 extends GregorianCalendar {
  anchorDate = new CalendarDate(2001, 2, 4);

  private getYear(year: number): [CalendarDateValue, number[]] {
    let anchor = this.anchorDate.set({ year });
    let startOfYear = startOfWeek(anchor, "en", "sun");
    let isBigYear = !startOfYear.add({ weeks: 53 }).compare(anchor.add({ years: 1 }));
    let weekPattern = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, isBigYear ? 5 : 4];
    return [startOfYear, weekPattern];
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let [, weekPattern] = this.getYear(date.year);
    return weekPattern[date.month - 1] * 7;
  }

  fromJulianDay(jd: number): CalendarDateValue {
    let gregorian = super.fromJulianDay(jd);
    let year = gregorian.year;

    let [monthStart, weekPattern] = this.getYear(year);
    if (gregorian.compare(monthStart) < 0) {
      year--;
      [monthStart, weekPattern] = this.getYear(year);
    }

    for (let month = 1; month <= 12; month++) {
      let weeks = weekPattern[month - 1];
      let nextMonth = monthStart.add({ weeks });
      if (nextMonth.compare(gregorian) > 0) {
        let days = gregorian.compare(monthStart);
        return new CalendarDate(this, year, month, days + 1);
      }
      monthStart = nextMonth;
    }

    throw new Error("date not found");
  }

  toJulianDay(date: AnyCalendarDate): number {
    let [monthStart, weekPattern] = this.getYear(date.year);
    for (let month = 1; month < date.month; month++) {
      monthStart = monthStart.add({ weeks: weekPattern[month - 1] });
    }

    let gregorian = monthStart.add({ days: date.day - 1 });
    return super.toJulianDay(gregorian);
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDateValue {
    let anchorMonth = this.anchorDate.month - 1;
    let dateMonth = date.month - 1;
    let month = ((anchorMonth + dateMonth) % 12) + 1;
    let year = anchorMonth + dateMonth >= 12 ? date.year + 1 : date.year;
    return new CalendarDate(year, month, 1);
  }

  isEqual(other: Calendar): boolean {
    return (
      other instanceof CalendarDemoCustom454 && other.anchorDate.compare(this.anchorDate) === 0
    );
  }
}

export function calendarCreateCalendarForDemo(calendarSystem: CalendarDemoCalendarSystem) {
  if (calendarSystem === "custom454") {
    return () => new CalendarDemoCustom454();
  }

  return undefined;
}

export function normalizeCalendarDemoProps(props: Partial<CalendarDemoProps>): CalendarDemoProps {
  return {
    value:
      typeof props.value === "string" && props.value ? props.value : calendarDemoDefaults.value,
    focusedValue:
      typeof props.focusedValue === "string" && props.focusedValue
        ? props.focusedValue
        : calendarDemoDefaults.focusedValue,
    locale: isOneOf(props.locale, calendarLocaleOptions)
      ? props.locale
      : calendarDemoDefaults.locale,
    firstDayOfWeek: isOneOf(props.firstDayOfWeek, calendarFirstDayOfWeekOptions)
      ? props.firstDayOfWeek
      : calendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(props.visibleMonths, calendarVisibleMonthsOptions)
      ? props.visibleMonths
      : calendarDemoDefaults.visibleMonths,
    pageBehavior: isOneOf(props.pageBehavior, calendarPageBehaviorOptions)
      ? props.pageBehavior
      : calendarDemoDefaults.pageBehavior,
    selectionAlignment: isOneOf(props.selectionAlignment, calendarSelectionAlignmentOptions)
      ? props.selectionAlignment
      : calendarDemoDefaults.selectionAlignment,
    calendarSystem: isOneOf(props.calendarSystem, calendarSystemOptions)
      ? props.calendarSystem
      : calendarDemoDefaults.calendarSystem,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isInvalid: props.isInvalid === true,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : calendarDemoDefaults.errorMessage,
  };
}

export function calendarDemoPropsFromSearch(search: string): CalendarDemoProps {
  const params = new URLSearchParams(search);
  const firstDayOfWeek = params.get("firstDayOfWeek");
  const visibleMonths = params.get("visibleMonths");
  const pageBehavior = params.get("pageBehavior");
  const selectionAlignment = params.get("selectionAlignment");
  const locale = params.get("locale");
  const calendarSystem = params.get("calendarSystem");

  return normalizeCalendarDemoProps({
    value: params.get("value") || calendarDemoDefaults.value,
    focusedValue: params.get("focusedValue") || calendarDemoDefaults.focusedValue,
    locale: isOneOf(locale, calendarLocaleOptions) ? locale : calendarDemoDefaults.locale,
    firstDayOfWeek: isOneOf(firstDayOfWeek, calendarFirstDayOfWeekOptions)
      ? firstDayOfWeek
      : calendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(visibleMonths, calendarVisibleMonthsOptions)
      ? visibleMonths
      : calendarDemoDefaults.visibleMonths,
    pageBehavior: isOneOf(pageBehavior, calendarPageBehaviorOptions)
      ? pageBehavior
      : calendarDemoDefaults.pageBehavior,
    selectionAlignment: isOneOf(selectionAlignment, calendarSelectionAlignmentOptions)
      ? selectionAlignment
      : calendarDemoDefaults.selectionAlignment,
    calendarSystem: isOneOf(calendarSystem, calendarSystemOptions)
      ? calendarSystem
      : calendarDemoDefaults.calendarSystem,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isInvalid: booleanParam(params.get("isInvalid")),
    errorMessage: params.get("errorMessage") ?? calendarDemoDefaults.errorMessage,
  });
}

export function calendarDemoPropsFromWindow(): CalendarDemoProps {
  if (typeof window === "undefined") {
    return calendarDemoDefaults;
  }

  return calendarDemoPropsFromSearch(window.location.search);
}

export function serializeCalendarDemoProps(props: CalendarDemoProps) {
  return JSON.stringify({
    value: props.value,
    focusedValue: props.focusedValue,
    locale: props.locale,
    firstDayOfWeek: props.firstDayOfWeek,
    visibleMonths: props.visibleMonths,
    pageBehavior: props.pageBehavior,
    selectionAlignment: props.selectionAlignment,
    calendarSystem: props.calendarSystem,
    constrainRange: props.constrainRange,
    unavailableDates: props.unavailableDates,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isInvalid: props.isInvalid,
    errorMessage: props.errorMessage,
  });
}
