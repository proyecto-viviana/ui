import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Image as SpectrumImage,
  ImageCoordinator as SpectrumImageCoordinator,
} from "@react-spectrum/s2";
import {
  imageDemoPropsFromWindow,
  imageMissingSource,
  imageDemoSources,
  normalizeImageDemoProps,
  serializeImageDemoProps,
} from "@comparison/data/image-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function imageFrameStyle(objectFit) {
  return {
    width: 160,
    height: 96,
    maxWidth: "100%",
    borderRadius: 6,
    objectFit,
    objectPosition: "center",
  };
}

function imageSourceForDemo(demoProps) {
  if (demoProps.sourceMode === "conditional") {
    return [
      { colorScheme: "light", srcSet: imageDemoSources.light },
      { colorScheme: "dark", srcSet: imageDemoSources.dark, media: "(min-width: 1px)" },
    ];
  }

  if (demoProps.sourceMode === "error") {
    return imageMissingSource;
  }

  return imageDemoSources.basic;
}

function ReactImageError() {
  return jsx("div", {
    className: "comparison-image-error",
    children: "Error loading image",
  });
}

function ReactImageDemo() {
  const [demoProps, setDemoProps] = useState(imageDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "image") {
        setDemoProps(normalizeImageDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const imageProps = {
    alt: demoProps.alt,
    src: imageSourceForDemo(demoProps),
    UNSAFE_style: imageFrameStyle(demoProps.objectFit),
    renderError: demoProps.sourceMode === "error" ? () => jsx(ReactImageError, {}) : undefined,
  };

  const content =
    demoProps.sourceMode === "coordinator"
      ? jsx(SpectrumImageCoordinator, {
          children: jsxs("div", {
            className: "comparison-image-coordinator-grid",
            children: [
              jsx(SpectrumImage, {
                alt: `${demoProps.alt} one`,
                src: imageDemoSources.first,
                UNSAFE_style: imageFrameStyle(demoProps.objectFit),
              }),
              jsx(SpectrumImage, {
                alt: `${demoProps.alt} two`,
                src: imageDemoSources.second,
                UNSAFE_style: imageFrameStyle(demoProps.objectFit),
              }),
            ],
          }),
        })
      : jsx(SpectrumImage, imageProps);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-image-row",
      "data-comparison-control-root": "image",
      "data-comparison-control-props": serializeImageDemoProps(demoProps),
      children: content,
    }),
    colorScheme,
  );
}

export default () => jsx(ReactImageDemo, {});
