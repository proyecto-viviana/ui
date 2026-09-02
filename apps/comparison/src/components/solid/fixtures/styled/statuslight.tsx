import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  StatusLight as SolidSpectrumStatusLight,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeStatusLightDemoProps,
  serializeStatusLightDemoProps,
  statusLightDemoPropsFromWindow,
  type StatusLightDemoProps,
} from "@comparison/data/statuslight-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumStatusLightDemo() {
  const [demoProps, setDemoProps] = createSignal<StatusLightDemoProps>(
    statusLightDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "statuslight") {
        setDemoProps(normalizeStatusLightDemoProps(event.detail.props ?? {}));
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

  const renderedStatusLight = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumStatusLight,
      {
        "data-comparison-control-root": "statuslight",
        "data-comparison-control-props": serializeStatusLightDemoProps(props),
        id: "statuslight-route-root",
        "aria-label": "StatusLight route label",
        "aria-describedby": "statuslight-route-description",
        "aria-details": "statuslight-route-details",
        variant: props.variant,
        size: props.size,
        role: props.role || undefined,
      },
      [props.children],
    );
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
          class: "comparison-status-light-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedStatusLight],
      ),
    ],
  );
}

export default () => h(SolidSpectrumStatusLightDemo, {});
