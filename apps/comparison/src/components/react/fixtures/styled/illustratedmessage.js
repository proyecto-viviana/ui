import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Button as SpectrumButton,
  ButtonGroup as SpectrumButtonGroup,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  IllustratedMessage as SpectrumIllustratedMessage,
} from "@react-spectrum/s2";
import {
  illustratedMessageDemoPropsFromWindow,
  normalizeIllustratedMessageDemoProps,
  serializeIllustratedMessageDemoProps,
} from "@comparison/data/illustratedmessage-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactIllustratedMessageIllustration,
} from "../styled-shared.js";

function ReactIllustratedMessageDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(illustratedMessageDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustratedmessage") {
        setDemoProps(normalizeIllustratedMessageDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-illustrated-message-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsxs(SpectrumIllustratedMessage, {
        "data-comparison-control-root": "illustratedmessage",
        "data-comparison-control-props": serializeIllustratedMessageDemoProps(demoProps),
        id: "illustratedmessage-route-root",
        role: "status",
        "aria-label": "Asset empty state",
        "aria-describedby": "illustratedmessage-route-description",
        "aria-details": "illustratedmessage-route-details",
        size: demoProps.size,
        orientation: demoProps.orientation,
        children: [
          jsx(ReactIllustratedMessageIllustration, { slot: "illustration" }),
          jsx(SpectrumHeading, { children: "Create your first asset" }),
          jsx(SpectrumContent, { children: "Upload or import a file to begin." }),
          jsx("span", {
            id: "illustratedmessage-route-description",
            hidden: true,
            children: "Illustrated empty-state guidance.",
          }),
          jsx("span", {
            id: "illustratedmessage-route-details",
            hidden: true,
            children: "The comparison route covers illustration, heading, content, and actions.",
          }),
          demoProps.withActions
            ? jsxs(SpectrumButtonGroup, {
                children: [
                  jsx(SpectrumButton, { variant: "secondary", children: "Import" }),
                  jsx(SpectrumButton, { variant: "accent", children: "Upload" }),
                ],
              })
            : null,
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactIllustratedMessageDemo, {});
