import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ProgressCircle as SolidSpectrumProgressCircle,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeProgressCircleDemoProps,
  progressCircleDemoPropsFromWindow,
  serializeProgressCircleDemoProps,
  type ProgressCircleDemoProps,
} from "@comparison/data/progress-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumProgressCircleDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<ProgressCircleDemoProps>(
    progressCircleDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progresscircle") {
        setDemoProps(normalizeProgressCircleDemoProps(event.detail.props ?? {}));
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
            return staticColorBackdropClass(
              demoProps().staticColor,
              "comparison-progresscircle-row",
            );
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          style: progressCircleRowStyle,
          "data-comparison-control-root": "progresscircle",
          get "data-comparison-control-props"() {
            return serializeProgressCircleDemoProps(demoProps());
          },
        },
        [
          h(SolidSpectrumProgressCircle, {
            get "aria-label"() {
              return demoProps().ariaLabel;
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
            get size() {
              return demoProps().size;
            },
            get staticColor() {
              return demoProps().staticColor || undefined;
            },
            get isIndeterminate() {
              return demoProps().isIndeterminate;
            },
            "data-comparison-progresscircle": "controlled",
          }),
        ],
      ),
    ],
  );
}

const progressCircleRowStyle = {
  display: "flex",
  "align-items": "center",
  gap: "24px",
  padding: "12px",
};

export default () => h(SolidSpectrumProgressCircleDemo, {});
