/**
 * @vitest-environment jsdom
 *
 * Document scrolling root. Pin: react-aria/src/utils/isScrollable.ts.
 * The root's overflow is `visible` by default, and it still scrolls.
 */

import { afterEach, describe, expect, it } from "vite-plus/test";
import { getScrollParents, isScrollable } from "../src/utils/dom";

function root(): Element {
  return document.scrollingElement || document.documentElement;
}

function box(node: Element, scroll: number, client: number): void {
  for (const key of ["scrollHeight", "scrollWidth"] as const) {
    Object.defineProperty(node, key, { configurable: true, get: () => scroll });
  }
  for (const key of ["clientHeight", "clientWidth"] as const) {
    Object.defineProperty(node, key, { configurable: true, get: () => client });
  }
}

describe("isScrollable", () => {
  const nodes = new Set<Element>();

  afterEach(() => {
    const scrollingRoot = root() as HTMLElement;
    scrollingRoot.style.removeProperty("overflow");
    for (const key of ["scrollHeight", "scrollWidth", "clientHeight", "clientWidth"] as const) {
      delete (scrollingRoot as unknown as Record<string, unknown>)[key];
    }
    for (const node of nodes) {
      node.remove();
    }
    nodes.clear();
  });

  it("treats the scrolling root as scrollable when overflow is not hidden", () => {
    expect(isScrollable(root())).toBe(true);
  });

  it("treats a hidden scrolling root as not scrollable", () => {
    (root() as HTMLElement).style.overflow = "hidden";
    expect(isScrollable(root())).toBe(false);
  });

  it("does not treat another visible element as scrollable", () => {
    const child = document.createElement("div");
    document.body.appendChild(child);
    nodes.add(child);
    expect(isScrollable(child)).toBe(false);
  });

  it("treats another element with overflow auto as scrollable", () => {
    const child = document.createElement("div");
    child.style.overflow = "auto";
    document.body.appendChild(child);
    nodes.add(child);
    expect(isScrollable(child)).toBe(true);
  });

  it("includes the scrolling root when collecting scroll parents", () => {
    const child = document.createElement("div");
    document.body.appendChild(child);
    nodes.add(child);
    expect(getScrollParents(child)).toContain(root());
  });

  it("omits a hidden scrolling root from the scroll parents", () => {
    (root() as HTMLElement).style.overflow = "hidden";
    const child = document.createElement("div");
    document.body.appendChild(child);
    nodes.add(child);
    expect(getScrollParents(child)).not.toContain(root());
  });

  it("still requires the root to overflow when that check is requested", () => {
    box(root(), 200, 100);
    expect(isScrollable(root(), true)).toBe(true);
    box(root(), 100, 100);
    expect(isScrollable(root(), true)).toBe(false);
  });
});
