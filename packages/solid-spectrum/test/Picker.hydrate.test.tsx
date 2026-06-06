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
import { hydrate } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Picker } from "../src/picker";

// Mirrors solid's generateHydrationScript() init so `hydrate` finds the
// hydration registry instead of crashing on `_$HY.done`.
function installHydrationGlobals(): void {
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

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
  beforeEach(() => {
    installHydrationGlobals();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates the server markup without a mismatch", () => {
    const errors: unknown[][] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args);
    });

    const container = document.createElement("div");
    container.innerHTML = ssrHtml;
    document.body.appendChild(container);

    let thrown: unknown;
    try {
      hydrate(
        () => (
          <Picker<SectionItem>
            aria-label="Table of contents"
            items={sections}
            getKey={(item) => item.href}
            getTextValue={(item) => item.label}
            selectedKey="#page-title"
          />
        ),
        container,
      );
    } catch (err) {
      thrown = err;
    }

    errorSpy.mockRestore();

    if (thrown) {
      // eslint-disable-next-line no-console
      console.log("THROWN DURING HYDRATE:", thrown);
    }
    if (errors.length) {
      // eslint-disable-next-line no-console
      console.log("CONSOLE.ERROR DURING HYDRATE:", JSON.stringify(errors, null, 2));
    }

    expect(thrown).toBeUndefined();
    expect(errors).toEqual([]);
  });
});
