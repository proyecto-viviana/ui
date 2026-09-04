import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Checkbox as SpectrumCheckbox,
  CheckboxGroup as SpectrumCheckboxGroup,
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
} from "@react-spectrum/s2";
import {
  checkboxGroupDemoPropsFromWindow,
  initialCheckboxGroupDemoValue,
  normalizeCheckboxGroupDemoProps,
  serializeCheckboxGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/checkboxgroup-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

const checkboxGroupItems = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

function ReactCheckboxGroupDemo() {
  const [demoProps, setDemoProps] = useState(checkboxGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialCheckboxGroupDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialCheckboxGroupDemoValue(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectedValues = value.join(",");
  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? { defaultValue: initialCheckboxGroupDemoValue(demoProps) }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.name,
    demoProps.form,
    demoProps.validationBehavior,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-values": selectedValues,
      "data-comparison-control-root": "checkboxgroup",
      "data-comparison-control-props": serializeCheckboxGroupDemoProps(demoProps),
      children: jsx(
        SpectrumCheckboxGroup,
        {
          label: demoProps.label,
          ...valueProps,
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
                  jsx(SpectrumHeading, { children: "Notification help" }),
                  jsx(SpectrumContent, { children: "Choose every channel that should alert you." }),
                ],
              })
            : undefined,
          isEmphasized: demoProps.isEmphasized,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          onChange: (nextValue) => {
            const nextSelectedValues = nextValue.map(String);
            setValue(nextSelectedValues);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, selectedValues: nextSelectedValues.join(",") }
                : current,
            );
          },
          children: checkboxGroupItems.map((item) =>
            jsx(SpectrumCheckbox, { value: item.value, children: item.label }, item.value),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactCheckboxGroupDemo, {});
