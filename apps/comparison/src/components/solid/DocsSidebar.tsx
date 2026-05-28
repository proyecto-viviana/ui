import h from "solid-js/h";
import {
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
  Provider,
} from "@proyecto-viviana/solid-spectrum";
import { comparisonEntries, type ComparisonSlug } from "@comparison/data/comparison-manifest";
import {
  docsNavIndicator,
  docsNavIndicatorCurrent,
  docsNavItem,
  docsNavLink,
  docsNavLinkCurrent,
  docsNavLinkText,
  docsNavList,
  docsNavRoot,
  docsNavSection,
  docsNavSectionPanel,
  docsNavSectionPanelInner,
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
const navSectionClass = staticClassName(docsNavSection);
const navSectionPanelClass = staticClassName(docsNavSectionPanel);
const navSectionPanelInnerClass = staticClassName(docsNavSectionPanelInner);
const navListClass = staticClassName(docsNavList);
const navItemClass = staticClassName(docsNavItem);
const navLinkClass = staticClassName(docsNavLink);
const navLinkCurrentClass = staticClassName(docsNavLinkCurrent);
const navLinkTextClass = staticClassName(docsNavLinkText);
const navIndicatorClass = staticClassName(docsNavIndicator);
const navIndicatorCurrentClass = staticClassName(docsNavIndicatorCurrent);

export default function DocsSidebar(props: DocsSidebarProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const activeSlug = normalizeActiveSlug(props.activeSlug);

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
          class: cx("s2-nav", navRootClass),
          "aria-label": props.navigationLabel ?? "Documentation",
        },
        [navComponentsSection(activeSlug)],
      ),
    ],
  )();
}

function normalizeActiveSlug(slug?: string): ComparisonSlug | undefined {
  return comparisonEntries.some((entry) => entry.slug === slug)
    ? (slug as ComparisonSlug)
    : undefined;
}

function navComponentsSection(activeSlug: ComparisonSlug | undefined) {
  return hc(
    Disclosure,
    {
      id: "components",
      isQuiet: true,
      density: "spacious",
      defaultExpanded: true,
      styles: navSectionClass,
      UNSAFE_className: "s2-nav-section",
    },
    [
      hc(DisclosureTitle, { level: 3 }, ["Components"]),
      hc(
        DisclosurePanel,
        {
          styles: navSectionPanelClass,
          UNSAFE_className: "s2-nav-section-panel",
        },
        [
          h(
            "div",
            { class: navSectionPanelInnerClass },
            h(
              "ul",
              { class: cx("s2-nav-list", navListClass) },
              comparisonEntries.map((item) =>
                h("li", { class: navItemClass }, navLink(item, item.slug === activeSlug)),
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function navLink(item: (typeof comparisonEntries)[number], isCurrent: boolean) {
  return h(
    "a",
    {
      href: `/components/${item.slug}`,
      class: cx("s2-nav-link", navLinkClass, isCurrent && navLinkCurrentClass),
      "aria-current": isCurrent ? "page" : undefined,
    },
    [
      h("span", {
        "aria-hidden": "true",
        class: cx(
          "s2-nav-link-indicator",
          navIndicatorClass,
          isCurrent && navIndicatorCurrentClass,
        ),
      }),
      h("span", { class: navLinkTextClass }, item.title),
    ],
  );
}

function cx(...classNames: Array<string | null | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}
