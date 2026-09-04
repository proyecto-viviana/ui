import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  DateRangePicker as SolidSpectrumDateRangePicker,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { calendarCreateCalendarForDemo } from "@comparison/data/calendar-demo";
import {
  dateRangePickerMaxValue,
  dateRangePickerMinValue,
  dateRangePickerDemoPropsFromWindow,
  dateRangePickerValueFromDemo,
  isDateRangePickerDateUnavailable,
  normalizeDateRangePickerDemoProps,
  serializeDateRangePickerDemoProps,
  serializeDateRangePickerValue,
  type DateRangePickerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/daterangepicker-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumDateRangePickerDemo() {
  const initialDemoProps = dateRangePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<DateRangePickerDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(dateRangePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = createSignal(false);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "daterangepicker") {
        const nextProps = normalizeDateRangePickerDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => dateRangePickerValueFromDemo(nextProps));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeDateRangePickerDemoProps(demoProps()));

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
            return serializeDateRangePickerValue(value());
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
          "data-comparison-control-root": "daterangepicker",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumDateRangePicker, {
            class: "comparison-daterangepicker-root",
            get label() {
              return demoProps().label;
            },
            get size() {
              return demoProps().size;
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get locale() {
              return demoProps().locale || undefined;
            },
            get maxVisibleMonths() {
              return Number(demoProps().maxVisibleMonths);
            },
            get minValue() {
              return demoProps().constrainRange
                ? dateRangePickerMinValue(demoProps().granularity)
                : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange
                ? dateRangePickerMaxValue(demoProps().granularity)
                : undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isDateRangePickerDateUnavailable : undefined;
            },
            get allowsNonContiguousRanges() {
              return demoProps().allowsNonContiguousRanges;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get startName() {
              return demoProps().startName || undefined;
            },
            get endName() {
              return demoProps().endName || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onChange: (nextValue: ReturnType<typeof value>) => {
              setValue(() => nextValue ?? null);
            },
            onOpenChange: setIsOpen,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDateRangePickerDemo, {});
