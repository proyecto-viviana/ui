import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorField as SolidSpectrumColorField,
  Provider as SolidSpectrumProvider,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorFieldDemoDefaults,
  colorFieldDemoPropsFromWindow,
  initialColorFieldDemoValue,
  normalizeColorFieldDemoProps,
  serializeColorFieldDemoProps,
  type ColorFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorfield-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function parseSolidColorFieldValue(value: string, fallback = colorFieldDemoDefaults.value) {
  try {
    return value ? parseSolidSpectrumColor(value) : null;
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorFieldToCssString(color: ReturnType<typeof parseSolidColorFieldValue>) {
  return color?.toString("css") ?? "";
}

function SolidSpectrumColorFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorFieldDemoProps>(
    colorFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorFieldValue(initialColorFieldDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorfield") {
        const nextProps = normalizeColorFieldDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorFieldValue(initialColorFieldDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorFieldDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorfield",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorFieldToCssString(value());
          },
        },
        [
          hc(SolidSpectrumColorField, {
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
                ? parseSolidColorFieldValue(
                    demoProps().defaultValue,
                    colorFieldDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get label() {
              return demoProps().label || undefined;
            },
            get description() {
              return demoProps().description || undefined;
            },
            get errorMessage() {
              return demoProps().errorMessage || undefined;
            },
            get placeholder() {
              return demoProps().placeholder || undefined;
            },
            get channel() {
              return demoProps().channel || undefined;
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
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
            },
            get isWheelDisabled() {
              return demoProps().isWheelDisabled;
            },
            get size() {
              return demoProps().size;
            },
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get necessityIndicator() {
              return demoProps().necessityIndicator;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorFieldValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorFieldDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorFieldToCssString(nextValue) }
                  : current,
              );
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorFieldDemo, {});
