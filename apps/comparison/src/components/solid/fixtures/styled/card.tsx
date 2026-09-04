import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Card as SolidSpectrumCard,
  CardPreview as SolidSpectrumCardPreview,
  Content as SolidSpectrumContent,
  Footer as SolidSpectrumFooter,
  Image as SolidSpectrumImage,
  Provider as SolidSpectrumProvider,
  Skeleton as SolidSpectrumSkeleton,
  StatusLight as SolidSpectrumStatusLight,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  cardDemoPropsFromWindow,
  normalizeCardDemoProps,
  serializeCardDemoProps,
  type CardDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/card-demo";
import { createComparisonResolvedThemeSignal, providerShellStyle } from "../styled-shared.tsx";

const cardPreviewImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%232c7be5'/%3E%3Cpath d='M0 132 82 74l68 42 62-58 108 96v26H0z' fill='%23d6e9ff' opacity='.9'/%3E%3Ccircle cx='248' cy='48' r='24' fill='%23fff3b0'/%3E%3C/svg%3E";

function SolidSpectrumCardDemo() {
  const [demoProps, setDemoProps] = createSignal<CardDemoProps>(cardDemoPropsFromWindow());
  const colorScheme = createComparisonResolvedThemeSignal();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "card") {
        setDemoProps((current) =>
          normalizeCardDemoProps({ ...current, ...(event.detail.props ?? {}) }),
        );
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          "data-comparison-control-root": "card",
          get "data-comparison-control-props"() {
            return serializeCardDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumSkeleton,
            {
              get isLoading() {
                return demoProps().skeleton;
              },
            },
            [
              hc(
                SolidSpectrumCard,
                {
                  get size() {
                    return demoProps().size;
                  },
                  get density() {
                    return demoProps().density;
                  },
                  get variant() {
                    return demoProps().variant;
                  },
                  get href() {
                    return demoProps().href || undefined;
                  },
                  get target() {
                    return demoProps().href ? "_blank" : undefined;
                  },
                  get rel() {
                    return demoProps().href ? "noreferrer" : undefined;
                  },
                  get isDisabled() {
                    return demoProps().isDisabled;
                  },
                  get textValue() {
                    return demoProps().textValue;
                  },
                  UNSAFE_style: { width: "240px" },
                },
                [
                  () => [
                    ...(demoProps().showPreview
                      ? [
                          hc(SolidSpectrumCardPreview, {}, [
                            hc(SolidSpectrumImage, { src: cardPreviewImageSrc, alt: "" }),
                          ]),
                        ]
                      : []),
                    hc(SolidSpectrumContent, {}, [
                      hc(SolidSpectrumText, { slot: "title" }, [() => demoProps().title]),
                      hc(SolidSpectrumText, { slot: "description" }, [
                        () => demoProps().description,
                      ]),
                    ]),
                    ...(demoProps().showFooter
                      ? [
                          hc(SolidSpectrumFooter, {}, [
                            hc(SolidSpectrumStatusLight, { variant: "positive" }, ["Synced"]),
                          ]),
                        ]
                      : []),
                  ],
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumCardDemo, {});
