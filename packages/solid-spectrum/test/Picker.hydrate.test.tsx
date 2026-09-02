/**
 * @vitest-environment jsdom
 *
 * Hydration half of the Picker hydration regression (#54).
 * Reads the server markup produced by Picker.ssr.test.tsx (run that first),
 * injects it into a container, then hydrates the DOM-compiled Picker over it —
 * exactly the production flow (workerd SSR HTML → browser hydrate). A
 * "Hydration Mismatch" / getNextElement desync would surface here as a thrown
 * error or a console.error; both are asserted absent.
 *
 * This is the guard for the root-cause fix: the overlay content (the popover
 * ListBox) is gated behind `useIsHydrated()`, and its children are read lazily
 * (`get children()` in Popover/Modal/Toast) so nothing is instantiated during
 * the synchronous hydration walk that the server never emitted.
 */
import { afterEach, describe, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { Picker } from "../src/picker";

interface SectionItem {
  href: string;
  label: string;
}

const sections: SectionItem[] = [
  { href: "#page-title", label: "Accordion" },
  { href: "#api", label: "API" },
];

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/picker-ssr.html"),
  "utf8",
);

describe("Picker hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates the server markup without a mismatch", () => {
    hydrateOverSsr(ssrHtml, () => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
      />
    ));
  });
});
