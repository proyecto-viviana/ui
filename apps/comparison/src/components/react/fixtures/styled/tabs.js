import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Tab as SpectrumTab,
  TabList as SpectrumTabList,
  TabPanel as SpectrumTabPanel,
  Tabs as SpectrumTabs,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import { comparisonTabItems as tabItems } from "@comparison/data/comparison-contract";
import { dispatchComparisonCallback } from "@comparison/data/event-log";
import {
  initialTabsDemoSelectedKey,
  normalizeTabsDemoProps,
  serializeTabsDemoProps,
  tabsDemoDisabledKeys,
  tabsDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/tabs-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function renderReactTabChildren(item, demoProps) {
  if (demoProps.withIcons || demoProps.labelBehavior === "hide") {
    return [
      jsx(ReactButtonIcon, { "aria-hidden": "true" }, "icon"),
      jsx(SpectrumText, { children: item.label }, "text"),
    ];
  }

  return item.label;
}

function renderReactTabList(demoProps) {
  if (demoProps.composition === "static") {
    return jsx(SpectrumTabList, {
      children: tabItems.map((item) =>
        jsx(
          SpectrumTab,
          {
            id: item.id,
            isDisabled: demoProps.disabledKey === item.id,
            children: renderReactTabChildren(item, demoProps),
          },
          item.id,
        ),
      ),
    });
  }

  return jsx(SpectrumTabList, {
    items: tabItems,
    children: (item) =>
      jsx(SpectrumTab, {
        id: item.id,
        isDisabled: demoProps.disabledKey === item.id,
        children: renderReactTabChildren(item, demoProps),
      }),
  });
}

function renderReactTabPanels(demoProps) {
  return tabItems.map((item) =>
    jsx(
      SpectrumTabPanel,
      {
        id: item.id,
        shouldForceMount: demoProps.shouldForceMount,
        children: item.content,
      },
      item.id,
    ),
  );
}

function ReactTabsDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(tabsDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => initialTabsDemoSelectedKey(demoProps));

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tabs") {
        const nextProps = normalizeTabsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(initialTabsDemoSelectedKey(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeTabsDemoProps({
    ...demoProps,
    selectedKey,
  });
  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKey"
      ? { defaultSelectedKey: demoProps.defaultSelectedKey }
      : { selectedKey };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.defaultSelectedKey,
    demoProps.composition,
    demoProps.disabledKey,
  ].join(":");

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-tabs-row",
      "data-comparison-control-root": "tabs",
      "data-comparison-control-props": serializedProps,
      "data-comparison-color-scheme": colorScheme,
      "data-comparison-selected-key": selectedKey,
      children: jsxs(SpectrumTabs, {
        key: renderKey,
        "aria-label": demoProps.ariaLabel,
        orientation: demoProps.orientation,
        density: demoProps.density,
        labelBehavior: demoProps.labelBehavior,
        keyboardActivation: demoProps.keyboardActivation,
        disabledKeys: tabsDemoDisabledKeys(demoProps),
        isDisabled: demoProps.isDisabled,
        onSelectionChange: (key) => {
          dispatchComparisonCallback("tabs", "onSelectionChange", {
            target: document.activeElement,
            value: key,
          });
          setSelectedKey(String(key));
        },
        ...selectionProps,
        children: [renderReactTabList(demoProps), renderReactTabPanels(demoProps)],
      }),
    }),
    colorScheme,
  );
}

function renderTabsDemo() {
  return jsx(ReactTabsDemo, {});
}

export default renderTabsDemo;
