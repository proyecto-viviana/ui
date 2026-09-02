import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum";
import {
  ListBox as SolidHeadlessListBox,
  ListBoxOption as SolidHeadlessListBoxOption,
  Virtualizer as SolidHeadlessVirtualizer,
  ListLayout as SolidHeadlessListLayout,
} from "@proyecto-viviana/solidaria-components";
import {
  virtualizerDemoItems,
  virtualizerDemoPropsFromWindow,
  normalizeVirtualizerDemoProps,
  serializeVirtualizerDemoProps,
  virtualizerRowHeight,
  virtualizerViewportHeight,
  type VirtualizerDemoItem,
  type VirtualizerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/virtualizer-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

// Virtualizer port: our solidaria-components `Virtualizer` + `ListLayout`
// wrapping the headless ListBox. `itemSize` on the layout is aligned to the RAC
// oracle's `rowSize`, and every option is forced to the shared row height (our
// port windows by slicing + spacer divs, so option height is CSS-driven, not
// layout-positioned like RAC's absolute rects). Same viewport height + content
// extent as the oracle → the strictly-visible window is geometry-determined.
function SolidSpectrumVirtualizerDemo() {
  const [demoProps, setDemoProps] = createSignal<VirtualizerDemoProps>(
    virtualizerDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "virtualizer") {
        setDemoProps(normalizeVirtualizerDemoProps(event.detail.props ?? {}));
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

  const renderedVirtualizer = createMemo(() =>
    hc(
      SolidHeadlessVirtualizer,
      {
        // Pass the layout CLASS through a getter: hc's unwrapAccessorProps treats
        // any zero-arg function value as a reactive accessor and would invoke the
        // constructor without `new` (Virtualizer does `new local.layout()`). A
        // getter has no `.value`, so hc leaves it untouched and hands over the class.
        get layout() {
          return SolidHeadlessListLayout;
        },
        layoutOptions: { itemSize: virtualizerRowHeight },
      },
      [
        hc(
          SolidHeadlessListBox,
          {
            "aria-label": "Files",
            get selectionMode() {
              return demoProps().selectionMode;
            },
            "data-comparison-control-root": "virtualizer",
            get "data-comparison-control-props"() {
              return serializeVirtualizerDemoProps(demoProps());
            },
            items: virtualizerDemoItems,
            getKey: (item: VirtualizerDemoItem) => item.id,
            getTextValue: (item: VirtualizerDemoItem) => item.label,
            style: {
              height: `${virtualizerViewportHeight}px`,
              width: "240px",
              overflow: "auto",
              "box-sizing": "border-box",
            },
          },
          renderProp((item: VirtualizerDemoItem) =>
            hc(
              SolidHeadlessListBoxOption,
              {
                id: item.id,
                textValue: item.label,
                style: {
                  height: `${virtualizerRowHeight}px`,
                  "min-height": "0",
                  "box-sizing": "border-box",
                  display: "flex",
                  "align-items": "center",
                },
              },
              [item.label],
            ),
          ),
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
        [h("button", {}, "Before"), renderedVirtualizer, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumVirtualizerDemo, {});
