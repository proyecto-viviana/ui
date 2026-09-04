import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Checkbox as SpectrumCheckbox } from "@react-spectrum/s2";
import {
  checkboxDemoPropsFromWindow,
  initialCheckboxDemoSelected,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/checkbox-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactCheckboxDemo() {
  const [demoProps, setDemoProps] = useState(checkboxDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => initialCheckboxDemoSelected(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setIsSelected(initialCheckboxDemoSelected(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  const selectionProps =
    demoProps.selectionSource === "defaultSelected"
      ? { defaultSelected: demoProps.defaultSelected }
      : { isSelected };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelected" ? demoProps.defaultSelected : "controlled",
    demoProps.name,
    demoProps.value,
    demoProps.form,
    demoProps.validationBehavior,
    demoProps.isRequired,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-checked": String(isSelected),
      children: jsx(
        SpectrumCheckbox,
        {
          "data-comparison-control-root": "checkbox",
          "data-comparison-control-props": serializeCheckboxDemoProps(demoProps),
          size: demoProps.size,
          ...selectionProps,
          isIndeterminate: demoProps.isIndeterminate,
          isEmphasized: demoProps.isEmphasized,
          name: demoProps.name || undefined,
          value: demoProps.value || undefined,
          form: demoProps.form || undefined,
          validationBehavior: demoProps.validationBehavior || undefined,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          onChange: (nextSelected) => {
            setIsSelected(nextSelected);
            setDemoProps((current) =>
              current.selectionSource === "isSelected"
                ? { ...current, isSelected: nextSelected }
                : current,
            );
          },
          children: demoProps.children,
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactCheckboxDemo, {});
