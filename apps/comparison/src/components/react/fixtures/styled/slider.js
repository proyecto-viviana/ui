import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  Slider as SpectrumSlider,
} from "@react-spectrum/s2";
import {
  initialSliderDemoValue,
  normalizeSliderDemoProps,
  serializeSliderDemoProps,
  sliderDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/slider-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactSliderDemo() {
  const [demoProps, setDemoProps] = useState(sliderDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialSliderDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialSliderDemoValue(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  const valueProps =
    demoProps.valueSource === "defaultValue" ? { defaultValue: demoProps.defaultValue } : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.minValue,
    demoProps.maxValue,
    demoProps.step,
    demoProps.fillOffset,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.name,
    demoProps.form,
    demoProps.withContextualHelp,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "slider",
      "data-comparison-control-props": serializeSliderDemoProps(demoProps),
      "data-comparison-value": String(value),
      children: jsx(
        SpectrumSlider,
        {
          label: demoProps.label,
          ...valueProps,
          minValue: demoProps.minValue,
          maxValue: demoProps.maxValue,
          step: demoProps.step,
          size: demoProps.size,
          trackStyle: demoProps.trackStyle,
          thumbStyle: demoProps.thumbStyle,
          fillOffset: demoProps.fillOffset,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          contextualHelp: demoProps.withContextualHelp
            ? jsxs(SpectrumContextualHelp, {
                children: [
                  jsx(SpectrumHeading, { children: "Volume help" }),
                  jsx(SpectrumContent, { children: "Choose an output level." }),
                ],
              })
            : undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          isEmphasized: demoProps.isEmphasized,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value" ? { ...current, value: nextValue } : current,
            );
          },
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactSliderDemo, {});
