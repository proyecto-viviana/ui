/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import {
  Header,
  Heading,
  MenuTrigger,
  MenuButton,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
} from "../src/menu";

/** Minimal menu items for testing. */
const items = [
  { id: "edit", label: "Edit" },
  { id: "duplicate", label: "Duplicate" },
  { id: "delete", label: "Delete" },
];

describe("Menu (solid-spectrum)", () => {
  describe("MenuTrigger", () => {
    it("renders wrapper div with relative inline-block", () => {
      const { container } = render(() => (
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const wrapper = container.querySelector(".relative.inline-block");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("MenuButton", () => {
    it("renders as a button element", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.textContent).toContain("Actions");
    });

    it("applies secondary variant classes by default", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      // secondary: 'bg-bg-400 text-primary-200 border-primary-600'
      expect(button.className).toContain("bg-bg-400");
      expect(button.className).toContain("border-primary-600");
    });

    it("applies primary variant classes", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton variant="primary">Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-accent");
      expect(button.className).toContain("border-accent");
    });

    it("applies quiet variant classes", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton variant="quiet">Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-transparent");
      expect(button.className).toContain("border-transparent");
    });

    it("applies md size classes by default", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      // md button: 'h-10 text-base px-4 gap-2'
      expect(button.className).toContain("h-10");
      expect(button.className).toContain("px-4");
    });

    it("applies sm size classes", () => {
      render(() => (
        <MenuTrigger size="sm">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      // sm button: 'h-8 text-sm px-3 gap-2'
      expect(button.className).toContain("h-8");
      expect(button.className).toContain("px-3");
    });

    it("applies lg size classes", () => {
      render(() => (
        <MenuTrigger size="lg">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      // lg button: 'h-12 text-lg px-5 gap-3'
      expect(button.className).toContain("h-12");
      expect(button.className).toContain("px-5");
    });

    it("renders chevron SVG", () => {
      render(() => (
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Chevron path: "M19 9l-7 7-7-7"
      const path = svg?.querySelector("path");
      expect(path?.getAttribute("d")).toContain("M19 9l-7 7-7-7");
    });
  });

  describe("Menu container", () => {
    it('renders as ul with role="menu" when open', () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
      expect(menu.tagName).toBe("UL");
    });

    it("applies generated S2 menu styles for size variants", () => {
      const { unmount } = render(() => (
        <MenuTrigger defaultOpen size="sm">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      const smallClassName = menu.className;
      expect(smallClassName).toContain("-macro-dynamic");

      unmount();

      render(() => (
        <MenuTrigger defaultOpen size="lg">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      expect(screen.getByRole("menu").className).toContain("-macro-dynamic");
      expect(screen.getByRole("menu").className).not.toBe(smallClassName);
    });

    it("supports visible label wiring via aria-labelledby", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu label="Actions menu" items={items} getKey={(i) => i.id}>
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu", { name: "Actions menu" });
      expect(menu).toHaveAttribute("aria-labelledby");
    });

    it("disables all menu items when the menu is disabled", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu isDisabled items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("aria-disabled", "true");
      for (const item of screen.getAllByRole("menuitem")) {
        expect(item).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("does not trigger onAction when the menu is disabled", async () => {
      const user = setupUser();
      const onAction = vi.fn();

      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu
            isDisabled
            onAction={onAction}
            items={items}
            getKey={(i) => i.id}
            aria-label="Actions"
          >
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      await user.click(screen.getByText("Edit"));
      expect(onAction).not.toHaveBeenCalled();
    });

    it("provides S2 section header and heading slot contexts", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu aria-label="Actions">
            <MenuSection data-testid="document-actions-section">
              <Header data-testid="document-actions-header">
                <Heading level={3}>Document actions</Heading>
              </Header>
              <MenuItem id="edit" textValue="Edit">
                Edit
              </MenuItem>
            </MenuSection>
          </Menu>
        </MenuTrigger>
      ));

      const section = screen.getByTestId("document-actions-section");
      const header = screen.getByTestId("document-actions-header");
      const heading = screen.getByRole("presentation");

      expect(section.className).toContain("-macro-dynamic");
      expect(header.className).toContain("-macro-dynamic");
      expect(heading).toHaveTextContent("Document actions");
      expect(heading.className).toContain("-macro-static");
      expect(heading.className).not.toContain("text-2xl");
      expect(heading.className).not.toContain("text-primary-100");
    });
  });

  describe("MenuItem", () => {
    it("renders href items as anchors", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => (
              <MenuItem
                id={item.id}
                href={`https://example.com/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems[0].tagName).toBe("A");
      expect(menuItems[0]).toHaveAttribute("href", "https://example.com/edit");
      expect(menuItems[0]).toHaveAttribute("target", "_blank");
      expect(menuItems[0]).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders label text", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu
            items={[{ id: "settings", label: "Settings" }]}
            getKey={(i) => i.id}
            aria-label="Actions"
          >
            {(item) => (
              <MenuItem id={item.id} icon={() => <svg data-testid="menu-icon" />}>
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    });

    it("renders shortcut when provided", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu items={[{ id: "save", label: "Save" }]} getKey={(i) => i.id} aria-label="Actions">
            {(item) => (
              <MenuItem id={item.id} shortcut="Ctrl+S">
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
    });

    it("applies destructive styling", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu
            items={[{ id: "delete", label: "Delete" }]}
            getKey={(i) => i.id}
            aria-label="Actions"
          >
            {(item) => (
              <MenuItem id={item.id} isDestructive>
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      const menuItems = screen.getAllByRole("menuitem");
      const deleteItem = menuItems.find((el) => el.textContent?.includes("Delete"));
      expect(deleteItem?.className).toContain("text-danger-400");
    });

    it("applies disabled state attributes and generated styling", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu
            items={[{ id: "locked", label: "Locked" }]}
            getKey={(i) => i.id}
            aria-label="Actions"
          >
            {(item) => (
              <MenuItem id={item.id} isDisabled>
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      ));

      const menuItems = screen.getAllByRole("menuitem");
      const disabledItem = menuItems.find((el) => el.textContent?.includes("Locked"));
      expect(disabledItem).toHaveAttribute("aria-disabled", "true");
      expect(disabledItem).toHaveAttribute("data-disabled", "true");
      expect(disabledItem?.className).toContain("-macro-dynamic");
    });

    it("renders S2 checkmark indicators for single selection menus", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>View</MenuButton>
          <Menu
            selectionMode="single"
            defaultSelectedKeys={["edit"]}
            items={items}
            getKey={(i) => i.id}
            aria-label="View"
          >
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const selectedItem = screen.getByRole("menuitemradio", { name: "Edit" });
      const idleItem = screen.getByRole("menuitemradio", { name: "Duplicate" });
      const selectedIndicator = selectedItem.querySelector('[data-rsp-slot="selection-indicator"]');
      const idleIndicator = idleItem.querySelector('[data-rsp-slot="selection-indicator"]');

      expect(selectedItem).toHaveAttribute("aria-checked", "true");
      expect(selectedItem).toHaveAttribute("data-selected", "true");
      expect(selectedIndicator).toBeInTheDocument();
      expect(selectedIndicator?.tagName.toLowerCase()).toBe("svg");
      expect(selectedIndicator).toHaveAttribute("aria-hidden", "true");
      expect(selectedIndicator?.getAttribute("class")).toContain("-macro-dynamic");

      expect(idleItem).toHaveAttribute("aria-checked", "false");
      expect(idleIndicator).toBeInTheDocument();
      expect(idleIndicator?.tagName.toLowerCase()).toBe("svg");
    });

    it("renders S2 checkbox indicators for multiple selection menus", () => {
      render(() => (
        <MenuTrigger defaultOpen>
          <MenuButton>View</MenuButton>
          <Menu
            selectionMode="multiple"
            defaultSelectedKeys={["edit"]}
            items={items}
            getKey={(i) => i.id}
            aria-label="View"
          >
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const selectedItem = screen.getByRole("menuitemcheckbox", { name: "Edit" });
      const idleItem = screen.getByRole("menuitemcheckbox", { name: "Duplicate" });
      const selectedIndicator = selectedItem.querySelector('[data-rsp-slot="selection-indicator"]');
      const idleIndicator = idleItem.querySelector('[data-rsp-slot="selection-indicator"]');

      expect(selectedItem).toHaveAttribute("aria-checked", "true");
      expect(selectedItem).toHaveAttribute("data-selected", "true");
      expect(selectedIndicator).toBeInTheDocument();
      expect(selectedIndicator?.tagName.toLowerCase()).toBe("span");
      expect(selectedIndicator).toHaveAttribute("aria-hidden", "true");
      expect(selectedIndicator?.getAttribute("class")).toContain("-macro-dynamic");
      expect(selectedIndicator?.querySelector("svg")).toBeInTheDocument();

      expect(idleItem).toHaveAttribute("aria-checked", "false");
      expect(idleIndicator).toBeInTheDocument();
      expect(idleIndicator?.querySelector("svg")).not.toBeInTheDocument();
    });
  });

  describe("MenuSeparator", () => {
    it('renders with role="separator" and border class', () => {
      render(() => <MenuSeparator />);

      const separator = screen.getByRole("separator");
      expect(separator).toBeInTheDocument();
      expect(separator.className).toContain("border-t");
      expect(separator.className).toContain("border-primary-600");
    });
  });

  describe("size context propagation", () => {
    it("propagates size from MenuTrigger to generated MenuItem styles", () => {
      const { unmount } = render(() => (
        <MenuTrigger defaultOpen size="sm">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const smallItem = screen.getByText("Edit").closest('[role="menuitem"]');
      const smallLabel = screen.getByText("Edit");
      expect(smallItem?.className).toContain("-macro-dynamic");
      expect(smallLabel).toHaveAttribute("data-rsp-slot", "text");
      const smallItemClassName = smallItem?.className;

      unmount();

      render(() => (
        <MenuTrigger defaultOpen size="lg">
          <MenuButton>Actions</MenuButton>
          <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      ));

      const largeItem = screen.getByText("Edit").closest('[role="menuitem"]');
      expect(largeItem?.className).toContain("-macro-dynamic");
      expect(largeItem?.className).not.toBe(smallItemClassName);
    });
  });
});
