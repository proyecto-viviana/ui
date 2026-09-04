import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Image as SpectrumImage,
  Skeleton as SpectrumSkeleton,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import { imageDemoSources } from "@comparison/data/image-demo";
import {
  normalizeSkeletonDemoProps,
  serializeSkeletonDemoProps,
  skeletonDemoPropsFromWindow,
} from "@comparison/data/skeleton-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

const skeletonImageStyle = {
  width: "128px",
  height: "96px",
  maxWidth: "100%",
  borderRadius: "6px",
  flexShrink: 0,
  aspectRatio: "4 / 3",
  objectFit: "cover",
  objectPosition: "center",
};

const skeletonTitleStyle = {
  fontSize: "20px",
  lineHeight: "24px",
  fontWeight: 700,
  color: "rgb(34, 34, 34)",
};

const skeletonBodyStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "rgb(34, 34, 34)",
};

const skeletonMetaStyle = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "rgb(34, 34, 34)",
};

function ReactSkeletonContent() {
  return jsxs("div", {
    className: "comparison-skeleton-card",
    children: [
      jsx(SpectrumImage, {
        alt: "Preview",
        src: imageDemoSources.basic,
        width: 320,
        height: 192,
        UNSAFE_style: skeletonImageStyle,
      }),
      jsxs("div", {
        className: "comparison-skeleton-copy",
        children: [
          jsx(SpectrumText, {
            UNSAFE_style: skeletonTitleStyle,
            children: "Placeholder title",
          }),
          jsx(SpectrumText, {
            UNSAFE_style: skeletonBodyStyle,
            children: "This is placeholder content approximating the length of the final content.",
          }),
          jsxs("div", {
            className: "comparison-skeleton-inline",
            children: [
              jsx(ReactButtonIcon, {}),
              jsx(SpectrumText, {
                UNSAFE_style: skeletonMetaStyle,
                children: "Here is an icon.",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function ReactSkeletonDemo() {
  const [demoProps, setDemoProps] = useState(skeletonDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "skeleton") {
        setDemoProps(normalizeSkeletonDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-skeleton-row",
      "data-comparison-control-root": "skeleton",
      "data-comparison-control-props": serializeSkeletonDemoProps(demoProps),
      children: jsx(SpectrumSkeleton, {
        isLoading: demoProps.isLoading,
        children: jsx(ReactSkeletonContent, {}),
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactSkeletonDemo, {});
