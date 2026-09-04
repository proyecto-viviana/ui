import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Accordion as SpectrumAccordion,
  AccordionItem as SpectrumAccordionItem,
  AccordionItemHeader as SpectrumAccordionItemHeader,
  AccordionItemPanel as SpectrumAccordionItemPanel,
  AccordionItemTitle as SpectrumAccordionItemTitle,
  ActionButton as SpectrumActionButton,
} from "@react-spectrum/s2";
import {
  accordionDemoLocaleFromWindow,
  accordionDemoPropsFromWindow,
  normalizeAccordionDemoProps,
  serializeAccordionKeys,
  serializeAccordionDemoProps,
} from "@comparison/data/accordion-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactAccordionDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const locale = accordionDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = useState(accordionDemoPropsFromWindow);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(["personal"]));
  const [expandedChangeCount, setExpandedChangeCount] = useState(0);
  const [lastExpandedChangeKeys, setLastExpandedChangeKeys] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "accordion") {
        setDemoProps(normalizeAccordionDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const controlledExpandedKeys = demoProps.allowsMultipleExpanded
    ? expandedKeys
    : new Set(Array.from(expandedKeys).slice(0, 1));
  const handleExpandedChange = (keys) => {
    const nextKeys = new Set(Array.from(keys).map(String));
    setExpandedKeys(nextKeys);
    setExpandedChangeCount((count) => count + 1);
    setLastExpandedChangeKeys(serializeAccordionKeys(nextKeys));
  };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-accordion-row",
      "data-comparison-control-root": "accordion",
      "data-comparison-control-props": serializeAccordionDemoProps(demoProps),
      "data-comparison-expanded-keys": serializeAccordionKeys(controlledExpandedKeys),
      "data-comparison-expanded-change-count": String(expandedChangeCount),
      "data-comparison-expanded-change-keys": lastExpandedChangeKeys,
      children: jsxs(SpectrumAccordion, {
        UNSAFE_style: { width: 220 },
        size: demoProps.size,
        density: demoProps.density,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        allowsMultipleExpanded: demoProps.allowsMultipleExpanded,
        expandedKeys: controlledExpandedKeys,
        onExpandedChange: handleExpandedChange,
        children: [
          jsxs(SpectrumAccordionItem, {
            id: "personal",
            children: [
              jsx(SpectrumAccordionItemTitle, {
                children: "Personal Information",
              }),
              jsx(SpectrumAccordionItemPanel, {
                children: jsxs("div", {
                  className: "comparison-accordion-panel-copy",
                  children: [
                    jsx("span", { children: "Name" }),
                    jsx("span", { children: "Phone number" }),
                    jsx("span", { children: "Email address" }),
                  ],
                }),
              }),
            ],
          }),
          jsxs(SpectrumAccordionItem, {
            id: "billing",
            children: [
              jsxs(SpectrumAccordionItemHeader, {
                children: [
                  jsx(SpectrumAccordionItemTitle, {
                    children: "Billing Address",
                  }),
                  jsx(SpectrumActionButton, {
                    "aria-label": "More billing actions",
                    children: jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                  }),
                ],
              }),
              jsx(SpectrumAccordionItemPanel, {
                children: jsxs("div", {
                  className: "comparison-accordion-panel-copy",
                  children: [
                    jsx("span", { children: "Street address" }),
                    jsx("span", { children: "City" }),
                    jsx("span", { children: "Postal code" }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactAccordionDemo, {});
