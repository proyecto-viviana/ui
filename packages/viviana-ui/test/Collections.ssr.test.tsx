/**
 * SSR half of the collection-component hydration regression.
 *
 * Tabs and ListView both build their collection from render-prop children. On the server the
 * collection is fully populated before markup is emitted, so state-dependent descendants — the
 * selected Tab's SelectionIndicator, a ListViewItem's selection/focus affordances — are present
 * in the output. If the client's first render resolves that state differently, it walks a
 * different number of nodes and every hydration key after the divergence is off by one, which
 * aborts hydration for the whole route (Solid sets sharedConfig.done and throws up through the
 * tree; a router catches it and only console.warns, so the page silently ships dead).
 *
 * These fixtures mirror the two shapes that actually broke the akade design-handoff-v2 route:
 * a horizontal Tabs with defaultSelectedKey, and a ListView with descriptions.
 *
 * Runs under vitest.ssr.config.ts (renderToString, hydratable). The companion
 * Collections.hydrate.test.tsx hydrates over this output and asserts no mismatch.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  TabsFixture,
  TabsPlainFixture,
  TabsCompFixture,
  ListViewFixture,
  ListViewInteractiveFixture,
  ListViewStaticInteractiveFixture,
} from "./fixtures/collections";

describe("collection components SSR", () => {
  it("renders hydratable markup for Tabs and ListView", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const tabs = renderToString(() => <TabsFixture />);
    const listview = renderToString(() => <ListViewFixture />);
    const listviewInteractive = renderToString(() => <ListViewInteractiveFixture />);
    const listviewStaticInteractive = renderToString(() => <ListViewStaticInteractiveFixture />);

    // The selected Tab's indicator is exactly the node whose presence diverged.
    expect(tabs).toContain('data-rsp-slot="selection-indicator"');
    expect(tabs).toContain('aria-selected="true"');
    expect(listview).toContain('role="row"');
    expect(listviewInteractive).toContain('role="row"');
    // Static `<ListViewItem>` children must appear in the SSR markup as real rows,
    // not fall back to the empty state — see ListViewStaticInteractiveFixture.
    expect(listviewStaticInteractive).toContain('data-key="row-a"');
    expect(listviewStaticInteractive).toContain('data-key="row-b"');
    expect(listviewStaticInteractive).not.toContain('data-empty="true"');

    writeFileSync(
      resolve(outDir, "tabs-plain-ssr.html"),
      renderToString(() => <TabsPlainFixture />),
      "utf8",
    );
    writeFileSync(
      resolve(outDir, "tabs-comp-ssr.html"),
      renderToString(() => <TabsCompFixture />),
      "utf8",
    );
    writeFileSync(resolve(outDir, "tabs-ssr.html"), tabs, "utf8");
    writeFileSync(resolve(outDir, "listview-ssr.html"), listview, "utf8");
    writeFileSync(resolve(outDir, "listview-interactive-ssr.html"), listviewInteractive, "utf8");
    writeFileSync(
      resolve(outDir, "listview-static-interactive-ssr.html"),
      listviewStaticInteractive,
      "utf8",
    );
  });
});
