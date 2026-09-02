import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ToggleButton as SpectrumToggleButton,
  ToggleButtonGroup as SpectrumToggleButtonGroup,
} from "@react-spectrum/s2";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeToggleButtonGroupDemoProps,
  selectedKeysSetFromText as selectedToggleKeysSetFromText,
  serializeToggleButtonGroupDemoProps,
  toggleButtonGroupDemoPropsFromWindow,
} from "@comparison/data/button-family-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(toggleButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    selectedToggleKeysSetFromText(groupProps.selectedKeys, ["left"], groupProps.selectionMode),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(groupProps.staticColor),
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsxs(SpectrumToggleButtonGroup, {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        "data-comparison-group-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        "data-comparison-control-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        selectionMode: groupProps.selectionMode,
        disallowEmptySelection: groupProps.disallowEmptySelection,
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isEmphasized: groupProps.isEmphasized,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        selectedKeys,
        onSelectionChange: (keys) =>
          setSelectedKeys(keys === "all" ? new Set() : new Set(Array.from(keys, String))),
        children: [
          jsx(SpectrumToggleButton, {
            id: "left",
            "aria-label": groupProps.iconPlacement === "only" ? "Left" : void 0,
            children: renderSingleButtonFamilyChildren("Left", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "center",
            "aria-label": groupProps.iconPlacement === "only" ? "Center" : void 0,
            children: renderSingleButtonFamilyChildren("Center", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "right",
            "aria-label": groupProps.iconPlacement === "only" ? "Right" : void 0,
            children: renderSingleButtonFamilyChildren("Right", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactToggleButtonGroupDemo, {});
