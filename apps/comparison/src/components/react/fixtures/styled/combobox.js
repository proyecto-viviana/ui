import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  Button as SpectrumButton,
  ComboBox as SpectrumComboBox,
  ComboBoxItem as SpectrumComboBoxItem,
  Content as SpectrumContent,
  ContextualHelp as SpectrumContextualHelp,
  Dialog as SpectrumDialog,
  DialogTrigger as SpectrumDialogTrigger,
  Heading as SpectrumHeading,
} from "@react-spectrum/s2";
import {
  comboBoxDemoLocaleFromWindow,
  comboBoxDemoPropsFromWindow,
  comboBoxItemsForPreset,
  comboBoxLabelForKey,
  comparisonControlsEvent,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
} from "@comparison/data/combobox-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function sentinelButton(kind) {
  return jsx("button", {
    type: "button",
    "data-comparison-sentinel": kind,
    children: kind,
  });
}

function ReactComboBoxDemo() {
  const [demoProps, setDemoProps] = useState(comboBoxDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const [inputValue, setInputValue] = useState(() => demoProps.inputValue);
  const [events, setEvents] = useState([]);
  const [submitCount, setSubmitCount] = useState(0);
  const [formData, setFormData] = useState("null");
  const colorScheme = useComparisonResolvedTheme();
  const locale = comboBoxDemoLocaleFromWindow();
  const menuWidth = Number.parseInt(demoProps.menuWidth, 10);
  const numericMenuWidth = Number.isFinite(menuWidth) && menuWidth > 0 ? menuWidth : undefined;
  const listItems = comboBoxItemsForPreset(demoProps.itemsPreset);
  const itemsProp =
    demoProps.itemsSource === "defaultItems" ? { defaultItems: listItems } : { items: listItems };
  const disabledKeys =
    demoProps.itemsPreset === "many"
      ? ["item-25"]
      : demoProps.disableEnterprise
        ? ["enterprise"]
        : undefined;
  const resolvedSelectedKey = selectedKey === "none" ? null : selectedKey;
  const resolvedDefaultSelectedKey =
    demoProps.selectedKey === "none" ? null : demoProps.selectedKey;
  const selectionProps =
    demoProps.selectionSource === "selectedKey"
      ? { selectedKey: resolvedSelectedKey }
      : { defaultSelectedKey: resolvedDefaultSelectedKey };
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
  const pushEvent = (name, args) => {
    if (!demoProps.eventLog) {
      return;
    }
    setEvents((prev) => [...prev, { name, args }]);
  };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKey" ? demoProps.selectedKey : "controlled",
    demoProps.inputSource,
    demoProps.inputSource === "defaultInputValue" ? demoProps.inputValue : "controlled",
    demoProps.withContextualHelp,
    demoProps.itemsPreset,
    demoProps.itemsSource,
    demoProps.layout,
    demoProps.eventLog,
    demoProps.withForm,
    demoProps.sentinels,
  ].join("|");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        if (event.detail.stack && event.detail.stack !== "react") {
          return;
        }
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
        setEvents([]);
        setSubmitCount(0);
        setFormData("null");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  let field = jsx(
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
      ...(demoProps.loadingState !== "idle" ? { loadingState: demoProps.loadingState } : {}),
      ...(demoProps.autoFocus ? { autoFocus: true } : {}),
      ...(demoProps.shouldFocusWrap ? { shouldFocusWrap: true } : {}),
      ...(demoProps.shouldCloseOnBlur === false ? { shouldCloseOnBlur: false } : {}),
      ...(demoProps.prefix ? { prefix: demoProps.prefix } : {}),
      ...(demoProps.eventLog
        ? {
            onOpenChange: (...args) => pushEvent("onOpenChange", args),
            onFocus: () => pushEvent("onFocus", []),
            onBlur: () => pushEvent("onBlur", []),
            onFocusChange: (isFocused) => pushEvent("onFocusChange", [isFocused]),
            onLoadMore: () => pushEvent("onLoadMore", []),
            onAction: (key) => pushEvent("onAction", [key]),
          }
        : {}),
      onSelectionChange: (nextKey) => {
        pushEvent("onSelectionChange", [nextKey]);
        if (nextKey == null) {
          return;
        }
        const nextSelectedKey = String(nextKey);
        const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
        setSelectedKey(nextSelectedKey);
        setInputValue(nextInputValue);
        setDemoProps((current) => ({
          ...current,
          ...(current.selectionSource === "selectedKey" ? { selectedKey: nextSelectedKey } : {}),
          ...(current.inputSource === "inputValue" ? { inputValue: nextInputValue } : {}),
        }));
      },
      onInputChange: (nextValue) => {
        pushEvent("onInputChange", [nextValue]);
        setInputValue(nextValue);
        setDemoProps((current) =>
          current.inputSource === "inputValue" ? { ...current, inputValue: nextValue } : current,
        );
      },
      children: (item) =>
        jsx(
          SpectrumComboBoxItem,
          {
            id: item.id,
            isDisabled:
              (demoProps.itemsPreset === "many" && item.id === "item-25") ||
              (item.id === "enterprise" && demoProps.disableEnterprise),
            ...(item.href ? { href: item.href } : {}),
            ...(item.textValue ? { textValue: item.textValue } : {}),
            children: item.label,
          },
          item.id,
        ),
      ...itemsProp,
    },
    renderKey,
  );

  if (demoProps.withForm) {
    field = jsxs("form", {
      onSubmit: (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setSubmitCount((count) => count + 1);
        setFormData(JSON.stringify(Object.fromEntries(new FormData(form))));
      },
      "data-comparison-submit-count": String(submitCount),
      "data-comparison-form-data": formData,
      children: [
        field,
        jsx("button", { type: "submit", "data-comparison-submit": "", children: "Submit" }),
        jsx("button", { type: "reset", "data-comparison-reset": "", children: "Reset" }),
      ],
    });
  }

  if (demoProps.layout === "nearBottom") {
    field = jsx("div", {
      style: {
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      },
      children: field,
    });
  } else if (demoProps.layout === "inScroller") {
    field = jsxs("div", {
      children: [
        jsx("div", {
          "data-comparison-scroller": "ancestor",
          style: { height: 140, overflow: "auto" },
          children: jsx("div", { style: { minHeight: 400 }, children: field }),
        }),
        jsx("div", {
          "data-comparison-scroller": "sibling",
          style: { height: 80, overflow: "auto" },
          children: jsx("div", { style: { minHeight: 200 }, children: "sibling scroller" }),
        }),
      ],
    });
  } else if (demoProps.layout === "inDialog") {
    field = jsxs(SpectrumDialogTrigger, {
      children: [
        jsx(SpectrumButton, { variant: "primary", children: "Open dialog" }),
        jsxs(SpectrumDialog, {
          isDismissible: true,
          children: [
            jsx(SpectrumHeading, { slot: "title", children: "ComboBox dialog" }),
            jsx(SpectrumContent, { children: field }),
          ],
        }),
      ],
    });
  }

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        demoProps.form ? jsx("form", { id: demoProps.form, hidden: true }) : null,
        jsx("div", {
          "data-comparison-control-root": "combobox",
          "data-comparison-control-props": serializeComboBoxDemoProps(demoProps),
          "data-comparison-value": selectedKey,
          "data-comparison-input-value": inputValue,
          ...(demoProps.eventLog ? { "data-comparison-events": JSON.stringify(events) } : {}),
          children: demoProps.sentinels
            ? [sentinelButton("before"), field, sentinelButton("after")]
            : field,
        }),
      ],
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactComboBoxDemo, {});
