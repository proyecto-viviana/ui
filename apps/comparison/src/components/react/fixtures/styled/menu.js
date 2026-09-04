import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionButton as SpectrumActionButton,
  Keyboard as SpectrumKeyboard,
  Menu as SpectrumMenu,
  MenuItem as SpectrumMenuItem,
  MenuTrigger as SpectrumMenuTrigger,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  defaultMenuSelectedKeys,
  menuDemoPropsFromWindow,
  menuItems,
  normalizeMenuDemoProps,
  serializeMenuDemoProps,
  serializeMenuSelectedKeys,
  comparisonControlsEvent,
} from "@comparison/data/menu-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactMenuDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(menuDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    defaultMenuSelectedKeys(menuDemoPropsFromWindow().selectionMode),
  );
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const [openChangeCount, setOpenChangeCount] = useState(0);
  const [lastOpenState, setLastOpenState] = useState("false");
  const [selectionChangeCount, setSelectionChangeCount] = useState(0);

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "menu") {
        const nextProps = normalizeMenuDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(defaultMenuSelectedKeys(nextProps.selectionMode));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
        setSelectionChangeCount(0);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleSelectionChange = (keys) => {
    const nextKeys =
      keys === "all"
        ? new Set(menuItems.map((item) => item.id))
        : new Set(Array.from(keys).map(String));
    setSelectedKeys(nextKeys);
    setSelectionChangeCount((count) => count + 1);
  };
  const selectionProps =
    demoProps.selectionMode === "none"
      ? {}
      : {
          selectionMode: demoProps.selectionMode,
          selectedKeys,
          onSelectionChange: handleSelectionChange,
        };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-menu-row",
      "data-comparison-control-root": "menu",
      "data-comparison-control-props": serializeMenuDemoProps(demoProps),
      "data-comparison-menu-props": serializeMenuDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-open-change-count": String(openChangeCount),
      "data-comparison-last-open-state": lastOpenState,
      "data-comparison-selection-change-count": String(selectionChangeCount),
      "data-comparison-selected-keys": serializeMenuSelectedKeys(selectedKeys),
      children: jsxs(SpectrumMenuTrigger, {
        align: demoProps.align,
        direction: demoProps.direction,
        shouldFlip: demoProps.shouldFlip,
        onOpenChange: (isOpen) => {
          setOpenChangeCount((count) => count + 1);
          setLastOpenState(String(isOpen));
        },
        children: [
          jsx(SpectrumActionButton, {
            size: demoProps.triggerSize,
            isDisabled: demoProps.isDisabled,
            "aria-label": "Layer actions",
            children: "Layer actions",
          }),
          jsx(SpectrumMenu, {
            size: demoProps.size,
            "aria-label": "Layer actions",
            onAction: (key) => {
              setActionCount((count) => count + 1);
              setLastAction(String(key));
            },
            ...selectionProps,
            children: menuItems.map((item) =>
              jsxs(
                SpectrumMenuItem,
                {
                  id: item.id,
                  textValue: item.label,
                  children: [
                    jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                    jsx(SpectrumText, { slot: "label", children: item.label }),
                    jsx(SpectrumText, { slot: "description", children: item.description }),
                    jsx(SpectrumKeyboard, { children: item.shortcut }),
                  ],
                },
                item.id,
              ),
            ),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactMenuDemo, {});
