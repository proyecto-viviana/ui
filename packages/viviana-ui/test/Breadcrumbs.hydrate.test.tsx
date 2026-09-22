/**
 * Hydration regression for Breadcrumbs (client half).
 *
 * Hydrates the overflowing-items fixture over its own SSR markup and asserts Solid reports no
 * "Hydration Mismatch". A mismatch here is not cosmetic: Solid aborts hydration for the entire
 * tree on the first one, so a divergence in Breadcrumbs' collapse decision would ship a whole
 * route with dead event handlers. See Breadcrumbs.ssr.test.tsx for the mechanism and
 * Collections.hydrate.test.tsx for the general harness pattern this mirrors.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { BreadcrumbsOverflowFixture } from "./fixtures/breadcrumbs";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

describe("Breadcrumbs hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates the overflowing item list with no mismatch", async () => {
    const selector = 'a, [data-rsp-breadcrumb-menu], [aria-current="page"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(
      readSsr("breadcrumbs-overflow-ssr.html"),
      () => <BreadcrumbsOverflowFixture />,
      {
        beforeHydrate(container) {
          serverNodes = Array.from(container.querySelectorAll(selector));
          expect(serverNodes).toHaveLength(4);
        },
      },
    );
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    // Collapsed shape survives hydration: root item, overflow menu trigger, fallback tail.
    expect(container.querySelector("[data-rsp-breadcrumb-menu]")).not.toBeNull();
    expect(container.textContent).toContain("Home");
    expect(container.textContent).toContain("Annual report");
  });

  it("hydrates with no mismatch when the client can measure overflow", async () => {
    // The case above never reaches the branch a real browser takes: `canMeasureOverflow`
    // (src/breadcrumbs/index.tsx) returns false for a jsdom user agent, so both halves
    // skip the hidden measurement copy. Give the client a real user agent and the copy
    // is exactly the divergence #545 died on — the server cannot render it (no window),
    // so if `canMeasure` starts from that read, the client's FIRST render carries a
    // subtree the server never emitted, its first `ElementTag` asks for a hydration key
    // that does not exist, and the whole route aborts with
    // `Hydration Mismatch. Unable to find DOM nodes for hydration key`.
    const ownDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      configurable: true,
    });
    try {
      let serverList: Element | null = null;
      const container = await hydrateOverSsr(
        readSsr("breadcrumbs-overflow-ssr.html"),
        () => <BreadcrumbsOverflowFixture />,
        {
          beforeHydrate(container) {
            serverList = container.querySelector("ol");
            expect(serverList).not.toBeNull();
            // The server has no window to measure with, so it never emits the copy.
            expect(container.querySelector("[data-rsp-breadcrumbs-measure]")).toBeNull();
          },
        },
      );
      // The server's own list, adopted rather than rebuilt.
      expect(container.querySelector("ol")).toBe(serverList);
      // The measurement copy arrives in a post-hydration update, which is the only
      // point Solid allows a node the server did not render.
      expect(container.querySelector("[data-rsp-breadcrumbs-measure]")).not.toBeNull();
    } finally {
      if (ownDescriptor) Object.defineProperty(window.navigator, "userAgent", ownDescriptor);
      else Reflect.deleteProperty(window.navigator, "userAgent");
    }
  });
});
