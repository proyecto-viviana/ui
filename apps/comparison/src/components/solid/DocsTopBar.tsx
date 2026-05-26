import { createSignal, onCleanup, onMount } from "solid-js";
import h from "solid-js/h";
import { ActionButton, Keyboard, Provider } from "@proyecto-viviana/solid-spectrum";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
  type ComparisonThemeChoice,
} from "@comparison/data/theme";

export interface DocsTopBarProps {
  reactSpectrumUrl?: string;
}

export default function DocsTopBar(props: DocsTopBarProps) {
  const [themeChoice, setThemeChoice] = createSignal<ComparisonThemeChoice>("system");
  const [resolvedTheme, setResolvedTheme] = createSignal<ComparisonResolvedTheme>("light");

  onMount(() => {
    const updateFromDocument = () => {
      setThemeChoice(
        (document.body.dataset.theme as ComparisonThemeChoice | undefined) ?? "system",
      );
      setResolvedTheme(getComparisonResolvedThemeFromDocument());
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setThemeChoice((event.detail.theme as ComparisonThemeChoice | undefined) ?? "system");
        setResolvedTheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };

    updateFromDocument();
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    onCleanup(() => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange));
  });

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
