import type { ComparisonLayerId, ComparisonSlug } from "./comparison-manifest";

export const comparisonContractVersion = "spectrum-reference-v1";

export type ComparisonFramework = "react" | "solid";
export type ComparisonReferenceKind =
  | "react-spectrum"
  | "solid-spectrum"
  | "react-aria-components"
  | "solidaria-components"
  | "react-aria"
  | "solidaria"
  | "state"
  | "unwired";

export interface ComparisonReferenceInput {
  componentSlug: ComparisonSlug;
  framework: ComparisonFramework;
  layer: ComparisonLayerId;
  reference: ComparisonReferenceKind;
}

export const comparisonTabItems = [
  {
    id: "overview",
    label: "Overview",
    content: "Tabs organize related sections behind one labelled tab list.",
  },
  {
    id: "parity",
    label: "Parity",
    content: "Static and dynamic collection composition now share one route contract.",
  },
  {
    id: "testing",
    label: "Testing",
    content: "The page is a Playwright target for selection, keyboard, and style contracts.",
  },
] as const;

export const comparisonSelectItems = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
  { id: "charlie", label: "Charlie" },
] as const;

export const comparisonActionItems = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "underline", label: "Underline" },
] as const;

const nativeSolidSpectrumStyledSlugs = new Set<ComparisonSlug>([
  "provider",
  "button",
  "actionbutton",
  "actionbuttongroup",
  "buttongroup",
  "togglebutton",
  "tabs",
]);

export function getComparisonReferenceKind(
  framework: ComparisonFramework,
  layer: ComparisonLayerId,
  componentSlug: ComparisonSlug,
): ComparisonReferenceKind {
  if (layer === "styled") {
    if (framework === "react") {
      return "react-spectrum";
    }

    return nativeSolidSpectrumStyledSlugs.has(componentSlug) ? "solid-spectrum" : "unwired";
  }

  if (layer === "components") {
    return framework === "react" ? "react-aria-components" : "solidaria-components";
  }

  if (layer === "headless") {
    return framework === "react" ? "react-aria" : "solidaria";
  }

  return "state";
}

export function comparisonReferenceDataset(input: ComparisonReferenceInput) {
  return {
    "data-comparison-contract": comparisonContractVersion,
    "data-comparison-component": input.componentSlug,
    "data-comparison-framework": input.framework,
    "data-comparison-layer": input.layer,
    "data-comparison-reference": input.reference,
  };
}
