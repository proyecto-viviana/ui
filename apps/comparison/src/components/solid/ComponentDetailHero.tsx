import h from "solid-js/h";
import { Badge, LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import { getComponentCoverage } from "@comparison/data/coverage";
import {
  getComparisonEntry,
  type ComponentStatus,
  type ParityStatus,
} from "@comparison/data/comparison-manifest";
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

  const coverage = getComponentCoverage(entry, getComponentControlGroup(entry));

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
        h(
          "div",
          { class: "s2-hero-meta" },
          heroBadge(entry.parity, parityVariant(entry.parity)),
          heroBadge(entry.componentStatus, componentStatusVariant(entry.componentStatus)),
          heroBadge(`${coverage.overall}% coverage`, "informative"),
        ),
        entry.docsUrl
          ? h(
              "div",
              { class: "s2-hero-actions" },
              hc(
                LinkButton,
                {
                  href: entry.docsUrl,
                  size: "M",
                  variant: "secondary",
                  fillStyle: "outline",
                },
                ["React Spectrum docs"],
              ),
            )
          : undefined,
      ),
    ],
  )();
}

function heroBadge(label: string, variant: "positive" | "notice" | "negative" | "informative") {
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

function parityVariant(status: ParityStatus) {
  if (status === "matched") {
    return "positive";
  }
  if (status === "partial") {
    return "notice";
  }
  return "negative";
}

function componentStatusVariant(status: ComponentStatus) {
  if (status === "parity") {
    return "positive";
  }
  if (status === "composition") {
    return "notice";
  }
  return "negative";
}
