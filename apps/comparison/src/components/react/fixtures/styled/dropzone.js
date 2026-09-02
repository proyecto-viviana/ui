import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Content as SpectrumContent,
  DropZone as SpectrumDropZone,
  Heading as SpectrumHeading,
  IllustratedMessage as SpectrumIllustratedMessage,
} from "@react-spectrum/s2";
import {
  dropZoneDemoPropsFromWindow,
  normalizeDropZoneDemoProps,
  serializeDropZoneDemoProps,
} from "@comparison/data/dropzone-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactDropZoneIllustration,
} from "../styled-shared.js";

function ReactDropZoneDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(dropZoneDemoPropsFromWindow);
  const [counts, setCounts] = useState({
    activate: 0,
    drop: 0,
    enter: 0,
    exit: 0,
    move: 0,
  });
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dropzone") {
        setDemoProps(normalizeDropZoneDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const bump = (key) => {
    setCounts((current) => ({ ...current, [key]: current[key] + 1 }));
  };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-dropzone-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumDropZone, {
        "data-comparison-control-root": "dropzone",
        "data-comparison-control-props": serializeDropZoneDemoProps(demoProps),
        "data-comparison-drop-activate-count": counts.activate,
        "data-comparison-drop-count": counts.drop,
        "data-comparison-drop-enter-count": counts.enter,
        "data-comparison-drop-exit-count": counts.exit,
        "data-comparison-drop-move-count": counts.move,
        id: "dropzone-route-root",
        "aria-label": demoProps.ariaLabel,
        "aria-describedby": "dropzone-route-description",
        "aria-details": "dropzone-route-details",
        size: demoProps.size,
        isFilled: demoProps.isFilled,
        replaceMessage: demoProps.replaceMessage || undefined,
        onDropActivate: () => bump("activate"),
        onDrop: () => bump("drop"),
        onDropEnter: () => bump("enter"),
        onDropExit: () => bump("exit"),
        onDropMove: () => bump("move"),
        children: jsxs(SpectrumIllustratedMessage, {
          children: [
            jsx(ReactDropZoneIllustration, { slot: "illustration" }),
            jsx(SpectrumHeading, { children: "Upload assets" }),
            jsx(SpectrumContent, { children: "Drop a PNG, SVG, or PDF." }),
            jsx("span", {
              id: "dropzone-route-description",
              hidden: true,
              children: "Drop target accepts project files.",
            }),
            jsx("span", {
              id: "dropzone-route-details",
              hidden: true,
              children: "The comparison route records drag and drop callback counts.",
            }),
          ],
        }),
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactDropZoneDemo, {});
