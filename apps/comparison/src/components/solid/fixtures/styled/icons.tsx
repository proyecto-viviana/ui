import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  Provider as SolidSpectrumProvider,
  Skeleton as SolidSpectrumSkeleton,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
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

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "icons") {
        setDemoProps(normalizeIconsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedIcons = createMemo(() => {
    const props = demoProps();
    const labelledIconProps = {
      "aria-label": props.ariaLabel,
      "data-comparison-icon": "labelled",
      ...(props.ariaHidden ? { "aria-hidden": true } : {}),
      ...(props.slot ? { slot: props.slot } : {}),
    };
    const icons = [h(SolidNewIcon, labelledIconProps)];

    if (props.showDecorative) {
      icons.push(
        h(SolidNewIcon, {
          "aria-hidden": true,
          "data-comparison-icon": "decorative",
        }),
      );
    }
    if (props.showSkeleton) {
      icons.push(
        hc(SolidSpectrumSkeleton, { isLoading: true }, [
          h(SolidNewIcon, {
            "aria-label": "Loading icon",
            "data-comparison-icon": "skeleton",
          }),
        ]),
      );
    }
    if (props.showButtonContext) {
      icons.push(
        hc(
          SolidSpectrumButton,
          {
            variant: "accent",
            "data-comparison-icon": "button-context",
          },
          [h(SolidNewIcon, { "aria-hidden": true }), h(SolidSpectrumText, {}, props.buttonLabel)],
        ),
      );
    }

    return icons;
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
          style: iconGalleryStyle,
          "data-comparison-control-root": "icons",
          get "data-comparison-control-props"() {
            return serializeIconsDemoProps(demoProps());
          },
        },
        [renderedIcons],
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
