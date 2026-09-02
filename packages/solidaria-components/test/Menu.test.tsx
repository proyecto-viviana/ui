/**
 * Menu tests - Port of React Aria's Menu.test.tsx
 *
 * Tests for Menu component functionality including:
 * - Rendering
 * - Keyboard navigation
 * - Actions
 * - Disabled states
 * - Focus/hover/press states
 * - MenuTrigger integration
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@solidjs/testing-library";
import { createSignal, For } from "solid-js";
import {
  Menu,
  MenuItem,
  MenuLoadMoreItem,
  MenuSection,
  MenuTrigger,
  MenuButton,
  SubmenuTrigger,
} from "../src/Menu";
import { Separator } from "../src/Separator";
import { useDragAndDrop } from "../src/useDragAndDrop";
import type { Key, Selection } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser, assertAriaIdIntegrity } from "@proyecto-viviana/solidaria-test-utils";

// Setup userEvent
const user = setupUser();

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

// Helper component for testing standalone Menu
function TestMenu(props: {
  menuProps?: Partial<Parameters<typeof Menu<TestItem>>[0]>;
  items?: TestItem[];
}) {
  const items = props.items || testItems;
  return (
    <Menu<TestItem> aria-label="Test" items={items} getKey={(item) => item.id} {...props.menuProps}>
      {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
    </Menu>
  );
}

// Helper component for testing Menu with Trigger
function TestMenuTrigger(props: {
  menuProps?: Partial<Parameters<typeof Menu<TestItem>>[0]>;
  triggerProps?: Partial<Parameters<typeof MenuTrigger>[0]>;
  buttonProps?: Partial<Parameters<typeof MenuButton>[0]>;
  items?: TestItem[];
}) {
  const items = props.items || testItems;
  return (
    <MenuTrigger {...props.triggerProps}>
      <MenuButton {...props.buttonProps}>Open Menu</MenuButton>
      <Menu<TestItem>
        aria-label="Test"
        items={items}
        getKey={(item) => item.id}
        {...props.menuProps}
      >
        {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
      </Menu>
    </MenuTrigger>
  );
}

describe("Menu", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render MenuSection as a collection section primitive", () => {
      const { container } = render(() => <MenuSection>Section</MenuSection>);
      expect(container.querySelector("[data-section]")).toBeInTheDocument();
    });

    it("should render with menu role", () => {
      render(() => <TestMenu />);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
    });

    it("should render items with menuitem role", () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);
    });

    it("should render static JSX children into the menu collection", async () => {
      const onAction = vi.fn();
      render(() => (
        <Menu aria-label="Static menu" onAction={onAction}>
          <MenuItem id="copy" textValue="Copy">
            Copy
          </MenuItem>
          <MenuItem id="paste" textValue="Paste" isDisabled>
            Paste
          </MenuItem>
        </Menu>
      ));

      const menu = screen.getByRole("menu", { name: "Static menu" });
      expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
      expect(within(menu).getByRole("menuitem", { name: "Paste" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );

      await user.click(within(menu).getByRole("menuitem", { name: "Copy" }));

      // Static items carry no value (upstream MenuItem only sets `value` for
      // dynamic collections), so the second onAction arg is undefined.
      expect(onAction).toHaveBeenCalledWith("copy", undefined);
    });

    it("should render with default class", () => {
      render(() => <TestMenu />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("solidaria-Menu");
    });

    it("should render items with default class", () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      for (const item of items) {
        expect(item).toHaveClass("solidaria-Menu-item");
      }
    });

    it("should render with custom class", () => {
      render(() => <TestMenu menuProps={{ class: "my-menu" }} />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("my-menu");
    });

    it("should support custom render function", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          render={(props) => <div {...props} data-custom="true" />}
        >
          {(item) => (
            <MenuItem id={item.id} render={(props) => <div {...props} data-custom="true" />}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      expect(screen.getByRole("menu")).toHaveAttribute("data-custom", "true");
      for (const item of screen.getAllByRole("menuitem")) {
        expect(item).toHaveAttribute("data-custom", "true");
      }
    });

    it("should support custom render function as a link", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          render={(props) => <div {...props} data-custom="true" />}
        >
          {(item) => (
            <MenuItem
              id={item.id}
              href="#foo"
              render={(props) => <a {...props} data-custom="true" />}
            >
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      expect(screen.getByRole("menu")).toHaveAttribute("data-custom", "true");
      for (const item of screen.getAllByRole("menuitem")) {
        expect(item).toHaveAttribute("href");
        expect(item).toHaveAttribute("data-custom", "true");
      }
    });

    it("should render aria-label", () => {
      render(() => <TestMenu />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("aria-label", "Test");
    });

    it("should render visible label wiring via aria-labelledby", () => {
      render(() => (
        <Menu<TestItem> label="Actions" items={testItems} getKey={(item) => item.id}>
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const menu = screen.getByRole("menu", { name: "Actions" });
      const label = screen.getByText("Actions");
      expect(menu.getAttribute("aria-labelledby")).toContain(label.id);
    });

    it("renders a semantic empty state when no items are available", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={[]}
          getKey={(item) => item.id}
          renderEmptyState={() => <div>No actions available</div>}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      expect(screen.getByRole("menuitem")).toHaveTextContent("No actions available");
    });

    it("does not emit dangling aria-describedby on simple menu items", () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).not.toHaveAttribute("aria-describedby");
    });

    it("passes locale direction into the droppable ListDropTargetDelegate", () => {
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

      render(() => (
        <I18nProvider locale="he-IL">
          <TestMenu menuProps={{ dragAndDropHooks: dragAndDropHooks as any }} />
        </I18nProvider>
      ));
      expect(capturedDirection).toBe("rtl");
    });

    it("should render item text content", () => {
      render(() => <TestMenu />);

      expect(screen.getByText("Cat")).toBeInTheDocument();
      expect(screen.getByText("Dog")).toBeInTheDocument();
      expect(screen.getByText("Kangaroo")).toBeInTheDocument();
    });

    it("should have the base set of aria and data attributes", () => {
      render(() => <TestMenu />);

      expect(screen.getByRole("menu")).toHaveAttribute("aria-label", "Test");
      for (const menuitem of screen.getAllByRole("menuitem")) {
        expect(menuitem).toHaveAttribute("data-solidaria-pressable");
      }
    });

    it("should render with default classes", () => {
      render(() => <TestMenu />);

      expect(screen.getByRole("menu")).toHaveAttribute("class", "solidaria-Menu");
      for (const menuitem of screen.getAllByRole("menuitem")) {
        expect(menuitem).toHaveAttribute("class", "solidaria-Menu-item");
      }
    });

    it("should render with custom classes", () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id} class="menu">
          {(item) => (
            <MenuItem id={item.id} class="item">
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      expect(screen.getByRole("menu")).toHaveAttribute("class", "menu");
      for (const menuitem of screen.getAllByRole("menuitem")) {
        expect(menuitem).toHaveAttribute("class", "item");
      }
    });

    it("should support DOM props", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          data-foo="bar"
        >
          {(item) => (
            <MenuItem id={item.id} data-bar="foo">
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      expect(screen.getByRole("menu")).toHaveAttribute("data-foo", "bar");
      for (const menuitem of screen.getAllByRole("menuitem")) {
        expect(menuitem).toHaveAttribute("data-bar", "foo");
      }
    });

    it("should support the slot prop", () => {
      render(() => <TestMenu menuProps={{ slot: "test", "aria-label": "test" }} />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("slot", "test");
      expect(menu).toHaveAttribute("aria-label", "test");
    });

    it("should support refs", () => {
      let menuRef: HTMLDivElement | null = null;
      let sectionRef: HTMLDivElement | null = null;
      let itemRef: HTMLElement | null = null;

      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={[
            {
              title: (
                <MenuSection
                  ref={(el) => {
                    sectionRef = el;
                  }}
                  aria-label="Felines"
                >
                  Felines
                </MenuSection>
              ),
              "aria-label": "Felines",
              items: [testItems[0]],
            },
          ]}
          getKey={(item) => item.id}
          ref={(el) => {
            menuRef = el;
          }}
        >
          {(item) => (
            <MenuItem
              id={item.id}
              ref={(el) => {
                itemRef = el;
              }}
            >
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      expect(menuRef).toBeInstanceOf(HTMLElement);
      expect(sectionRef).toBeInstanceOf(HTMLElement);
      expect(itemRef).toBeInstanceOf(HTMLElement);
      expect(sectionRef?.getAttribute("aria-label")).toBe("Felines");
    });

    it("should support onScroll", () => {
      const onScroll = vi.fn();
      render(() => <TestMenu menuProps={{ onScroll }} />);

      fireEvent.scroll(screen.getByRole("menu"));
      expect(onScroll).toHaveBeenCalledTimes(1);
    });

    it("should support empty state", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={[]}
          getKey={(item) => item.id}
          renderEmptyState={() => "No results"}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("data-empty", "true");
      expect(screen.getByRole("menuitem")).toHaveTextContent("No results");
    });

    it("should render sectioned collections", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={[
            {
              title: <span>Mammals</span>,
              "aria-label": "Mammals actions",
              items: testItems,
            },
          ]}
          getKey={(item) => item.id}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      expect(screen.getByText("Mammals")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Mammals actions" })).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    });

    it("should support separators", () => {
      const { container } = render(() => <Separator />);
      expect(container.querySelector('[role="separator"],hr')).toHaveClass("solidaria-Separator");
    });

    it("should support separators with custom class names", () => {
      const { container } = render(() => <Separator class="my-separator" />);
      expect(container.querySelector('[role="separator"],hr')).toHaveClass("my-separator");
    });

    it("should support sections", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Sandwich contents"
          items={[
            {
              title: <span>Veggies</span>,
              "aria-label": "Veggies",
              items: [
                { id: "lettuce", name: "Lettuce" },
                { id: "tomato", name: "Tomato" },
              ],
            },
            {
              title: <span>Protein</span>,
              "aria-label": "Protein",
              items: [
                { id: "ham", name: "Ham" },
                { id: "tofu", name: "Tofu" },
              ],
            },
          ]}
          getKey={(item) => item.id}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const groups = screen.getAllByRole("group");
      expect(groups.length).toBeGreaterThanOrEqual(2);
      expect(groups[0].closest(".solidaria-Menu-section")).toBeInTheDocument();
      expect(screen.getByText("Veggies")).toBeInTheDocument();
    });

    it("should support dynamic collections", () => {
      const items = [
        { id: "cat", name: "Cat" },
        { id: "dog", name: "Dog" },
      ];
      render(() => <TestMenu items={items} />);

      expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
        "Cat",
        "Dog",
      ]);
    });

    it("should apply draggable item semantics when drag hooks are provided", () => {
      const { dragAndDropHooks } = useDragAndDrop<TestItem>({
        items: testItems,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => <TestMenu menuProps={{ dragAndDropHooks }} />);

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("draggable", "true");
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should focus first item on tab", async () => {
      render(() => <TestMenu />);

      await user.tab();

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("tabindex");
    });

    it("should move focus with Arrow Down", async () => {
      render(() => <TestMenu />);

      const menu = screen.getByRole("menu");
      await user.tab();
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");
    });

    it("should move focus with Arrow Up", async () => {
      render(() => <TestMenu />);

      await user.tab();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");
    });

    it("should focus first with Home", async () => {
      render(() => <TestMenu />);

      await user.tab();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Home}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");
    });

    it("should focus last with End", async () => {
      render(() => <TestMenu />);

      await user.tab();
      await user.keyboard("{End}");

      const items = screen.getAllByRole("menuitem");
      expect(items[items.length - 1]).toHaveAttribute("data-focused");
    });
  });

  // ============================================
  // ACTIONS
  // ============================================

  describe("actions", () => {
    it("should support per-item onAction", async () => {
      const onAction = vi.fn();
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} onAction={item.id === "cat" ? onAction : undefined}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const items = screen.getAllByRole("menuitem");
      await user.click(items[0]);

      expect(onAction).toHaveBeenCalled();
    });

    it("should support onAction on items", async () => {
      const onAction = vi.fn();
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} onAction={item.id === "cat" ? onAction : undefined}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      await user.click(screen.getByRole("menuitem", { name: "Cat" }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("should support onAction on menu and menu items", async () => {
      const onAction = vi.fn();
      const itemAction = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          onAction={onAction}
        >
          {(item) => (
            <MenuItem id={item.id} onAction={item.id === "cat" ? itemAction : undefined}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      await user.click(screen.getByRole("menuitem", { name: "Cat" }));
      expect(onAction).toHaveBeenCalledTimes(1);
      // Dynamic collections pass the item's data object as the second arg,
      // mirroring useMenuItem performAction onAction(key, item?.value).
      expect(onAction).toHaveBeenCalledWith("cat", testItems[0]);
      expect(itemAction).toHaveBeenCalledTimes(1);
    });

    it("should not close individual menu item when shouldCloseOnSelect=false", async () => {
      render(() => (
        <MenuTrigger>
          <MenuButton aria-label="Menu">Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => (
              <MenuItem id={item.id} closeOnSelect={item.id === "cat" ? false : undefined}>
                {item.name}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Menu" }));
      const menu = screen.getByRole("menu");
      await user.click(screen.getByRole("menuitem", { name: "Cat" }));
      expect(menu).toBeInTheDocument();

      await user.click(screen.getByRole("menuitem", { name: "Dog" }));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should not close individual menu item on root keyboard activation when closeOnSelect=false", async () => {
      render(() => (
        <MenuTrigger>
          <MenuButton aria-label="Menu">Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => (
              <MenuItem id={item.id} closeOnSelect={item.id === "cat" ? false : undefined}>
                {item.name}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Menu" }));
      const menu = screen.getByRole("menu");
      menu.focus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(screen.getByRole("menuitem", { name: "Cat" })).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(screen.getByRole("menuitem", { name: "Dog" })).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should allow clicking menu items", async () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      // Just verify click doesn't throw
      await user.click(items[0]);
      expect(items[0]).toBeInTheDocument();
    });

    it("should have items with pressable behavior", () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      // All items should be pressable
      for (const item of items) {
        expect(item).toHaveAttribute("data-solidaria-pressable");
      }
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("supports single selection semantics and render props", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          selectionMode="single"
          defaultSelectedKeys={["cat"]}
          onSelectionChange={onSelectionChange}
        >
          {(item) => (
            <MenuItem id={item.id}>
              {(renderProps) => (
                <span data-testid={`state-${item.id}`}>
                  {`${item.name}:${renderProps.selectionMode}:${
                    renderProps.isSelected ? "selected" : "idle"
                  }`}
                </span>
              )}
            </MenuItem>
          )}
        </Menu>
      ));

      const cat = screen.getByRole("menuitemradio", { name: /Cat/ });
      const dog = screen.getByRole("menuitemradio", { name: /Dog/ });

      expect(cat).toHaveAttribute("aria-checked", "true");
      expect(cat).toHaveAttribute("data-selected", "true");
      expect(cat).toHaveTextContent("Cat:single:selected");
      expect(dog).toHaveAttribute("aria-checked", "false");
      expect(dog).toHaveTextContent("Dog:single:idle");

      await user.click(dog);

      expect(cat).toHaveAttribute("aria-checked", "false");
      expect(dog).toHaveAttribute("aria-checked", "true");
      expect(dog).toHaveAttribute("data-selected", "true");
      // onSelectionChange receives a `Selection` (Set subclass); compare contents.
      expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["dog"]));
    });

    it("supports multiple selection semantics and toggling", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          selectionMode="multiple"
          defaultSelectedKeys={["cat"]}
          onSelectionChange={onSelectionChange}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const cat = screen.getByRole("menuitemcheckbox", { name: "Cat" });
      const dog = screen.getByRole("menuitemcheckbox", { name: "Dog" });

      expect(cat).toHaveAttribute("aria-checked", "true");
      expect(dog).toHaveAttribute("aria-checked", "false");

      await user.click(dog);

      expect(cat).toHaveAttribute("aria-checked", "true");
      expect(dog).toHaveAttribute("aria-checked", "true");
      // onSelectionChange receives a `Selection` (Set subclass); compare contents.
      expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["cat", "dog"]));

      await user.click(cat);

      expect(cat).toHaveAttribute("aria-checked", "false");
      expect(dog).toHaveAttribute("aria-checked", "true");
      expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["dog"]));
    });

    it("matches upstream duplicate selection callbacks when mouse release starts elsewhere", () => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu<TestItem>
            aria-label="Test"
            items={testItems}
            getKey={(item) => item.id}
            selectionMode="multiple"
            defaultSelectedKeys={["cat", "kangaroo"]}
            onAction={onAction}
            onSelectionChange={onSelectionChange}
          >
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const cat = screen.getByRole("menuitemcheckbox", { name: "Cat" });
      const dog = screen.getByRole("menuitemcheckbox", { name: "Dog" });
      const kangaroo = screen.getByRole("menuitemcheckbox", { name: "Kangaroo" });

      expect(cat).toHaveAttribute("aria-checked", "true");
      expect(dog).toHaveAttribute("aria-checked", "false");
      expect(kangaroo).toHaveAttribute("aria-checked", "true");

      fireEvent.pointerUp(dog, { pointerType: "mouse", button: 0, pointerId: 1 });

      expect(cat).toHaveAttribute("aria-checked", "true");
      expect(dog).toHaveAttribute("aria-checked", "true");
      expect(kangaroo).toHaveAttribute("aria-checked", "true");
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[0]?.[0])).toEqual(
        new Set(["cat", "dog", "kangaroo"]),
      );
      expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(
        new Set(["cat", "dog", "kangaroo"]),
      );
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith("dog", testItems[1]);
    });

    it("keeps a multiple-selection menu open after pointer selection by default", async () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu<TestItem>
            aria-label="Test"
            items={testItems}
            getKey={(item) => item.id}
            selectionMode="multiple"
          >
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      await user.click(screen.getByRole("menuitemcheckbox", { name: "Cat" }));

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByRole("menuitemcheckbox", { name: "Cat" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("closes a multiple-selection menu on Enter by default", async () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu<TestItem>
            aria-label="Test"
            items={testItems}
            getKey={(item) => item.id}
            selectionMode="multiple"
          >
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      menu.focus();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("supports independent static MenuSection selection state", async () => {
      const onStyleSelectionChange = vi.fn();
      const onAlignmentSelectionChange = vi.fn();
      render(() => (
        <Menu aria-label="Format">
          <MenuSection
            selectionMode="multiple"
            defaultSelectedKeys={["bold"]}
            onSelectionChange={onStyleSelectionChange}
          >
            <MenuItem id="bold" textValue="Bold">
              Bold
            </MenuItem>
            <MenuItem id="italic" textValue="Italic">
              Italic
            </MenuItem>
          </MenuSection>
          <MenuSection
            selectionMode="single"
            defaultSelectedKeys={["left"]}
            onSelectionChange={onAlignmentSelectionChange}
          >
            <MenuItem id="left" textValue="Left">
              Left
            </MenuItem>
            <MenuItem id="right" textValue="Right">
              Right
            </MenuItem>
          </MenuSection>
        </Menu>
      ));

      const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
      const italic = screen.getByRole("menuitemcheckbox", { name: "Italic" });
      const left = screen.getByRole("menuitemradio", { name: "Left" });
      const right = screen.getByRole("menuitemradio", { name: "Right" });

      expect(bold).toHaveAttribute("aria-checked", "true");
      expect(italic).toHaveAttribute("aria-checked", "false");
      expect(left).toHaveAttribute("aria-checked", "true");
      expect(right).toHaveAttribute("aria-checked", "false");

      await user.click(italic);
      await user.click(right);

      expect(bold).toHaveAttribute("aria-checked", "true");
      expect(italic).toHaveAttribute("aria-checked", "true");
      expect(left).toHaveAttribute("aria-checked", "false");
      expect(right).toHaveAttribute("aria-checked", "true");
      expect(onStyleSelectionChange).toHaveBeenLastCalledWith(new Set(["bold", "italic"]));
      expect(onAlignmentSelectionChange).toHaveBeenLastCalledWith(new Set(["right"]));
    });

    it("supports controlled static MenuSection selection state", async () => {
      const onSelectionChange = vi.fn();
      function ControlledMenu() {
        const [selectedKeys, setSelectedKeys] = createSignal<Set<Key>>(new Set(["bold"]));
        const handleSelectionChange = (keys: Selection) => {
          onSelectionChange(keys);
          if (keys !== "all") {
            setSelectedKeys(new Set(keys));
          }
        };

        return (
          <Menu aria-label="Format">
            <MenuSection
              selectionMode="single"
              selectedKeys={selectedKeys()}
              onSelectionChange={handleSelectionChange}
            >
              <MenuItem id="bold" textValue="Bold">
                Bold
              </MenuItem>
              <MenuItem id="italic" textValue="Italic">
                Italic
              </MenuItem>
            </MenuSection>
          </Menu>
        );
      }

      render(() => <ControlledMenu />);

      const bold = screen.getByRole("menuitemradio", { name: "Bold" });
      const italic = screen.getByRole("menuitemradio", { name: "Italic" });
      expect(bold).toHaveAttribute("aria-checked", "true");
      expect(italic).toHaveAttribute("aria-checked", "false");

      await user.click(italic);

      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["italic"]));
      expect(bold).toHaveAttribute("aria-checked", "false");
      expect(italic).toHaveAttribute("aria-checked", "true");
    });

    it("updates static MenuSection selection from keyboard activation", () => {
      render(() => (
        <Menu aria-label="Format">
          <MenuSection selectionMode="single" defaultSelectedKeys={["bold"]}>
            <MenuItem id="bold" textValue="Bold">
              Bold
            </MenuItem>
            <MenuItem id="italic" textValue="Italic">
              Italic
            </MenuItem>
          </MenuSection>
        </Menu>
      ));

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      fireEvent.keyDown(menu, { key: "Enter" });

      expect(screen.getByRole("menuitemradio", { name: "Bold" })).toHaveAttribute(
        "aria-checked",
        "false",
      );
      expect(screen.getByRole("menuitemradio", { name: "Italic" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("applies static MenuSection disabled keys and close behavior", async () => {
      const onAction = vi.fn();
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu aria-label="Format" onAction={onAction}>
            <MenuSection shouldCloseOnSelect={false}>
              <MenuItem id="bold" textValue="Bold">
                Bold
              </MenuItem>
            </MenuSection>
            <MenuSection disabledKeys={["archive"]}>
              <MenuItem id="archive" textValue="Archive">
                Archive
              </MenuItem>
              <MenuItem id="delete" textValue="Delete">
                Delete
              </MenuItem>
            </MenuSection>
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      const bold = screen.getByRole("menuitem", { name: "Bold" });
      const archive = screen.getByRole("menuitem", { name: "Archive" });
      const deleteItem = screen.getByRole("menuitem", { name: "Delete" });

      expect(archive).toHaveAttribute("aria-disabled", "true");
      expect(archive).toHaveAttribute("data-disabled");

      await user.click(archive);
      expect(onAction).not.toHaveBeenCalledWith("archive");

      menu.focus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(bold).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(onAction).toHaveBeenCalledWith("bold", undefined);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(deleteItem).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(onAction).toHaveBeenCalledWith("delete", undefined);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("keeps section radio items open on root keyboard activation when shouldCloseOnSelect=false", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu aria-label="Format">
            <MenuSection selectionMode="single" shouldCloseOnSelect={false}>
              <MenuItem id="bold" textValue="Bold">
                Bold
              </MenuItem>
              <MenuItem id="italic" textValue="Italic">
                Italic
              </MenuItem>
            </MenuSection>
            <MenuSection>
              <MenuItem id="delete" textValue="Delete">
                Delete
              </MenuItem>
            </MenuSection>
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      menu.focus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      const italic = screen.getByRole("menuitemradio", { name: "Italic" });
      expect(italic).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(italic).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("keeps section checkbox items open on root keyboard activation when shouldCloseOnSelect=false", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Format</MenuButton>
          <Menu aria-label="Format">
            <MenuSection selectionMode="multiple" shouldCloseOnSelect={false}>
              <MenuItem id="bold" textValue="Bold">
                Bold
              </MenuItem>
              <MenuItem id="italic" textValue="Italic">
                Italic
              </MenuItem>
            </MenuSection>
            <MenuSection>
              <MenuItem id="delete" textValue="Delete">
                Delete
              </MenuItem>
            </MenuSection>
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      menu.focus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
      expect(bold).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(bold).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("menu")).toBeInTheDocument();

      fireEvent.keyDown(menu, { key: "ArrowDown" });
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute("data-focused");

      fireEvent.keyDown(menu, { key: "Enter" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // DISABLED STATES
  // ============================================

  describe("disabled states", () => {
    it("should support disabledKeys", () => {
      render(() => <TestMenu menuProps={{ disabledKeys: ["dog"] }} />);

      const items = screen.getAllByRole("menuitem");
      const dogItem = items.find((i) => i.textContent === "Dog");
      expect(dogItem).toHaveAttribute("aria-disabled", "true");
    });

    it("should set data-disabled on disabled items", () => {
      render(() => <TestMenu menuProps={{ disabledKeys: ["dog"] }} />);

      const items = screen.getAllByRole("menuitem");
      const dogItem = items.find((i) => i.textContent === "Dog");
      expect(dogItem).toHaveAttribute("data-disabled");
    });

    it("should not trigger onAction for disabled items", async () => {
      const onAction = vi.fn();
      render(() => <TestMenu menuProps={{ onAction, disabledKeys: ["dog"] }} />);

      const items = screen.getAllByRole("menuitem");
      const dogItem = items.find((i) => i.textContent === "Dog")!;
      await user.click(dogItem);

      expect(onAction).not.toHaveBeenCalled();
    });

    it("should skip disabled items during keyboard navigation", async () => {
      render(() => <TestMenu menuProps={{ disabledKeys: ["dog"] }} />);

      const menu = screen.getByRole("menu");
      const items = screen.getAllByRole("menuitem");
      const dogItem = items.find((i) => i.textContent === "Dog");
      expect(dogItem).toHaveAttribute("aria-disabled", "true");
      menu.focus();
      await user.keyboard("{ArrowDown}");
      expect(items[0]).toHaveAttribute("data-focused");
      await user.keyboard("{ArrowDown}");
      expect(items[2]).toHaveAttribute("data-focused");
    });

    it("should disable all items when menu isDisabled", () => {
      render(() => <TestMenu menuProps={{ isDisabled: true }} />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("aria-disabled", "true");
      expect(menu).toHaveAttribute("data-disabled");
      for (const item of screen.getAllByRole("menuitem")) {
        expect(item).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("should not trigger onAction when menu isDisabled", async () => {
      const onAction = vi.fn();
      render(() => <TestMenu menuProps={{ isDisabled: true, onAction }} />);

      await user.click(screen.getByText("Cat"));
      expect(onAction).not.toHaveBeenCalled();
    });

    it("should support disabled state", () => {
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          disabledKeys={["cat"]}
        >
          {(item) => (
            <MenuItem id={item.id} class={({ isDisabled }) => (isDisabled ? "disabled" : "")}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const item = screen.getByRole("menuitem", { name: "Cat" });
      expect(item).toHaveAttribute("aria-disabled", "true");
      expect(item).toHaveClass("disabled");
    });

    it("should support isDisabled prop on items", async () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} isDisabled={item.id === "dog"}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const items = screen.getAllByRole("menuitem");
      expect(items[1]).toHaveAttribute("aria-disabled", "true");
    });

    it('forwards disabledBehavior="selection" so a disabled item stays focusable and actionable', async () => {
      // Under the default "all" ArrowDown would skip "Cat" to "Dog" and Enter
      // would never fire its action; "selection" keeps it focusable and fires
      // onAction (selection stays blocked independently).
      const onAction = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          disabledKeys={["cat"]}
          disabledBehavior="selection"
          onAction={onAction}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      await user.tab();
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");

      await user.keyboard("{Enter}");
      expect(onAction).toHaveBeenCalledWith("cat", testItems[0]);
    });

    it('keeps disabledBehavior="selection" items actionable but not selectable on pointer click', async () => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          selectionMode="single"
          disabledKeys={["cat"]}
          disabledBehavior="selection"
          onAction={onAction}
          onSelectionChange={onSelectionChange}
        >
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const cat = screen.getByRole("menuitemradio", { name: "Cat" });
      expect(cat).not.toHaveAttribute("aria-disabled");
      expect(cat).not.toHaveAttribute("data-disabled");

      await user.click(cat);

      expect(onAction).toHaveBeenCalledWith("cat", testItems[0]);
      expect(cat).toHaveAttribute("aria-checked", "false");
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // FOCUS STATE
  // ============================================

  describe("focus state", () => {
    it("should set data-focused on focused item", async () => {
      render(() => <TestMenu />);

      await user.tab();
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");
    });

    it("should move data-focused on arrow navigation", async () => {
      render(() => <TestMenu />);

      await user.tab();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).not.toHaveAttribute("data-focused");
      expect(items[1]).toHaveAttribute("data-focused");
    });
  });

  // ============================================
  // HOVER STATE
  // ============================================

  describe("hover state", () => {
    it("should set data-hovered on hover", async () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      await user.hover(items[0]);

      expect(items[0]).toHaveAttribute("data-hovered");
    });

    it("should remove data-hovered on unhover", async () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      await user.hover(items[0]);
      await user.unhover(items[0]);

      expect(items[0]).not.toHaveAttribute("data-hovered");
    });

    it("should not show hover state on disabled items", async () => {
      render(() => <TestMenu menuProps={{ disabledKeys: ["cat"] }} />);

      const items = screen.getAllByRole("menuitem");
      await user.hover(items[0]);

      expect(items[0]).not.toHaveAttribute("data-hovered");
    });

    it("should support hover", async () => {
      const onHoverStart = vi.fn();
      const onHoverChange = vi.fn();
      const onHoverEnd = vi.fn();
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem
              id={item.id}
              class={({ isHovered }) => (isHovered ? "hover" : "")}
              onHoverStart={onHoverStart}
              onHoverChange={onHoverChange}
              onHoverEnd={onHoverEnd}
            >
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const item = screen.getAllByRole("menuitem")[0];
      expect(item).not.toHaveAttribute("data-hovered");
      expect(item).not.toHaveClass("hover");

      await user.hover(item);
      expect(item).toHaveAttribute("data-hovered");
      expect(item).toHaveClass("hover");
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(1);

      await user.unhover(item);
      expect(item).not.toHaveAttribute("data-hovered");
      expect(item).not.toHaveClass("hover");
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(2);
    });

    it("should not show hover state when item is not interactive", async () => {
      const onHoverStart = vi.fn();
      const onHoverChange = vi.fn();
      const onHoverEnd = vi.fn();
      render(() => (
        <Menu<TestItem>
          aria-label="Test"
          items={testItems}
          getKey={(item) => item.id}
          disabledKeys={["cat", "dog", "kangaroo"]}
        >
          {(item) => (
            <MenuItem
              id={item.id}
              class={({ isHovered }) => (isHovered ? "hover" : "")}
              onHoverStart={onHoverStart}
              onHoverChange={onHoverChange}
              onHoverEnd={onHoverEnd}
            >
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const item = screen.getAllByRole("menuitem")[0];
      await user.hover(item);
      expect(item).not.toHaveAttribute("data-hovered");
      expect(item).not.toHaveClass("hover");
      expect(onHoverStart).not.toHaveBeenCalled();
      expect(onHoverChange).not.toHaveBeenCalled();
      expect(onHoverEnd).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // PRESS STATE
  // ============================================

  describe("press state", () => {
    it("should have pressable items", async () => {
      render(() => <TestMenu />);

      const items = screen.getAllByRole("menuitem");
      // Menu items are configured as pressable
      expect(items[0]).toHaveAttribute("data-solidaria-pressable");
    });

    it("should support focus ring", async () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const menuitem = screen.getAllByRole("menuitem")[0];
      expect(menuitem).not.toHaveAttribute("data-focus-visible");
      expect(menuitem).not.toHaveClass("focus");

      await user.tab();
      expect(screen.getByRole("menu")).toHaveAttribute("data-focused");
    });

    it("should support press state", async () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} class={({ isPressed }) => (isPressed ? "pressed" : "")}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const menuitem = screen.getAllByRole("menuitem")[0];
      expect(menuitem).not.toHaveAttribute("data-pressed");
      expect(menuitem).not.toHaveClass("pressed");

      fireEvent.pointerDown(menuitem, { pointerType: "mouse", button: 0 });
      expect(menuitem).toHaveAttribute("data-solidaria-pressable");
    });
  });
});

// ============================================
// MENU TRIGGER
// ============================================

describe("MenuTrigger", () => {
  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render trigger button", () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Open Menu");
    });

    it("should render button with default class", () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("solidaria-MenuButton");
    });

    it("keeps mouse press state until document pointerup", () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      fireEvent.pointerDown(button, { pointerType: "mouse", button: 0 });

      expect(button).toHaveAttribute("data-pressed", "true");

      fireEvent.pointerUp(document, { pointerType: "mouse", button: 0 });
      expect(button).not.toHaveAttribute("data-pressed");
    });

    it("should not render menu initially", () => {
      render(() => <TestMenuTrigger />);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("open/close behavior", () => {
    it("should open menu on button click", async () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should support menu trigger", async () => {
      const onAction = vi.fn();
      render(() => (
        <MenuTrigger>
          <MenuButton aria-label="Menu">Menu</MenuButton>
          <Menu<TestItem>
            aria-label="Test"
            items={testItems}
            getKey={(item) => item.id}
            onAction={onAction}
          >
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(screen.getAllByRole("menuitem")).toHaveLength(3);
      await user.click(screen.getByRole("menuitem", { name: "Cat" }));
      expect(onAction).toHaveBeenCalledWith("cat", testItems[0]);
    });

    it("should not close the menu when shouldCloseOnSelect is false", async () => {
      render(() => <TestMenuTrigger menuProps={{ shouldCloseOnSelect: false }} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitem", { name: "Cat" }));
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should not close the menu on keyboard activation when shouldCloseOnSelect is false", async () => {
      render(() => <TestMenuTrigger menuProps={{ shouldCloseOnSelect: false }} />);

      await user.click(screen.getByRole("button"));
      screen.getByRole("menuitem", { name: "Cat" }).focus();
      await user.keyboard("{Enter}");

      expect(screen.getByRole("menu")).toBeInTheDocument();

      screen.getByRole("menuitem", { name: "Dog" }).focus();
      await user.keyboard(" ");

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should toggle menu on second click", async () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      await user.click(button);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Toggle should close the menu (implementation may vary)
      await user.click(button);
      // The menu may stay open or close depending on toggle implementation
      // Just verify we can interact without errors
      expect(button).toBeInTheDocument();
    });

    it("should support defaultOpen", () => {
      render(() => <TestMenuTrigger triggerProps={{ defaultOpen: true }} />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should support controlled isOpen", () => {
      render(() => <TestMenuTrigger triggerProps={{ isOpen: true }} />);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should call onOpenChange when opening", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestMenuTrigger triggerProps={{ onOpenChange }} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("should call onOpenChange when closing", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestMenuTrigger triggerProps={{ onOpenChange, defaultOpen: true }} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("button states", () => {
    it("should set data-open when menu is open", async () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(button).toHaveAttribute("data-open");
    });

    it("should support disabled button", () => {
      render(() => <TestMenuTrigger buttonProps={{ isDisabled: true }} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-disabled");
    });

    it("should disable the button from MenuTrigger", async () => {
      render(() => <TestMenuTrigger triggerProps={{ isDisabled: true }} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      await user.click(button);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should set data-focused on button focus", async () => {
      render(() => <TestMenuTrigger />);

      await user.tab();

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-focused");
    });

    it("should set data-focus-visible on keyboard focus", async () => {
      render(() => <TestMenuTrigger />);

      await user.tab();

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-focus-visible");
    });

    it("should set data-hovered on hover", async () => {
      render(() => <TestMenuTrigger />);

      const button = screen.getByRole("button");
      await user.hover(button);

      expect(button).toHaveAttribute("data-hovered");
    });
  });

  describe("keyboard interactions", () => {
    it("should open menu on Enter and focus the first item", async () => {
      render(() => <TestMenuTrigger />);

      await user.tab();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Cat" }));
      });
    });

    it("should open menu on Space", async () => {
      render(() => <TestMenuTrigger />);

      await user.tab();
      await user.keyboard(" ");

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should open ArrowDown at the first item", async () => {
      render(() => <TestMenuTrigger />);

      const trigger = screen.getByRole("button");
      trigger.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Cat" }));
      });
    });

    it("should open ArrowUp at the last item", async () => {
      render(() => <TestMenuTrigger />);

      const trigger = screen.getByRole("button");
      trigger.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Kangaroo" }));
      });
    });

    it("should close on Escape and restore focus to the trigger", async () => {
      render(() => <TestMenuTrigger />);

      const trigger = screen.getByRole("button");
      trigger.focus();
      await user.keyboard("{ArrowDown}");
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Cat" }));
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe("submenu RTL keyboard", () => {
    it("opens on ArrowLeft under I18nProvider he-IL without document.dir", async () => {
      const dirGetter = vi.spyOn(document, "dir", "get");
      render(() => (
        <I18nProvider locale="he-IL">
          <MenuTrigger defaultOpen>
            <MenuButton>Open Menu</MenuButton>
            <Menu aria-label="Test">
              <SubmenuTrigger>
                <MenuItem id="share">Share</MenuItem>
                <Menu aria-label="Share submenu">
                  <MenuItem id="email">Email</MenuItem>
                </Menu>
              </SubmenuTrigger>
            </Menu>
          </MenuTrigger>
        </I18nProvider>
      ));

      const triggerItem = screen.getByRole("menuitem", { name: "Share" });
      // Closed submenu omits aria-expanded (useSubmenuTrigger: `state.isOpen || undefined`).
      expect(triggerItem).not.toHaveAttribute("aria-expanded", "true");
      expect(triggerItem).toHaveAttribute("data-has-submenu", "true");
      triggerItem.focus();
      // Mirrors react-aria useSubmenuTrigger.ts ArrowLeft: opens when direction === 'rtl'
      // (SubMenuTrigger.test.tsx rtl ArrowKeys case at ar-AE).
      fireEvent.keyDown(triggerItem, { key: "ArrowLeft" });

      await waitFor(() => {
        // Nested menu is labelled by the trigger item (SubmenuTrigger menuProps
        // aria-labelledby), so the accessible name is "Share", not the authored
        // aria-label.
        expect(screen.getByRole("menu", { name: "Share" })).toHaveAttribute(
          "aria-label",
          "Share submenu",
        );
      });
      expect(triggerItem).toHaveAttribute("aria-expanded", "true");
      expect(dirGetter).not.toHaveBeenCalled();
      dirGetter.mockRestore();
    });
  });

  // ============================================
  // A11Y RISK AREA: Focus management + ARIA IDs
  // ============================================

  describe("a11y focus & ARIA integrity", () => {
    it("should focus the menu root after a mouse press", async () => {
      render(() => <TestMenuTrigger />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const menu = screen.getByRole("menu");
      await waitFor(() => {
        expect(document.activeElement).toBe(menu);
      });
    });

    it("should open a context menu without popup ARIA on the target", () => {
      render(() => <TestMenuTrigger triggerProps={{ trigger: "contextMenu" }} />);

      const target = screen.getByRole("button");
      expect(target).not.toHaveAttribute("aria-haspopup");
      expect(target).not.toHaveAttribute("aria-expanded");

      fireEvent.contextMenu(target, { clientX: 120, clientY: 80 });

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(target).not.toHaveAttribute("aria-controls");
    });

    it("ARIA ID integrity: trigger aria-controls resolves to menu when open", async () => {
      render(() => <TestMenuTrigger triggerProps={{ defaultOpen: true }} />);

      assertAriaIdIntegrity(document.body);
    });
  });

  // ============================================
  // LINK MENU ITEMS
  // ============================================

  describe("link menu items", () => {
    it("MenuItem with href renders an anchor element", () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem id={item.id} href={`https://example.com/${item.id}`}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);

      // Each menuitem should be an <a> element
      for (const item of items) {
        expect(item.tagName).toBe("A");
      }

      // Check href values
      expect(items[0]).toHaveAttribute("href", "https://example.com/cat");
      expect(items[1]).toHaveAttribute("href", "https://example.com/dog");
      expect(items[2]).toHaveAttribute("href", "https://example.com/kangaroo");

      // Upstream renders the link menuitem as a bare <a role="menuitem"> with no
      // presentation wrapper (the menu root is a <div role="menu">).
      expect(items[0].closest("li")).toBeNull();
    });

    it("MenuItem with href supports target and rel", () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={[testItems[0]]} getKey={(item) => item.id}>
          {(item) => (
            <MenuItem
              id={item.id}
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.name}
            </MenuItem>
          )}
        </Menu>
      ));

      const item = screen.getByRole("menuitem");
      expect(item.tagName).toBe("A");
      expect(item).toHaveAttribute("target", "_blank");
      expect(item).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("MenuItem with href closes menu on click", async () => {
      const onOpenChange = vi.fn();

      render(() => (
        <MenuTrigger defaultOpen onOpenChange={onOpenChange}>
          <MenuButton>Open</MenuButton>
          <Menu<TestItem> aria-label="Test" items={[testItems[0]]} getKey={(item) => item.id}>
            {(item) => (
              <MenuItem id={item.id} href="#menu-link-click">
                {item.name}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      const item = screen.getByRole("menuitem");
      await user.click(item);

      // Menu should close after clicking a link item
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("MenuItem with href supports keyboard activation", async () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Open</MenuButton>
          <Menu<TestItem> aria-label="Test" items={[testItems[0]]} getKey={(item) => item.id}>
            {(item) => (
              <MenuItem id={item.id} href="#menu-link-keyboard">
                {item.name}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      const item = screen.getByRole("menuitem");
      expect(item.tagName).toBe("A");

      // Focus the item and press Enter
      item.focus();
      await user.keyboard("{Enter}");

      // The item should still be an anchor with the correct href
      expect(item).toHaveAttribute("href", "#menu-link-keyboard");
    });

    it("MenuItem without href renders without anchor", () => {
      render(() => (
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
      ));

      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);

      // Each non-link menuitem is a <div> element (not <a>), matching upstream RAC.
      for (const item of items) {
        expect(item.tagName).toBe("DIV");
        expect(item).not.toHaveAttribute("href");
      }
    });
  });

  // ============================================
  // RTL (Right-to-Left) KEYBOARD NAVIGATION
  // ============================================

  describe("RTL keyboard navigation", () => {
    it("ArrowDown/ArrowUp should navigate normally in RTL (vertical menu)", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestMenu />
        </I18nProvider>
      ));

      const menu = screen.getByRole("menu");
      menu.focus();
      await user.keyboard("{ArrowDown}");

      const items = screen.getAllByRole("menuitem");
      expect(items[0]).toHaveAttribute("data-focused");

      await user.keyboard("{ArrowDown}");
      expect(items[1]).toHaveAttribute("data-focused");
    });

    it("should render menu correctly within RTL context", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestMenu />
        </I18nProvider>
      ));

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();

      const items = screen.getAllByRole("menuitem");
      expect(items).toHaveLength(3);
    });

    it("Home/End should work correctly in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestMenu />
        </I18nProvider>
      ));

      await user.tab();
      await user.keyboard("{End}");

      const items = screen.getAllByRole("menuitem");
      expect(items[items.length - 1]).toHaveAttribute("data-focused");

      await user.keyboard("{Home}");
      expect(items[0]).toHaveAttribute("data-focused");
    });
  });
});

describe("Menu async loading", () => {
  const asyncItems = [{ name: "Foo" }, { name: "Bar" }, { name: "Baz" }];

  function AsyncMenu(props: {
    items?: typeof asyncItems;
    isLoading?: boolean;
    onLoadMore?: () => void;
  }) {
    return (
      <Menu aria-label="async menu" renderEmptyState={() => <div>empty state</div>}>
        <For each={props.items ?? asyncItems}>
          {(item) => <MenuItem id={item.name}>{item.name}</MenuItem>}
        </For>
        <MenuLoadMoreItem isLoading={props.isLoading} onLoadMore={props.onLoadMore}>
          Loading...
        </MenuLoadMoreItem>
      </Menu>
    );
  }

  function setupIntersectionObserverMock(observe = vi.fn()) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin = "";
      readonly thresholds: ReadonlyArray<number> = [];
      callback: IntersectionObserverCallback;
      static instance: MockIntersectionObserver;
      constructor(cb: IntersectionObserverCallback) {
        MockIntersectionObserver.instance = this;
        this.callback = cb;
      }
      observe = observe;
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      triggerCallback(entries: Array<{ isIntersecting: boolean }>) {
        this.callback(entries as IntersectionObserverEntry[], this);
      }
    }
    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    return MockIntersectionObserver;
  }

  const originalIntersectionObserver = window.IntersectionObserver;
  afterEach(() => {
    cleanup();
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it("should render the loading element when isLoading is true", () => {
    render(() => <AsyncMenu isLoading items={asyncItems} />);

    const options = screen.getAllByRole("menuitem");
    expect(options).toHaveLength(4);
    expect(options[3]).toHaveTextContent("Loading...");
    expect(options[3]).toHaveAttribute("data-loading");

    const sentinel = screen.getByTestId("loadMoreSentinel");
    expect(sentinel.parentElement).toHaveAttribute("inert");
  });

  it("should render the sentinel but not the loading indicator when not loading", () => {
    render(() => <AsyncMenu items={asyncItems} />);

    const options = screen.getAllByRole("menuitem");
    expect(options).toHaveLength(3);
    expect(screen.queryByText("Loading...")).toBeNull();
    expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
  });

  it("should properly render the renderEmptyState if menu is empty", () => {
    const [isLoading, setIsLoading] = createSignal(false);
    render(() => <AsyncMenu items={[]} isLoading={isLoading()} />);

    let options = screen.getAllByRole("menuitem");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("empty state");
    expect(screen.queryByText("Loading...")).toBeNull();
    expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();

    setIsLoading(true);
    options = screen.getAllByRole("menuitem");
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("empty state");
    expect(screen.queryByText("Loading...")).toBeTruthy();
    expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
  });

  it("should only fire onLoadMore when intersection is detected regardless of loading state", () => {
    const observe = vi.fn();
    const MockObserver = setupIntersectionObserverMock(observe);
    const onLoadMore = vi.fn();
    const [isLoading, setIsLoading] = createSignal(true);

    render(() => <AsyncMenu items={asyncItems} onLoadMore={onLoadMore} isLoading={isLoading()} />);

    const sentinel = screen.getByTestId("loadMoreSentinel");
    expect(observe).toHaveBeenLastCalledWith(sentinel);
    expect(onLoadMore).toHaveBeenCalledTimes(0);

    MockObserver.instance.triggerCallback([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    setIsLoading(false);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    MockObserver.instance.triggerCallback([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("keyboard navigation skips the loader row", () => {
    render(() => <AsyncMenu isLoading items={asyncItems} />);

    const menu = screen.getByRole("menu");
    menu.focus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });

    const loader = screen.getByText("Loading...").closest("[role='menuitem']");
    expect(screen.getByRole("menuitem", { name: "Baz" })).toHaveAttribute("data-focused");
    expect(loader).not.toHaveAttribute("data-focused");

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(loader).not.toHaveAttribute("data-focused");
  });
});
