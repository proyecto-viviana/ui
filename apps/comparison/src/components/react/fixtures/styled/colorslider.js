import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ColorSlider as SpectrumColorSlider,
  parseColor as spectrumParseSliderColor,
} from "@react-spectrum/s2/ColorSlider";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorSliderEffectiveColorSpace,
  colorSliderDemoDefaults,
  colorSliderDemoPropsFromWindow,
  comparisonControlsEvent as colorSliderControlsEvent,
  initialColorSliderDemoValue,
  normalizeColorSliderDemoProps,
  serializeColorSliderDemoProps,
} from "@comparison/data/colorslider-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  colorToCssString,
} from "../styled-shared.js";

function parseSpectrumColorSliderValue(
  value,
  fallback = colorSliderDemoDefaults.value,
  colorSpace = "",
) {
  try {
    const color = spectrumParseSliderColor(value || fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  } catch {
    const color = spectrumParseSliderColor(fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  }
}

function ReactColorSliderDemo() {
  const [demoProps, setDemoProps] = useState(colorSliderDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorSliderValue(
      initialColorSliderDemoValue(demoProps),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps),
    ),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorSliderValue(
      initialColorSliderDemoValue(demoProps),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps),
    ),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorslider") {
        const nextProps = normalizeColorSliderDemoProps(event.detail.props ?? {});
        const nextColorSpace = colorSliderEffectiveColorSpace(nextProps);
        const nextValue = parseSpectrumColorSliderValue(
          initialColorSliderDemoValue(nextProps),
          colorSliderDemoDefaults.value,
          nextColorSpace,
        );
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorSliderControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSliderControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorSliderValue(
            demoProps.defaultValue,
            colorSliderDemoDefaults.defaultValue,
            colorSliderEffectiveColorSpace(demoProps),
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.channel,
    demoProps.colorSpace,
    demoProps.orientation,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.label,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorslider",
      "data-comparison-control-props": serializeColorSliderDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorSlider,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          label: demoProps.label || undefined,
          channel: demoProps.channel,
          colorSpace: demoProps.colorSpace || undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          orientation: demoProps.orientation,
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

export default () => jsx(ReactColorSliderDemo, {});
