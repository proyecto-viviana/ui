import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  RangeSlider as SpectrumRangeSlider,
} from "@react-spectrum/s2";
import {
  initialRangeSliderDemoValue,
  normalizeRangeSliderDemoProps,
  rangeSliderDemoPropsFromWindow,
  rangeSliderFormatOptionsForPreset,
  serializeRangeSliderDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/rangeslider-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactRangeSliderDemo() {
  const [demoProps, setDemoProps] = useState(rangeSliderDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialRangeSliderDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangeslider") {
        const nextProps = normalizeRangeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialRangeSliderDemoValue(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: {
            start: demoProps.defaultStartValue,
            end: demoProps.defaultEndValue,
          },
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.defaultStartValue,
    demoProps.defaultEndValue,
    demoProps.minValue,
    demoProps.maxValue,
    demoProps.step,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.startName,
    demoProps.endName,
    demoProps.form,
    demoProps.withContextualHelp,
    demoProps.formatOptions,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      style: rangeSliderStackStyle,
      "data-comparison-control-root": "rangeslider",
      "data-comparison-control-props": serializeRangeSliderDemoProps(demoProps),
      "data-comparison-value": `${value.start}:${value.end}`,
      children: jsx(
        SpectrumRangeSlider,
        {
          label: demoProps.label,
          ...valueProps,
          minValue: demoProps.minValue,
          maxValue: demoProps.maxValue,
          step: demoProps.step,
          size: demoProps.size,
          trackStyle: demoProps.trackStyle,
          thumbStyle: demoProps.thumbStyle,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          formatOptions: rangeSliderFormatOptionsForPreset(demoProps.formatOptions),
          contextualHelp: demoProps.withContextualHelp
            ? jsxs(SpectrumContextualHelp, {
                children: [
                  jsx(SpectrumHeading, { children: "Range help" }),
                  jsx(SpectrumContent, { children: "Choose minimum and maximum values." }),
                ],
              })
            : undefined,
          startName: demoProps.startName || undefined,
          endName: demoProps.endName || undefined,
          form: demoProps.form || undefined,
          isEmphasized: demoProps.isEmphasized,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? normalizeRangeSliderDemoProps({
                    ...current,
                    startValue: nextValue.start,
                    endValue: nextValue.end,
                  })
                : current,
            );
          },
          "data-comparison-rangeslider": "modeled",
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

const rangeSliderStackStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 28,
  width: 420,
  padding: 12,
};

export default () => jsx(ReactRangeSliderDemo, {});
