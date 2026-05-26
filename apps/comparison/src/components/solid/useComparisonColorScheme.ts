import { createSignal, onCleanup, onMount } from "solid-js";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
  type ComparisonThemeChoice,
} from "@comparison/data/theme";

export function createComparisonColorScheme() {
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

  return { resolvedTheme, themeChoice };
}
