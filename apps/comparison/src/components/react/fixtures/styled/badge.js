import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import { Badge as SpectrumBadge, Text as SpectrumText } from "@react-spectrum/s2";
import {
  badgeDemoPropsFromWindow,
  normalizeBadgeDemoProps,
  serializeBadgeDemoProps,
} from "@comparison/data/badge-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function renderBadgeChildren(demoProps) {
  if (demoProps.iconPlacement === "start") {
    return jsxs(Fragment, {
      children: [
        jsx(ReactButtonIcon, { "aria-hidden": "true" }),
        jsx(SpectrumText, { children: demoProps.children }),
      ],
    });
  }

  return demoProps.children;
}

function ReactBadgeDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(badgeDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "badge") {
        setDemoProps(normalizeBadgeDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-badge-row",
      children: jsx(SpectrumBadge, {
        "data-comparison-control-root": "badge",
        "data-comparison-control-props": serializeBadgeDemoProps(demoProps),
        id: "badge-route-root",
        "aria-label": "Badge route label",
        "aria-labelledby": "badge-route-labelledby",
        "aria-describedby": "badge-route-description",
        "aria-details": "badge-route-details",
        hidden: true,
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        size: demoProps.size,
        overflowMode: demoProps.overflowMode,
        children: renderBadgeChildren(demoProps),
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactBadgeDemo, {});
