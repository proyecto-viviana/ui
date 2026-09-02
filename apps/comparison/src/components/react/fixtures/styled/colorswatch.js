import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ColorSwatch as SpectrumColorSwatch } from "@react-spectrum/s2/ColorSwatch";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorSwatchDemoPropsFromWindow,
  comparisonControlsEvent as colorSwatchControlsEvent,
  normalizeColorSwatchDemoProps,
  serializeColorSwatchDemoProps,
} from "@comparison/data/colorswatch-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactColorSwatchDemo() {
  const [demoProps, setDemoProps] = useState(colorSwatchDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatch") {
        setDemoProps(normalizeColorSwatchDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(colorSwatchControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSwatchControlsEvent, handleControlsChange);
  }, []);

  const renderKey = [
    demoProps.color,
    demoProps.colorName,
    demoProps.size,
    demoProps.rounding,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorswatch",
      "data-comparison-control-props": serializeColorSwatchDemoProps(demoProps),
      children: jsx(
        SpectrumColorSwatch,
        {
          color: demoProps.color || undefined,
          colorName: demoProps.colorName || undefined,
          size: demoProps.size,
          rounding: demoProps.rounding,
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactColorSwatchDemo, {});
