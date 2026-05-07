import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionButton as SpectrumActionButton,
  ActionButtonGroup as SpectrumActionButtonGroup,
  Button as SpectrumButton,
  ButtonGroup as SpectrumButtonGroup,
  Card as SpectrumCard,
  CardView as SpectrumCardView,
  Checkbox as SpectrumCheckbox,
  CheckboxGroup as SpectrumCheckboxGroup,
  ComboBox as SpectrumComboBox,
  ComboBoxItem as SpectrumComboBoxItem,
  Content as SpectrumContent,
  DatePicker as SpectrumDatePicker,
  Dialog as SpectrumDialog,
  DialogTrigger as SpectrumDialogTrigger,
  Heading as SpectrumHeading,
  LinkButton as SpectrumLinkButton,
  NumberField as SpectrumNumberField,
  Picker as SpectrumPicker,
  PickerItem as SpectrumPickerItem,
  Provider as SpectrumProvider,
  Radio as SpectrumRadio,
  RadioGroup as SpectrumRadioGroup,
  SearchField as SpectrumSearchField,
  Slider as SpectrumSlider,
  Switch as SpectrumSwitch,
  SegmentedControl as SpectrumSegmentedControl,
  SegmentedControlItem as SpectrumSegmentedControlItem,
  SelectBox as SpectrumSelectBox,
  SelectBoxGroup as SpectrumSelectBoxGroup,
  Tab as SpectrumTab,
  TabList as SpectrumTabList,
  TabPanel as SpectrumTabPanel,
  Tabs as SpectrumTabs,
  Text as SpectrumText,
  TextArea as SpectrumTextArea,
  TextField as SpectrumTextField,
  Tooltip as SpectrumTooltip,
  TooltipTrigger as SpectrumTooltipTrigger,
  ToggleButton as SpectrumToggleButton,
  ToggleButtonGroup as SpectrumToggleButtonGroup,
  createIcon,
  createIllustration,
} from "@react-spectrum/s2";
import "@react-spectrum/s2/page.css";
import {
  actionButtonDemoPropsFromWindow,
  comparisonControlsEvent as actionButtonControlsEvent,
  serializeActionButtonDemoProps,
} from "@comparison/data/actionbutton-demo";
import {
  comparisonActionItems as actionItems,
  comparisonTabItems as tabItems,
} from "@comparison/data/comparison-contract";
import {
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  checkboxDemoPropsFromWindow,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
} from "@comparison/data/checkbox-demo";
import {
  checkboxGroupDemoPropsFromWindow,
  normalizeCheckboxGroupDemoProps,
  selectedValuesArrayFromText,
  serializeCheckboxGroupDemoProps,
} from "@comparison/data/checkboxgroup-demo";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
} from "@comparison/data/radiogroup-demo";
import {
  normalizeNumberFieldDemoProps,
  numberFieldDemoPropsFromWindow,
  serializeNumberFieldDemoProps,
} from "@comparison/data/numberfield-demo";
import {
  normalizePickerDemoProps,
  pickerDemoPropsFromWindow,
  pickerItems,
  serializePickerDemoProps,
} from "@comparison/data/picker-demo";
import {
  comboBoxDemoPropsFromWindow,
  comboBoxItems,
  comboBoxLabelForKey,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
} from "@comparison/data/combobox-demo";
import {
  datePickerDemoPropsFromWindow,
  normalizeDatePickerDemoProps,
  serializeDatePickerDemoProps,
} from "@comparison/data/datepicker-demo";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
} from "@comparison/data/textfield-demo";
import {
  normalizeTextAreaDemoProps,
  serializeTextAreaDemoProps,
  textAreaDemoPropsFromWindow,
} from "@comparison/data/textarea-demo";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
} from "@comparison/data/searchfield-demo";
import {
  normalizeSliderDemoProps,
  serializeSliderDemoProps,
  sliderDemoPropsFromWindow,
} from "@comparison/data/slider-demo";
import {
  normalizeSwitchDemoProps,
  serializeSwitchDemoProps,
  switchDemoPropsFromWindow,
} from "@comparison/data/switch-demo";
import {
  actionButtonGroupDemoPropsFromWindow,
  buttonGroupDemoPropsFromWindow,
  linkButtonDemoPropsFromWindow,
  normalizeActionButtonGroupDemoProps,
  normalizeButtonGroupDemoProps,
  normalizeLinkButtonDemoProps,
  normalizeToggleButtonDemoProps,
  normalizeToggleButtonGroupDemoProps,
  selectedKeysSetFromText as selectedToggleKeysSetFromText,
  serializeActionButtonGroupDemoProps,
  serializeButtonGroupDemoProps,
  serializeLinkButtonDemoProps,
  serializeToggleButtonDemoProps,
  serializeToggleButtonGroupDemoProps,
  toggleButtonDemoPropsFromWindow,
  toggleButtonGroupDemoPropsFromWindow,
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
} from "@comparison/data/theme";

