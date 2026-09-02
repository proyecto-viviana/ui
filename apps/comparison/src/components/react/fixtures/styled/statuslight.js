import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { StatusLight as SpectrumStatusLight } from "@react-spectrum/s2";
import {
  normalizeStatusLightDemoProps,
  serializeStatusLightDemoProps,
  statusLightDemoPropsFromWindow,
} from "@comparison/data/statuslight-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactStatusLightDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(statusLightDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "statuslight") {
        setDemoProps(normalizeStatusLightDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-status-light-row",
      children: jsx(SpectrumStatusLight, {
        "data-comparison-control-root": "statuslight",
        "data-comparison-control-props": serializeStatusLightDemoProps(demoProps),
        id: "statuslight-route-root",
        "aria-label": "StatusLight route label",
        "aria-describedby": "statuslight-route-description",
        "aria-details": "statuslight-route-details",
        variant: demoProps.variant,
        size: demoProps.size,
        role: demoProps.role || undefined,
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactStatusLightDemo, {});
