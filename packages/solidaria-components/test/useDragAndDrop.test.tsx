/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoot } from "solid-js";
import type { JSX } from "solid-js";
import { useDragAndDrop } from "../src/useDragAndDrop";
import { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";
import type {
  DropTarget,
  DroppableCollectionState,
  DragPreviewRenderer,
} from "@proyecto-viviana/solid-stately";
import { setGlobalDraggingCollectionRef, setGlobalDraggingKeys } from "@proyecto-viviana/solidaria";

afterEach(() => {
  setGlobalDraggingCollectionRef(null);
  setGlobalDraggingKeys(new Set());
});

describe("useDragAndDrop", () => {
  it("returns draggable hooks when getItems is provided", () => {
    const { dragAndDropHooks } = useDragAndDrop({
      items: [{ id: "a" }],
      getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
    });

    expect(typeof dragAndDropHooks.useDraggableCollectionState).toBe("function");
    expect(typeof dragAndDropHooks.useDraggableCollection).toBe("function");
    expect(typeof dragAndDropHooks.useDraggableItem).toBe("function");
    expect(typeof dragAndDropHooks.DragPreview).toBe("function");
  });

  it("returns droppable hooks when drop handlers are provided", () => {
    const { dragAndDropHooks } = useDragAndDrop({
      onInsert: () => {},
    });

    expect(typeof dragAndDropHooks.useDroppableCollectionState).toBe("function");
    expect(typeof dragAndDropHooks.useDroppableCollection).toBe("function");
    expect(typeof dragAndDropHooks.useDroppableItem).toBe("function");
    expect(typeof dragAndDropHooks.useDropIndicator).toBe("function");
    expect(typeof dragAndDropHooks.ListDropTargetDelegate).toBe("function");
  });

  it("wires renderDragPreview into draggable collection state when preview is not provided", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        items: [{ id: "a" }],
        getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
        renderDragPreview: () => document.createElement("div"),
      });

      const dragState = dragAndDropHooks.useDraggableCollectionState?.({
        items: [{ id: "a" }],
      });

      expect(typeof dragState?.preview?.current).toBe("function");
      dispose();
    });
  });

  it("prefers explicit preview over renderDragPreview wiring", () => {
    createRoot((dispose) => {
      const preview = { current: () => {} };
      const { dragAndDropHooks } = useDragAndDrop({
        items: [{ id: "a" }],
        getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
        preview,
        renderDragPreview: () => document.createElement("div"),
      });

      const dragState = dragAndDropHooks.useDraggableCollectionState?.({
        items: [{ id: "a" }],
      });

      expect(dragState?.preview).toBe(preview);
      dispose();
    });
  });

  // NOTE: the pre-port droppable adapter exposed a self-contained
  // `collectionProps.onKeyDown` navigation engine plus an invented `onKeyDown`
  // passthrough option. Neither exists upstream — `DragAndDropOptions`
  // (RAC 1.19.0) has no `onKeyDown`, and `useDroppableCollection` routes
  // keyboard-drag navigation through the framework-agnostic `DragManager`
  // singleton during an active drag session, not a DOM `onKeyDown` on the
  // collection element (see `createDroppableCollection.ts` — the DragManager
  // DropTarget's `onKeyDown(e, drag)`). The faithful port (CP9.57) removed both
  // inventions, so the former white-box unit test asserted a contract that no
  // longer exists. Keyboard-drag reorder navigation is now certified end-to-end
  // against the RAC oracle in
  // `apps/comparison/e2e/certified/dnd-listbox.certified.spec.ts` (the D-reorder
  // driver), which is the authoritative oracle for this behavior.

  it("forwards onDrop through droppable collection adapter", () => {
    createRoot((dispose) => {
      const onDrop = vi.fn();
      const { dragAndDropHooks } = useDragAndDrop({
        onDrop,
      });

      const dropState = dragAndDropHooks.useDroppableCollectionState?.({});
      expect(dropState).toBeDefined();
      if (!dropState || !dragAndDropHooks.useDroppableCollection) {
        dispose();
        return;
      }

      const root = document.createElement("div");
      root.setAttribute("id", "adapter-drop-root");
      document.body.append(root);

      const droppableCollection = dragAndDropHooks.useDroppableCollection(
        {
          dropTargetDelegate: {
            getDropTargetFromPoint: () => ({ type: "item", key: "row-1", dropPosition: "on" }),
          },
        },
        dropState,
        () => root,
      );

      const dataTransfer = {
        effectAllowed: "all",
        dropEffect: "none",
        items: [{ kind: "string", type: "text/plain" }],
        types: ["text/plain"],
        getData: () => "payload",
      } as unknown as DataTransfer;

      const onDragEnter = droppableCollection.collectionProps.onDragEnter as
        | ((e: DragEvent) => void)
        | undefined;
      const onDragOver = droppableCollection.collectionProps.onDragOver as
        | ((e: DragEvent) => void)
        | undefined;
      const onDropHandler = droppableCollection.collectionProps.onDrop as
        | ((e: DragEvent) => void)
        | undefined;

      const makeEvent = (x: number, y: number): DragEvent =>
        ({
          preventDefault: () => {},
          stopPropagation: () => {},
          currentTarget: root,
          target: root,
          clientX: x,
          clientY: y,
          dataTransfer,
        }) as unknown as DragEvent;

      onDragEnter?.(makeEvent(1, 1));
      onDragOver?.(makeEvent(2, 2));
      onDropHandler?.(makeEvent(2, 2));

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "drop",
          target: { type: "item", key: "row-1", dropPosition: "on" },
          dropOperation: "move",
        }),
      );

      root.remove();
      dispose();
    });
  });

  it("provides a usable ListDropTargetDelegate fallback", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        onInsert: () => {},
      });

      const root = document.createElement("div");
      const delegate = new dragAndDropHooks.ListDropTargetDelegate!(
        [{ type: "item", key: "row-1" }],
        () => root,
      );

      const target = delegate.getDropTargetFromPoint(0, 0, () => true);
      expect(target.type).toBe("item");
      if (target.type === "item") {
        expect(target.key).toBe("row-1");
      }

      dispose();
    });
  });

  it("returns drop indicator aria contract from useDropIndicator", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        onInsert: () => {},
      });

      const state = {
        target: { type: "item", key: "row-1", dropPosition: "before" as const },
      } as unknown as DroppableCollectionState;

      const result = dragAndDropHooks.useDropIndicator?.(
        { target: { type: "item", key: "row-1", dropPosition: "before" } as DropTarget },
        state,
        () => null,
      );

      expect(result?.isDropTarget).toBe(true);
      expect(result?.isHidden).toBe(false);
      expect(result?.dropIndicatorProps).toEqual(
        expect.objectContaining({
          role: "option",
          tabIndex: -1,
        }),
      );

      dispose();
    });
  });

  it("preserves symbol accepted drag types through droppable state wiring", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        onInsert: () => {},
        acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
      });

      const dropState = dragAndDropHooks.useDroppableCollectionState?.({});
      expect(dropState).toBeDefined();
      const accepted = dropState?.isAccepted({
        has: (type) => type === DIRECTORY_DRAG_TYPE,
      });
      expect(accepted).toBe(true);

      dispose();
    });
  });

  it("wires DragPreview ref renderer in draggable hooks", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        items: [{ id: "a" }],
        getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
      });

      const previewRef: { current: DragPreviewRenderer | null } = {
        current: null,
      };
      const DragPreviewComp = dragAndDropHooks.DragPreview;
      expect(typeof DragPreviewComp).toBe("function");

      DragPreviewComp?.({
        ref: previewRef,
        children: () => document.createElement("div") as unknown as JSX.Element,
      });

      expect(typeof previewRef.current).toBe("function");

      let node: HTMLElement | null = null;
      previewRef.current?.([{ "text/plain": "a" }], (el) => {
        node = el;
      });
      expect(node).toBeInstanceOf(HTMLElement);

      dispose();
      expect(previewRef.current).toBeNull();
    });
  });

  it("reports active global drag sessions via isVirtualDragging", () => {
    createRoot((dispose) => {
      const { dragAndDropHooks } = useDragAndDrop({
        items: [{ id: "a" }],
        getItems: (keys) => Array.from(keys).map((key) => ({ "text/plain": String(key) })),
      });

      expect(dragAndDropHooks.isVirtualDragging?.()).toBe(false);

      const el = document.createElement("div");
      setGlobalDraggingCollectionRef(el);
      expect(dragAndDropHooks.isVirtualDragging?.()).toBe(true);

      setGlobalDraggingCollectionRef(null);
      setGlobalDraggingKeys(new Set(["a"]));
      expect(dragAndDropHooks.isVirtualDragging?.()).toBe(true);

      setGlobalDraggingKeys(new Set());
      expect(dragAndDropHooks.isVirtualDragging?.()).toBe(false);

      dispose();
    });
  });
});
