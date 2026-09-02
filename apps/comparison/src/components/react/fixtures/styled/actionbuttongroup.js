import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionButton as SpectrumActionButton,
  ActionButtonGroup as SpectrumActionButtonGroup,
} from "@react-spectrum/s2";
import { comparisonActionItems as actionItems } from "@comparison/data/comparison-contract";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  actionButtonGroupDemoPropsFromWindow,
  normalizeActionButtonGroupDemoProps,
  serializeActionButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  renderReactSpectrumReference,
  staticColorBackdropProps,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function queryParamFromWindow(name) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function selectedKeysParamFromWindow(fallback) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

function ReactActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(actionButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => selectedKeysParamFromWindow(["bold"]));
  const [actionKey, setActionKey] = useState("");
  const selectedKeyText = Array.from(selectedKeys).join(",");
  const toggleKey = (key) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(groupProps.staticColor),
      "data-comparison-action-key": actionKey,
      "data-comparison-selected-keys": selectedKeyText,
      children: jsx(SpectrumActionButtonGroup, {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(groupProps),
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        children: actionItems.map((item) =>
          jsx(
            SpectrumActionButton,
            {
              "aria-label": groupProps.iconPlacement === "only" ? item.label : void 0,
              "aria-pressed": selectedKeys.has(item.id),
              onPress: () => toggleKey(item.id),
              children: renderSingleButtonFamilyChildren(item.label, groupProps.iconPlacement),
            },
            item.id,
          ),
        ),
      }),
    }),
  );
}

export default () => jsx(ReactActionButtonGroupDemo, {});
