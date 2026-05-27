import h from "solid-js/h";
import { Divider, Link, Provider } from "@proyecto-viviana/solid-spectrum";
import { docsFooterLink, docsFooterList, docsFooterRoot, staticClassName } from "./chrome/styles";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

const footerRootClass = staticClassName(docsFooterRoot);
const footerListClass = staticClassName(docsFooterList);
const footerLinkClass = staticClassName(docsFooterLink);

const footerLinks = [
  { href: "/", label: "Solid Spectrum" },
  { href: "https://react-spectrum.adobe.com/", label: "React Spectrum" },
  { href: "https://github.com/proyecto-viviana/viviana-ui", label: "GitHub" },
  { href: "https://github.com/proyecto-viviana/viviana-ui/blob/main/LICENSE", label: "License" },
  { href: "https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum", label: "npm" },
] as const;

export default function DocsFooter() {
  const { resolvedTheme } = createComparisonColorScheme();

  return hc(
    Provider,
    {
      class: "s2-docs-footer",
      styles: footerRootClass,
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      hc(Divider, { size: "S" }),
      h(
        "ul",
        { class: footerListClass },
        footerLinks.map((item) =>
          h("li", {}, [
            hc(
              Link,
              {
                href: item.href,
                variant: "secondary",
                isStandalone: true,
                isQuiet: true,
                UNSAFE_className: footerLinkClass,
              },
              [item.label],
            ),
          ]),
        ),
      ),
    ],
  )();
}
