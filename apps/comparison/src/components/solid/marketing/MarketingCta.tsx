import h from "solid-js/h";
import { LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
import { comparisonCoveragePath } from "@comparison/data/site-meta";
import { hc } from "../solid-h";
import { createComparisonColorScheme } from "../useComparisonColorScheme";

export default function MarketingCta() {
  const { resolvedTheme } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-marketing-cta",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        { class: "s2-marketing-cta-section", "aria-labelledby": "marketing-cta-title" },
        h("div", { class: "s2-marketing-cta-inner" }, [
          h(
            "h2",
            { id: "marketing-cta-title", class: "s2-marketing-cta-title" },
            "Ready to compare a component?",
          ),
          h(
            "p",
            { class: "s2-marketing-cta-lede" },
            "Open the catalogue, pick a slug, and drive React Spectrum and Solid Spectrum on the same route.",
          ),
          h("div", { class: "s2-marketing-cta-actions" }, [
            hc(
              LinkButton,
              {
                href: comparisonCoveragePath,
                size: "L",
                variant: "accent",
                fillStyle: "fill",
              },
              ["Browse components"],
            ),
            hc(
              LinkButton,
              {
                href: "https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum",
                size: "L",
                variant: "secondary",
                fillStyle: "outline",
              },
              ["View on npm"],
            ),
          ]),
        ]),
      ),
    ],
  )();
}
