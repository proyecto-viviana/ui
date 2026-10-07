/**
 * Hydration and selection for collection slot layout (#102).
 *
 * Reads the markup CollectionSlots.ssr.test.tsx writes. Run that file first.
 * Tree hydration stays on the viviana-ui always-framed return. The
 * solid-spectrum Tree still builds an unused framed branch (#44), so this
 * file proves ListView slot classes survive hydration and still select.
 */
import { flush } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { ListViewSlotStylesFixture } from "./fixtures/collection-slots";

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

describe("collection slot styles hydrate and still select", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates ListView slot classes and selects the row", async () => {
    let serverRow: HTMLElement | undefined;
    const container = await hydrateOverSsr(
      readSsr("spectrum-listview-slots-ssr.html"),
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
    const user = setupUser();
    await user.click(row!);
    flush();
    expect(container.ownerDocument.activeElement).toBe(row);
    expect(row).toHaveAttribute("aria-selected", "true");
    await user.click(row!);
    flush();
    expect(row).toHaveAttribute("aria-selected", "false");
  });
});
