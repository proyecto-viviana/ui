import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { LabeledValue as SpectrumLabeledValue } from "@react-spectrum/s2";
import {
  labeledValueDemoPropsFromWindow,
  normalizeLabeledValueDemoProps,
  resolveLabeledValueDemoValue,
  serializeLabeledValueDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/labeledvalue-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactLabeledValueDemo() {
  const [demoProps, setDemoProps] = useState(labeledValueDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "labeledvalue") {
        setDemoProps(normalizeLabeledValueDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "labeledvalue",
      "data-comparison-control-props": serializeLabeledValueDemoProps(demoProps),
      children: jsx(SpectrumLabeledValue, {
        label: demoProps.label,
        value: resolveLabeledValueDemoValue(demoProps),
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactLabeledValueDemo, {});
