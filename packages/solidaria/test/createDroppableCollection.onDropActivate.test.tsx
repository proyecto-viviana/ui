import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import type { DropTarget, DroppableCollectionState } from "@proyecto-viviana/solid-stately";

let capturedOptionsAccessor:
  | (() => {
      onDropActivate?: (e: { x: number; y: number }) => void;
    })
  | null = null;

vi.mock("../src/dnd/createDrop", () => ({
  createDrop: (optionsAccessor: typeof capturedOptionsAccessor) => {
    capturedOptionsAccessor = optionsAccessor;
    return {
      dropProps: {},
      isDropTarget: false,
      dropButtonProps: {},
    };
  },
}));

import { createDroppableCollection } from "../src/dnd/createDroppableCollection";

describe("createDroppableCollection onDropActivate semantics", () => {
  beforeEach(() => {
    capturedOptionsAccessor = null;
  });

  it("only forwards onDropActivate for item on-targets", () => {
    const onDropActivate = vi.fn();
    let currentTarget: DropTarget | null = { type: "item", key: 1, dropPosition: "before" };

    const state = {
      get target() {
        return currentTarget;
      },
      get isDropTarget() {
        return currentTarget != null;
      },
      get isDisabled() {
        return false;
      },
      setTarget() {},
      activateTarget() {},
      exitTarget() {},
      getDropOperation() {
        return "move" as const;
      },
      enterTarget() {},
      moveToTarget() {},
      drop() {},
      isAccepted() {
        return true;
      },
      shouldAcceptItemDrop() {
        return true;
      },
    } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;

    createRoot((dispose) => {
      createDroppableCollection(
        () => ({
          ref: () => null,
          dropTargetDelegate: {
            getDropTargetFromPoint() {
              return null;
            },
          },
          onDropActivate,
        }),
        state,
      );

      expect(capturedOptionsAccessor).toBeTypeOf("function");

      capturedOptionsAccessor?.().onDropActivate?.({ x: 10, y: 20 });
      expect(onDropActivate).not.toHaveBeenCalled();

      currentTarget = { type: "item", key: 1, dropPosition: "on" };
      capturedOptionsAccessor?.().onDropActivate?.({ x: 11, y: 21 });
      expect(onDropActivate).toHaveBeenCalledTimes(1);
      expect(onDropActivate).toHaveBeenCalledWith({
        target: { type: "item", key: 1, dropPosition: "on" },
        x: 11,
        y: 21,
      });

      dispose();
    });
  });
});
