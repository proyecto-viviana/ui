import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  LabeledValue as SolidSpectrumLabeledValue,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  labeledValueDemoPropsFromWindow,
  normalizeLabeledValueDemoProps,
  resolveLabeledValueDemoValue,
  serializeLabeledValueDemoProps,
  type LabeledValueDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/labeledvalue-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumLabeledValueDemo() {
  const [demoProps, setDemoProps] = createSignal<LabeledValueDemoProps>(
    labeledValueDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "labeledvalue") {
        setDemoProps(normalizeLabeledValueDemoProps(event.detail.props ?? {}));
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

  const serializedProps = createMemo(() => serializeLabeledValueDemoProps(demoProps()));

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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          // The control-root marker sits on the wrapper (matching the field fixtures) so the
          // LabeledValue field grid is `${root} > div` on both stacks.
          "data-comparison-control-root": "labeledvalue",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumLabeledValue, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return resolveLabeledValueDemoValue(demoProps());
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
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumLabeledValueDemo, {});
