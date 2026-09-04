import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  SegmentedControl as SpectrumSegmentedControl,
  SegmentedControlItem as SpectrumSegmentedControlItem,
} from "@react-spectrum/s2";
import {
  initialSegmentedControlSelectedKey,
  normalizeSegmentedControlDemoProps,
  segmentedControlDemoPropsFromWindow,
  segmentedControlItems,
  serializeSegmentedControlDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/segmentedcontrol-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactSegmentedControlDemo() {
  const [demoProps, setDemoProps] = useState(segmentedControlDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() =>
    initialSegmentedControlSelectedKey(demoProps),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setSelectedKey(initialSegmentedControlSelectedKey(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKey"
      ? { defaultSelectedKey: demoProps.defaultSelectedKey }
      : { selectedKey };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKey"
      ? demoProps.defaultSelectedKey
      : demoProps.selectedKey,
    demoProps.disabledKey,
    demoProps.iconPlacement,
    demoProps.isJustified,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-key": selectedKey,
      children: jsxs(
        SpectrumSegmentedControl,
        {
          "aria-label": "View mode",
          "data-comparison-control-root": "segmentedcontrol",
          "data-comparison-control-props": serializeSegmentedControlDemoProps(demoProps),
          isJustified: demoProps.isJustified,
          isDisabled: demoProps.isDisabled,
          ...selectionProps,
          onSelectionChange: (key) => setSelectedKey(String(key)),
          children: segmentedControlItems.map((item) =>
            jsx(
              SpectrumSegmentedControlItem,
              {
                id: item.id,
                isDisabled: demoProps.disabledKey === item.id,
                "aria-label": demoProps.iconPlacement === "only" ? item.label : void 0,
                children: renderSingleButtonFamilyChildren(item.label, demoProps.iconPlacement),
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

export default () => jsx(ReactSegmentedControlDemo, {});
