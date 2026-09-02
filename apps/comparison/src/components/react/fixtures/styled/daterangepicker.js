import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { DateRangePicker as SpectrumDateRangePicker } from "@react-spectrum/s2";
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
  comparisonControlsEvent,
} from "@comparison/data/daterangepicker-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactDateRangePickerDemo() {
  const initialDemoProps = dateRangePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => dateRangePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "daterangepicker") {
        const nextProps = normalizeDateRangePickerDemoProps({
          ...demoProps,
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(dateRangePickerValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, [demoProps]);

  const dateRangePickerProps = {
    "data-comparison-control-root": "daterangepicker",
    "data-comparison-control-props": serializeDateRangePickerDemoProps(demoProps),
    "data-comparison-locale": demoProps.locale,
    "data-comparison-calendar-system": demoProps.calendarSystem,
    label: demoProps.label,
    size: demoProps.size,
    value: value ?? undefined,
    granularity: demoProps.granularity,
    hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
    hideTimeZone: demoProps.hideTimeZone,
    maxVisibleMonths: Number(demoProps.maxVisibleMonths),
    minValue: demoProps.constrainRange ? dateRangePickerMinValue(demoProps.granularity) : undefined,
    maxValue: demoProps.constrainRange ? dateRangePickerMaxValue(demoProps.granularity) : undefined,
    createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
    isDateUnavailable: demoProps.unavailableDates ? isDateRangePickerDateUnavailable : undefined,
    allowsNonContiguousRanges: demoProps.allowsNonContiguousRanges,
    firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
    pageBehavior: demoProps.pageBehavior || undefined,
    startName: demoProps.startName || undefined,
    endName: demoProps.endName || undefined,
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
    UNSAFE_className: "comparison-daterangepicker-root",
  };

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": serializeDateRangePickerValue(value),
      "data-comparison-open": String(isOpen),
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumDateRangePicker, dateRangePickerProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

export default () => jsx(ReactDateRangePickerDemo, {});
