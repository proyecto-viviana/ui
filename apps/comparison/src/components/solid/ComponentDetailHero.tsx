import h from "solid-js/h";
import { Provider } from "@proyecto-viviana/solid-spectrum";
import { getComparisonEntry } from "@comparison/data/comparison-manifest";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface ComponentDetailHeroProps {
  slug: string;
}

export default function ComponentDetailHero(props: ComponentDetailHeroProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("section", { class: "s2-hero", "aria-labelledby": "page-title" }, [
      h("h1", { id: "page-title" }, "Component"),
      h("p", {}, "Component metadata is unavailable."),
    ])();
  }

  return hc(
    Provider,
    {
      class: "s2-component-detail-hero",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        { class: "s2-hero", "aria-labelledby": "page-title" },
        h("h1", { id: "page-title" }, entry.title),
        h("p", {}, entry.summary),
      ),
    ],
  )();
}
