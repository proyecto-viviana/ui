import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  RangeSlider as SolidSpectrumRangeSlider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  initialRangeSliderDemoValue,
  normalizeRangeSliderDemoProps,
  rangeSliderDemoPropsFromWindow,
  rangeSliderFormatOptionsForPreset,
  serializeRangeSliderDemoProps,
  type RangeSliderDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/rangeslider-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumRangeSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<RangeSliderDemoProps>(
    rangeSliderDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(initialRangeSliderDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangeslider") {
        const nextProps = normalizeRangeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialRangeSliderDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeRangeSliderDemoProps(demoProps()));

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
          style: rangeSliderStackStyle,
          "data-comparison-control-root": "rangeslider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            const currentValue = value();
            return `${currentValue.start}:${currentValue.end}`;
          },
        },
        [
          hc(SolidSpectrumRangeSlider, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? {
                    start: demoProps().defaultStartValue,
                    end: demoProps().defaultEndValue,
                  }
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
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get formatOptions() {
              return rangeSliderFormatOptionsForPreset(demoProps().formatOptions);
            },
            get contextualHelp() {
              return demoProps().withContextualHelp
                ? hc(SolidSpectrumContextualHelp, {}, [
                    hc(SolidSpectrumHeading, { slot: "title" }, ["Range help"]),
                    hc(SolidSpectrumText, {}, ["Choose minimum and maximum values."]),
                  ])
                : undefined;
            },
            get startName() {
              return demoProps().startName || undefined;
            },
            get endName() {
              return demoProps().endName || undefined;
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
            onChange: (nextValue: { start: number; end: number }) => {
              setValue(nextValue);
              setDemoProps((current: RangeSliderDemoProps) =>
                current.valueSource === "value"
                  ? normalizeRangeSliderDemoProps({
                      ...current,
                      startValue: nextValue.start,
                      endValue: nextValue.end,
                    })
                  : current,
              );
            },
            "data-comparison-rangeslider": "modeled",
          }),
        ],
      ),
    ],
  );
}

const rangeSliderStackStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "28px",
  width: "420px",
  padding: "12px",
};

export default () => h(SolidSpectrumRangeSliderDemo, {});
