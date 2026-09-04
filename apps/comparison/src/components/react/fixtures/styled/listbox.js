import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import { ListBox as AriaListBox, ListBoxItem as AriaListBoxItem } from "react-aria-components";
import {
  listBoxDemoItems,
  listBoxDemoPropsFromWindow,
  normalizeListBoxDemoProps,
  serializeListBoxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/listbox-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactListBoxDemo() {
  const [demoProps, setDemoProps] = useState(listBoxDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listbox") {
        setDemoProps(normalizeListBoxDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaListBox, {
          "aria-label": "Permissions",
          selectionMode: demoProps.selectionMode,
          "data-comparison-control-root": "listbox",
          "data-comparison-control-props": serializeListBoxDemoProps(demoProps),
          children: listBoxDemoItems.map((item) =>
            jsx(AriaListBoxItem, { id: item.id, children: item.label }, item.id),
          ),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
  );
}

export default () => jsx(ReactListBoxDemo, {});
