/**
 * @vitest-environment jsdom
 *
 * Pin: react-aria/src/utils/useLoadMoreSentinel.ts.
 * The sentinel observes its scroll parent, and the default end direction
 * expands that root on the right, bottom, and left.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { ListBoxLoadMoreItem } from "../src/ListBox";
import { GridListLoadMoreItem } from "../src/GridList";
import { MenuLoadMoreItem } from "../src/Menu";
import { TableLoadMoreItem } from "../src/Table";
import { TreeLoadMoreItem } from "../src/Tree";

function installObserver(): IntersectionObserverInit[] {
  const options: IntersectionObserverInit[] = [];
  class RecordingObserver implements IntersectionObserver {
    readonly root: Element | Document | null;
    readonly rootMargin: string;
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(_callback: IntersectionObserverCallback, init?: IntersectionObserverInit) {
      options.push(init ?? {});
      this.root = init?.root ?? null;
      this.rootMargin = init?.rootMargin ?? "";
    }

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = () => [];
  }

  vi.stubGlobal("IntersectionObserver", RecordingObserver);
  return options;
}

function renderInScroller(child: JSX.Element): HTMLElement {
  const view = render(() => (
    <div data-testid="scroller" style={{ overflow: "auto", height: "40px" }}>
      {child}
    </div>
  ));
  const scroller = view.getByTestId("scroller");
  expect(scroller).toBeInstanceOf(HTMLElement);
  return scroller;
}

function sentinelIn(scroller: HTMLElement): HTMLElement {
  const marked = scroller.querySelector("[data-testid='loadMoreSentinel']");
  const node =
    marked ??
    [...scroller.querySelectorAll("div")].find((element) => element.style.height === "1px");
  expect(node, "load-more sentinel").toBeInstanceOf(HTMLElement);
  return node as HTMLElement;
}

describe("load-more sentinel", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each([
    ["ListBox", () => <ListBoxLoadMoreItem onLoadMore={() => {}} />],
    ["GridList", () => <GridListLoadMoreItem onLoadMore={() => {}} />],
    ["Menu", () => <MenuLoadMoreItem onLoadMore={() => {}} />],
    ["Table", () => <TableLoadMoreItem onLoadMore={() => {}} />],
    ["Tree", () => <TreeLoadMoreItem onLoadMore={() => {}} />],
  ])("%s observes the scroll parent with the end margin", (_name, item) => {
    const options = installObserver();
    const scroller = renderInScroller(item());
    const sentinel = sentinelIn(scroller);

    expect(options.length).toBeGreaterThan(0);
    expect(options[0]?.root).toBe(scroller);
    expect(options[0]?.rootMargin).toBe("0px 100% 100% 100%");
    expect(sentinel.isConnected).toBe(true);
  });
});
