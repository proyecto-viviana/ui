/**
 * @vitest-environment jsdom
 *
 * Hydration half of the S2 TableView selection-column regression. Reads the
 * server markup produced by Table.ssr.test.tsx (run that first) and hydrates
 * the DOM-compiled fixture over it, as the site does.
 *
 * Site Gate 2026-09-02 (`/showcase/collections`): the route error boundary
 * caught "Cannot read properties of null (reading 'nextSibling')" thrown from
 * TableColumn's template walk. Headless TableColumn and TableCell rendered
 * `<th {...props()} />` with `children` evaluated eagerly inside the props
 * object. `ssrElement` receives that object already built, so the server keyed
 * the column's children *before* the `<th>`; the DOM build claims the `<th>`
 * key first, so the client claimed the select-all `<span>` as its `<th>` and
 * walked a template that did not match it. Children are JSX children of the
 * host element again; this test holds that order on both sides.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { PEOPLE, SelectableTableFixture, TABLE_COLUMNS } from "./fixtures/table";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/table-selectable-ssr.html"),
  "utf8",
);

describe("TableView hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates the select-all column and the data columns without a mismatch", async () => {
    let serverCells: Element[] = [];

    const container = await hydrateOverSsr(ssrHtml, () => <SelectableTableFixture />, {
      beforeHydrate(container) {
        serverCells = [
          ...container.querySelectorAll(
            '[role="columnheader"], [role="rowheader"], [role="gridcell"]',
          ),
        ];
      },
    });

    const headers = container.querySelectorAll('[role="columnheader"]');
    expect(headers).toHaveLength(TABLE_COLUMNS.length + 1);
    expect(headers[0]!.querySelector('input[aria-label="Select All"]')).not.toBeNull();
    expect(headers[1]).toHaveTextContent("Name");
    expect(headers[2]).toHaveTextContent("Role");

    // Claimed, not re-created: representative server nodes retain identity.
    const cells = container.querySelectorAll(
      '[role="columnheader"], [role="rowheader"], [role="gridcell"]',
    );
    expect(cells).toHaveLength((TABLE_COLUMNS.length + 1) * (PEOPLE.length + 1));
    for (const [index, cell] of [...cells].entries()) expect(cell).toBe(serverCells[index]);
    expect(container.querySelectorAll('input[aria-label="Select"]')).toHaveLength(PEOPLE.length);
  });
});
