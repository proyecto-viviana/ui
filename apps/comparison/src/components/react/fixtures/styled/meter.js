import { jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Meter as SpectrumMeter } from "@react-spectrum/s2";
import {
  meterDemoPropsFromWindow,
  normalizeMeterDemoProps,
  serializeMeterDemoProps,
} from "@comparison/data/meter-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
} from "../styled-shared.js";

function ReactMeterDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(meterDemoPropsFromWindow);
  const meterRef = useRef(null);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "meter") {
        setDemoProps(normalizeMeterDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  // React S2 currently emits "meter progressbar"; axe validates the concrete role.
  // Normalize only the comparison reference role, leaving visual output unchanged.
  useEffect(() => {
    const meterElement = meterRef.current?.UNSAFE_getDOMNode?.();
    if (meterElement?.getAttribute("role") === "meter progressbar") {
      meterElement.setAttribute("role", "meter");
    }
  }, [demoProps]);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-meter-row"),
      children: jsx(SpectrumMeter, {
        "data-comparison-control-root": "meter",
        "data-comparison-control-props": serializeMeterDemoProps(demoProps),
        label: demoProps.label,
        ref: meterRef,
        value: demoProps.value,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        valueLabel: demoProps.valueLabel || undefined,
        variant: demoProps.variant,
        size: demoProps.size,
        staticColor: demoProps.staticColor || undefined,
        labelPosition: demoProps.labelPosition,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactMeterDemo, {});
