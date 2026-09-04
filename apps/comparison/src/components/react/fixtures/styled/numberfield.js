import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { NumberField as SpectrumNumberField } from "@react-spectrum/s2";
import {
  normalizeNumberFieldDemoProps,
  numberFieldDemoPropsFromWindow,
  serializeNumberFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/numberfield-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactNumberFieldDemo() {
  const [demoProps, setDemoProps] = useState(numberFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "numberfield") {
        const nextProps = normalizeNumberFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "numberfield",
      "data-comparison-control-props": serializeNumberFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": String(value),
      children: jsx(SpectrumNumberField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        step: demoProps.step,
        hideStepper: demoProps.hideStepper,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactNumberFieldDemo, {});
