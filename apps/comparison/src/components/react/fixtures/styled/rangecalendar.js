import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { RangeCalendar as SpectrumRangeCalendar } from "@react-spectrum/s2";
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
} from "@comparison/data/rangecalendar-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactRangeCalendarDemo() {
  const initialDemoProps = rangeCalendarDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => rangeCalendarValueFromDemo(initialDemoProps));
  const [focusedValue, setFocusedValue] = useState(() =>
    rangeCalendarDateFromString(initialDemoProps.focusedValue || initialDemoProps.startValue),
  );
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangecalendar") {
        setDemoProps((currentProps) => {
          const nextProps = normalizeRangeCalendarDemoProps({
            ...currentProps,
            ...(event.detail.props ?? {}),
          });
          setValue(rangeCalendarValueFromDemo(nextProps));
          setFocusedValue(
            rangeCalendarDateFromString(nextProps.focusedValue || nextProps.startValue),
          );
          return nextProps;
        });
      }
    };
    window.addEventListener(rangeCalendarControlsEvent, handleControlsChange);
    return () => window.removeEventListener(rangeCalendarControlsEvent, handleControlsChange);
  }, []);

  const selectedValue = value;
  const visibleMonths = rangeCalendarVisibleMonthsFromString(demoProps.visibleMonths);
  const resolvedVisibleMonths = visibleMonths ?? 1;
  const calendarReferenceWidth = `${resolvedVisibleMonths * 224 + (resolvedVisibleMonths - 1) * 24}px`;
  const rangeCalendarProps = {
    "aria-label": "Trip dates",
    value: selectedValue ?? undefined,
    onChange: (nextValue) => setValue(nextValue),
    minValue: demoProps.constrainRange ? rangeCalendarMinValue : undefined,
    maxValue: demoProps.constrainRange ? rangeCalendarMaxValue : undefined,
    isDateUnavailable: demoProps.unavailableDates ? isRangeCalendarDateUnavailable : undefined,
    allowsNonContiguousRanges: demoProps.allowsNonContiguousRanges,
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
    UNSAFE_className: "comparison-rangecalendar-root",
    UNSAFE_style: {
      "--cell-responsive-size": "32px",
      width: calendarReferenceWidth,
      maxWidth: "100%",
    },
  };

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "rangecalendar",
      "data-comparison-control-props": serializeRangeCalendarDemoProps(demoProps),
      "data-comparison-value": serializeRangeCalendarValue(selectedValue),
      "data-comparison-focused-value": focusedValue ? String(focusedValue) : "",
      "data-comparison-color-scheme": colorScheme,
      "data-comparison-locale": demoProps.locale,
      "data-comparison-calendar-system": demoProps.calendarSystem,
      children: jsx(SpectrumRangeCalendar, rangeCalendarProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

export default () => jsx(ReactRangeCalendarDemo, {});
