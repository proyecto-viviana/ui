import h from "solid-js/h";
import { Link, LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
import {
  getComparisonEntry,
  layerOrder,
  type ComparisonLayerId,
} from "@comparison/data/comparison-manifest";
import {
  docsTocActions,
  docsTocHeading,
  docsTocLink,
  docsTocNav,
  docsTocRoot,
  staticClassName,
} from "./chrome/styles";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

type DocsTocVariant = "index" | "component";

interface DocsTocItem {
  href: string;
  label: string;
}

export interface DocsTocProps {
  sourceLabel?: string;
  sourceUrl?: string;
  slug?: string;
  variant: DocsTocVariant;
}

const layerTitles: Record<ComparisonLayerId, string> = {
  styled: "Styled Layer",
  components: "Component Layer",
  headless: "Headless Layer",
  state: "State Layer",
};
const tocRootClass = staticClassName(docsTocRoot);
const tocActionsClass = staticClassName(docsTocActions);
const tocHeadingClass = staticClassName(docsTocHeading);
const tocLinkClass = staticClassName(docsTocLink);
const tocNavClass = staticClassName(docsTocNav);

export default function DocsToc(props: DocsTocProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const items = getTocItems(props);

  return hc(
    Provider,
    {
      class: "s2-docs-toc",
      styles: tocRootClass,
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h("nav", { class: tocNavClass, "aria-label": "On this page" }, [
        h("p", { class: tocHeadingClass }, "On this page"),
        ...items.map((item) =>
          hc(
            Link,
            {
              href: item.href,
              variant: "secondary",
              isStandalone: true,
              isQuiet: true,
              UNSAFE_className: tocLinkClass,
            },
            [item.label],
          ),
        ),
        props.sourceUrl
          ? h(
              "div",
              { class: tocActionsClass },
              hc(
                LinkButton,
                {
                  href: props.sourceUrl,
                  size: "S",
                  variant: "secondary",
                  fillStyle: "outline",
                },
                [props.sourceLabel ?? "S2 source"],
              ),
            )
          : undefined,
      ]),
    ],
  )();
}

function getTocItems(props: DocsTocProps): DocsTocItem[] {
  if (props.variant !== "component") {
    return [
      { href: "#page-title", label: "Solid Spectrum" },
      { href: "#coverage-title", label: "Catalogue controls" },
      { href: "#components-title", label: "Components" },
    ];
  }

  const entry = props.slug ? getComparisonEntry(props.slug) : undefined;

  if (!entry) {
    return [{ href: "#page-title", label: "Component" }];
  }

  return [
    { href: "#page-title", label: entry.title },
    { href: "#example", label: "Example" },
    { href: "#coverage", label: "Coverage" },
    { href: "#visual-state-coverage", label: "Visual State Coverage" },
    { href: "#api", label: "API" },
    ...layerOrder
      .filter((layer) => layer !== "styled")
      .map((layer) => ({ href: `#${layer}`, label: layerTitles[layer] })),
  ];
}
