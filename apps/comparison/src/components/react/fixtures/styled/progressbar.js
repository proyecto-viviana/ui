import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ProgressBar as SpectrumProgressBar } from "@react-spectrum/s2";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  progressBarFormatOptionsForPreset,
  normalizeProgressBarDemoProps,
  progressBarDemoPropsFromWindow,
  serializeProgressBarDemoProps,
} from "@comparison/data/progress-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
} from "../styled-shared.js";

function ReactProgressBarDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(progressBarDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progressbar") {
        setDemoProps(normalizeProgressBarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-progressbar-row"),
      style: progressFixtureStackStyle,
      "data-comparison-control-root": "progressbar",
      "data-comparison-control-props": serializeProgressBarDemoProps(demoProps),
      children: jsx(SpectrumProgressBar, {
        label: demoProps.label,
        value: demoProps.value,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        valueLabel: demoProps.valueLabel || undefined,
        formatOptions: progressBarFormatOptionsForPreset(demoProps.formatOptions),
        size: demoProps.size,
        staticColor: demoProps.staticColor || undefined,
        labelPosition: demoProps.labelPosition,
        isIndeterminate: demoProps.isIndeterminate,
        "data-comparison-progressbar": "controlled",
      }),
    }),
    colorScheme,
  );
}

const progressFixtureStackStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  width: 360,
  padding: 12,
};

export default () => jsx(ReactProgressBarDemo, {});
