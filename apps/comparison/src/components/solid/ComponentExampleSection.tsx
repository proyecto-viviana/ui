import h from "solid-js/h";
import { Provider } from "@proyecto-viviana/solid-spectrum";
import ComponentExampleControls from "./ComponentExampleControls";
import ComponentExamplePreview from "./ComponentExamplePreview";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface ComponentExampleSectionProps {
  slug: string;
}

export default function ComponentExampleSection(props: ComponentExampleSectionProps) {
  const { resolvedTheme } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-component-example-section",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        {
          class: "s2-example",
          id: "example",
          "aria-labelledby": "example-title",
        },
        h(
          "div",
          { class: "s2-example-preview", role: "group", "aria-label": "Rendered comparison" },
          h(ComponentExamplePreview, { slug: props.slug }),
        ),
        h(
          "div",
          { class: "s2-example-controls", role: "group", "aria-label": "Controls" },
          h(ComponentExampleControls, { slug: props.slug }),
        ),
      ),
    ],
  )();
}
