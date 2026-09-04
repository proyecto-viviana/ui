import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Meter as SolidSpectrumMeter,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  meterDemoPropsFromWindow,
  normalizeMeterDemoProps,
  serializeMeterDemoProps,
  type MeterDemoProps,
} from "@comparison/data/meter-demo";
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

function SolidSpectrumMeterDemo() {
  const [demoProps, setDemoProps] = createSignal<MeterDemoProps>(meterDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "meter") {
        setDemoProps(normalizeMeterDemoProps(event.detail.props ?? {}));
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

  const renderedMeter = createMemo(() => {
    const props = demoProps();

    return h(SolidSpectrumMeter, {
      "data-comparison-control-root": "meter",
      "data-comparison-control-props": serializeMeterDemoProps(props),
      label: props.label,
      value: props.value,
      minValue: props.minValue,
      maxValue: props.maxValue,
      valueLabel: props.valueLabel || undefined,
      variant: props.variant,
      size: props.size,
      staticColor: props.staticColor || undefined,
      labelPosition: props.labelPosition,
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
            return staticColorBackdropClass(demoProps().staticColor, "comparison-meter-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedMeter],
      ),
    ],
  );
}

export default () => h(SolidSpectrumMeterDemo, {});
