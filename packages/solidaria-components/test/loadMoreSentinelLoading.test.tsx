/**
 * @vitest-environment jsdom
 *
 * Pin: react-aria/src/utils/useLoadMoreSentinel.ts.
 * An intersection calls onLoadMore even while a load is already in flight.
 * isLoading only chooses whether the spinner is shown.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ListBoxLoadMoreItem } from "../src/ListBox";
import { GridListLoadMoreItem } from "../src/GridList";
import { MenuLoadMoreItem } from "../src/Menu";
import { TableLoadMoreItem } from "../src/Table";
import { TreeLoadMoreItem } from "../src/Tree";

function installObserver(): Array<(intersecting: boolean) => void> {
  const fire: Array<(intersecting: boolean) => void> = [];

  class RecordingObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(callback: IntersectionObserverCallback) {
      fire.push((intersecting) => {
        callback([{ isIntersecting: intersecting } as IntersectionObserverEntry], this);
      });
    }

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = () => [];
  }

  vi.stubGlobal("IntersectionObserver", RecordingObserver);
  return fire;
}

describe("load-more sentinel loading", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each([
    [
      "ListBox",
      (onLoadMore: () => Promise<void>) => (
        <ListBoxLoadMoreItem isLoading onLoadMore={onLoadMore} />
      ),
    ],
    [
      "GridList",
      (onLoadMore: () => Promise<void>) => (
        <GridListLoadMoreItem isLoading onLoadMore={onLoadMore} />
      ),
    ],
    [
      "Menu",
      (onLoadMore: () => Promise<void>) => <MenuLoadMoreItem isLoading onLoadMore={onLoadMore} />,
    ],
    [
      "Table",
      (onLoadMore: () => Promise<void>) => <TableLoadMoreItem isLoading onLoadMore={onLoadMore} />,
    ],
    [
      "Tree",
      (onLoadMore: () => Promise<void>) => <TreeLoadMoreItem isLoading onLoadMore={onLoadMore} />,
    ],
  ])("%s calls onLoadMore for every intersection while loading", (_name, item) => {
    const fire = installObserver();
    let release: (() => void) | undefined;
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );

    render(() => item(onLoadMore) as JSX.Element);

    expect(fire.length, "sentinel observer").toBeGreaterThan(0);
    fire[0]?.(true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    flush();
    fire[0]?.(true);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
    release?.();
  });
});
