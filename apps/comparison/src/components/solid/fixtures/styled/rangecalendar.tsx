import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  RangeCalendar as SolidSpectrumRangeCalendar,
} from "@proyecto-viviana/solid-spectrum";
import { calendarCreateCalendarForDemo } from "@comparison/data/calendar-demo";
import {
  comparisonControlsEvent as rangeCalendarControlsEvent,
  isRangeCalendarDateUnavailable,
  normalizeRangeCalendarDemoProps,
  rangeCalendarDateFromString,
  rangeCalendarDemoPropsFromWindow,
  rangeCalendarMaxValue,
  rangeCalendarMinValue,
  rangeCalendarValueFromDemo,
  rangeCalendarVisibleMonthsFromString,
  serializeRangeCalendarDemoProps,
  serializeRangeCalendarValue,
  type RangeCalendarDemoProps,
} from "@comparison/data/rangecalendar-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumRangeCalendarDemo() {
  const [demoProps, setDemoProps] = createSignal<RangeCalendarDemoProps>(
    rangeCalendarDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(rangeCalendarValueFromDemo(demoProps()));
  const [focusedValue, setFocusedValue] = createSignal(
    rangeCalendarDateFromString(demoProps().focusedValue || demoProps().startValue),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangecalendar") {
        const nextProps = normalizeRangeCalendarDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => rangeCalendarValueFromDemo(nextProps));
        setFocusedValue(() =>
          rangeCalendarDateFromString(nextProps.focusedValue || nextProps.startValue),
        );
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(rangeCalendarControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(rangeCalendarControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeRangeCalendarDemoProps(demoProps()));

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
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-calendar-system"() {
            return demoProps().calendarSystem;
          },
          get "data-comparison-value"() {
            return serializeRangeCalendarValue(value());
          },
          get "data-comparison-focused-value"() {
            return focusedValue() ? String(focusedValue()) : "";
          },
          "data-comparison-control-root": "rangecalendar",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumRangeCalendar, {
            class: "comparison-rangecalendar-root",
            "aria-label": "Trip dates",
            get value() {
              return value() ?? undefined;
            },
            onChange: (nextValue: ReturnType<typeof value>) => {
              setValue(() => nextValue);
            },
            get minValue() {
              return demoProps().constrainRange ? rangeCalendarMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? rangeCalendarMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isRangeCalendarDateUnavailable : undefined;
            },
            get allowsNonContiguousRanges() {
              return demoProps().allowsNonContiguousRanges;
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
              return rangeCalendarVisibleMonthsFromString(demoProps().visibleMonths);
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
            onFocusChange: (nextFocusedValue: ReturnType<typeof focusedValue>) => {
              setFocusedValue(() => nextFocusedValue);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumRangeCalendarDemo, {});
