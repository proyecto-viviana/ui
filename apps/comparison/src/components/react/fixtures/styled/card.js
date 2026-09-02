import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Card as SpectrumCard,
  CardPreview as SpectrumCardPreview,
  Content as SpectrumContent,
  Footer as SpectrumFooter,
  Image as SpectrumImage,
  Skeleton as SpectrumSkeleton,
  StatusLight as SpectrumStatusLight,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  cardDemoPropsFromWindow,
  normalizeCardDemoProps,
  serializeCardDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/card-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

const cardPreviewImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%232c7be5'/%3E%3Cpath d='M0 132 82 74l68 42 62-58 108 96v26H0z' fill='%23d6e9ff' opacity='.9'/%3E%3Ccircle cx='248' cy='48' r='24' fill='%23fff3b0'/%3E%3C/svg%3E";

function ReactCardDemo() {
  const [demoProps, setDemoProps] = useState(cardDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "card") {
        setDemoProps((current) => normalizeCardDemoProps({ ...current, ...event.detail.props }));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const card = jsx(SpectrumCard, {
    size: demoProps.size,
    density: demoProps.density,
    variant: demoProps.variant,
    href: demoProps.href || undefined,
    target: demoProps.href ? "_blank" : undefined,
    rel: demoProps.href ? "noreferrer" : undefined,
    isDisabled: demoProps.isDisabled,
    textValue: demoProps.textValue,
    UNSAFE_style: { width: 240 },
    children: [
      demoProps.showPreview
        ? jsx(SpectrumCardPreview, {
            children: jsx(SpectrumImage, { src: cardPreviewImageSrc, alt: "" }),
          })
        : null,
      jsxs(SpectrumContent, {
        children: [
          jsx(SpectrumText, { slot: "title", children: demoProps.title }),
          jsx(SpectrumText, { slot: "description", children: demoProps.description }),
        ],
      }),
      demoProps.showFooter
        ? jsx(SpectrumFooter, {
            children: jsx(SpectrumStatusLight, { variant: "positive", children: "Synced" }),
          })
        : null,
    ],
  });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "card",
      "data-comparison-control-props": serializeCardDemoProps(demoProps),
      children: jsx(SpectrumSkeleton, {
        isLoading: demoProps.skeleton,
        children: card,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactCardDemo, {});
