import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Virtualizer as AriaVirtualizer,
  ListLayout as AriaListLayout,
} from "react-aria-components";
import {
  virtualizerDemoItems,
  virtualizerDemoPropsFromWindow,
  normalizeVirtualizerDemoProps,
  serializeVirtualizerDemoProps,
  virtualizerRowHeight,
  virtualizerViewportHeight,
  comparisonControlsEvent,
} from "@comparison/data/virtualizer-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

// Virtualizer oracle: RAC's own `Virtualizer` + `ListLayout` wrapping a base
// ListBox. `rowSize` on the layout is aligned to the Solid port's `itemSize`,
// and every ListBoxItem is forced to the shared row height, so the two stacks
// present an identical scroll geometry (content height = itemCount × rowSize).
function ReactVirtualizerDemo() {
  const [demoProps, setDemoProps] = useState(virtualizerDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "virtualizer") {
        setDemoProps(normalizeVirtualizerDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaVirtualizer, {
          layout: AriaListLayout,
          layoutOptions: { rowSize: virtualizerRowHeight },
          children: jsx(AriaListBox, {
            "aria-label": "Files",
            selectionMode: demoProps.selectionMode,
            "data-comparison-control-root": "virtualizer",
            "data-comparison-control-props": serializeVirtualizerDemoProps(demoProps),
            style: {
              height: virtualizerViewportHeight,
              width: 240,
              display: "block",
              padding: 0,
              margin: 0,
              overflow: "auto",
              boxSizing: "border-box",
            },
            children: virtualizerDemoItems.map((item) =>
              jsx(
                AriaListBoxItem,
                {
                  id: item.id,
                  style: {
                    height: "100%",
                    minHeight: 0,
                    boxSizing: "border-box",
                  },
                  children: item.label,
                },
                item.id,
              ),
            ),
          }),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
  );
}

export default () => jsx(ReactVirtualizerDemo, {});
