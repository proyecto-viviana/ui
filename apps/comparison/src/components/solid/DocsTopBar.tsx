import h from "solid-js/h";
import { ActionButton, Keyboard, Link, Provider, Text } from "@proyecto-viviana/solid-spectrum";
import { getComparisonThemeChoiceLabel } from "@comparison/data/theme";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTopBarProps {
  reactSpectrumUrl?: string;
}

export default function DocsTopBar(props: DocsTopBarProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-topbar",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      hc(
        Link,
        {
          href: "/",
          variant: "secondary",
          isStandalone: true,
          isQuiet: true,
          UNSAFE_className: "s2-brand",
          "aria-label": "Solid Spectrum home",
        },
        [
          h("span", { class: "s2-brand-mark", "aria-hidden": "true" }, "S"),
          h("span", {}, "Solid Spectrum"),
        ],
      ),
      h(
        "div",
        { class: "s2-search" },
        hc(
          ActionButton,
          {
            type: "button",
            size: "M",
            "aria-label": "Search Solid Spectrum",
          },
          [hc(Text, {}, ["Search Solid Spectrum"]), hc(Keyboard, {}, ["/"])],
        ),
      ),
      h("nav", { class: "s2-topnav", "aria-label": "Top navigation" }, [
        topNavLink("/", "Docs"),
        props.reactSpectrumUrl ? topNavLink(props.reactSpectrumUrl, "React Spectrum") : undefined,
        topNavLink("https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum", "npm"),
      ]),
      hc(
        ActionButton,
        {
          type: "button",
          size: "M",
          isQuiet: true,
          "data-theme-toggle": "",
          "aria-label": "Switch color theme",
        },
        [
          h("span", { "data-theme-toggle-icon": "" }, () =>
            getComparisonThemeChoiceLabel(themeChoice()),
          ),
        ],
      ),
    ],
  )();
}

function topNavLink(href: string, label: string) {
  return hc(
    Link,
    {
      href,
      variant: "secondary",
      isStandalone: true,
      isQuiet: true,
    },
    [label],
  );
}
