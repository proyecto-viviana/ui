import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Avatar as SolidSpectrumAvatar,
  AvatarGroup as SolidSpectrumAvatarGroup,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  avatarGroupDemoPropsFromWindow,
  avatarGroupItems,
  normalizeAvatarGroupDemoProps,
  serializeAvatarGroupDemoProps,
  type AvatarGroupDemoProps,
} from "@comparison/data/avatar-group-demo";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumAvatarGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<AvatarGroupDemoProps>(
    avatarGroupDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatargroup") {
        setDemoProps(normalizeAvatarGroupDemoProps(event.detail.props ?? {}));
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
          class: "comparison-avatar-group-row",
          "data-comparison-control-root": "avatargroup",
          get "data-comparison-control-props"() {
            return serializeAvatarGroupDemoProps(demoProps());
          },
        },
        [
          h("span", {
            id: "avatargroup-route-description",
            hidden: true,
            children: "Avatar group route description",
          }),
          h("div", {
            id: "avatargroup-route-details",
            hidden: true,
            children: "Avatar group route details",
          }),
          () =>
            hc(
              SolidSpectrumAvatarGroup,
              {
                get label() {
                  return demoProps().label || undefined;
                },
                get "aria-label"() {
                  return demoProps().ariaLabel;
                },
                "aria-describedby": "avatargroup-route-description",
                "aria-details": "avatargroup-route-details",
                get size() {
                  return Number(demoProps().size) as 16 | 20 | 24 | 28 | 32 | 36 | 40;
                },
              },
              avatarGroupItems
                .slice(0, Number(demoProps().count))
                .map((item) => h(SolidSpectrumAvatar, { alt: item.alt, src: item.src })),
            ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumAvatarGroupDemo, {});
