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
  MenuItem as SpectrumMenuItem,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  Collection as SpectrumTreeViewCollection,
  Text as SpectrumTreeViewText,
  TreeView as SpectrumTreeView,
  TreeViewItem as SpectrumTreeViewItem,
  TreeViewItemContent as SpectrumTreeViewItemContent,
  TreeViewLoadMoreItem as SpectrumTreeViewLoadMoreItem,
} from "@react-spectrum/s2/TreeView";
import {
  initialTreeViewExpandedKeys,
  initialTreeViewSelectedKeys,
  normalizeTreeViewDemoProps,
  serializeTreeViewDemoProps,
  serializeTreeViewKeys,
  treeViewDemoItems,
  treeViewDemoPropsFromWindow,
  treeViewExpandedKeysFromValue,
  treeViewKeysFromValue,
  treeViewVisibleKeys,
  comparisonControlsEvent as treeViewControlsEvent,
} from "@comparison/data/treeview-demo";
import {
  useComparisonResolvedTheme,
  ReactButtonIcon,
  renderReactSpectrumReference,
  collectionFixtureStyle,
} from "../styled-shared.js";

function ReactTreeViewDemo() {
  const [demoProps, setDemoProps] = useState(treeViewDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => initialTreeViewSelectedKeys(demoProps));
  const [expandedKeys, setExpandedKeys] = useState(() => initialTreeViewExpandedKeys(demoProps));
  const [actionKey, setActionKey] = useState("");
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "treeview") {
        setDemoProps((current) => {
          const nextProps = normalizeTreeViewDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialTreeViewSelectedKeys(nextProps));
          setExpandedKeys(initialTreeViewExpandedKeys(nextProps));
          setActionKey("");
          setLoadMoreCount(0);
          return nextProps;
        });
      }
    };
    window.addEventListener(treeViewControlsEvent, handleControlsChange);
    return () => window.removeEventListener(treeViewControlsEvent, handleControlsChange);
  }, []);

  const items = treeViewDemoItems(demoProps);
  const itemKeys = treeViewVisibleKeys(demoProps);
  const disabledKeys = treeViewKeysFromValue(demoProps.disabledKeys, [], "multiple", itemKeys);
  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: treeViewKeysFromValue(
            demoProps.defaultSelectedKeys,
            itemKeys.includes("weekly-report") ? ["weekly-report"] : [],
            demoProps.selectionMode,
            itemKeys,
          ),
        }
      : { selectedKeys };
  const expandedProps =
    demoProps.expandedSource === "defaultExpandedKeys"
      ? {
          defaultExpandedKeys: treeViewExpandedKeysFromValue(
            demoProps.defaultExpandedKeys,
            ["documents", "project"].filter((key) => itemKeys.includes(key)),
            itemKeys,
          ),
        }
      : { expandedKeys };
  const itemActions = (item) => {
    if (demoProps.itemActionSlot === "buttonGroup") {
      return jsx(SpectrumActionButtonGroup, {
        "aria-label": `${item.title} actions`,
        children: jsx(SpectrumActionButton, {
          "aria-label": `Archive ${item.title}`,
          children: jsx(ReactButtonIcon, { "aria-hidden": "true" }),
        }),
      });
    }

    if (demoProps.itemActionSlot === "actionMenu") {
      return jsx(SpectrumActionMenu, {
        "aria-label": `${item.title} menu`,
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
      selectedItemCount: keys === "all" ? itemKeys.length : keys.size,
      "data-comparison-treeview-actionbar": "true",
      onClearSelection: () => setSelectedKeys(new Set()),
      children: jsx(SpectrumActionButton, {
        children: jsx(SpectrumText, { children: "Archive" }),
      }),
    });
  const renderTreeItem = (item) =>
    jsxs(
      SpectrumTreeViewItem,
      {
        id: item.id,
        textValue: item.title,
        isDisabled: demoProps.disabledItem === item.id,
        href:
          demoProps.linkItem === item.id ? `https://example.com/treeview/${item.id}` : undefined,
        target: demoProps.linkItem === item.id ? "_blank" : undefined,
        children: [
          jsxs(SpectrumTreeViewItemContent, {
            children: [
              demoProps.showIcons ? jsx(ReactButtonIcon, { "aria-hidden": "true" }) : null,
              jsx(SpectrumTreeViewText, { children: item.title }),
              itemActions(item),
            ],
          }),
          item.children?.length
            ? jsx(SpectrumTreeViewCollection, { items: item.children, children: renderTreeItem })
            : null,
          demoProps.showLoadMore && item.id === "photos"
            ? jsx(SpectrumTreeViewLoadMoreItem, {
                onLoadMore: () => setLoadMoreCount((count) => count + 1),
                loadingState: demoProps.loadingState,
              })
            : null,
        ],
      },
      item.id,
    );
  const renderKey = [
    demoProps.selectionMode,
    demoProps.selectionStyle,
    demoProps.overflowMode,
    demoProps.selectionSource,
    demoProps.expandedSource,
    demoProps.itemCount,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.expandedSource === "defaultExpandedKeys"
      ? demoProps.defaultExpandedKeys
      : demoProps.expandedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.showIcons,
    demoProps.showActionBar,
    demoProps.itemActionSlot,
    demoProps.linkItem,
    demoProps.showLoadMore,
    demoProps.loadingState,
  ].join("|");

  return renderReactSpectrumReference(
    jsxs("div", {
      style: collectionFixtureStyle,
      "data-comparison-selected-keys": serializeTreeViewKeys(selectedKeys),
      "data-comparison-expanded-keys": serializeTreeViewKeys(expandedKeys),
      "data-comparison-action-key": actionKey,
      "data-comparison-load-more-count": String(loadMoreCount),
      children: [
        jsx("button", { children: "Before" }),
        jsx(
          SpectrumTreeView,
          {
            "aria-label": "Files",
            "data-comparison-control-root": "treeview",
            "data-comparison-control-props": serializeTreeViewDemoProps(demoProps),
            selectionMode: demoProps.selectionMode,
            selectionStyle: demoProps.selectionStyle,
            overflowMode: demoProps.overflowMode,
            disabledKeys,
            items,
            ...selectionProps,
            ...expandedProps,
            UNSAFE_style: collectionTreeStyle,
            renderEmptyState: () =>
              jsxs(SpectrumIllustratedMessage, {
                children: [
                  jsx(SpectrumHeading, { children: "No files" }),
                  jsx(SpectrumContent, { children: "Create or upload a file to continue." }),
                ],
              }),
            renderActionBar: demoProps.showActionBar ? actionBar : undefined,
            onAction: (key) => setActionKey(String(key)),
            onSelectionChange: (keys) =>
              setSelectedKeys(keys === "all" ? new Set(itemKeys) : new Set(keys)),
            onExpandedChange: (keys) => setExpandedKeys(new Set(keys)),
            children: renderTreeItem,
          },
          renderKey,
        ),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
  );
}

const collectionTreeStyle = {
  width: "100%",
  maxHeight: 280,
};

export default () => jsx(ReactTreeViewDemo, {});
