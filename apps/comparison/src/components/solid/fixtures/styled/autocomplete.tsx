import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum";
import {
  ListBox as SolidHeadlessListBox,
  ListBoxOption as SolidHeadlessListBoxOption,
  Autocomplete as SolidHeadlessAutocomplete,
  SearchField as SolidHeadlessSearchField,
  SearchFieldInput as SolidHeadlessSearchFieldInput,
} from "@proyecto-viviana/solidaria-components";
import { createFilter as solidCreateFilter } from "@proyecto-viviana/solidaria";
import {
  autocompleteDemoItems,
  autocompleteDemoPropsFromWindow,
  normalizeAutocompleteDemoProps,
  serializeAutocompleteDemoProps,
  type AutocompleteDemoItem,
  type AutocompleteDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/autocomplete-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumAutocompleteDemo() {
  const [demoProps, setDemoProps] = createSignal<AutocompleteDemoProps>(
    autocompleteDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  // Locale-collated contains() — the faithful port of react-aria useFilter,
  // matching the React oracle's useFilter({ sensitivity: "base" }).contains.
  const filter = solidCreateFilter({ sensitivity: "base" });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "autocomplete") {
        setDemoProps(normalizeAutocompleteDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedAutocomplete = createMemo(() =>
    hc(
      SolidHeadlessAutocomplete,
      {
        filter: (textValue: string, inputValue: string) => filter().contains(textValue, inputValue),
      },
      [
        hc(
          "div",
          {
            "data-comparison-control-root": "autocomplete",
            get "data-comparison-control-props"() {
              return serializeAutocompleteDemoProps(demoProps());
            },
          },
          [
            // The input is delivered as a render-prop thunk, not a static array
            // child: `hc`'s array path instantiates a component child eagerly the
            // moment SearchField first forces its `children` getter, and that
            // force comes from an outer reactive scope that is NOT under
            // SearchFieldContext.Provider — so SearchFieldInput's useContext would
            // read null and throw. A render-prop defers instantiation to
            // SearchField's own `children(childRenderValues)` call, which runs
            // inside its providers. Same `<div><input/></div>` DOM as RAC's
            // `<SearchField><Input/></SearchField>`.
            hc(
              SolidHeadlessSearchField,
              { "aria-label": "Search fruits" },
              renderProp(() => hc(SolidHeadlessSearchFieldInput, {}, [])),
            ),
            hc(
              SolidHeadlessListBox,
              {
                "aria-label": "Fruits",
                get selectionMode() {
                  return demoProps().selectionMode;
                },
                items: autocompleteDemoItems,
                getKey: (item: AutocompleteDemoItem) => item.id,
                getTextValue: (item: AutocompleteDemoItem) => item.label,
              },
              renderProp((item: AutocompleteDemoItem) =>
                hc(SolidHeadlessListBoxOption, { id: item.id, textValue: item.label }, [
                  item.label,
                ]),
              ),
            ),
          ],
        ),
      ],
    ),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedAutocomplete, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumAutocompleteDemo, {});
