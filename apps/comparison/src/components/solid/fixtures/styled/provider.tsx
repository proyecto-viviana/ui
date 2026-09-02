import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeProviderDemoProps,
  providerDemoPropsFromWindow,
  serializeProviderDemoProps,
  type ProviderDemoProps,
} from "@comparison/data/provider-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumProviderDemo() {
  const [demoProps, setDemoProps] = createSignal<ProviderDemoProps>(providerDemoPropsFromWindow());

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "provider") {
        setDemoProps(normalizeProviderDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  return hc(
    SolidSpectrumProvider,
    {
      "data-comparison-control-root": "provider",
      get "data-comparison-control-props"() {
        return serializeProviderDemoProps(demoProps());
      },
      get colorScheme() {
        return demoProps().colorScheme;
      },
      get background() {
        return demoProps().background;
      },
      style: providerShellStyle,
    },
    [
      hc("div", { class: "comparison-provider-stack" }, [
        hc(
          "div",
          {
            class: "comparison-provider-caption",
            get "data-comparison-caption-scheme"() {
              return demoProps().colorScheme;
            },
          },
          [() => `Outer provider: ${demoProps().colorScheme} / ${demoProps().background}`],
        ),
        h(SolidSpectrumButton, { variant: "primary" }, "Inherited Action"),
        h(
          SolidSpectrumProvider,
          { colorScheme: "light", background: "base", style: nestedProviderStyle },
          h(
            "div",
            {
              class: "comparison-provider-caption",
              "data-comparison-caption-scheme": "light",
            },
            "Nested provider: local light override",
          ),
          h(SolidSpectrumButton, { variant: "accent" }, "Nested Override"),
        ),
      ]),
    ],
  );
}

const nestedProviderStyle = {
  padding: "16px",
  margin: "16px 0 0",
  "border-radius": "16px",
};

export default () => h(SolidSpectrumProviderDemo, {});
