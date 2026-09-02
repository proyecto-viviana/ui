import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionBar as SpectrumActionBar,
  ActionButton as SpectrumActionButton,
  Card as SpectrumCard,
  CardView as SpectrumCardView,
  Content as SpectrumContent,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  cardViewDemoPropsFromWindow,
  cardViewItems,
  cardViewKeysFromValue,
  initialCardViewSelectedKeys,
  normalizeCardViewDemoProps,
  serializeCardViewDemoProps,
  serializeCardViewKeys,
  comparisonControlsEvent,
} from "@comparison/data/cardview-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactCardViewDemo() {
  const [demoProps, setDemoProps] = useState(cardViewDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => initialCardViewSelectedKeys(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "cardview") {
        setDemoProps((current) => {
          const nextProps = normalizeCardViewDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialCardViewSelectedKeys(nextProps));
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const disabledKeys = cardViewKeysFromValue(demoProps.disabledKeys, [], "multiple");
  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: cardViewKeysFromValue(
            demoProps.defaultSelectedKeys,
            ["apollo"],
            demoProps.selectionMode,
          ),
        }
      : { selectedKeys };
  const renderKey = [
    demoProps.ariaLabel,
    demoProps.layout,
    demoProps.size,
    demoProps.density,
    demoProps.variant,
    demoProps.selectionMode,
    demoProps.selectionStyle,
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.showDescriptions,
    demoProps.showActionBar,
  ].join("|");
  const actionBar = (keys) =>
    jsx(SpectrumActionBar, {
      selectedItemCount: keys === "all" ? cardViewItems.length : keys.size,
      "data-comparison-cardview-actionbar": "true",
      onClearSelection: () => setSelectedKeys(new Set()),
      children: jsx(SpectrumActionButton, {
        children: jsx(SpectrumText, { children: "Archive" }),
      }),
    });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": serializeCardViewKeys(selectedKeys),
      children: jsx(
        SpectrumCardView,
        {
          "aria-label": demoProps.ariaLabel,
          "data-comparison-control-root": "cardview",
          "data-comparison-control-props": serializeCardViewDemoProps(demoProps),
          items: cardViewItems,
          layout: demoProps.layout,
          size: demoProps.size,
          density: demoProps.density,
          variant: demoProps.variant,
          selectionMode: demoProps.selectionMode,
          selectionStyle: demoProps.selectionStyle,
          disabledKeys,
          UNSAFE_style: cardViewDemoStyle,
          ...selectionProps,
          onSelectionChange: (keys) =>
            setSelectedKeys(
              keys === "all" ? new Set(cardViewItems.map((item) => item.id)) : new Set(keys),
            ),
          renderActionBar: demoProps.showActionBar ? actionBar : undefined,
          children: (item) =>
            jsx(SpectrumCard, {
              id: item.id,
              textValue: `${item.title} ${item.status}`,
              isDisabled: demoProps.disabledItem === item.id,
              children: jsxs(SpectrumContent, {
                children: [
                  jsx(SpectrumText, { slot: "title", children: item.title }),
                  demoProps.showDescriptions
                    ? jsx(SpectrumText, { slot: "description", children: item.status })
                    : null,
                ],
              }),
            }),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

const cardViewDemoStyle = {
  width: 360,
  height: 180,
};

export default () => jsx(ReactCardViewDemo, {});
