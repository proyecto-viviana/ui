import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  Disclosure as SolidSpectrumDisclosure,
  DisclosureHeader as SolidSpectrumDisclosureHeader,
  DisclosurePanel as SolidSpectrumDisclosurePanel,
  DisclosureTitle as SolidSpectrumDisclosureTitle,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  disclosureDemoLocaleFromWindow,
  disclosureDemoPropsFromWindow,
  normalizeDisclosureDemoProps,
  serializeDisclosureDemoProps,
  type DisclosureDemoProps,
} from "@comparison/data/disclosure-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { SolidNewIcon, providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumDisclosureDemo() {
  const [demoProps, setDemoProps] = createSignal<DisclosureDemoProps>(
    disclosureDemoPropsFromWindow(),
  );
  const locale = disclosureDemoLocaleFromWindow();
  const [expandedChangeCount, setExpandedChangeCount] = createSignal(0);
  const [lastExpandedChange, setLastExpandedChange] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "disclosure") {
        setDemoProps(normalizeDisclosureDemoProps(event.detail.props ?? {}));
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

  const disclosureTitle = () =>
    hc(
      SolidSpectrumDisclosureTitle,
      {
        get level() {
          return Number(demoProps().titleLevel);
        },
      },
      ["System Requirements"],
    );

  const disclosureHeader = () =>
    demoProps().withHeaderAction
      ? hc(SolidSpectrumDisclosureHeader, {}, [
          disclosureTitle(),
          hc(SolidSpectrumActionButton, { "aria-label": "Edit system requirements" }, [
            h(SolidNewIcon, { "aria-hidden": "true" }),
          ]),
        ])
      : disclosureTitle();

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
          class: "comparison-disclosure-row",
          "data-comparison-control-root": "disclosure",
          get "data-comparison-control-props"() {
            return serializeDisclosureDemoProps(demoProps());
          },
          get "data-comparison-expanded"() {
            return String(demoProps().isExpanded);
          },
          get "data-comparison-expanded-change-count"() {
            return String(expandedChangeCount());
          },
          get "data-comparison-expanded-change-value"() {
            return lastExpandedChange();
          },
        },
        [
          hc(
            SolidSpectrumDisclosure,
            {
              UNSAFE_style: { width: "250px" },
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
              get isExpanded() {
                return demoProps().isExpanded;
              },
              onExpandedChange(expanded: boolean) {
                setDemoProps((props) =>
                  normalizeDisclosureDemoProps({ ...props, isExpanded: expanded }),
                );
                setExpandedChangeCount((count) => count + 1);
                setLastExpandedChange(String(expanded));
              },
            },
            [
              disclosureHeader(),
              hc(
                SolidSpectrumDisclosurePanel,
                {
                  get role() {
                    return demoProps().panelRole;
                  },
                },
                [
                  hc("div", { class: "comparison-disclosure-panel-copy" }, [
                    h("span", {}, "macOS 14 or later"),
                    h("span", {}, "16 GB memory"),
                    h("span", {}, "20 GB available storage"),
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDisclosureDemo, {});
