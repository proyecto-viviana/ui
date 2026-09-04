import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button as SpectrumButton, Provider as SpectrumProvider } from "@react-spectrum/s2";
import {
  normalizeProviderDemoProps,
  providerDemoPropsFromWindow,
  serializeProviderDemoProps,
} from "@comparison/data/provider-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { providerShellStyle } from "../styled-shared.js";

function ReactProviderDemo() {
  const [demoProps, setDemoProps] = useState(providerDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "provider") {
        setDemoProps(normalizeProviderDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return jsx(SpectrumProvider, {
    "data-comparison-control-root": "provider",
    "data-comparison-control-props": serializeProviderDemoProps(demoProps),
    colorScheme: demoProps.colorScheme,
    background: demoProps.background,
    UNSAFE_style: providerShellStyle,
    children: jsxs("div", {
      className: "comparison-provider-stack",
      children: [
        jsx("div", {
          className: "comparison-provider-caption",
          "data-comparison-caption-scheme": demoProps.colorScheme,
          children: `Outer provider: ${demoProps.colorScheme} / ${demoProps.background}`,
        }),
        jsx(SpectrumButton, {
          variant: "primary",
          children: "Inherited Action",
        }),
        jsxs(SpectrumProvider, {
          colorScheme: "light",
          background: "base",
          UNSAFE_style: nestedProviderStyle,
          children: [
            jsx("div", {
              className: "comparison-provider-caption",
              "data-comparison-caption-scheme": "light",
              children: "Nested provider: local light override",
            }),
            jsx(SpectrumButton, {
              variant: "accent",
              children: "Nested Override",
            }),
          ],
        }),
      ],
    }),
  });
}

const nestedProviderStyle = {
  padding: 16,
  marginTop: 16,
  borderRadius: 16,
};

export default () => jsx(ReactProviderDemo, {});
