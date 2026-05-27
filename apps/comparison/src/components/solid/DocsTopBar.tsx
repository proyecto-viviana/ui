import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import h from "solid-js/h";
import { ActionButton, Keyboard, Link, Provider, Text } from "@proyecto-viviana/solid-spectrum";
import { getComparisonThemeChoiceLabel } from "@comparison/data/theme";
import {
  docsBrandLink,
  docsBrandMark,
  docsMobileNavButton,
  docsMobileNavHeader,
  docsMobileNavOverlay,
  docsMobileNavPanel,
  docsMobileNavTitle,
  docsSearchButton,
  docsSearchKeyboard,
  docsSearchRoot,
  docsShellThemeToggle,
  docsTopBarRoot,
  docsTopNavLink,
  docsTopNavRoot,
  staticClassName,
} from "./chrome/styles";
import DocsSidebar from "./DocsSidebar";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface DocsTopBarProps {
  activeSlug?: string;
  navigationLabel?: string;
  reactSpectrumUrl?: string;
  referenceLabel?: string;
  referenceUrl?: string;
}

const topBarRootClass = staticClassName(docsTopBarRoot);
const brandLinkClass = staticClassName(docsBrandLink);
const brandMarkClass = staticClassName(docsBrandMark);
const mobileNavButtonClass = staticClassName(docsMobileNavButton);
const mobileNavOverlayClass = staticClassName(docsMobileNavOverlay);
const mobileNavPanelClass = staticClassName(docsMobileNavPanel);
const mobileNavHeaderClass = staticClassName(docsMobileNavHeader);
const mobileNavTitleClass = staticClassName(docsMobileNavTitle);
const searchButtonClass = staticClassName(docsSearchButton);
const searchKeyboardClass = staticClassName(docsSearchKeyboard);
const searchRootClass = staticClassName(docsSearchRoot);
const shellThemeToggleClass = staticClassName(docsShellThemeToggle);
const topNavRootClass = staticClassName(docsTopNavRoot);
const topNavLinkClass = staticClassName(docsTopNavLink);
const mobileNavDialogId = "comparison-mobile-navigation";

export default function DocsTopBar(props: DocsTopBarProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();
  const [isMobileNavOpen, setMobileNavOpen] = createSignal(false);
  const [mobileNavTrigger, setMobileNavTrigger] = createSignal<HTMLButtonElement | null>(null);
  const closeMobileNav = () => setMobileNavOpen(false);

  onMount(() => {
    const desktopQuery = window.matchMedia("(min-width: 861px)");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isMobileNavOpen() && event.key === "Escape") {
        closeMobileNav();
      }
    };
    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        closeMobileNav();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);
    handleDesktopChange();

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
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

  return hc(
    Provider,
    {
      class: "s2-topbar",
      styles: topBarRootClass,
      get colorScheme() {
        return resolvedTheme();
      },
      background: "layer-1",
    },
    [
      hc(
        Link,
        {
          href: "/",
          variant: "secondary",
          isStandalone: true,
          isQuiet: true,
          UNSAFE_className: brandLinkClass,
          "aria-label": "Solid Spectrum home",
        },
        [
          h("span", { class: brandMarkClass, "aria-hidden": "true" }, "S"),
          h("span", {}, "Solid Spectrum"),
        ],
      ),
      h(
        "div",
        { class: classNames("s2-search", searchRootClass) },
        hc(
          ActionButton,
          {
            type: "button",
            size: "M",
            styles: searchButtonClass,
            "aria-label": "Search Solid Spectrum",
          },
          [
            hc(Text, {}, ["Search Solid Spectrum"]),
            hc(Keyboard, { styles: searchKeyboardClass }, ["/"]),
          ],
        ),
      ),
      h(
        "nav",
        { class: classNames("s2-topnav", topNavRootClass), "aria-label": "Top navigation" },
        [
          topNavLink("/", "Docs"),
          props.reactSpectrumUrl ? topNavLink(props.reactSpectrumUrl, "React Spectrum") : undefined,
          topNavLink("https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum", "npm"),
        ],
      ),
      hc(
        ActionButton,
        {
          type: "button",
          size: "M",
          isQuiet: true,
          UNSAFE_className: "s2-shell-theme-toggle",
          styles: shellThemeToggleClass,
          "data-theme-toggle": "",
          "aria-label": "Switch color theme",
        },
        [
          h("span", { class: "s2-theme-icon", "data-theme-toggle-icon": "" }, () =>
            getComparisonThemeChoiceLabel(themeChoice()),
          ),
        ],
      ),
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
        [h("span", { class: "s2-menu-icon", "aria-hidden": "true" })],
      ),
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
                      ["Close"],
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
