import h from "@solidjs/h";
import { createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { StatusLight as SolidSpectrumStatusLight } from "@proyecto-viviana/solid-spectrum/StatusLight";
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

  onSettled(() => {
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
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    };
  });

  const renderedStatusLight = hc(
    SolidSpectrumStatusLight,
    {
      "data-comparison-control-root": "statuslight",
      get "data-comparison-control-props"() {
        return serializeStatusLightDemoProps(demoProps());
      },
      id: "statuslight-route-root",
      "aria-label": "StatusLight route label",
      "aria-describedby": "statuslight-route-description",
      "aria-details": "statuslight-route-details",
      get variant() {
        return demoProps().variant;
      },
      get size() {
        return demoProps().size;
      },
      get role() {
        return demoProps().role || undefined;
      },
    },
    [() => demoProps().children],
  );

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
