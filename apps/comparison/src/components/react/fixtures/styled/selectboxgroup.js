import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  SelectBox as SpectrumSelectBox,
  SelectBoxGroup as SpectrumSelectBoxGroup,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  initialSelectBoxGroupSelectedKeys,
  normalizeSelectBoxGroupDemoProps,
  selectBoxGroupDemoPropsFromWindow,
  selectBoxGroupIllustrationItemIds,
  selectBoxGroupItems,
  selectBoxGroupKeysFromValue,
  serializeSelectBoxGroupDemoProps,
  serializeSelectBoxGroupKeys,
  comparisonControlsEvent,
} from "@comparison/data/selectboxgroup-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactPlanIllustration,
} from "../styled-shared.js";

function ReactSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = useState(selectBoxGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    initialSelectBoxGroupSelectedKeys(demoProps),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialSelectBoxGroupSelectedKeys(nextProps));
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: selectBoxGroupKeysFromValue(
            demoProps.defaultSelectedKeys,
            ["starter"],
            demoProps.selectionMode,
          ),
        }
      : { selectedKeys };
  const renderKey = [
    demoProps.orientation,
    demoProps.selectionMode,
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.isDisabled,
    demoProps.withIllustrations,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": serializeSelectBoxGroupKeys(selectedKeys),
      children: jsx(
        SpectrumSelectBoxGroup,
        {
          "aria-label": "Plans",
          "data-comparison-control-root": "selectboxgroup",
          "data-comparison-control-props": serializeSelectBoxGroupDemoProps(demoProps),
          orientation: demoProps.orientation,
          selectionMode: demoProps.selectionMode,
          isDisabled: demoProps.isDisabled,
          disabledKeys: selectBoxGroupKeysFromValue(demoProps.disabledKeys, [], "multiple"),
          ...selectionProps,
          onSelectionChange: (keys) =>
            setSelectedKeys(
              keys === "all" ? new Set(selectBoxGroupItems.map((item) => item.id)) : new Set(keys),
            ),
          children: selectBoxGroupItems.map((item) =>
            jsxs(
              SpectrumSelectBox,
              {
                id: item.id,
                textValue: item.label,
                isDisabled: demoProps.disabledItem === item.id,
                children: [
                  demoProps.withIllustrations && selectBoxGroupIllustrationItemIds.has(item.id)
                    ? jsx(ReactPlanIllustration, { slot: "illustration" })
                    : null,
                  jsx(SpectrumText, { slot: "label", children: item.label }),
                  jsx(SpectrumText, { slot: "description", children: item.description }),
                ],
              },
              item.id,
            ),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactSelectBoxGroupDemo, {});
