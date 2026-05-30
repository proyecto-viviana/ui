import h from "solid-js/h";
import { LinkButton, Provider } from "@proyecto-viviana/solid-spectrum";
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
            "Ready to get started?",
          ),
          h(
            "p",
            { class: "s2-marketing-cta-lede" },
            "Browse the parity catalogue, install solid-spectrum from npm, and ship Spectrum 2 UI on Solid.",
          ),
          h("div", { class: "s2-marketing-cta-actions" }, [
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
