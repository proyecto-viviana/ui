/**
 * Hydration and selection for collection slot layout (#102).
 *
 * Reads the markup CollectionSlots.ssr.test.tsx writes. Run that file first.
 */
import { flush } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { ListViewSlotStylesFixture, TreeSlotStylesFixture } from "./fixtures/collection-slots";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

function expectServerSlots(container: HTMLElement, rowMarker: string): HTMLElement {
  const row = container.querySelector<HTMLElement>(`[${rowMarker}][data-key="brief"]`);
  expect(row).not.toBeNull();
  for (const slot of ["label", "description", "icon"]) {
    const node = row!.querySelector(`[data-rsp-slot="${slot}"]`);
    expect(node, slot).not.toBeNull();
    expect(node!.getAttribute("class")?.trim().length).toBeGreaterThan(0);
  }
  const actions = row!.querySelector('[slot="actions"]');
  expect(actions).not.toBeNull();
  expect(actions!.getAttribute("class")?.trim().length).toBeGreaterThan(0);
  return row!;
}

async function selectRow(container: HTMLElement, row: HTMLElement): Promise<void> {
  const user = setupUser();
  await user.click(row);
  flush();
  expect(container.ownerDocument.activeElement).toBe(row);
  expect(row).toHaveAttribute("aria-selected", "true");
  await user.click(row);
  flush();
  expect(row).toHaveAttribute("aria-selected", "false");
}

describe("collection slot styles hydrate and still select", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates ListView slot classes and selects the row", async () => {
    let serverRow: HTMLElement | undefined;
    const container = await hydrateOverSsr(
      readSsr("viviana-listview-slots-ssr.html"),
      () => <ListViewSlotStylesFixture />,
      {
        beforeHydrate(container) {
          serverRow = expectServerSlots(container, "data-list-view-item");
          expect(serverRow).toHaveAttribute("aria-selected", "false");
        },
      },
    );
    const row = container.querySelector<HTMLElement>('[data-list-view-item][data-key="brief"]');
    expect(row).toBe(serverRow);
    await selectRow(container, row!);
  });

  it("hydrates Tree slot classes and selects the row", async () => {
    let serverRow: HTMLElement | undefined;
    const container = await hydrateOverSsr(
      readSsr("viviana-tree-slots-ssr.html"),
      () => <TreeSlotStylesFixture />,
      {
        beforeHydrate(container) {
          serverRow = expectServerSlots(container, "data-tree-view-item");
          expect(serverRow).toHaveAttribute("aria-selected", "false");
        },
      },
    );
    const row = container.querySelector<HTMLElement>('[data-tree-view-item][data-key="brief"]');
    expect(row).toBe(serverRow);
    await selectRow(container, row!);
  });
});
