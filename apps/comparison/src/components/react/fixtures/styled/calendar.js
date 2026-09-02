import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Calendar as SpectrumCalendar } from "@react-spectrum/s2";
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
} from "@comparison/data/calendar-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactCalendarDemo() {
  const [demoProps, setDemoProps] = useState(calendarDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    calendarDateFromString(calendarDemoPropsFromWindow().value),
  );
  const [focusedValue, setFocusedValue] = useState(() =>
    calendarDateFromString(
      calendarDemoPropsFromWindow().focusedValue || calendarDemoPropsFromWindow().value,
    ),
  );
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "calendar") {
        setDemoProps((currentProps) => {
          const nextProps = normalizeCalendarDemoProps({
            ...currentProps,
            ...(event.detail.props ?? {}),
          });
          setValue(calendarDateFromString(nextProps.value));
          setFocusedValue(calendarDateFromString(nextProps.focusedValue || nextProps.value));
          return nextProps;
        });
      }
    };
    window.addEventListener(calendarControlsEvent, handleControlsChange);
    return () => window.removeEventListener(calendarControlsEvent, handleControlsChange);
  }, []);

  const selectedValue = value;
  const visibleMonths = calendarVisibleMonthsFromString(demoProps.visibleMonths);
  const resolvedVisibleMonths = visibleMonths ?? 1;
  const calendarReferenceWidth = `${resolvedVisibleMonths * 224 + (resolvedVisibleMonths - 1) * 24}px`;
  const calendarProps = {
    "aria-label": "Event date",
    onChange: (nextValue) => setValue(nextValue),
    minValue: demoProps.constrainRange ? calendarMinValue : undefined,
    maxValue: demoProps.constrainRange ? calendarMaxValue : undefined,
    isDateUnavailable: demoProps.unavailableDates ? isCalendarDateUnavailable : undefined,
    isDisabled: demoProps.isDisabled,
    isReadOnly: demoProps.isReadOnly,
    isInvalid: demoProps.isInvalid,
    errorMessage: demoProps.errorMessage,
    firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
    visibleMonths,
    pageBehavior: demoProps.pageBehavior || undefined,
    selectionAlignment: demoProps.selectionAlignment || undefined,
    createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
    focusedValue: demoProps.focusedValue ? (focusedValue ?? undefined) : undefined,
    onFocusChange: (nextFocusedValue) => setFocusedValue(nextFocusedValue),
    UNSAFE_className: "comparison-calendar-root",
    UNSAFE_style: {
      "--cell-responsive-size": "32px",
      width: calendarReferenceWidth,
      maxWidth: "100%",
    },
  };

  if (selectedValue) {
    calendarProps.value = selectedValue;
  }

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "calendar",
      "data-comparison-control-props": serializeCalendarDemoProps(demoProps),
      "data-comparison-value": selectedValue ? String(selectedValue) : "",
      "data-comparison-focused-value": focusedValue ? String(focusedValue) : "",
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumCalendar, calendarProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

export default () => jsx(ReactCalendarDemo, {});
