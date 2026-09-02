import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  Heading as SolidSpectrumHeading,
  InlineAlert as SolidSpectrumInlineAlert,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  inlineAlertDemoPropsFromWindow,
  normalizeInlineAlertDemoProps,
  serializeInlineAlertDemoProps,
  type InlineAlertDemoProps,
} from "@comparison/data/inlinealert-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumInlineAlertDemo() {
  const [demoProps, setDemoProps] = createSignal<InlineAlertDemoProps>(
    inlineAlertDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "inlinealert") {
        setDemoProps(normalizeInlineAlertDemoProps(event.detail.props ?? {}));
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

  const renderedAlert = createMemo(() =>
    hc(SolidSpectrumInlineAlert, {
      "data-comparison-control-root": "inlinealert",
      get "data-comparison-control-props"() {
        return serializeInlineAlertDemoProps(demoProps());
      },
      id: "inlinealert-route-root",
      "aria-label": "Filtered alert label",
      "aria-describedby": "inlinealert-route-description",
      "aria-details": "inlinealert-route-details",
      get variant() {
        return demoProps().variant;
      },
      get fillStyle() {
        return demoProps().fillStyle;
      },
      get autoFocus() {
        return demoProps().autoFocus || undefined;
      },
      get children() {
        const isNegative = demoProps().variant === "negative";

        return [
          h(SolidSpectrumHeading, {}, isNegative ? "Payment Error" : "Payment Information"),
          h(
            SolidSpectrumContent,
            {},
            isNegative
              ? "There was an error processing your request. Please try again."
              : "Enter your billing address, shipping address, and payment method to complete your purchase.",
          ),
          h(
            "span",
            {
              id: "inlinealert-route-description",
              hidden: true,
            },
            "Inline alert route description.",
          ),
          h(
            "span",
            {
              id: "inlinealert-route-details",
              hidden: true,
            },
            "The comparison route covers variant, fill style, and autofocus.",
          ),
        ];
      },
    }),
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
          class: "comparison-inline-alert-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedAlert],
      ),
    ],
  );
}

export default () => h(SolidSpectrumInlineAlertDemo, {});
