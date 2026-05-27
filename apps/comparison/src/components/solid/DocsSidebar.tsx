import h from "solid-js/h";
import {
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
  Link,
  Provider,
} from "@proyecto-viviana/solid-spectrum";
import { groupComparisonEntries } from "@comparison/data/component-groups";
import { comparisonEntries, type ComparisonSlug } from "@comparison/data/comparison-manifest";
import {
  docsNavGroup,
  docsNavGroupLinks,
  docsNavGroupLink,
  docsNavGroupPanel,
  docsNavHeading,
  docsNavLink,
  docsNavLinkCurrent,
  docsNavRoot,
  docsSidebarRoot,
  staticClassName,
} from "./chrome/styles";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsSidebarProps {
  activeSlug?: string;
  navigationLabel?: string;
  referenceLabel?: string;
  referenceUrl?: string;
}

const sidebarRootClass = staticClassName(docsSidebarRoot);
const navRootClass = staticClassName(docsNavRoot);
const navGroupClass = staticClassName(docsNavGroup);
const navGroupPanelClass = staticClassName(docsNavGroupPanel);
const navGroupLinksClass = staticClassName(docsNavGroupLinks);
const navHeadingClass = staticClassName(docsNavHeading);
const navLinkClass = staticClassName(docsNavLink);
const navLinkCurrentClass = staticClassName(docsNavLinkCurrent);
const navGroupLinkClass = staticClassName(docsNavGroupLink);
const componentGroups = groupComparisonEntries(comparisonEntries);

export default function DocsSidebar(props: DocsSidebarProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const activeSlug = normalizeActiveSlug(props.activeSlug);
  const isIndexPage = activeSlug == null;
  const visualParityHref = activeSlug ? "#visual-state-coverage" : "/components/button";
  const apiCoverageHref = activeSlug ? "#api" : "/components/button#api";

  return hc(
    Provider,
    {
      class: "s2-docs-sidebar",
      styles: sidebarRootClass,
      get colorScheme() {
        return resolvedTheme();
      },
      background: "layer-1",
    },
    [
      h(
        "nav",
        {
          class: cx("s2-nav", "s2-nav--grouped", navRootClass),
          "aria-label": props.navigationLabel,
        },
        [
          navHeading("Overview"),
          navLink("/", "Getting started", isIndexPage),
          navHeading("Components"),
          ...componentGroups.map((group, index) =>
            navDisclosureGroup(
              group,
              activeSlug,
              isIndexPage ? index === 0 : group.entries.some((entry) => entry.slug === activeSlug),
            ),
          ),
          navHeading("Guides"),
          navLink(visualParityHref, "Visual parity", false),
          navLink(apiCoverageHref, "API coverage", false),
          navHeading("Reference"),
          props.referenceUrl
            ? navLink(props.referenceUrl, props.referenceLabel ?? "S2 docs", false)
            : undefined,
        ],
      ),
    ],
  )();
}

function normalizeActiveSlug(slug?: string): ComparisonSlug | undefined {
  return comparisonEntries.some((entry) => entry.slug === slug)
    ? (slug as ComparisonSlug)
    : undefined;
}

function navHeading(label: string) {
  return h("p", { class: navHeadingClass }, label);
}

function navDisclosureGroup(
  group: (typeof componentGroups)[number],
  activeSlug: ComparisonSlug | undefined,
  defaultExpanded: boolean,
) {
  return hc(
    Disclosure,
    {
      id: group.id,
      isQuiet: true,
      density: "spacious",
      defaultExpanded,
      styles: navGroupClass,
      UNSAFE_className: "s2-nav-group",
    },
    [
      hc(DisclosureTitle, { level: 3 }, [group.title]),
      hc(
        DisclosurePanel,
        {
          styles: navGroupPanelClass,
          UNSAFE_className: "s2-nav-group-panel",
        },
        [
          h(
            "div",
            { class: cx("s2-nav-group-links", navGroupLinksClass) },
            group.entries.map((item) =>
              navLink(`/components/${item.slug}`, item.title, item.slug === activeSlug, {
                className: navGroupLinkClass,
              }),
            ),
          ),
        ],
      ),
    ],
  );
}

function navLink(
  href: string,
  label: string,
  isCurrent: boolean,
  options: { className?: string } = {},
) {
  return hc(
    Link,
    {
      href,
      variant: isCurrent ? "primary" : "secondary",
      isStandalone: true,
      isQuiet: true,
      UNSAFE_className: cx(navLinkClass, isCurrent && navLinkCurrentClass, options.className),
      "aria-current": isCurrent ? "page" : undefined,
    },
    [label],
  );
}

function cx(...classNames: Array<string | null | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}
