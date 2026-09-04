import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum";
import {
  ListBox as SolidHeadlessListBox,
  ListBoxOption as SolidHeadlessListBoxOption,
} from "@proyecto-viviana/solidaria-components";
import {
  listBoxDemoItems,
  listBoxDemoPropsFromWindow,
  normalizeListBoxDemoProps,
  serializeListBoxDemoProps,
  type ListBoxDemoItem,
  type ListBoxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/listbox-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumListBoxDemo() {
  const [demoProps, setDemoProps] = createSignal<ListBoxDemoProps>(listBoxDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listbox") {
        setDemoProps(normalizeListBoxDemoProps(event.detail.props ?? {}));
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

  const renderedListBox = createMemo(() =>
    hc(
      SolidHeadlessListBox,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        "data-comparison-control-root": "listbox",
        get "data-comparison-control-props"() {
          return serializeListBoxDemoProps(demoProps());
        },
        items: listBoxDemoItems,
        getKey: (item: ListBoxDemoItem) => item.id,
        getTextValue: (item: ListBoxDemoItem) => item.label,
      },
      renderProp((item: ListBoxDemoItem) =>
        hc(SolidHeadlessListBoxOption, { id: item.id, textValue: item.label }, [item.label]),
      ),
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
        [h("button", {}, "Before"), renderedListBox, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumListBoxDemo, {});
