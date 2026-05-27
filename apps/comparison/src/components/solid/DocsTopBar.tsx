import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import h from "solid-js/h";
import {
  ActionButton,
  CloseIcon,
  ContrastIcon,
  Divider,
  Keyboard,
  LightenIcon,
  Link,
  MenuHamburgerIcon,
  Picker,
  Provider,
  SearchField,
  SearchIcon,
} from "@proyecto-viviana/solid-spectrum";
import {
  comparisonEntries,
  getComparisonEntry,
  type ComparisonEntry,
} from "@comparison/data/comparison-manifest";
import { getDocsTocItems, type DocsTocItem, type DocsTocVariant } from "@comparison/data/docs-toc";
import { getComparisonThemeChoiceLabel } from "@comparison/data/theme";
import {
  docsBrandLink,
  docsBrandMark,
  docsBrandText,
  docsMobileNavButton,
  docsMobileNavHeader,
  docsMobileNavOverlay,
  docsMobileNavPanel,
  docsMobileNavTitle,
  docsMobileTocPicker,
  docsMobileTocRoot,
  docsSearchButton,
  docsSearchDialog,
  docsSearchDialogField,
  docsSearchDialogHeader,
  docsSearchDialogTitle,
  docsSearchEmpty,
  docsSearchIcon,
  docsSearchKeyboard,
  docsSearchOverlay,
  docsSearchResultLink,
  docsSearchResultMeta,
  docsSearchResultTitle,
  docsSearchResults,
  docsSearchRoot,
  docsShellIcon,
  docsShellThemeToggle,
  docsTopActionsRoot,
  docsTopBarRoot,
  docsTopDivider,
  docsTopNavLink,
  docsTopNavRoot,
  staticClassName,
} from "./chrome/styles";
import DocsSidebar from "./DocsSidebar";
import { hc, renderProp } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTopBarProps {
  activeSlug?: string;
  navigationLabel?: string;
  reactSpectrumUrl?: string;
  referenceLabel?: string;
  referenceUrl?: string;
  tocSlug?: string;
  tocVariant?: DocsTocVariant;
}

const topBarRootClass = staticClassName(docsTopBarRoot);
const brandLinkClass = staticClassName(docsBrandLink);
const brandMarkClass = staticClassName(docsBrandMark);
const brandTextClass = staticClassName(docsBrandText);
const mobileNavButtonClass = staticClassName(docsMobileNavButton);
const mobileNavOverlayClass = staticClassName(docsMobileNavOverlay);
const mobileNavPanelClass = staticClassName(docsMobileNavPanel);
const mobileNavHeaderClass = staticClassName(docsMobileNavHeader);
const mobileNavTitleClass = staticClassName(docsMobileNavTitle);
const mobileTocPickerClass = staticClassName(docsMobileTocPicker);
const mobileTocRootClass = staticClassName(docsMobileTocRoot);
const searchButtonClass = staticClassName(docsSearchButton);
const searchDialogClass = staticClassName(docsSearchDialog);
const searchDialogFieldClass = staticClassName(docsSearchDialogField);
const searchDialogHeaderClass = staticClassName(docsSearchDialogHeader);
const searchDialogTitleClass = staticClassName(docsSearchDialogTitle);
const searchEmptyClass = staticClassName(docsSearchEmpty);
const searchIconClass = staticClassName(docsSearchIcon);
const searchKeyboardClass = staticClassName(docsSearchKeyboard);
const searchOverlayClass = staticClassName(docsSearchOverlay);
const searchResultLinkClass = staticClassName(docsSearchResultLink);
const searchResultMetaClass = staticClassName(docsSearchResultMeta);
const searchResultTitleClass = staticClassName(docsSearchResultTitle);
const searchResultsClass = staticClassName(docsSearchResults);
const searchRootClass = staticClassName(docsSearchRoot);
const shellIconClass = staticClassName(docsShellIcon);
const shellThemeToggleClass = staticClassName(docsShellThemeToggle);
const topActionsRootClass = staticClassName(docsTopActionsRoot);
const topNavRootClass = staticClassName(docsTopNavRoot);
const topNavLinkClass = staticClassName(docsTopNavLink);
const topDividerClass = staticClassName(docsTopDivider);
const mobileNavDialogId = "comparison-mobile-navigation";
const searchDialogId = "comparison-docs-search-dialog";
const searchTitleId = "comparison-docs-search-title";

