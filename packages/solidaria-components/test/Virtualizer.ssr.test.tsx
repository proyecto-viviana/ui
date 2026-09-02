/**
 * Server-render half of the ListBox / Virtualizer hydration regressions.
 *
 * The server has no viewport: the scroll view measures 0, so a virtualized
 * ListBox renders only the overscan rows. The companion
 * Virtualizer.hydrate.test.tsx hydrates over this output with a real
 * (non-zero) client viewport, and over the element-children ListBox markup.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  ElementChildrenListBoxFixture,
  VIRTUALIZED_ITEM_COUNT,
  VirtualizedListBoxFixture,
} from "./fixtures/virtualizer";

const outDir = resolve(import.meta.dirname, "../../../output");

describe("Virtualizer SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders only the overscan window of a virtualized ListBox and writes hydratable markup", () => {
    const html = renderToString(() => <VirtualizedListBoxFixture />);
    const optionCount = html.match(/role="option"/g)?.length ?? 0;

    expect(html).toContain('role="listbox"');
    expect(html).toContain('role="presentation"');
    // A zero-height server viewport still renders a non-empty window (the
    // overscan rows), and it must be a strict subset — otherwise SSR would
    // emit the whole collection and defeat virtualization.
    expect(optionCount).toBeGreaterThan(0);
    expect(optionCount).toBeLessThan(VIRTUALIZED_ITEM_COUNT);

    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "virtualizer-listbox-ssr.html"), html, "utf8");
  });

  it("renders element option children once and writes hydratable markup", () => {
    const html = renderToString(() => <ElementChildrenListBoxFixture />);

    expect(html.match(/role="option"/g)?.length).toBe(4);
    // One tile per option: a second read of the children would not show up in
    // the markup (only the last read is emitted) but would shift its hydration
    // key — the hydrate half catches that.
    expect(html.match(/class="tile"/g)?.length).toBe(4);
    expect(html).toContain("Item 0");

    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "listbox-element-children-ssr.html"), html, "utf8");
  });
});
