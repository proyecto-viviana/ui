import { describe, it, expect, vi } from "vite-plus/test"; import { flush, createRoot } from "solid-js";
import { createDragState } from "../src/dnd/createDragState";

describe("createDragState", () => {
  it("should initialize with isDragging false", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
      }));

      flush();
      expect(state.isDragging).toBe(false);
      dispose();
    });
  });

  it("should set isDragging true when startDrag is called", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
      }));

      state.startDrag(100, 100);
      flush();
      expect(state.isDragging).toBe(true);
      dispose();
    });
  });

  it("should call onDragStart callback", () => {
    createRoot((dispose) => {
      const onDragStart = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragStart,
      }));

      state.startDrag(100, 200);
      flush();
      expect(onDragStart).toHaveBeenCalledWith({
        type: "dragstart",
        x: 100,
        y: 200,
      });
      dispose();
    });
  });

  it("should call onDragMove callback", () => {
    createRoot((dispose) => {
      const onDragMove = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragMove,
      }));

      state.startDrag(100, 100);
      state.moveDrag(150, 150);
      flush();
      expect(onDragMove).toHaveBeenCalledWith({
        type: "dragmove",
        x: 150,
        y: 150,
      });
      dispose();
    });
  });

  it("should not call onDragMove if not dragging", () => {
    createRoot((dispose) => {
      const onDragMove = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragMove,
      }));

      state.moveDrag(150, 150);
      flush();
      expect(onDragMove).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("should call onDragEnd callback and set isDragging to false", () => {
    createRoot((dispose) => {
      const onDragEnd = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragEnd,
      }));

      state.startDrag(100, 100);
      flush();
      expect(state.isDragging).toBe(true);

      state.endDrag(200, 200, "move");
      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(onDragEnd).toHaveBeenCalledWith({
        type: "dragend",
        x: 200,
        y: 200,
        dropOperation: "move",
      });
      dispose();
    });
  });

  it("should cancel drag operation", () => {
    createRoot((dispose) => {
      const onDragEnd = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragEnd,
      }));

      state.startDrag(100, 100);
      state.cancelDrag();
      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(onDragEnd).toHaveBeenCalledWith({
        type: "dragend",
        x: 0,
        y: 0,
        dropOperation: "cancel",
      });
      dispose();
    });
  });

  it("should not start drag when disabled", () => {
    createRoot((dispose) => {
      const onDragStart = vi.fn();
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        onDragStart,
        isDisabled: true,
      }));

      state.startDrag(100, 100);
      flush();
      expect(state.isDragging).toBe(false);
      flush();
      expect(onDragStart).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("should return items from getItems", () => {
    createRoot((dispose) => {
      const items = [{ "text/plain": "hello", "text/html": "<b>hello</b>" }];
      const state = createDragState(() => ({
        getItems: () => items,
      }));

      flush();
      expect(state.getItems()).toEqual(items);
      dispose();
    });
  });

  it("should return allowed drop operations", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        getAllowedDropOperations: () => ["copy", "link"],
      }));

      flush();
      expect(state.getAllowedDropOperations()).toEqual(["copy", "link"]);
      dispose();
    });
  });

  it("should return default allowed operations when not specified", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
      }));

      flush();
      expect(state.getAllowedDropOperations()).toEqual(["move", "copy", "link"]);
      dispose();
    });
  });

  it("should expose isDisabled state", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        isDisabled: true,
      }));

      flush();
      expect(state.isDisabled).toBe(true);
      dispose();
    });
  });

  it("should expose hasDragButton state", () => {
    createRoot((dispose) => {
      const state = createDragState(() => ({
        getItems: () => [{ "text/plain": "test" }],
        hasDragButton: true,
      }));

      flush();
      expect(state.hasDragButton).toBe(true);
      dispose();
    });
  });
});
