import h from "solid-js/h";
import { createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { hc } from "../../solid-h";
import {
  Image as SolidSpectrumImage,
  Provider as SolidSpectrumProvider,
  Skeleton as SolidSpectrumSkeleton,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import { imageDemoSources } from "@comparison/data/image-demo";
import {
  normalizeSkeletonDemoProps,
  serializeSkeletonDemoProps,
  skeletonDemoPropsFromWindow,
  type SkeletonDemoProps,
} from "@comparison/data/skeleton-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

const skeletonImageStyle: JSX.CSSProperties = {
  width: "128px",
  height: "96px",
  "max-width": "100%",
  "border-radius": "6px",
  "flex-shrink": 0,
  "aspect-ratio": "4 / 3",
  "object-fit": "cover",
  "object-position": "center",
};

const skeletonTitleStyle: JSX.CSSProperties = {
  "font-size": "20px",
  "line-height": "24px",
  "font-weight": 700,
  color: "rgb(34, 34, 34)",
};

const skeletonBodyStyle: JSX.CSSProperties = {
  "font-size": "14px",
  "line-height": "20px",
  color: "rgb(34, 34, 34)",
};

const skeletonMetaStyle: JSX.CSSProperties = {
  "font-size": "13px",
  "line-height": "18px",
  color: "rgb(34, 34, 34)",
};

function SolidSkeletonContent() {
  return h("div", { class: "comparison-skeleton-card" }, [
    h(SolidSpectrumImage, {
      alt: "Preview",
      src: imageDemoSources.basic,
      width: 320,
      height: 192,
      UNSAFE_style: skeletonImageStyle,
    }),
    h("div", { class: "comparison-skeleton-copy" }, [
      h(SolidSpectrumText, { UNSAFE_style: skeletonTitleStyle }, "Placeholder title"),
      h(
        SolidSpectrumText,
        { UNSAFE_style: skeletonBodyStyle },
        "This is placeholder content approximating the length of the final content.",
      ),
      h("div", { class: "comparison-skeleton-inline" }, [
        h(SolidNewIcon, {}),
        h(SolidSpectrumText, { UNSAFE_style: skeletonMetaStyle }, "Here is an icon."),
      ]),
    ]),
  ]) as unknown as JSX.Element;
}

function SolidSpectrumSkeletonDemo() {
  const [demoProps, setDemoProps] = createSignal<SkeletonDemoProps>(skeletonDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "skeleton") {
        setDemoProps(normalizeSkeletonDemoProps(event.detail.props ?? {}));
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
          class: "comparison-skeleton-row",
          "data-comparison-control-root": "skeleton",
          get "data-comparison-control-props"() {
            return serializeSkeletonDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumSkeleton,
            {
              get isLoading() {
                return demoProps().isLoading;
              },
            },
            [h(SolidSkeletonContent, {})],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumSkeletonDemo, {});
