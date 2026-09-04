import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Footer as SpectrumFooter,
  Heading as SpectrumHeading,
  Link as SpectrumLink,
} from "@react-spectrum/s2";
import {
  contextualHelpDemoPropsFromWindow,
  isContextualHelpOpenControlChecked,
  normalizeContextualHelpDemoProps,
  serializeContextualHelpDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/contextualhelp-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactContextualHelpDemo() {
  const [demoProps, setDemoProps] = useState(contextualHelpDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "contextualhelp") {
        setDemoProps(normalizeContextualHelpDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(contextualHelpDemoPropsFromWindow());
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      "data-comparison-control-root": "contextualhelp",
      "data-comparison-control-props": serializeContextualHelpDemoProps(demoProps),
      children: jsxs(SpectrumContextualHelp, {
        "aria-label": demoProps.triggerLabel,
        containerPadding: demoProps.containerPadding,
        crossOffset: demoProps.crossOffset,
        isOpen: demoProps.isOpen,
        offset: demoProps.offset,
        onOpenChange: (nextOpen) => {
          setDemoProps((current) =>
            current.isOpen && !nextOpen && isContextualHelpOpenControlChecked()
              ? current
              : normalizeContextualHelpDemoProps({
                  ...current,
                  isOpen: nextOpen,
                }),
          );
        },
        placement: demoProps.placement,
        shouldFlip: demoProps.shouldFlip,
        size: demoProps.size,
        variant: demoProps.variant,
        children: [
          jsx(SpectrumHeading, { children: demoProps.heading }),
          jsx(SpectrumContent, { children: demoProps.content }),
          jsx(SpectrumFooter, {
            children: jsx(SpectrumLink, {
              isStandalone: true,
              href: "#",
              target: "_blank",
              children: "Learn more about segments",
            }),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactContextualHelpDemo, {});
