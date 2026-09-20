import h from "@solidjs/h";
import { createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { Meter as SolidSpectrumMeter } from "@proyecto-viviana/solid-spectrum/Meter";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
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

  onSettled(() => {
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
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    };
  });

  const renderedMeter = h(SolidSpectrumMeter, {
    "data-comparison-control-root": "meter",
    get "data-comparison-control-props"() {
      return serializeMeterDemoProps(demoProps());
    },
    get label() {
      return demoProps().label;
    },
    get value() {
      return demoProps().value;
    },
    get minValue() {
      return demoProps().minValue;
    },
    get maxValue() {
      return demoProps().maxValue;
    },
    get valueLabel() {
      return demoProps().valueLabel || undefined;
    },
    get variant() {
      return demoProps().variant;
    },
    get size() {
      return demoProps().size;
    },
    get staticColor() {
      return demoProps().staticColor || undefined;
    },
    get labelPosition() {
      return demoProps().labelPosition;
    },
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
