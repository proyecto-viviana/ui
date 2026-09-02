import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import { GridList as AriaGridList, GridListItem as AriaGridListItem } from "react-aria-components";
import {
  gridListDemoItems,
  gridListDemoPropsFromWindow,
  gridListDemoLocaleFromWindow,
  normalizeGridListDemoProps,
  serializeGridListDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/gridlist-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactGridListDemo() {
  const [demoProps, setDemoProps] = useState(gridListDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const locale = gridListDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "gridlist") {
        setDemoProps(normalizeGridListDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaGridList, {
          "aria-label": "Permissions",
          selectionMode: demoProps.selectionMode,
          orientation: demoProps.orientation,
          keyboardNavigationBehavior: demoProps.keyboardNavigationBehavior,
          "data-comparison-control-root": "gridlist",
          "data-comparison-control-props": serializeGridListDemoProps(demoProps),
          children: gridListDemoItems.map((item) =>
            jsx(AriaGridListItem, { id: item.id, children: item.label }, item.id),
          ),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactGridListDemo, {});
