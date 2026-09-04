import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ProgressCircle as SpectrumProgressCircle } from "@react-spectrum/s2";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeProgressCircleDemoProps,
  progressCircleDemoPropsFromWindow,
  serializeProgressCircleDemoProps,
} from "@comparison/data/progress-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
} from "../styled-shared.js";

function ReactProgressCircleDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(progressCircleDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progresscircle") {
        setDemoProps(normalizeProgressCircleDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-progresscircle-row"),
      style: progressCircleRowStyle,
      "data-comparison-control-root": "progresscircle",
      "data-comparison-control-props": serializeProgressCircleDemoProps(demoProps),
      children: jsx(SpectrumProgressCircle, {
        "aria-label": demoProps.ariaLabel,
        value: demoProps.value,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        size: demoProps.size,
        staticColor: demoProps.staticColor || undefined,
        isIndeterminate: demoProps.isIndeterminate,
        "data-comparison-progresscircle": "controlled",
      }),
    }),
    colorScheme,
  );
}

const progressCircleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  padding: 12,
};

export default () => jsx(ReactProgressCircleDemo, {});
