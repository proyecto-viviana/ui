import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createDroppableItem } from "../src/dnd/createDroppableItem";
import type { DroppableCollectionState } from "@proyecto-viviana/solid-stately";

afterEach(() => {
  vi.useRealTimers();
});

describe("createDroppableItem", () => {
  it("activates on-target after hover timeout", () => {
    vi.useFakeTimers();
    const activateTarget = vi.fn();
    const setTarget = vi.fn();
    const state = {
      get target() {
        return null;
      },
      get isDropTarget() {
        return false;
      },
      get isDisabled() {
        return false;
      },
      setTarget,
      activateTarget,
      exitTarget() {},
      enterTarget() {},
      moveToTarget() {},
      drop() {},
      isAccepted() {
        return true;
      },
      shouldAcceptItemDrop() {
        return true;
      },
      getDropOperation() {
        return "move" as const;
      },
    } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;

    createRoot((dispose) => {
      const element = {
        getBoundingClientRect: () => ({ x: 0, y: 0, height: 100 }),
      } as unknown as HTMLElement;
      const { dropProps } = createDroppableItem(
        () => ({
          key: 1,
          ref: () => element,
        }),
        state,
      );

      const event = {
        preventDefault() {},
        stopPropagation() {},
        clientX: 12,
        clientY: 50,
        currentTarget: element,
        dataTransfer: {
          effectAllowed: "all",
          dropEffect: "none",
          types: [],
          items: [{ kind: "string", type: "text/plain" }],
        },
      } as unknown as DragEvent;

      dropProps.onDragOver?.(event);
      expect(setTarget).toHaveBeenCalledWith({ type: "item", key: 1, dropPosition: "on" });
      expect(activateTarget).not.toHaveBeenCalled();

      vi.advanceTimersByTime(800);
      expect(activateTarget).toHaveBeenCalledWith(12, 50);
      dispose();
    });
  });
});
