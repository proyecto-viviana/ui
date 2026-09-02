import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorArea as SolidSpectrumColorArea,
  Provider as SolidSpectrumProvider,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorAreaDemoDefaults,
  colorAreaDemoPropsFromWindow,
  initialColorAreaDemoValue,
  normalizeColorAreaDemoProps,
  serializeColorAreaDemoProps,
  type ColorAreaDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorarea-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function parseSolidColorAreaValue(value: string, fallback = colorAreaDemoDefaults.value) {
  try {
    return parseSolidSpectrumColor(value || fallback);
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorToCssString(color: ReturnType<typeof parseSolidColorAreaValue>) {
  return color.toString("css");
}

function SolidSpectrumColorAreaDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorAreaDemoProps>(
    colorAreaDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorAreaValue(initialColorAreaDemoValue(demoProps())),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorAreaValue(initialColorAreaDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorarea") {
        const nextProps = normalizeColorAreaDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorAreaValue(initialColorAreaDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorAreaDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorarea",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorArea, {
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
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? parseSolidColorAreaValue(
                    demoProps().defaultValue,
                    colorAreaDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get colorSpace() {
              return demoProps().colorSpace || undefined;
            },
            get xChannel() {
              return demoProps().xChannel;
            },
            get yChannel() {
              return demoProps().yChannel;
            },
            get xName() {
              return demoProps().xName || undefined;
            },
            get yName() {
              return demoProps().yName || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorAreaValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorAreaDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorAreaValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorAreaDemo, {});
