import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ActionBar as SpectrumActionBar,
  ActionButton as SpectrumActionButton,
  ListView as SpectrumListView,
  ListViewItem as SpectrumListViewItem,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  actionBarCollectionItems,
  actionBarDemoPropsFromWindow,
  actionBarSelectedKeysFromCount,
  normalizeActionBarDemoProps,
  serializeActionBarDemoProps,
  serializeActionBarSelectedKeys,
  comparisonControlsEvent,
} from "@comparison/data/actionbar-demo";
import { ReactButtonIcon, renderReactSpectrumReference } from "../styled-shared.js";

const actionBarItems = [
  { id: "edit", label: "Edit" },
  { id: "copy", label: "Copy" },
  { id: "delete", label: "Delete" },
];

function ReactActionBarDemo() {
  const [demoProps, setDemoProps] = useState(actionBarDemoPropsFromWindow);
  const [collectionSelectedKeys, setCollectionSelectedKeys] = useState(() =>
    actionBarSelectedKeysFromCount(actionBarDemoPropsFromWindow().selectedItemCount),
  );
  const [isCleared, setIsCleared] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const scrollRef = useRef(null);
  const directSelectedItemCount = isCleared ? 0 : demoProps.selectedItemCount;
  const collectionSelectedCount = collectionSelectedKeys.size;
  const selectedItemCount = demoProps.useCollection
    ? collectionSelectedCount
    : directSelectedItemCount;

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbar") {
        const nextProps = normalizeActionBarDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setCollectionSelectedKeys(actionBarSelectedKeysFromCount(nextProps.selectedItemCount));
        setIsCleared(false);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const actionBarChildren = () =>
    actionBarItems.map((item) =>
      jsxs(
        SpectrumActionButton,
        {
          onPress: () => setActionCount((count) => count + 1),
          children: [
            jsx(ReactButtonIcon, { "aria-hidden": "true" }),
            jsx(SpectrumText, { children: item.label }),
          ],
        },
        item.id,
      ),
    );

  const actionBar = jsx(SpectrumActionBar, {
    selectedItemCount,
    isEmphasized: demoProps.isEmphasized,
    scrollRef: demoProps.useScrollRef ? scrollRef : undefined,
    "data-comparison-actionbar-root": "true",
    onClearSelection: () => {
      setClearCount((count) => count + 1);
      setIsCleared(true);
    },
    children: actionBarChildren(),
  });
  const collection = jsx(SpectrumListView, {
    "aria-label": "Documents",
    selectionMode: "multiple",
    selectedKeys: collectionSelectedKeys,
    onSelectionChange: (keys) =>
      setCollectionSelectedKeys(
        keys === "all" ? actionBarSelectedKeysFromCount("all") : new Set(keys),
      ),
    renderActionBar: () =>
      jsx(SpectrumActionBar, {
        isEmphasized: demoProps.isEmphasized,
        "data-comparison-actionbar-root": "true",
        children: actionBarChildren(),
      }),
    UNSAFE_className: "comparison-actionbar-collection-list",
    UNSAFE_style: { height: 220 },
    children: actionBarCollectionItems.map((item) =>
      jsx(
        SpectrumListViewItem,
        {
          id: item.id,
          textValue: item.label,
          children: jsxs(Fragment, {
            children: [
              jsx(SpectrumText, { children: item.label }),
              jsx(SpectrumText, { slot: "description", children: item.description }),
            ],
          }),
        },
        item.id,
      ),
    ),
  });

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-actionbar-row",
      "data-comparison-control-root": "actionbar",
      "data-comparison-control-props": serializeActionBarDemoProps(demoProps),
      "data-comparison-actionbar-props": serializeActionBarDemoProps(demoProps),
      "data-comparison-selected-count": String(selectedItemCount),
      "data-comparison-clear-count": String(clearCount),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-actionbar-scroll-ref": String(demoProps.useScrollRef),
      "data-comparison-actionbar-collection": String(demoProps.useCollection),
      "data-comparison-selected-keys": demoProps.useCollection
        ? serializeActionBarSelectedKeys(collectionSelectedKeys)
        : "",
      children: demoProps.useCollection
        ? collection
        : demoProps.useScrollRef
          ? jsxs("div", {
              ref: scrollRef,
              className: "comparison-actionbar-scroll-shell",
              "data-comparison-actionbar-scroll-shell": "true",
              children: [
                jsx("div", {
                  className: "comparison-actionbar-scroll-content",
                  children: actionBarItems.map((item) =>
                    jsx("span", { children: item.label }, `scroll-${item.id}`),
                  ),
                }),
                actionBar,
              ],
            })
          : actionBar,
    }),
  );
}

export default () => jsx(ReactActionBarDemo, {});
