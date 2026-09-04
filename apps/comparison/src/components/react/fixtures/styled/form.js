import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Button as SpectrumButton,
  Form as SpectrumForm,
  TextField as SpectrumTextField,
} from "@react-spectrum/s2";
import {
  formDemoPropsFromWindow,
  normalizeFormDemoProps,
  serializeFormDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/form-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactFormDemo() {
  const [demoProps, setDemoProps] = useState(formDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "form") {
        const nextProps = normalizeFormDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-form-row",
      children: jsxs(SpectrumForm, {
        "data-comparison-control-root": "form",
        "data-comparison-control-props": serializeFormDemoProps({
          ...demoProps,
          value,
        }),
        "data-comparison-value": value,
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        validationBehavior: demoProps.validationBehavior,
        isRequired: demoProps.isRequired,
        isDisabled: demoProps.isDisabled,
        isEmphasized: demoProps.isEmphasized,
        onSubmit: (event) => event.preventDefault(),
        children: [
          jsx(SpectrumTextField, {
            "data-comparison-form-field": "name",
            label: demoProps.label,
            name: "name",
            value,
            description: "Inherited from the parent form.",
            onChange: (nextValue) => {
              setValue(nextValue);
              setDemoProps((current) => ({ ...current, value: nextValue }));
            },
          }),
          jsx(SpectrumButton, {
            "data-comparison-form-submit": "true",
            type: "submit",
            children: demoProps.actionLabel,
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactFormDemo, {});
