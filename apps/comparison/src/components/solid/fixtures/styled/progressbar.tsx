import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ProgressBar as SolidSpectrumProgressBar,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  progressBarFormatOptionsForPreset,
  normalizeProgressBarDemoProps,
  progressBarDemoPropsFromWindow,
  serializeProgressBarDemoProps,
  type ProgressBarDemoProps,
} from "@comparison/data/progress-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumProgressBarDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<ProgressBarDemoProps>(
    progressBarDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progressbar") {
        setDemoProps(normalizeProgressBarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
            return staticColorBackdropClass(demoProps().staticColor, "comparison-progressbar-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          style: progressFixtureStackStyle,
          "data-comparison-control-root": "progressbar",
          get "data-comparison-control-props"() {
            return serializeProgressBarDemoProps(demoProps());
          },
        },
        [
          h(SolidSpectrumProgressBar, {
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
            get formatOptions() {
              return progressBarFormatOptionsForPreset(demoProps().formatOptions);
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
            get isIndeterminate() {
              return demoProps().isIndeterminate;
            },
            "data-comparison-progressbar": "controlled",
          }),
        ],
      ),
    ],
  );
}

const progressFixtureStackStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "24px",
  width: "360px",
  padding: "12px",
};

export default () => h(SolidSpectrumProgressBarDemo, {});
