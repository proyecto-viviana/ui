import h from "solid-js/h";
import { Badge, Provider } from "@proyecto-viviana/solid-spectrum";
import {
  getComparisonEntryGroupId,
  groupComparisonEntries,
} from "@comparison/data/component-groups";
import { comparisonEntries, type ComparisonSlug } from "@comparison/data/comparison-manifest";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsSidebarProps {
  activeSlug?: string;
  navigationLabel?: string;
  referenceLabel?: string;
  referenceUrl?: string;
}

const sidebarGroups = groupComparisonEntries(comparisonEntries);

export default function DocsSidebar(props: DocsSidebarProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const activeSlug = normalizeActiveSlug(props.activeSlug);
  const activeGroupId = activeSlug ? getComparisonEntryGroupId(activeSlug) : undefined;
  const isIndexPage = activeSlug == null;
  const visualParityHref = activeSlug ? "#visual-state-coverage" : "/components/button";
  const apiCoverageHref = activeSlug ? "#api" : "/components/button#api";

  return hc(
    Provider,
    {
      class: "s2-docs-sidebar",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h("nav", { class: "s2-nav s2-nav--grouped", "aria-label": props.navigationLabel }, [
        navHeading("Overview"),
        navLink("/", "Getting started", isIndexPage),
        navHeading("Components"),
        ...sidebarGroups.map((group) =>
          h("details", { class: "s2-nav-group", open: isIndexPage || group.id === activeGroupId }, [
            h("summary", {}, [
              h("span", {}, group.title),
              h("span", { class: "s2-nav-count s2-status-badge" }, [
                hc(Badge, { variant: "neutral", fillStyle: "subtle", size: "S" }, [
                  String(group.entries.length),
                ]),
              ]),
            ]),
            h(
              "div",
              {},
              group.entries.map((item) =>
                navLink(`/components/${item.slug}`, item.title, item.slug === activeSlug),
              ),
            ),
          ]),
        ),
        navHeading("Guides"),
        navLink(visualParityHref, "Visual parity", false),
        navLink(apiCoverageHref, "API coverage", false),
        navHeading("Reference"),
        props.referenceUrl
          ? navLink(props.referenceUrl, props.referenceLabel ?? "S2 docs", false)
          : undefined,
      ]),
    ],
  )();
}

function normalizeActiveSlug(slug?: string): ComparisonSlug | undefined {
  return comparisonEntries.some((entry) => entry.slug === slug)
    ? (slug as ComparisonSlug)
    : undefined;
}

function navHeading(label: string) {
  return h("p", {}, label);
}

function navLink(href: string, label: string, isCurrent: boolean) {
  return h(
    "a",
    {
      href,
      "aria-current": isCurrent ? "page" : undefined,
    },
    label,
  );
}
