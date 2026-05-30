import h from "solid-js/h";
import { LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
import { reactSpectrumCatalogueSource } from "@comparison/data/react-spectrum-catalogue";
import { hc } from "../solid-h";
import { createComparisonColorScheme } from "../useComparisonColorScheme";

export default function MarketingHero() {
  const { resolvedTheme } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-marketing-hero",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        { class: "s2-marketing-hero-section", "aria-labelledby": "marketing-hero-title" },
        h("div", { class: "s2-marketing-hero-inner" }, [
          h("div", { class: "s2-marketing-hero-copy" }, [
            h(
              "h1",
              { id: "marketing-hero-title", class: "s2-marketing-hero-title" },
              "Spectrum 2, made for Solid.",
            ),
            h(
              "p",
              { class: "s2-marketing-hero-lede" },
              "A faithful SolidJS port of Adobe's Spectrum 2 design system. Accessible primitives, styled components, and a parity-tracked migration path from React Spectrum.",
            ),
            h("div", { class: "s2-marketing-hero-actions" }, [
              hc(
                LinkButton,
                {
                  href: "/coverage",
                  size: "L",
                  variant: "accent",
                  fillStyle: "fill",
                },
                ["Browse components"],
              ),
              hc(
                LinkButton,
                {
                  href: reactSpectrumCatalogueSource.url,
                  size: "L",
                  variant: "secondary",
                  fillStyle: "outline",
                },
                ["React Spectrum"],
              ),
            ]),
          ]),
          h("div", { class: "s2-marketing-hero-visual", "aria-hidden": "true" }, [
            h("div", { class: "s2-marketing-hero-card" }, [
              h("div", { class: "s2-marketing-hero-card-bar" }, [
                h("span", { class: "s2-marketing-hero-card-dot" }),
                h("span", { class: "s2-marketing-hero-card-dot" }),
                h("span", { class: "s2-marketing-hero-card-dot" }),
                h("span", { class: "s2-marketing-hero-card-title" }, "Solid Spectrum"),
              ]),
              h("div", { class: "s2-marketing-hero-card-body" }, [
                h("div", { class: "s2-marketing-hero-card-row" }, [
                  h(
                    "span",
                    { class: "s2-marketing-hero-card-pill s2-marketing-hero-card-pill--accent" },
                    "Accent",
                  ),
                  h("span", { class: "s2-marketing-hero-card-pill" }, "Secondary"),
                  h(
                    "span",
                    { class: "s2-marketing-hero-card-pill s2-marketing-hero-card-pill--quiet" },
                    "Quiet",
                  ),
                ]),
                h("div", { class: "s2-marketing-hero-card-row" }, [
                  h("div", { class: "s2-marketing-hero-card-tile" }),
                  h("div", { class: "s2-marketing-hero-card-tile" }),
                  h("div", { class: "s2-marketing-hero-card-tile" }),
                  h("div", { class: "s2-marketing-hero-card-tile" }),
                ]),
                h("div", { class: "s2-marketing-hero-card-row" }, [
                  h("div", {
                    class: "s2-marketing-hero-card-tile s2-marketing-hero-card-tile--wide",
                  }),
                  h("div", { class: "s2-marketing-hero-card-tile" }),
                ]),
              ]),
            ]),
          ]),
        ]),
      ),
    ],
  )();
}
