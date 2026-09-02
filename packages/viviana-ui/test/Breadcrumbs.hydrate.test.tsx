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

  it("hydrates the overflowing item list with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("breadcrumbs-overflow-ssr.html"), () => (
      <BreadcrumbsOverflowFixture />
    ));
    // Collapsed shape survives hydration: root item, overflow menu trigger, fallback tail.
    expect(container.querySelector("[data-rsp-breadcrumb-menu]")).not.toBeNull();
    expect(container.textContent).toContain("Home");
    expect(container.textContent).toContain("Annual report");
  });
});
