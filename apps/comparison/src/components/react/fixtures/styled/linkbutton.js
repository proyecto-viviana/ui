import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { LinkButton as SpectrumLinkButton } from "@react-spectrum/s2";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  linkButtonDemoPropsFromWindow,
  normalizeLinkButtonDemoProps,
  serializeLinkButtonDemoProps,
} from "@comparison/data/button-family-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactLinkButtonDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(linkButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "linkbutton") {
        setDemoProps(normalizeLinkButtonDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
      children: jsx(SpectrumLinkButton, {
        "data-comparison-control-root": "linkbutton",
        "data-comparison-control-props": serializeLinkButtonDemoProps(demoProps),
        href: demoProps.href,
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isDisabled: demoProps.isDisabled,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactLinkButtonDemo, {});
