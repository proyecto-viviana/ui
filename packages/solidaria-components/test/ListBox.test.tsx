/**
 * Tests for solidaria-components ListBox
 *
 * These tests verify the headless ListBox component follows
 * react-aria-components patterns:
 * - Render props for state-based children/class/style
 * - Data attributes for styling hooks
 * - Keyboard navigation
 * - Selection modes (single/multiple)
 * - Full accessibility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  ListBox,
  ListBoxContext,
  ListBoxOption,
  ListBoxSection,
  ListBoxLoadMoreItem,
} from "../src/ListBox";
import { SelectionIndicator } from "../src/SelectionIndicator";
import { useDragAndDrop } from "../src/useDragAndDrop";
import type { Key } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import {
  setupUser,
  firePointerDown,
  firePointerUp,
  firePointerClick,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser and pointer helpers are consolidated in solidaria-test-utils.

// Test data
interface TestItem {
  id: string;
  name: string;
}

const testItems: TestItem[] = [
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "kangaroo", name: "Kangaroo" },
];

// Helper component for testing
function TestListBox(props: {
  listBoxProps?: Partial<Parameters<typeof ListBox<TestItem>>[0]>;
  itemProps?: Partial<Parameters<typeof ListBoxOption<TestItem>>[0]>;
  items?: TestItem[];
}) {
  const items = props.items || testItems;
  return (
    <ListBox<TestItem>
      aria-label="Test"
      items={items}
      getKey={(item) => item.id}
      {...props.listBoxProps}
    >
      {(item) => (
        <ListBoxOption id={item.id} {...props.itemProps}>
          {item.name}
        </ListBoxOption>
      )}
    </ListBox>
  );
}

describe("ListBox", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
    cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render ListBoxSection as a collection section primitive", () => {
      const { container } = render(() => <ListBoxSection>Section</ListBoxSection>);
      expect(container.querySelector("[data-section]")).toBeInTheDocument();
    });

    it("should render with listbox role", () => {
      render(() => <TestListBox />);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });

    it("should render options with option role", () => {
      render(() => <TestListBox />);
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("should render with default class", () => {
      render(() => <TestListBox />);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveClass("solidaria-ListBox");
    });

    it("should render options with default class", () => {
      render(() => <TestListBox />);
      const options = screen.getAllByRole("option");
      for (const option of options) {
        expect(option).toHaveClass("solidaria-ListBox-option");
      }
    });

    it("should render with custom class", () => {
      render(() => <TestListBox listBoxProps={{ class: "custom-listbox" }} />);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveClass("custom-listbox");
    });

    it("should support DOM props", () => {
      render(() => <TestListBox listBoxProps={{ "data-testid": "my-listbox" } as any} />);
      const listbox = screen.getByTestId("my-listbox");
      expect(listbox).toBeInTheDocument();
    });

    it("should render aria-label", () => {
      render(() => <TestListBox listBoxProps={{ "aria-label": "Animals" }} />);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-label", "Animals");
    });

    it("should have the base set of aria and data attributes", () => {
      render(() => (
        <ListBox<TestItem>
          aria-label="Animals"
          items={[
            {
              title: <span>Mammals</span>,
              "aria-label": "Mammals group",
              items: testItems,
            },
          ]}
          getKey={(item) => item.id}
        >
          {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
        </ListBox>
      ));

      expect(screen.getByRole("listbox")).toHaveAttribute("aria-label", "Animals");
      expect(screen.getByRole("group", { name: "Mammals group" })).toBeInTheDocument();
      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveAttribute("id");
        expect(option).toHaveAttribute("aria-labelledby");
      }
    });

    it("should render with default classes", () => {
      render(() => <TestListBox />);

      expect(screen.getByRole("listbox")).toHaveClass("solidaria-ListBox");
      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveClass("solidaria-ListBox-option");
      }
    });

    it("should render with custom classes", () => {
      render(() => (
        <TestListBox listBoxProps={{ class: "listbox" }} itemProps={{ class: "item" }} />
      ));

      expect(screen.getByRole("listbox")).toHaveClass("listbox");
      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveClass("item");
      }
    });

    it("should support aria-label on the listbox items", () => {
      render(() => <TestListBox itemProps={{ "aria-label": "test" }} />);

      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveAttribute("aria-label", "test");
      }
    });

    it("should support the slot prop", () => {
      render(() => <TestListBox listBoxProps={{ slot: "test" }} />);

      expect(screen.getByRole("listbox")).toHaveAttribute("slot", "test");
    });

    it("should support slots", () => {
      render(() => (
        <ListBoxContext.Provider
          value={{ slots: { test: { "aria-label": "Slot listbox" } } } as never}
        >
          <ListBox<TestItem>
            slot="test"
            aria-label={undefined as never}
            items={testItems}
            getKey={(item) => item.id}
          >
            {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
          </ListBox>
        </ListBoxContext.Provider>
      ));

      expect(screen.getByRole("listbox")).toHaveAttribute("aria-label", "Slot listbox");
      expect(screen.getByRole("listbox")).toHaveAttribute("slot", "test");
    });

    it("should support refs", () => {
      let listBoxRef: HTMLUListElement | null = null;
      let sectionRef: HTMLDivElement | null = null;
      let itemRef: HTMLLIElement | null = null;

      render(() => (
        <ListBox<TestItem>
          aria-label="Test"
          items={[
            {
              title: (
                <ListBoxSection
                  ref={(el) => {
                    sectionRef = el;
                  }}
                  aria-label="Felines"
                >
                  Felines
                </ListBoxSection>
              ),
              "aria-label": "Felines",
              items: [testItems[0]],
            },
          ]}
          getKey={(item) => item.id}
          ref={(el) => {
            listBoxRef = el;
          }}
        >
          {(item) => (
            <ListBoxOption
              id={item.id}
              ref={(el) => {
                itemRef = el;
              }}
            >
              {item.name}
            </ListBoxOption>
          )}
        </ListBox>
      ));

      expect(listBoxRef).toBeInstanceOf(HTMLElement);
      expect(sectionRef).toBeInstanceOf(HTMLElement);
      expect(itemRef).toBeInstanceOf(HTMLElement);
      expect(sectionRef?.getAttribute("aria-label")).toBe("Felines");
    });

    it("should support sections", () => {
      render(() => (
        <ListBox<TestItem>
          aria-label="Test"
          items={[
            {
              title: <span>Veggies</span>,
              "aria-label": "Veggies",
              items: testItems.slice(0, 2),
            },
            {
              "aria-label": "Protein",
              items: testItems.slice(2),
            },
          ]}
          getKey={(item) => item.id}
        >
          {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
        </ListBox>
      ));

      expect(screen.getByRole("group", { name: "Veggies" })).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Protein" })).toBeInTheDocument();
    });

    it("renders a visible label element when label prop is provided", () => {
      render(() => (
        <ListBox<TestItem>
          label={<span>Animals label</span>}
          items={testItems}
          getKey={(item) => item.id}
        >
          {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
        </ListBox>
      ));

      expect(screen.getByText("Animals label")).toBeInTheDocument();
      expect(screen.getByRole("listbox")).toHaveAttribute("aria-labelledby");
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

      let capturedDirection: "ltr" | "rtl" | undefined;
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
        useDroppableCollection: () => ({ collectionProps: {} }),
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          constructor(
            _collection: unknown,
            _ref: unknown,
            options?: { direction?: "ltr" | "rtl" },
          ) {
            capturedDirection = options?.direction;
          }
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => <TestListBox listBoxProps={{ dragAndDropHooks: dragAndDropHooks as any }} />);
        expect(capturedDirection).toBe("rtl");
      } finally {
        Object.defineProperty(window, "getComputedStyle", {
          configurable: true,
          writable: true,
          value: originalGetComputedStyle,
        });
        document.dir = originalDir;
      }
    });

    it("prefers computed direction over document direction when available", () => {
      const originalDir = document.dir;
      document.dir = "ltr";
      const computedStyleSpy = vi
        .spyOn(window, "getComputedStyle")
        .mockImplementation(() => ({ direction: "rtl" }) as CSSStyleDeclaration);

      let capturedDirection: "ltr" | "rtl" | undefined;
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
        useDroppableCollection: () => ({ collectionProps: {} }),
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          constructor(
            _collection: unknown,
            _ref: unknown,
            options?: { direction?: "ltr" | "rtl" },
          ) {
            capturedDirection = options?.direction;
          }
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => <TestListBox listBoxProps={{ dragAndDropHooks: dragAndDropHooks as any }} />);
        expect(capturedDirection).toBe("rtl");
      } finally {
        computedStyleSpy.mockRestore();
        document.dir = originalDir;
      }
    });

    it("should render option text content", () => {
      render(() => <TestListBox />);
      expect(screen.getByText("Cat")).toBeInTheDocument();
      expect(screen.getByText("Dog")).toBeInTheDocument();
      expect(screen.getByText("Kangaroo")).toBeInTheDocument();
    });

    it("should render sectioned collections", () => {
      render(() => (
        <ListBox<TestItem>
          aria-label="Test"
          items={[
            {
              title: <span>Mammals</span>,
              "aria-label": "Mammals group",
              items: testItems,
            },
          ]}
          getKey={(item) => item.id}
        >
          {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
        </ListBox>
      ));

      expect(screen.getByText("Mammals")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Mammals group" })).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("should render empty state when no items", () => {
      render(() => (
        <TestListBox
          items={[]}
          listBoxProps={{
            renderEmptyState: () => <div>No items available</div>,
          }}
        />
      ));
      expect(screen.getByRole("option")).toHaveTextContent("No items available");
    });

    it("should support empty state", () => {
      render(() => (
        <TestListBox
          items={[]}
          listBoxProps={{
            renderEmptyState: () => "No results",
          }}
        />
      ));

      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
      expect(screen.getByRole("option")).toHaveTextContent("No results");
    });

    it("should support onScroll", () => {
      const onScroll = vi.fn();
      render(() => <TestListBox listBoxProps={{ onScroll }} />);

      fireEvent.scroll(screen.getByRole("listbox"));
      expect(onScroll).toHaveBeenCalledTimes(1);
    });

    it("should support dynamic collections", () => {
      function DynamicListBox() {
        const [dynamicItems, setDynamicItems] = createSignal(testItems.slice(0, 2));
        return (
          <>
            <button type="button" onClick={() => setDynamicItems([testItems[2]])}>
              Update
            </button>
            <ListBox<TestItem> aria-label="Test" items={dynamicItems()} getKey={(item) => item.id}>
              {(item) => <ListBoxOption id={item.id}>{item.name}</ListBoxOption>}
            </ListBox>
          </>
        );
      }

      render(() => <DynamicListBox />);
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
        "Cat",
        "Dog",
      ]);

      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
        "Kangaroo",
      ]);
    });

    it("should set data-empty when list is empty", () => {
      render(() => <TestListBox items={[]} />);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("data-empty");
    });

    it("should render load more sentinel when hasMore is true", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            hasMore: true,
            onLoadMore: vi.fn(),
          }}
        />
      ));

      expect(screen.getByText("Load more")).toBeInTheDocument();
    });

    it("should apply draggable item semantics when drag hooks are provided", () => {
      const { dragAndDropHooks } = useDragAndDrop<TestItem>({
        items: testItems,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => (
        <TestListBox
          listBoxProps={{
            dragAndDropHooks,
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("draggable", "true");
    });

    it("should render default drop indicator for active target without custom renderer", () => {
      const dropState = {
        isDropTarget: true,
        target: { type: "item", key: "cat", dropPosition: "before" as const },
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
      };
      const dragAndDropHooks = {
        useDroppableCollectionState: () => dropState,
        useDroppableCollection: () => ({ collectionProps: {} }),
        useDropIndicator: () => ({ dropIndicatorProps: {}, isDropTarget: true, isHidden: false }),
        dropTargetDelegate: {
          getDropTargetFromPoint: () => null,
          getDropOperation: () => "move" as const,
        },
      };

      const { container } = render(() => (
        <TestListBox
          listBoxProps={{
            dragAndDropHooks: dragAndDropHooks as any,
          }}
        />
      ));

      expect(container.querySelector(".solidaria-DropIndicator")).toBeInTheDocument();
    });

    it("should trigger onLoadMore when load more sentinel is visible", async () => {
      const onLoadMore = vi.fn();
      render(() => (
        <ul role="listbox" aria-label="Load test">
          <ListBoxLoadMoreItem onLoadMore={onLoadMore} />
        </ul>
      ));

      fireEvent.focus(screen.getByRole("option"));
      expect(onLoadMore).toHaveBeenCalled();
    });
  });

  // ============================================
  // SELECTION - SINGLE
  // ============================================

  describe("selection - single", () => {
    it("should select item on click", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const option = screen.getByText("Cat");
      await user.click(option);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("should support defaultSelectedKeys", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            defaultSelectedKeys: ["dog"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).toHaveAttribute("aria-selected", "true");
    });

    it("should support controlled selectedKeys", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            selectedKeys: new Set(["kangaroo"]),
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const kangarooOption = options.find((o) => o.textContent === "Kangaroo");
      expect(kangarooOption).toHaveAttribute("aria-selected", "true");
    });

    it("should fire onSelectionChange with selected keys", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const option = screen.getByText("Dog");
      await user.click(option);

      expect(onSelectionChange).toHaveBeenCalled();
      const call = onSelectionChange.mock.calls[0];
      expect(call[0]).toBeInstanceOf(Set);
    });

    it("should set aria-selected on selected item", async () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            defaultSelectedKeys: ["cat"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const catOption = options.find((o) => o.textContent === "Cat");
      expect(catOption).toHaveAttribute("aria-selected", "true");

      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).not.toHaveAttribute("aria-selected", "true");
    });

    it("should set data-selected on selected item", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            defaultSelectedKeys: ["cat"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const catOption = options.find((o) => o.textContent === "Cat");
      expect(catOption).toHaveAttribute("data-selected");
    });

    it("should render SelectionIndicator only for selected option", async () => {
      render(() => (
        <ListBox<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          selectionMode="single"
          defaultSelectedKeys={["cat"]}
        >
          {(item) => (
            <ListBoxOption id={item.id}>
              {() => (
                <>
                  {item.name}
                  <SelectionIndicator>Selected</SelectionIndicator>
                </>
              )}
            </ListBoxOption>
          )}
        </ListBox>
      ));

      expect(screen.getAllByText("Selected")).toHaveLength(1);
      await user.click(screen.getByText("Dog"));
      expect(screen.getAllByText("Selected")).toHaveLength(1);
    });
  });

  // ============================================
  // SELECTION - MULTIPLE
  // ============================================

  describe("selection - multiple", () => {
    it("should select multiple items on click", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "multiple",
            onSelectionChange,
          }}
        />
      ));

      firePointerClick(screen.getByText("Cat"));
      firePointerClick(screen.getByText("Dog"));

      expect(onSelectionChange).toHaveBeenCalledTimes(2);
    });

    it("should toggle selection on click", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "multiple",
            onSelectionChange,
          }}
        />
      ));

      const catOption = screen.getByText("Cat");

      // Select
      firePointerClick(catOption);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);

      // Deselect
      firePointerClick(catOption);
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
    });

    it("should support defaultSelectedKeys with multiple items", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "multiple",
            defaultSelectedKeys: ["cat", "dog"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const catOption = options.find((o) => o.textContent === "Cat");
      const dogOption = options.find((o) => o.textContent === "Dog");
      const kangarooOption = options.find((o) => o.textContent === "Kangaroo");

      expect(catOption).toHaveAttribute("aria-selected", "true");
      expect(dogOption).toHaveAttribute("aria-selected", "true");
      expect(kangarooOption).not.toHaveAttribute("aria-selected", "true");
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should focus first item on tab", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      await user.tab();

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveFocus();
    });

    it("should move focus with Arrow Down", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should expose aria-activedescendant on the listbox during keyboard navigation", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();
      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(listbox).toHaveAttribute("aria-activedescendant", options[0].id);
    });

    it("should move focus with Arrow Up", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      // Move down first
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      // Then up
      await user.keyboard("{ArrowUp}");

      const options = screen.getAllByRole("option");
      // First option should be focused after going down twice and up once
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should focus first with Home", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      // Move to middle
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      // Press Home
      await user.keyboard("{Home}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should focus last with End", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{End}");

      const options = screen.getAllByRole("option");
      expect(options[options.length - 1]).toHaveAttribute("data-focused");
    });

    it("should select on Enter", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("should select on Space", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");
      await user.keyboard(" ");

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  // ============================================
  // DISABLED STATES
  // ============================================

  describe("disabled states", () => {
    it("should support disabledKeys", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            disabledKeys: ["dog"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).toHaveAttribute("aria-disabled", "true");
    });

    it("should set data-disabled on disabled items", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            disabledKeys: ["dog"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).toHaveAttribute("data-disabled");
    });

    it("should not select disabled items on click", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            disabledKeys: ["dog"],
            onSelectionChange,
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog")!;
      await user.click(dogOption);

      // Should not fire for disabled item
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("should skip disabled items during keyboard navigation", async () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            disabledKeys: ["dog"],
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      // Disabled items have aria-disabled
      expect(dogOption).toHaveAttribute("aria-disabled", "true");
      const listbox = screen.getByRole("listbox");
      listbox.focus();
      await user.keyboard("{ArrowDown}");
      expect(options[0]).toHaveAttribute("data-focused");
      await user.keyboard("{ArrowDown}");
      expect(options[2]).toHaveAttribute("data-focused");
    });

    it("should support isDisabled on the entire listbox", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            isDisabled: true,
          }}
        />
      ));

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("data-disabled");
    });

    it("should mark all options disabled when listbox isDisabled", () => {
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            isDisabled: true,
          }}
        />
      ));

      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("should not select items when listbox isDisabled", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            isDisabled: true,
            onSelectionChange,
          }}
        />
      ));

      firePointerClick(screen.getByText("Cat"));
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // FOCUS STATE
  // ============================================

  describe("focus state", () => {
    it("should allow focusing the listbox", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      // Tab to focus the listbox
      await user.tab();

      const listbox = screen.getByRole("listbox");
      // The listbox should have tabindex for focus
      expect(listbox).toHaveAttribute("tabindex");
    });

    it("should set data-focused on focused option", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should set data-focus-visible on keyboard focus", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      await user.tab();

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("data-focus-visible");
    });
  });

  // ============================================
  // HOVER STATE
  // ============================================

  describe("hover state", () => {
    it("should support hover", async () => {
      const onHoverStart = vi.fn();
      const onHoverEnd = vi.fn();
      const onHoverChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{ selectionMode: "single" }}
          itemProps={
            {
              class: ({ isHovered }) => (isHovered ? "hover" : ""),
              onHoverStart,
              onHoverEnd,
              onHoverChange,
            } as never
          }
        />
      ));

      const option = screen.getAllByRole("option")[0];
      await user.hover(option);
      expect(option).toHaveAttribute("data-hovered");
      expect(option).toHaveClass("hover");
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(true);

      await user.unhover(option);
      expect(option).not.toHaveAttribute("data-hovered");
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(false);
    });

    it("should set data-hovered on hover", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const options = screen.getAllByRole("option");
      await user.hover(options[0]);

      expect(options[0]).toHaveAttribute("data-hovered");
    });

    it("should remove data-hovered on unhover", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const options = screen.getAllByRole("option");
      await user.hover(options[0]);
      expect(options[0]).toHaveAttribute("data-hovered");

      await user.unhover(options[0]);
      expect(options[0]).not.toHaveAttribute("data-hovered");
    });
  });

  // ============================================
  // PRESS STATE
  // ============================================

  describe("press state", () => {
    it("should support press state", () => {
      render(() => (
        <TestListBox
          listBoxProps={{ selectionMode: "single" }}
          itemProps={{ class: ({ isPressed }) => (isPressed ? "pressed" : "") }}
        />
      ));

      const option = screen.getAllByRole("option")[0];
      firePointerDown(option);
      expect(option).toHaveAttribute("data-pressed");
      expect(option).toHaveClass("pressed");

      firePointerUp(option);
      fireEvent.click(option, { detail: 1 });
      expect(option).not.toHaveAttribute("data-pressed");
    });

    it("should set data-pressed during press", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const options = screen.getAllByRole("option");

      firePointerDown(options[0]);
      expect(options[0]).toHaveAttribute("data-pressed");

      firePointerUp(options[0]);
      fireEvent.click(options[0], { detail: 1 });
      expect(options[0]).not.toHaveAttribute("data-pressed");
    });

    it("selects on pointer down when shouldSelectOnPressUp is false", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            shouldSelectOnPressUp: false,
            onSelectionChange,
          }}
        />
      ));

      firePointerDown(screen.getByText("Cat"));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("does not select on pointer down by default", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestListBox
          listBoxProps={{
            selectionMode: "single",
            onSelectionChange,
          }}
        />
      ));

      const option = screen.getByText("Cat");
      firePointerDown(option);
      expect(onSelectionChange).not.toHaveBeenCalled();

      firePointerUp(option);
      fireEvent.click(option, { detail: 1 });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // DYNAMIC ITEMS
  // ============================================

  describe("dynamic items", () => {
    it("should render dynamic items", () => {
      const items = [
        { id: "apple", name: "Apple" },
        { id: "banana", name: "Banana" },
      ];

      render(() => <TestListBox items={items} />);

      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    it("should handle empty items array", () => {
      render(() => <TestListBox items={[]} />);

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("data-empty");
      expect(screen.queryAllByRole("option")).toHaveLength(0);
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have aria-labelledby when provided", () => {
      render(() => (
        <div>
          <label id="listbox-label">Animals</label>
          <TestListBox listBoxProps={{ "aria-labelledby": "listbox-label" }} />
        </div>
      ));

      const listbox = screen.getByRole("listbox");
      // aria-labelledby may be merged with an auto-generated ID
      const labelledBy = listbox.getAttribute("aria-labelledby");
      expect(labelledBy).toContain("listbox-label");
    });

    it("should have aria-multiselectable for multiple selection", () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "multiple" }} />);

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    });

    it("should not have aria-multiselectable for single selection", () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      expect(listbox).not.toHaveAttribute("aria-multiselectable");
    });
  });

  // ============================================
  // RTL (Right-to-Left) KEYBOARD NAVIGATION
  // ============================================

  describe("RTL keyboard navigation", () => {
    it("ArrowDown/ArrowUp should navigate normally in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestListBox listBoxProps={{ selectionMode: "single" }} />
        </I18nProvider>
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      // ArrowDown should move to first option in RTL (same as LTR for vertical)
      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");

      // ArrowDown again should move to second option
      await user.keyboard("{ArrowDown}");
      expect(options[1]).toHaveAttribute("data-focused");

      // ArrowUp should move back
      await user.keyboard("{ArrowUp}");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("Home/End should work correctly in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestListBox listBoxProps={{ selectionMode: "single" }} />
        </I18nProvider>
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{End}");

      const options = screen.getAllByRole("option");
      expect(options[options.length - 1]).toHaveAttribute("data-focused");

      await user.keyboard("{Home}");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should render ListBox correctly within RTL context", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestListBox listBoxProps={{ selectionMode: "single" }} />
        </I18nProvider>
      ));

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("selection should work in RTL context", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestListBox listBoxProps={{ selectionMode: "single", onSelectionChange }} />
        </I18nProvider>
      ));

      const options = screen.getAllByRole("option");
      await user.click(options[1]);

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe("horizontal orientation keyboard navigation", () => {
    it("ArrowRight/ArrowLeft navigate the inline axis when horizontal", async () => {
      render(() => (
        <TestListBox listBoxProps={{ selectionMode: "single", orientation: "horizontal" }} />
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();
      const options = screen.getAllByRole("option");

      // Nothing focused yet: Right enters at the first item.
      await user.keyboard("{ArrowRight}");
      expect(options[0]).toHaveAttribute("data-focused");
      expect(listbox).toHaveAttribute("aria-activedescendant", options[0].id);

      // Right advances along the inline axis.
      await user.keyboard("{ArrowRight}");
      expect(options[1]).toHaveAttribute("data-focused");
      expect(listbox).toHaveAttribute("aria-activedescendant", options[1].id);

      // Left walks back.
      await user.keyboard("{ArrowLeft}");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("Arrow Down/Up still navigate the block axis when horizontal", async () => {
      render(() => (
        <TestListBox listBoxProps={{ selectionMode: "single", orientation: "horizontal" }} />
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();
      const options = screen.getAllByRole("option");

      await user.keyboard("{ArrowDown}");
      expect(options[0]).toHaveAttribute("data-focused");

      await user.keyboard("{ArrowDown}");
      expect(options[1]).toHaveAttribute("data-focused");

      await user.keyboard("{ArrowUp}");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("ArrowLeft/ArrowRight are no-ops in a vertical (default) listbox", async () => {
      render(() => <TestListBox listBoxProps={{ selectionMode: "single" }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();
      const options = screen.getAllByRole("option");

      await user.keyboard("{ArrowRight}");
      expect(options[0]).not.toHaveAttribute("data-focused");
      expect(listbox).not.toHaveAttribute("aria-activedescendant");

      await user.keyboard("{ArrowLeft}");
      expect(options[0]).not.toHaveAttribute("data-focused");

      // The block axis is still live, confirming the handler isn't disabled.
      await user.keyboard("{ArrowDown}");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("RTL flips the horizontal axis (ArrowLeft=next, ArrowRight=previous)", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestListBox listBoxProps={{ selectionMode: "single", orientation: "horizontal" }} />
        </I18nProvider>
      ));

      const listbox = screen.getByRole("listbox");
      listbox.focus();
      const options = screen.getAllByRole("option");

      // Nothing focused: either arrow enters at the first item.
      await user.keyboard("{ArrowLeft}");
      expect(options[0]).toHaveAttribute("data-focused");

      // In RTL, ArrowLeft advances to the next item...
      await user.keyboard("{ArrowLeft}");
      expect(options[1]).toHaveAttribute("data-focused");

      // ...and ArrowRight walks back to the previous item.
      await user.keyboard("{ArrowRight}");
      expect(options[0]).toHaveAttribute("data-focused");
    });
  });
});
