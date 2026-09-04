import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  DatePicker as SpectrumDatePicker,
  Heading as SpectrumHeading,
} from "@react-spectrum/s2";
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
  comparisonControlsEvent,
} from "@comparison/data/datepicker-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactDatePickerDemo() {
  const initialDemoProps = datePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => datePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datepicker") {
        const nextProps = normalizeDatePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(datePickerValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Date help" }),
          jsx(SpectrumContent, { children: "Choose an available project due date." }),
        ],
      })
    : undefined;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": serializeDatePickerValue(value),
      "data-comparison-open": String(isOpen),
      "data-comparison-color-scheme": colorScheme,
      "data-comparison-locale": demoProps.locale,
      "data-comparison-calendar-system": demoProps.calendarSystem,
      children: jsx(SpectrumDatePicker, {
        "data-comparison-control-root": "datepicker",
        "data-comparison-control-props": serializeDatePickerDemoProps(demoProps),
        label: demoProps.label,
        size: demoProps.size,
        contextualHelp,
        value: value ?? undefined,
        granularity: demoProps.granularity,
        shouldForceLeadingZeros: demoProps.shouldForceLeadingZeros,
        hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
        hideTimeZone: demoProps.hideTimeZone,
        maxVisibleMonths: Number(demoProps.maxVisibleMonths),
        minValue: demoProps.constrainRange ? datePickerMinValue(demoProps.granularity) : undefined,
        maxValue: demoProps.constrainRange ? datePickerMaxValue(demoProps.granularity) : undefined,
        createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
        isDateUnavailable: demoProps.unavailableDates ? isDatePickerDateUnavailable : undefined,
        firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
        pageBehavior: demoProps.pageBehavior || undefined,
        name: demoProps.name || undefined,
        form: demoProps.form || undefined,
        validationBehavior: demoProps.validationBehavior || undefined,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => setValue(nextValue),
        onOpenChange: setIsOpen,
        UNSAFE_className: "comparison-datepicker-root",
      }),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

export default () => jsx(ReactDatePickerDemo, {});
