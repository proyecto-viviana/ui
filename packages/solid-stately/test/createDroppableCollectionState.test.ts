import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { ListCollection } from "../src/collections/ListCollection";
import { createDroppableCollectionState } from "../src/dnd/createDroppableCollectionState";
import type { CollectionNode } from "../src/collections/types";

function node(key: string, index: number): CollectionNode<string> {
  return {
    type: "item",
    key,
    value: key,
    textValue: key,
    rendered: null!,
    level: 0,
    index,
    parentKey: null,
    hasChildNodes: false,
    childNodes: [],
  };
}

describe("createDroppableCollectionState", () => {
  it("treats after(item) and before(next) as the same drop gap", () => {
    createRoot((dispose) => {
      const collection = new ListCollection([node("read", 0), node("write", 1), node("admin", 2)]);
      const state = createDroppableCollectionState(() => ({
        collection,
        onReorder: () => {},
      }));

      state.setTarget({ type: "item", key: "read", dropPosition: "after" });

      expect(state.isDropTargetFor({ type: "item", key: "read", dropPosition: "after" })).toBe(
        true,
      );
      expect(state.isDropTargetFor({ type: "item", key: "write", dropPosition: "before" })).toBe(
        true,
      );
      expect(state.isDropTargetFor({ type: "item", key: "read", dropPosition: "before" })).toBe(
        false,
      );
      expect(state.isDropTargetFor({ type: "item", key: "write", dropPosition: "on" })).toBe(false);

      dispose();
    });
  });
});
