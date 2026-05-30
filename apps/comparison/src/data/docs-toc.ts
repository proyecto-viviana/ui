import {
  layerOrder,
  type ComparisonEntry,
  type ComparisonLayerId,
} from "@comparison/data/comparison-manifest";

export type DocsTocVariant = "index" | "component" | "page";

export interface DocsTocItem {
  href: string;
  label: string;
  // Heading depth (2 = H2, 3 = H3). Used to indent nested entries in the rail
  // to mirror upstream's "On this page" nesting. Optional; defaults to flat.
  depth?: number;
}

const layerTitles: Record<ComparisonLayerId, string> = {
  styled: "Styled Layer",
  components: "Component Layer",
  headless: "Headless Layer",
  state: "State Layer",
};

export function parseTocItems(serialized: string | undefined): DocsTocItem[] | undefined {
  if (!serialized) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) {
      return undefined;
    }

    return parsed.filter(
      (item): item is DocsTocItem =>
        typeof item === "object" &&
        item != null &&
        typeof (item as DocsTocItem).href === "string" &&
        typeof (item as DocsTocItem).label === "string",
    );
  } catch {
    return undefined;
  }
}

export function getDocsTocItems(props: {
  entry?: ComparisonEntry;
  items?: DocsTocItem[];
  variant: DocsTocVariant;
}): DocsTocItem[] {
  if (props.variant === "page") {
    return props.items ?? [];
  }

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
