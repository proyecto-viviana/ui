import h from "@solidjs/h";
import { createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { Link as SolidSpectrumLink } from "@proyecto-viviana/solid-spectrum/Link";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import {
  linkDemoPropsFromWindow,
  normalizeLinkDemoProps,
  serializeLinkDemoProps,
  type LinkDemoProps,
} from "@comparison/data/link-demo";
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

function SolidSpectrumLinkDemo() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const [demoProps, setDemoProps] = createSignal<LinkDemoProps>(linkDemoPropsFromWindow());

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "link") {
        setDemoProps(normalizeLinkDemoProps(event.detail.props ?? {}));
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

  const renderedLink = hc(
    SolidSpectrumLink,
    {
      "data-comparison-control-root": "link",
      get "data-comparison-control-props"() {
        return serializeLinkDemoProps(demoProps());
      },
      get href() {
        return demoProps().href;
      },
      get variant() {
        return demoProps().variant;
      },
      get staticColor() {
        return demoProps().staticColor;
      },
      get isStandalone() {
        return demoProps().isStandalone;
      },
      get isQuiet() {
        return demoProps().isQuiet;
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
        "p",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-link-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedLink],
      ),
    ],
  );
}

export default () => h(SolidSpectrumLinkDemo, {});
