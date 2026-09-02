import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Skeleton as SpectrumSkeleton } from "@react-spectrum/s2";
import {
  illustrationsDemoPropsFromWindow,
  normalizeIllustrationsDemoProps,
  serializeIllustrationsDemoProps,
} from "@comparison/data/illustrations-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  ReactPlanIllustration,
  ReactDropZoneIllustration,
  ReactIllustratedMessageIllustration,
  renderReactSpectrumReference,
} from "../styled-shared.js";

function ReactIllustrationsDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(illustrationsDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustrations") {
        setDemoProps(normalizeIllustrationsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const labelledIllustrationProps = {
    "aria-label": demoProps.ariaLabel,
    size: demoProps.size,
    "data-comparison-illustration": "labelled",
  };
  if (demoProps.ariaHidden) {
    labelledIllustrationProps["aria-hidden"] = true;
  }
  if (demoProps.slot) {
    labelledIllustrationProps.slot = demoProps.slot;
  }

  const children = [jsx(ReactPlanIllustration, labelledIllustrationProps, "labelled")];
  if (demoProps.showDecorative) {
    children.push(
      jsx(
        ReactDropZoneIllustration,
        {
          "aria-hidden": true,
          size: demoProps.decorativeSize,
          "data-comparison-illustration": "decorative",
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
          children: jsx(ReactIllustratedMessageIllustration, {
            "aria-label": "Loading illustration",
            size: demoProps.skeletonSize,
            "data-comparison-illustration": "skeleton",
          }),
        },
        "skeleton",
      ),
    );
  }

  return renderReactSpectrumReference(
    jsxs("div", {
      style: illustrationGalleryStyle,
      "data-comparison-control-root": "illustrations",
      "data-comparison-control-props": serializeIllustrationsDemoProps(demoProps),
      children,
    }),
    colorScheme,
  );
}

const illustrationGalleryStyle = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  padding: 12,
};

export default () => jsx(ReactIllustrationsDemo, {});
