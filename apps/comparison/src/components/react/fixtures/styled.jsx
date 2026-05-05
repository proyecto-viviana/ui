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
  Content as SpectrumContent,
  DatePicker as SpectrumDatePicker,
  Dialog as SpectrumDialog,
  DialogTrigger as SpectrumDialogTrigger,
  Heading as SpectrumHeading,
  LinkButton as SpectrumLinkButton,
  Provider as SpectrumProvider,
  SearchField as SpectrumSearchField,
  SegmentedControl as SpectrumSegmentedControl,
  SegmentedControlItem as SpectrumSegmentedControlItem,
  SelectBox as SpectrumSelectBox,
  SelectBoxGroup as SpectrumSelectBoxGroup,
  Tab as SpectrumTab,
  TabList as SpectrumTabList,
  TabPanel as SpectrumTabPanel,
  Tabs as SpectrumTabs,
  Text as SpectrumText,
  TextField as SpectrumTextField,
  Tooltip as SpectrumTooltip,
  TooltipTrigger as SpectrumTooltipTrigger,
  ToggleButton as SpectrumToggleButton,
  ToggleButtonGroup as SpectrumToggleButtonGroup,
  createIcon,
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

const selectBoxItems = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

const cardItems = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

function booleanParamFromWindow(name) {
  if (typeof window === "undefined") {
    return false;
  }

  const value = new URLSearchParams(window.location.search).get(name);
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

function numberParamFromWindow(name) {
  const value = queryParamFromWindow(name);
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function selectedKeysParamFromWindow(fallback) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

function iconPlacementFromWindow() {
  if (typeof window === "undefined") {
    return "none";
  }

  const value = new URLSearchParams(window.location.search).get("iconPlacement");
  return value === "start" || value === "end" || value === "only" ? value : "none";
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
  textfield: () => jsx(ReactTextFieldDemo, {}),
  checkbox: () => jsx(ReactCheckboxDemo, {}),
  dialog: () => jsx(ReactDialogDemo, {}),
  datepicker: () => jsx(ReactDatePickerDemo, {}),
  searchfield: () => jsx(ReactSearchFieldDemo, {}),
  cardview: () => jsx(ReactCardViewDemo, {}),
  segmentedcontrol: () => jsx(ReactSegmentedControlDemo, {}),
  selectboxgroup: () => jsx(ReactSelectBoxGroupDemo, {}),
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

  if (demoProps.iconPlacement === "end") {
    return [
      jsx(SpectrumText, { children: demoProps.children }, "text"),
      jsx(ReactButtonIcon, {}, "icon"),
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

  if (iconPlacement === "end") {
    return [jsx(SpectrumText, { children: label }, "text"), jsx(ReactButtonIcon, {}, "icon")];
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
  const iconPlacement = iconPlacementFromWindow();
  const groupProps = {
    size: stringParamFromWindow("size", ["XS", "S", "M", "L", "XL"], "M"),
    density: stringParamFromWindow("density", ["regular", "compact"], "regular"),
    orientation: stringParamFromWindow("orientation", ["horizontal", "vertical"], "horizontal"),
    isQuiet: booleanParamFromWindow("isQuiet"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    staticColor: stringParamFromWindow("staticColor", ["white", "black", "auto"], undefined),
  };
  const [selectedKeys, setSelectedKeys] = useState(() => selectedKeysParamFromWindow(["bold"]));
  const [actionKey, setActionKey] = useState("");
  const selectedKeyText = Array.from(selectedKeys).join(",");
  const toggleKey = (key) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      "data-comparison-selected-keys": selectedKeyText,
      children: jsx(SpectrumActionButtonGroup, {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-group-props": JSON.stringify({
          ...groupProps,
          iconPlacement,
        }),
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
              "aria-label": iconPlacement === "only" ? item.label : void 0,
              "aria-pressed": selectedKeys.has(item.id),
              onPress: () => toggleKey(item.id),
              children: renderSingleButtonFamilyChildren(item.label, iconPlacement),
            },
            item.id,
          ),
        ),
      }),
    }),
  );
}

function ReactButtonGroupDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const wrapWidth = numberParamFromWindow("wrapWidth");
  const groupProps = {
    orientation: stringParamFromWindow("orientation", ["horizontal", "vertical"], "horizontal"),
    align: stringParamFromWindow("align", ["start", "end", "center"], "start"),
    size: stringParamFromWindow("size", ["S", "M", "L", "XL"], "M"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    wrapWidth,
  };
  const wrapStyle = wrapWidth ? { width: wrapWidth } : undefined;
  const [actionKey, setActionKey] = useState("");
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      children: jsxs(SpectrumButtonGroup, {
        "data-comparison-group-root": "buttongroup",
        "data-comparison-group-props": JSON.stringify({
          ...groupProps,
          iconPlacement,
        }),
        orientation: groupProps.orientation,
        align: groupProps.align,
        size: groupProps.size,
        isDisabled: groupProps.isDisabled,
        UNSAFE_style: wrapStyle,
        children: [
          jsx(SpectrumButton, {
            variant: "primary",
            "aria-label": iconPlacement === "only" ? "Save" : void 0,
            onPress: () => setActionKey("save"),
            children: renderSingleButtonFamilyChildren("Save", iconPlacement),
          }),
          jsx(SpectrumButton, {
            variant: "secondary",
            "aria-label": iconPlacement === "only" ? "Cancel" : void 0,
            onPress: () => setActionKey("cancel"),
            children: renderSingleButtonFamilyChildren("Cancel", iconPlacement),
          }),
        ],
      }),
    }),
  );
}

function ReactLinkButtonDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const iconPlacement = iconPlacementFromWindow();
  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      children: jsx(SpectrumLinkButton, {
        href: "https://example.com/docs",
        variant: "primary",
        fillStyle: "fill",
        "aria-label": iconPlacement === "only" ? "Open docs" : void 0,
        children: renderSingleButtonFamilyChildren("Open docs", iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function ReactToggleButtonDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const [selected, setSelected] = useState(() => booleanParamFromWindow("isSelected"));
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected": String(selected),
      children: jsx(SpectrumToggleButton, {
        isSelected: selected,
        onChange: setSelected,
        "aria-label": iconPlacement === "only" ? "Pin" : void 0,
        children: renderSingleButtonFamilyChildren("Pin", iconPlacement),
      }),
    }),
  );
}

function ReactToggleButtonGroupDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const groupProps = {
    size: stringParamFromWindow("size", ["XS", "S", "M", "L", "XL"], "M"),
    density: stringParamFromWindow("density", ["regular", "compact"], "regular"),
    orientation: stringParamFromWindow("orientation", ["horizontal", "vertical"], "horizontal"),
    isQuiet: booleanParamFromWindow("isQuiet"),
    isEmphasized: booleanParamFromWindow("isEmphasized"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    staticColor: stringParamFromWindow("staticColor", ["white", "black", "auto"], undefined),
  };
  const [selectedKeys, setSelectedKeys] = useState(() => selectedKeysParamFromWindow(["left"]));
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsxs(SpectrumToggleButtonGroup, {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-group-props": JSON.stringify({
          ...groupProps,
          iconPlacement,
        }),
        selectionMode: "single",
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
            "aria-label": iconPlacement === "only" ? "Left" : void 0,
            children: renderSingleButtonFamilyChildren("Left", iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "center",
            "aria-label": iconPlacement === "only" ? "Center" : void 0,
            children: renderSingleButtonFamilyChildren("Center", iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "right",
            "aria-label": iconPlacement === "only" ? "Right" : void 0,
            children: renderSingleButtonFamilyChildren("Right", iconPlacement),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactSegmentedControlDemo() {
  const [selectedKey, setSelectedKey] = useState("list");
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-key": selectedKey,
      children: jsxs(SpectrumSegmentedControl, {
        "aria-label": "View mode",
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
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(["starter"]));
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsx(SpectrumSelectBoxGroup, {
        "aria-label": "Plans",
        orientation: "horizontal",
        selectedKeys,
        onSelectionChange: (keys) => setSelectedKeys(keys === "all" ? new Set() : new Set(keys)),
        children: selectBoxItems.map((item) =>
          jsxs(
            SpectrumSelectBox,
            {
              id: item.id,
              textValue: item.label,
              children: [
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
  const [value, setValue] = useState("Quarterly report");
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      children: jsx(SpectrumTextField, {
        label: "Name",
        defaultValue: "Quarterly report",
        onChange: setValue,
      }),
    }),
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
  const [checked, setChecked] = useState(true);
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-checked": String(checked),
      children: jsx(SpectrumCheckbox, {
        defaultSelected: true,
        onChange: setChecked,
        children: "Enable alerts",
      }),
    }),
  );
}

function ReactDatePickerDemo() {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      "data-comparison-open": String(isOpen),
      children: jsx(SpectrumDatePicker, {
        label: "Due date",
        onChange: (nextValue) => setValue(nextValue == null ? "" : String(nextValue)),
        onOpenChange: setIsOpen,
        UNSAFE_className: "comparison-datepicker-root",
      }),
    }),
  );
}

function ReactSearchFieldDemo() {
  const [value, setValue] = useState("status");
  const [clearCount, setClearCount] = useState(0);
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-input-value": value,
      "data-comparison-clear-count": String(clearCount),
      children: jsx(SpectrumSearchField, {
        label: "Search",
        defaultValue: "status",
        onChange: setValue,
        onClear: () => {
          setValue("");
          setClearCount((count) => count + 1);
        },
      }),
    }),
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
