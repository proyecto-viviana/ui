import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ColorArea as SpectrumColorArea,
  parseColor as spectrumParseColor,
} from "@react-spectrum/s2/ColorArea";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorAreaDemoDefaults,
  colorAreaDemoPropsFromWindow,
  comparisonControlsEvent as colorAreaControlsEvent,
  initialColorAreaDemoValue,
  normalizeColorAreaDemoProps,
  serializeColorAreaDemoProps,
} from "@comparison/data/colorarea-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  colorToCssString,
} from "../styled-shared.js";

function parseSpectrumColorForDemo(value, fallback = colorAreaDemoDefaults.value) {
  try {
    return spectrumParseColor(value || fallback);
  } catch {
    return spectrumParseColor(fallback);
  }
}

function ReactColorAreaDemo() {
  const [demoProps, setDemoProps] = useState(colorAreaDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorForDemo(initialColorAreaDemoValue(demoProps)),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorForDemo(initialColorAreaDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorarea") {
        const nextProps = normalizeColorAreaDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorForDemo(initialColorAreaDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorAreaControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorAreaControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorForDemo(
            demoProps.defaultValue,
            colorAreaDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.colorSpace,
    demoProps.xChannel,
    demoProps.yChannel,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.xName,
    demoProps.yName,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorarea",
      "data-comparison-control-props": serializeColorAreaDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorArea,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          colorSpace: demoProps.colorSpace || undefined,
          xChannel: demoProps.xChannel,
          yChannel: demoProps.yChannel,
          xName: demoProps.xName || undefined,
          yName: demoProps.yName || undefined,
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

export default () => jsx(ReactColorAreaDemo, {});
