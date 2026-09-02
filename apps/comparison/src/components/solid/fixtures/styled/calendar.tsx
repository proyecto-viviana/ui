import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Calendar as SolidSpectrumCalendar,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  calendarCreateCalendarForDemo,
  calendarDateFromString,
  calendarDemoPropsFromWindow,
  calendarMaxValue,
  calendarMinValue,
  calendarVisibleMonthsFromString,
  comparisonControlsEvent as calendarControlsEvent,
  isCalendarDateUnavailable,
  normalizeCalendarDemoProps,
  serializeCalendarDemoProps,
  type CalendarDemoProps,
} from "@comparison/data/calendar-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumCalendarDemo() {
  const [demoProps, setDemoProps] = createSignal<CalendarDemoProps>(calendarDemoPropsFromWindow());
  const [value, setValue] = createSignal(
    calendarDateFromString(calendarDemoPropsFromWindow().value),
  );
  const [focusedValue, setFocusedValue] = createSignal(
    calendarDateFromString(
      calendarDemoPropsFromWindow().focusedValue || calendarDemoPropsFromWindow().value,
    ),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "calendar") {
        const nextProps = normalizeCalendarDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => calendarDateFromString(nextProps.value));
        setFocusedValue(() => calendarDateFromString(nextProps.focusedValue || nextProps.value));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(calendarControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(calendarControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeCalendarDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      get locale() {
        return demoProps().locale || undefined;
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value() ? String(value()) : "";
          },
          get "data-comparison-focused-value"() {
            return focusedValue() ? String(focusedValue()) : "";
          },
          "data-comparison-control-root": "calendar",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumCalendar, {
            class: "comparison-calendar-root",
            "aria-label": "Event date",
            get value() {
              return value() ?? undefined;
            },
            onChange: (nextValue: NonNullable<ReturnType<typeof calendarDateFromString>>) => {
              setValue(() => nextValue);
            },
            get minValue() {
              return demoProps().constrainRange ? calendarMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? calendarMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isCalendarDateUnavailable : undefined;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get visibleMonths() {
              return calendarVisibleMonthsFromString(demoProps().visibleMonths);
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get selectionAlignment() {
              return demoProps().selectionAlignment || undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
            },
            get focusedValue() {
              return demoProps().focusedValue ? (focusedValue() ?? undefined) : undefined;
            },
            onFocusChange: (
              nextFocusedValue: NonNullable<ReturnType<typeof calendarDateFromString>>,
            ) => {
              setFocusedValue(() => nextFocusedValue);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumCalendarDemo, {});
