import h from "@solidjs/h";
import { createMemo, createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { Button as SolidSpectrumButton } from "@proyecto-viviana/solid-spectrum/Button";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { Skeleton as SolidSpectrumSkeleton } from "@proyecto-viviana/solid-spectrum/Skeleton";
import { Text as SolidSpectrumText } from "@proyecto-viviana/solid-spectrum/Text";
import {
  iconsDemoPropsFromWindow,
  normalizeIconsDemoProps,
  serializeIconsDemoProps,
  type IconsDemoProps,
} from "@comparison/data/icons-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  createComparisonResolvedThemeSignal,
  SolidNewIcon,
  providerShellStyle,
} from "../styled-shared.tsx";

function SolidSpectrumIconsDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<IconsDemoProps>(iconsDemoPropsFromWindow());

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "icons") {
        setDemoProps(normalizeIconsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  });

  const showDecorative = createMemo(() => demoProps().showDecorative);
  const showSkeleton = createMemo(() => demoProps().showSkeleton);
  const showButtonContext = createMemo(() => demoProps().showButtonContext);
  const labelledIcon = hc(SolidNewIcon, {
    get "aria-label"() {
      return demoProps().ariaLabel;
    },
    "data-comparison-icon": "labelled",
    get "aria-hidden"() {
      return demoProps().ariaHidden || undefined;
    },
    get slot() {
      return demoProps().slot || undefined;
    },
  });
  const decorativeIcon = hc(SolidNewIcon, {
    "aria-hidden": true,
    "data-comparison-icon": "decorative",
  });
  const skeletonIcon = hc(SolidSpectrumSkeleton, { isLoading: true }, [
    hc(SolidNewIcon, {
      "aria-label": "Loading icon",
      "data-comparison-icon": "skeleton",
    }),
  ]);
  const buttonContext = hc(
    SolidSpectrumButton,
    {
      variant: "accent",
      "data-comparison-icon": "button-context",
    },
    [
      hc(SolidNewIcon, { "aria-hidden": true }),
      hc(SolidSpectrumText, {}, [() => demoProps().buttonLabel]),
    ],
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
          style: iconGalleryStyle,
          "data-comparison-control-root": "icons",
          get "data-comparison-control-props"() {
            return serializeIconsDemoProps(demoProps());
          },
        },
        [
          labelledIcon,
          () => (showDecorative() ? decorativeIcon : null),
          () => (showSkeleton() ? skeletonIcon : null),
          () => (showButtonContext() ? buttonContext : null),
        ],
      ),
    ],
  );
}

const iconGalleryStyle = {
  display: "flex",
  "align-items": "center",
  gap: "16px",
  padding: "12px",
};

export default () => h(SolidSpectrumIconsDemo, {});
