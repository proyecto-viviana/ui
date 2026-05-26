import h from "solid-js/h";
import { ActionButton, Keyboard, Provider } from "@proyecto-viviana/solid-spectrum";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTopBarProps {
  reactSpectrumUrl?: string;
}

export default function DocsTopBar(props: DocsTopBarProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();

  return h(
    Provider,
    {
      class: "s2-topbar",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    h(
      "a",
      { href: "/", class: "s2-brand", "aria-label": "Solid Spectrum home" },
      h("span", { class: "s2-brand-mark", "aria-hidden": "true" }, "S"),
      h("span", {}, "Solid Spectrum"),
    ),
    h(
      "div",
      { class: "s2-search" },
      h(
        ActionButton,
        {
          type: "button",
          size: "M",
          isQuiet: true,
          "aria-label": "Search Solid Spectrum",
        },
        "Search Solid Spectrum",
      ),
      h(Keyboard, {}, "/"),
    ),
    h("nav", { class: "s2-topnav", "aria-label": "Top navigation" }, [
      h("a", { href: "/" }, "Docs"),
      props.reactSpectrumUrl
        ? h("a", { href: props.reactSpectrumUrl }, "React Spectrum")
        : undefined,
      h("a", { href: "https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum" }, "npm"),
    ]),
    h(
      ActionButton,
      {
        type: "button",
        size: "M",
        isQuiet: true,
        "data-theme-toggle": "",
        "aria-label": "Switch color theme",
      },
      h("span", { "data-theme-toggle-icon": "" }, () => themeChoice()),
    ),
  )();
}
