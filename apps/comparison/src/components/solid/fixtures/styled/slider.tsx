import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  Slider as SolidSpectrumSlider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  initialSliderDemoValue,
  normalizeSliderDemoProps,
  serializeSliderDemoProps,
  sliderDemoPropsFromWindow,
  type SliderDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/slider-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<SliderDemoProps>(sliderDemoPropsFromWindow());
  const [value, setValue] = createSignal(initialSliderDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialSliderDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeSliderDemoProps(demoProps()));

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
          "data-comparison-control-root": "slider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return String(value());
          },
        },
        [
          hc(SolidSpectrumSlider, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? demoProps().defaultValue
                : undefined;
            },
            get minValue() {
              return demoProps().minValue;
            },
            get maxValue() {
              return demoProps().maxValue;
            },
            get step() {
              return demoProps().step;
            },
            get size() {
              return demoProps().size;
            },
            get trackStyle() {
              return demoProps().trackStyle;
            },
            get thumbStyle() {
              return demoProps().thumbStyle;
            },
            get fillOffset() {
              return demoProps().fillOffset;
            },
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get contextualHelp() {
              return demoProps().withContextualHelp
                ? hc(SolidSpectrumContextualHelp, {}, [
                    hc(SolidSpectrumHeading, { slot: "title" }, ["Volume help"]),
                    hc(SolidSpectrumText, {}, ["Choose an output level."]),
                  ])
                : undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: number) => {
              setValue(nextValue);
              setDemoProps((current: SliderDemoProps) =>
                current.valueSource === "value" ? { ...current, value: nextValue } : current,
              );
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumSliderDemo, {});
