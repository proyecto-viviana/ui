import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorSwatch as SolidSpectrumColorSwatch,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorSwatchDemoPropsFromWindow,
  normalizeColorSwatchDemoProps,
  serializeColorSwatchDemoProps,
  type ColorSwatchDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorswatch-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumColorSwatchDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSwatchDemoProps>(
    colorSwatchDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatch") {
        setDemoProps(normalizeColorSwatchDemoProps(event.detail.props ?? {}));
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

  const serializedProps = createMemo(() => serializeColorSwatchDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorswatch",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumColorSwatch, {
            get color() {
              return demoProps().color || undefined;
            },
            get colorName() {
              return demoProps().colorName || undefined;
            },
            get size() {
              return demoProps().size;
            },
            get rounding() {
              return demoProps().rounding;
            },
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorSwatchDemo, {});
