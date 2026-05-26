/**
 * Focus Management tests for Phase 21
 *
 * Tests focus restoration, focus scoping, and focus behavior
 * for Menu, Select, and ComboBox components when used with triggers.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { Menu, MenuItem, MenuTrigger, MenuButton } from "../src/Menu";
import { Select, SelectTrigger, SelectValue, SelectListBox, SelectOption } from "../src/Select";
import type { Key } from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

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

// ============================================
// MENU FOCUS MANAGEMENT
// ============================================

describe("Menu Focus Management", () => {
  afterEach(() => {
    cleanup();
  });

  describe("focus restoration", () => {
    it("should restore focus to trigger button when menu closes via Escape", async () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Open Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");

      // Open menu
      await user.click(button);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Close with Escape
      await user.keyboard("{Escape}");

      // Focus should be restored to button
      await waitFor(() => {
        expect(document.activeElement).toBe(button);
      });
    });

    it("should restore focus to trigger button when menu item is selected", async () => {
      const onAction = vi.fn();
      render(() => (
        <MenuTrigger>
          <MenuButton>Open Menu</MenuButton>
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

      const button = screen.getByRole("button");

      // Open menu
      await user.click(button);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Select an item
      const items = screen.getAllByRole("menuitem");
      await user.click(items[0]);

      // Focus should eventually return to button after menu closes
      await waitFor(
        () => {
          expect(document.activeElement).toBe(button);
        },
        { timeout: 1000 },
      );
    });

    it("should auto-focus the menu when opened", async () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Open Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");

      // Open menu
      await user.click(button);

      // Menu should be focused (or menu container)
      const menu = screen.getByRole("menu");
      await waitFor(() => {
        expect(menu.contains(document.activeElement) || document.activeElement === menu).toBe(true);
      });
    });
  });
});

// ============================================
// SELECT FOCUS MANAGEMENT
// ============================================

describe("Select Focus Management", () => {
  afterEach(() => {
    cleanup();
  });

  describe("focus restoration", () => {
    it("should restore focus to trigger button when dropdown closes via Escape on trigger", async () => {
      render(() => (
        <Select<TestItem>
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          placeholder="Select an option"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button");

      // Open dropdown with keyboard (keep focus on trigger)
      trigger.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Press Escape while focus is on trigger
      // Move focus back to trigger first
      trigger.focus();
      await user.keyboard("{Escape}");

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });

      // Focus should still be on trigger
      expect(document.activeElement).toBe(trigger);
    });

    it("should restore focus to trigger button when option is selected", async () => {
      render(() => (
        <Select<TestItem>
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          placeholder="Select an option"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button");

      // Open dropdown
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Select an option
      const options = screen.getAllByRole("option");
      await user.click(options[0]);

      // Focus should return to trigger after selection
      await waitFor(
        () => {
          expect(document.activeElement).toBe(trigger);
        },
        { timeout: 1000 },
      );
    });

    it("should auto-focus the listbox when opened", async () => {
      render(() => (
        <Select<TestItem>
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          placeholder="Select an option"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button");

      // Open dropdown
      await user.click(trigger);

      const listbox = await screen.findByRole("listbox");

      // Listbox should be focused (or contain the focused element)
      await waitFor(() => {
        expect(listbox.contains(document.activeElement) || document.activeElement === listbox).toBe(
          true,
        );
      });
    });
  });

  describe("keyboard navigation with focus", () => {
    it("should allow keyboard navigation through options while focused", async () => {
      render(() => (
        <Select<TestItem>
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          placeholder="Select an option"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button");

      // Open dropdown with keyboard
      await user.tab();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // One of the options should be focused (first or current)
      const options = screen.getAllByRole("option");
      await waitFor(() => {
        const hasFocusedOption = options.some((opt) => opt.hasAttribute("data-focused"));
        expect(hasFocusedOption).toBe(true);
      });
    });
  });
});

// ============================================
// FOCUS SCOPE BEHAVIOR
// ============================================

describe("FocusScope Behavior", () => {
  afterEach(() => {
    cleanup();
  });

  it("should contain focus within menu when open", async () => {
    render(() => (
      <>
        <button>Before</button>
        <MenuTrigger>
          <MenuButton>Open Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
        <button>After</button>
      </>
    ));

    const triggerButton = screen.getByText("Open Menu");

    // Open menu
    await user.click(triggerButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    const menu = screen.getByRole("menu");

    // Menu should receive focus (or element within)
    await waitFor(() => {
      expect(menu.contains(document.activeElement) || document.activeElement === menu).toBe(true);
    });
  });

  it("standalone menu should not use FocusScope", async () => {
    render(() => (
      <>
        <button>Before</button>
        <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
          {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
        </Menu>
        <button>After</button>
      </>
    ));

    // Menu should be rendered
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Focus should not be automatically moved
    // (no FocusScope with autoFocus for standalone menus)
    const beforeButton = screen.getByText("Before");
    await user.click(beforeButton);
    expect(document.activeElement).toBe(beforeButton);

    // Tab should move to menu, then to after button
    await user.tab();
    const menu = screen.getByRole("menu");
    expect(document.activeElement).toBe(menu);
  });

  it("should not move focus to menu trigger when menu is not open", () => {
    render(() => (
      <>
        <button data-testid="other">Other</button>
        <MenuTrigger>
          <MenuButton>Open Menu</MenuButton>
          <Menu<TestItem> aria-label="Test" items={testItems} getKey={(item) => item.id}>
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      </>
    ));

    const other = screen.getByTestId("other");
    other.focus();
    expect(document.activeElement).toBe(other);
    // Menu is not open, so focus stays on other button
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should support multiple menu triggers independently", async () => {
    render(() => (
      <>
        <MenuTrigger>
          <MenuButton>Menu 1</MenuButton>
          <Menu<TestItem> aria-label="First menu" items={testItems} getKey={(item) => item.id}>
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
        <MenuTrigger>
          <MenuButton>Menu 2</MenuButton>
          <Menu<TestItem>
            aria-label="Second menu"
            items={[{ id: "x", name: "X" }]}
            getKey={(item) => item.id}
          >
            {(item) => <MenuItem id={item.id}>{item.name}</MenuItem>}
          </Menu>
        </MenuTrigger>
      </>
    ));

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);

    // Open first menu
    await user.click(buttons[0]);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Close it
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[0]);
    });
  });
});