function normalizeSearchValue(value: unknown) {
  return String(value || "").toLowerCase();
}

export default function DocsTopBar(props: DocsTopBarProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();
  const [isMobileNavOpen, setMobileNavOpen] = createSignal(false);
  const [isSearchOpen, setSearchOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [mobileNavTrigger, setMobileNavTrigger] = createSignal<HTMLButtonElement | null>(null);
  const [searchTrigger, setSearchTrigger] = createSignal<HTMLButtonElement | null>(null);
  const mobileTocItems = createMemo(() =>
    getDocsTocItems({
      entry: props.tocSlug ? getComparisonEntry(props.tocSlug) : undefined,
      variant: props.tocVariant ?? "index",
    }),
  );
  const [mobileCurrentHref, setMobileCurrentHref] = createMobileCurrentHref(mobileTocItems);
  let searchDialogElement: HTMLDivElement | undefined;

  const closeMobileNav = () => setMobileNavOpen(false);
  const closeSearch = (restoreFocus = false) => {
    setSearchOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => searchTrigger()?.focus());
    }
  };
  const closeSearchFromKeyboard = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    closeSearch(true);
  };
  const setSearchDialogRef = (element: HTMLDivElement) => {
    searchDialogElement = element;
    const handleSearchDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearchFromKeyboard(event);
      }
    };
    element.addEventListener("keydown", handleSearchDialogKey, true);
    element.addEventListener("keyup", handleSearchDialogKey, true);
  };
  const openSearch = () => {
    setSearchOpen(true);
    window.requestAnimationFrame(() => {
      searchDialogElement?.querySelector<HTMLInputElement>("input")?.focus();
    });
  };
  const themeToggleLabel = () => {
    const choice = themeChoice();
    const mode = choice === "system" ? `system ${resolvedTheme()}` : choice;
    return `Using ${mode} mode (press to switch)`;
  };
  const navigateToMobileTocHref = (key: unknown) => {
    const href = String(key ?? "");
    if (!href) {
      return;
    }

    setMobileCurrentHref(href);
    const anchor = document.getElementById(href.slice(1));
    if (anchor) {
      anchor.scrollIntoView({ block: "start" });
      window.history.replaceState(null, "", href);
    }
  };
  const searchResults = createMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery());
    const entries = normalizedQuery
      ? comparisonEntries.filter((entry) =>
          normalizeSearchValue(`${entry.title} ${entry.summary} ${entry.category}`).includes(
            normalizedQuery,
          ),
        )
      : comparisonEntries;

    return entries.slice(0, 8);
  });

  onMount(() => {
    const desktopQuery = window.matchMedia("(min-width: 861px)");
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target;
      const isTextEntry =
        target instanceof HTMLElement &&
        !!target.closest("input, textarea, select, [contenteditable='true']");

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (!isTextEntry && !event.metaKey && !event.ctrlKey && !event.altKey && event.key === "/") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (isSearchOpen() && event.key === "Escape") {
        closeSearchFromKeyboard(event);
        return;
      }

      if (isMobileNavOpen() && event.key === "Escape") {
        closeMobileNav();
      }
    };
    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        closeMobileNav();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    desktopQuery.addEventListener("change", handleDesktopChange);
    handleDesktopChange();

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown, true);
      desktopQuery.removeEventListener("change", handleDesktopChange);
    });
  });

  createEffect(() => {
    const trigger = mobileNavTrigger();
    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", isMobileNavOpen() ? "true" : "false");
  });

  createEffect(() => {
    const trigger = searchTrigger();
    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", isSearchOpen() ? "true" : "false");
  });

  return hc(
    Provider,
    {
      role: "banner",
      class: "s2-topbar",
      styles: topBarRootClass,
      get colorScheme() {
        return resolvedTheme();
      },
    },
    [
      hc(
        Link,
        {
          href: "/",
          variant: "secondary",
          isStandalone: true,
          isQuiet: true,
          UNSAFE_className: classNames("s2-brand", brandLinkClass),
          "aria-label": "Solid Spectrum home",
        },
        [
          h("span", { class: brandMarkClass, "aria-hidden": "true" }, "S"),
          h("span", { class: classNames("s2-brand-text", brandTextClass) }, "Solid Spectrum"),
        ],
      ),
      () =>
        mobileTocItems().length > 1
          ? h(
              "div",
              {
                class: mobileTocRootClass,
                "data-mobile-docs-toc": "",
              },
              hc(Picker, {
                "aria-label": "Table of contents",
                isQuiet: true,
                size: "L",
                styles: mobileTocPickerClass,
                get items() {
                  return mobileTocItems();
                },
                getKey: (item: DocsTocItem) => item.href,
                getTextValue: (item: DocsTocItem) => item.label,
                get selectedKey() {
                  return mobileCurrentHref();
                },
                onSelectionChange: navigateToMobileTocHref,
              }),
            )
          : undefined,
      h(
        "div",
        { class: classNames("s2-search", searchRootClass) },
        h(
          "button",
          {
            type: "button",
            class: classNames("s2-search-trigger", searchButtonClass),
            "aria-label": "Search Solid Spectrum",
            "aria-haspopup": "dialog",
            "aria-controls": searchDialogId,
            "aria-expanded": "false",
            ref: setSearchTrigger,
            onClick: openSearch,
          },
          [
            h(SearchIcon, { styles: searchIconClass, "aria-hidden": "true" }),
            h("span", { class: "s2-search-label" }, "Search Solid Spectrum"),
            hc(Keyboard, { styles: searchKeyboardClass, UNSAFE_className: "s2-search-shortcut" }, [
              "\u2318K",
            ]),
          ],
        ),
      ),
      h("div", { class: classNames("s2-top-actions", topActionsRootClass) }, [
        h(
          "nav",
          { class: classNames("s2-topnav", topNavRootClass), "aria-label": "Top navigation" },
          [
            topNavLink("/", "Docs"),
            props.reactSpectrumUrl
              ? topNavLink(props.reactSpectrumUrl, "React Spectrum")
              : undefined,
            topNavLink("https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum", "npm"),
          ],
        ),
        hc(Divider, {
          orientation: "vertical",
          size: "S",
          styles: topDividerClass,
          UNSAFE_className: "s2-top-actions-divider",
          "aria-hidden": "true",
        }),
        hc(
          ActionButton,
          {
            type: "button",
            size: "M",
            isQuiet: true,
            UNSAFE_className: "s2-shell-theme-toggle",
            styles: shellThemeToggleClass,
            "data-theme-toggle": "",
            get "aria-label"() {
              return themeToggleLabel();
            },
          },
          [
            h("span", { class: "s2-theme-icon", "aria-hidden": "true" }, () =>
              resolvedTheme() === "dark"
                ? h(LightenIcon, { styles: shellIconClass })
                : h(ContrastIcon, { styles: shellIconClass }),
            ),
            h("span", { class: "s2-visually-hidden", "data-theme-toggle-icon": "" }, () =>
              getComparisonThemeChoiceLabel(themeChoice()),
            ),
          ],
        ),
      ]),
      hc(
        ActionButton,
        {
          type: "button",
          size: "M",
          isQuiet: true,
          UNSAFE_className: "s2-mobile-nav-button",
          styles: mobileNavButtonClass,
          "aria-label": "Navigation",
          "aria-controls": mobileNavDialogId,
          "aria-expanded": "false",
          ref: setMobileNavTrigger,
          onPress: () => setMobileNavOpen(true),
        },
        [
          h("span", { class: "s2-menu-icon", "aria-hidden": "true" }, [
            h(MenuHamburgerIcon, { styles: shellIconClass }),
          ]),
        ],
      ),
      () =>
        isSearchOpen()
          ? h(
              "div",
              {
                class: classNames("s2-search-overlay", searchOverlayClass),
                onClick: () => closeSearch(true),
              },
              h(
                "div",
                {
                  id: searchDialogId,
                  class: classNames("s2-search-dialog", searchDialogClass),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": searchTitleId,
                  ref: setSearchDialogRef,
                  onClick: (event: MouseEvent) => event.stopPropagation(),
                },
                [
                  h(
                    "div",
                    {
                      class: classNames("s2-search-dialog-header", searchDialogHeaderClass),
                    },
                    [
                      h(
                        "h2",
                        {
                          id: searchTitleId,
                          class: classNames("s2-search-dialog-title", searchDialogTitleClass),
                        },
                        "Search",
                      ),
                      hc(
                        ActionButton,
                        {
                          type: "button",
                          size: "M",
                          isQuiet: true,
                          "aria-label": "Close search",
                          onPress: () => closeSearch(true),
                        },
                        [h(CloseIcon, { styles: shellIconClass, "aria-hidden": "true" })],
                      ),
                    ],
                  ),
                  hc(SearchField, {
                    label: "Search components",
                    size: "M",
                    placeholder: "Button, Dialog, Picker",
                    UNSAFE_className: classNames("s2-search-dialog-field", searchDialogFieldClass),
                    get value() {
                      return searchQuery();
                    },
                    onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) =>
                      setSearchQuery(event.currentTarget.value),
                    onChange: setSearchQuery,
                    onClear: () => setSearchQuery(""),
                  }),
                  h(
                    "div",
                    {
                      class: classNames("s2-search-results", searchResultsClass),
                      "data-docs-search-results": "",
                      "aria-live": "polite",
                    },
                    [
                      hc(
                        For as never,
                        {
                          get each() {
                            return searchResults();
                          },
                        },
                        renderProp((entry: ComparisonEntry) => searchResult(entry)),
                      ),
                      () =>
                        searchResults().length === 0
                          ? h(
                              "p",
                              { class: classNames("s2-search-empty", searchEmptyClass) },
                              "No matching components.",
                            )
                          : undefined,
                    ],
                  ),
                ],
              ),
            )
          : undefined,
      () =>
        isMobileNavOpen()
          ? h(
              "div",
              {
                class: classNames("s2-mobile-nav-overlay", mobileNavOverlayClass),
                onClick: closeMobileNav,
              },
              h(
                "div",
                {
                  id: mobileNavDialogId,
                  class: classNames("s2-mobile-nav-panel", mobileNavPanelClass),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": "Navigation",
                  onClick: (event: MouseEvent) => event.stopPropagation(),
                },
                [
                  h("div", { class: classNames("s2-mobile-nav-header", mobileNavHeaderClass) }, [
                    h("span", { class: mobileNavTitleClass }, "Navigation"),
                    hc(
                      ActionButton,
                      {
                        type: "button",
                        size: "M",
                        isQuiet: true,
                        "aria-label": "Close navigation",
                        onPress: closeMobileNav,
                      },
                      [h(CloseIcon, { styles: shellIconClass, "aria-hidden": "true" })],
                    ),
                  ]),
                  h(DocsSidebar, {
                    activeSlug: props.activeSlug,
                    navigationLabel: props.navigationLabel,
                    referenceLabel: props.referenceLabel,
                    referenceUrl: props.referenceUrl,
                  }),
                ],
              ),
            )
          : undefined,
    ],
  )();
}

