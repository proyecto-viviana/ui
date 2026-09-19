import { describe, it, expect, vi } from "vite-plus/test"; import { flush, createRoot } from "solid-js";
import { createDraggableCollectionState } from "../src/dnd/createDraggableCollectionState";

describe("createDraggableCollectionState", () => {
  it("should initialize with isDragging false and empty draggingKeys", () => {
    createRoot((dispose) => {
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
      }));

      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(state.draggingKeys.size).toBe(0);
      dispose();
    });
  });

  it("should set isDragging true and track keys when startDrag is called", () => {
    createRoot((dispose) => {
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
      }));

      const keys = new Set(["item-1", "item-2"]);
      state.startDrag(keys, 100, 100);

      flush();
      expect(state.isDragging).toBe(true);
      flush();
      expect(state.draggingKeys).toEqual(keys);
      dispose();
    });
  });

  it("should call onDragStart callback with keys", () => {
    createRoot((dispose) => {
      const onDragStart = vi.fn();
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragStart,
      }));

      const keys = new Set(["item-1"]);
      state.startDrag(keys, 100, 200);
      flush();
      expect(onDragStart).toHaveBeenCalledWith({
        type: "dragstart",
        x: 100,
        y: 200,
        keys,
      });
      dispose();
    });
  });

  it("should call onDragMove callback with keys", () => {
    createRoot((dispose) => {
      const onDragMove = vi.fn();
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragMove,
      }));

      const keys = new Set(["item-1"]);
      state.startDrag(keys, 100, 100);
      state.moveDrag(150, 150);
      flush();
      expect(onDragMove).toHaveBeenCalledWith({
        type: "dragmove",
        x: 150,
        y: 150,
        keys,
      });
      dispose();
    });
  });

  it("should call onDragEnd callback with keys and isInternal", () => {
    createRoot((dispose) => {
      const onDragEnd = vi.fn();
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragEnd,
      }));

      const keys = new Set(["item-1", "item-2"]);
      state.startDrag(keys, 100, 100);
      state.endDrag(200, 200, "move", true);

      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(state.draggingKeys.size).toBe(0);
      flush();
      expect(onDragEnd).toHaveBeenCalledWith({
        type: "dragend",
        x: 200,
        y: 200,
        dropOperation: "move",
        keys,
        isInternal: true,
      });
      dispose();
    });
  });

  it("should cancel drag operation", () => {
    createRoot((dispose) => {
      const onDragEnd = vi.fn();
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragEnd,
      }));

      const keys = new Set(["item-1"]);
      state.startDrag(keys, 100, 100);
      state.cancelDrag();

      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(onDragEnd).toHaveBeenCalledWith({
        type: "dragend",
        x: 0,
        y: 0,
        dropOperation: "cancel",
        keys,
        isInternal: false,
      });
      dispose();
    });
  });

  it("should not start drag when disabled", () => {
    createRoot((dispose) => {
      const onDragStart = vi.fn();
      const state = createDraggableCollectionState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragStart,
        isDisabled: true,
      }));

      state.startDrag(new Set(["item-1"]), 100, 100);
      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(state.draggingKeys.size).toBe(0);
      flush();
      expect(onDragStart).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("should get items for specific keys", () => {
    createRoot((dispose) => {
      const getItems = vi.fn().mockReturnValue([{ "text/plain": "item data" }]);
      const state = createDraggableCollectionState(() => ({
        getItems,
      }));

      const keys = new Set(["item-1", "item-2"]);
      const result = state.getItems(keys);

      flush();
      expect(getItems).toHaveBeenCalledWith(keys);
      flush();
      expect(result).toEqual([{ "text/plain": "item data" }]);
      dispose();
    });
  });

  it("should return allowed drop operations", () => {
    createRoot((dispose) => {
      const state = createDraggableCollectionState(() => ({
        getItems: () => [],
        getAllowedDropOperations: () => ["copy"],
      }));

      flush();
      expect(state.getAllowedDropOperations()).toEqual(["copy"]);
      dispose();
    });
  });

  it("should return default allowed operations when not specified", () => {
    createRoot((dispose) => {
      const state = createDraggableCollectionState(() => ({
        getItems: () => [],
      }));

      flush();
      expect(state.getAllowedDropOperations()).toEqual(["move", "copy", "link"]);
      dispose();
    });
  });

  it("should expose preview ref", () => {
    createRoot((dispose) => {
      const preview = { current: vi.fn() };
      const state = createDraggableCollectionState(() => ({
        getItems: () => [],
        preview,
      }));

      flush();
      expect(state.preview).toBe(preview);
      dispose();
    });
  });

  it("drags every selected key that is not a selected descendant", () => {
    createRoot((dispose) => {
      const collection = {
        getItem(key: string) {
          if (key === "child") return { parentKey: "parent" };
          return { parentKey: null };
        },
        getKeys() {
          return ["parent", "child", "other"];
        },
      };
      const selected = new Set(["parent", "child", "other"]);
      const state = createDraggableCollectionState(() => ({
        getItems: () => [],
        collection,
        selectedKeys: selected,
        isSelected: (key) => selected.has(String(key)),
      }));

      flush();
      expect([...state.getKeysForDrag("other")].sort()).toEqual(["other", "parent"]);
      flush();
      expect([...state.getKeysForDrag("solo")]).toEqual(["solo"]);
      dispose();
    });
  });
});
