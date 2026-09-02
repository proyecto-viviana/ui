import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorSlider as SolidSpectrumColorSlider,
  Provider as SolidSpectrumProvider,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorSliderEffectiveColorSpace,
  colorSliderDemoDefaults,
  colorSliderDemoPropsFromWindow,
  initialColorSliderDemoValue,
  normalizeColorSliderDemoProps,
  serializeColorSliderDemoProps,
  type ColorSliderDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorslider-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function parseSolidColorSliderValue(
  value: string,
  fallback = colorSliderDemoDefaults.value,
  colorSpace: ColorSliderDemoProps["colorSpace"] = "",
) {
  try {
    const color = parseSolidSpectrumColor(value || fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  } catch {
    const color = parseSolidSpectrumColor(fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  }
}

function solidColorSliderToCssString(color: ReturnType<typeof parseSolidColorSliderValue>) {
  return color.toString("css");
}

function SolidSpectrumColorSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSliderDemoProps>(
    colorSliderDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorSliderValue(
      initialColorSliderDemoValue(demoProps()),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps()),
    ),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorSliderValue(
      initialColorSliderDemoValue(demoProps()),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps()),
    ),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorslider") {
        const nextProps = normalizeColorSliderDemoProps(event.detail.props ?? {});
        const nextColorSpace = colorSliderEffectiveColorSpace(nextProps);
        const nextValue = parseSolidColorSliderValue(
          initialColorSliderDemoValue(nextProps),
          colorSliderDemoDefaults.value,
          nextColorSpace,
        );
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

  const serializedProps = createMemo(() => serializeColorSliderDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorslider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorSliderToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorSliderToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorSlider, {
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
                ? parseSolidColorSliderValue(
                    demoProps().defaultValue,
                    colorSliderDemoDefaults.defaultValue,
                    colorSliderEffectiveColorSpace(demoProps()),
                  )
                : undefined;
            },
            get label() {
              return demoProps().label || undefined;
            },
            get channel() {
              return demoProps().channel;
            },
            get colorSpace() {
              return demoProps().colorSpace || undefined;
            },
            get name() {
              return demoProps().name || undefined;
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
            get orientation() {
              return demoProps().orientation;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorSliderValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorSliderDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorSliderToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorSliderValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorSliderDemo, {});
