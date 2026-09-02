import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { TextField as SpectrumTextField } from "@react-spectrum/s2";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/textfield-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactTextFieldDemo() {
  const [demoProps, setDemoProps] = useState(textFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "textfield",
      "data-comparison-control-props": serializeTextFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": value,
      children: jsx(SpectrumTextField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
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

export default () => jsx(ReactTextFieldDemo, {});
