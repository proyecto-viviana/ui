import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ActionButton as SpectrumActionButton } from "@react-spectrum/s2";
import {
  actionButtonDemoPropsFromWindow,
  comparisonControlsEvent as actionButtonControlsEvent,
  serializeActionButtonDemoProps,
} from "@comparison/data/actionbutton-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactActionButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useActionButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "actionbutton",
      "data-comparison-control-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-pending": demoProps.isPending ? "true" : void 0,
      children: jsx(SpectrumActionButton, {
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isPending: demoProps.isPending,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        onPress: () => setActionCount((count) => count + 1),
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function useActionButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(actionButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbutton") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(actionButtonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(actionButtonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

export default () => jsx(ReactActionButtonDemo, {});
