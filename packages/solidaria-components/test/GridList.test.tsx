/**
 * Tests for GridList component.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  GridList,
  GridListItem,
  GridListSection,
  GridListHeader,
  GridListSelectionCheckbox,
} from "../src/GridList";
import { useDragAndDrop } from "../src/useDragAndDrop";

// Test data
const testItems = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

describe("GridList", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // BASIC RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render GridListSection as a rowgroup collection section primitive", () => {
      const { container } = render(() => <GridListSection>Section</GridListSection>);
      // A section exposes role="rowgroup" (mirrors upstream GridListSection /
      // useGridListSection rowGroupProps) and keeps the data-section marker.
      expect(container.querySelector("[data-section]")).toBeInTheDocument();
      expect(screen.getByRole("rowgroup")).toHaveClass("solidaria-GridListSection");
    });

    it("should label the section rowgroup via its header (mirrors upstream sections)", () => {
      render(() => (
        <GridListSection>
          <GridListHeader>Produce</GridListHeader>
          <div>Section content</div>
        </GridListSection>
      ));

      // Mirrors upstream GridList.test.js "should support sections": the section
      // is a role="rowgroup" labelled by its header's content via aria-labelledby
      // (the header renders the labelling rowheader id).
      const group = screen.getByRole("rowgroup");
      const labelledBy = group.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy as string)).toHaveTextContent("Produce");
    });

    it("should render with default class", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruits">
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list).toBeTruthy();
      expect(list?.tagName).toBe("DIV");
    });

    it("should render with custom class", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          class="custom-list"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".custom-list");
      expect(list).toBeTruthy();
    });

    it("should render items", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruits">
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      expect(screen.getByText("Apple")).toBeTruthy();
      expect(screen.getByText("Banana")).toBeTruthy();
      expect(screen.getByText("Cherry")).toBeTruthy();
      // Each GridListItem exposes its content in a role="gridcell" (mirrors
      // upstream GridList.test.js `getAllByRole('gridcell')`; createGridListItem
      // emits role: "row" › role: "gridcell").
      expect(screen.getAllByRole("gridcell")).toHaveLength(3);
    });

    it("should render items with default class", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruits">
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const items = document.querySelectorAll(".solidaria-GridList-item");
      expect(items.length).toBe(3);
    });

    it("should render empty state", () => {
      render(() => (
        <GridList
          items={[]}
          aria-label="Empty list"
          renderEmptyState={() => <div data-testid="empty">No items</div>}
        >
          {() => <GridListItem id="x">x</GridListItem>}
        </GridList>
      ));

      expect(screen.getByTestId("empty")).toBeTruthy();
      expect(screen.getByText("No items")).toBeTruthy();
    });

    it("should trigger onLoadMore from load more sentinel", () => {
      const onLoadMore = vi.fn();
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          hasMore
          onLoadMore={onLoadMore}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      fireEvent.focus(screen.getByText("Load more"));
      expect(onLoadMore).toHaveBeenCalled();
    });

    it("should apply draggable item semantics when drag hooks are provided", () => {
      const { dragAndDropHooks } = useDragAndDrop<(typeof testItems)[number]>({
        items: testItems,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          dragAndDropHooks={dragAndDropHooks}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("draggable", "true");
    });

    it("wires horizontal droppable keyboard delegate methods in ltr", () => {
      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
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
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="DnD Grid LTR"
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      expect(keyboardDelegate?.getKeyLeftOf).toBeTypeOf("function");
      expect(keyboardDelegate?.getKeyRightOf).toBeTypeOf("function");
      expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(1);
      expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(3);
    });

    it("wires horizontal droppable keyboard delegate methods in rtl", () => {
      const originalDir = document.dir;
      document.dir = "rtl";
      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
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
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => (
          <GridList
            items={testItems}
            getKey={(item) => item.id}
            aria-label="DnD Grid RTL"
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => (
              <GridListItem id={item.id} textValue={item.name}>
                {item.name}
              </GridListItem>
            )}
          </GridList>
        ));

        expect(keyboardDelegate?.getKeyLeftOf).toBeTypeOf("function");
        expect(keyboardDelegate?.getKeyRightOf).toBeTypeOf("function");
        expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(3);
        expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(1);
      } finally {
        document.dir = originalDir;
      }
    });

    it("falls back to document direction when getComputedStyle is unavailable", () => {
      const originalDir = document.dir;
      document.dir = "rtl";
      const originalGetComputedStyle = window.getComputedStyle;
      Object.defineProperty(window, "getComputedStyle", {
        configurable: true,
        writable: true,
        value: undefined,
      });

      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
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
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => (
          <GridList
            items={testItems}
            getKey={(item) => item.id}
            aria-label="DnD Grid fallback direction"
            dragAndDropHooks={dragAndDropHooks as any}
          >
            {(item) => (
              <GridListItem id={item.id} textValue={item.name}>
                {item.name}
              </GridListItem>
            )}
          </GridList>
        ));

        expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(3);
        expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(1);
      } finally {
        Object.defineProperty(window, "getComputedStyle", {
          configurable: true,
          writable: true,
          value: originalGetComputedStyle,
        });
        document.dir = originalDir;
      }
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-empty when list is empty", () => {
      render(() => (
        <GridList items={[]} aria-label="Empty list">
          {() => <GridListItem id="x">x</GridListItem>}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list?.getAttribute("data-empty")).toBeTruthy();
    });

    it("should have data-disabled when disabled", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruits" isDisabled>
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list?.getAttribute("data-disabled")).toBeTruthy();
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should support single selection mode", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="single"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list).toBeTruthy();
    });

    it("should support multiple selection mode", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="multiple"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list).toBeTruthy();
    });

    it("should support default selected keys", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="multiple"
          defaultSelectedKeys={new Set([1, 2])}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      // Items with keys 1 and 2 should be selected
      const items = document.querySelectorAll("[data-selected]");
      expect(items.length).toBe(2);
    });

    it("should call onSelectionChange", () => {
      const onSelectionChange = vi.fn();

      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list).toBeTruthy();
    });

    it("supports keyboard selection from focused grid container with Space", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="multiple"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const grid = screen.getByRole("grid", { name: "Fruits" });
      const rows = screen.getAllByRole("row");
      expect(rows[0]).toHaveAttribute("aria-selected", "false");

      fireEvent.focus(grid);
      fireEvent.keyDown(grid, { key: " " });

      expect(rows[0]).toHaveAttribute("aria-selected", "true");
    });

    it("supports keyboard action from focused grid container with Enter", () => {
      const onAction = vi.fn();
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          onAction={onAction}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const grid = screen.getByRole("grid", { name: "Fruits" });
      fireEvent.focus(grid);
      fireEvent.keyDown(grid, { key: "Enter" });

      expect(onAction).toHaveBeenCalledWith(1);
    });
  });

  // ============================================
  // DISABLED KEYS
  // ============================================

  describe("disabled keys", () => {
    it("should support disabledKeys prop", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="single"
          disabledKeys={new Set([2])}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const disabledItems = document.querySelectorAll("[data-disabled]");
      expect(disabledItems.length).toBeGreaterThanOrEqual(1);
    });

    it("should support getDisabled function", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          getDisabled={(item) => item.name === "Banana"}
          aria-label="Fruits"
          selectionMode="single"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".solidaria-GridList");
      expect(list).toBeTruthy();
    });
  });

  // ============================================
  // RENDER PROPS
  // ============================================

  describe("render props", () => {
    it("should support class as a function", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          class={(props) => `list ${props.isEmpty ? "empty" : "has-items"}`}
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector(".has-items");
      expect(list).toBeTruthy();
    });

    it("should support item render props children", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="single"
        >
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {(props) => (
                <span data-testid={`item-${item.id}`}>
                  {item.name} {props.isSelected ? "✓" : ""}
                </span>
              )}
            </GridListItem>
          )}
        </GridList>
      ));

      expect(screen.getByTestId("item-1")).toBeTruthy();
    });

    it("should support item class as a function", () => {
      render(() => (
        <GridList
          items={testItems}
          getKey={(item) => item.id}
          aria-label="Fruits"
          selectionMode="single"
          defaultSelectedKeys={new Set([1])}
        >
          {(item) => (
            <GridListItem
              id={item.id}
              textValue={item.name}
              class={(props) => `item ${props.isSelected ? "selected" : ""}`}
            >
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const selectedItem = document.querySelector(".item.selected");
      expect(selectedItem).toBeTruthy();
    });
  });

  // ============================================
  // STATIC PROPERTIES
  // ============================================

  describe("static properties", () => {
    it("should have Item as static property", () => {
      expect(GridList.Item).toBe(GridListItem);
    });

    it("should have SelectionCheckbox as static property", () => {
      expect(GridList.SelectionCheckbox).toBe(GridListSelectionCheckbox);
    });
  });

  // ============================================
  // CONTEXT ERRORS
  // ============================================

  describe("context errors", () => {
    it("should throw when GridListItem is used outside GridList", () => {
      expect(() => {
        render(() => <GridListItem id="test">Test</GridListItem>);
      }).toThrow("GridListItem must be used within a GridList");
    });

    it("should throw when GridListSelectionCheckbox is used outside GridList", () => {
      expect(() => {
        render(() => <GridListSelectionCheckbox itemKey="test" />);
      }).toThrow("GridListSelectionCheckbox must be used within a GridList");
    });
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  describe("accessibility", () => {
    it("should have aria-label", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruit list">
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const list = document.querySelector('[aria-label="Fruit list"]');
      expect(list).toBeTruthy();
    });

    it("should render as grid role", () => {
      render(() => (
        <GridList items={testItems} getKey={(item) => item.id} aria-label="Fruits">
          {(item) => (
            <GridListItem id={item.id} textValue={item.name}>
              {item.name}
            </GridListItem>
          )}
        </GridList>
      ));

      const grid = document.querySelector('[role="grid"]');
      expect(grid).toBeTruthy();
    });
  });
});
