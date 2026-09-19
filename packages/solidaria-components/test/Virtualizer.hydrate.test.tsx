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
import { flush, sharedConfig } from "solid-js";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
import {
  ElementChildrenListBoxFixture,
  ScrollViewLifecycleFixture,
  VIRTUALIZED_ITEM_COUNT,
  VIRTUALIZED_ROW_HEIGHT,
  VirtualizedListBoxFixture,
  type ScrollViewEvent,
} from "./fixtures/virtualizer";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

const CLIENT_VIEWPORT_HEIGHT = 320;

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});

describe("Virtualizer hydration over server markup", () => {
  it("defers viewport measurements until adoption ends and cleans up live observers and scroll work", async () => {
    const height = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(320);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(240);
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, -24, 240, 320));
    vi.stubGlobal("innerHeight", 800);
    const observe = vi.fn();
    const disconnect = vi.fn();
    let resized!: () => void;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const events: Array<{ event: ScrollViewEvent; hydrating: boolean }> = [];
    let serverNodes: Element[] = [];
    let followingId = "";
    const container = await hydrateOverSsr(
      readSsr("scroll-view-lifecycle-ssr.html"),
      () => (
        <ScrollViewLifecycleFixture
          event={(event) => events.push({ event, hydrating: sharedConfig.hydrating })}
        />
      ),
      {
        beforeHydrate(container) {
          serverNodes = [...container.querySelectorAll("section, [data-scroll-view]")];
          expect(serverNodes).toHaveLength(3);
          followingId = serverNodes[2]!.id;
        },
      },
    );
    const adoptedNodes = [...container.querySelectorAll("section, [data-scroll-view]")];
    expect(adoptedNodes).toHaveLength(3);
    adoptedNodes.forEach((node, index) => expect(node).toBe(serverNodes[index]));
    expect(serverNodes[2]!.id).toBe(followingId);
    expect(followingId).not.toBe("");
    expect(events.filter(({ hydrating }) => hydrating)).toEqual([]);
    expect(events.map(({ event }) => event)).toEqual(
      expect.arrayContaining([
        { kind: "size", width: 240, height: 320 },
        { kind: "window", height: 800 },
        { kind: "offset", offset: 24 },
      ]),
    );
    const viewport = container.querySelector<HTMLElement>('[data-scroll-view="viewport"]')!;
    expect(observe).toHaveBeenCalledExactlyOnceWith(viewport);
    height.mockReturnValue(480);
    rect.mockReturnValue(new DOMRect(0, -40, 240, 480));
    events.length = 0;
    window.dispatchEvent(new Event("resize"));
    resized();
    expect(events.map(({ event }) => event)).toEqual([
      { kind: "size", width: 240, height: 480 },
      { kind: "window", height: 800 },
      { kind: "offset", offset: 40 },
      { kind: "size", width: 240, height: 480 },
      { kind: "window", height: 800 },
      { kind: "offset", offset: 40 },
    ]);
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"],
    });
    viewport.scrollTop = 160;
    viewport.scrollLeft = 40;
    events.length = 0;
    viewport.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(16);
    expect(events.map(({ event }) => event)).toEqual([
      { kind: "start" },
      { kind: "scroll", x: 40, y: 160 },
      { kind: "size", width: 240, height: 480 },
    ]);
    vi.advanceTimersByTime(300);
    expect(events.at(-1)?.event).toEqual({ kind: "end" });
    viewport.dispatchEvent(new Event("scroll"));
    expect(vi.getTimerCount()).toBe(2);
    cleanupHydrationRoots();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    events.length = 0;
    // Keep the old target connected so a leaked document scroll listener would
    // still receive its event after root disposal.
    container.append(viewport);
    expect(viewport.isConnected).toBe(true);
    window.dispatchEvent(new Event("resize"));
    viewport.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(500);
    expect(events).toEqual([]);
  });

  it("hydrates the server window without a mismatch, then grows the range to the measured viewport", async () => {
    const ssrHtml = readSsr("virtualizer-listbox-ssr.html");
    // jsdom has no layout: give the collection element a real client height and
    // a window taller than it so the measured viewport differs from the server's 0.
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(CLIENT_VIEWPORT_HEIGHT);
    vi.stubGlobal("innerHeight", 800);

    const serverOptionCount = ssrHtml.match(/role="option"/g)?.length ?? 0;
    expect(serverOptionCount).toBeGreaterThan(0);

    let serverListbox: Element | null = null;
    let serverOptions: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <VirtualizedListBoxFixture />, {
      beforeHydrate(container) {
        serverListbox = container.querySelector('[role="listbox"]');
        serverOptions = [...container.querySelectorAll('[role="option"]')];
      },
    });

    // Post-hydration effects (the measured-size emit) have run by the time
    // `hydrate` returns; flush the reactive re-render they queue.
    flush();

    const listbox = container.querySelector<HTMLElement>('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox).toBe(serverListbox);
    const options = container.querySelectorAll('[role="option"]');
    // The client viewport fits more rows than the server's zero-height window,
    // so the range must have widened after hydration — proof the measurement
    // still lands, just not mid-hydration.
    const minimumVisibleRows = Math.ceil(CLIENT_VIEWPORT_HEIGHT / VIRTUALIZED_ROW_HEIGHT);
    expect(options.length).toBeGreaterThanOrEqual(minimumVisibleRows);
    expect(options.length).toBeGreaterThan(serverOptionCount);
    expect(options.length).toBeLessThan(VIRTUALIZED_ITEM_COUNT);
    for (const [index, option] of serverOptions.entries()) expect(options[index]).toBe(option);
    expect(options[0]).toHaveTextContent("Item 0");
  });
});

describe("ListBox option hydration over server markup", () => {
  it("hydrates element option children without a mismatch and keeps the server nodes", async () => {
    const ssrHtml = readSsr("listbox-element-children-ssr.html");
    let firstServerOption: Element | undefined;
    let firstServerTile: Element | null = null;

    const container = await hydrateOverSsr(ssrHtml, () => <ElementChildrenListBoxFixture />, {
      beforeHydrate(container) {
        firstServerOption = container.querySelectorAll('[role="option"]')[0];
        firstServerTile = container.querySelector(".tile");
      },
    });

    const options = container.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options.length).toBe(4);
    const tiles = container.querySelectorAll<HTMLElement>(".tile");
    expect(tiles.length).toBe(4);
    // Hydration adopted the exact server nodes rather than discarding them for
    // client-created ones.
    expect(options[0]).toBe(firstServerOption);
    expect(tiles[0]).toBe(firstServerTile);
    expect(tiles[0]!.parentElement).toBe(options[0]);
    expect(options[0]).toHaveTextContent("Item 0");
    expect(options[0]!.querySelector(".tile-meta")).toHaveTextContent("Grid item");
  });
});