function createMobileCurrentHref(
  items: () => DocsTocItem[],
): [() => string, (href: string) => void] {
  const [currentHref, setCurrentHref] = createSignal(items()[0]?.href ?? "");

  createEffect(() => {
    const nextItems = items();
    setCurrentHref((current) =>
      nextItems.some((item) => item.href === current) ? current : (nextItems[0]?.href ?? ""),
    );
  });

  onMount(() => {
    const hash = window.location.hash;
    if (hash && items().some((item) => item.href === hash)) {
      setCurrentHref(hash);
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const anchors = items()
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((element): element is HTMLElement => element != null);
    if (!anchors.length) {
      return;
    }

    const visible = new Set<Element>();
    const anchorsByDocumentPosition = [...anchors].reverse();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }

        const currentAnchor = anchorsByDocumentPosition.find((element) => visible.has(element));
        if (currentAnchor?.id) {
          setCurrentHref(`#${currentAnchor.id}`);
        }
      },
      {
        rootMargin: "9999999px 0px -100% 0px",
        threshold: 0.5,
      },
    );

    for (const anchor of anchors) {
      observer.observe(anchor);
    }

    onCleanup(() => observer.disconnect());
  });

  return [currentHref, setCurrentHref];
}

function searchResult(entry: ComparisonEntry) {
  return h(
    "a",
    {
      href: `/components/${entry.slug}`,
      class: classNames("s2-search-result", searchResultLinkClass),
    },
    [
      h(
        "span",
        { class: classNames("s2-search-result-title", searchResultTitleClass) },
        entry.title,
      ),
      h(
        "span",
        { class: classNames("s2-search-result-meta", searchResultMetaClass) },
        `${entry.category} / ${entry.parity}`,
      ),
    ],
  );
}

function topNavLink(href: string, label: string) {
  return hc(
    Link,
    {
      href,
      variant: "secondary",
      isStandalone: true,
      isQuiet: true,
      UNSAFE_className: topNavLinkClass,
    },
    [label],
  );
}

function classNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}
