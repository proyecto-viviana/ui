import h from "solid-js/h";
import { createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { hc } from "../../solid-h";
import {
  Image as SolidSpectrumImage,
  ImageCoordinator as SolidSpectrumImageCoordinator,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  imageDemoPropsFromWindow,
  imageMissingSource,
  imageDemoSources,
  normalizeImageDemoProps,
  serializeImageDemoProps,
  type ImageDemoProps,
  type ImageObjectFit,
} from "@comparison/data/image-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function imageFrameStyle(objectFit: ImageObjectFit): JSX.CSSProperties {
  return {
    width: "160px",
    height: "96px",
    "max-width": "100%",
    "border-radius": "6px",
    "object-fit": objectFit,
    "object-position": "center",
  };
}

function imageSourceForDemo(demoProps: ImageDemoProps) {
  if (demoProps.sourceMode === "conditional") {
    return [
      { colorScheme: "light" as const, srcSet: imageDemoSources.light },
      {
        colorScheme: "dark" as const,
        srcSet: imageDemoSources.dark,
        media: "(min-width: 1px)",
      },
    ];
  }

  if (demoProps.sourceMode === "error") {
    return imageMissingSource;
  }

  return imageDemoSources.basic;
}

function SolidImageError() {
  return h("div", { class: "comparison-image-error" }, "Error loading image");
}

function SolidSpectrumImageDemo() {
  const [demoProps, setDemoProps] = createSignal<ImageDemoProps>(imageDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "image") {
        setDemoProps(normalizeImageDemoProps(event.detail.props ?? {}));
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

  const image = () => {
    const props = demoProps();
    if (props.sourceMode === "coordinator") {
      return hc(SolidSpectrumImageCoordinator, {}, [
        h("div", { class: "comparison-image-coordinator-grid" }, [
          h(SolidSpectrumImage, {
            alt: `${props.alt} one`,
            src: imageDemoSources.first,
            UNSAFE_style: imageFrameStyle(props.objectFit),
          }),
          h(SolidSpectrumImage, {
            alt: `${props.alt} two`,
            src: imageDemoSources.second,
            UNSAFE_style: imageFrameStyle(props.objectFit),
          }),
        ]),
      ]);
    }

    return h(SolidSpectrumImage, {
      alt: props.alt,
      src: imageSourceForDemo(props),
      UNSAFE_style: imageFrameStyle(props.objectFit),
      renderError: props.sourceMode === "error" ? SolidImageError : undefined,
    });
  };

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
          class: "comparison-image-row",
          "data-comparison-control-root": "image",
          get "data-comparison-control-props"() {
            return serializeImageDemoProps(demoProps());
          },
        },
        [image],
      ),
    ],
  );
}

export default () => h(SolidSpectrumImageDemo, {});
