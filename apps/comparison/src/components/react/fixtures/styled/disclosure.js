import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ActionButton as SpectrumActionButton } from "@react-spectrum/s2";
import {
  Disclosure as SpectrumDisclosure,
  DisclosureHeader as SpectrumDisclosureHeader,
  DisclosurePanel as SpectrumDisclosurePanel,
  DisclosureTitle as SpectrumDisclosureTitle,
} from "@react-spectrum/s2/Disclosure";
import {
  disclosureDemoLocaleFromWindow,
  disclosureDemoPropsFromWindow,
  normalizeDisclosureDemoProps,
  serializeDisclosureDemoProps,
} from "@comparison/data/disclosure-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  ReactButtonIcon,
  renderReactSpectrumReference,
} from "../styled-shared.js";

function ReactDisclosureDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const locale = disclosureDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = useState(disclosureDemoPropsFromWindow);
  const [expandedChangeCount, setExpandedChangeCount] = useState(0);
  const [lastExpandedChange, setLastExpandedChange] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "disclosure") {
        setDemoProps(normalizeDisclosureDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleExpandedChange = (expanded) => {
    setDemoProps((props) => normalizeDisclosureDemoProps({ ...props, isExpanded: expanded }));
    setExpandedChangeCount((count) => count + 1);
    setLastExpandedChange(String(expanded));
  };

  const title = jsx(SpectrumDisclosureTitle, {
    level: Number(demoProps.titleLevel),
    children: "System Requirements",
  });
  const header = demoProps.withHeaderAction
    ? jsxs(SpectrumDisclosureHeader, {
        children: [
          title,
          jsx(SpectrumActionButton, {
            "aria-label": "Edit system requirements",
            children: jsx(ReactButtonIcon, { "aria-hidden": "true" }),
          }),
        ],
      })
    : title;

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-disclosure-row",
      "data-comparison-control-root": "disclosure",
      "data-comparison-control-props": serializeDisclosureDemoProps(demoProps),
      "data-comparison-expanded": String(demoProps.isExpanded),
      "data-comparison-expanded-change-count": String(expandedChangeCount),
      "data-comparison-expanded-change-value": lastExpandedChange,
      children: jsxs(SpectrumDisclosure, {
        UNSAFE_style: { width: 250 },
        size: demoProps.size,
        density: demoProps.density,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isExpanded: demoProps.isExpanded,
        onExpandedChange: handleExpandedChange,
        children: [
          header,
          jsx(SpectrumDisclosurePanel, {
            role: demoProps.panelRole,
            children: jsxs("div", {
              className: "comparison-disclosure-panel-copy",
              children: [
                jsx("span", { children: "macOS 14 or later" }),
                jsx("span", { children: "16 GB memory" }),
                jsx("span", { children: "20 GB available storage" }),
              ],
            }),
          }),
        ],
      }),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactDisclosureDemo, {});
