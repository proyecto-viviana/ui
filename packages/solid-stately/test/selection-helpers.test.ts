/**
 * Tests for the selection foundation primitives ported from upstream:
 * the Selection class (Set subclass with anchor/current) and the
 * collection-order helpers (getChildNodes / get*Item / compareNodeOrder).
 */

import { describe, it, expect } from "vitest";
import { ListCollection } from "../src/collections/ListCollection";
import type { CollectionNode } from "../src/collections/types";
import {
  getChildNodes,
  getFirstItem,
  getNthItem,
  getLastItem,
  compareNodeOrder,
} from "../src/collections";
import { Selection } from "../src/selection/Selection";

describe("Selection", () => {
  it("is a Set of keys", () => {
    const sel = new Selection(["a", "b"]);
    expect(sel).toBeInstanceOf(Set);
    expect(sel.has("a")).toBe(true);
    expect(sel.has("b")).toBe(true);
    expect(sel.size).toBe(2);
  });

  it("defaults anchor and current keys to null", () => {
    const sel = new Selection(["a"]);
    expect(sel.anchorKey).toBeNull();
    expect(sel.currentKey).toBeNull();
  });

  it("stores explicit anchor and current keys", () => {
    const sel = new Selection(["a", "b", "c"], "a", "c");
    expect(sel.anchorKey).toBe("a");
    expect(sel.currentKey).toBe("c");
  });

  it("copies anchor/current from another Selection", () => {
    const base = new Selection(["a", "b"], "a", "b");
    const copy = new Selection(base);
    expect(copy.anchorKey).toBe("a");
    expect(copy.currentKey).toBe("b");
    expect([...copy]).toEqual(["a", "b"]);
  });

  it("lets explicit anchor/current override the copied Selection's", () => {
    const base = new Selection(["a", "b"], "a", "b");
    const copy = new Selection(base, "b", "a");
    expect(copy.anchorKey).toBe("b");
    expect(copy.currentKey).toBe("a");
  });
});

describe("collection order helpers", () => {
  function item<T = unknown>(
    key: string,
    index: number,
    parentKey: string | null,
    level: number,
    childNodes: CollectionNode<T>[] = [],
  ): CollectionNode<T> {
    return {
      type: "item",
      key,
      value: null,
      textValue: key,
      rendered: null,
      level,
      index,
      parentKey,
      hasChildNodes: childNodes.length > 0,
      childNodes,
    };
  }

  // a (0)
  // b (1)
  //   b1 (0)
  //   b2 (1)
  const b1 = item("b1", 0, "b", 1);
  const b2 = item("b2", 1, "b", 1);
  const a = item("a", 0, null, 0);
  const b = item("b", 1, null, 0, [b1, b2]);
  const collection = new ListCollection([a, b]);

  describe("getNthItem / getFirstItem / getLastItem", () => {
    it("returns the nth item", () => {
      expect(getNthItem(["a", "b", "c"], 1)).toBe("b");
    });

    it("returns undefined for a negative or out-of-range index", () => {
      expect(getNthItem(["a", "b"], -1)).toBeUndefined();
      expect(getNthItem(["a", "b"], 5)).toBeUndefined();
    });

    it("returns the first item", () => {
      expect(getFirstItem(["a", "b", "c"])).toBe("a");
      expect(getFirstItem([])).toBeUndefined();
    });

    it("returns the last item", () => {
      expect(getLastItem(["a", "b", "c"])).toBe("c");
      expect(getLastItem([])).toBeUndefined();
    });
  });

  describe("getChildNodes", () => {
    it("returns a node's children via the collection", () => {
      expect([...getChildNodes(b, collection)].map((n) => n.key)).toEqual(["b1", "b2"]);
    });

    it("returns an empty iterable for a leaf node", () => {
      expect([...getChildNodes(a, collection)]).toEqual([]);
    });
  });

  describe("compareNodeOrder", () => {
    it("compares siblings by index", () => {
      expect(compareNodeOrder(collection, a, b)).toBeLessThan(0);
      expect(compareNodeOrder(collection, b, a)).toBeGreaterThan(0);
      expect(compareNodeOrder(collection, b1, b2)).toBeLessThan(0);
    });

    it("orders a top-level node before a node in a later subtree", () => {
      expect(compareNodeOrder(collection, a, b1)).toBeLessThan(0);
      expect(compareNodeOrder(collection, b1, a)).toBeGreaterThan(0);
    });

    it("orders a parent before its descendant", () => {
      expect(compareNodeOrder(collection, b, b1)).toBeLessThan(0);
      expect(compareNodeOrder(collection, b1, b)).toBeGreaterThan(0);
    });
  });
});
