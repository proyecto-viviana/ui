import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  Footer as SolidSpectrumFooter,
  Heading as SolidSpectrumHeading,
  Link as SolidSpectrumLink,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  contextualHelpDemoPropsFromWindow,
  isContextualHelpOpenControlChecked,
  normalizeContextualHelpDemoProps,
  serializeContextualHelpDemoProps,
  type ContextualHelpDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/contextualhelp-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumContextualHelpDemo() {
  const [demoProps, setDemoProps] = createSignal<ContextualHelpDemoProps>(
    contextualHelpDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "contextualhelp") {
        setDemoProps(normalizeContextualHelpDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(contextualHelpDemoPropsFromWindow());
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
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
          class: "comparison-button-row",
          "data-comparison-control-root": "contextualhelp",
          get "data-comparison-control-props"() {
            return serializeContextualHelpDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumContextualHelp,
            {
              get "aria-label"() {
                return demoProps().triggerLabel;
              },
              get containerPadding() {
                return demoProps().containerPadding;
              },
              get crossOffset() {
                return demoProps().crossOffset;
              },
              get isOpen() {
                return demoProps().isOpen;
              },
              get offset() {
                return demoProps().offset;
              },
              onOpenChange: (nextOpen: boolean) => {
                setDemoProps((current: ContextualHelpDemoProps) =>
                  current.isOpen && !nextOpen && isContextualHelpOpenControlChecked()
                    ? current
                    : normalizeContextualHelpDemoProps({
                        ...current,
                        isOpen: nextOpen,
                      }),
                );
              },
              get placement() {
                return demoProps().placement;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get size() {
                return demoProps().size;
              },
              get variant() {
                return demoProps().variant;
              },
            },
            [
              hc(SolidSpectrumHeading, {}, [() => demoProps().heading]),
              hc(SolidSpectrumContent, {}, [() => demoProps().content]),
              hc(SolidSpectrumFooter, {}, [
                hc(SolidSpectrumLink, { isStandalone: true, href: "#", target: "_blank" }, [
                  "Learn more about segments",
                ]),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumContextualHelpDemo, {});
