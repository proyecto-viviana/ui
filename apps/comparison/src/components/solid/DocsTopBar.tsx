import h from "solid-js/h";
import { ActionButton, Keyboard, Link, Provider, Text } from "@proyecto-viviana/solid-spectrum";
import { getComparisonThemeChoiceLabel } from "@comparison/data/theme";
import {
  docsBrandLink,
  docsBrandMark,
  docsSearchButton,
  docsSearchRoot,
  docsTopBarRoot,
  docsTopNavLink,
  docsTopNavRoot,
  staticClassName,
} from "./chrome/styles";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTopBarProps {
  reactSpectrumUrl?: string;
}

const topBarRootClass = staticClassName(docsTopBarRoot);
const brandLinkClass = staticClassName(docsBrandLink);
const brandMarkClass = staticClassName(docsBrandMark);
const searchButtonClass = staticClassName(docsSearchButton);
const searchRootClass = staticClassName(docsSearchRoot);
const topNavRootClass = staticClassName(docsTopNavRoot);
const topNavLinkClass = staticClassName(docsTopNavLink);

export default function DocsTopBar(props: DocsTopBarProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-topbar",
      styles: topBarRootClass,
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
          UNSAFE_className: brandLinkClass,
          "aria-label": "Solid Spectrum home",
        },
        [
          h("span", { class: brandMarkClass, "aria-hidden": "true" }, "S"),
          h("span", {}, "Solid Spectrum"),
        ],
      ),
      h(
        "div",
        { class: searchRootClass },
        hc(
          ActionButton,
          {
            type: "button",
            size: "M",
            styles: searchButtonClass,
            "aria-label": "Search Solid Spectrum",
          },
          [hc(Text, {}, ["Search Solid Spectrum"]), hc(Keyboard, {}, ["/"])],
        ),
      ),
      h("nav", { class: topNavRootClass, "aria-label": "Top navigation" }, [
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
      UNSAFE_className: topNavLinkClass,
    },
    [label],
  );
}
