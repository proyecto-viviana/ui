import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
} from "@react-spectrum/s2";
import { DateField as SpectrumDateField } from "@react-spectrum/s2/DateField";
import {
  dateFieldMaxValue,
  dateFieldMinValue,
  dateFieldDemoPropsFromWindow,
  dateFieldValueFromDemo,
  isDateFieldDateUnavailable,
  isDateFieldDemoValueInvalid,
  normalizeDateFieldDemoProps,
  serializeDateFieldDemoProps,
  serializeDateFieldValue,
  comparisonControlsEvent,
} from "@comparison/data/datefield-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactDateFieldDemo() {
  const initialDemoProps = dateFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => dateFieldValueFromDemo(initialDemoProps));
  const colorScheme = useComparisonResolvedTheme();
  const serializedProps = serializeDateFieldDemoProps(demoProps);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datefield") {
        const nextProps = normalizeDateFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(dateFieldValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Date help" }),
          jsx(SpectrumContent, { children: "Choose an available appointment date." }),
        ],
      })
    : undefined;
  const isAriaBuiltinInvalid =
    demoProps.validationBehavior === "aria" && isDateFieldDemoValueInvalid(demoProps, value);
  const isInvalid = demoProps.isInvalid || isAriaBuiltinInvalid;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "datefield",
      "data-comparison-control-props": serializedProps,
      "data-comparison-react-builtin-invalid": String(isAriaBuiltinInvalid),
      "data-comparison-value": serializeDateFieldValue(value),
      "data-comparison-locale": demoProps.locale,
      "data-comparison-color-scheme": colorScheme,
      children: jsx(
        SpectrumDateField,
        {
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
          minValue: demoProps.constrainRange ? dateFieldMinValue(demoProps.granularity) : undefined,
          maxValue: demoProps.constrainRange ? dateFieldMaxValue(demoProps.granularity) : undefined,
          isDateUnavailable: demoProps.unavailableDates ? isDateFieldDateUnavailable : undefined,
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
          UNSAFE_className: "comparison-datefield-root",
        },
        serializedProps,
      ),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

export default () => jsx(ReactDateFieldDemo, {});
