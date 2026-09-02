import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorWheel as SolidSpectrumColorWheel,
  Provider as SolidSpectrumProvider,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorWheelDemoDefaults,
  colorWheelDemoPropsFromWindow,
  colorWheelDemoSizeNumber,
  initialColorWheelDemoValue,
  normalizeColorWheelDemoProps,
  serializeColorWheelDemoProps,
  type ColorWheelDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorwheel-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function parseSolidColorWheelValue(value: string, fallback = colorWheelDemoDefaults.value) {
  try {
    return parseSolidSpectrumColor(value || fallback);
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorWheelToCssString(color: ReturnType<typeof parseSolidColorWheelValue>) {
  return color.toString("css");
}

function SolidSpectrumColorWheelDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorWheelDemoProps>(
    colorWheelDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorWheelValue(initialColorWheelDemoValue(demoProps())),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorWheelValue(initialColorWheelDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorwheel") {
        const nextProps = normalizeColorWheelDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorWheelValue(initialColorWheelDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeColorWheelDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorwheel",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorWheelToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorWheelToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorWheel, {
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
                ? parseSolidColorWheelValue(
                    demoProps().defaultValue,
                    colorWheelDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get size() {
              return colorWheelDemoSizeNumber(demoProps());
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
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorWheelValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorWheelDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorWheelToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorWheelValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorWheelDemo, {});
