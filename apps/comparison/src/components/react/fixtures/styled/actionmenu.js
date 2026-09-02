import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionMenu as SpectrumActionMenu,
  Keyboard as SpectrumKeyboard,
  MenuItem as SpectrumMenuItem,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  actionMenuDemoPropsFromWindow,
  actionMenuItems,
  normalizeActionMenuDemoProps,
  serializeActionMenuDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actionmenu-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactActionMenuDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(actionMenuDemoPropsFromWindow);
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const [openChangeCount, setOpenChangeCount] = useState(0);
  const [lastOpenState, setLastOpenState] = useState("false");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionmenu") {
        setDemoProps(normalizeActionMenuDemoProps(event.detail.props ?? {}));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-actionmenu-row",
      "data-comparison-control-root": "actionmenu",
      "data-comparison-control-props": serializeActionMenuDemoProps(demoProps),
      "data-comparison-actionmenu-props": serializeActionMenuDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-open-change-count": String(openChangeCount),
      "data-comparison-last-open-state": lastOpenState,
      children: jsx(SpectrumActionMenu, {
        size: demoProps.size,
        menuSize: demoProps.menuSize,
        align: demoProps.align,
        direction: demoProps.direction,
        shouldFlip: demoProps.shouldFlip,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        onAction: (key) => {
          setActionCount((count) => count + 1);
          setLastAction(String(key));
        },
        onOpenChange: (isOpen) => {
          setOpenChangeCount((count) => count + 1);
          setLastOpenState(String(isOpen));
        },
        children: actionMenuItems.map((item) =>
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
    }),
    colorScheme,
  );
}

export default () => jsx(ReactActionMenuDemo, {});
