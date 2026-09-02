import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  TimeField as SpectrumTimeField,
} from "@react-spectrum/s2";
import {
  timeFieldMaxValue,
  timeFieldMinValue,
  timeFieldDemoPropsFromWindow,
  timeFieldValueFromDemo,
  isTimeFieldDemoValueInvalid,
  normalizeTimeFieldDemoProps,
  serializeTimeFieldDemoProps,
  serializeTimeFieldValue,
  comparisonControlsEvent,
} from "@comparison/data/timefield-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactTimeFieldDemo() {
  const initialDemoProps = timeFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => timeFieldValueFromDemo(initialDemoProps));
  const colorScheme = useComparisonResolvedTheme();
  const serializedProps = serializeTimeFieldDemoProps(demoProps);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "timefield") {
        const nextProps = normalizeTimeFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(timeFieldValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Time help" }),
          jsx(SpectrumContent, { children: "Choose a start time in your schedule." }),
        ],
      })
    : undefined;
  const isAriaBuiltinInvalid =
    demoProps.validationBehavior === "aria" && isTimeFieldDemoValueInvalid(demoProps, value);
  const isInvalid = demoProps.isInvalid || isAriaBuiltinInvalid;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "timefield",
      "data-comparison-control-props": serializedProps,
      "data-comparison-react-builtin-invalid": String(isAriaBuiltinInvalid),
      "data-comparison-value": serializeTimeFieldValue(value),
      "data-comparison-locale": demoProps.locale,
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumTimeField, {
        label: demoProps.label,
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        contextualHelp,
        value: value ?? undefined,
        granularity: demoProps.granularity,
        shouldForceLeadingZeros: demoProps.shouldForceLeadingZeros,
        hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
        hideTimeZone: demoProps.hideTimeZone,
        minValue: demoProps.constrainRange ? timeFieldMinValue() : undefined,
        maxValue: demoProps.constrainRange ? timeFieldMaxValue() : undefined,
        name: demoProps.name || undefined,
        form: demoProps.form || undefined,
        validationBehavior: demoProps.validationBehavior || undefined,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid,
        onChange: (nextValue) => setValue(nextValue),
        UNSAFE_className: "comparison-timefield-root",
      }),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

export default () => jsx(ReactTimeFieldDemo, {});
