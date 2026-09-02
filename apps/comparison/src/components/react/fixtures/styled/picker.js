import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  Picker as SpectrumPicker,
  PickerItem as SpectrumPickerItem,
} from "@react-spectrum/s2";
import {
  normalizePickerDemoProps,
  pickerDemoLocaleFromWindow,
  pickerDemoPropsFromWindow,
  pickerItems,
  pickerSelectedKeysForMode,
  serializePickerSelectedKeys,
  serializePickerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/picker-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactPickerDemo() {
  const [demoProps, setDemoProps] = useState(pickerDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    pickerSelectedKeysForMode(demoProps.selectedKey, demoProps.selectionMode),
  );
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const colorScheme = useComparisonResolvedTheme();
  const locale = pickerDemoLocaleFromWindow();
  const menuWidth = Number.parseInt(demoProps.menuWidth, 10);
  const numericMenuWidth = Number.isFinite(menuWidth) && menuWidth > 0 ? menuWidth : undefined;
  const disabledKeys = demoProps.disableEnterprise ? ["enterprise"] : undefined;
  const selectedKey = selectedKeys[0] ?? demoProps.selectedKey;
  const selectedItem = pickerItems.find((item) => item.id === selectedKey);
  const selectionValue = demoProps.selectionMode === "multiple" ? selectedKeys : selectedKey;
  const selectionProps =
    demoProps.selectionSource === "value"
      ? { value: selectionValue }
      : {
          defaultValue:
            demoProps.selectionMode === "multiple"
              ? pickerSelectedKeysForMode(demoProps.selectedKey, demoProps.selectionMode)
              : demoProps.selectedKey,
        };
  const renderValue = demoProps.withRenderValue
    ? (items) => {
        const labels = items?.map((item) => item?.label).filter(Boolean) ?? [];
        return jsx("span", {
          "data-comparison-render-value": "true",
          children:
            labels.length > 1
              ? `${labels.join(" + ")} plans`
              : `${labels[0] ?? selectedItem?.label ?? "Selected"} plan`,
        });
      }
    : undefined;
  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Plan help" }),
          jsx(SpectrumContent, { children: "Pick the plan that matches expected usage." }),
        ],
      })
    : undefined;
  const renderKey = [
    demoProps.selectionMode,
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultValue" ? demoProps.selectedKey : "controlled",
    demoProps.withContextualHelp,
    demoProps.withRenderValue,
    demoProps.loadingState,
  ].join("|");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(pickerSelectedKeysForMode(nextProps.selectedKey, nextProps.selectionMode));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        demoProps.form ? jsx("form", { id: demoProps.form, hidden: true }) : null,
        jsx("div", {
          "data-comparison-control-root": "picker",
          "data-comparison-control-props": serializePickerDemoProps(demoProps),
          "data-comparison-value": serializePickerSelectedKeys(
            selectedKeys,
            demoProps.selectionMode,
          ),
          "data-comparison-load-more-count": String(loadMoreCount),
          children: jsx(
            SpectrumPicker,
            {
              label: demoProps.label,
              ...selectionProps,
              selectionMode: demoProps.selectionMode,
              placeholder: demoProps.placeholder,
              size: demoProps.size,
              labelPosition: demoProps.labelPosition,
              labelAlign: demoProps.labelAlign,
              necessityIndicator: demoProps.necessityIndicator,
              contextualHelp,
              description: demoProps.description,
              errorMessage: demoProps.errorMessage,
              name: demoProps.name || undefined,
              form: demoProps.form || undefined,
              validationBehavior: demoProps.validationBehavior,
              direction: demoProps.direction,
              align: demoProps.align,
              menuWidth: numericMenuWidth,
              shouldFlip: demoProps.shouldFlip,
              loadingState: demoProps.loadingState === "idle" ? undefined : demoProps.loadingState,
              onLoadMore:
                demoProps.loadingState === "idle"
                  ? undefined
                  : () => setLoadMoreCount((count) => count + 1),
              renderValue,
              disabledKeys,
              isQuiet: demoProps.isQuiet,
              isDisabled: demoProps.isDisabled,
              isRequired: demoProps.isRequired,
              isInvalid: demoProps.isInvalid,
              onChange: (nextValue) => {
                const nextSelectedKeys = Array.isArray(nextValue)
                  ? nextValue.map(String)
                  : nextValue == null
                    ? []
                    : [String(nextValue)];
                if (nextSelectedKeys.length === 0) {
                  return;
                }
                const nextSelectedKey = nextSelectedKeys[0];
                setSelectedKeys(nextSelectedKeys);
                setDemoProps((current) => ({
                  ...current,
                  ...(current.selectionSource === "value" ? { selectedKey: nextSelectedKey } : {}),
                }));
              },
              children: pickerItems.map((item) =>
                jsx(
                  SpectrumPickerItem,
                  {
                    id: item.id,
                    isDisabled: item.id === "enterprise" && demoProps.disableEnterprise,
                    children: item.label,
                  },
                  item.id,
                ),
              ),
            },
            renderKey,
          ),
        }),
      ],
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactPickerDemo, {});
