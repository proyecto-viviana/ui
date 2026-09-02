import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { parseColor as spectrumParseColor } from "@react-spectrum/s2/ColorArea";
import { ColorField as SpectrumColorField } from "@react-spectrum/s2/ColorField";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorFieldDemoDefaults,
  colorFieldDemoPropsFromWindow,
  initialColorFieldDemoValue,
  normalizeColorFieldDemoProps,
  serializeColorFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorfield-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  colorToCssString,
} from "../styled-shared.js";

function parseSpectrumColorFieldValue(value, fallback = colorFieldDemoDefaults.value) {
  try {
    return value ? spectrumParseColor(value) : null;
  } catch {
    return spectrumParseColor(fallback);
  }
}

function ReactColorFieldDemo() {
  const [demoProps, setDemoProps] = useState(colorFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorFieldValue(initialColorFieldDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorfield") {
        const nextProps = normalizeColorFieldDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorFieldValue(initialColorFieldDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorFieldValue(
            demoProps.defaultValue,
            colorFieldDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.channel,
    demoProps.colorSpace,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.label,
    demoProps.description,
    demoProps.errorMessage,
    demoProps.placeholder,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
    demoProps.isReadOnly,
    demoProps.isRequired,
    demoProps.isInvalid,
    demoProps.validationBehavior,
    demoProps.isWheelDisabled,
    demoProps.size,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.necessityIndicator,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorfield",
      "data-comparison-control-props": serializeColorFieldDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      children: jsx(
        SpectrumColorField,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          label: demoProps.label || undefined,
          description: demoProps.description || undefined,
          errorMessage: demoProps.errorMessage || undefined,
          placeholder: demoProps.placeholder || undefined,
          channel: demoProps.channel || undefined,
          colorSpace: demoProps.colorSpace || undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          validationBehavior: demoProps.validationBehavior || undefined,
          isWheelDisabled: demoProps.isWheelDisabled,
          size: demoProps.size,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          necessityIndicator: demoProps.necessityIndicator,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactColorFieldDemo, {});
