import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Accordion as SolidSpectrumAccordion,
  AccordionItem as SolidSpectrumAccordionItem,
  AccordionItemHeader as SolidSpectrumAccordionItemHeader,
  AccordionItemPanel as SolidSpectrumAccordionItemPanel,
  AccordionItemTitle as SolidSpectrumAccordionItemTitle,
  ActionButton as SolidSpectrumActionButton,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  accordionDemoLocaleFromWindow,
  accordionDemoPropsFromWindow,
  normalizeAccordionDemoProps,
  serializeAccordionKeys,
  serializeAccordionDemoProps,
  type AccordionDemoProps,
} from "@comparison/data/accordion-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

function SolidSpectrumAccordionDemo() {
  const [demoProps, setDemoProps] = createSignal<AccordionDemoProps>(
    accordionDemoPropsFromWindow(),
  );
  const locale = accordionDemoLocaleFromWindow();
  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set(["personal"]));
  const [expandedChangeCount, setExpandedChangeCount] = createSignal(0);
  const [lastExpandedChangeKeys, setLastExpandedChangeKeys] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "accordion") {
        setDemoProps(normalizeAccordionDemoProps(event.detail.props ?? {}));
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

  const controlledExpandedKeys = createMemo(() => {
    const keys = Array.from(expandedKeys());
    return new Set(demoProps().allowsMultipleExpanded ? keys : keys.slice(0, 1));
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-accordion-row",
          "data-comparison-control-root": "accordion",
          get "data-comparison-control-props"() {
            return serializeAccordionDemoProps(demoProps());
          },
          get "data-comparison-expanded-keys"() {
            return serializeAccordionKeys(controlledExpandedKeys());
          },
          get "data-comparison-expanded-change-count"() {
            return String(expandedChangeCount());
          },
          get "data-comparison-expanded-change-keys"() {
            return lastExpandedChangeKeys();
          },
        },
        [
          hc(
            SolidSpectrumAccordion,
            {
              UNSAFE_style: { width: "220px" },
              get size() {
                return demoProps().size;
              },
              get density() {
                return demoProps().density;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get allowsMultipleExpanded() {
                return demoProps().allowsMultipleExpanded;
              },
              get expandedKeys() {
                return controlledExpandedKeys();
              },
              onExpandedChange(keys: Set<string>) {
                const nextKeys = new Set(Array.from(keys).map(String));
                setExpandedKeys(nextKeys);
                setExpandedChangeCount((count) => count + 1);
                setLastExpandedChangeKeys(serializeAccordionKeys(nextKeys));
              },
            },
            [
              hc(SolidSpectrumAccordionItem, { id: "personal" }, [
                hc(SolidSpectrumAccordionItemTitle, {}, ["Personal Information"]),
                hc(SolidSpectrumAccordionItemPanel, {}, [
                  hc("div", { class: "comparison-accordion-panel-copy" }, [
                    h("span", {}, "Name"),
                    h("span", {}, "Phone number"),
                    h("span", {}, "Email address"),
                  ]),
                ]),
              ]),
              hc(SolidSpectrumAccordionItem, { id: "billing" }, [
                hc(SolidSpectrumAccordionItemHeader, {}, [
                  hc(SolidSpectrumAccordionItemTitle, {}, ["Billing Address"]),
                  hc(SolidSpectrumActionButton, { "aria-label": "More billing actions" }, [
                    h(SolidNewIcon, { "aria-hidden": "true" }),
                  ]),
                ]),
                hc(SolidSpectrumAccordionItemPanel, {}, [
                  hc("div", { class: "comparison-accordion-panel-copy" }, [
                    h("span", {}, "Street address"),
                    h("span", {}, "City"),
                    h("span", {}, "Postal code"),
                  ]),
                ]),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumAccordionDemo, {});
