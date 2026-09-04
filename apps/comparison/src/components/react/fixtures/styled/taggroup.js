import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  Tag as SpectrumTag,
  TagGroup as SpectrumTagGroup,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  disabledTagGroupKeys,
  initialTagGroupSelectedKeys,
  normalizeTagGroupDemoProps,
  serializeTagGroupDemoProps,
  serializeTagGroupKeys,
  tagGroupDemoLocaleFromWindow,
  tagGroupDemoPropsFromWindow,
  tagGroupInitialItems,
  tagGroupItems,
  tagGroupKeysFromValue,
  comparisonControlsEvent,
} from "@comparison/data/taggroup-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  collectionFixtureStyle,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactTagGroupDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const locale = tagGroupDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = useState(tagGroupDemoPropsFromWindow);
  const [tags, setTags] = useState(() => tagGroupInitialItems(demoProps));
  const [selectedKeys, setSelectedKeys] = useState(() => initialTagGroupSelectedKeys(demoProps));
  const [actionCount, setActionCount] = useState(0);

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "taggroup") {
        setDemoProps((current) => {
          const nextProps = normalizeTagGroupDemoProps({ ...current, ...event.detail.props });
          setTags(tagGroupInitialItems(nextProps));
          setSelectedKeys(initialTagGroupSelectedKeys(nextProps));
          setActionCount(0);
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
          defaultSelectedKeys: tagGroupKeysFromValue(
            demoProps.defaultSelectedKeys,
            ["landscape"],
            demoProps.selectionMode,
          ),
        }
      : { selectedKeys };
  const selectedValue = serializeTagGroupKeys(selectedKeys);
  const renderKey = [
    demoProps.size,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.selectionMode,
    demoProps.selectionBehavior,
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.itemCount,
    demoProps.contentMode,
    demoProps.isEmphasized,
    demoProps.isInvalid,
    demoProps.isDisabled,
    demoProps.showDescription,
    demoProps.showErrorMessage,
    demoProps.allowsRemoving,
    demoProps.withGroupAction,
  ].join("|");

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      // Boundary buttons flank the grid so the D5 focus walk can Tab into the
      // group from before it and Shift+Tab into it from after it — exercising the
      // trampoline's entry-direction logic in both directions.
      children: [
        jsx("button", { children: "Before" }),
        jsx("div", {
          style: collectionFixtureStyle,
          "data-comparison-control-root": "taggroup",
          "data-comparison-control-props": serializeTagGroupDemoProps(demoProps),
          "data-comparison-selected-keys": selectedValue,
          "data-comparison-tag-count": String(tags.length),
          "data-comparison-action-count": String(actionCount),
          children: jsx(SpectrumTagGroup, {
            key: renderKey,
            label: demoProps.label,
            size: demoProps.size,
            labelPosition: demoProps.labelPosition,
            labelAlign: demoProps.labelAlign,
            selectionMode: demoProps.selectionMode,
            selectionBehavior: demoProps.selectionBehavior,
            isEmphasized: demoProps.isEmphasized,
            isInvalid: demoProps.isInvalid,
            isDisabled: demoProps.isDisabled,
            description: demoProps.showDescription
              ? "Use tags to organize photo metadata."
              : undefined,
            errorMessage:
              demoProps.isInvalid && demoProps.showErrorMessage
                ? "Choose at least one usable tag."
                : undefined,
            renderEmptyState: () => "No categories",
            disabledKeys: disabledTagGroupKeys(demoProps),
            items: tags,
            ...selectionProps,
            onSelectionChange: (keys) =>
              setSelectedKeys(
                keys === "all" ? new Set(tagGroupItems.map((item) => item.id)) : new Set(keys),
              ),
            onRemove: demoProps.allowsRemoving
              ? (keys) => {
                  setTags((currentTags) => currentTags.filter((item) => !keys.has(item.id)));
                  setSelectedKeys((currentKeys) => {
                    const nextKeys = new Set(currentKeys);
                    for (const key of keys) {
                      nextKeys.delete(key);
                    }
                    return nextKeys;
                  });
                }
              : undefined,
            onAction: () => setActionCount((count) => count + 1),
            groupActionLabel: demoProps.withGroupAction ? "Add tag" : undefined,
            onGroupAction: demoProps.withGroupAction
              ? () => setActionCount((count) => count + 1)
              : undefined,
            UNSAFE_style: collectionTagGroupStyle,
            children: (item) =>
              jsx(SpectrumTag, {
                children:
                  demoProps.contentMode === "icon"
                    ? jsxs(Fragment, {
                        children: [
                          jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                          jsx(SpectrumText, { children: item.name }),
                        ],
                      })
                    : item.name,
              }),
          }),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
    locale,
  );
}

const collectionTagGroupStyle = {
  maxWidth: 320,
};

export default () => jsx(ReactTagGroupDemo, {});
