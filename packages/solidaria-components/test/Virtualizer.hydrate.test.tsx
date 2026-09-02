/**
 * Hydration half of the ListBox / Virtualizer server-render regressions.
 *
 * 1. The client measures a real viewport while the server measured none. If the
 *    scroll view's layout-time measurement (RAC `useScrollView` layout effect)
 *    widens the visible range while Solid is still hydrating, the newly mounted
 *    rows try to claim server nodes that do not exist and Solid aborts the whole
 *    tree with "Hydration Mismatch". The range must only grow once hydration has
 *    finished claiming the server window.
 * 2. Element option children must be read exactly once: every read of a compiled
 *    element child consumes a hydration key, so probing `typeof children` before
 *    rendering it leaves the server one key ahead of the client.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import {
  ElementChildrenListBoxFixture,
  VIRTUALIZED_ITEM_COUNT,
  VIRTUALIZED_ROW_HEIGHT,
  VirtualizedListBoxFixture,
} from "./fixtures/virtualizer";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

const CLIENT_VIEWPORT_HEIGHT = 320;

describe("Virtualizer hydration over server markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("hydrates the server window without a mismatch, then grows the range to the measured viewport", async () => {
    const ssrHtml = readSsr("virtualizer-listbox-ssr.html");
    // jsdom has no layout: give the collection element a real client height and
    // a window taller than it so the measured viewport differs from the server's 0.
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(CLIENT_VIEWPORT_HEIGHT);
    vi.stubGlobal("innerHeight", 800);

    const serverOptionCount = ssrHtml.match(/role="option"/g)?.length ?? 0;
    expect(serverOptionCount).toBeGreaterThan(0);

    const container = hydrateOverSsr(ssrHtml, () => <VirtualizedListBoxFixture />);

    // Post-hydration effects (the measured-size emit) have run by the time
    // `hydrate` returns; flush the reactive re-render they queue.
    await Promise.resolve();

    const listbox = container.querySelector<HTMLElement>('[role="listbox"]');
    expect(listbox).not.toBeNull();
    const options = container.querySelectorAll('[role="option"]');
    // The client viewport fits more rows than the server's zero-height window,
    // so the range must have widened after hydration — proof the measurement
    // still lands, just not mid-hydration.
    const minimumVisibleRows = Math.ceil(CLIENT_VIEWPORT_HEIGHT / VIRTUALIZED_ROW_HEIGHT);
    expect(options.length).toBeGreaterThanOrEqual(minimumVisibleRows);
    expect(options.length).toBeGreaterThan(serverOptionCount);
    expect(options.length).toBeLessThan(VIRTUALIZED_ITEM_COUNT);
    expect(options[0]).toHaveTextContent("Item 0");
  });
});

describe("ListBox option hydration over server markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates element option children without a mismatch and keeps the server nodes", () => {
    const ssrHtml = readSsr("listbox-element-children-ssr.html");
    const serverTiles = Array.from(
      new DOMParser().parseFromString(ssrHtml, "text/html").querySelectorAll(".tile"),
    );
    expect(serverTiles.length).toBe(4);

    const container = hydrateOverSsr(ssrHtml, () => <ElementChildrenListBoxFixture />);

    const options = container.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options.length).toBe(4);
    const tiles = container.querySelectorAll<HTMLElement>(".tile");
    expect(tiles.length).toBe(4);
    // Hydration adopted the server tile (same data-hk) rather than discarding
    // it for a client-created one — a second children read would have either
    // thrown or left an orphaned server node behind.
    expect(tiles[0]!.getAttribute("data-hk")).toBe(serverTiles[0]!.getAttribute("data-hk"));
    expect(tiles[0]!.parentElement).toBe(options[0]);
    expect(options[0]).toHaveTextContent("Item 0");
    expect(options[0]!.querySelector(".tile-meta")).toHaveTextContent("Grid item");
  });
});
