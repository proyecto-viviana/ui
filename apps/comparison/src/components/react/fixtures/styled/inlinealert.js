import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  InlineAlert as SpectrumInlineAlert,
} from "@react-spectrum/s2";
import {
  inlineAlertDemoPropsFromWindow,
  normalizeInlineAlertDemoProps,
  serializeInlineAlertDemoProps,
} from "@comparison/data/inlinealert-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactInlineAlertDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(inlineAlertDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "inlinealert") {
        setDemoProps(normalizeInlineAlertDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const isNegative = demoProps.variant === "negative";

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-inline-alert-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsxs(SpectrumInlineAlert, {
        "data-comparison-control-root": "inlinealert",
        "data-comparison-control-props": serializeInlineAlertDemoProps(demoProps),
        id: "inlinealert-route-root",
        "aria-label": "Filtered alert label",
        "aria-describedby": "inlinealert-route-description",
        "aria-details": "inlinealert-route-details",
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        autoFocus: demoProps.autoFocus || undefined,
        children: [
          jsx(SpectrumHeading, {
            children: isNegative ? "Payment Error" : "Payment Information",
          }),
          jsx(SpectrumContent, {
            children: isNegative
              ? "There was an error processing your request. Please try again."
              : "Enter your billing address, shipping address, and payment method to complete your purchase.",
          }),
          jsx("span", {
            id: "inlinealert-route-description",
            hidden: true,
            children: "Inline alert route description.",
          }),
          jsx("span", {
            id: "inlinealert-route-details",
            hidden: true,
            children: "The comparison route covers variant, fill style, and autofocus.",
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactInlineAlertDemo, {});
