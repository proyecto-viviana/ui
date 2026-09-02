import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ColorWheel as SpectrumColorWheel,
  parseColor as spectrumParseWheelColor,
} from "@react-spectrum/s2/ColorWheel";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorWheelDemoDefaults,
  colorWheelDemoPropsFromWindow,
  colorWheelDemoSizeNumber,
  comparisonControlsEvent as colorWheelControlsEvent,
  initialColorWheelDemoValue,
  normalizeColorWheelDemoProps,
  serializeColorWheelDemoProps,
} from "@comparison/data/colorwheel-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  colorToCssString,
} from "../styled-shared.js";

function parseSpectrumColorWheelValue(value, fallback = colorWheelDemoDefaults.value) {
  try {
    return spectrumParseWheelColor(value || fallback);
  } catch {
    return spectrumParseWheelColor(fallback);
  }
}

function ReactColorWheelDemo() {
  const [demoProps, setDemoProps] = useState(colorWheelDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorWheelValue(initialColorWheelDemoValue(demoProps)),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorWheelValue(initialColorWheelDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorwheel") {
        const nextProps = normalizeColorWheelDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorWheelValue(initialColorWheelDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorWheelControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorWheelControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorWheelValue(
            demoProps.defaultValue,
            colorWheelDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.size,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorwheel",
      "data-comparison-control-props": serializeColorWheelDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorWheel,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          size: colorWheelDemoSizeNumber(demoProps),
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
          onChangeEnd: setFinalValue,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactColorWheelDemo, {});
