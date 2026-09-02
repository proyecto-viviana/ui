import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link as SpectrumLink } from "@react-spectrum/s2";
import {
  linkDemoPropsFromWindow,
  normalizeLinkDemoProps,
  serializeLinkDemoProps,
} from "@comparison/data/link-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
} from "../styled-shared.js";

function ReactLinkDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(linkDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "link") {
        setDemoProps(normalizeLinkDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("p", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-link-row"),
      children: jsx(SpectrumLink, {
        "data-comparison-control-root": "link",
        "data-comparison-control-props": serializeLinkDemoProps(demoProps),
        href: demoProps.href,
        variant: demoProps.variant,
        staticColor: demoProps.staticColor,
        isStandalone: demoProps.isStandalone,
        isQuiet: demoProps.isQuiet,
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactLinkDemo, {});
