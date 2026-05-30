import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { Divider, Link, Provider } from "@proyecto-viviana/solid-spectrum";
import { getComparisonEntry } from "@comparison/data/comparison-manifest";
import { getDocsTocItems, type DocsTocItem, type DocsTocVariant } from "@comparison/data/docs-toc";
import {
  docsTocActions,
  docsTocDivider,
  docsTocHeading,
  docsTocIndicator,
  docsTocIndicatorCurrent,
  docsTocLink,
  docsTocLinkCurrent,
  docsTocLinkText,
  docsTocList,
  docsTocListItem,
  docsTocNav,
  docsTocRoot,
  docsTocScroller,
  staticClassName,
} from "./chrome/styles";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTocProps {
  items?: DocsTocItem[];
  sourceLabel?: string;
  sourceUrl?: string;
  slug?: string;
  variant: DocsTocVariant;
}

const tocRootClass = staticClassName(docsTocRoot);
const tocActionsClass = staticClassName(docsTocActions);
const tocDividerClass = staticClassName(docsTocDivider);
const tocHeadingClass = staticClassName(docsTocHeading);
const tocIndicatorClass = staticClassName(docsTocIndicator);
const tocIndicatorCurrentClass = staticClassName(docsTocIndicatorCurrent);
const tocLinkClass = staticClassName(docsTocLink);
const tocLinkCurrentClass = staticClassName(docsTocLinkCurrent);
const tocLinkTextClass = staticClassName(docsTocLinkText);
const tocListClass = staticClassName(docsTocList);
const tocListItemClass = staticClassName(docsTocListItem);
const tocNavClass = staticClassName(docsTocNav);
const tocScrollerClass = staticClassName(docsTocScroller);

export default function DocsToc(props: DocsTocProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const items = getTocItems(props);
  const currentHref = createCurrentHref(items);
  const [maskImage, setMaskImage] = createSignal<string | undefined>();
  let scrollElement: HTMLDivElement | undefined;

  const updateMasks = () => {
    if (!scrollElement) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const topMaskSize = Math.min(scrollTop, 32);
    const bottomMaskSize = Math.min(scrollHeight - scrollTop - clientHeight, 32);

    if (topMaskSize <= 0 && bottomMaskSize <= 0) {
      setMaskImage(undefined);
      return;
    }

    const parts: string[] = [];
    if (topMaskSize > 0) {
      parts.push("transparent 0px", `black ${topMaskSize}px`);
    } else {
      parts.push("black 0px");
    }

    if (bottomMaskSize > 0) {
      parts.push(`black calc(100% - ${bottomMaskSize}px)`, "transparent 100%");
    } else {
      parts.push("black 100%");
    }

    setMaskImage(`linear-gradient(to bottom, ${parts.join(", ")})`);
  };

  onMount(() => {
    updateMasks();
    requestAnimationFrame(updateMasks);
  });

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
      h("div", { class: tocHeadingClass }, "On this page"),
      h(
        "div",
        {
          class: tocScrollerClass,
          ref: (element: HTMLDivElement) => {
            scrollElement = element;
          },
          onScroll: updateMasks,
          get style() {
            const mask = maskImage();
            return mask
              ? {
                  "mask-image": mask,
                  "-webkit-mask-image": mask,
                }
              : undefined;
          },
        },
        h(
          "nav",
          { class: tocNavClass, "aria-label": "On this page" },
          h(
            "ul",
            { class: tocListClass },
            items.map((item) =>
              h(
                "li",
                {
                  class: tocListItemClass,
                  style:
                    item.depth && item.depth > 2
                      ? `padding-inline-start: ${(item.depth - 2) * 12}px`
                      : undefined,
                },
                [
                  hc(
                    Link,
                    {
                      href: item.href,
                      variant: "secondary",
                      isStandalone: true,
                      isQuiet: true,
                      get UNSAFE_className() {
                        return cx(tocLinkClass, currentHref() === item.href && tocLinkCurrentClass);
                      },
                      get "aria-current"() {
                        return currentHref() === item.href ? "page" : undefined;
                      },
                    },
                    [
                      h("span", {
                        "aria-hidden": "true",
                        get class() {
                          return cx(
                            tocIndicatorClass,
                            currentHref() === item.href && tocIndicatorCurrentClass,
                          );
                        },
                      }),
                      h("span", { class: tocLinkTextClass }, item.label),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      props.sourceUrl
        ? h("div", { class: tocActionsClass }, [
            hc(Divider, { size: "S", styles: tocDividerClass }),
            hc(
              Link,
              {
                href: props.sourceUrl,
                variant: "secondary",
                isStandalone: true,
                isQuiet: true,
                UNSAFE_className: tocLinkClass,
              },
              [
                h("span", { "aria-hidden": "true", class: tocIndicatorClass }),
                h("span", { class: tocLinkTextClass }, props.sourceLabel ?? "S2 source"),
              ],
            ),
          ])
        : undefined,
    ],
  )();
}

function createCurrentHref(items: DocsTocItem[]) {
  const [currentHref, setCurrentHref] = createSignal(items[0]?.href ?? "");

  onMount(() => {
    const anchors = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((element): element is HTMLElement => element != null);

    if (!anchors.length || !("IntersectionObserver" in window)) {
      return;
    }

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }

        const firstVisible = anchors.find((element) => visible.has(element));
        if (firstVisible?.id) {
          setCurrentHref(`#${firstVisible.id}`);
        }
      },
      {
        root: document.querySelector(".s2-main"),
        rootMargin: "0px 0px -50% 0px",
      },
    );

    for (const anchor of anchors) {
      observer.observe(anchor);
    }

    onCleanup(() => observer.disconnect());
  });

  return currentHref;
}

function getTocItems(props: DocsTocProps): DocsTocItem[] {
  return getDocsTocItems({
    entry: props.slug ? getComparisonEntry(props.slug) : undefined,
    items: props.items,
    variant: props.variant,
  });
}

function cx(...classNames: Array<string | null | undefined | false>): string {
  return classNames.filter(Boolean).join(" ");
}
