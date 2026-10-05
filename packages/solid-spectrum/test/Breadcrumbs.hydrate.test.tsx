/**
 * Hydration half of the Breadcrumbs hydration twin (#545 class 3).
 *
 * Reads the markup Breadcrumbs.ssr.test.tsx writes (run that first) and hydrates a
 * DOM-compiled Breadcrumbs over it with a real browser user agent, because
 * `canMeasureOverflow` (src/breadcrumbs/index.tsx) returns false for jsdom and a
 * jsdom-agent run never reaches the branch a browser takes. The hidden measurement
 * copy cannot exist on the server, so seeding `canMeasure` from that read put a whole
 * subtree in the client's FIRST render that the server never emitted: its first
 * `ElementTag` called `getNextElement()` for a hydration key that does not exist and
 * threw `Hydration Mismatch. Unable to find DOM nodes for hydration key`, which is what
 * killed `/solid-spectrum/docs/components/breadcrumbs` and `/showcase/navigation`.
 */
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { BreadcrumbsPathFixture, StaticReactiveBreadcrumbsFixture } from "./fixtures/breadcrumbs";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/spectrum-breadcrumbs-ssr.html"),
  "utf8",
);

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

describe("Breadcrumbs hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates with no mismatch when the client can measure overflow", async () => {
    const ownDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
    Object.defineProperty(window.navigator, "userAgent", {
      value: BROWSER_USER_AGENT,
      configurable: true,
    });
    try {
      const container = await hydrateOverSsr(ssrHtml, () => <BreadcrumbsPathFixture />, {
        beforeHydrate(container) {
          expect(container.querySelectorAll('a, [aria-current="page"]')).toHaveLength(3);
          expect(container.querySelector("[data-rsp-breadcrumbs-measure]")).toBeNull();
        },
      });

      // The measurement copy arrives in a post-hydration update, which is the only
      // point Solid allows a node the server did not render. Asserting it is here is
      // what keeps this test from passing vacuously on a jsdom user agent.
      expect(container.querySelector("[data-rsp-breadcrumbs-measure]")).not.toBeNull();
      // The path itself survives. Not its item count: the post-mount measurement runs
      // for real once `canMeasure` is true, every jsdom element is zero-width, so the
      // trail collapses into the overflow menu here in a way a browser's real layout
      // would not. Item-count behaviour belongs to the client-only Breadcrumbs suite.
      const list = container.querySelector("ol");
      expect(list?.textContent).toContain("Root");
      expect(list?.textContent).toContain("Invoice.pdf");
    } finally {
      if (ownDescriptor) Object.defineProperty(window.navigator, "userAgent", ownDescriptor);
      else Reflect.deleteProperty(window.navigator, "userAgent");
    }
  });

  it("updates reactive labels inside static Breadcrumb items after hydration", async () => {
    const staticSsrHtml = readFileSync(
      resolve(import.meta.dirname, "../../../output/spectrum-breadcrumbs-static-reactive-ssr.html"),
      "utf8",
    );
    const [count, setCount] = createSignal(1);
    let serverOl: HTMLElement | null = null;
    let serverLis: HTMLElement[] = [];
    const container = await hydrateOverSsr(
      staticSsrHtml,
      () => <StaticReactiveBreadcrumbsFixture count={count} />,
      {
        beforeHydrate(container) {
          serverOl = container.querySelector("ol");
          serverLis = Array.from(container.querySelectorAll("li"));
          serverNodes = Array.from(container.querySelectorAll('a, [aria-current="page"]'));
          expect(serverNodes).toHaveLength(3);
          expect(container.textContent).toContain("Documents 1");
        },
      },
    );

    const hydratedNodes = Array.from(container.querySelectorAll('a, [aria-current="page"]'));
    expect(hydratedNodes).toHaveLength(3);

    expect(container.textContent).toContain("Documents 1");
    setCount(2);
    flush();
    expect(container.textContent).toContain("Documents 2");
  });
});
