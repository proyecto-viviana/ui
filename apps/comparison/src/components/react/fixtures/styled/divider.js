import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Divider as SpectrumDivider } from "@react-spectrum/s2";
import {
  dividerDemoPropsFromWindow,
  normalizeDividerDemoProps,
  serializeDividerDemoProps,
} from "@comparison/data/divider-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
} from "../styled-shared.js";

function ReactDividerDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(dividerDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "divider") {
        setDemoProps(normalizeDividerDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-divider-row"),
      "data-comparison-orientation": demoProps.orientation,
      children: jsx(SpectrumDivider, {
        "data-comparison-control-root": "divider",
        "data-comparison-control-props": serializeDividerDemoProps(demoProps),
        orientation: demoProps.orientation,
        size: demoProps.size,
        staticColor: demoProps.staticColor,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactDividerDemo, {});
