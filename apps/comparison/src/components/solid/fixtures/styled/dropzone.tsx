import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  DropZone as SolidSpectrumDropZone,
  Heading as SolidSpectrumHeading,
  IllustratedMessage as SolidSpectrumIllustratedMessage,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  dropZoneDemoPropsFromWindow,
  normalizeDropZoneDemoProps,
  serializeDropZoneDemoProps,
  type DropZoneDemoProps,
} from "@comparison/data/dropzone-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { SolidDropZoneIllustration, providerShellStyle } from "../styled-shared.tsx";

interface DropZoneCounts {
  activate: number;
  drop: number;
  enter: number;
  exit: number;
  move: number;
}

type DropZoneCountKey = keyof DropZoneCounts;

function SolidSpectrumDropZoneDemo() {
  const [demoProps, setDemoProps] = createSignal<DropZoneDemoProps>(dropZoneDemoPropsFromWindow());
  const [counts, setCounts] = createSignal<DropZoneCounts>({
    activate: 0,
    drop: 0,
    enter: 0,
    exit: 0,
    move: 0,
  });
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dropzone") {
        setDemoProps(normalizeDropZoneDemoProps(event.detail.props ?? {}));
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

  const bump = (key: DropZoneCountKey) => {
    setCounts((current) => ({ ...current, [key]: current[key] + 1 }));
  };

  const renderedDropZone = createMemo(() =>
    hc(SolidSpectrumDropZone, {
      "data-comparison-control-root": "dropzone",
      get "data-comparison-control-props"() {
        return serializeDropZoneDemoProps(demoProps());
      },
      get "data-comparison-drop-activate-count"() {
        return counts().activate;
      },
      get "data-comparison-drop-count"() {
        return counts().drop;
      },
      get "data-comparison-drop-enter-count"() {
        return counts().enter;
      },
      get "data-comparison-drop-exit-count"() {
        return counts().exit;
      },
      get "data-comparison-drop-move-count"() {
        return counts().move;
      },
      id: "dropzone-route-root",
      get "aria-label"() {
        return demoProps().ariaLabel;
      },
      "aria-describedby": "dropzone-route-description",
      "aria-details": "dropzone-route-details",
      get size() {
        return demoProps().size;
      },
      get isFilled() {
        return demoProps().isFilled;
      },
      get replaceMessage() {
        return demoProps().replaceMessage || undefined;
      },
      onDropActivate: () => bump("activate"),
      onDrop: () => bump("drop"),
      onDropEnter: () => bump("enter"),
      onDropExit: () => bump("exit"),
      onDropMove: () => bump("move"),
      get children() {
        return hc(SolidSpectrumIllustratedMessage, {}, [
          h(SolidDropZoneIllustration, { slot: "illustration" }),
          h(SolidSpectrumHeading, {}, "Upload assets"),
          h(SolidSpectrumContent, {}, "Drop a PNG, SVG, or PDF."),
          h(
            "span",
            {
              id: "dropzone-route-description",
              hidden: true,
            },
            "Drop target accepts project files.",
          ),
          h(
            "span",
            {
              id: "dropzone-route-details",
              hidden: true,
            },
            "The comparison route records drag and drop callback counts.",
          ),
        ]);
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
          class: "comparison-dropzone-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedDropZone],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDropZoneDemo, {});
