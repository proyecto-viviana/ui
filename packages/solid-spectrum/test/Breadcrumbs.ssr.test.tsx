/**
 * SSR half of the Breadcrumbs hydration twin (#545 class 3).
 *
 * The server has no window, so `canMeasureOverflow` (src/breadcrumbs/index.tsx) is false
 * and the hidden measurement copy is never rendered. That is the markup the client has to
 * match on its first render; Breadcrumbs.hydrate.test.tsx hydrates over this output.
 */
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { BreadcrumbsPathFixture, StaticReactiveBreadcrumbsFixture } from "./fixtures/breadcrumbs";

describe("Breadcrumbs SSR", () => {
  it("renders the path without the hidden measurement copy", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const html = renderToString(() => <BreadcrumbsPathFixture />);

    expect(html).toContain("Root");
    expect(html).toContain("Documents");
    expect(html).toContain("Invoice.pdf");
    // Three items is under MAX_VISIBLE_ITEMS, so no overflow menu either.
    expect(html).not.toContain("data-rsp-breadcrumb-menu");
    expect(html).not.toContain("data-rsp-breadcrumbs-measure");

    writeFileSync(resolve(outDir, "spectrum-breadcrumbs-ssr.html"), html, "utf8");
  });

  it("renders static breadcrumbs with initial signal value", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const html = renderToString(() => <StaticReactiveBreadcrumbsFixture count={() => 1} />);

    expect(html).toContain("Root");
    expect(html).toContain("Documents 1");
    expect(html).toContain("Invoice.pdf");
    expect(html).not.toContain("data-rsp-breadcrumbs-measure");

    writeFileSync(resolve(outDir, "spectrum-breadcrumbs-static-reactive-ssr.html"), html, "utf8");
  });
});
