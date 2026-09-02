import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  Radio as SpectrumRadio,
  RadioGroup as SpectrumRadioGroup,
} from "@react-spectrum/s2";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/radiogroup-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

const radioGroupItems = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function ReactRadioGroupDemo() {
  const [demoProps, setDemoProps] = useState(radioGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.selectedValue);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "radiogroup") {
        const nextProps = normalizeRadioGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.selectedValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-value": value,
      "data-comparison-control-root": "radiogroup",
      "data-comparison-control-props": serializeRadioGroupDemoProps({
        ...demoProps,
        selectedValue: value,
      }),
      children: jsx(SpectrumRadioGroup, {
        label: demoProps.label,
        value,
        size: demoProps.size,
        orientation: demoProps.orientation,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        name: demoProps.name || undefined,
        form: demoProps.form || undefined,
        validationBehavior: demoProps.validationBehavior || undefined,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        contextualHelp: demoProps.withContextualHelp
          ? jsxs(SpectrumContextualHelp, {
              children: [
                jsx(SpectrumHeading, { children: "Plan help" }),
                jsx(SpectrumContent, { children: "Choose the plan that matches this workspace." }),
              ],
            })
          : undefined,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, selectedValue: nextValue }));
        },
        children: radioGroupItems.map((item) =>
          jsx(SpectrumRadio, { value: item.value, children: item.label }, item.value),
        ),
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactRadioGroupDemo, {});
