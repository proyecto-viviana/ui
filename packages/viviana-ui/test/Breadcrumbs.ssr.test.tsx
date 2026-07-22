/**
 * SSR half of the Breadcrumbs hydration regression.
 *
 * Breadcrumbs decides whether to collapse into an overflow menu by self-measuring the rendered
 * items (see `updateOverflow` in src/breadcrumbs/index.tsx). That measurement can only run on
 * the client (`canMeasureOverflow` short-circuits to false whenever `window` is undefined), so
 * the server must fall back to a deterministic, item-count-only decision that produces the exact
 * same collapsed shape the client's own fallback path produces before it ever gets a chance to
 * measure. If server and (pre-measurement) client ever disagreed here, hydration would walk a
 * different number of nodes and abort for the whole route — the same class of bug the Collections
 * fixtures exist to guard (see Collections.ssr.test.tsx for the general mechanism).
 *
 * Runs under vitest.ssr.config.ts (renderToString, hydratable). The companion
 * Breadcrumbs.hydrate.test.tsx hydrates over this output and asserts no mismatch.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { BreadcrumbsOverflowFixture } from "./fixtures/breadcrumbs";

describe("Breadcrumbs SSR", () => {
  it("renders hydratable, already-collapsed markup for an overflowing item list", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const html = renderToString(() => <BreadcrumbsOverflowFixture />);

    // Six items > MAX_VISIBLE_ITEMS (4): the server must resolve the collapsed shape
    // deterministically (no window to measure with) rather than shipping the full,
    // uncollapsed list for the client to yank into a collapsed one after mount. The
    // fallback tail count is MAX_VISIBLE_ITEMS - 2 = 2, so the visible shape is:
    // first item, overflow menu, then the last two items.
    expect(html).toContain("data-rsp-breadcrumb-menu");
    expect(html).toContain("Home");
    expect(html).toContain("Quarterly");
    expect(html).toContain("Annual report");
    // The collapsed-out middle items must not be present in the (server-side, unmeasured)
    // markup at all — SSR never renders the hidden measurement copy (it's gated on
    // `canMeasure()`, which is always false without a window).
    expect(html).not.toContain("Files");
    expect(html).not.toContain("Projects");
    expect(html).not.toContain("Reports");

    writeFileSync(resolve(outDir, "breadcrumbs-overflow-ssr.html"), html, "utf8");
  });
});
