import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Divider as SolidSpectrumDivider,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  dividerDemoPropsFromWindow,
  normalizeDividerDemoProps,
  serializeDividerDemoProps,
  type DividerDemoProps,
} from "@comparison/data/divider-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import {
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumDividerDemo() {
  const [demoProps, setDemoProps] = createSignal<DividerDemoProps>(dividerDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "divider") {
        setDemoProps(normalizeDividerDemoProps(event.detail.props ?? {}));
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

  const renderedDivider = createMemo(() => {
    const props = demoProps();

    return h(SolidSpectrumDivider, {
      "data-comparison-control-root": "divider",
      "data-comparison-control-props": serializeDividerDemoProps(props),
      orientation: props.orientation,
      size: props.size,
      staticColor: props.staticColor,
    });
  });

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
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-divider-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-orientation"() {
            return demoProps().orientation;
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedDivider],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDividerDemo, {});
