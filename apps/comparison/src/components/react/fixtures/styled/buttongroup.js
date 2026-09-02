import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button as SpectrumButton, ButtonGroup as SpectrumButtonGroup } from "@react-spectrum/s2";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  buttonGroupDemoPropsFromWindow,
  normalizeButtonGroupDemoProps,
  serializeButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  renderReactSpectrumReference,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(buttonGroupDemoPropsFromWindow);
  const wrapStyle = groupProps.wrapWidth ? { width: groupProps.wrapWidth } : undefined;
  const [actionKey, setActionKey] = useState("");
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      children: jsxs(SpectrumButtonGroup, {
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeButtonGroupDemoProps(groupProps),
        orientation: groupProps.orientation,
        align: groupProps.align,
        size: groupProps.size,
        isDisabled: groupProps.isDisabled,
        UNSAFE_style: wrapStyle,
        children: [
          jsx(SpectrumButton, {
            variant: "primary",
            "aria-label": groupProps.iconPlacement === "only" ? "Save" : void 0,
            onPress: () => setActionKey("save"),
            children: renderSingleButtonFamilyChildren("Save", groupProps.iconPlacement),
          }),
          jsx(SpectrumButton, {
            variant: "secondary",
            "aria-label": groupProps.iconPlacement === "only" ? "Cancel" : void 0,
            onPress: () => setActionKey("cancel"),
            children: renderSingleButtonFamilyChildren("Cancel", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
  );
}

export default () => jsx(ReactButtonGroupDemo, {});
