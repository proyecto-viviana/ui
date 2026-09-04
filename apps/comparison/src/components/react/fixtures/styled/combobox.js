import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ComboBox as SpectrumComboBox,
  ComboBoxItem as SpectrumComboBoxItem,
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
} from "@react-spectrum/s2";
import {
  comboBoxDemoLocaleFromWindow,
  comboBoxDemoPropsFromWindow,
  comboBoxItems,
  comboBoxLabelForKey,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/combobox-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactComboBoxDemo() {
  const [demoProps, setDemoProps] = useState(comboBoxDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const [inputValue, setInputValue] = useState(() => demoProps.inputValue);
  const colorScheme = useComparisonResolvedTheme();
  const locale = comboBoxDemoLocaleFromWindow();
  const menuWidth = Number.parseInt(demoProps.menuWidth, 10);
  const numericMenuWidth = Number.isFinite(menuWidth) && menuWidth > 0 ? menuWidth : undefined;
  const disabledKeys = demoProps.disableEnterprise ? ["enterprise"] : undefined;
  const selectionProps =
    demoProps.selectionSource === "selectedKey"
      ? { selectedKey }
      : { defaultSelectedKey: demoProps.selectedKey };
  const inputProps =
    demoProps.inputSource === "inputValue"
      ? { inputValue }
      : { defaultInputValue: demoProps.inputValue };
  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Plan help" }),
          jsx(SpectrumContent, { children: "Pick the plan that matches expected usage." }),
        ],
      })
    : undefined;
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKey" ? demoProps.selectedKey : "controlled",
    demoProps.inputSource,
    demoProps.inputSource === "defaultInputValue" ? demoProps.inputValue : "controlled",
    demoProps.withContextualHelp,
  ].join("|");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
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
          "data-comparison-control-root": "combobox",
          "data-comparison-control-props": serializeComboBoxDemoProps(demoProps),
          "data-comparison-value": selectedKey,
          "data-comparison-input-value": inputValue,
          children: jsx(
            SpectrumComboBox,
            {
              label: demoProps.label,
              ...selectionProps,
              ...inputProps,
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
              formValue: demoProps.formValue,
              validationBehavior: demoProps.validationBehavior,
              menuTrigger: demoProps.menuTrigger,
              direction: demoProps.direction,
              align: demoProps.align,
              menuWidth: numericMenuWidth,
              shouldFlip: demoProps.shouldFlip,
              disabledKeys,
              allowsCustomValue: demoProps.allowsCustomValue,
              isDisabled: demoProps.isDisabled,
              isReadOnly: demoProps.isReadOnly,
              isRequired: demoProps.isRequired,
              isInvalid: demoProps.isInvalid,
              onSelectionChange: (nextKey) => {
                if (nextKey == null) {
                  return;
                }
                const nextSelectedKey = String(nextKey);
                const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
                setSelectedKey(nextSelectedKey);
                setInputValue(nextInputValue);
                setDemoProps((current) => ({
                  ...current,
                  ...(current.selectionSource === "selectedKey"
                    ? { selectedKey: nextSelectedKey }
                    : {}),
                  ...(current.inputSource === "inputValue" ? { inputValue: nextInputValue } : {}),
                }));
              },
              onInputChange: (nextValue) => {
                setInputValue(nextValue);
                setDemoProps((current) =>
                  current.inputSource === "inputValue"
                    ? { ...current, inputValue: nextValue }
                    : current,
                );
              },
              children: (item) =>
                jsx(
                  SpectrumComboBoxItem,
                  {
                    id: item.id,
                    isDisabled: item.id === "enterprise" && demoProps.disableEnterprise,
                    children: item.label,
                  },
                  item.id,
                ),
              items: comboBoxItems,
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

export default () => jsx(ReactComboBoxDemo, {});
