import h from "solid-js/h";
import { Badge, LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import { getComponentCoverage } from "@comparison/data/coverage";
import {
  comparisonEntries,
  missingOfficialComparisonEntries,
  officialComparisonEntries,
} from "@comparison/data/comparison-manifest";
import { reactSpectrumCatalogueSource } from "@comparison/data/react-spectrum-catalogue";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

const liveCount = comparisonEntries.filter((entry) => entry.priority === "live").length;
const overallCoverage = Math.round(
  comparisonEntries.reduce(
    (sum, entry) => sum + getComponentCoverage(entry, getComponentControlGroup(entry)).overall,
    0,
  ) / comparisonEntries.length,
);

export default function IndexHero() {
  const { resolvedTheme } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-index-hero",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        { class: "s2-hero", "aria-labelledby": "page-title" },
        h("h1", { id: "page-title" }, "Solid Spectrum"),
        h(
          "p",
          {},
          "A component-by-component parity harness for React Spectrum S2 and @proyecto-viviana/solid-spectrum.",
        ),
        h(
          "div",
          { class: "s2-hero-meta" },
          heroBadge(`${officialComparisonEntries.length} official S2 components`, "informative"),
          heroBadge(`${liveCount} live routes`, "positive"),
          heroBadge(`${missingOfficialComparisonEntries.length} gaps`, "notice"),
          heroBadge(`${overallCoverage}% coverage`, "neutral"),
        ),
        h(
          "div",
          { class: "s2-hero-actions" },
          hc(
            LinkButton,
            {
              href: reactSpectrumCatalogueSource.url,
              size: "M",
              variant: "secondary",
              fillStyle: "outline",
            },
            ["React Spectrum catalogue"],
          ),
        ),
      ),
    ],
  )();
}

function heroBadge(label: string, variant: "informative" | "neutral" | "notice" | "positive") {
  return h(
    "span",
    { class: "s2-status-badge" },
    hc(
      Badge,
      {
        variant,
        fillStyle: "subtle",
        size: "S",
      },
      [label],
    ),
  );
}
