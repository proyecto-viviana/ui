import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Avatar as SolidSpectrumAvatar,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  avatarDemoPropsFromWindow,
  normalizeAvatarDemoProps,
  serializeAvatarDemoProps,
  type AvatarDemoProps,
} from "@comparison/data/avatar-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumAvatarDemo() {
  const [demoProps, setDemoProps] = createSignal<AvatarDemoProps>(avatarDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatar") {
        setDemoProps(normalizeAvatarDemoProps(event.detail.props ?? {}));
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
          class: "comparison-avatar-row",
          get "data-comparison-avatar-over-background"() {
            return demoProps().isOverBackground ? "true" : "false";
          },
          "data-comparison-control-root": "avatar",
          get "data-comparison-control-props"() {
            return serializeAvatarDemoProps(demoProps());
          },
        },
        [
          () =>
            h(SolidSpectrumAvatar, {
              get alt() {
                return demoProps().alt;
              },
              get src() {
                return demoProps().src || undefined;
              },
              get size() {
                return Number(demoProps().size);
              },
              get isOverBackground() {
                return demoProps().isOverBackground;
              },
            }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumAvatarDemo, {});
