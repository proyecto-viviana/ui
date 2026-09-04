import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  DatePicker as SolidSpectrumDatePicker,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { calendarCreateCalendarForDemo } from "@comparison/data/calendar-demo";
import {
  datePickerMaxValue,
  datePickerMinValue,
  datePickerDemoPropsFromWindow,
  datePickerValueFromDemo,
  isDatePickerDateUnavailable,
  normalizeDatePickerDemoProps,
  serializeDatePickerDemoProps,
  serializeDatePickerValue,
  type DatePickerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/datepicker-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumDatePickerDemo() {
  const initialDemoProps = datePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<DatePickerDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(datePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = createSignal(false);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datepicker") {
        const nextProps = normalizeDatePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(datePickerValueFromDemo(nextProps));
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

  const serializedProps = createMemo(() => serializeDatePickerDemoProps(demoProps()));
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Date help"]),
          hc(SolidSpectrumContent, {}, ["Choose an available project due date."]),
        ])
      : undefined,
  );

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
            return serializeDatePickerValue(value());
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
          "data-comparison-control-root": "datepicker",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumDatePicker, {
            class: "comparison-datepicker-root",
            get label() {
              return demoProps().label;
            },
            get size() {
              return demoProps().size;
            },
            get contextualHelp() {
              return contextualHelp();
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get shouldForceLeadingZeros() {
              return demoProps().shouldForceLeadingZeros;
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
                ? datePickerMinValue(demoProps().granularity)
                : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange
                ? datePickerMaxValue(demoProps().granularity)
                : undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isDatePickerDateUnavailable : undefined;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get name() {
              return demoProps().name || undefined;
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
            onChange: setValue,
            onOpenChange: setIsOpen,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDatePickerDemo, {});
