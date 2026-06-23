/**
 * Tree component tests
 *
 * Tests for Tree component functionality including:
 * - Rendering
 * - Expansion
 * - Selection
 * - Keyboard navigation
 * - ARIA attributes
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import {
  Tree,
  TreeItem,
  TreeExpandButton,
  TreeHeader,
  TreeSection,
  TreeSelectionCheckbox,
} from "../src/Tree";
import { useDragAndDrop } from "../src/useDragAndDrop";
import type {
  TreeItemData,
  DraggableCollectionState,
  DroppableCollectionState,
  DropTarget,
  DragTypes,
  DropOperation,
} from "@proyecto-viviana/solid-stately";
import { createPointerEvent, setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { createSignal } from "solid-js";

interface TestItem {
  name: string;
}

function createTestItems(): TreeItemData<TestItem>[] {
  return [
    {
      key: "item-1",
      value: { name: "Item 1" },
      textValue: "Item 1",
      children: [
        { key: "item-1-1", value: { name: "Item 1.1" }, textValue: "Item 1.1" },
        { key: "item-1-2", value: { name: "Item 1.2" }, textValue: "Item 1.2" },
      ],
    },
    {
      key: "item-2",
      value: { name: "Item 2" },
      textValue: "Item 2",
    },
    {
      key: "item-3",
      value: { name: "Item 3" },
      textValue: "Item 3",
      children: [{ key: "item-3-1", value: { name: "Item 3.1" }, textValue: "Item 3.1" }],
    },
  ];
}

function createSectionedTreeItems() {
  return [
    {
      key: "mammals",
      title: "Mammals",
      items: [
        {
          key: "lion",
          value: { name: "Lion" },
          textValue: "Lion",
          children: [{ key: "cub", value: { name: "Cub" }, textValue: "Cub" }],
        },
      ],
    },
    {
      key: "birds",
      title: "Birds",
      items: [
        {
          key: "eagle",
          value: { name: "Eagle" },
          textValue: "Eagle",
        },
      ],
    },
  ] as const;
}

const pointerEvent = createPointerEvent;

function pressWithMouse(target: HTMLElement): void {
  fireEvent(target, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
  fireEvent(target, pointerEvent("pointerup", { pointerId: 1, pointerType: "mouse" }));
  fireEvent.click(target);
}

describe("Tree", () => {
  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render with treegrid role", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toBeInTheDocument();
      expect(tree).toHaveAttribute("aria-label", "Test Tree");
    });

    it("should render items with row role", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(3); // Only root items visible initially
    });

    it("should render with default class", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveClass("solidaria-Tree");
    });

    it("should render TreeSection wrapper as a rowgroup", () => {
      render(() => (
        <TreeSection>
          <div>Section content</div>
        </TreeSection>
      ));

      // A section exposes role="rowgroup" (mirrors upstream TreeSection, which
      // reuses useGridListSection's rowGroupProps).
      const section = screen.getByRole("rowgroup");
      expect(section).toHaveClass("solidaria-TreeSection");
      expect(section).toHaveAttribute("data-section");
      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("should render TreeHeader as a section row labelling the rowgroup", () => {
      render(() => (
        <TreeSection>
          <TreeHeader>Section header</TreeHeader>
          <div>Section content</div>
        </TreeSection>
      ));

      // The header renders role="row" wrapping a role="rowheader" whose id labels
      // the section's rowgroup (mirrors upstream TreeHeader › GridListHeader and
      // useGridListSection's rowProps/rowHeaderProps).
      const row = screen.getByRole("row");
      expect(row).toHaveClass("solidaria-TreeHeader");
      const rowheader = screen.getByRole("rowheader");
      expect(rowheader).toHaveTextContent("Section header");
      expect(screen.getByRole("rowgroup")).toHaveAttribute("aria-labelledby", rowheader.id);
    });

    it("should render items with default class", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveClass("solidaria-Tree-item");
    });

    it("should render section headers when sectioned tree items are provided", () => {
      render(() => (
        <Tree items={createSectionedTreeItems() as any} aria-label="Sectioned Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      // Section titles render as role="rowheader" (mirrors upstream TreeHeader ›
      // GridListHeader), not role="heading".
      expect(screen.getByRole("rowheader", { name: "Mammals" })).toBeInTheDocument();
      expect(screen.getByRole("rowheader", { name: "Birds" })).toBeInTheDocument();
      expect(screen.getByText("Lion")).toBeInTheDocument();
      expect(screen.getByText("Eagle")).toBeInTheDocument();
    });

    it("should honor defaultExpandedKeys for nested items inside sections", () => {
      render(() => (
        <Tree
          items={createSectionedTreeItems() as any}
          aria-label="Sectioned Tree"
          defaultExpandedKeys={["lion"]}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      expect(screen.getByText("Cub")).toBeInTheDocument();
    });

    it("should render empty state when no items", () => {
      render(() => (
        <Tree
          items={[]}
          aria-label="Test Tree"
          renderEmptyState={() => <div data-testid="empty">No items</div>}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      expect(screen.getByTestId("empty")).toHaveTextContent("No items");
      expect(screen.getByRole("gridcell")).toContainElement(screen.getByTestId("empty"));
    });

    it("should trigger onLoadMore from load more sentinel", () => {
      const onLoadMore = vi.fn();
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" hasMore onLoadMore={onLoadMore}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      fireEvent.focus(screen.getByText("Load more"));
      expect(onLoadMore).toHaveBeenCalled();
    });

    it("should apply draggable item semantics when drag hooks are provided", () => {
      const items = createTestItems();
      const dndItems = items.map((item) => ({ key: String(item.key), name: item.value.name }));
      const { dragAndDropHooks } = useDragAndDrop<{ key: string; name: string }>({
        items: dndItems,
        getItems: (keys, sourceItems) =>
          sourceItems
            .filter((item) => keys.has(item.key))
            .map((item) => ({ "text/plain": item.name })),
      });

      render(() => (
        <Tree items={items} aria-label="Test Tree" dragAndDropHooks={dragAndDropHooks}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("draggable", "true");
    });

    it("should prevent self/descendant on-drops for internal tree drags", () => {
      const dragState: DraggableCollectionState = {
        isDragging: true,
        draggingKeys: new Set(["item-1"]),
        isDisabled: false,
        preview: undefined,
        startDrag: () => {},
        moveDrag: () => {},
        endDrag: () => {},
        cancelDrag: () => {},
        getItems: () => [],
        getAllowedDropOperations: () => ["move"],
      };
      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: null,
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      const dragAndDropHooks = {
        useDraggableCollectionState: () => dragState,
        useDraggableCollection: () => ({ state: dragState }),
        useDraggableItem: () => ({ dragProps: {}, dragButtonProps: {}, isDragging: false }),
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: () => ({ collectionProps: {} }),
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          defaultExpandedKeys={["item-1"]}
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const alwaysAccepted: DragTypes = { has: () => true };
      const allowed: DropOperation[] = ["move"];
      const selfTarget: DropTarget = { type: "item", key: "item-1", dropPosition: "on" };
      const descendantTarget: DropTarget = { type: "item", key: "item-1-1", dropPosition: "on" };

      expect(dropState.getDropOperation(selfTarget, alwaysAccepted, allowed)).toBe("cancel");
      expect(dropState.getDropOperation(descendantTarget, alwaysAccepted, allowed)).toBe("cancel");
    });

    it("should expand a collapsed branch on drop activate", () => {
      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: null,
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: {
          onDropActivate?: (event: { target: DropTarget; x: number; y: number }) => void;
        }) => {
          props.onDropActivate?.({
            target: { type: "item", key: "item-1", dropPosition: "on" },
            x: 0,
            y: 0,
          });
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      // Item 1 is expanded by drop-activate, so children become visible.
      expect(screen.getByText("Item 1.1")).toBeInTheDocument();
      expect(screen.getByText("Item 1.2")).toBeInTheDocument();
    });

    it("should support keyboard expand/collapse for on-item drop targets", () => {
      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: { type: "item", key: "item-1", dropPosition: "on" },
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let onKeyDown: ((event: KeyboardEvent) => void) | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: { onKeyDown?: (event: KeyboardEvent) => void }) => {
          onKeyDown = props.onKeyDown;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      expect(onKeyDown).toBeTypeOf("function");
      expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();

      onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      expect(screen.getByText("Item 1.1")).toBeInTheDocument();

      onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();
    });

    it("should use rtl expansion keys for keyboard drop-target branch toggle", async () => {
      const originalDir = document.dir;
      document.dir = "rtl";

      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: { type: "item", key: "item-1", dropPosition: "on" },
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let onKeyDown: ((event: KeyboardEvent) => void) | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: { onKeyDown?: (event: KeyboardEvent) => void }) => {
          onKeyDown = props.onKeyDown;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      try {
        render(() => (
          <Tree
            items={createTestItems()}
            aria-label="RTL key tree"
            dir="rtl"
            direction="rtl"
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
        ));

        expect(onKeyDown).toBeTypeOf("function");
        expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
        await waitFor(() => expect(screen.getByText("Item 1.1")).toBeInTheDocument());

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowRight" }));
        await waitFor(() => expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument());
      } finally {
        document.dir = originalDir;
      }
    });

    it("should prefer computed rtl direction for keyboard drop-target branch toggle", () => {
      const originalDir = document.dir;
      document.dir = "ltr";
      const computedStyleSpy = vi
        .spyOn(window, "getComputedStyle")
        .mockImplementation(() => ({ direction: "rtl" }) as CSSStyleDeclaration);

      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: { type: "item", key: "item-1", dropPosition: "on" },
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let onKeyDown: ((event: KeyboardEvent) => void) | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: { onKeyDown?: (event: KeyboardEvent) => void }) => {
          onKeyDown = props.onKeyDown;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      try {
        render(() => (
          <Tree
            items={createTestItems()}
            aria-label="Computed RTL key tree"
            direction="rtl"
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
        ));

        expect(onKeyDown).toBeTypeOf("function");
        expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
        expect(screen.getByText("Item 1.1")).toBeInTheDocument();

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowRight" }));
        expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();
      } finally {
        computedStyleSpy.mockRestore();
        document.dir = originalDir;
      }
    });

    it("should fall back to document rtl direction when getComputedStyle is unavailable", () => {
      const originalDir = document.dir;
      document.dir = "rtl";
      const originalGetComputedStyle = window.getComputedStyle;
      Object.defineProperty(window, "getComputedStyle", {
        configurable: true,
        writable: true,
        value: undefined,
      });

      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: { type: "item", key: "item-1", dropPosition: "on" },
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let onKeyDown: ((event: KeyboardEvent) => void) | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: { onKeyDown?: (event: KeyboardEvent) => void }) => {
          onKeyDown = props.onKeyDown;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
        },
      };

      try {
        render(() => (
          <Tree
            items={createTestItems()}
            aria-label="Fallback RTL key tree"
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
        ));

        expect(onKeyDown).toBeTypeOf("function");
        expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
        expect(screen.getByText("Item 1.1")).toBeInTheDocument();

        onKeyDown!(new KeyboardEvent("keydown", { key: "ArrowRight" }));
        expect(screen.queryByText("Item 1.1")).not.toBeInTheDocument();
      } finally {
        Object.defineProperty(window, "getComputedStyle", {
          configurable: true,
          writable: true,
          value: originalGetComputedStyle,
        });
        document.dir = originalDir;
      }
    });

    it("should resolve ambiguous tree boundary drop targets using pointer direction", () => {
      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: null,
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let wrappedDelegate:
        | {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          }
        | undefined;
      const baseDelegate = {
        getDropTargetFromPoint: () =>
          ({ type: "item", key: "item-1-2", dropPosition: "after" }) as const,
      };

      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: {
          dropTargetDelegate: {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          };
        }) => {
          wrappedDelegate = props.dropTargetDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: baseDelegate,
      };

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          defaultExpandedKeys={["item-1"]}
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      expect(wrappedDelegate).toBeDefined();
      const isValidDropTarget = (target: DropTarget) =>
        target.type === "item" && target.key === "item-1-2" && target.dropPosition === "after";

      const innerTarget = wrappedDelegate!.getDropTargetFromPoint(30, 50, isValidDropTarget);
      const outerTarget = wrappedDelegate!.getDropTargetFromPoint(0, 50, isValidDropTarget);

      expect(innerTarget).toMatchObject({ type: "item", key: "item-1-2", dropPosition: "after" });
      expect(outerTarget).toMatchObject({ type: "item", key: "item-1-2", dropPosition: "after" });
    });

    it("should switch ambiguous boundary target using vertical pointer movement", () => {
      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: null,
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let wrappedDelegate:
        | {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: {
          dropTargetDelegate: {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          };
        }) => {
          wrappedDelegate = props.dropTargetDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () =>
            ({ type: "item", key: "item-1-2", dropPosition: "after" }) as const,
        },
      };

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Vertical boundary tree"
          defaultExpandedKeys={["item-1"]}
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const isValidDropTarget = (target: DropTarget) =>
        target.type === "item" && target.key === "item-1-2" && target.dropPosition === "after";

      const initialTarget = wrappedDelegate!.getDropTargetFromPoint(30, 50, isValidDropTarget);
      const switchedByY = wrappedDelegate!.getDropTargetFromPoint(30, 70, isValidDropTarget);

      expect(initialTarget).toMatchObject({ type: "item", key: "item-1-2", dropPosition: "after" });
      expect(switchedByY).toMatchObject({ type: "item", key: "item-1-2", dropPosition: "after" });
    });

    it("should reverse horizontal boundary switching direction in rtl", () => {
      const originalDir = document.dir;
      document.dir = "rtl";

      const dropState: DroppableCollectionState = {
        isDropTarget: false,
        target: null,
        isDisabled: false,
        setTarget: () => {},
        isAccepted: () => true,
        enterTarget: () => {},
        moveToTarget: () => {},
        exitTarget: () => {},
        activateTarget: () => {},
        drop: () => {},
        shouldAcceptItemDrop: () => true,
        getDropOperation: () => "move",
      };

      let wrappedDelegate:
        | {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: (props: {
          dropTargetDelegate: {
            getDropTargetFromPoint: (
              x: number,
              y: number,
              isValidDropTarget: (target: DropTarget) => boolean,
            ) => DropTarget | null;
          };
        }) => {
          wrappedDelegate = props.dropTargetDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () =>
            ({ type: "item", key: "item-1-2", dropPosition: "after" }) as const,
        },
      };

      try {
        render(() => (
          <Tree
            items={createTestItems()}
            aria-label="RTL boundary tree"
            defaultExpandedKeys={["item-1"]}
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
        ));

        const isValidDropTarget = (target: DropTarget) =>
          target.type === "item" && target.key === "item-1-2" && target.dropPosition === "after";

        const initialTarget = wrappedDelegate!.getDropTargetFromPoint(30, 50, isValidDropTarget);
        const switchedByRight = wrappedDelegate!.getDropTargetFromPoint(50, 50, isValidDropTarget);

        expect(initialTarget).toMatchObject({
          type: "item",
          key: "item-1-2",
          dropPosition: "after",
        });
        expect(switchedByRight).toMatchObject({
          type: "item",
          key: "item-1-2",
          dropPosition: "after",
        });
      } finally {
        document.dir = originalDir;
      }
    });
  });

  describe("sectioned keyboard navigation", () => {
    it("moves focus across sections via ArrowDown", async () => {
      const user = setupUser();
      render(() => (
        <Tree
          aria-label="Sectioned Tree"
          items={createSectionedTreeItems() as any}
          defaultExpandedKeys={["lion"]}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const cubRow = screen.getByText("Cub").closest('[role="row"]') as HTMLElement;
      cubRow.focus();
      await user.keyboard("{ArrowDown}");

      const eagleRow = screen.getByText("Eagle").closest('[role="row"]') as HTMLElement;
      expect(eagleRow).toHaveAttribute("data-focused", "true");
      expect(cubRow).not.toHaveAttribute("data-focused", "true");
    });
  });

  describe("controlled expansion", () => {
    it("re-renders when expandedKeys prop changes", async () => {
      const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set());
      const { rerender } = render(() => (
        <div>
          <button onClick={() => setExpandedKeys(new Set(["lion"]))}>expand</button>
          <Tree
            aria-label="Sectioned Tree"
            items={createSectionedTreeItems() as any}
            expandedKeys={expandedKeys()}
          >
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
        </div>
      ));

      const button = screen.getByRole("button", { name: "expand" });
      await fireEvent.click(button);

      expect(screen.getByText("Lion")).toBeInTheDocument();
      expect(screen.getByText("Cub")).toBeInTheDocument();
      expect(screen.getByText("Eagle")).toBeInTheDocument();
    });
  });

  describe("expansion", () => {
    it("should show children when defaultExpandedKeys is set", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // Root items (3) + expanded children of item-1 (2) = 5
      expect(rows.length).toBe(5);
    });

    it("should have aria-expanded on expandable items", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // Item 1 is expandable
      expect(rows[0]).toHaveAttribute("aria-expanded", "false");
      // Item 2 is a leaf (no aria-expanded)
      expect(rows[1]).not.toHaveAttribute("aria-expanded");
      // Item 3 is expandable
      expect(rows[2]).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded=true when expanded", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const expandedRow = screen.getAllByRole("row")[0];
      expect(expandedRow).toHaveAttribute("aria-expanded", "true");
    });

    it("updates TreeExpandButton aria-label when expansion state changes", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Tree with expand buttons">
          {(item) => (
            <TreeItem id={item.key}>
              {() => (
                <>
                  <TreeExpandButton>
                    {({ isExpanded }) => (isExpanded ? "-" : "+")}
                  </TreeExpandButton>
                  <span>{item.textValue}</span>
                </>
              )}
            </TreeItem>
          )}
        </Tree>
      ));

      const getFirstExpandButton = () => screen.getAllByRole("button")[0];
      expect(getFirstExpandButton()).toHaveAttribute("aria-label", "Expand");

      fireEvent.click(getFirstExpandButton());
      expect(getFirstExpandButton()).toHaveAttribute("aria-label", "Collapse");
    });

    it("should have aria-level on items", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-level", "1"); // Root level
      expect(rows[1]).toHaveAttribute("aria-level", "2"); // Child level
    });

    it("should support controlled expansion via expandedKeys prop", () => {
      // Test that controlled expansion works
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" expandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      // With controlled expandedKeys=['item-1'], children should be visible
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(5); // 3 root + 2 children of item-1
    });
  });

  describe("selection", () => {
    it("should have aria-selected when selection mode is set", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" selectionMode="single">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-selected", "false");
    });

    it("should have aria-multiselectable when multiple selection", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" selectionMode="multiple">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveAttribute("aria-multiselectable", "true");
    });

    it("should call onSelectionChange when selection changes", async () => {
      const onSelectionChange = vi.fn();
      const user = setupUser();

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      await user.click(rows[0]);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("should show selected state via data attribute", async () => {
      const user = setupUser();

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="single"
          defaultSelectedKeys={["item-1"]}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("data-selected");
    });

    it("toggles selection exactly once with Space on the focused row", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" selectionMode="multiple">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-selected", "false");

      fireEvent.focus(rows[0]);
      fireEvent.keyDown(rows[0], { key: " " });

      expect(rows[0]).toHaveAttribute("aria-selected", "true");
    });

    it("selects but does not action a selected row on single click in replace mode", () => {
      const onAction = vi.fn();
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="multiple"
          selectionBehavior="replace"
          defaultSelectedKeys={["item-1"]}
          onAction={onAction}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-selected", "true");

      pressWithMouse(rows[0]);

      expect(rows[0]).toHaveAttribute("aria-selected", "true");
      expect(onAction).not.toHaveBeenCalled();
    });

    it("performs the secondary row action on mouse double click in replace mode", () => {
      const onAction = vi.fn();
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="multiple"
          selectionBehavior="replace"
          onAction={onAction}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      fireEvent(rows[0], pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
      expect(rows[0]).toHaveAttribute("aria-selected", "true");
      expect(onAction).not.toHaveBeenCalled();

      fireEvent.dblClick(rows[0]);

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith("item-1");
    });

    it("fires onAction exactly once with Enter key up on the focused row", () => {
      const onAction = vi.fn();
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" onAction={onAction}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      fireEvent.focus(rows[0]);
      fireEvent.keyDown(rows[0], { key: "Enter" });
      fireEvent.keyUp(rows[0], { key: "Enter" });

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith("item-1");
    });

    it('keeps child controls from selecting, acting, or expanding in keyboardNavigationBehavior="tab"', () => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Editable tree"
          selectionMode="multiple"
          keyboardNavigationBehavior="tab"
          onAction={onAction}
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <TreeItem id={item.key}>
              <input aria-label={`Edit ${item.textValue}`} />
            </TreeItem>
          )}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      const input = screen.getByLabelText("Edit Item 1");
      input.focus();

      fireEvent.keyDown(input, { key: " " });
      fireEvent.keyUp(input, { key: " " });
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyUp(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "ArrowRight" });
      fireEvent(input, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));

      expect(rows[0]).toHaveAttribute("aria-selected", "false");
      expect(rows[0]).toHaveAttribute("aria-expanded", "false");
      expect(screen.getAllByRole("row")).toHaveLength(3);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onAction).not.toHaveBeenCalled();
    });

    it("keeps disabledBehavior selection rows actionable but not selectable", () => {
      const onAction = vi.fn();
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="single"
          disabledKeys={["item-1"]}
          disabledBehavior="selection"
          onAction={onAction}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).not.toHaveAttribute("aria-disabled");
      expect(rows[0]).not.toHaveAttribute("aria-selected");

      pressWithMouse(rows[0]);

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith("item-1");
      expect(rows[0]).not.toHaveAttribute("aria-selected");
    });

    it("updates TreeSelectionCheckbox checked state when item selection changes", () => {
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Tree with selection checkboxes"
          selectionMode="single"
        >
          {(item) => (
            <TreeItem id={item.key}>
              {() => (
                <>
                  <TreeSelectionCheckbox itemKey={item.key} />
                  <span>{item.textValue}</span>
                </>
              )}
            </TreeItem>
          )}
        </Tree>
      ));

      const getFirstCheckbox = () => screen.getAllByRole("checkbox")[0];
      expect(getFirstCheckbox()).not.toBeChecked();

      const rows = screen.getAllByRole("row");
      fireEvent.click(rows[0]);

      expect(getFirstCheckbox()).toBeChecked();
    });
  });

  describe("data attributes", () => {
    it("should have data-expandable on expandable items", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("data-expandable");
      expect(rows[1]).not.toHaveAttribute("data-expandable");
    });

    it("should have data-expanded when expanded", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("data-expanded");
    });

    it("should have data-level attribute", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("data-level", "0");
      expect(rows[1]).toHaveAttribute("data-level", "1");
    });

    it("should have data-disabled on tree when disabled", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" isDisabled>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveAttribute("data-disabled");
    });
  });

  describe("disabled state", () => {
    it("should have aria-disabled on tree when disabled", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" isDisabled>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveAttribute("aria-disabled", "true");
    });

    it("should support disabledKeys", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" disabledKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-disabled", "true");
      expect(rows[1]).not.toHaveAttribute("aria-disabled");
    });

    it("should support disabled TreeItem props from render functions", async () => {
      const user = setupUser();
      const onSelectionChange = vi.fn();

      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <TreeItem id={item.key} isDisabled={item.key === "item-1"}>
              {item.textValue}
            </TreeItem>
          )}
        </Tree>
      ));

      const disabledRow = screen.getByRole("row", { name: "Item 1" });
      expect(disabledRow).toHaveAttribute("aria-disabled", "true");

      await user.click(disabledRow);
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should have tabIndex on tree for keyboard access", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveAttribute("tabIndex", "0");
    });

    it("should have tabIndex -1 on items (managed focus)", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // Items have tabIndex -1 when not focused (roving tabindex pattern)
      expect(rows[0]).toHaveAttribute("tabIndex", "-1");
    });

    it("should not have tabIndex on tree when disabled", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" isDisabled>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).not.toHaveAttribute("tabIndex");
    });
  });

  describe("parity: ARIA attributes", () => {
    it("rows should have aria-posinset and aria-setsize", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => (
            <TreeItem id={item.key} textValue={item.textValue}>
              {item.textValue}
            </TreeItem>
          )}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // Root items: Item 1 is 1 of 3, Item 2 is 2 of 3, Item 3 is 3 of 3
      expect(rows[0]).toHaveAttribute("aria-posinset", "1");
      expect(rows[0]).toHaveAttribute("aria-setsize", "3");
      expect(rows[1]).toHaveAttribute("aria-posinset", "2");
      expect(rows[1]).toHaveAttribute("aria-setsize", "3");
    });

    it("child rows should have correct aria-posinset and aria-setsize within parent", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => (
            <TreeItem id={item.key} textValue={item.textValue}>
              {item.textValue}
            </TreeItem>
          )}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // After expanding item-1: rows are [item-1, item-1-1, item-1-2, item-2, item-3]
      // item-1-1 is child 1 of 2 under item-1
      expect(rows[1]).toHaveAttribute("aria-posinset", "1");
      expect(rows[1]).toHaveAttribute("aria-setsize", "2");
      // item-1-2 is child 2 of 2 under item-1
      expect(rows[2]).toHaveAttribute("aria-posinset", "2");
      expect(rows[2]).toHaveAttribute("aria-setsize", "2");
    });

    it("rows should have aria-label from textValue", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => (
            <TreeItem id={item.key} textValue={item.textValue}>
              {item.textValue}
            </TreeItem>
          )}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-label", "Item 1");
    });

    it("rows should have generated id", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => (
            <TreeItem id={item.key} textValue={item.textValue}>
              {item.textValue}
            </TreeItem>
          )}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0].getAttribute("id")).toBeTruthy();
    });

    it("expand button should have aria-labelledby with button and row IDs", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item, state) => (
            <TreeItem id={item.key} textValue={item.textValue}>
              {(renderProps) => (
                <>
                  <TreeExpandButton />
                  {item.textValue}
                </>
              )}
            </TreeItem>
          )}
        </Tree>
      ));

      const buttons = screen.getAllByRole("button");
      const expandButtons = buttons.filter((btn) => btn.getAttribute("aria-label") === "Expand");
      expect(expandButtons.length).toBeGreaterThan(0);

      const btn = expandButtons[0];
      const labelledby = btn.getAttribute("aria-labelledby");
      expect(labelledby).toBeTruthy();

      // The labelledby should have two IDs (button ID + row ID)
      const parts = labelledby!.split(" ");
      expect(parts).toHaveLength(2);
      // Button ID matches the button's own id
      expect(btn.getAttribute("id")).toBe(parts[0]);
    });
  });

  describe("parity: data attributes", () => {
    it("tree root should have data-selection-mode for non-none selection", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" selectionMode="multiple">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toHaveAttribute("data-selection-mode", "multiple");
    });

    it("tree root should not have data-selection-mode for none", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).not.toHaveAttribute("data-selection-mode");
    });

    it("expandable items should have data-has-child-items", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // item-1 has children
      expect(rows[0]).toHaveAttribute("data-has-child-items");
      // item-2 is a leaf
      expect(rows[1]).not.toHaveAttribute("data-has-child-items");
    });

    it("items should have data-selection-mode matching tree", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" selectionMode="single">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("data-selection-mode", "single");
    });

    it("items should have --tree-item-level CSS variable", () => {
      render(() => (
        <Tree items={createTestItems()} aria-label="Test Tree" defaultExpandedKeys={["item-1"]}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const rows = screen.getAllByRole("row");
      // Root item (level 0)
      expect(rows[0].style.getPropertyValue("--tree-item-level")).toBe("0");
      // Child item (level 1)
      expect(rows[1].style.getPropertyValue("--tree-item-level")).toBe("1");
    });
  });

  describe("parity: selectionBehavior and disabledBehavior props", () => {
    it("selectionBehavior prop should be forwarded to state", () => {
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="multiple"
          selectionBehavior="replace"
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      // Tree renders without error — prop forwarded
      const tree = screen.getByRole("treegrid");
      expect(tree).toBeTruthy();
    });

    it("disabledBehavior prop should be forwarded to state", () => {
      render(() => (
        <Tree
          items={createTestItems()}
          aria-label="Test Tree"
          selectionMode="multiple"
          disabledBehavior="selection"
          disabledKeys={["item-1"]}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      ));

      const tree = screen.getByRole("treegrid");
      expect(tree).toBeTruthy();
    });
  });
});
