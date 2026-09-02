import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Badge as SolidSpectrumBadge,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  badgeDemoPropsFromWindow,
  normalizeBadgeDemoProps,
  serializeBadgeDemoProps,
  type BadgeDemoProps,
} from "@comparison/data/badge-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

function solidBadgeChildren(props: BadgeDemoProps) {
  if (props.iconPlacement === "start") {
    return [
      () => [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, props.children)],
    ];
  }

  return [props.children];
}

function SolidSpectrumBadgeDemo() {
  const [demoProps, setDemoProps] = createSignal<BadgeDemoProps>(badgeDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "badge") {
        setDemoProps(normalizeBadgeDemoProps(event.detail.props ?? {}));
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

  const renderedBadge = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumBadge,
      {
        "data-comparison-control-root": "badge",
        "data-comparison-control-props": serializeBadgeDemoProps(props),
        id: "badge-route-root",
        "aria-label": "Badge route label",
        "aria-labelledby": "badge-route-labelledby",
        "aria-describedby": "badge-route-description",
        "aria-details": "badge-route-details",
        hidden: true,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        overflowMode: props.overflowMode,
      },
      solidBadgeChildren(props),
    );
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
          class: "comparison-badge-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedBadge],
      ),
    ],
  );
}

export default () => h(SolidSpectrumBadgeDemo, {});
