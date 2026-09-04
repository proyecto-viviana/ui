import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Content as SolidSpectrumContent,
  Heading as SolidSpectrumHeading,
  IllustratedMessage as SolidSpectrumIllustratedMessage,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  illustratedMessageDemoPropsFromWindow,
  normalizeIllustratedMessageDemoProps,
  serializeIllustratedMessageDemoProps,
  type IllustratedMessageDemoProps,
} from "@comparison/data/illustratedmessage-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { SolidIllustratedMessageIllustration, providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumIllustratedMessageDemo() {
  const [demoProps, setDemoProps] = createSignal<IllustratedMessageDemoProps>(
    illustratedMessageDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustratedmessage") {
        setDemoProps(normalizeIllustratedMessageDemoProps(event.detail.props ?? {}));
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

  const renderedMessage = createMemo(() =>
    hc(SolidSpectrumIllustratedMessage, {
      "data-comparison-control-root": "illustratedmessage",
      get "data-comparison-control-props"() {
        return serializeIllustratedMessageDemoProps(demoProps());
      },
      id: "illustratedmessage-route-root",
      role: "status",
      "aria-label": "Asset empty state",
      "aria-describedby": "illustratedmessage-route-description",
      "aria-details": "illustratedmessage-route-details",
      get size() {
        return demoProps().size;
      },
      get orientation() {
        return demoProps().orientation;
      },
      get children() {
        const children = [
          h(SolidIllustratedMessageIllustration, { slot: "illustration" }),
          h(SolidSpectrumHeading, {}, "Create your first asset"),
          h(SolidSpectrumContent, {}, "Upload or import a file to begin."),
          h(
            "span",
            {
              id: "illustratedmessage-route-description",
              hidden: true,
            },
            "Illustrated empty-state guidance.",
          ),
          h(
            "span",
            {
              id: "illustratedmessage-route-details",
              hidden: true,
            },
            "The comparison route covers illustration, heading, content, and actions.",
          ),
        ];

        if (demoProps().withActions) {
          children.push(
            hc(SolidSpectrumButtonGroup, {}, [
              h(SolidSpectrumButton, { variant: "secondary" }, "Import"),
              h(SolidSpectrumButton, { variant: "accent" }, "Upload"),
            ]),
          );
        }

        return children;
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
          class: "comparison-illustrated-message-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedMessage],
      ),
    ],
  );
}

export default () => h(SolidSpectrumIllustratedMessageDemo, {});
