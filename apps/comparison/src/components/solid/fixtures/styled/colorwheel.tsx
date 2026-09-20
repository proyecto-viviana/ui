import h from "@solidjs/h";
import { createMemo, createSignal, onSettled } from "solid-js";
import { createComponent } from "@solidjs/web";
import { hc, Keyed } from "../../solid-h";
import { ColorWheel as SolidSpectrumColorWheel } from "@proyecto-viviana/solid-spectrum/ColorWheel";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { parseColor as parseSolidColorWheelColor } from "@proyecto-viviana/solid-spectrum/ColorArea";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorWheelDemoDefaults,
  colorWheelDemoPropsFromWindow,
  colorWheelDemoSizeNumber,
  comparisonControlsEvent,
  initialColorWheelDemoValue,
  normalizeColorWheelDemoProps,
  serializeColorWheelDemoProps,
  type ColorWheelDemoProps,
} from "@comparison/data/colorwheel-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function solidColorWheelToCssString(
  color: ReturnType<typeof parseSolidColorWheelColor> | null | undefined,
) {
  return (color?.toString("css") ?? "").replace(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(?:1|1\.0+)\)$/i,
    "rgb($1, $2, $3)",
  );
}

function parseSolidColorWheelValue(
  value: string | undefined,
  fallback = colorWheelDemoDefaults.defaultValue,
) {
  try {
    return parseSolidColorWheelColor(value || fallback);
  } catch {
    return parseSolidColorWheelColor(fallback);
  }
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

  onSettled(() => {
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
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    };
  });

  const serializedProps = createMemo(() => serializeColorWheelDemoProps(demoProps()));
  const renderKey = createMemo(() =>
    [
      demoProps().valueSource,
      demoProps().valueSource === "defaultValue" ? demoProps().defaultValue : "controlled",
      demoProps().size,
      demoProps().ariaLabel,
      demoProps().ariaLabelledBy,
      demoProps().ariaDescribedBy,
      demoProps().ariaDetails,
      demoProps().id,
      demoProps().slot,
      demoProps().name,
      demoProps().isDisabled,
    ].join("|"),
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
      () =>
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
            createComponent(Keyed, {
              get when() {
                return renderKey();
              },
              children: (_key: string) =>
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
                })(),
            }),
          ],
        ),
    ],
  );
}

export default () => h(SolidSpectrumColorWheelDemo, {});