const ReactButtonIcon = createIcon((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    ...props,
    children: [
      jsx("path", {
        d: "m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

const ReactPlanIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("rect", {
        x: "6",
        y: "10",
        width: "36",
        height: "28",
        rx: "7",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.16",
      }),
      jsx("path", {
        d: "M15 31V19h18v12H15Zm3-3h12v-6H18v6Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "17",
        cy: "15",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "31",
        cy: "35",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

const selectBoxItems = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

const radioGroupItems = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const checkboxGroupItems = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

const selectBoxIllustrationItems = new Set(["starter", "pro"]);

const cardItems = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

function booleanParamFromWindow(name, fallback = false) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  if (value == null) {
    return fallback;
  }

  return value === "true" || value === "on" || value === "1";
}

function queryParamFromWindow(name) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function stringParamFromWindow(name, allowed, fallback) {
  const value = queryParamFromWindow(name);
  return allowed.includes(value) ? value : fallback;
}

function selectedKeysParamFromWindow(fallback) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

const segmentedControlKeys = ["list", "grid", "board"];

function segmentedControlDemoPropsFromWindow() {
  return {
    selectedKey: stringParamFromWindow("selectedKey", segmentedControlKeys, "list"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
}

function normalizeSegmentedControlDemoProps(props) {
  return {
    selectedKey: segmentedControlKeys.includes(props?.selectedKey) ? props.selectedKey : "list",
    isJustified: props?.isJustified === true,
    isDisabled: props?.isDisabled === true,
  };
}

function selectedKeysSetFromValue(value, fallback, selectionMode) {
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

function selectBoxGroupDemoPropsFromWindow() {
  const selectionMode = stringParamFromWindow("selectionMode", ["single", "multiple"], "single");
  return {
    orientation: stringParamFromWindow("orientation", ["horizontal", "vertical"], "horizontal"),
    selectionMode,
    selectedKeys: Array.from(
      selectedKeysParamFromWindow(selectionMode === "multiple" ? ["starter", "pro"] : ["starter"]),
    ).join(","),
    isDisabled: booleanParamFromWindow("isDisabled"),
    disablePro: booleanParamFromWindow("disablePro"),
    withIllustrations: booleanParamFromWindow("withIllustrations", true),
  };
}

function normalizeSelectBoxGroupDemoProps(props) {
  const selectionMode = props?.selectionMode === "multiple" ? "multiple" : "single";
  return {
    orientation: props?.orientation === "vertical" ? "vertical" : "horizontal",
    selectionMode,
    selectedKeys:
      typeof props?.selectedKeys === "string" && props.selectedKeys.trim()
        ? props.selectedKeys
        : selectionMode === "multiple"
          ? "starter,pro"
          : "starter",
    isDisabled: props?.isDisabled === true,
    disablePro: props?.disablePro === true,
    withIllustrations: props?.withIllustrations !== false,
  };
}

export const reactStyledFixtures = {
  provider: renderProviderDemo,
  button: () => jsx(ReactButtonDemo, {}),
  actionbutton: () => jsx(ReactActionButtonDemo, {}),
  actionbuttongroup: () => jsx(ReactActionButtonGroupDemo, {}),
  buttongroup: () => jsx(ReactButtonGroupDemo, {}),
  linkbutton: () => jsx(ReactLinkButtonDemo, {}),
  togglebutton: () => jsx(ReactToggleButtonDemo, {}),
  togglebuttongroup: () => jsx(ReactToggleButtonGroupDemo, {}),
  tabs: renderTabsDemo,
  textarea: () => jsx(ReactTextAreaDemo, {}),
  textfield: () => jsx(ReactTextFieldDemo, {}),
  checkbox: () => jsx(ReactCheckboxDemo, {}),
  checkboxgroup: () => jsx(ReactCheckboxGroupDemo, {}),
  combobox: () => jsx(ReactComboBoxDemo, {}),
  numberfield: () => jsx(ReactNumberFieldDemo, {}),
  picker: () => jsx(ReactPickerDemo, {}),
  radiogroup: () => jsx(ReactRadioGroupDemo, {}),
  dialog: () => jsx(ReactDialogDemo, {}),
  datepicker: () => jsx(ReactDatePickerDemo, {}),
  searchfield: () => jsx(ReactSearchFieldDemo, {}),
  switch: () => jsx(ReactSwitchDemo, {}),
  cardview: () => jsx(ReactCardViewDemo, {}),
  segmentedcontrol: () => jsx(ReactSegmentedControlDemo, {}),
  selectboxgroup: () => jsx(ReactSelectBoxGroupDemo, {}),
  slider: () => jsx(ReactSliderDemo, {}),
  tooltip: renderTooltipDemo,
  toast: renderToastGap,
};

function renderProviderDemo() {
  return jsx(SpectrumProvider, {
    colorScheme: "dark",
    background: "base",
    UNSAFE_style: providerShellStyle,
    children: jsxs("div", {
      className: "comparison-provider-stack",
      children: [
        jsx("div", {
          className: "comparison-provider-caption",
          children: "Outer provider: dark / medium scale",
        }),
        jsx(SpectrumButton, {
          variant: "primary",
          children: "Inherited Action",
        }),
        jsxs(SpectrumProvider, {
          colorScheme: "light",
          background: "base",
          UNSAFE_style: nestedProviderStyle,
          children: [
            jsx("div", {
              className: "comparison-provider-caption",
              children: "Nested provider: local light override",
            }),
            jsx(SpectrumButton, {
              variant: "accent",
              children: "Nested Override",
            }),
          ],
        }),
      ],
    }),
  });
}

function renderReactSpectrumReference(children, colorScheme = "dark") {
  return jsx(SpectrumProvider, {
    colorScheme,
    background: "base",
    UNSAFE_style: providerShellStyle,
    children,
  });
}

function ReactButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "button",
      "data-comparison-control-props": serializeButtonDemoProps(demoProps),
      "data-comparison-button-props": serializeButtonDemoProps(demoProps),
      children: jsx("div", {
        className: "comparison-button-row",
        children: jsx(SpectrumButton, {
          variant: demoProps.variant,
          fillStyle: demoProps.fillStyle,
          size: demoProps.size,
          staticColor: demoProps.staticColor,
          isDisabled: demoProps.isDisabled,
          isPending: demoProps.isPending,
          "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
          onPress: () => setActionCount((count) => count + 1),
          children: renderButtonChildren(demoProps),
        }),
      }),
    }),
    colorScheme,
  );
}

function renderButtonChildren(demoProps) {
  if (demoProps.iconPlacement === "start") {
    return [
      jsx(ReactButtonIcon, {}, "icon"),
      jsx(SpectrumText, { children: demoProps.children }, "text"),
    ];
  }

  if (demoProps.iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return demoProps.children;
}

function renderSingleButtonFamilyChildren(label, iconPlacement) {
  if (iconPlacement === "start") {
    return [jsx(ReactButtonIcon, {}, "icon"), jsx(SpectrumText, { children: label }, "text")];
  }

  if (iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return label;
}

function useComparisonResolvedTheme() {
  const [colorScheme, setColorScheme] = useState(getComparisonResolvedThemeFromDocument);
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    return () => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
  }, []);
  return colorScheme;
}

function useButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(buttonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

function ReactActionButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useActionButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "actionbutton",
      "data-comparison-control-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-pending": demoProps.isPending ? "true" : void 0,
      children: jsx(SpectrumActionButton, {
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isPending: demoProps.isPending,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        onPress: () => setActionCount((count) => count + 1),
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function useActionButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(actionButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbutton") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(actionButtonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(actionButtonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

function ReactActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(actionButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => selectedKeysParamFromWindow(["bold"]));
  const [actionKey, setActionKey] = useState("");
  const selectedKeyText = Array.from(selectedKeys).join(",");
  const toggleKey = (key) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      "data-comparison-selected-keys": selectedKeyText,
      children: jsx(SpectrumActionButtonGroup, {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(groupProps),
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        children: actionItems.map((item) =>
          jsx(
            SpectrumActionButton,
            {
              "aria-label": groupProps.iconPlacement === "only" ? item.label : void 0,
              "aria-pressed": selectedKeys.has(item.id),
              onPress: () => toggleKey(item.id),
              children: renderSingleButtonFamilyChildren(item.label, groupProps.iconPlacement),
            },
            item.id,
          ),
        ),
      }),
    }),
  );
}

function ReactButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(buttonGroupDemoPropsFromWindow);
  const wrapStyle = groupProps.wrapWidth ? { width: groupProps.wrapWidth } : undefined;
  const [actionKey, setActionKey] = useState("");
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      children: jsxs(SpectrumButtonGroup, {
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeButtonGroupDemoProps(groupProps),
        orientation: groupProps.orientation,
        align: groupProps.align,
        size: groupProps.size,
        isDisabled: groupProps.isDisabled,
        UNSAFE_style: wrapStyle,
        children: [
          jsx(SpectrumButton, {
            variant: "primary",
            "aria-label": groupProps.iconPlacement === "only" ? "Save" : void 0,
            onPress: () => setActionKey("save"),
            children: renderSingleButtonFamilyChildren("Save", groupProps.iconPlacement),
          }),
          jsx(SpectrumButton, {
            variant: "secondary",
            "aria-label": groupProps.iconPlacement === "only" ? "Cancel" : void 0,
            onPress: () => setActionKey("cancel"),
            children: renderSingleButtonFamilyChildren("Cancel", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
  );
}

function ReactLinkButtonDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(linkButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "linkbutton") {
        setDemoProps(normalizeLinkButtonDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      children: jsx(SpectrumLinkButton, {
        "data-comparison-control-root": "linkbutton",
        "data-comparison-control-props": serializeLinkButtonDemoProps(demoProps),
        href: demoProps.href,
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isDisabled: demoProps.isDisabled,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function ReactToggleButtonDemo() {
  const [demoProps, setDemoProps] = useState(toggleButtonDemoPropsFromWindow);
  const [selected, setSelected] = useState(demoProps.isSelected);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected": String(selected),
      children: jsx(SpectrumToggleButton, {
        "data-comparison-control-root": "togglebutton",
        "data-comparison-control-props": serializeToggleButtonDemoProps({
          ...demoProps,
          isSelected: selected,
        }),
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isSelected: selected,
        onChange: setSelected,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
  );
}

function ReactToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(toggleButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    selectedToggleKeysSetFromText(groupProps.selectedKeys, ["left"], groupProps.selectionMode),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsxs(SpectrumToggleButtonGroup, {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        "data-comparison-group-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        "data-comparison-control-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        selectionMode: groupProps.selectionMode,
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isEmphasized: groupProps.isEmphasized,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        selectedKeys,
        onSelectionChange: (keys) =>
          setSelectedKeys(keys === "all" ? new Set() : new Set(Array.from(keys, String))),
        children: [
          jsx(SpectrumToggleButton, {
            id: "left",
            "aria-label": groupProps.iconPlacement === "only" ? "Left" : void 0,
            children: renderSingleButtonFamilyChildren("Left", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "center",
            "aria-label": groupProps.iconPlacement === "only" ? "Center" : void 0,
            children: renderSingleButtonFamilyChildren("Center", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "right",
            "aria-label": groupProps.iconPlacement === "only" ? "Right" : void 0,
            children: renderSingleButtonFamilyChildren("Right", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactSegmentedControlDemo() {
  const [demoProps, setDemoProps] = useState(segmentedControlDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(demoProps.selectedKey);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-key": selectedKey,
      children: jsxs(SpectrumSegmentedControl, {
        "aria-label": "View mode",
        "data-comparison-control-root": "segmentedcontrol",
        "data-comparison-control-props": JSON.stringify(demoProps),
        isJustified: demoProps.isJustified,
        isDisabled: demoProps.isDisabled,
        selectedKey,
        onSelectionChange: (key) => setSelectedKey(String(key)),
        children: [
          jsx(SpectrumSegmentedControlItem, { id: "list", children: "List" }),
          jsx(SpectrumSegmentedControlItem, { id: "grid", children: "Grid" }),
          jsx(SpectrumSegmentedControlItem, { id: "board", children: "Board" }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = useState(selectBoxGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    selectedKeysSetFromValue(demoProps.selectedKeys, ["starter"], demoProps.selectionMode),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(
            selectedKeysSetFromValue(nextProps.selectedKeys, ["starter"], nextProps.selectionMode),
          );
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsx(SpectrumSelectBoxGroup, {
        "aria-label": "Plans",
        "data-comparison-control-root": "selectboxgroup",
        "data-comparison-control-props": JSON.stringify(demoProps),
        orientation: demoProps.orientation,
        selectionMode: demoProps.selectionMode,
        isDisabled: demoProps.isDisabled,
        selectedKeys,
        onSelectionChange: (keys) => setSelectedKeys(keys === "all" ? new Set() : new Set(keys)),
        children: selectBoxItems.map((item) =>
          jsxs(
            SpectrumSelectBox,
            {
              id: item.id,
              textValue: item.label,
              isDisabled: demoProps.disablePro && item.id === "pro",
              children: [
                demoProps.withIllustrations && selectBoxIllustrationItems.has(item.id)
                  ? jsx(ReactPlanIllustration, { slot: "illustration" })
                  : null,
                jsx(SpectrumText, { slot: "label", children: item.label }),
                jsx(SpectrumText, { slot: "description", children: item.description }),
              ],
            },
            item.id,
          ),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactCardViewDemo() {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(["apollo"]));
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsx(SpectrumCardView, {
        "aria-label": "Projects",
        items: cardItems,
        size: "S",
        density: "compact",
        variant: "secondary",
        selectionMode: "single",
        selectionStyle: "highlight",
        UNSAFE_style: cardViewDemoStyle,
        selectedKeys,
        onSelectionChange: (keys) => setSelectedKeys(keys === "all" ? new Set() : new Set(keys)),
        children: (item) =>
          jsxs(SpectrumCard, {
            id: item.id,
            textValue: item.title,
            children: [
              jsx(SpectrumText, { slot: "title", children: item.title }),
              jsx(SpectrumText, { slot: "description", children: item.status }),
            ],
          }),
      }),
    }),
    colorScheme,
  );
}

function renderTabsDemo() {
  return renderReactSpectrumReference(
    jsxs(SpectrumTabs, {
      "aria-label": "React Spectrum tabs",
      children: [
        jsx(SpectrumTabList, {
          items: tabItems,
          children: (item) => jsx(SpectrumTab, { id: item.id, children: item.label }),
        }),
        tabItems.map((item) =>
          jsx(SpectrumTabPanel, { id: item.id, children: item.content }, item.id),
        ),
      ],
    }),
  );
}

function ReactTextFieldDemo() {
  const [demoProps, setDemoProps] = useState(textFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "textfield",
      "data-comparison-control-props": serializeTextFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": value,
      children: jsx(SpectrumTextField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactTextAreaDemo() {
  const [demoProps, setDemoProps] = useState(textAreaDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textarea") {
        const nextProps = normalizeTextAreaDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "textarea",
      "data-comparison-control-props": serializeTextAreaDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": value,
      children: jsx(SpectrumTextArea, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactNumberFieldDemo() {
  const [demoProps, setDemoProps] = useState(numberFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "numberfield") {
        const nextProps = normalizeNumberFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "numberfield",
      "data-comparison-control-props": serializeNumberFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": String(value),
      children: jsx(SpectrumNumberField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        step: demoProps.step,
        hideStepper: demoProps.hideStepper,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactPickerDemo() {
  const [demoProps, setDemoProps] = useState(pickerDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "picker",
      "data-comparison-control-props": serializePickerDemoProps({
        ...demoProps,
        selectedKey,
      }),
      "data-comparison-value": selectedKey,
      children: jsx(SpectrumPicker, {
        label: demoProps.label,
        selectedKey,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onSelectionChange: (nextKey) => {
          const nextSelectedKey = String(nextKey);
          setSelectedKey(nextSelectedKey);
          setDemoProps((current) => ({ ...current, selectedKey: nextSelectedKey }));
        },
        children: pickerItems.map((item) =>
          jsx(SpectrumPickerItem, { id: item.id, children: item.label }, item.id),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactComboBoxDemo() {
  const [demoProps, setDemoProps] = useState(comboBoxDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const [inputValue, setInputValue] = useState(() => demoProps.inputValue);
  const colorScheme = useComparisonResolvedTheme();

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
    jsx("div", {
      "data-comparison-control-root": "combobox",
      "data-comparison-control-props": serializeComboBoxDemoProps({
        ...demoProps,
        selectedKey,
        inputValue,
      }),
      "data-comparison-value": selectedKey,
      "data-comparison-input-value": inputValue,
      children: jsx(SpectrumComboBox, {
        label: demoProps.label,
        selectedKey,
        inputValue,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onSelectionChange: (nextKey) => {
          const nextSelectedKey = String(nextKey);
          const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
          setSelectedKey(nextSelectedKey);
          setInputValue(nextInputValue);
          setDemoProps((current) => ({
            ...current,
            selectedKey: nextSelectedKey,
            inputValue: nextInputValue,
          }));
        },
        onInputChange: (nextValue) => {
          setInputValue(nextValue);
          setDemoProps((current) => ({ ...current, inputValue: nextValue }));
        },
        children: (item) =>
          jsx(SpectrumComboBoxItem, { id: item.id, children: item.label }, item.id),
        items: comboBoxItems,
      }),
    }),
    colorScheme,
  );
}

function ReactSliderDemo() {
  const [demoProps, setDemoProps] = useState(sliderDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "slider",
      "data-comparison-control-props": serializeSliderDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": String(value),
      children: jsx(SpectrumSlider, {
        label: demoProps.label,
        value,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        step: demoProps.step,
        size: demoProps.size,
        trackStyle: demoProps.trackStyle,
        thumbStyle: demoProps.thumbStyle,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactDialogDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-open": String(isOpen),
      children: jsxs(SpectrumDialogTrigger, {
        isDismissable: true,
        onOpenChange: setIsOpen,
        children: [
          jsx(SpectrumButton, { variant: "primary", children: "Open Dialog" }),
          jsxs(SpectrumDialog, {
            isDismissible: true,
            children: [
              jsx(SpectrumHeading, { slot: "title", children: "Review Changes" }),
              jsx(SpectrumContent, {
                children: jsx(SpectrumText, {
                  children: "Dialog focus and dismissal are compared from this island.",
                }),
              }),
            ],
          }),
        ],
      }),
    }),
  );
}

function ReactCheckboxDemo() {
  const [demoProps, setDemoProps] = useState(checkboxDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => demoProps.isSelected);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-checked": String(isSelected),
      children: jsx(SpectrumCheckbox, {
        "data-comparison-control-root": "checkbox",
        "data-comparison-control-props": serializeCheckboxDemoProps({
          ...demoProps,
          isSelected,
        }),
        size: demoProps.size,
        isSelected,
        isIndeterminate: demoProps.isIndeterminate,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isInvalid: demoProps.isInvalid,
        onChange: (nextSelected) => {
          setIsSelected(nextSelected);
          setDemoProps((current) => ({ ...current, isSelected: nextSelected }));
        },
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

function ReactCheckboxGroupDemo() {
  const [demoProps, setDemoProps] = useState(checkboxGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    selectedValuesArrayFromText(demoProps.selectedValues, ["email"]),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(selectedValuesArrayFromText(nextProps.selectedValues, ["email"]));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectedValues = value.join(",");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-values": selectedValues,
      "data-comparison-control-root": "checkboxgroup",
      "data-comparison-control-props": serializeCheckboxGroupDemoProps({
        ...demoProps,
        selectedValues,
      }),
      children: jsx(SpectrumCheckboxGroup, {
        label: demoProps.label,
        value,
        size: demoProps.size,
        orientation: demoProps.orientation,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue.map(String));
          setDemoProps((current) => ({ ...current, selectedValues: nextValue.join(",") }));
        },
        children: checkboxGroupItems.map((item) =>
          jsx(SpectrumCheckbox, { value: item.value, children: item.label }, item.value),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactRadioGroupDemo() {
  const [demoProps, setDemoProps] = useState(radioGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.selectedValue);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "radiogroup") {
        const nextProps = normalizeRadioGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.selectedValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-value": value,
      "data-comparison-control-root": "radiogroup",
      "data-comparison-control-props": serializeRadioGroupDemoProps({
        ...demoProps,
        selectedValue: value,
      }),
      children: jsx(SpectrumRadioGroup, {
        label: demoProps.label,
        value,
        size: demoProps.size,
        orientation: demoProps.orientation,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, selectedValue: nextValue }));
        },
        children: radioGroupItems.map((item) =>
          jsx(SpectrumRadio, { value: item.value, children: item.label }, item.value),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactDatePickerDemo() {
  const [demoProps, setDemoProps] = useState(datePickerDemoPropsFromWindow);
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datepicker") {
        const nextProps = normalizeDatePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue("");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      "data-comparison-open": String(isOpen),
      children: jsx(SpectrumDatePicker, {
        "data-comparison-control-root": "datepicker",
        "data-comparison-control-props": serializeDatePickerDemoProps(demoProps),
        label: demoProps.label,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => setValue(nextValue == null ? "" : String(nextValue)),
        onOpenChange: setIsOpen,
        UNSAFE_className: "comparison-datepicker-root",
      }),
    }),
  );
}

function ReactSearchFieldDemo() {
  const [demoProps, setDemoProps] = useState(searchFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => searchFieldDemoPropsFromWindow().value);
  const [clearCount, setClearCount] = useState(0);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeSearchFieldDemoProps({
    ...demoProps,
    value,
  });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      "data-comparison-clear-count": String(clearCount),
      children: jsx(SpectrumSearchField, {
        "data-comparison-control-root": "searchfield",
        "data-comparison-control-props": serializedProps,
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
        onClear: () => {
          setValue("");
          setDemoProps((current) => ({ ...current, value: "" }));
          setClearCount((count) => count + 1);
        },
      }),
    }),
    colorScheme,
  );
}

function ReactSwitchDemo() {
  const [demoProps, setDemoProps] = useState(switchDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => demoProps.isSelected);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "switch") {
        const nextProps = normalizeSwitchDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected": String(isSelected),
      "data-comparison-control-root": "switch",
      "data-comparison-control-props": serializeSwitchDemoProps({
        ...demoProps,
        isSelected,
      }),
      children: jsx(SpectrumSwitch, {
        size: demoProps.size,
        isSelected,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        onChange: (nextSelected) => {
          setIsSelected(nextSelected);
          setDemoProps((current) => ({ ...current, isSelected: nextSelected }));
        },
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

function renderTooltipDemo() {
  return renderReactSpectrumReference(
    jsxs(SpectrumTooltipTrigger, {
      delay: 0,
      children: [
        jsx(SpectrumActionButton, { children: "Inspect" }),
        jsx(SpectrumTooltip, { children: "Tooltip content" }),
      ],
    }),
  );
}

function renderToastGap() {
  return jsx("div", {
    className: "comparison-empty-state",
    children: "React Aria Components 1.15.1 does not expose Toast.",
  });
}

const providerShellStyle = {
  padding: 0,
  background: "transparent",
};

const cardViewDemoStyle = {
  width: 360,
  height: 180,
};

const nestedProviderStyle = {
  padding: 16,
  marginTop: 16,
  borderRadius: 16,
};
