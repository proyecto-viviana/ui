import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Autocomplete as AriaAutocomplete,
  SearchField as AriaSearchField,
  Input as AriaInput,
  useFilter as useAriaFilter,
} from "react-aria-components";
import {
  autocompleteDemoItems,
  autocompleteDemoPropsFromWindow,
  normalizeAutocompleteDemoProps,
  serializeAutocompleteDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/autocomplete-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactAutocompleteDemo() {
  const [demoProps, setDemoProps] = useState(autocompleteDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  // Locale-collated contains() — the direct upstream of the Solid port's
  // createFilter({ sensitivity: "base" }).contains. Both stacks filter identically.
  const { contains } = useAriaFilter({ sensitivity: "base" });

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "autocomplete") {
        setDemoProps(normalizeAutocompleteDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaAutocomplete, {
          filter: (textValue, inputValue) => contains(textValue, inputValue),
          children: jsxs("div", {
            "data-comparison-control-root": "autocomplete",
            "data-comparison-control-props": serializeAutocompleteDemoProps(demoProps),
            children: [
              jsx(AriaSearchField, {
                "aria-label": "Search fruits",
                children: jsx(AriaInput, {}),
              }),
              jsx(AriaListBox, {
                "aria-label": "Fruits",
                selectionMode: demoProps.selectionMode,
                children: autocompleteDemoItems.map((item) =>
                  jsx(AriaListBoxItem, { id: item.id, children: item.label }, item.id),
                ),
              }),
            ],
          }),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
  );
}

export default () => jsx(ReactAutocompleteDemo, {});
