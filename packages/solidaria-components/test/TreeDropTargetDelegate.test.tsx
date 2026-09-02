/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import type { DropTarget, ItemDropTarget, Key } from "@proyecto-viviana/solid-stately";
import { createTreeDropTargetDelegate } from "../src/Tree";

interface MockNode {
  type: string;
  key: Key;
  parentKey?: Key | null;
  nextKey?: Key | null;
  hasChildNodes?: boolean;
  level?: number;
}

function createMockCollection(nodes: MockNode[]) {
  const byKey = new Map(nodes.map((node) => [node.key, node]));
  const items = nodes.filter((node) => node.type === "item");
  return {
    *[Symbol.iterator]() {
      yield* items;
    },
    getItem(key: Key) {
      return byKey.get(key) ?? null;
    },
    getChildren(key: Key) {
      return nodes.filter((node) => node.parentKey === key);
    },
    getKeyAfter(key: Key) {
      const index = items.findIndex((node) => node.key === key);
      return index >= 0 ? (items[index + 1]?.key ?? null) : null;
    },
    getKeyBefore(key: Key) {
      const index = items.findIndex((node) => node.key === key);
      return index > 0 ? (items[index - 1]?.key ?? null) : null;
    },
    getFirstKey() {
      return items[0]?.key ?? null;
    },
    getLastKey() {
      return items[items.length - 1]?.key ?? null;
    },
  };
}

describe("createTreeDropTargetDelegate", () => {
  it("inserts after the last item instead of escalating to a generated TableBody ancestor", () => {
    const collection = createMockCollection([
      { type: "header", key: "body", hasChildNodes: true, level: 0 },
      {
        type: "item",
        key: "b1",
        parentKey: "body",
        nextKey: "b2",
        hasChildNodes: false,
        level: 1,
      },
      {
        type: "item",
        key: "b2",
        parentKey: "body",
        nextKey: null,
        hasChildNodes: false,
        level: 1,
      },
    ]);
    const base = {
      getDropTargetFromPoint: (): ItemDropTarget => ({
        type: "item",
        key: "b2",
        dropPosition: "after",
      }),
    };
    const delegate = createTreeDropTargetDelegate(
      base,
      { collection, expandedKeys: new Set() } as Parameters<typeof createTreeDropTargetDelegate>[1],
      "ltr",
    );

    // Same pointer path as RAC Table.test.js: move downward and horizontally so
    // the tree delegate's ancestor walk would otherwise escalate to TableBody.
    delegate.getDropTargetFromPoint(100, 50, (_target: DropTarget) => true);
    delegate.getDropTargetFromPoint(100, 50, (_target: DropTarget) => true);
    delegate.getDropTargetFromPoint(70, 50, (_target: DropTarget) => true);
    const target = delegate.getDropTargetFromPoint(70, 75, (_target: DropTarget) => true);
    expect(target).toEqual({ type: "item", key: "b2", dropPosition: "after" });
  });
});
