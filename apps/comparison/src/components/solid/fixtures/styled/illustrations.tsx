import h from "@solidjs/h";
import { createMemo, createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { Skeleton as SolidSpectrumSkeleton } from "@proyecto-viviana/solid-spectrum/Skeleton";
import {
  illustrationsDemoPropsFromWindow,
  normalizeIllustrationsDemoProps,
  serializeIllustrationsDemoProps,
  type IllustrationsDemoProps,
} from "@comparison/data/illustrations-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  createComparisonResolvedThemeSignal,
  SolidPlanIllustration,
  SolidDropZoneIllustration,
  SolidIllustratedMessageIllustration,
  providerShellStyle,
} from "../styled-shared.tsx";

function SolidSpectrumIllustrationsDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<IllustrationsDemoProps>(
    illustrationsDemoPropsFromWindow(),
  );

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustrations") {
        setDemoProps(normalizeIllustrationsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  });

  const renderedIllustrations = createMemo(() => {
    const props = demoProps();
    const labelledIllustrationProps = {
      "aria-label": props.ariaLabel,
      size: props.size,
      "data-comparison-illustration": "labelled",
      ...(props.ariaHidden ? { "aria-hidden": true } : {}),
      ...(props.slot ? { slot: props.slot } : {}),
    };
    const illustrations: Array<ReturnType<typeof h> | ReturnType<typeof hc>> = [
      h(SolidPlanIllustration, labelledIllustrationProps),
    ];

    if (props.showDecorative) {
      illustrations.push(
        h(SolidDropZoneIllustration, {
          "aria-hidden": true,
          size: props.decorativeSize,
          "data-comparison-illustration": "decorative",
        }),
      );
    }
    if (props.showSkeleton) {
      illustrations.push(
        hc(SolidSpectrumSkeleton, { isLoading: true }, [
          h(SolidIllustratedMessageIllustration, {
            "aria-label": "Loading illustration",
            size: props.skeletonSize,
            "data-comparison-illustration": "skeleton",
          }),
        ]),
      );
    }

    return illustrations;
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
          style: illustrationGalleryStyle,
          "data-comparison-control-root": "illustrations",
          get "data-comparison-control-props"() {
            return serializeIllustrationsDemoProps(demoProps());
          },
        },
        [renderedIllustrations],
      ),
    ],
  );
}

const illustrationGalleryStyle = {
  display: "flex",
  "align-items": "center",
  gap: "24px",
  padding: "12px",
};

export default () => h(SolidSpectrumIllustrationsDemo, {});
