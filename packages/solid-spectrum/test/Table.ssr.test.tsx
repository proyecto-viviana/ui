/**
 * SSR half of the S2 TableView selection-column hydration regression.
 *
 * Runs under vitest.ssr.config.ts (`solid({ ssr: true })`, node env). Writes
 * the server markup of the `/showcase/collections` selectable table to
 * `output/table-selectable-ssr.html`; Table.hydrate.test.tsx hydrates the
 * DOM-compiled fixture over it. Run this test first.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { SelectableTableFixture, TABLE_COLUMNS } from "./fixtures/table";

describe("TableView SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders the select-all column ahead of the data columns and writes hydratable markup", () => {
    const html = renderToString(() => <SelectableTableFixture />);

    const headers = html.match(/role="columnheader"/g) ?? [];
    expect(headers).toHaveLength(TABLE_COLUMNS.length + 1);
    expect(html).toContain('data-rsp-slot="select-all-indicator"');
    expect(html).toContain('aria-label="Select All"');

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "table-selectable-ssr.html"), html, "utf8");
  });
});
