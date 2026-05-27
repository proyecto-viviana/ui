import {
  layerOrder,
  type ComparisonEntry,
  type ComparisonLayerId,
} from "@comparison/data/comparison-manifest";

export type DocsTocVariant = "index" | "component";

export interface DocsTocItem {
  href: string;
  label: string;
}

const layerTitles: Record<ComparisonLayerId, string> = {
  styled: "Styled Layer",
  components: "Component Layer",
  headless: "Headless Layer",
  state: "State Layer",
};

export function getDocsTocItems(props: {
  entry?: ComparisonEntry;
  variant: DocsTocVariant;
}): DocsTocItem[] {
  if (props.variant !== "component") {
    return [
      { href: "#page-title", label: "Solid Spectrum" },
      { href: "#coverage-title", label: "Catalogue controls" },
      { href: "#components-title", label: "Components" },
    ];
  }

  if (!props.entry) {
    return [{ href: "#page-title", label: "Component" }];
  }

  return [
    { href: "#page-title", label: props.entry.title },
    { href: "#example", label: "Example" },
    { href: "#coverage", label: "Coverage" },
    { href: "#visual-state-coverage", label: "Visual State Coverage" },
    { href: "#api", label: "API" },
    ...layerOrder
      .filter((layer) => layer !== "styled")
      .map((layer) => ({ href: `#${layer}`, label: layerTitles[layer] })),
  ];
}
