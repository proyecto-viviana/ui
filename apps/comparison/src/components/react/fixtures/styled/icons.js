import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Button as SpectrumButton,
  Skeleton as SpectrumSkeleton,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  iconsDemoPropsFromWindow,
  normalizeIconsDemoProps,
  serializeIconsDemoProps,
} from "@comparison/data/icons-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  ReactButtonIcon,
  renderReactSpectrumReference,
} from "../styled-shared.js";

function ReactIconsDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(iconsDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "icons") {
        setDemoProps(normalizeIconsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const labelledIconProps = {
    "aria-label": demoProps.ariaLabel,
    "data-comparison-icon": "labelled",
  };
  if (demoProps.ariaHidden) {
    labelledIconProps["aria-hidden"] = true;
  }
  if (demoProps.slot) {
    labelledIconProps.slot = demoProps.slot;
  }

  const children = [jsx(ReactButtonIcon, labelledIconProps, "labelled")];
  if (demoProps.showDecorative) {
    children.push(
      jsx(
        ReactButtonIcon,
        {
          "aria-hidden": true,
          "data-comparison-icon": "decorative",
        },
        "decorative",
      ),
    );
  }
  if (demoProps.showSkeleton) {
    children.push(
      jsx(
        SpectrumSkeleton,
        {
          isLoading: true,
          children: jsx(ReactButtonIcon, {
            "aria-label": "Loading icon",
            "data-comparison-icon": "skeleton",
          }),
        },
        "skeleton",
      ),
    );
  }
  if (demoProps.showButtonContext) {
    children.push(
      jsxs(
        SpectrumButton,
        {
          variant: "accent",
          "data-comparison-icon": "button-context",
          children: [
            jsx(ReactButtonIcon, { "aria-hidden": true }, "icon"),
            jsx(SpectrumText, { children: demoProps.buttonLabel }, "text"),
          ],
        },
        "button-context",
      ),
    );
  }

  return renderReactSpectrumReference(
    jsxs("div", {
      style: iconGalleryStyle,
      "data-comparison-control-root": "icons",
      "data-comparison-control-props": serializeIconsDemoProps(demoProps),
      children,
    }),
    colorScheme,
  );
}

const iconGalleryStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: 12,
};

export default () => jsx(ReactIconsDemo, {});
