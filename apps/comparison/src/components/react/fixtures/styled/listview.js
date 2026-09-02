import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionBar as SpectrumActionBar,
  ActionButton as SpectrumActionButton,
  ActionButtonGroup as SpectrumActionButtonGroup,
  ActionMenu as SpectrumActionMenu,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  IllustratedMessage as SpectrumIllustratedMessage,
  ListView as SpectrumListView,
  ListViewItem as SpectrumListViewItem,
  MenuItem as SpectrumMenuItem,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  listViewDemoItems,
  initialListViewSelectedKeys,
  listViewDemoPropsFromWindow,
  listViewKeysFromValue,
  normalizeListViewDemoProps,
  serializeListViewDemoProps,
  serializeListViewKeys,
  comparisonControlsEvent,
} from "@comparison/data/listview-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  collectionFixtureStyle,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactListViewDemo() {
  const [demoProps, setDemoProps] = useState(listViewDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => initialListViewSelectedKeys(demoProps));
  const [actionKey, setActionKey] = useState("");
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listview") {
        setDemoProps((current) => {
          const nextProps = normalizeListViewDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialListViewSelectedKeys(nextProps));
          setActionKey("");
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const items = listViewDemoItems(demoProps);
  const itemKeys = items.map((item) => item.id);
  const disabledKeys = listViewKeysFromValue(demoProps.disabledKeys, [], "multiple", itemKeys);
  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: listViewKeysFromValue(
            demoProps.defaultSelectedKeys,
            itemKeys.includes("project-brief") ? ["project-brief"] : [],
            demoProps.selectionMode,
            itemKeys,
          ),
        }
      : { selectedKeys };
  const itemActions = (item) => {
    if (demoProps.itemActionSlot === "buttonGroup") {
      return jsx(SpectrumActionButtonGroup, {
        "aria-label": `${item.name} actions`,
        children: jsx(SpectrumActionButton, {
          "aria-label": `Archive ${item.name}`,
          children: jsx(SpectrumText, { children: "Archive" }),
        }),
      });
    }

    if (demoProps.itemActionSlot === "actionMenu") {
      return jsx(SpectrumActionMenu, {
        "aria-label": `${item.name} menu`,
        children: jsx(SpectrumMenuItem, {
          id: `${item.id}-copy`,
          textValue: "Copy",
          children: jsx(SpectrumText, { children: "Copy" }),
        }),
      });
    }

    return null;
  };
  const actionBar = (keys) =>
    jsx(SpectrumActionBar, {
      selectedItemCount: keys === "all" ? items.length : keys.size,
      "data-comparison-listview-actionbar": "true",
      onClearSelection: () => setSelectedKeys(new Set()),
      children: jsx(SpectrumActionButton, {
        children: jsx(SpectrumText, { children: "Archive" }),
      }),
    });
  const renderKey = [
    demoProps.selectionMode,
    demoProps.selectionStyle,
    demoProps.overflowMode,
    demoProps.selectionSource,
    demoProps.itemCount,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.isQuiet,
    demoProps.showDescriptions,
    demoProps.showIcons,
    demoProps.showActionBar,
    demoProps.itemActionSlot,
    demoProps.hideLinkOutIcon,
    demoProps.trailingIcon,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      style: collectionFixtureStyle,
      "data-comparison-selected-keys": serializeListViewKeys(selectedKeys),
      "data-comparison-action-key": actionKey,
      children: jsx(
        SpectrumListView,
        {
          "aria-label": "Documents",
          "data-comparison-control-root": "listview",
          "data-comparison-control-props": serializeListViewDemoProps(demoProps),
          selectionMode: demoProps.selectionMode,
          selectionStyle: demoProps.selectionStyle,
          overflowMode: demoProps.overflowMode,
          isQuiet: demoProps.isQuiet,
          hideLinkOutIcon: demoProps.hideLinkOutIcon,
          disabledKeys,
          items,
          ...selectionProps,
          UNSAFE_style: collectionListStyle,
          renderEmptyState: () =>
            jsxs(SpectrumIllustratedMessage, {
              children: [
                jsx(SpectrumHeading, { children: "No documents" }),
                jsx(SpectrumContent, { children: "Create or upload a file to continue." }),
              ],
            }),
          renderActionBar: demoProps.showActionBar ? actionBar : undefined,
          onAction: (key) => setActionKey(String(key)),
          onSelectionChange: (keys) =>
            setSelectedKeys(keys === "all" ? new Set(items.map((item) => item.id)) : new Set(keys)),
          children: (item) =>
            jsxs(
              SpectrumListViewItem,
              {
                id: item.id,
                textValue: item.name,
                isDisabled: demoProps.disabledItem === item.id,
                href:
                  demoProps.trailingIcon === "linkOut" && item.id === "project-brief"
                    ? "https://example.com/project-brief"
                    : undefined,
                target:
                  demoProps.trailingIcon === "linkOut" && item.id === "project-brief"
                    ? "_blank"
                    : undefined,
                hasChildItems:
                  demoProps.trailingIcon === "child" && item.id === "project-brief"
                    ? true
                    : undefined,
                children: [
                  demoProps.showIcons ? jsx(ReactButtonIcon, { "aria-hidden": "true" }) : null,
                  jsx(SpectrumText, { slot: "label", children: item.name }),
                  demoProps.showDescriptions
                    ? jsx(SpectrumText, { slot: "description", children: item.description })
                    : null,
                  itemActions(item),
                ],
              },
              item.id,
            ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

const collectionListStyle = {
  width: "100%",
  height: 220,
};

export default () => jsx(ReactListViewDemo, {});
