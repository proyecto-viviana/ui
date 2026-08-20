import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createDropState } from "../src/dnd/createDropState";

describe("createDropState", () => {
  it("should initialize with isDropTarget false", () => {
    createRoot((dispose) => {
      const state = createDropState(() => ({}));

      expect(state.isDropTarget).toBe(false);
      dispose();
    });
  });

  it("should set isDropTarget true when enterTarget is called", () => {
    createRoot((dispose) => {
      const state = createDropState(() => ({}));

      state.enterTarget(100, 100);
      expect(state.isDropTarget).toBe(true);
      dispose();
    });
  });

  it("should call onDropEnter callback", () => {
    createRoot((dispose) => {
      const onDropEnter = vi.fn();
      const state = createDropState(() => ({
        onDropEnter,
      }));

      state.enterTarget(100, 200);
      expect(onDropEnter).toHaveBeenCalledWith({
        type: "dropenter",
        x: 100,
        y: 200,
      });
      dispose();
    });
  });

  it("should call onDropMove callback", () => {
    createRoot((dispose) => {
      const onDropMove = vi.fn();
      const state = createDropState(() => ({
        onDropMove,
      }));

      state.enterTarget(100, 100);
      state.moveInTarget(150, 150);
      expect(onDropMove).toHaveBeenCalledWith({
        type: "dropmove",
        x: 150,
        y: 150,
      });
      dispose();
    });
  });

  it("should not call onDropMove if not a drop target", () => {
    createRoot((dispose) => {
      const onDropMove = vi.fn();
      const state = createDropState(() => ({
        onDropMove,
      }));

      state.moveInTarget(150, 150);
      expect(onDropMove).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("should call onDropActivate callback", () => {
    createRoot((dispose) => {
      const onDropActivate = vi.fn();
      const state = createDropState(() => ({
        onDropActivate,
      }));

      state.enterTarget(100, 100);
      state.activateTarget(100, 100);
      expect(onDropActivate).toHaveBeenCalledWith({
        type: "dropactivate",
        x: 100,
        y: 100,
      });
      dispose();
    });
  });

  it("should call onDropExit callback and set isDropTarget to false", () => {
    createRoot((dispose) => {
      const onDropExit = vi.fn();
      const state = createDropState(() => ({
        onDropExit,
      }));

      state.enterTarget(100, 100);
      expect(state.isDropTarget).toBe(true);

      state.exitTarget(200, 200);
      expect(state.isDropTarget).toBe(false);
      expect(onDropExit).toHaveBeenCalledWith({
        type: "dropexit",
        x: 200,
        y: 200,
      });
      dispose();
    });
  });

  it("should call onDrop callback", () => {
    createRoot((dispose) => {
      const onDrop = vi.fn();
      const state = createDropState(() => ({
        onDrop,
      }));

      const items = [
        {
          kind: "text" as const,
          types: new Set(["text/plain"]),
          getText: () => Promise.resolve("test"),
        },
      ];
      state.enterTarget(100, 100);
      state.drop(200, 200, items, "move");

      expect(state.isDropTarget).toBe(false);
      expect(onDrop).toHaveBeenCalledWith({
        type: "drop",
        x: 200,
        y: 200,
        items,
        dropOperation: "move",
      });
      dispose();
    });
  });

  it("should not enter target when disabled", () => {
    createRoot((dispose) => {
      const onDropEnter = vi.fn();
      const state = createDropState(() => ({
        onDropEnter,
        isDisabled: true,
      }));

      state.enterTarget(100, 100);
      expect(state.isDropTarget).toBe(false);
      expect(onDropEnter).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("should expose isDisabled state", () => {
    createRoot((dispose) => {
      const state = createDropState(() => ({
        isDisabled: true,
      }));

      expect(state.isDisabled).toBe(true);
      dispose();
    });
  });

  it("should get drop operation from callback", () => {
    createRoot((dispose) => {
      const state = createDropState(() => ({
        getDropOperation: () => "copy",
      }));

      const types = { has: () => true };
      expect(state.getDropOperation(types, ["move", "copy"])).toBe("copy");
      dispose();
    });
  });

  it("should return first allowed operation if no callback", () => {
    createRoot((dispose) => {
      const state = createDropState(() => ({}));

      const types = { has: () => true };
      expect(state.getDropOperation(types, ["link", "copy"])).toBe("link");
      dispose();
    });
  });
});
