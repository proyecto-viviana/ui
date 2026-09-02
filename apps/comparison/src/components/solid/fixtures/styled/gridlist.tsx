import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum";
import {
  GridList as SolidHeadlessGridList,
  GridListItem as SolidHeadlessGridListItem,
} from "@proyecto-viviana/solidaria-components";
import {
  gridListDemoItems,
  gridListDemoPropsFromWindow,
  gridListDemoLocaleFromWindow,
  normalizeGridListDemoProps,
  serializeGridListDemoProps,
  type GridListDemoItem,
  type GridListDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/gridlist-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumGridListDemo() {
  const [demoProps, setDemoProps] = createSignal<GridListDemoProps>(gridListDemoPropsFromWindow());
  const locale = gridListDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "gridlist") {
        setDemoProps(normalizeGridListDemoProps(event.detail.props ?? {}));
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

  const renderedGridList = createMemo(() =>
    hc(
      SolidHeadlessGridList,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        get orientation() {
          return demoProps().orientation;
        },
        get keyboardNavigationBehavior() {
          return demoProps().keyboardNavigationBehavior;
        },
        "data-comparison-control-root": "gridlist",
        get "data-comparison-control-props"() {
          return serializeGridListDemoProps(demoProps());
        },
        items: gridListDemoItems,
        getKey: (item: GridListDemoItem) => item.id,
        getTextValue: (item: GridListDemoItem) => item.label,
      },
      renderProp((item: GridListDemoItem) =>
        hc(SolidHeadlessGridListItem, { id: item.id, textValue: item.label }, [item.label]),
      ),
    ),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-gridlist-row",
        },
        [h("button", {}, "Before"), renderedGridList, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumGridListDemo, {});
